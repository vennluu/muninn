-- name: GetPublicStats :one
SELECT 
    (SELECT COUNT(*) FROM obj o JOIN creator c ON o.creator_id = c.id WHERE c.org_id = $1 AND o.deleted_at IS NULL) as object_count,
    (SELECT COUNT(*) FROM fact f JOIN creator c ON f.creator_id = c.id WHERE c.org_id = $1 AND f.deleted_at IS NULL) as fact_count,
    (SELECT COUNT(*) FROM creator c WHERE c.org_id = $1 AND c.active = true) as creator_count,
    (SELECT COUNT(DISTINCT o.id) 
     FROM obj o 
     JOIN creator c ON o.creator_id = c.id 
     JOIN obj_type_value otv ON o.id = otv.obj_id
     JOIN obj_type ot ON otv.type_id = ot.id
     WHERE c.org_id = $1 AND o.deleted_at IS NULL 
     AND (ot.name ILIKE '%project%' OR ot.name ILIKE '%startup%' OR ot.name ILIKE '%product%')
    ) as project_count;

-- name: GetPublicRecentFacts :many
SELECT f.id, f.text, f.happened_at, c.username as creator_name, c.profile as creator_profile
FROM fact f
JOIN creator c ON f.creator_id = c.id
WHERE c.org_id = $1 AND f.deleted_at IS NULL
ORDER BY f.happened_at DESC
LIMIT 20;

-- name: GetPublicRecentFactsByType :many
SELECT DISTINCT f.id, f.text, f.happened_at, c.username as creator_name, c.profile as creator_profile
FROM fact f
JOIN creator c ON f.creator_id = c.id
JOIN obj_fact of_link ON f.id = of_link.fact_id
JOIN obj o ON of_link.obj_id = o.id
JOIN obj_type_value otv ON o.id = otv.obj_id
WHERE c.org_id = $1 
  AND f.deleted_at IS NULL
  AND otv.type_id = $2
ORDER BY f.happened_at DESC
LIMIT 20;

-- name: GetPublicTopObjects :many
SELECT o.id, o.name, o.description, o.photo, ot.name as type_name, COUNT(of_link.fact_id) as fact_count
FROM obj o
JOIN creator c ON o.creator_id = c.id
LEFT JOIN obj_type_value otv ON o.id = otv.obj_id
LEFT JOIN obj_type ot ON otv.type_id = ot.id
LEFT JOIN obj_fact of_link ON o.id = of_link.obj_id
WHERE c.org_id = $1 AND o.deleted_at IS NULL
GROUP BY o.id, o.name, o.description, o.photo, ot.name
ORDER BY fact_count DESC
LIMIT 10;

-- name: GetPublicObjectsByType :many
SELECT o.id, o.name, o.description, o.photo, ot.name as type_name, otv.type_values, COUNT(of_link.fact_id) as fact_count
FROM obj o
JOIN creator c ON o.creator_id = c.id
JOIN obj_type_value otv ON o.id = otv.obj_id
LEFT JOIN obj_type ot ON otv.type_id = ot.id
LEFT JOIN obj_fact of_link ON o.id = of_link.obj_id
WHERE c.org_id = $1 
  AND o.deleted_at IS NULL
  AND otv.type_id = $2
  AND otv.deleted_at IS NULL
GROUP BY o.id, o.name, o.description, o.photo, ot.name, otv.type_values
ORDER BY fact_count DESC
LIMIT 50;

-- name: GetPublicObjectTypes :many
SELECT ot.id, ot.name, ot.description, ot.icon, 
    (SELECT COUNT(DISTINCT o_inner.id) 
     FROM obj o_inner 
     JOIN creator c_inner ON o_inner.creator_id = c_inner.id 
     JOIN obj_type_value otv_inner ON o_inner.id = otv_inner.obj_id 
     WHERE otv_inner.type_id = ot.id 
       AND otv_inner.deleted_at IS NULL
       AND c_inner.org_id = $1 
       AND o_inner.deleted_at IS NULL
    ) as object_count
FROM obj_type ot
LEFT JOIN creator c_owner ON ot.creator_id = c_owner.id
WHERE ot.deleted_at IS NULL
  AND (
    c_owner.org_id = $1
    OR EXISTS (
      SELECT 1 
      FROM obj_type_value otv_check
      JOIN obj o_check ON otv_check.obj_id = o_check.id
      JOIN creator c_check ON o_check.creator_id = c_check.id
      WHERE otv_check.type_id = ot.id 
        AND otv_check.deleted_at IS NULL
        AND c_check.org_id = $1 
        AND o_check.deleted_at IS NULL
    )
  )
ORDER BY object_count DESC, ot.name ASC;

-- name: GetPublicObject :one
SELECT o.id, o.name, o.description, o.photo, c.username as creator_name, o.created_at
FROM obj o
JOIN creator c ON o.creator_id = c.id
WHERE o.id = $1 AND c.org_id = $2 AND o.deleted_at IS NULL;

-- name: GetPublicObjectFacts :many
SELECT f.id, f.text, f.happened_at, c.username as creator_name, c.profile as creator_profile
FROM fact f
JOIN creator c ON f.creator_id = c.id
JOIN obj_fact of_link ON f.id = of_link.fact_id
WHERE of_link.obj_id = $1 
  AND c.org_id = $2
  AND f.deleted_at IS NULL
ORDER BY f.happened_at DESC;

