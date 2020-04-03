# Happy Trails

Happy Trails is a web application that allows a user to look up hikes in a specified location and radius of that location. The user is then able to favorite certain hikes into their journal and make personalized notes about that hike.

## Table of Contents
* [General Info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Live Demo](#live-demo)
* [API Sample Responses](#api-sample-responses)

## General Info

On the home page you will be given a form to input a specified location along with the radius you want hikes to be displayed within. Once you submit the form, you will be redirected to a page that lists the hikes within that radius along with a map that displays where the hiking trails are located. 

You are then able to select and view details regarding specific hiking trails and even add them to your favorites. Within your favorites, you are able to modify information regarding the trail and make specific notes for yourself that you are able to refer to in the future.

## Technologies
- EJS version: 2.7.4
- Express version: 4.17.1
- SuperAgent version: 5.1.0
- pg version: 7.13.0
- Cors version: 2.8.5
- Dotenv version: 8.2.0
- MethodOverride version: 3.0.0

### API Library

- Hiking Project API
- Google Maps Geocode API

## Setup
To run this project locally, setup ENV dependencies and install with npm:

```
$ cd HappyTrails
$ npm install
$ npm start
```
### ENV Setup
```
* PORT = ___
* DATABASE_URL = "postgres://{YourUserName}:{YourPassword}@{YourHost}:5432/{YourDatabase}"
* GEOCODE_API_KEY = ____
* HIKING_PROJECT_API_KEY = ___
```
### Database Schema
```
DROP TABLE IF EXISTS trail;

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
```

## Live Demo
Here is the live demo: https://hidden-journey-10074.herokuapp.com/

## API Sample Responses:
```

Google Maps
Location - longitude and latitude
https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
Example:
{
"results" : [
{
  "address_components" : [
      {
        "long_name" : "1600",
        "short_name" : "1600",
        "types" : [ "street_number" ]
      },
      {
        "long_name" : "Amphitheatre Parkway",
        "short_name" : "Amphitheatre Pkwy",
        "types" : [ "route" ]
      },
      {
        "long_name" : "Mountain View",
        "short_name" : "Mountain View",
        "types" : [ "locality", "political" ]
      },
      {
        "long_name" : "Santa Clara County",
        "short_name" : "Santa Clara County",
        "types" : [ "administrative_area_level_2", "political" ]
      },
      {
        "long_name" : "California",
        "short_name" : "CA",
        "types" : [ "administrative_area_level_1", "political" ]
      },
      {
        "long_name" : "United States",
        "short_name" : "US",
        "types" : [ "country", "political" ]
      },
      {
        "long_name" : "94043",
        "short_name" : "94043",
        "types" : [ "postal_code" ]
      }
  ],
  "formatted_address" : "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
  "geometry" : {
      "location" : {
        "lat" : 37.4267861,
        "lng" : -122.0806032
      },
      "location_type" : "ROOFTOP",
      "viewport" : {
        "northeast" : {
            "lat" : 37.4281350802915,
            "lng" : -122.0792542197085
        },
        "southwest" : {
            "lat" : 37.4254371197085,
            "lng" : -122.0819521802915
        }
      }
  },
  "place_id" : "ChIJtYuu0V25j4ARwu5e4wwRYgE",
  "plus_code" : {
      "compound_code" : "CWC8+R3 Mountain View, California, United States",
      "global_code" : "849VCWC8+R3"
  },
  "types" : [ "street_address" ]
}
],
"status" : "OK"
}

Hiking Get Trails
https://www.hikingproject.com/data
longitude, latitude and miles from Search
https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=YOUR_API_KEY

Example:
{
"trails": [
{
"id": 7000130,
"name": "Bear Peak Out and Back",
"type": "Featured Hike",
"summary": "A must-do hike for Boulder locals and visitors alike!",
"difficulty": "blueBlack",
"stars": 4.6,
"starVotes": 109,
"location": "Boulder, Colorado",
"url": "https:\/\/www.hikingproject.com\/trail\/7000130\/bear-peak-out-and-back",
"imgSqSmall": "https:\/\/cdn-files.apstatic.com\/hike\/7005382_sqsmall_1554312030.jpg",
"imgSmall": "https:\/\/cdn-files.apstatic.com\/hike\/7005382_small_1554312030.jpg",
"imgSmallMed": "https:\/\/cdn-files.apstatic.com\/hike\/7005382_smallMed_1554312030.jpg",
"imgMedium": "https:\/\/cdn-files.apstatic.com\/hike\/7005382_medium_1554312030.jpg",
"length": 5.7,
"ascent": 2541,
"descent": -2540,
"high": 8342,
"low": 6103,
"longitude": -105.2755,
"latitude": 39.9787,
"conditionStatus": "All Clear",
"conditionDetails": "",
"conditionDate": "2019-08-10 16:37:58"
}
```

## Collaborators
- Trevor Thompson
- Natalie Alway
- Mark Swearingen
- Conor McCue
