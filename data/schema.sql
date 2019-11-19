DROP TABLE IF EXISTS locationlist, trail;

CREATE TABLE trail (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  summary VARCHAR(255),
  trail_id INT,
  difficulty VARCHAR(255),
  stars DECIMAL(3,1),
  img_small VARCHAR(255),
  latitude  DECIMAL (12,7),
  longitude DECIMAL (12,7),
  length DECIMAL(4,1),
  conditionstatus TEXT,
  conditiondetails TEXT
);

CREATE TABLE locationlist (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  latitude  DECIMAL(12,7),
  longitude  DECIMAL(12,7),
  miles_from DECIMAL (4,1),
  FOREIGN KEY (id) REFERENCES trail(id)
);