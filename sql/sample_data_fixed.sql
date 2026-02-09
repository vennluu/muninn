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