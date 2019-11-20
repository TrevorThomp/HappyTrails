'use strict';

// dotenv Configuration
require('dotenv').config();

// Application Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
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
// app.get('/searches/new', newSearch);
// app.post('/searches', createSearch);
// app.post('/trails', createTrail);
// app.get('/trails/:id', getOneTrail);
app.put('/trails/:id', updateTrail);
app.delete('/trails/:id', deleteTrail);
app.get('/favorites', getTrails);
app.get('/about', aboutHandler)


// Trail Constructor
function Trail(data) {
  const placeholder = 'https://i.imgur.com/iaV1Lp0.jpg';
  let httpRegex = /^(http:\/\/)/g

  this.name = data.name ? data.name : 'No name available';
  this.summary = data.summary ? data.summary : 'No summary available';
  this.difficulty = data.difficulty ? data.difficulty : 'No difficulty available';
  this.imgSmallMed = data.imgSmallMed ? data.imgSmallMed.replace(httpRegex, 'https://') : placeholder;
  this.latitude = data.latitude;
  this.longitude = data.longitude;
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
function makeTrailsList(latitude,longitude){
  const hikeURL = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&maxResults=20&key=${process.env.HIKING_PROJECT_API_KEY}`;

  return superagent
    .get(hikeURL)
    .then( hikeAPICallResult => {
      return hikeAPICallResult.body.trails;
    })
    .catch(handleError);
}

function getTrailMarkers(trailsList){
  return trailsList.reduce((staticMapURL, trailObject) => {
    if (trailsList.indexOf(trailObject) + 1 !== trailsList.length) staticMapURL += trailObject.latitude.toString() + ',' + trailObject.longitude.toString() + '|';
      else staticMapURL += trailObject.latitude.toString() + ',' + trailObject.longitude.toString() + `&key=${process.env.GEOCODE_API_KEY}`;
      return staticMapURL;
  }, 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=terrain&markers=color:green|');
}


// Middleware
function getLocation(req,res){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`
  const everythingYouCouldEverWant = {};


  return superagent
    .get(url)
    .then( result => {
      return new Location(req.query.data, result.body.results[0]);
    })
    .then( location => {
      everythingYouCouldEverWant.location = location;
      return makeTrailsList(location.latitude, location.longitude);
    })
    .then( trailsList => {
      everythingYouCouldEverWant.trailsList = trailsList;
      return getTrailMarkers(trailsList);
    })
    .then(staticMapURL => {
      everythingYouCouldEverWant.staticMapURL = staticMapURL;
      res.send(everythingYouCouldEverWant);
    })
    .catch(err => console.error(err));
}

function deleteTrail(request,response){
  let SQL = 'DELETE FROM trail WHERE id=$1';
  let value = [request.params.id];


  return client.query(SQL, value)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}

function getTrails(request, response){
  let SQL = 'SELECT * FROM trail';


  return client.query(SQL)
    .then( results => response.render('pages/favorites', {trails: results.rows}))
    .catch(err =>handleError(err,response));
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
