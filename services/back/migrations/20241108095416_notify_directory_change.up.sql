CREATE OR REPLACE FUNCTION notify_directory_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'directory_changes',
    json_build_object(
      'action', TG_OP,
      'id', COALESCE(NEW.id, OLD.id),
      'name', COALESCE(NEW.name, OLD.name),
      'parent_id', NEW.parent_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER directory_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON directories
FOR EACH ROW
EXECUTE FUNCTION notify_directory_change();
