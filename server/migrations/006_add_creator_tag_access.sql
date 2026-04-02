-- Create the creator_tag_access table
CREATE TABLE IF NOT EXISTS creator_tag_access (
    creator_id UUID NOT NULL REFERENCES creator(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (creator_id, tag_id)
);
