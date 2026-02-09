-- name: GetGDPStats :many
SELECT 
    DATE_TRUNC(sqlc.arg(interval)::text, o.created_at)::TEXT AS date,
    COALESCE(SUM(
        CASE 
            WHEN (otv.type_values ->> ot.gdp_measure_field) ~ '^-?[0-9]+(\.[0-9]+)?$' 
            THEN (otv.type_values ->> ot.gdp_measure_field)::NUMERIC 
            ELSE 0 
        END
    ), 0)::FLOAT AS count
FROM obj o
JOIN obj_type_value otv ON o.id = otv.obj_id
JOIN obj_type ot ON otv.type_id = ot.id
JOIN creator c ON o.creator_id = c.id
WHERE 
    ot.gdp_measure_field IS NOT NULL 
    AND ot.gdp_measure_field != ''
    AND o.deleted_at IS NULL
    AND c.org_id = sqlc.arg(org_id)
GROUP BY 1
ORDER BY 1 DESC;
