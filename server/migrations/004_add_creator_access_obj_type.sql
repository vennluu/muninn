CREATE TABLE creator_obj_type_access (
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    obj_type_id UUID NOT NULL REFERENCES obj_type(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (creator_id, obj_type_id)
);
