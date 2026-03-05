-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS obj_fact CASCADE;
DROP TABLE IF EXISTS obj_task CASCADE;
DROP TABLE IF EXISTS obj_tag CASCADE;
DROP TABLE IF EXISTS obj_type_value CASCADE;
DROP TABLE IF EXISTS obj_step CASCADE;
DROP TABLE IF EXISTS creator_list CASCADE;
DROP TABLE IF EXISTS creator_session CASCADE;
DROP TABLE IF EXISTS feed CASCADE;
DROP TABLE IF EXISTS list CASCADE;
DROP TABLE IF EXISTS obj CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS fact CASCADE;
DROP TABLE IF EXISTS step CASCADE;
DROP TABLE IF EXISTS funnel CASCADE;
DROP TABLE IF EXISTS obj_type CASCADE;
DROP TABLE IF EXISTS tag CASCADE;
DROP TABLE IF EXISTS creator CASCADE;
DROP TABLE IF EXISTS org CASCADE;

-- Create the org table
CREATE TABLE org (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    profile JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the creator table
CREATE TABLE creator (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    profile JSONB NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'member')) NOT NULL,
    org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (username, org_id)
);

-- Create the creator_session table
CREATE TABLE creator_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    jwt TEXT NOT NULL,
    expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the tag table
CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    color_schema JSONB NOT NULL,
    org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (name, org_id)
);

