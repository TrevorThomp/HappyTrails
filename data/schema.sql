DROP TABLE IF EXISTS locationlist, trail;

CREATE TABLE trail (
  id SERIAL PRIMARY KEY,
  trails_id INT,
  longitude VARCHAR(255),
  latitude  VARCHAR(255),
  name VARCHAR(255),
  summers VARCHAR(255),
  difficulty VARCHAR(255),
  length DECIMAL(4,1),
  conditionstates TEXT,
  conditiondetails TEXT,
  img_small VARCHAR(255),
  stars DECIMAL(3,1)
);

CREATE TABLE locationlist (
  id SERIAL PRIMARY KEY,
  query_location VARCHAR(255),
  latitude  VARCHAR(255),
  longitude  VARCHAR(255),
  miles_from DECIMAL (4,1),
  FOREIGN KEY (id) REFERENCES trail(id)
);