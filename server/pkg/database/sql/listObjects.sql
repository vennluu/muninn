-- name: ListObjectsByOrgID :many
WITH object_data AS (
    -- First get all the searchable text and metadata for each object
    SELECT 
        o.id, 
        o.name,
        o.photo,
        o.description, 
        o.id_string,
        o.aliases,
        o.creator_id,
        o.created_at,
        o.deleted_at,
        -- Create separate tsvector fields for different search sources
        to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) AS obj_search,
        to_tsvector('english', string_agg(DISTINCT COALESCE(f.text, ''), ' ')) AS fact_search,
        -- Combine all obj_type_value search vectors into one
        (
            SELECT string_agg(otv.search_vector::text, ' ')::tsvector 
            FROM obj_type_value otv 
            WHERE otv.obj_id = o.id
        ) AS type_value_search,
        -- Store original text for highlighting
        o.name || ' ' || o.description || ' ' || o.id_string AS obj_text,
        string_agg(DISTINCT COALESCE(f.text, ''), ' ') AS fact_text,
        string_agg(DISTINCT COALESCE(otv.type_values::text, ''), ' ') AS type_value_text,
        -- Store IDs for later joins
        array_agg(DISTINCT t.id) AS tag_ids,
        array_agg(DISTINCT otv.id) AS type_value_ids
    FROM obj o
    JOIN creator c_owner ON o.creator_id = c_owner.id
    LEFT JOIN obj_tag ot ON o.id = ot.obj_id
    LEFT JOIN tag t ON ot.tag_id = t.id
    LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
    LEFT JOIN obj_fact of ON o.id = of.obj_id
    LEFT JOIN fact f ON of.fact_id = f.id
    WHERE c_owner.org_id = $2 AND o.deleted_at IS NULL
    GROUP BY o.id, o.name, o.photo, o.description, o.id_string, o.aliases, o.creator_id, o.created_at, o.deleted_at
),
accessible_objects AS (
    SELECT od.id FROM object_data od
    JOIN creator c_requester ON c_requester.id = $1
    WHERE c_requester.role = 'admin'
       OR od.creator_id = $1
       OR EXISTS (
            SELECT 1 
            FROM obj_type_value otv_check
            JOIN creator_obj_type_access cota ON otv_check.type_id = cota.obj_type_id
            WHERE otv_check.obj_id = od.id AND cota.creator_id = $1
       )
       OR EXISTS (
            SELECT 1
            FROM obj_tag ot_check
            JOIN creator_tag_access cta ON ot_check.tag_id = cta.tag_id
            WHERE ot_check.obj_id = od.id AND cta.creator_id = $1
       )
),
ranked_results AS (
    -- Calculate search ranking and highlighting for each source
    SELECT 
        od.*,
        CASE WHEN $3 = '' THEN 0
             ELSE ts_rank(obj_search, websearch_to_tsquery('english', $3)) 
        END AS obj_rank,
        CASE WHEN $3 = '' THEN 0
             ELSE ts_rank(fact_search, websearch_to_tsquery('english', $3))
        END AS fact_rank,
        CASE WHEN $3 = '' THEN 0
             ELSE ts_rank(type_value_search, websearch_to_tsquery('english', $3))
        END AS type_value_rank,
        CASE WHEN $3 = '' THEN ''  -- Empty string instead of NULL
             ELSE ts_headline('english', od.obj_text, 
                  websearch_to_tsquery('english', $3),
                  'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MaxWords=10, MinWords=5')
        END AS obj_headline,
        CASE WHEN $3 = '' THEN ''  -- Empty string instead of NULL
             ELSE ts_headline('english', COALESCE(od.fact_text, ''),
                  websearch_to_tsquery('english', $3),
                  'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MaxWords=10, MinWords=5')
        END AS fact_headline,
        CASE WHEN $3 = '' THEN ''  -- Empty string instead of NULL
             ELSE ts_headline('english', COALESCE(od.type_value_text, ''),
                  websearch_to_tsquery('english', $3),
                  'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MaxWords=10, MinWords=5')
        END AS type_value_headline,
        CASE
            WHEN $3 = '' THEN 'no_search'  -- Default value instead of NULL
            WHEN obj_search @@ websearch_to_tsquery('english', $3) THEN 'object_content'
            WHEN type_value_search @@ websearch_to_tsquery('english', $3) THEN 'type_values'
            WHEN fact_search @@ websearch_to_tsquery('english', $3) THEN 'related_facts'
            ELSE 'type_values'
        END AS match_source,
        CASE WHEN $3 = '' THEN 0
             ELSE (ts_rank(obj_search, websearch_to_tsquery('english', $3)) * 3 + 
                ts_rank(type_value_search, websearch_to_tsquery('english', $3)) * 2 +
                ts_rank(fact_search, websearch_to_tsquery('english', $3)))
        END AS final_rank
    FROM object_data od
    WHERE od.id IN (SELECT id FROM accessible_objects)
      AND ($3 = '' OR
          obj_search @@ websearch_to_tsquery('english', $3) OR
          fact_search @@ websearch_to_tsquery('english', $3) OR
          type_value_search @@ websearch_to_tsquery('english', $3))
)
SELECT
    rr.id,
    rr.name,
    rr.photo,
    rr.description,
    rr.id_string,
    rr.aliases,
    rr.created_at,
    rr.match_source,
    rr.obj_headline,
    rr.fact_headline,
    rr.type_value_headline,
    rr.final_rank as search_rank,
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'color_schema', t.color_schema))
        FROM tag t
        WHERE t.id = ANY(rr.tag_ids)),
        '[]'
    ) AS tags,
    coalesce(
        (SELECT jsonb_agg(jsonb_build_object('id', otv.id, 'objectTypeId', otv.type_id, 'type_values', otv.type_values))
        FROM obj_type_value otv
        WHERE otv.id = ANY(rr.type_value_ids)),
        '[]'
    ) AS type_values
FROM ranked_results rr
ORDER BY 
    CASE WHEN $3 = '' THEN 0 ELSE rr.final_rank END DESC,
    rr.created_at DESC
LIMIT $4 OFFSET $5;

-- name: CountObjectsByOrgID :one
SELECT COUNT(DISTINCT o.id)
FROM obj o
JOIN creator c_owner ON o.creator_id = c_owner.id
JOIN creator c_requester ON c_requester.id = $1
WHERE c_owner.org_id = $2 AND o.deleted_at IS NULL
  AND (
    c_requester.role = 'admin'
    OR o.creator_id = $1
    OR EXISTS (
        SELECT 1 
        FROM obj_type_value otv_in
        JOIN creator_obj_type_access cota ON otv_in.type_id = cota.obj_type_id
        WHERE otv_in.obj_id = o.id AND cota.creator_id = $1
    )
    OR EXISTS (
        SELECT 1
        FROM obj_tag ot_in
        JOIN creator_tag_access cta ON ot_in.tag_id = cta.tag_id
        WHERE ot_in.obj_id = o.id AND cta.creator_id = $1
    )
  )
  AND ($3 = '' OR
       to_tsvector('english', o.name || ' ' || o.description || ' ' || o.id_string) @@ websearch_to_tsquery('english', $3) OR
       to_tsvector('english', (SELECT string_agg(COALESCE(f.text, ''), ' ') FROM fact f JOIN obj_fact of ON f.id = of.fact_id WHERE of.obj_id = o.id)) @@ websearch_to_tsquery('english', $3) OR
       (SELECT string_agg(otv.search_vector::text, ' ')::tsvector FROM obj_type_value otv WHERE otv.obj_id = o.id) @@ websearch_to_tsquery('english', $3));