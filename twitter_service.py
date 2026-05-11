"""
Twitter microservice using Playwright (no API key needed).
Runs on http://localhost:8001

Intercepts Twitter's own GraphQL API calls as a real browser would.

Setup:
  pip install playwright fastapi uvicorn
  python -m playwright install chromium
  Set in webapp/.env:
    TWITTER_USERNAME=your_username
    TWITTER_EMAIL=your@email.com
    TWITTER_PASSWORD=your_password

Run:
  python twitter_service.py
"""

import os
import json
import asyncio
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from playwright.async_api import async_playwright, BrowserContext

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

SESSION_FILE = "twitter_session.json"
_playwright = None
_browser = None
_context: BrowserContext | None = None
_logged_in = False


async def get_context() -> BrowserContext:
    global _playwright, _browser, _context, _logged_in

    if _context and _logged_in:
        return _context

    if _playwright is None:
        _playwright = await async_playwright().start()

    if _browser is None:
        _browser = await _playwright.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )

    # Try loading saved session
    if os.path.exists(SESSION_FILE):
        try:
            _context = await _browser.new_context(
                storage_state=SESSION_FILE,
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            )
            page = await _context.new_page()
            await page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
            if "/home" in page.url or "/i/timeline" in page.url:
                await page.close()
                _logged_in = True
                print("[playwright] Loaded session from file.")
                return _context
            await page.close()
            await _context.close()
            _context = None
        except Exception as e:
            print(f"[playwright] Session load failed: {e}")
            if _context:
                await _context.close()
            _context = None

    # Fresh login
    username = os.getenv("TWITTER_USERNAME")
    email = os.getenv("TWITTER_EMAIL")
    password = os.getenv("TWITTER_PASSWORD")

    if not all([username, email, password]):
        raise RuntimeError("Set TWITTER_USERNAME, TWITTER_EMAIL, TWITTER_PASSWORD in webapp/.env")

    print("[playwright] Logging in to Twitter...")
    _context = await _browser.new_context(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    )
    page = await _context.new_page()

    await page.goto("https://x.com/i/flow/login", wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(3000)

    # Step 1: email / username
    await page.wait_for_selector('input[autocomplete="username"]', timeout=30000)
    await page.click('input[autocomplete="username"]')
    await page.wait_for_timeout(500)
    await page.type('input[autocomplete="username"]', email, delay=50)
    await page.wait_for_timeout(500)
    await page.click('text=Next')
    await page.wait_for_timeout(4000)

    # Step 2: sometimes asks for phone/username (unusual activity check)
    try:
        unusual = page.locator('input[data-testid="ocfEnterTextTextInput"]')
        if await unusual.is_visible(timeout=4000):
            print("[playwright] Unusual activity check — entering username")
            await unusual.click()
            await page.type('input[data-testid="ocfEnterTextTextInput"]', username, delay=50)
            await page.wait_for_timeout(500)
            await page.click('text=Next')
            await page.wait_for_timeout(4000)
    except Exception:
        pass

    # Step 3: password
    await page.wait_for_selector('input[name="password"]', timeout=30000)
    await page.click('input[name="password"]')
    await page.wait_for_timeout(500)
    await page.type('input[name="password"]', password, delay=50)
    await page.wait_for_timeout(500)
    await page.click('[data-testid="LoginForm_Login_Button"]')
    await page.wait_for_url("**/home**", timeout=60000)

    # Save session
    await _context.storage_state(path=SESSION_FILE)
    _logged_in = True
    print("[playwright] Login successful, session saved.")
    await page.close()
    return _context


async def fetch_user_profile(username: str, tweet_count: int = 10) -> dict:
    context = await get_context()
    page = await context.new_page()

    user_data = {}
    tweets_data = []
    captured = {"user": False, "tweets": False}

    async def handle_response(response):
        url = response.url
        if "UserByScreenName" in url and not captured["user"]:
            try:
                body = await response.json()
                result = (
                    body.get("data", {})
                    .get("user", {})
                    .get("result", {})
                )
                legacy = result.get("legacy", {})
                if legacy:
                    user_data.update({
                        "username": legacy.get("screen_name", username),
                        "name": legacy.get("name", ""),
                        "bio": legacy.get("description", ""),
                        "followers": legacy.get("followers_count", 0),
                        "following": legacy.get("friends_count", 0),
                        "tweet_count": legacy.get("statuses_count", 0),
                        "created_at": legacy.get("created_at", ""),
                        "verified": legacy.get("verified", False) or result.get("is_blue_verified", False),
                        "profile_image": legacy.get("profile_image_url_https", ""),
                    })
                    captured["user"] = True
            except Exception:
                pass

        if "UserTweets" in url and not captured["tweets"]:
            try:
                body = await response.json()
                instructions = (
                    body.get("data", {})
                    .get("user", {})
                    .get("result", {})
                    .get("timeline_v2", {})
                    .get("timeline", {})
                    .get("instructions", [])
                )
                now = datetime.now(timezone.utc)
                for instruction in instructions:
                    for entry in instruction.get("entries", []):
                        content = entry.get("content", {})
                        item_content = content.get("itemContent", {})
                        tweet_result = item_content.get("tweet_results", {}).get("result", {})
                        tweet_legacy = tweet_result.get("legacy", {})
                        if not tweet_legacy:
                            continue
                        created_str = tweet_legacy.get("created_at", "")
                        days_ago = None
                        if created_str:
                            try:
                                created_dt = datetime.strptime(created_str, "%a %b %d %H:%M:%S +0000 %Y").replace(tzinfo=timezone.utc)
                                days_ago = (now - created_dt).days
                            except Exception:
                                pass
                        tweets_data.append({
                            "id": tweet_legacy.get("id_str", ""),
                            "text": tweet_legacy.get("full_text", ""),
                            "created_at": created_str,
                            "days_ago": days_ago,
                            "likes": tweet_legacy.get("favorite_count", 0),
                            "retweets": tweet_legacy.get("retweet_count", 0),
                            "replies": tweet_legacy.get("reply_count", 0),
                        })
                if tweets_data:
                    captured["tweets"] = True
            except Exception:
                pass

    page.on("response", handle_response)

    try:
        await page.goto(f"https://x.com/{username}", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)

        # If user not found via API interception, check DOM
        if not user_data:
            not_found = await page.query_selector('[data-testid="emptyState"]')
            if not_found:
                raise HTTPException(status_code=404, detail=f"User @{username} not found")
    finally:
        await page.close()

    if not user_data:
        raise HTTPException(status_code=404, detail=f"Could not fetch profile for @{username}")

    # Activity signals
    now = datetime.now(timezone.utc)
    tweets_30d = [t for t in tweets_data if t["days_ago"] is not None and t["days_ago"] <= 30]
    last_tweet_days = tweets_data[0]["days_ago"] if tweets_data else None

    return {
        **user_data,
        "tweets_30d": len(tweets_30d),
        "last_tweet_days_ago": last_tweet_days,
        "recent_tweets": tweets_data[:5],
        "is_active": last_tweet_days is not None and last_tweet_days <= 30,
    }


@app.get("/health")
def health():
    return {"status": "ok", "logged_in": _logged_in}


@app.get("/twitter/user/{username}")
async def get_user(username: str, tweet_count: int = 10):
    try:
        await get_context()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return await fetch_user_profile(username, tweet_count)


if __name__ == "__main__":
    # Load .env from webapp/
    env_path = os.path.join(os.path.dirname(__file__), "webapp", ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