-- Create the obj_type table
CREATE TABLE obj_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255) NOT NULL DEFAULT 'file',
    description TEXT NOT NULL,
    fields JSONB NOT NULL,
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create the funnel table
CREATE TABLE funnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the step table
CREATE TABLE step (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID NOT NULL REFERENCES funnel(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    example TEXT NOT NULL,
    action TEXT NOT NULL,
    step_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the fact table
CREATE TABLE fact (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    happened_at TIMESTAMP WITH TIME ZONE,
    location TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the task table
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    remind_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('todo', 'doing', 'paused', 'completed')) NOT NULL,
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    assigned_id UUID REFERENCES creator(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES task(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the obj table
CREATE TABLE obj (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    photo TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    id_string TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    aliases TEXT[] NOT NULL DEFAULT '{}',
    UNIQUE (id_string, creator_id)
);

-- Create the list table
CREATE TABLE list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    filter_setting JSONB NOT NULL,
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create the feed table
CREATE TABLE feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create linking tables with composite primary keys
CREATE TABLE obj_fact (
    obj_id UUID NOT NULL REFERENCES obj(id) ON DELETE CASCADE,
    fact_id UUID NOT NULL REFERENCES fact(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, fact_id)
);

CREATE TABLE obj_task (
    obj_id UUID NOT NULL REFERENCES obj(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, task_id)
);

CREATE TABLE obj_tag (
    obj_id UUID NOT NULL REFERENCES obj(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (obj_id, tag_id)
);

CREATE TABLE obj_type_value (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obj_id UUID NOT NULL REFERENCES obj(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES obj_type(id) ON DELETE CASCADE,
    type_values JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (obj_id, type_id)
);

CREATE TABLE obj_step (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obj_id UUID NOT NULL REFERENCES obj(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES step(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    sub_status INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE creator_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    params JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (creator_id, list_id)
);

-- Add indexes to foreign keys and frequently queried columns
CREATE INDEX idx_creator_org_id ON creator(org_id);
CREATE INDEX idx_creator_session_creator_id ON creator_session(creator_id);
CREATE INDEX idx_tag_org_id ON tag(org_id);
CREATE INDEX idx_obj_type_creator_id ON obj_type(creator_id);
CREATE INDEX idx_funnel_creator_id ON funnel(creator_id);
CREATE INDEX idx_step_funnel_id ON step(funnel_id);
CREATE INDEX idx_fact_creator_id ON fact(creator_id);
CREATE INDEX idx_task_creator_id ON task(creator_id);
CREATE INDEX idx_task_assigned_id ON task(assigned_id);
CREATE INDEX idx_obj_creator_id ON obj(creator_id);
CREATE INDEX idx_feed_creator_id ON feed(creator_id);
CREATE INDEX idx_creator_username ON creator(username);
CREATE INDEX idx_obj_name ON obj(name);
CREATE INDEX idx_obj_id_string ON obj(id_string);
CREATE INDEX idx_aliases ON obj USING gin (aliases);
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_fact_happened_at ON fact(happened_at);

-- Indexes for full-text search
CREATE INDEX idx_creator_username_trgm ON creator USING gin (username gin_trgm_ops);
CREATE INDEX idx_creator_profile ON creator USING gin (profile jsonb_path_ops);

-- Create a function to flatten JSON
CREATE OR REPLACE FUNCTION jsonb_to_text(jsonb_data jsonb)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
	result TEXT := '';
    key TEXT;
    value TEXT;
    domain TEXT;
    path_parts TEXT[];
    params TEXT[];
    param TEXT;
    i INT;
BEGIN
    -- Loop through each key-value pair in the JSONB object
    FOR key, value IN
        SELECT jsonb_object_keys(jsonb_data), jsonb_typeof(jsonb_data -> jsonb_object_keys(jsonb_data)) 
    LOOP
        -- Process string values
        IF jsonb_typeof(jsonb_data -> key) = 'string' THEN
            value := jsonb_data ->> key;

            -- Email handling
            IF value ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
                value := substring(value from '^[^@]+') || ',' || substring(value from '@([^.]+)');

            -- URL handling (simple regex to capture main domain and parameter values)
            ELSIF value ~ '^https?://[a-zA-Z0-9.-]+/?' THEN
				-- Extract the domain name
                domain := substring(value from 'https?://([^/?#]+)');
                
                -- Extract path segments
                path_parts := regexp_matches(value, 'https?://[^/]+/([^?#]*)', 'g');
                path_parts := array(SELECT unnest(regexp_split_to_array(path_parts[1], '/')));

                -- Extract parameters
                params := regexp_matches(value, '\?([^#]*)', 'g');
                params := array(SELECT unnest(regexp_matches(value, '[?&]([^=]+)=([^&]*)', 'g')));

                -- Concatenate path parts and parameters
                value := array_to_string(path_parts, ',') || ',' || array_to_string(params, ',');

            -- Phone number handling (remove special characters)
            ELSIF value ~ '^\+?[0-9\-\(\) ]+$' THEN
                value := regexp_replace(value, '[^0-9]', '', 'g');

            -- Hashtags and mentions handling
            ELSE
                value := regexp_replace(value, '[@#]', ' ', 'g');
            END IF;

            -- Concatenate the value to the result string
            result := result || value || ',';

        -- Process number values
        ELSIF jsonb_typeof(jsonb_data -> key) = 'number' THEN
            result := result || (jsonb_data ->> key) || ',';

        END IF;
    END LOOP;

    -- Remove the trailing comma
    IF result != '' THEN
        result := rtrim(result, ',');
    END IF;

    RETURN result;
END $$;

-- Add a tsvector column to obj_type_value
ALTER TABLE obj_type_value ADD COLUMN search_vector tsvector;

-- Create a function to generate tsvector for obj_type_value
CREATE OR REPLACE FUNCTION generate_obj_type_value_search_vector(obj_type_value_row obj_type_value) RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('english', jsonb_to_text(obj_type_value_row.type_values));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a trigger to update the search vector
CREATE OR REPLACE FUNCTION obj_type_value_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := generate_obj_type_value_search_vector(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER obj_type_value_search_update
BEFORE INSERT OR UPDATE ON obj_type_value
FOR EACH ROW EXECUTE FUNCTION obj_type_value_search_trigger();

-- Create a GIN index on the search vector
CREATE INDEX obj_type_value_search_idx ON obj_type_value USING GIN (search_vector);

-- Update existing data
UPDATE obj_type_value SET search_vector = generate_obj_type_value_search_vector(obj_type_value);

-- Triggers to update last_updated field on update
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the tables that have last_updated field
CREATE TRIGGER update_step_last_updated
BEFORE UPDATE ON step
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_fact_last_updated
BEFORE UPDATE ON fact
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_task_last_updated
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_list_last_updated
BEFORE UPDATE ON list
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_obj_type_value_last_updated
BEFORE UPDATE ON obj_type_value
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_obj_step_last_updated
BEFORE UPDATE ON obj_step
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_creator_list_last_updated
BEFORE UPDATE ON creator_list
FOR EACH ROW
EXECUTE FUNCTION update_last_updated();

-- Add CHECK constraints
ALTER TABLE creator ADD CONSTRAINT check_username_length CHECK (LENGTH(username) >= 3);
ALTER TABLE task ADD CONSTRAINT check_deadline_after_created CHECK (deadline > created_at);

COMMENT ON TABLE obj_type_value IS 'This table has full-text search capabilities on its JSON data';
COMMENT ON COLUMN obj_type_value.search_vector IS 'This column contains the tsvector for full-text search';

-- Add a tsvector column to the obj_type table
ALTER TABLE obj_type ADD COLUMN fields_search tsvector;

-- Create a function to generate tsvector from JSONB
CREATE OR REPLACE FUNCTION jsonb_to_tsvector(j jsonb) RETURNS tsvector AS $$
DECLARE
  result tsvector := to_tsvector('english', '');
  key text;
  value text;
BEGIN
  FOR key, value IN SELECT * FROM jsonb_each_text(j)
  LOOP
    result := result || to_tsvector('english', coalesce(key, ''));
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to update the fields_search column
CREATE OR REPLACE FUNCTION update_obj_type_fields_search() RETURNS trigger AS $$
BEGIN
  NEW.fields_search := jsonb_to_tsvector(NEW.fields);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update fields_search when fields is inserted or updated
CREATE TRIGGER obj_type_fields_search_update
BEFORE INSERT OR UPDATE OF fields ON obj_type
FOR EACH ROW EXECUTE FUNCTION update_obj_type_fields_search();

-- Create a GIN index on the fields_search column
CREATE INDEX obj_type_fields_search_idx ON obj_type USING GIN (fields_search);

-- Update existing data
UPDATE obj_type SET fields_search = jsonb_to_tsvector(fields);

-- Example query to perform full-text search
-- SELECT * FROM obj_type WHERE fields_search @@ to_tsquery('english', 'your_search_term');

-- import task
CREATE TABLE import_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES org(id),
    creator_id UUID NOT NULL REFERENCES creator(id),
    obj_type_id UUID NOT NULL REFERENCES obj_type(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    total_rows INTEGER NOT NULL,
    processed_rows INTEGER DEFAULT 0,
    error_message TEXT,
    result_summary JSONB,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_import_task_org_id ON import_task(org_id);
CREATE INDEX idx_import_task_creator_id ON import_task(creator_id);
CREATE INDEX idx_import_task_status ON import_task(status);

-- Trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_import_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_import_task_updated_at
BEFORE UPDATE ON import_task
FOR EACH ROW
EXECUTE FUNCTION update_import_task_updated_at();

-- Indexes for step filtering
CREATE INDEX idx_obj_step_obj_id ON obj_step(obj_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_obj_step_step_id ON obj_step(step_id) WHERE deleted_at IS NULL;

-- Indexes for type value searching
CREATE INDEX idx_obj_type_value_obj_id ON obj_type_value(obj_id);
CREATE INDEX idx_obj_type_value_type_values ON obj_type_value USING gin (type_values);

-- Indexes for fact counting and dates
CREATE INDEX idx_obj_fact_obj_id ON obj_fact(obj_id);
CREATE INDEX idx_fact_created_at ON fact(created_at);

-- First create an immutable function for the text search vector
CREATE OR REPLACE FUNCTION obj_ts_vector(
    obj_name text,
    obj_description text, 
    obj_id_string text,
    obj_aliases text[]
) RETURNS tsvector
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT to_tsvector('english',
        obj_name || ' ' ||
        obj_description || ' ' ||
        obj_id_string || ' ' ||
        coalesce(array_to_string(obj_aliases, ' '), '')
    );
$$;

-- Index for text search
CREATE INDEX idx_obj_text_search ON obj 
    USING gin (obj_ts_vector(name, description, id_string, aliases));

CREATE INDEX idx_obj_type_value_type_id ON obj_type_value(type_id);
CREATE INDEX idx_tag_name ON tag USING gin(to_tsvector('english', name));

-- Add merge history table to track object merges
CREATE TABLE object_merge_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_object_id UUID NOT NULL REFERENCES obj(id),
    source_object_ids UUID[] NOT NULL,
    merged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    creator_id UUID NOT NULL REFERENCES creator(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for querying merge history
CREATE INDEX idx_object_merge_history_target ON object_merge_history(target_object_id);
CREATE INDEX idx_object_merge_history_creator ON object_merge_history(creator_id);

CREATE OR REPLACE FUNCTION clean_url_value(value JSONB, url_type TEXT) 
RETURNS TEXT AS 
$function$
BEGIN
    RETURN CASE url_type
        WHEN 'twitter' THEN
            regexp_replace(lower(value#>>'{}'), 'https?://(www\.)?(twitter\.com|x\.com)/', '', 'g')
        WHEN 'web' THEN
            regexp_replace(lower(value#>>'{}'), 'https?://', '', 'g')
        WHEN 'linkedin' THEN
            regexp_replace(lower(value#>>'{}'), 'https?://(www\.)?linkedin\.com/in/', '', 'g')
        ELSE
            lower(value#>>'{}')
    END CASE;
END;
$function$ 
LANGUAGE plpgsql IMMUTABLE;

-- Table to store automated actions
CREATE TABLE automated_action (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    filter_config JSONB NOT NULL,
    -- Combined action configuration
    action_config JSONB NOT NULL,  -- Will contain both tag and funnel actions
    -- Execution tracking
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES creator(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (org_id, name)
);

-- Table to store execution history
CREATE TABLE automated_action_execution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID NOT NULL REFERENCES automated_action(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('running', 'completed', 'failed')) NOT NULL,
    objects_affected INT NOT NULL DEFAULT 0,
    error_message TEXT,
    execution_log JSONB
);

-- Indexes
CREATE INDEX idx_automated_action_org ON automated_action(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_automated_action_last_run ON automated_action(last_run_at) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_action_execution_action_id ON automated_action_execution(action_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_automated_action_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_automated_action_timestamp
    BEFORE UPDATE ON automated_action
    FOR EACH ROW
    EXECUTE FUNCTION update_automated_action_timestamp();ALTER TABLE obj_type ADD COLUMN is_gdp BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE obj_type DROP COLUMN is_gdp;
ALTER TABLE obj_type ADD COLUMN gdp_measure_field TEXT;
CREATE TABLE creator_obj_type_access (
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    obj_type_id UUID NOT NULL REFERENCES obj_type(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (creator_id, obj_type_id)
);
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing data
TRUNCATE TABLE org CASCADE;

DO $$
DECLARE
    v_org_id UUID := '5f9414cc-fbaf-4847-a2ef-aa2a71159204';
    v_creator_cap_id UUID;
    v_creator_micheal_id UUID;
    v_creator_arch_id UUID;
    v_creator_cza_id UUID;
    v_creator_hieu_id UUID;
    v_creator_jack_id UUID;
    v_creator_vennluu_id UUID;
    v_tag_innovation_id UUID;
    v_tag_growth_id UUID;
    v_tag_technology_id UUID;
    v_obj_type_dev_id UUID;
    v_obj_type_proj_id UUID;
    v_obj_type_artist_id UUID;
    v_funnel_dev_id UUID;
    v_funnel_startup_id UUID;
    v_funnel_hack_id UUID;
    v_step_beginner_id UUID;
    v_step_intermediate_id UUID;
    v_step_advanced_id UUID;
    v_step_mvp_id UUID;
    v_step_fund_id UUID;
    v_step_pmf_id UUID;
    v_step_team_id UUID;
    v_step_proj_id UUID;
    v_step_material_id UUID;
    v_step_sub_id UUID;
    v_obj_john_id UUID;
    v_obj_jane_id UUID;
    v_obj_michael_id UUID;
    v_obj_art_id UUID;
    v_obj_creative_id UUID;
    v_obj_inno_id UUID;
    v_obj_future_id UUID;
    v_obj_startup_id UUID;
    v_task_1_id UUID;
    v_task_2_id UUID;
    v_task_3_id UUID;
    v_fact_1_id UUID;
    v_fact_2_id UUID;
    v_fact_3_id UUID;
    v_fact_4_id UUID;
    v_fact_5_id UUID;
    v_fact_6_id UUID;
    v_created_at TIMESTAMP := '2024-01-01 00:00:00+00';
    v_password_hash VARCHAR := '$2a$10$TeEAwL37RIxwLclEmV.vYOVymAMXbHJjFdLNC.eevcyQlOrcKhDIy'; -- password: superteamuk
BEGIN
    -- Insert Org
    INSERT INTO org (id, name, profile, created_at) 
    VALUES (v_org_id, 'SuperteamUK', '{"description": "A leading innovation team"}', v_created_at);

    -- Insert Creators
    INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at) VALUES ('cap', v_password_hash, '{"full_name": "Cap"}', 'admin', v_org_id, TRUE, v_created_at) RETURNING id INTO v_creator_cap_id;
    INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at) VALUES ('micheal', v_password_hash, '{"full_name": "Micheal"}', 'member', v_org_id, TRUE, v_created_at) RETURNING id INTO v_creator_micheal_id;
    INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at) VALUES ('arch', v_password_hash, '{"full_name": "Arch"}', 'member', v_org_id, TRUE, v_created_at) RETURNING id INTO v_creator_arch_id;
    INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at) VALUES ('cza', v_password_hash, '{"full_name": "Cza"}', 'member', v_org_id, TRUE, v_created_at) RETURNING id INTO v_creator_cza_id;
    INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at) VALUES ('hieu', v_password_hash, '{"full_name": "Hieu"}', 'member', v_org_id, TRUE, v_created_at) RETURNING id INTO v_creator_hieu_id;
    INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at) VALUES ('jack', v_password_hash, '{"full_name": "Jack"}', 'member', v_org_id, TRUE, v_created_at) RETURNING id INTO v_creator_jack_id;
    INSERT INTO creator (username, pwd, profile, role, org_id, active, created_at) VALUES ('vennluu', v_password_hash, '{"full_name": "Venn Luu"}', 'admin', v_org_id, TRUE, v_created_at) RETURNING id INTO v_creator_vennluu_id;


    -- Insert Tags
    INSERT INTO tag (name, description, color_schema, org_id, created_at) VALUES ('Innovation', 'Focuses on innovative projects', '{"color": "#FF5733"}', v_org_id, v_created_at) RETURNING id INTO v_tag_innovation_id;
    INSERT INTO tag (name, description, color_schema, org_id, created_at) VALUES ('Growth', 'Relates to growth hacking and scaling', '{"color": "#33FF57"}', v_org_id, v_created_at) RETURNING id INTO v_tag_growth_id;
    INSERT INTO tag (name, description, color_schema, org_id, created_at) VALUES ('Technology', 'Covers tech-related endeavors', '{"color": "#3357FF"}', v_org_id, v_created_at) RETURNING id INTO v_tag_technology_id;

    -- Insert Obj Types (Creator 1 is Cap)
    -- Corrected JSON structure for fields to match SmartObjectFormConfig
    INSERT INTO obj_type (name, description, fields, creator_id, created_at) 
    VALUES ('developer', 'Software developers', '{"skills": {"type": "string", "meta": {"label": "Skills", "order": 1}}, "experience": {"type": "string", "meta": {"label": "Experience", "order": 2}}}', v_creator_cap_id, v_created_at) 
    RETURNING id INTO v_obj_type_dev_id;

    INSERT INTO obj_type (name, description, fields, creator_id, created_at) 
    VALUES ('project', 'Project details', '{"goal": {"type": "string", "meta": {"label": "Goal", "order": 1}}, "deadline": {"type": "datetime", "meta": {"label": "Deadline", "order": 2}}}', v_creator_cap_id, v_created_at) 
    RETURNING id INTO v_obj_type_proj_id;

    INSERT INTO obj_type (name, description, fields, creator_id, created_at) 
    VALUES ('artist', 'Artists and creative professionals', '{"portfolio": {"type": "string", "meta": {"label": "Portfolio", "order": 1}}, "medium": {"type": "string", "meta": {"label": "Medium", "order": 2}}}', v_creator_cap_id, v_created_at) 
    RETURNING id INTO v_obj_type_artist_id;

    -- Insert Funnels (Creator 1 is Cap)
    INSERT INTO funnel (name, description, creator_id, created_at) VALUES ('dev journey', 'The journey of a developer', v_creator_cap_id, v_created_at) RETURNING id INTO v_funnel_dev_id;
    INSERT INTO funnel (name, description, creator_id, created_at) VALUES ('startup journey', 'Steps for startups', v_creator_cap_id, v_created_at) RETURNING id INTO v_funnel_startup_id;
    INSERT INTO funnel (name, description, creator_id, created_at) VALUES ('radar hackathon', 'Hackathon process', v_creator_cap_id, v_created_at) RETURNING id INTO v_funnel_hack_id;

    -- Insert Steps
    -- Funnel 1 (dev journey)
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_dev_id, 'beginner', 'Entry level for developers', 'Build a simple project', 'Learn basics', 1, v_created_at, v_created_at) RETURNING id INTO v_step_beginner_id;
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_dev_id, 'intermediate', 'Mid-level for developers', 'Develop a medium complexity project', 'Enhance skills', 2, v_created_at, v_created_at) RETURNING id INTO v_step_intermediate_id;
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_dev_id, 'advanced', 'Expert level for developers', 'Lead a large-scale project', 'Master skills', 3, v_created_at, v_created_at) RETURNING id INTO v_step_advanced_id;
    
    -- Funnel 2 (startup journey)
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_startup_id, 'mvp', 'Minimum viable product', 'Launch a basic version', 'Build MVP', 1, v_created_at, v_created_at) RETURNING id INTO v_step_mvp_id;
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_startup_id, 'fund raising', 'Raise capital', 'Secure initial funding', 'Pitch to investors', 2, v_created_at, v_created_at) RETURNING id INTO v_step_fund_id;
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_startup_id, 'product market fit', 'Align product with market demand', 'Achieve market validation', 'Market testing', 3, v_created_at, v_created_at) RETURNING id INTO v_step_pmf_id;

    -- Funnel 3 (radar hackathon)
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_hack_id, 'team ready', 'Form a team', 'Recruit team members', 'Team formation', 1, v_created_at, v_created_at) RETURNING id INTO v_step_team_id;
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_hack_id, 'project ready', 'Prepare project', 'Define project scope', 'Project planning', 2, v_created_at, v_created_at) RETURNING id INTO v_step_proj_id;
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_hack_id, 'material done', 'Finish project materials', 'Complete documentation', 'Final touches', 3, v_created_at, v_created_at) RETURNING id INTO v_step_material_id;
    INSERT INTO step (funnel_id, name, definition, example, action, step_order, created_at, last_updated) VALUES (v_funnel_hack_id, 'submission', 'Submit project', 'Send final version', 'Project submission', 4, v_created_at, v_created_at) RETURNING id INTO v_step_sub_id;

    -- Insert Objs
    -- Creator 5 (Hieu)
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('John Doe', 'A senior developer', 'john.doe@example.com', v_creator_hieu_id, v_created_at) RETURNING id INTO v_obj_john_id;
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('Jane Smith', 'A front-end developer', 'jane.smith@example.com', v_creator_hieu_id, v_created_at) RETURNING id INTO v_obj_jane_id;
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('Michael Johnson', 'A back-end developer', 'michael.johnson@example.com', v_creator_hieu_id, v_created_at) RETURNING id INTO v_obj_michael_id;
    
    -- Creator 2 (Micheal)
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('Art Pro', 'An experienced artist', 'art.pro@example.com', v_creator_micheal_id, v_created_at) RETURNING id INTO v_obj_art_id;
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('Creative Vision', 'A digital artist', 'creative.vision@example.com', v_creator_micheal_id, v_created_at) RETURNING id INTO v_obj_creative_id;
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('Innovative Works', 'A project focused on tech innovation', 'http://innoworks.com', v_creator_micheal_id, v_created_at) RETURNING id INTO v_obj_inno_id;

    -- Creator 1 (Cap)
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('Future Tech', 'A cutting-edge tech project', 'http://futuretech.com', v_creator_cap_id, v_created_at) RETURNING id INTO v_obj_future_id;
    INSERT INTO obj (name, description, id_string, creator_id, created_at) VALUES ('Startup Hub', 'A project aimed at startups', 'http://startuphut.com', v_creator_cap_id, v_created_at) RETURNING id INTO v_obj_startup_id;

    -- Insert Obj Type Values
    -- Corrected values to match field definitions
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_john_id, v_obj_type_dev_id, '{"skills": "Java, Spring", "experience": "5 years"}', v_created_at, v_created_at);
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_jane_id, v_obj_type_dev_id, '{"skills": "React, CSS", "experience": "3 years"}', v_created_at, v_created_at);
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_michael_id, v_obj_type_dev_id, '{"skills": "Node.js, MongoDB", "experience": "4 years"}', v_created_at, v_created_at);
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_art_id, v_obj_type_artist_id, '{"portfolio": "http://artpro.com", "medium": "Painting"}', v_created_at, v_created_at);
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_creative_id, v_obj_type_artist_id, '{"portfolio": "http://creativevision.com", "medium": "Digital Art"}', v_created_at, v_created_at);
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_inno_id, v_obj_type_proj_id, '{"goal": "Launch an innovative platform", "deadline": "2025-12-31T00:00:00Z"}', v_created_at, v_created_at);
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_future_id, v_obj_type_proj_id, '{"goal": "Develop cutting-edge technology", "deadline": "2024-11-30T00:00:00Z"}', v_created_at, v_created_at);
    INSERT INTO obj_type_value (obj_id, type_id, type_values, created_at, last_updated) VALUES (v_obj_startup_id, v_obj_type_proj_id, '{"goal": "Support startup ecosystem", "deadline": "2024-09-15T00:00:00Z"}', v_created_at, v_created_at);

    -- Insert Facts
    INSERT INTO fact (text, happened_at, location, creator_id, created_at, last_updated) VALUES ('Met project at BuildStop', '2024-05-15', 'BuildStop', v_creator_cap_id, v_created_at, v_created_at) RETURNING id INTO v_fact_1_id;
    INSERT INTO fact (text, happened_at, location, creator_id, created_at, last_updated) VALUES ('Met project at London Startup Village', '2024-06-01', 'London Startup Village', v_creator_cap_id, v_created_at, v_created_at) RETURNING id INTO v_fact_2_id;
    INSERT INTO fact (text, happened_at, location, creator_id, created_at, last_updated) VALUES ('Pushed bounty invitation to John Doe', '2024-07-10', '', v_creator_hieu_id, v_created_at, v_created_at) RETURNING id INTO v_fact_3_id;
    INSERT INTO fact (text, happened_at, location, creator_id, created_at, last_updated) VALUES ('Pushed bounty invitation to Jane Smith', '2024-07-11', '', v_creator_hieu_id, v_created_at, v_created_at) RETURNING id INTO v_fact_4_id;
    INSERT INTO fact (text, happened_at, location, creator_id, created_at, last_updated) VALUES ('Promoted content for Innovative Works', '2024-08-05', 'Online', v_creator_arch_id, v_created_at, v_created_at) RETURNING id INTO v_fact_5_id;
    INSERT INTO fact (text, happened_at, location, creator_id, created_at, last_updated) VALUES ('Promoted content for Future Tech', '2024-08-10', 'Online', v_creator_arch_id, v_created_at, v_created_at) RETURNING id INTO v_fact_6_id;

    -- Insert Obj Facts
    INSERT INTO obj_fact (obj_id, fact_id) VALUES (v_obj_future_id, v_fact_1_id);
    INSERT INTO obj_fact (obj_id, fact_id) VALUES (v_obj_startup_id, v_fact_2_id);
    INSERT INTO obj_fact (obj_id, fact_id) VALUES (v_obj_john_id, v_fact_3_id);
    INSERT INTO obj_fact (obj_id, fact_id) VALUES (v_obj_jane_id, v_fact_4_id);
    INSERT INTO obj_fact (obj_id, fact_id) VALUES (v_obj_inno_id, v_fact_5_id);
    INSERT INTO obj_fact (obj_id, fact_id) VALUES (v_obj_future_id, v_fact_6_id);

    -- Insert Tasks
    INSERT INTO task (content, deadline, remind_at, status, creator_id, assigned_id, parent_id, created_at, last_updated) VALUES ('Finalize project proposal for Future Tech', '2024-11-15', '2024-11-01', 'todo', v_creator_cap_id, v_creator_hieu_id, NULL, v_created_at, v_created_at) RETURNING id INTO v_task_1_id;
    INSERT INTO task (content, deadline, remind_at, status, creator_id, assigned_id, parent_id, created_at, last_updated) VALUES ('Prepare marketing materials for Startup Hub', '2024-09-10', '2024-09-05', 'doing', v_creator_cap_id, v_creator_micheal_id, NULL, v_created_at, v_created_at) RETURNING id INTO v_task_2_id;
    INSERT INTO task (content, deadline, remind_at, status, creator_id, assigned_id, parent_id, created_at, last_updated) VALUES ('Coordinate with dev team for Future Tech', '2024-11-20', '2024-11-10', 'todo', v_creator_cap_id, v_creator_hieu_id, NULL, v_created_at, v_created_at) RETURNING id INTO v_task_3_id;

    -- Insert Obj Tasks
    INSERT INTO obj_task (obj_id, task_id) VALUES (v_obj_future_id, v_task_1_id);
    INSERT INTO obj_task (obj_id, task_id) VALUES (v_obj_startup_id, v_task_2_id);
    INSERT INTO obj_task (obj_id, task_id) VALUES (v_obj_future_id, v_task_3_id);

END $$;