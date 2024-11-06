CREATE TABLE directories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT REFERENCES directories(id) ON DELETE CASCADE
);
