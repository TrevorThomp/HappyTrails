'use strict';

// dotenv Configuration
require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
// const bodyParser = require('body-parser');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override')
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database Connection
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

// Middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// View Engine
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

// API Routes
app.get('/', (request,response) => {
  response.render('index')
})

app.get('/location', getLocation);
app.get('/trailList', trailListHandler);
app.get('/mapMaker', mapMakerHandler);
app.get('/about', aboutHandler);
// app.get('/searches/new', newSearch);
// app.post('/searches', createSearch);
// app.post('/trails', createTrail);
// app.get('/trails/:id', getOneTrail);
// app.put('/trails/:id', updateTrail);
// app.delete('/trails/:id', deleteTrail);
app.get('/favorites', getTrails);


// Trail Constructor
function Trail(data) {
  const placeholder = 'https://i.imgur.com/iaV1Lp0.jpg';
  let httpRegex = /^(http:\/\/)/g

  this.name = data.name ? data.name : 'No name available';
  this.summary = data.summary ? data.summary : 'No summary available';
  this.trail_id = data.id;
  this.difficulty = data.difficulty ? data.difficulty : 'No difficulty available';
  this.stars = data.stars ? data.stars : '';
  this.imgSmallMed = data.imgSmallMed ? data.imgSmallMed.replace(httpRegex, 'https://') : placeholder;
  this.latitude = data.latitude;
  this.longitude = data.longitude;
  // TODO:// Is length going to work here as a property name or do we need to use bracket notation because of keyword overlap?
  this.length = data.length ? data.length : 'No length available';
  this.conditionStatus = data.conditionStatus ? data.conditionStatus : 'No condition status available';
  this.conditionDetails = data.conditionDetails ? data.conditionDetails : 'No condition details';
}

// Location Constructor
function Location(query, data) {
  this.search_query = query;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

//Helper Functions
function makeTrails(latitude,longitude){
  const hikeURL = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&maxResults=20&key=${process.env.HIKING_PROJECT_API_KEY}`;
  return superagent.get(hikeURL)
    .then( hikeAPICallResult => {
      return hikeAPICallResult.body;
    })
    .catch(error => console.error(error));
}

function getTrailMarkers(trailAPIResponse){
  let moddedData = trailAPIResponse.map( trail => ({latitude: trail.latitude.toString(), longitude: trail.longitude.toString()}));
  console.log('moddedData',moddedData);
  return moddedData;
}


// Middleware
function getLocation(req,res){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`
  return superagent.get(url)
    .then( result => {
      return new Location (req.query.location, result.body.results[0]);
    })
    .then( location => {
      res.redirect(`/trailList?latitude=${location.latitude}&longitude=${location.longitude}`);
    })
    .catch(error => console.error(error));
}


function trailListHandler(req, res){
  makeTrails(req.query.latitude,req.query.longitude)
    .then( listOfTrails => {
      return getTrailMarkers(listOfTrails.trails);
    })
    .then( url => {
      res.redirect(`/mapMaker?url=${JSON.stringify(url)}&location=${req.query.latitude},${req.query.longitude}`);
    })
    .catch(err => console.error(err));
}

function mapMakerHandler(req,res){
  let staticMapURL = 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=terrain&markers=color:green|';
  console.log('requrl',req.query.url);
  let parsed = JSON.parse(req.query.url);
  parsed.forEach( trailObj => {
    if (parsed.indexOf(trailObj) + 1 !== parsed.length) staticMapURL += trailObj.latitude.toString() + ',' + trailObj.longitude.toString() + '|';
    else {
      staticMapURL += trailObj.latitude.toString() + ',' + trailObj.longitude.toString() + `&key=${process.env.GEOCODE_API_KEY}`;
    }
  })
  console.log('end of chain');
  let answer = {url: staticMapURL, location: req.query.location, trailList: parsed};
  res.send(answer) ;

function deleteTrail(request,response){
  let SQL = 'DELETE FROM trail where id = $1';
  let value = [request.params.id];
  return client.query(SQL, value)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}

function getTrails(request, response){
  let SQL = 'SELECT * FROM trial';
  return client.query(SQL)
    .then(response.redirect('/favorites'))
    .catch(err = handleError(err, response));
}

function updateTrail(request,response){
  let SQL = 'UPDATE TABLE trail SET $2 = $3 WHERE id = $1';
  let values = [request.params.id, request.params.column, request.params.new_value];//replace column with fieldname and new_value with unput value from user/form
  return client.query(SQL, values)
    .then(response.redirect(`/trails/${request.params.id}`))
    .catch(err => handleError(err, response));
}

// Error Handler
function handleError(error,response) {
  response.render('error', {error: error})
}

// About Us Page
function aboutHandler(request,response) {
  response.render('pages/about');
}

// Application Listener
app.listen(PORT, console.log(`Listening on Port: ${PORT}`))