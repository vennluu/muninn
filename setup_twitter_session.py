"""
One-time Twitter session setup.
Opens a real browser window for you to log in manually,
then saves the session so twitter_service.py can run headless.

Run:
  python3 setup_twitter_session.py
"""

import asyncio
from playwright.async_api import async_playwright

SESSION_FILE = "twitter_session.json"


async def main():
    print("=" * 55)
    print("  Twitter Session Setup")
    print("=" * 55)
    print()
    print("Opening a browser window for you to log in to Twitter.")
    print("After you log in, come back here and press ENTER.")
    print()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--start-maximized"],
        )
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            no_viewport=True,
        )
        page = await ctx.new_page()
        await page.goto("https://x.com/login")

        print(">> Log in to Twitter in the browser window that opened.")
        print(">> Once you're on the home feed, come back here.")
        input(">> Press ENTER when done logging in: ")

        # Verify login
        url = page.url
        if "/home" in url or "/i/timeline" in url:
            await ctx.storage_state(path=SESSION_FILE)
            print()
            print(f"Session saved to {SESSION_FILE}")
            print("You can now run: python3 twitter_service.py")
        else:
            print(f"Warning: current URL is {url} — doesn't look like home feed.")
            save = input("Save anyway? (y/n): ")
            if save.lower() == "y":
                await ctx.storage_state(path=SESSION_FILE)
                print(f"Session saved to {SESSION_FILE}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
