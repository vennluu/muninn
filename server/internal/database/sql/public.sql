-- name: GetPublicStats :one
SELECT 
    (SELECT COUNT(*) FROM obj o JOIN creator c ON o.creator_id = c.id WHERE c.org_id = $1 AND o.deleted_at IS NULL) as object_count,
    (SELECT COUNT(*) FROM fact f JOIN creator c ON f.creator_id = c.id WHERE c.org_id = $1 AND f.deleted_at IS NULL) as fact_count,
    (SELECT COUNT(*) FROM creator c WHERE c.org_id = $1 AND c.active = true) as creator_count;

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
GROUP BY o.id, o.name, o.description, o.photo, ot.name, otv.type_values
ORDER BY fact_count DESC
LIMIT 50;

-- name: GetPublicObjectTypes :many
SELECT ot.id, ot.name, ot.description, ot.icon, COUNT(DISTINCT otv.obj_id) as object_count
FROM obj_type ot
JOIN creator c ON ot.creator_id = c.id
LEFT JOIN obj_type_value otv ON ot.id = otv.type_id
WHERE c.org_id = $1 AND ot.deleted_at IS NULL AND ot.is_public = true
GROUP BY ot.id, ot.name, ot.description, ot.icon
ORDER BY object_count DESC;

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
SELECT ot.id, ot.name, COUNT(DISTINCT otv.obj_id) as object_count
FROM obj_type ot
JOIN creator c ON ot.creator_id = c.id
LEFT JOIN obj_type_value otv ON ot.id = otv.type_id
WHERE c.org_id = $1 AND ot.deleted_at IS NULL AND ot.is_public = true
GROUP BY ot.id, ot.name;

-- name: ListOrganizations :many
SELECT id, name, profile FROM org;
