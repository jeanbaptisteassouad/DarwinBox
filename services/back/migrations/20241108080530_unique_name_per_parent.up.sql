CREATE UNIQUE INDEX unique_name_per_parent
ON directories (name, COALESCE(parent_id, -1));