-- name: GetPublicObjectTypeValues :many
SELECT ot.name as type_name, otv.type_values, ot.id as type_id, ot.description, ot.icon, ot.fields
FROM obj_type_value otv
JOIN obj_type ot ON otv.type_id = ot.id
WHERE otv.obj_id = $1 AND ot.deleted_at IS NULL;

-- name: GetObjectsByTypeStats :many
SELECT ot.id, ot.name, 
    (SELECT COUNT(DISTINCT o_inner.id) 
     FROM obj o_inner 
     JOIN creator c_inner ON o_inner.creator_id = c_inner.id 
     JOIN obj_type_value otv_inner ON o_inner.id = otv_inner.obj_id 
     WHERE otv_inner.type_id = ot.id 
       AND otv_inner.deleted_at IS NULL
       AND c_inner.org_id = $1 
       AND o_inner.deleted_at IS NULL
    ) as object_count
FROM obj_type ot
LEFT JOIN creator c_owner ON ot.creator_id = c_owner.id
WHERE ot.deleted_at IS NULL
  AND (
    c_owner.org_id = $1
    OR EXISTS (
      SELECT 1 
      FROM obj_type_value otv_check
      JOIN obj o_check ON otv_check.obj_id = o_check.id
      JOIN creator c_check ON o_check.creator_id = c_check.id
      WHERE otv_check.type_id = ot.id 
        AND otv_check.deleted_at IS NULL
        AND c_check.org_id = $1 
        AND o_check.deleted_at IS NULL
    )
  )
GROUP BY ot.id, ot.name;

-- name: ListOrganizations :many
SELECT id, name, profile FROM org;

-- name: GetPublicLinkedObjects :many
WITH outgoing_ids AS (
    SELECT DISTINCT (extracted.val)::uuid AS id
    FROM obj_type_value otv
    JOIN obj o ON o.id = otv.obj_id AND o.deleted_at IS NULL
    JOIN creator c ON o.creator_id = c.id
    CROSS JOIN LATERAL (
        SELECT v->>'id' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        WHERE jsonb_typeof(v) = 'object' AND (v->>'id') ~* '^[0-9a-f-]{36}$'

        UNION ALL

        SELECT v#>>'{}' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        WHERE jsonb_typeof(v) = 'string' AND (v#>>'{}') ~* '^[0-9a-f-]{36}$'

        UNION ALL

        SELECT elem->>'id' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        CROSS JOIN LATERAL jsonb_array_elements(v) elem
        WHERE jsonb_typeof(v) = 'array' AND jsonb_typeof(elem) = 'object' AND (elem->>'id') ~* '^[0-9a-f-]{36}$'

        UNION ALL

        SELECT elem#>>'{}' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        CROSS JOIN LATERAL jsonb_array_elements(v) elem
        WHERE jsonb_typeof(v) = 'array' AND jsonb_typeof(elem) = 'string' AND (elem#>>'{}') ~* '^[0-9a-f-]{36}$'
    ) extracted
    WHERE c.org_id = $1 AND otv.obj_id = $2
),
incoming_obj_ids AS (
    SELECT DISTINCT otv.obj_id AS id
    FROM obj_type_value otv
    JOIN obj o ON o.id = otv.obj_id AND o.deleted_at IS NULL
    JOIN creator c ON o.creator_id = c.id
    CROSS JOIN LATERAL (
        SELECT v->>'id' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        WHERE jsonb_typeof(v) = 'object'

        UNION ALL

        SELECT v#>>'{}' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        WHERE jsonb_typeof(v) = 'string'

        UNION ALL

        SELECT elem->>'id' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        CROSS JOIN LATERAL jsonb_array_elements(v) elem
        WHERE jsonb_typeof(v) = 'array' AND jsonb_typeof(elem) = 'object'

        UNION ALL

        SELECT elem#>>'{}' AS val
        FROM jsonb_each(otv.type_values) e(k, v)
        CROSS JOIN LATERAL jsonb_array_elements(v) elem
        WHERE jsonb_typeof(v) = 'array' AND jsonb_typeof(elem) = 'string'
    ) extracted
    WHERE c.org_id = $1 AND otv.obj_id <> $2 AND extracted.val = $2::text
),
combined AS (
    SELECT DISTINCT 
        o.id, 
        o.name, 
        o.photo, 
        o.description,
        ot.name AS type_name,
        'outgoing'::text AS link_direction
    FROM outgoing_ids ids
    JOIN obj o ON o.id = ids.id AND o.deleted_at IS NULL
    JOIN creator c ON o.creator_id = c.id
    JOIN obj_type_value otv2 ON o.id = otv2.obj_id
    JOIN obj_type ot ON otv2.type_id = ot.id
    WHERE c.org_id = $1

    UNION ALL

    SELECT DISTINCT 
        o.id, 
        o.name, 
        o.photo, 
        o.description,
        ot.name AS type_name,
        'incoming'::text AS link_direction
    FROM incoming_obj_ids ids
    JOIN obj o ON o.id = ids.id AND o.deleted_at IS NULL
    JOIN creator c ON o.creator_id = c.id
    JOIN obj_type_value otv2 ON o.id = otv2.obj_id
    JOIN obj_type ot ON otv2.type_id = ot.id
    WHERE c.org_id = $1
)
SELECT 
    c.id,
    MAX(c.name)::text AS name,
    MAX(c.photo)::text AS photo,
    MAX(c.description)::text AS description,
    MAX(c.type_name)::text AS type_name,
    CASE WHEN BOOL_OR(c.link_direction = 'outgoing') THEN 'outgoing' ELSE 'incoming' END AS link_direction
FROM combined c
WHERE c.id <> $2
GROUP BY c.id;
