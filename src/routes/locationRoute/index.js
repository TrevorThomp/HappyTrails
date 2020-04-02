'use strict';

const express = require('express');
const locationRouter = express.Router();
const superagent = require('superagent');
const Trail = require('../../models/trail');
const Location = require('../../models/location');

locationRouter.get('/location', getLocation)

// Parses through data and creates map markers for map API
function mapMaker(list){
  return list.reduce((staticMapURL, object) => {
    if (list.indexOf(object) + 1 !== list.length) staticMapURL += object.latitude.toString() + ',' + object.longitude.toString() + '|';
    else staticMapURL += object.latitude.toString() + ',' + object.longitude.toString() + `&key=${process.env.GEOCODE_API_KEY}`;
    return staticMapURL;
  }, 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=terrain&markers=color:green|');
}

// Hiking Project API Pull
function makeList(latitude,longitude,maxDistance){
  const hikeURL = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=${maxDistance}&maxResults=10&key=${process.env.HIKING_PROJECT_API_KEY}`;
  return superagent.get(hikeURL)
    .then( hikeAPICallResult => {
      return hikeAPICallResult.body.trails.map(trailObject => new Trail(trailObject));
    })
    .catch(err => console.error(err));
}

// Convert location to lat/lon and pulls from APIS to render data
function getLocation(req,res){
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`
  const everythingYouCouldEverWant = {};
  return superagent.get(geocodeUrl)
    .then( result => {
      return new Location(req.query.data, result.body.results[0]);
    })
    .then( location => {
      everythingYouCouldEverWant.location = location;
      return makeList(location.latitude, location.longitude, req.query.maxMiles);
    })
    .then( list => {
      everythingYouCouldEverWant.list = list;
      return mapMaker(list);
    })
    .then(staticMapURL => {
      everythingYouCouldEverWant.staticMapURL = staticMapURL;
      res.render('pages/results', {data: everythingYouCouldEverWant});
    })
    .catch(err => console.error(err));
}

module.exports = locationRouter;