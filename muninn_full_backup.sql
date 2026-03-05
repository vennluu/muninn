--
-- PostgreSQL database dump
--

\restrict UQF0GvzYneRhk3KvlvLULs5DfSElfnihUr9f5bzE1hNOeKdYeriPf8hjxwLeAGZ

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.task DROP CONSTRAINT IF EXISTS task_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task DROP CONSTRAINT IF EXISTS task_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task DROP CONSTRAINT IF EXISTS task_assigned_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tag DROP CONSTRAINT IF EXISTS tag_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.step DROP CONSTRAINT IF EXISTS step_funnel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_type_value DROP CONSTRAINT IF EXISTS obj_type_value_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_type_value DROP CONSTRAINT IF EXISTS obj_type_value_obj_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_type DROP CONSTRAINT IF EXISTS obj_type_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_task DROP CONSTRAINT IF EXISTS obj_task_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_task DROP CONSTRAINT IF EXISTS obj_task_obj_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_tag DROP CONSTRAINT IF EXISTS obj_tag_tag_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_tag DROP CONSTRAINT IF EXISTS obj_tag_obj_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_step DROP CONSTRAINT IF EXISTS obj_step_step_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_step DROP CONSTRAINT IF EXISTS obj_step_obj_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_step DROP CONSTRAINT IF EXISTS obj_step_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_fact DROP CONSTRAINT IF EXISTS obj_fact_obj_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj_fact DROP CONSTRAINT IF EXISTS obj_fact_fact_id_fkey;
ALTER TABLE IF EXISTS ONLY public.obj DROP CONSTRAINT IF EXISTS obj_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.list DROP CONSTRAINT IF EXISTS list_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.funnel DROP CONSTRAINT IF EXISTS funnel_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.feed DROP CONSTRAINT IF EXISTS feed_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.fact DROP CONSTRAINT IF EXISTS fact_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.creator_session DROP CONSTRAINT IF EXISTS creator_session_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.creator DROP CONSTRAINT IF EXISTS creator_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.creator_obj_type_access DROP CONSTRAINT IF EXISTS creator_obj_type_access_obj_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.creator_obj_type_access DROP CONSTRAINT IF EXISTS creator_obj_type_access_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.creator_list DROP CONSTRAINT IF EXISTS creator_list_list_id_fkey;
ALTER TABLE IF EXISTS ONLY public.creator_list DROP CONSTRAINT IF EXISTS creator_list_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.automated_action_execution DROP CONSTRAINT IF EXISTS automated_action_execution_action_id_fkey;
DROP TRIGGER IF EXISTS update_task_last_updated ON public.task;
DROP TRIGGER IF EXISTS update_step_last_updated ON public.step;
DROP TRIGGER IF EXISTS update_obj_type_value_last_updated ON public.obj_type_value;
DROP TRIGGER IF EXISTS update_obj_step_last_updated ON public.obj_step;
DROP TRIGGER IF EXISTS update_list_last_updated ON public.list;
DROP TRIGGER IF EXISTS update_fact_last_updated ON public.fact;
DROP TRIGGER IF EXISTS update_creator_list_last_updated ON public.creator_list;
DROP TRIGGER IF EXISTS update_automated_action_timestamp ON public.automated_action;
DROP TRIGGER IF EXISTS trigger_update_import_task_updated_at ON public.import_task;
DROP TRIGGER IF EXISTS obj_type_value_search_update ON public.obj_type_value;
DROP TRIGGER IF EXISTS obj_type_fields_search_update ON public.obj_type;
DROP INDEX IF EXISTS public.obj_type_value_search_idx;
DROP INDEX IF EXISTS public.obj_type_fields_search_idx;
DROP INDEX IF EXISTS public.idx_task_status;
DROP INDEX IF EXISTS public.idx_task_creator_id;
DROP INDEX IF EXISTS public.idx_task_assigned_id;
DROP INDEX IF EXISTS public.idx_tag_org_id;
DROP INDEX IF EXISTS public.idx_tag_name;
DROP INDEX IF EXISTS public.idx_step_funnel_id;
DROP INDEX IF EXISTS public.idx_object_merge_history_target;
DROP INDEX IF EXISTS public.idx_object_merge_history_creator;
DROP INDEX IF EXISTS public.idx_obj_type_value_type_values;
DROP INDEX IF EXISTS public.idx_obj_type_value_type_id;
DROP INDEX IF EXISTS public.idx_obj_type_value_obj_id;
DROP INDEX IF EXISTS public.idx_obj_type_creator_id;
DROP INDEX IF EXISTS public.idx_obj_text_search;
DROP INDEX IF EXISTS public.idx_obj_step_step_id;
DROP INDEX IF EXISTS public.idx_obj_step_obj_id;
DROP INDEX IF EXISTS public.idx_obj_name;
DROP INDEX IF EXISTS public.idx_obj_id_string;
DROP INDEX IF EXISTS public.idx_obj_fact_obj_id;
DROP INDEX IF EXISTS public.idx_obj_creator_id;
DROP INDEX IF EXISTS public.idx_import_task_status;
DROP INDEX IF EXISTS public.idx_import_task_org_id;
DROP INDEX IF EXISTS public.idx_import_task_creator_id;
DROP INDEX IF EXISTS public.idx_funnel_creator_id;
DROP INDEX IF EXISTS public.idx_feed_creator_id;
DROP INDEX IF EXISTS public.idx_fact_happened_at;
DROP INDEX IF EXISTS public.idx_fact_creator_id;
DROP INDEX IF EXISTS public.idx_fact_created_at;
DROP INDEX IF EXISTS public.idx_creator_username_trgm;
DROP INDEX IF EXISTS public.idx_creator_username;
DROP INDEX IF EXISTS public.idx_creator_session_creator_id;
DROP INDEX IF EXISTS public.idx_creator_profile;
DROP INDEX IF EXISTS public.idx_creator_org_id;
DROP INDEX IF EXISTS public.idx_automated_action_org;
DROP INDEX IF EXISTS public.idx_automated_action_last_run;
DROP INDEX IF EXISTS public.idx_aliases;
DROP INDEX IF EXISTS public.idx_action_execution_action_id;
ALTER TABLE IF EXISTS ONLY public.task DROP CONSTRAINT IF EXISTS task_pkey;
ALTER TABLE IF EXISTS ONLY public.tag DROP CONSTRAINT IF EXISTS tag_pkey;
ALTER TABLE IF EXISTS ONLY public.tag DROP CONSTRAINT IF EXISTS tag_name_org_id_key;
ALTER TABLE IF EXISTS ONLY public.step DROP CONSTRAINT IF EXISTS step_pkey;
ALTER TABLE IF EXISTS ONLY public.org DROP CONSTRAINT IF EXISTS org_pkey;
ALTER TABLE IF EXISTS ONLY public.org DROP CONSTRAINT IF EXISTS org_name_key;
ALTER TABLE IF EXISTS ONLY public.object_merge_history DROP CONSTRAINT IF EXISTS object_merge_history_pkey;
ALTER TABLE IF EXISTS ONLY public.obj_type_value DROP CONSTRAINT IF EXISTS obj_type_value_pkey;
ALTER TABLE IF EXISTS ONLY public.obj_type_value DROP CONSTRAINT IF EXISTS obj_type_value_obj_id_type_id_key;
ALTER TABLE IF EXISTS ONLY public.obj_type DROP CONSTRAINT IF EXISTS obj_type_pkey;
ALTER TABLE IF EXISTS ONLY public.obj_task DROP CONSTRAINT IF EXISTS obj_task_pkey;
ALTER TABLE IF EXISTS ONLY public.obj_tag DROP CONSTRAINT IF EXISTS obj_tag_pkey;
ALTER TABLE IF EXISTS ONLY public.obj_step DROP CONSTRAINT IF EXISTS obj_step_pkey;
ALTER TABLE IF EXISTS ONLY public.obj DROP CONSTRAINT IF EXISTS obj_pkey;
ALTER TABLE IF EXISTS ONLY public.obj DROP CONSTRAINT IF EXISTS obj_id_string_creator_id_key;
ALTER TABLE IF EXISTS ONLY public.obj_fact DROP CONSTRAINT IF EXISTS obj_fact_pkey;
ALTER TABLE IF EXISTS ONLY public.list DROP CONSTRAINT IF EXISTS list_pkey;
ALTER TABLE IF EXISTS ONLY public.import_task DROP CONSTRAINT IF EXISTS import_task_pkey;
ALTER TABLE IF EXISTS ONLY public.funnel DROP CONSTRAINT IF EXISTS funnel_pkey;
ALTER TABLE IF EXISTS ONLY public.feed DROP CONSTRAINT IF EXISTS feed_pkey;
ALTER TABLE IF EXISTS ONLY public.fact DROP CONSTRAINT IF EXISTS fact_pkey;
ALTER TABLE IF EXISTS ONLY public.creator DROP CONSTRAINT IF EXISTS creator_username_org_id_key;
ALTER TABLE IF EXISTS ONLY public.creator_session DROP CONSTRAINT IF EXISTS creator_session_pkey;
ALTER TABLE IF EXISTS ONLY public.creator DROP CONSTRAINT IF EXISTS creator_pkey;
ALTER TABLE IF EXISTS ONLY public.creator_obj_type_access DROP CONSTRAINT IF EXISTS creator_obj_type_access_pkey;
ALTER TABLE IF EXISTS ONLY public.creator_list DROP CONSTRAINT IF EXISTS creator_list_pkey;
ALTER TABLE IF EXISTS ONLY public.creator_list DROP CONSTRAINT IF EXISTS creator_list_creator_id_list_id_key;
ALTER TABLE IF EXISTS ONLY public.automated_action DROP CONSTRAINT IF EXISTS automated_action_pkey;
ALTER TABLE IF EXISTS ONLY public.automated_action DROP CONSTRAINT IF EXISTS automated_action_org_id_name_key;
ALTER TABLE IF EXISTS ONLY public.automated_action_execution DROP CONSTRAINT IF EXISTS automated_action_execution_pkey;
DROP TABLE IF EXISTS public.task;
DROP TABLE IF EXISTS public.tag;
DROP TABLE IF EXISTS public.step;
DROP TABLE IF EXISTS public.org;
DROP TABLE IF EXISTS public.object_merge_history;
DROP TABLE IF EXISTS public.obj_type;
DROP TABLE IF EXISTS public.obj_task;
DROP TABLE IF EXISTS public.obj_tag;
DROP TABLE IF EXISTS public.obj_step;
DROP TABLE IF EXISTS public.obj_fact;
DROP TABLE IF EXISTS public.obj;
DROP TABLE IF EXISTS public.list;
DROP TABLE IF EXISTS public.import_task;
DROP TABLE IF EXISTS public.funnel;
DROP TABLE IF EXISTS public.feed;
DROP TABLE IF EXISTS public.fact;
DROP TABLE IF EXISTS public.creator_session;
DROP TABLE IF EXISTS public.creator_obj_type_access;
DROP TABLE IF EXISTS public.creator_list;
DROP TABLE IF EXISTS public.creator;
DROP TABLE IF EXISTS public.automated_action_execution;
DROP TABLE IF EXISTS public.automated_action;
DROP FUNCTION IF EXISTS public.update_obj_type_fields_search();
DROP FUNCTION IF EXISTS public.update_last_updated();
DROP FUNCTION IF EXISTS public.update_import_task_updated_at();
DROP FUNCTION IF EXISTS public.update_automated_action_timestamp();
DROP FUNCTION IF EXISTS public.obj_type_value_search_trigger();
DROP FUNCTION IF EXISTS public.obj_ts_vector(obj_name text, obj_description text, obj_id_string text, obj_aliases text[]);
DROP FUNCTION IF EXISTS public.jsonb_to_tsvector(j jsonb);
DROP FUNCTION IF EXISTS public.jsonb_to_text(jsonb_data jsonb);
DROP FUNCTION IF EXISTS public.generate_obj_type_value_search_vector(obj_type_value_row public.obj_type_value);
DROP TABLE IF EXISTS public.obj_type_value;
DROP FUNCTION IF EXISTS public.clean_url_value(value jsonb, url_type text);
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pg_trgm;
--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: clean_url_value(jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clean_url_value(value jsonb, url_type text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
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
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: obj_type_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obj_type_value (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    obj_id uuid NOT NULL,
    type_id uuid NOT NULL,
    type_values jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    search_vector tsvector
);


--
-- Name: TABLE obj_type_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.obj_type_value IS 'This table has full-text search capabilities on its JSON data';


--
-- Name: COLUMN obj_type_value.search_vector; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.obj_type_value.search_vector IS 'This column contains the tsvector for full-text search';


--
-- Name: generate_obj_type_value_search_vector(public.obj_type_value); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_obj_type_value_search_vector(obj_type_value_row public.obj_type_value) RETURNS tsvector
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
  RETURN to_tsvector('english', jsonb_to_text(obj_type_value_row.type_values));
END;
$$;


--
-- Name: jsonb_to_text(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jsonb_to_text(jsonb_data jsonb) RETURNS text
    LANGUAGE plpgsql
    AS $_$
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
END $_$;


--
-- Name: jsonb_to_tsvector(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jsonb_to_tsvector(j jsonb) RETURNS tsvector
    LANGUAGE plpgsql IMMUTABLE
    AS $$
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
$$;


--
-- Name: obj_ts_vector(text, text, text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.obj_ts_vector(obj_name text, obj_description text, obj_id_string text, obj_aliases text[]) RETURNS tsvector
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT to_tsvector('english',
        obj_name || ' ' ||
        obj_description || ' ' ||
        obj_id_string || ' ' ||
        coalesce(array_to_string(obj_aliases, ' '), '')
    );
$$;


--
-- Name: obj_type_value_search_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.obj_type_value_search_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector := generate_obj_type_value_search_vector(NEW);
  RETURN NEW;
END;
$$;


--
-- Name: update_automated_action_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_automated_action_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_import_task_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_import_task_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_last_updated(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_last_updated() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_obj_type_fields_search(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_obj_type_fields_search() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.fields_search := jsonb_to_tsvector(NEW.fields);
  RETURN NEW;
END;
$$;


--
-- Name: automated_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automated_action (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    org_id uuid NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    filter_config jsonb NOT NULL,
    action_config jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_run_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by uuid NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: automated_action_execution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automated_action_execution (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    action_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp with time zone,
    status character varying(50) NOT NULL,
    objects_affected integer DEFAULT 0 NOT NULL,
    error_message text,
    execution_log jsonb,
    CONSTRAINT automated_action_execution_status_check CHECK (((status)::text = ANY (ARRAY[('running'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text])))
);


--
-- Name: creator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(255) NOT NULL,
    pwd character varying(255) NOT NULL,
    profile jsonb NOT NULL,
    role character varying(50) NOT NULL,
    org_id uuid NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT check_username_length CHECK ((length((username)::text) >= 3)),
    CONSTRAINT creator_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('member'::character varying)::text])))
);


--
-- Name: creator_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_list (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    creator_id uuid NOT NULL,
    list_id uuid NOT NULL,
    params jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: creator_obj_type_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_obj_type_access (
    creator_id uuid NOT NULL,
    obj_type_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: creator_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_session (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    creator_id uuid NOT NULL,
    jwt text NOT NULL,
    expired_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    text text NOT NULL,
    happened_at timestamp with time zone,
    location text NOT NULL,
    creator_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: feed; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feed (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    creator_id uuid NOT NULL,
    content jsonb NOT NULL,
    seen boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: funnel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funnel (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    creator_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: import_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.import_task (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    org_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    obj_type_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    progress integer DEFAULT 0,
    total_rows integer NOT NULL,
    processed_rows integer DEFAULT 0,
    error_message text,
    result_summary jsonb,
    file_name text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT import_task_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('processing'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text])))
);


--
-- Name: list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.list (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    filter_setting jsonb NOT NULL,
    creator_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: obj; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obj (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    photo text DEFAULT ''::text NOT NULL,
    description text NOT NULL,
    id_string text NOT NULL,
    creator_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    aliases text[] DEFAULT '{}'::text[] NOT NULL
);


--
-- Name: obj_fact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obj_fact (
    obj_id uuid NOT NULL,
    fact_id uuid NOT NULL
);


--
-- Name: obj_step; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obj_step (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    obj_id uuid NOT NULL,
    step_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    sub_status integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: obj_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obj_tag (
    obj_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: obj_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obj_task (
    obj_id uuid NOT NULL,
    task_id uuid NOT NULL
);


--
-- Name: obj_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.obj_type (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(255) DEFAULT 'file'::character varying NOT NULL,
    description text NOT NULL,
    fields jsonb NOT NULL,
    creator_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    fields_search tsvector,
    is_public boolean DEFAULT true,
    gdp_measure_field text
);


--
-- Name: object_merge_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.object_merge_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    target_object_id uuid NOT NULL,
    source_object_ids uuid[] NOT NULL,
    merged_at timestamp with time zone NOT NULL,
    creator_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: org; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    profile jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: step; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.step (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    funnel_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    definition text NOT NULL,
    example text NOT NULL,
    action text NOT NULL,
    step_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    color_schema jsonb NOT NULL,
    org_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    deadline timestamp with time zone,
    remind_at timestamp with time zone,
    status character varying(50) NOT NULL,
    creator_id uuid NOT NULL,
    assigned_id uuid,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT check_deadline_after_created CHECK ((deadline > created_at)),
    CONSTRAINT task_status_check CHECK (((status)::text = ANY (ARRAY[('todo'::character varying)::text, ('doing'::character varying)::text, ('paused'::character varying)::text, ('completed'::character varying)::text])))
);


--
-- Data for Name: automated_action; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automated_action (id, org_id, name, description, filter_config, action_config, is_active, last_run_at, created_at, updated_at, created_by, deleted_at) FROM stdin;
f6411a43-485c-49e6-bd51-e8dac7480ab0	e7b9bde5-76ac-477d-9480-93c098c4f1e9	s	--- With condition ---\n\n--- Apply ---\nTag(s): Growth, Funnel: Breakout hackathon	{"tagIds": [], "typeIds": []}	{"tagId": "ec92fd16-800a-440d-a43d-b61451dabde8", "funnelId": "d7ad4fa5-1fce-43de-aab6-8c46369f224d"}	t	\N	2026-02-08 00:13:35.624308+07	2026-02-08 00:13:42.743553+07	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-08 00:13:42.743553+07
b046e0c9-3e47-49a8-ab65-d947a0a79254	5f9414cc-fbaf-4847-a2ef-aa2a71159204	hello	--- With condition ---\n\n--- Apply ---\nFunnel: dev journey	{"tagIds": [], "typeIds": []}	{"funnelId": "c12f895f-62ed-4ea5-98bb-8169cf1094bc"}	t	\N	2026-01-29 05:16:47.471471+07	2026-01-29 05:17:02.474459+07	c792c107-10e4-4a45-a4bd-6da88e0cda7e	2026-01-29 05:17:02.474459+07
04dddb1b-058a-49ee-b591-f72ae26e7de2	2cc425da-8574-4c3d-9d3b-dd76dcfbd842	hello	--- With condition ---\nhhhh\n--- Apply ---\nFunnel: Start-up	{"typeIds": []}	{"funnelId": "6e64c621-1c3e-4c78-8da4-fe65348a2dbf"}	t	2026-03-04 22:47:51.056347+07	2025-11-16 22:05:09.689443+07	2026-03-04 22:47:51.056347+07	d243501b-8131-4a8a-879a-e7fcb85e2813	\N
\.


--
-- Data for Name: automated_action_execution; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automated_action_execution (id, action_id, started_at, completed_at, status, objects_affected, error_message, execution_log) FROM stdin;
30c43800-2a12-4432-9d72-b085a2a52a53	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 07:23:09.478138+07	2026-03-03 07:23:09.500583+07	completed	0	\N	null
4dc55228-f1ed-42b0-9578-12e044fcf878	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 07:43:09.438317+07	2026-03-03 07:43:09.460199+07	completed	0	\N	null
266b7c48-98ff-4bb3-8731-11db70afcaef	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 08:03:09.345292+07	2026-03-03 08:03:09.363285+07	completed	0	\N	null
a7e77ec8-bcdb-4bd3-907a-20ebf18636ba	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 08:23:09.380484+07	2026-03-03 08:23:09.412029+07	completed	0	\N	null
b2f53deb-4c3e-4174-a1d5-552a45bb6000	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 09:08:20.637911+07	2026-03-03 09:08:20.679579+07	completed	0	\N	null
01d18b37-601f-4add-a597-cab493ca404d	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-27 21:36:36.688699+07	2026-02-27 21:36:36.807453+07	completed	0	\N	null
c87ffbe7-bec0-4483-9764-d15f9f41287d	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-01 11:29:47.04003+07	2026-03-01 11:29:47.098777+07	completed	0	\N	null
dbcc9bf4-a2bb-48eb-94e9-1bf967ba0b22	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-01 11:49:47.013079+07	2026-03-01 11:49:47.046978+07	completed	0	\N	null
e296c69b-9e97-4d77-9cc1-f38118f63388	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-01 12:00:53.746281+07	2026-03-01 12:00:53.765029+07	completed	0	\N	null
1b70d09d-2bc7-4341-9ae8-2c3b53da69ce	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 22:05:47.883459+07	2026-03-02 22:05:48.09501+07	completed	0	\N	null
ad933c5c-178e-483b-80b8-21bd8e8c8732	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-27 22:02:16.775894+07	2026-02-27 22:02:17.054919+07	completed	0	\N	null
d694304f-41e4-4777-9365-901ae7a90c10	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-27 22:51:38.222378+07	2026-02-27 22:51:38.267994+07	completed	0	\N	null
c7af4fb8-5169-4ca1-8123-0592ed60f813	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-27 23:11:38.166732+07	2026-02-27 23:11:38.196096+07	completed	0	\N	null
ac51620b-e725-4147-861f-65eccd42c2d9	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-27 23:31:38.127792+07	2026-02-27 23:31:38.158406+07	completed	0	\N	null
5b87d610-6eb4-4674-9159-b96a138dbbf2	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-28 10:12:21.451714+07	2026-02-28 10:12:21.488594+07	completed	0	\N	null
0d892372-113f-45a4-8b95-3f9851b75bdb	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-01 17:03:42.64862+07	2026-03-01 17:03:42.710636+07	completed	0	\N	null
03b5955c-4ad6-461d-9c4e-1ad91436dd62	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 02:37:03.645657+07	2026-03-02 02:37:03.661646+07	completed	0	\N	null
8d26c57c-4eb4-4e69-a471-46da19c29d84	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 08:48:07.407042+07	2026-03-02 08:48:07.428916+07	completed	0	\N	null
8e37bf4c-0567-421b-b9f0-cedc2eff327b	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 15:13:01.325764+07	2026-03-02 15:13:01.351061+07	completed	0	\N	null
3aa9b7e8-9c2a-494d-9da8-a3f3102f93f5	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 22:25:47.777447+07	2026-03-02 22:25:47.803259+07	completed	0	\N	null
aca8a276-b53f-4efd-8e0e-6332a1271290	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-27 16:48:50.347389+07	2026-02-27 16:48:50.537404+07	completed	0	\N	null
a21b077e-8dcb-4a59-bfd0-c9a61869daa8	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-28 10:35:58.964294+07	2026-02-28 10:35:59.042234+07	completed	0	\N	null
b39a791f-ff2f-49a1-918c-b2fd3158c648	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-28 11:03:43.663462+07	2026-02-28 11:03:43.804118+07	completed	0	\N	null
cb04bf94-e8ac-4c34-ac06-7b74602a9e82	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-28 19:46:39.569316+07	2026-02-28 19:46:39.657925+07	completed	0	\N	null
9a6f64f0-34fd-4b41-b036-f2168ff43379	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-01 01:16:35.24101+07	2026-03-01 01:16:35.262279+07	completed	0	\N	null
5a528206-f4d1-4f9c-a681-4d94468e3745	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-01 11:09:47.006053+07	2026-03-01 11:09:47.069147+07	completed	0	\N	null
2bfc440d-eb2c-4dcd-8cda-5d6657e18518	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 21:05:50.363417+07	2026-03-02 21:05:52.381629+07	completed	0	\N	null
0be67afb-547d-460d-a34c-373106c07f0e	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 21:25:47.843533+07	2026-03-02 21:25:47.867132+07	completed	0	\N	null
06dd2a9f-4667-4b98-96f5-afd626b07026	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 22:45:47.782935+07	2026-03-02 22:45:47.803197+07	completed	0	\N	null
eb644d18-4a61-4c20-b9ab-41f284a7682c	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 23:05:47.766947+07	2026-03-02 23:05:47.802653+07	completed	0	\N	null
ca9ad3df-5328-489d-b0cf-0830dd73862c	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 23:25:47.704391+07	2026-03-02 23:25:47.721673+07	completed	0	\N	null
07b70291-f707-4169-a761-2b24e06d9cf0	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 00:25:47.591451+07	2026-03-03 00:25:47.611379+07	completed	0	\N	null
3f4f4598-62f5-4d12-891d-ba00a60ae7e2	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 00:45:47.506886+07	2026-03-03 00:45:47.528153+07	completed	0	\N	null
5465e1ae-903b-49a3-830d-2f5dfa31890b	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 05:28:10.624755+07	2026-03-03 05:28:10.743925+07	completed	0	\N	null
7e531f4f-0d8f-475c-882a-dd5db427ead6	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 06:03:09.595955+07	2026-03-03 06:03:09.647123+07	completed	0	\N	null
4b6fa2cc-7eb1-47e1-8af6-cc613606a10a	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 06:23:09.576727+07	2026-03-03 06:23:09.604065+07	completed	0	\N	null
7132f7ea-55de-4476-9ed2-33cf85f6f0f6	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 06:43:09.538298+07	2026-03-03 06:43:09.557888+07	completed	0	\N	null
481ee1cc-76d7-45ca-b00f-5ee254096ba2	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 07:03:09.553012+07	2026-03-03 07:03:09.567897+07	completed	0	\N	null
d4e91191-9f63-4df2-969e-e9ca7aadde99	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-02-27 21:16:36.664081+07	2026-02-27 21:16:36.740365+07	completed	0	\N	null
783ebd0f-2455-4b82-aa8f-e0ab82d07717	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-01 10:49:47.074204+07	2026-03-01 10:49:47.123021+07	completed	0	\N	null
398aa0fa-a1f5-4f47-a2b9-fbcb64ba4809	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 21:45:47.820768+07	2026-03-02 21:45:47.847254+07	completed	0	\N	null
2276ecfc-24a5-4128-a147-3d59af9c630a	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-02 23:45:47.684552+07	2026-03-02 23:45:47.722166+07	completed	0	\N	null
5bf36c8a-ddfd-4e23-bcbc-c91f142614b0	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-03 00:05:47.628421+07	2026-03-03 00:05:47.65358+07	completed	0	\N	null
4f74b3e6-a850-4738-8f8e-a87b92fbc25f	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-04 18:50:02.121125+07	2026-03-04 18:50:02.21049+07	completed	0	\N	null
3353ba80-5b14-4d6d-b85d-dbf63a5053e5	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-04 20:32:56.279223+07	2026-03-04 20:32:56.420055+07	completed	0	\N	null
cf1b4a77-7f2e-4b56-b577-e465a5d1cbd8	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-04 21:06:39.392189+07	2026-03-04 21:06:39.421091+07	completed	0	\N	null
9f6b77c8-f527-4fa5-bc0a-ac83e88cff91	04dddb1b-058a-49ee-b591-f72ae26e7de2	2026-03-04 22:47:51.000513+07	2026-03-04 22:47:51.0548+07	completed	0	\N	null
\.


--
-- Data for Name: creator; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator (id, username, pwd, profile, role, org_id, active, created_at, deleted_at) FROM stdin;
6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	test	$2a$10$uyDZAPWf3f/YY3AKu8ESQ.35eW/l5qyXIuQYgUHw3iD1rwxHPUCjq	{}	admin	e7b9bde5-76ac-477d-9480-93c098c4f1e9	t	2026-02-06 03:44:07.933252+07	\N
8bc31122-e131-4dd3-bf12-38385a9d21cb	venn	$2a$10$M/6BnamxsTUBsOgNilS/fek15McYUmoiU7jbhs/8JpeaSo9n3EIhG	{"email": "", "avatar": "", "fullname": "venn luu"}	member	e7b9bde5-76ac-477d-9480-93c098c4f1e9	t	2026-02-08 21:08:42.598103+07	\N
6499430c-e7c8-4189-ab0d-20cdba82f443	superteamuk	$2a$10$/YN/UM5h4Hco5S1LGHOhAu4frwKU6eQKH6i3PBrFgfR.GUEFS411y	{}	admin	b80616aa-b8f1-414b-adfc-8c9cff582807	t	2026-02-09 14:24:11.26408+07	\N
0e8d9530-ee48-4a07-8c17-aa9c75c4f6e8	superteamjp	$2a$10$TVlwm7rC8du2i54DAhw/BOi0poilUsCnzUld5aXW3L.lpcsBFgZUq	{}	admin	9ab77872-50db-4ea6-b5ee-1754911f6a17	t	2026-02-09 14:24:36.870865+07	\N
3d22665e-a4a7-48e1-affb-9e8dd6dac5c9	superteamml	$2a$10$YcYi702OXz5GlDQzh4uVMevZjB9fOCZTlx6sRwxC23k54k731Hqve	{}	admin	2e63e78f-35d8-47c8-8143-ed79187973fb	t	2026-02-09 14:24:52.521457+07	\N
\.


--
-- Data for Name: creator_list; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator_list (id, creator_id, list_id, params, created_at, last_updated) FROM stdin;
98ddb006-5829-40f7-98f2-d4530775fcbf	8bc31122-e131-4dd3-bf12-38385a9d21cb	445af809-3213-48a3-8a89-4a15719b5482	{}	2026-02-09 09:17:04.591098+07	2026-02-09 09:17:04.591098+07
c0d8b05b-4dfb-4e8a-99ce-f3d374d6655d	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	74c65945-ec72-491e-93d4-7c986a50929c	{}	2026-02-09 14:29:55.64582+07	2026-02-09 14:29:55.64582+07
7342cb36-7ea2-405a-9b2c-3f45f5f2d0d8	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	5a1c647d-7fc3-4187-b916-5297d3bdc28a	{}	2026-02-09 14:39:49.994394+07	2026-02-09 14:39:49.994394+07
\.


--
-- Data for Name: creator_obj_type_access; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator_obj_type_access (creator_id, obj_type_id, created_at) FROM stdin;
8bc31122-e131-4dd3-bf12-38385a9d21cb	441a33a4-03c4-4e50-a337-4370f08aaff4	2026-02-08 22:36:54.067357+07
8bc31122-e131-4dd3-bf12-38385a9d21cb	28301154-1f76-4f2d-82ba-37bcdcb0e0af	2026-02-08 22:36:55.075829+07
6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	d0afdda3-2fae-4fe2-b9d9-1c70a7831de3	2026-02-09 09:11:41.796221+07
8bc31122-e131-4dd3-bf12-38385a9d21cb	5d687c9a-2b1f-431b-9b2b-b46cd886c8c5	2026-02-09 09:13:22.289158+07
8bc31122-e131-4dd3-bf12-38385a9d21cb	32fa342b-6281-432b-97e8-b127e3dcfc8d	2026-02-09 09:36:44.843932+07
\.


--
-- Data for Name: creator_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.creator_session (id, creator_id, jwt, expired_at, created_at) FROM stdin;
\.


--
-- Data for Name: fact; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fact (id, text, happened_at, location, creator_id, created_at, last_updated, deleted_at) FROM stdin;
\.


--
-- Data for Name: feed; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feed (id, creator_id, content, seen, created_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: funnel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.funnel (id, name, description, creator_id, created_at, deleted_at) FROM stdin;
9cd68d4f-a55e-48e4-a14a-a01964f3c62c	Member road	Member jourdney	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 03:58:59.249169+07	\N
ce1ce9e9-c806-4f58-b0c4-1d5dcd163e2f	Event road		6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 03:59:47.534107+07	\N
9af4dc21-3933-427a-8e14-505f73ef7f30	Project road		6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 04:03:08.800715+07	\N
d7ad4fa5-1fce-43de-aab6-8c46369f224d	Breakout hackathon		6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 04:08:51.05574+07	\N
0d4fe98f-149b-40d9-b394-d537791571bb	Project Details		6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 04:13:22.812138+07	2026-02-06 04:14:39.190272+07
\.


--
-- Data for Name: import_task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.import_task (id, org_id, creator_id, obj_type_id, status, progress, total_rows, processed_rows, error_message, result_summary, file_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: list; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.list (id, name, description, filter_setting, creator_id, created_at, last_updated, deleted_at) FROM stdin;
66e45a5d-7e3a-458d-9742-a0ea375f678e	member	member	{"view": {"columns": [{"field": "name", "label": "Name", "order": 0, "width": 200, "visible": true, "sortable": true}, {"field": "created_at", "label": "Created Date", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "first_fact_date", "label": "First Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "last_fact_date", "label": "Last Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "id_string", "label": "ID String", "width": 150, "visible": false, "sortable": true}, {"field": "tags", "label": "Tags", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "type_values", "label": "Type Values", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "fact_count", "label": "Fact Count", "width": 50, "visible": false, "sortable": true, "formatType": "number"}, {"field": "description", "label": "Description", "width": 200, "visible": false, "sortable": false, "formatType": "md"}], "density": "comfortable", "displayMode": "table"}, "filter": {"page": 1, "sortBy": "created_at", "tagIds": [], "typeIds": ["441a33a4-03c4-4e50-a337-4370f08aaff4"], "pageSize": 100, "ascending": false}, "version": "v1"}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-08 15:41:09.126826+07	2026-02-08 15:41:09.126826+07	\N
445af809-3213-48a3-8a89-4a15719b5482	member	Member list	{"view": {"columns": [{"field": "name", "label": "Name", "order": 0, "width": 200, "visible": true, "sortable": true}, {"field": "created_at", "label": "Created Date", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "first_fact_date", "label": "First Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "last_fact_date", "label": "Last Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "id_string", "label": "ID String", "width": 150, "visible": false, "sortable": true}, {"field": "tags", "label": "Tags", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "type_values", "label": "Type Values", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "fact_count", "label": "Fact Count", "width": 50, "visible": false, "sortable": true, "formatType": "number"}, {"field": "description", "label": "Description", "width": 200, "visible": false, "sortable": false, "formatType": "md"}], "density": "comfortable", "displayMode": "table"}, "filter": {"page": 1, "sortBy": "created_at", "tagIds": [], "typeIds": ["441a33a4-03c4-4e50-a337-4370f08aaff4", "5d687c9a-2b1f-431b-9b2b-b46cd886c8c5"], "pageSize": 100, "ascending": false, "funnelStepFilter": {"stepIds": ["0d27f37d-e9a5-455e-a04b-cd7878fde7dd", "f8161c96-0c92-4ed2-9880-f4dbe6cc07d6", "da58e28c-f038-4e76-a9be-875355777f4e", "197e6387-98db-44d3-bd7f-8b2b2b385a6e"], "funnelId": "9cd68d4f-a55e-48e4-a14a-a01964f3c62c", "subStatuses": [0, 1, 2]}, "typeValueCriteria": {"criteria1": {"field": "Skill", "value": "", "typeId": "441a33a4-03c4-4e50-a337-4370f08aaff4"}}}, "version": "v1"}	8bc31122-e131-4dd3-bf12-38385a9d21cb	2026-02-09 09:17:04.581962+07	2026-02-09 09:17:04.581962+07	\N
74c65945-ec72-491e-93d4-7c986a50929c	member	member	{"view": {"columns": [{"field": "name", "label": "Name", "order": 0, "width": 200, "visible": true, "sortable": true}, {"field": "created_at", "label": "Created Date", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "first_fact_date", "label": "First Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "last_fact_date", "label": "Last Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "id_string", "label": "ID String", "width": 150, "visible": false, "sortable": true}, {"field": "tags", "label": "Tags", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "type_values", "label": "Type Values", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "fact_count", "label": "Fact Count", "width": 50, "visible": false, "sortable": true, "formatType": "number"}, {"field": "description", "label": "Description", "width": 200, "visible": false, "sortable": false, "formatType": "md"}], "density": "comfortable", "displayMode": "table"}, "filter": {"page": 1, "sortBy": "created_at", "tagIds": [], "typeIds": ["441a33a4-03c4-4e50-a337-4370f08aaff4", "32fa342b-6281-432b-97e8-b127e3dcfc8d"], "pageSize": 100, "ascending": false, "funnelStepFilter": {"stepIds": ["0d27f37d-e9a5-455e-a04b-cd7878fde7dd", "f8161c96-0c92-4ed2-9880-f4dbe6cc07d6", "da58e28c-f038-4e76-a9be-875355777f4e", "197e6387-98db-44d3-bd7f-8b2b2b385a6e"], "funnelId": "9cd68d4f-a55e-48e4-a14a-a01964f3c62c", "subStatuses": [0, 1, 2]}}, "version": "v1"}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-09 14:29:55.63961+07	2026-02-09 14:29:55.63961+07	\N
5a1c647d-7fc3-4187-b916-5297d3bdc28a	member	member s	{"view": {"columns": [{"field": "name", "label": "Name", "order": 0, "width": 200, "visible": true, "sortable": true}, {"field": "created_at", "label": "Created Date", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "first_fact_date", "label": "First Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "last_fact_date", "label": "Last Fact", "width": 150, "visible": false, "sortable": true, "formatType": "date"}, {"field": "id_string", "label": "ID String", "width": 150, "visible": false, "sortable": true}, {"field": "tags", "label": "Tags", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "type_values", "label": "Type Values", "width": 150, "visible": false, "sortable": false, "formatType": "react.element"}, {"field": "fact_count", "label": "Fact Count", "width": 50, "visible": false, "sortable": true, "formatType": "number"}, {"field": "description", "label": "Description", "width": 200, "visible": false, "sortable": false, "formatType": "md"}], "density": "comfortable", "displayMode": "table"}, "filter": {"page": 1, "sortBy": "created_at", "tagIds": [], "typeIds": ["441a33a4-03c4-4e50-a337-4370f08aaff4", "32fa342b-6281-432b-97e8-b127e3dcfc8d"], "pageSize": 100, "ascending": false, "funnelStepFilter": {"stepIds": ["0d27f37d-e9a5-455e-a04b-cd7878fde7dd", "f8161c96-0c92-4ed2-9880-f4dbe6cc07d6", "da58e28c-f038-4e76-a9be-875355777f4e", "197e6387-98db-44d3-bd7f-8b2b2b385a6e"], "funnelId": "9cd68d4f-a55e-48e4-a14a-a01964f3c62c", "subStatuses": [0, 1, 2]}}, "version": "v1"}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-09 14:39:49.951013+07	2026-02-09 14:39:49.951013+07	\N
\.


--
-- Data for Name: obj; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.obj (id, name, photo, description, id_string, creator_id, created_at, deleted_at, aliases) FROM stdin;
30f1dabb-2324-4d4d-9743-27b2a7e33228	vennluu			e64203ba-77cb-4f29-a15f-198b72b99f68	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 03:47:51.555822+07	\N	{}
46d638c1-a70f-4d35-9851-4aa779b219f9	Start-up Vilage event			62ffc079-2dec-496c-9e56-af83275c5c92	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 04:04:39.400598+07	\N	{}
797fd6f9-7470-431d-beeb-e810bb1b9451	Muninn			2e2dfa76-901b-4e47-a067-dd6a6cc48e9a	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 04:09:13.075488+07	\N	{}
c68f1963-eaed-480b-8ca7-16d7b17bc100	chau			5c241c1a-734f-463f-8bac-a4a025a861c7	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 21:31:11.953083+07	\N	{}
c5422b53-26f1-4e50-88bb-b538a60d63a1	CRM grant			bf91452b-d66a-472f-a971-cde7a61ad648	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-08 01:14:56.288869+07	\N	{}
2f87720e-228a-4527-8ffb-ba3e50682a78	Lazorkit		passkey wallet	ab31fd2a-805a-4aba-bf0a-06491e0dcda9	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-08 03:37:31.767245+07	\N	{}
d82e203a-6763-4d69-9751-fbf9d7d7d714	zai		s	152bcf58-a670-42e9-91f3-29b3b7151216	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-08 15:25:49.003413+07	\N	{}
bc420b9f-a1f1-4bd5-b9fe-bd61129e03a4	Tio		s	9051a4f3-2392-4315-b4b7-3a870cad7493	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-08 15:25:57.609132+07	\N	{}
9c059973-5f06-4c1a-bb77-fc85adc28326	Steven		steven	a86b56cf-2b5f-44ba-a950-a3893b2a54a2	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-03-01 10:50:21.237775+07	\N	{}
\.


--
-- Data for Name: obj_fact; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.obj_fact (obj_id, fact_id) FROM stdin;
\.


--
-- Data for Name: obj_step; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.obj_step (id, obj_id, step_id, creator_id, sub_status, created_at, last_updated, deleted_at) FROM stdin;
38cb52b5-4449-4b22-92ae-115bb1903485	30f1dabb-2324-4d4d-9743-27b2a7e33228	0d27f37d-e9a5-455e-a04b-cd7878fde7dd	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	0	2026-02-06 04:00:09.650482+07	2026-02-06 04:01:57.858229+07	2026-02-06 04:01:57.858229+07
42352ad2-ef02-4605-88a1-9d2d5c00bee9	797fd6f9-7470-431d-beeb-e810bb1b9451	5f4d714a-e275-4fc9-84c1-d71f5dd51a7d	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	0	2026-02-06 04:13:34.801888+07	2026-02-06 04:13:52.661154+07	2026-02-06 04:13:52.661154+07
1823dcdf-5a00-4eb2-a9b7-877c5e03139f	30f1dabb-2324-4d4d-9743-27b2a7e33228	0d27f37d-e9a5-455e-a04b-cd7878fde7dd	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	1	2026-02-06 04:07:12.854145+07	2026-02-07 14:58:54.582263+07	2026-02-07 14:58:54.582263+07
73ee9f0d-3bb7-487a-b89e-aea22f5c5045	30f1dabb-2324-4d4d-9743-27b2a7e33228	da58e28c-f038-4e76-a9be-875355777f4e	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2	2026-02-07 14:58:54.582263+07	2026-02-07 22:50:16.28545+07	\N
53fd8b6c-44b7-4087-9cc7-c536ad821668	c68f1963-eaed-480b-8ca7-16d7b17bc100	da58e28c-f038-4e76-a9be-875355777f4e	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	0	2026-02-08 03:07:37.410975+07	2026-02-08 03:07:37.410975+07	\N
0dfb29aa-ac8e-442c-8429-79a362fb67f0	2f87720e-228a-4527-8ffb-ba3e50682a78	f2211e19-648c-4a72-a1cf-07ee93fe5de4	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	0	2026-02-08 03:38:00.308422+07	2026-02-08 03:38:00.308422+07	\N
f13e63fc-df45-40ab-a227-881b106b2b3c	46d638c1-a70f-4d35-9851-4aa779b219f9	f8b8dc00-74ac-40e5-b3d3-7cd08aa276e8	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	0	2026-02-08 15:14:13.824187+07	2026-02-08 15:14:13.824187+07	\N
b0f9c721-3756-4cb0-98ec-f8cae03395dc	46d638c1-a70f-4d35-9851-4aa779b219f9	38dec0c5-b1f8-4ff7-9b7e-beb159709b56	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	1	2026-02-06 04:05:17.165136+07	2026-02-08 15:14:13.824187+07	2026-02-08 15:14:13.824187+07
558920fd-4346-4840-92a8-87da11386329	bc420b9f-a1f1-4bd5-b9fe-bd61129e03a4	da58e28c-f038-4e76-a9be-875355777f4e	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	0	2026-02-08 21:07:27.626293+07	2026-02-08 21:07:27.626293+07	\N
662ee9f5-6f03-42fb-87d0-a1f3aa6cabcb	d82e203a-6763-4d69-9751-fbf9d7d7d714	da58e28c-f038-4e76-a9be-875355777f4e	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	0	2026-02-08 21:07:43.160028+07	2026-02-08 21:07:43.160028+07	\N
\.


--
-- Data for Name: obj_tag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.obj_tag (obj_id, tag_id) FROM stdin;
\.


--
-- Data for Name: obj_task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.obj_task (obj_id, task_id) FROM stdin;
\.


--
-- Data for Name: obj_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.obj_type (id, name, icon, description, fields, creator_id, created_at, deleted_at, fields_search, is_public, gdp_measure_field) FROM stdin;
28301154-1f76-4f2d-82ba-37bcdcb0e0af	Project	file	Which project	{"h": {"meta": {"label": "h", "order": 1}, "type": "percentage", "validation": {}}, "Co-founder": {"meta": {"label": "Co-founder", "order": 2}, "type": "object"}, "Who is founder": {"meta": {"label": "Who is founder", "order": 0}, "type": "object", "validation": {}}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 03:54:49.485707+07	\N	'co':3 'co-found':2 'founder':4,7 'h':1	t	\N
771493c5-3eb9-4a8e-bfd7-5029e6c9b4bb	test	file	test	{"t": {"meta": {"label": "t", "order": 0}, "type": "string"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-07 23:23:56.766811+07	2026-02-08 00:23:58.840168+07		t	\N
2f75f0ba-c166-4c42-a677-e79cded00568	Designer	file	Who is Designer	{"Skill": {"meta": {"label": "Skill", "order": 0}, "type": "string"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 03:53:55.857745+07	2026-02-08 00:24:08.08582+07	'skill':1	t	\N
6720e2ef-62a6-47ef-90bb-6b8da7909edb	Event	file	event	{"Time": {"meta": {"label": "Time", "order": 1}, "type": "datetime"}, "Location": {"meta": {"label": "Location", "order": 0}, "type": "string"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 03:57:23.917626+07	\N	'locat':2 'time':1	t	Location
441a33a4-03c4-4e50-a337-4370f08aaff4	Developer	file	Who is developer\n	{"Skill": {"meta": {"label": "Skill", "order": 0}, "type": "string", "validation": {}}, "Project": {"meta": {"label": "Project", "order": 2}, "type": "object", "validation": {}}, "experience": {"meta": {"label": "experience", "order": 1}, "type": "number"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-06 03:53:23.973375+07	\N	'experi':3 'project':2 'skill':1	t	\N
a18970aa-7188-40db-aa20-34880aeb0d20	Debug Object Type 2	file	Created by debug script	{"field1": {"type": "text", "label": "Field 1"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-09 09:05:05.477343+07	2026-02-09 09:19:04.676797+07	'field1':1	t	field1
d0afdda3-2fae-4fe2-b9d9-1c70a7831de3	Verified Object Type	file	Created via verification script	{"field1": {"type": "text", "label": "Test Field"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-09 09:11:41.796221+07	2026-02-09 09:19:04.690048+07	'field1':1	t	\N
493d67ad-4447-4cd8-b5d3-8d197c66a66b	Grant	file	s	{"Goal": {"meta": {"label": "Goal", "order": 0}, "type": "string", "validation": {}}, "Applier": {"meta": {"label": "Applier", "order": 1}, "type": "object"}, "How much": {"meta": {"label": "How much", "order": 2}, "type": "number"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-08 00:24:38.233465+07	\N	'applier':2 'goal':1 'much':4	f	How much
ec37262b-1fab-4294-b83e-185d2c856044	API Test Object Type	file	Created via curl	{"field1": {"type": "text", "label": "Test Field"}}	6f700b4c-8b1e-47bc-a224-f1ba4061f3f2	2026-02-09 09:06:15.64046+07	2026-02-09 09:19:04.691179+07	'field1':1	t	\N
7f9fe16b-1e4e-4db8-8704-b1895f3eae5b	s	file	s	{"s": {"meta": {"label": "s", "order": 0}, "type": "string"}}	8bc31122-e131-4dd3-bf12-38385a9d21cb	2026-02-09 09:02:40.11488+07	2026-02-09 09:19:04.692266+07		t	\N
5d687c9a-2b1f-431b-9b2b-b46cd886c8c5	Designer	file	Designer 	{"Skill": {"meta": {"label": "Skill", "order": 0}, "type": "string", "validation": {}}, "Project": {"meta": {"label": "Project", "order": 2}, "type": "object"}, "Experience": {"meta": {"label": "Experience", "order": 1}, "type": "number"}}	8bc31122-e131-4dd3-bf12-38385a9d21cb	2026-02-09 09:13:22.289158+07	2026-02-09 09:22:04.985865+07	'experi':3 'project':2 'skill':1	t	\N
8cde5500-7788-4004-b02a-b86e77f897ea	Designer	file	Design Skill	{"Skill": {"meta": {"label": "Skill", "order": 0}, "type": "string"}, "Experience": {"meta": {"label": "Experience", "order": 1}, "type": "number"}}	8bc31122-e131-4dd3-bf12-38385a9d21cb	2026-02-09 09:02:20.786461+07	2026-02-09 09:22:04.992195+07	'experi':2 'skill':1	t	\N
32fa342b-6281-432b-97e8-b127e3dcfc8d	design	file	ds	{"s": {"meta": {"label": "s", "order": 0}, "type": "string"}}	8bc31122-e131-4dd3-bf12-38385a9d21cb	2026-02-09 09:36:44.843932+07	\N		t	\N
\.


--
-- Data for Name: obj_type_value; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.obj_type_value (id, obj_id, type_id, type_values, created_at, last_updated, deleted_at, search_vector) FROM stdin;
3fc9d3f7-6746-41c8-91dc-7187baa0faf0	46d638c1-a70f-4d35-9851-4aa779b219f9	6720e2ef-62a6-47ef-90bb-6b8da7909edb	{"Time": "2026-03-21T04:06", "Location": "Bogor"}	2026-02-06 04:06:27.208839+07	2026-02-06 04:06:40.293319+07	\N	'-03':2 '-21':3 '06':5 '2026':1 'bogor':6 't04':4
31aa8d03-c835-4b46-ac23-25f56b14e994	30f1dabb-2324-4d4d-9743-27b2a7e33228	441a33a4-03c4-4e50-a337-4370f08aaff4	{"Skill": "react", "Project": {"id": "797fd6f9-7470-431d-beeb-e810bb1b9451", "name": "Muninn", "description": ""}, "experience": "2"}	2026-02-06 03:55:26.613004+07	2026-02-09 14:39:00.762579+07	\N	'2':2 'react':1
f55de8b9-3ac8-46f4-a048-2bbc70315175	c68f1963-eaed-480b-8ca7-16d7b17bc100	441a33a4-03c4-4e50-a337-4370f08aaff4	{"Skill": "react", "Project": {"id": "2f87720e-228a-4527-8ffb-ba3e50682a78", "name": "Lazorkit", "description": "passkey wallet"}, "experience": "5"}	2026-02-06 21:31:22.789851+07	2026-02-09 14:39:36.725227+07	\N	'5':2 'react':1
299bd7fe-01ef-4cd3-9e49-76163476e3a4	2f87720e-228a-4527-8ffb-ba3e50682a78	28301154-1f76-4f2d-82ba-37bcdcb0e0af	{"Who is founder": {"id": "c68f1963-eaed-480b-8ca7-16d7b17bc100", "name": "chau", "description": ""}}	2026-02-08 03:37:47.702879+07	2026-02-08 03:37:47.702879+07	\N	
5168d95f-4f42-42b0-a97b-364476b7297d	797fd6f9-7470-431d-beeb-e810bb1b9451	28301154-1f76-4f2d-82ba-37bcdcb0e0af	{"Co-founder": null, "Who is founder": {"id": "30f1dabb-2324-4d4d-9743-27b2a7e33228", "name": "vennluu", "description": ""}, "Kind of project": ""}	2026-02-06 04:09:22.3166+07	2026-02-08 03:38:38.979282+07	\N	
f2345f45-03a4-4a81-890e-81e2dfda84f1	d82e203a-6763-4d69-9751-fbf9d7d7d714	441a33a4-03c4-4e50-a337-4370f08aaff4	{"Skill": "", "experience": ""}	2026-02-08 15:26:11.562273+07	2026-02-08 15:26:11.562273+07	\N	
d990d6d2-b587-429e-8891-75440fa9cde9	bc420b9f-a1f1-4bd5-b9fe-bd61129e03a4	441a33a4-03c4-4e50-a337-4370f08aaff4	{"Skill": "", "experience": ""}	2026-02-08 15:26:18.356618+07	2026-02-08 15:26:18.356618+07	\N	
12f6f248-c03a-4514-a411-c725d48650f4	c5422b53-26f1-4e50-88bb-b538a60d63a1	493d67ad-4447-4cd8-b5d3-8d197c66a66b	{"Goal": "CRM for superteams", "Applier": {"id": "30f1dabb-2324-4d4d-9743-27b2a7e33228", "name": "vennluu", "description": ""}, "How much": 1000}	2026-02-08 01:15:22.816993+07	2026-02-08 22:44:47.642575+07	\N	'1000':4 'crm':1 'superteam':3
6e4bdd79-32cd-4859-b440-b3ee7e76798c	9c059973-5f06-4c1a-bb77-fc85adc28326	441a33a4-03c4-4e50-a337-4370f08aaff4	{"experience": 2}	2026-03-01 10:51:24.515167+07	2026-03-01 10:51:24.515167+07	\N	'2':1
\.


--
-- Data for Name: object_merge_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.object_merge_history (id, target_object_id, source_object_ids, merged_at, creator_id, created_at) FROM stdin;
\.


--
-- Data for Name: org; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.org (id, name, profile, created_at, deleted_at) FROM stdin;
e7b9bde5-76ac-477d-9480-93c098c4f1e9	superteamIDN	{}	2026-02-06 03:44:07.826399+07	\N
b80616aa-b8f1-414b-adfc-8c9cff582807	SuperteamUK	{}	2026-02-09 14:24:11.142436+07	\N
9ab77872-50db-4ea6-b5ee-1754911f6a17	SuperteamJP	{}	2026-02-09 14:24:36.762862+07	\N
2e63e78f-35d8-47c8-8143-ed79187973fb	SuperteamML	{}	2026-02-09 14:24:52.44022+07	\N
\.


--
-- Data for Name: step; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.step (id, funnel_id, name, definition, example, action, step_order, created_at, last_updated, deleted_at) FROM stdin;
0d27f37d-e9a5-455e-a04b-cd7878fde7dd	9cd68d4f-a55e-48e4-a14a-a01964f3c62c	Lurker				0	2026-02-06 03:58:59.300841+07	2026-02-06 03:58:59.300841+07	\N
f8161c96-0c92-4ed2-9880-f4dbe6cc07d6	9cd68d4f-a55e-48e4-a14a-a01964f3c62c	Contributer				1	2026-02-06 03:58:59.312181+07	2026-02-06 03:58:59.312181+07	\N
da58e28c-f038-4e76-a9be-875355777f4e	9cd68d4f-a55e-48e4-a14a-a01964f3c62c	Member				2	2026-02-06 03:58:59.313511+07	2026-02-06 03:58:59.313511+07	\N
197e6387-98db-44d3-bd7f-8b2b2b385a6e	9cd68d4f-a55e-48e4-a14a-a01964f3c62c	Inactive				3	2026-02-06 03:58:59.314805+07	2026-02-06 03:58:59.314805+07	\N
38dec0c5-b1f8-4ff7-9b7e-beb159709b56	ce1ce9e9-c806-4f58-b0c4-1d5dcd163e2f	Planning				0	2026-02-06 03:59:47.547917+07	2026-02-06 03:59:47.547917+07	\N
f8b8dc00-74ac-40e5-b3d3-7cd08aa276e8	ce1ce9e9-c806-4f58-b0c4-1d5dcd163e2f	Preparing				1	2026-02-06 03:59:47.555072+07	2026-02-06 03:59:47.555072+07	\N
06313540-eb93-4611-814d-2273de9df053	ce1ce9e9-c806-4f58-b0c4-1d5dcd163e2f	Finished				2	2026-02-06 03:59:47.560351+07	2026-02-06 03:59:47.560351+07	\N
b1841d5e-f40e-4ac0-ba51-c7af1810b315	9af4dc21-3933-427a-8e14-505f73ef7f30	MVP				0	2026-02-06 04:03:08.80789+07	2026-02-06 04:03:08.80789+07	\N
f2211e19-648c-4a72-a1cf-07ee93fe5de4	9af4dc21-3933-427a-8e14-505f73ef7f30	Fundraising				1	2026-02-06 04:03:08.809399+07	2026-02-06 04:03:08.809399+07	\N
4ff80126-5347-40f5-a292-1313bd6b9230	9af4dc21-3933-427a-8e14-505f73ef7f30	Dropout				2	2026-02-06 04:03:08.810283+07	2026-02-06 04:03:08.810283+07	\N
8c92c808-adc2-4cec-95a1-c4fae1a73552	d7ad4fa5-1fce-43de-aab6-8c46369f224d	Idea				0	2026-02-06 04:08:51.057557+07	2026-02-06 04:08:51.057557+07	\N
c4174b8a-cf55-48d9-9df6-5840e880f8a9	d7ad4fa5-1fce-43de-aab6-8c46369f224d	MVP				1	2026-02-06 04:08:51.059797+07	2026-02-06 04:08:51.059797+07	\N
5f4d714a-e275-4fc9-84c1-d71f5dd51a7d	0d4fe98f-149b-40d9-b394-d537791571bb	DePIN				0	2026-02-06 04:13:22.814993+07	2026-02-06 04:13:22.814993+07	\N
9ef35a6a-18f4-415d-97fc-833130d3ef9d	0d4fe98f-149b-40d9-b394-d537791571bb	Tool				1	2026-02-06 04:13:22.816098+07	2026-02-06 04:13:22.816098+07	\N
\.


--
-- Data for Name: tag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tag (id, name, description, color_schema, org_id, created_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task (id, content, deadline, remind_at, status, creator_id, assigned_id, parent_id, created_at, last_updated, deleted_at) FROM stdin;
\.


--
-- Name: automated_action_execution automated_action_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automated_action_execution
    ADD CONSTRAINT automated_action_execution_pkey PRIMARY KEY (id);


--
-- Name: automated_action automated_action_org_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automated_action
    ADD CONSTRAINT automated_action_org_id_name_key UNIQUE (org_id, name);


--
-- Name: automated_action automated_action_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automated_action
    ADD CONSTRAINT automated_action_pkey PRIMARY KEY (id);


--
-- Name: creator_list creator_list_creator_id_list_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_list
    ADD CONSTRAINT creator_list_creator_id_list_id_key UNIQUE (creator_id, list_id);


--
-- Name: creator_list creator_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_list
    ADD CONSTRAINT creator_list_pkey PRIMARY KEY (id);


--
-- Name: creator_obj_type_access creator_obj_type_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_obj_type_access
    ADD CONSTRAINT creator_obj_type_access_pkey PRIMARY KEY (creator_id, obj_type_id);


--
-- Name: creator creator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator
    ADD CONSTRAINT creator_pkey PRIMARY KEY (id);


--
-- Name: creator_session creator_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_session
    ADD CONSTRAINT creator_session_pkey PRIMARY KEY (id);


--
-- Name: creator creator_username_org_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator
    ADD CONSTRAINT creator_username_org_id_key UNIQUE (username, org_id);


--
-- Name: fact fact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact
    ADD CONSTRAINT fact_pkey PRIMARY KEY (id);


--
-- Name: feed feed_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed
    ADD CONSTRAINT feed_pkey PRIMARY KEY (id);


--
-- Name: funnel funnel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel
    ADD CONSTRAINT funnel_pkey PRIMARY KEY (id);


--
-- Name: import_task import_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_task
    ADD CONSTRAINT import_task_pkey PRIMARY KEY (id);


--
-- Name: list list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);


--
-- Name: obj_fact obj_fact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_fact
    ADD CONSTRAINT obj_fact_pkey PRIMARY KEY (obj_id, fact_id);


--
-- Name: obj obj_id_string_creator_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj
    ADD CONSTRAINT obj_id_string_creator_id_key UNIQUE (id_string, creator_id);


--
-- Name: obj obj_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj
    ADD CONSTRAINT obj_pkey PRIMARY KEY (id);


--
-- Name: obj_step obj_step_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_step
    ADD CONSTRAINT obj_step_pkey PRIMARY KEY (id);


--
-- Name: obj_tag obj_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_tag
    ADD CONSTRAINT obj_tag_pkey PRIMARY KEY (obj_id, tag_id);


--
-- Name: obj_task obj_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_task
    ADD CONSTRAINT obj_task_pkey PRIMARY KEY (obj_id, task_id);


--
-- Name: obj_type obj_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_type
    ADD CONSTRAINT obj_type_pkey PRIMARY KEY (id);


--
-- Name: obj_type_value obj_type_value_obj_id_type_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_type_value
    ADD CONSTRAINT obj_type_value_obj_id_type_id_key UNIQUE (obj_id, type_id);


--
-- Name: obj_type_value obj_type_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_type_value
    ADD CONSTRAINT obj_type_value_pkey PRIMARY KEY (id);


--
-- Name: object_merge_history object_merge_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.object_merge_history
    ADD CONSTRAINT object_merge_history_pkey PRIMARY KEY (id);


--
-- Name: org org_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT org_name_key UNIQUE (name);


--
-- Name: org org_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT org_pkey PRIMARY KEY (id);


--
-- Name: step step_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step
    ADD CONSTRAINT step_pkey PRIMARY KEY (id);


--
-- Name: tag tag_name_org_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_name_org_id_key UNIQUE (name, org_id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: task task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- Name: idx_action_execution_action_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_action_execution_action_id ON public.automated_action_execution USING btree (action_id);


--
-- Name: idx_aliases; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aliases ON public.obj USING gin (aliases);


--
-- Name: idx_automated_action_last_run; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automated_action_last_run ON public.automated_action USING btree (last_run_at) WHERE ((is_active = true) AND (deleted_at IS NULL));


--
-- Name: idx_automated_action_org; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_automated_action_org ON public.automated_action USING btree (org_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_creator_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creator_org_id ON public.creator USING btree (org_id);


--
-- Name: idx_creator_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creator_profile ON public.creator USING gin (profile jsonb_path_ops);


--
-- Name: idx_creator_session_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creator_session_creator_id ON public.creator_session USING btree (creator_id);


--
-- Name: idx_creator_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creator_username ON public.creator USING btree (username);


--
-- Name: idx_creator_username_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creator_username_trgm ON public.creator USING gin (username public.gin_trgm_ops);


--
-- Name: idx_fact_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fact_created_at ON public.fact USING btree (created_at);


--
-- Name: idx_fact_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fact_creator_id ON public.fact USING btree (creator_id);


--
-- Name: idx_fact_happened_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fact_happened_at ON public.fact USING btree (happened_at);


--
-- Name: idx_feed_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feed_creator_id ON public.feed USING btree (creator_id);


--
-- Name: idx_funnel_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_funnel_creator_id ON public.funnel USING btree (creator_id);


--
-- Name: idx_import_task_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_task_creator_id ON public.import_task USING btree (creator_id);


--
-- Name: idx_import_task_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_task_org_id ON public.import_task USING btree (org_id);


--
-- Name: idx_import_task_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_task_status ON public.import_task USING btree (status);


--
-- Name: idx_obj_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_creator_id ON public.obj USING btree (creator_id);


--
-- Name: idx_obj_fact_obj_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_fact_obj_id ON public.obj_fact USING btree (obj_id);


--
-- Name: idx_obj_id_string; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_id_string ON public.obj USING btree (id_string);


--
-- Name: idx_obj_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_name ON public.obj USING btree (name);


--
-- Name: idx_obj_step_obj_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_step_obj_id ON public.obj_step USING btree (obj_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_obj_step_step_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_step_step_id ON public.obj_step USING btree (step_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_obj_text_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_text_search ON public.obj USING gin (public.obj_ts_vector(name, description, id_string, aliases));


--
-- Name: idx_obj_type_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_type_creator_id ON public.obj_type USING btree (creator_id);


--
-- Name: idx_obj_type_value_obj_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_type_value_obj_id ON public.obj_type_value USING btree (obj_id);


--
-- Name: idx_obj_type_value_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_type_value_type_id ON public.obj_type_value USING btree (type_id);


--
-- Name: idx_obj_type_value_type_values; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_obj_type_value_type_values ON public.obj_type_value USING gin (type_values);


--
-- Name: idx_object_merge_history_creator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_object_merge_history_creator ON public.object_merge_history USING btree (creator_id);


--
-- Name: idx_object_merge_history_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_object_merge_history_target ON public.object_merge_history USING btree (target_object_id);


--
-- Name: idx_step_funnel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_step_funnel_id ON public.step USING btree (funnel_id);


--
-- Name: idx_tag_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tag_name ON public.tag USING gin (to_tsvector('english'::regconfig, (name)::text));


--
-- Name: idx_tag_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tag_org_id ON public.tag USING btree (org_id);


--
-- Name: idx_task_assigned_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_assigned_id ON public.task USING btree (assigned_id);


--
-- Name: idx_task_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_creator_id ON public.task USING btree (creator_id);


--
-- Name: idx_task_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_task_status ON public.task USING btree (status);


--
-- Name: obj_type_fields_search_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX obj_type_fields_search_idx ON public.obj_type USING gin (fields_search);


--
-- Name: obj_type_value_search_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX obj_type_value_search_idx ON public.obj_type_value USING gin (search_vector);


--
-- Name: obj_type obj_type_fields_search_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER obj_type_fields_search_update BEFORE INSERT OR UPDATE OF fields ON public.obj_type FOR EACH ROW EXECUTE FUNCTION public.update_obj_type_fields_search();


--
-- Name: obj_type_value obj_type_value_search_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER obj_type_value_search_update BEFORE INSERT OR UPDATE ON public.obj_type_value FOR EACH ROW EXECUTE FUNCTION public.obj_type_value_search_trigger();


--
-- Name: import_task trigger_update_import_task_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_import_task_updated_at BEFORE UPDATE ON public.import_task FOR EACH ROW EXECUTE FUNCTION public.update_import_task_updated_at();


--
-- Name: automated_action update_automated_action_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_automated_action_timestamp BEFORE UPDATE ON public.automated_action FOR EACH ROW EXECUTE FUNCTION public.update_automated_action_timestamp();


--
-- Name: creator_list update_creator_list_last_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_creator_list_last_updated BEFORE UPDATE ON public.creator_list FOR EACH ROW EXECUTE FUNCTION public.update_last_updated();


--
-- Name: fact update_fact_last_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_fact_last_updated BEFORE UPDATE ON public.fact FOR EACH ROW EXECUTE FUNCTION public.update_last_updated();


--
-- Name: list update_list_last_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_list_last_updated BEFORE UPDATE ON public.list FOR EACH ROW EXECUTE FUNCTION public.update_last_updated();


--
-- Name: obj_step update_obj_step_last_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_obj_step_last_updated BEFORE UPDATE ON public.obj_step FOR EACH ROW EXECUTE FUNCTION public.update_last_updated();


--
-- Name: obj_type_value update_obj_type_value_last_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_obj_type_value_last_updated BEFORE UPDATE ON public.obj_type_value FOR EACH ROW EXECUTE FUNCTION public.update_last_updated();


--
-- Name: step update_step_last_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_step_last_updated BEFORE UPDATE ON public.step FOR EACH ROW EXECUTE FUNCTION public.update_last_updated();


--
-- Name: task update_task_last_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_task_last_updated BEFORE UPDATE ON public.task FOR EACH ROW EXECUTE FUNCTION public.update_last_updated();


--
-- Name: automated_action_execution automated_action_execution_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automated_action_execution
    ADD CONSTRAINT automated_action_execution_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.automated_action(id) ON DELETE CASCADE;


--
-- Name: creator_list creator_list_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_list
    ADD CONSTRAINT creator_list_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: creator_list creator_list_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_list
    ADD CONSTRAINT creator_list_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.list(id) ON DELETE CASCADE;


--
-- Name: creator_obj_type_access creator_obj_type_access_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_obj_type_access
    ADD CONSTRAINT creator_obj_type_access_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: creator_obj_type_access creator_obj_type_access_obj_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_obj_type_access
    ADD CONSTRAINT creator_obj_type_access_obj_type_id_fkey FOREIGN KEY (obj_type_id) REFERENCES public.obj_type(id) ON DELETE CASCADE;


--
-- Name: creator creator_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator
    ADD CONSTRAINT creator_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.org(id) ON DELETE CASCADE;


--
-- Name: creator_session creator_session_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_session
    ADD CONSTRAINT creator_session_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: fact fact_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact
    ADD CONSTRAINT fact_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: feed feed_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed
    ADD CONSTRAINT feed_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: funnel funnel_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funnel
    ADD CONSTRAINT funnel_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: list list_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT list_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: obj obj_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj
    ADD CONSTRAINT obj_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: obj_fact obj_fact_fact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_fact
    ADD CONSTRAINT obj_fact_fact_id_fkey FOREIGN KEY (fact_id) REFERENCES public.fact(id) ON DELETE CASCADE;


--
-- Name: obj_fact obj_fact_obj_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_fact
    ADD CONSTRAINT obj_fact_obj_id_fkey FOREIGN KEY (obj_id) REFERENCES public.obj(id) ON DELETE CASCADE;


--
-- Name: obj_step obj_step_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_step
    ADD CONSTRAINT obj_step_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: obj_step obj_step_obj_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_step
    ADD CONSTRAINT obj_step_obj_id_fkey FOREIGN KEY (obj_id) REFERENCES public.obj(id) ON DELETE CASCADE;


--
-- Name: obj_step obj_step_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_step
    ADD CONSTRAINT obj_step_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.step(id) ON DELETE CASCADE;


--
-- Name: obj_tag obj_tag_obj_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_tag
    ADD CONSTRAINT obj_tag_obj_id_fkey FOREIGN KEY (obj_id) REFERENCES public.obj(id) ON DELETE CASCADE;


--
-- Name: obj_tag obj_tag_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_tag
    ADD CONSTRAINT obj_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tag(id) ON DELETE CASCADE;


--
-- Name: obj_task obj_task_obj_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_task
    ADD CONSTRAINT obj_task_obj_id_fkey FOREIGN KEY (obj_id) REFERENCES public.obj(id) ON DELETE CASCADE;


--
-- Name: obj_task obj_task_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_task
    ADD CONSTRAINT obj_task_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.task(id) ON DELETE CASCADE;


--
-- Name: obj_type obj_type_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_type
    ADD CONSTRAINT obj_type_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: obj_type_value obj_type_value_obj_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_type_value
    ADD CONSTRAINT obj_type_value_obj_id_fkey FOREIGN KEY (obj_id) REFERENCES public.obj(id) ON DELETE CASCADE;


--
-- Name: obj_type_value obj_type_value_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.obj_type_value
    ADD CONSTRAINT obj_type_value_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.obj_type(id) ON DELETE CASCADE;


--
-- Name: step step_funnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step
    ADD CONSTRAINT step_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnel(id) ON DELETE CASCADE;


--
-- Name: tag tag_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.org(id) ON DELETE CASCADE;


--
-- Name: task task_assigned_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_assigned_id_fkey FOREIGN KEY (assigned_id) REFERENCES public.creator(id) ON DELETE SET NULL;


--
-- Name: task task_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creator(id) ON DELETE CASCADE;


--
-- Name: task task_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.task(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict UQF0GvzYneRhk3KvlvLULs5DfSElfnihUr9f5bzE1hNOeKdYeriPf8hjxwLeAGZ

