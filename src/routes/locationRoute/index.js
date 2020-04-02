'use strict';

const express = require('express');
const locationRouter = express.Router();
const superagent = require('superagent');
const Trail = require('../../models/trail');
const Location = require('../../models/location');

locationRouter.get('/location', getLocation)

/**
 * Parses data and creates map markers
 * @param {Array} list 
 * @returns {String} URL of static map markers
 */
function mapMaker(list){
  console.log(list)
  return list.reduce((staticMapURL, object) => {
    if (list.indexOf(object) + 1 !== list.length) staticMapURL += object.latitude.toString() + ',' + object.longitude.toString() + '|';
    else staticMapURL += object.latitude.toString() + ',' + object.longitude.toString() + `&key=${process.env.GEOCODE_API_KEY}`;
    return staticMapURL;
  }, 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=terrain&markers=color:green|');
}

/**
 * Pulls list of trails from the Hiking Project API
 * @param {String} latitude 
 * @param {String} longitude 
 * @param {Number} maxDistance 
 * @returns {Array} Contains list of trails within specified distance
 */
function makeList(latitude,longitude,maxDistance){
  const hikeURL = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=${maxDistance}&maxResults=10&key=${process.env.HIKING_PROJECT_API_KEY}`;
  return superagent.get(hikeURL)
    .then( hikeAPICallResult => {
      return hikeAPICallResult.body.trails.map(trailObject => new Trail(trailObject));
    })
    .catch(err => console.error(err));
}

/**
 * Converts location to latitude/longitude and renders API data into object
 * @param {*} req 
 * @param {*} res 
 * @returns {Object} Contains all API data for EJS rendering
 */
function getLocation(req,res){
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`
  const apiData = {};
  return superagent.get(geocodeUrl)
    .then( result => {
      return new Location(req.query.data, result.body.results[0]);
    })
    .then( location => {
      apiData.location = location;
      return makeList(location.latitude, location.longitude, req.query.maxMiles);
    })
    .then( list => {
      apiData.list = list;
      return mapMaker(list);
    })
    .then( staticMapURL => {
      apiData.staticMapURL = staticMapURL;
      res.render('pages/results', {data: apiData});
    })
    .catch(err => console.error(err));
}

module.exports = locationRouter;