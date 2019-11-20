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

-- INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ();

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ('Shevlin Loop Trail',
    'An after work special for the Bend 9-to-5er or a tune-up time trial for the dedicated racer.',7009092,'green',
4.2,'https://cdn-files.apstatic.com/hike/7007179_sqsmall_1554322332.jpg',44.0818,-121.3784,4.8,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ('Deschutes River Hiking Trail',
    'Needs Summary',7073493,'green',
5,'https://cdn-files.apstatic.com/hike/7056730_sqsmall_1555945367.jpg',44.0221,-121.3633,14.5,'All Clear',
'Mostly Dry, Some Mud');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES (
'Tiddlywinks Lower',
    'An easy climb connecting to other trails.',7035581,'blueBlack',
5,'https://cdn-files.apstatic.com/hike/7035792_sqsmall_1555020892.jpg',43.9783,-121.4684,4.1,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ('Pilot Butte Trail',
    'A steep, short climb with great views.',7005256,'greenBlue',
3.9,'https://cdn-files.apstatic.com/hike/7004532_sqsmall_1554245535.jpg',44.0579,-121.2786,0.9,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ('Tumalo Creek Trail - East',
    'A stunningly beautiful trail along Tumalo Creek.',7047723,'green',
4.3,'https://cdn-files.apstatic.com/hike/7007177_sqsmall_1554322327.jpg',44.0828,-121.3764,2.4,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES (
'Deschutes River Trail: South Canyon Reach',
    'A great trail used for hiking/walking/running next to the Deschutes River.',7020560,'greenBlue',
4.2,'https://cdn-files.apstatic.com/hike/7022029_sqsmall_1554840665.jpg',44.0396,-121.331,2.8,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ('Black Rock Trail',
    'Hike beside a lava flow with some great views.',7036829,'greenBlue',
4,'https://cdn-files.apstatic.com/hike/7036995_sqsmall_1555085017.jpg',43.9095,-121.3592,4.2,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ('Swamp Wells (Trail 61)',
    'Head along the North Rim of Newberry Crater to Horse Butte.',7032680,'black',
4,'',43.7432,-121.2381,25,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES (
'Kent''s Trail',
    'Pines, manzanitas and a smooth trail. Gotta love it.',7037181,'greenBlue',
4,'',44.0434,-121.386,4.1,'Unknown',
'null');

INSERT INTO TRAIL (name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES ('KGB Trail',
    'A beautiful trail in Phil''s trail system with nice views and some rugged sections.',7037190,'blue',
4,'https://cdn-files.apstatic.com/hike/7037281_sqsmall_1555085648.jpg',44.0295,-121.3754,4.1,'Unknown',
'null');

