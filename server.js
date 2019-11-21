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
app.post('/trails', saveTrail);
app.get('/trails/:id', getOneTrail);
app.put('/trails/:id', updateTrail);
app.delete('/trails/:id', deleteTrail);
app.get('/favorites', getTrails);
app.get('/about', aboutHandler);



// Trail Constructor
function Trail(data) {
  const placeholder = 'https://i.imgur.com/iaV1Lp0.jpg';
  let httpRegex = /^(http:\/\/)/g

  this.name = data.name ? data.name : 'No name available';
  this.summary = data.summary ? data.summary : 'No summary available';
  this.trail_id = data.id;
  this.difficulty = data.difficulty ? data.difficulty : 'No difficulty available';
  this.stars = data.stars ? data.stars : '';
  this.imgURL = data.imgSmallMed ? data.imgSmallMed.replace(httpRegex, 'https://') : placeholder;
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

Location.lookup = (handler) => {
  const SQL = 'SELECT * FROM locations WHERE search_query=$1';
  const values = [handler.query];
  return client.query(SQL, values)
    .then( results => {
      if (results.rowCount > 0){
        handler.cacheHit(results);
      }else {
        handler.cacheMiss();
      }
    })
    .catch(console.error);
}

Trail.prototype.save = function(){
  const SQL = 'INSERT INTO trail(name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id';
  let values = Object.values(this);
  return client.query(SQL, values);
}


function Campground(data){
  this.id = data.id;
  this.name = data.name;
  this.isBookable = data.isBookable;
  this.location = data.location;
  this.latitude = data.latitude;
  this.longitude = data.longitude;
  this.url = data.url;
  this.imgUrl = data.imgUrl;
  this.numCampsites = data.numCampsites;
}
//Helper Functions
function makeList(latitude,longitude,maxDistance,endpoint){
  const hikeURL = `https://www.hikingproject.com/data/${endpoint}?lat=${latitude}&lon=${longitude}&maxDistance=${maxDistance}&maxResults=10&key=${process.env.HIKING_PROJECT_API_KEY}`;
  return superagent.get(hikeURL)
    .then( hikeAPICallResult => {
      if(endpoint === 'get-trails') return hikeAPICallResult.body.trails.map(trailObject => new Trail(trailObject));
      else return hikeAPICallResult.body.campgrounds.map(campgroundObject => new Campground(campgroundObject));
    })
    .catch(err => console.error(err));
}

function mapMaker(list){
  return list.reduce((staticMapURL, object) => {
    if (list.indexOf(object) + 1 !== list.length) staticMapURL += object.latitude.toString() + ',' + object.longitude.toString() + '|';
    else staticMapURL += object.latitude.toString() + ',' + object.longitude.toString() + `&key=${process.env.GEOCODE_API_KEY}`;
    return staticMapURL;
  }, 'https://maps.googleapis.com/maps/api/staticmap?size=1000x1000&maptype=terrain&markers=color:green|');
}


// Middleware
function getLocation(req,res){
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=${process.env.GEOCODE_API_KEY}`
  const everythingYouCouldEverWant = {};
  return superagent.get(geocodeUrl)
    .then( result => {
      // TODO: change placement of location.save for async purposes | make helper function instead of object attached? | refactor resource middleware to be object oriented
      return new Location(req.query.data, result.body.results[0]);
    })
    .then( location => {
      everythingYouCouldEverWant.location = location;
      // console.log(everythingYouCouldEverWant)
      return makeList(location.latitude, location.longitude, req.query.maxMiles, req.query.endpoint);
    })
    .then( list => {
      // console.log(list)
      everythingYouCouldEverWant.list = list;
      return mapMaker(list);
    })
    .then(staticMapURL => {
      everythingYouCouldEverWant.staticMapURL = staticMapURL;
      // res.send(everythingYouCouldEverWant);
      res.render('pages/results', {data: everythingYouCouldEverWant});
    })
    .catch(err => console.error(err));
}

function saveTrail(req, res) {
  console.log(req.body);
  let trailDetails = new Trail(JSON.parse(req.body.object));
  trailDetails.save()
    .then(res.redirect('/favorites'));
}

function getTrails(request, response){
  let SQL = 'SELECT * FROM trail';
  return client.query(SQL)
    .then( results => response.render('pages/favorite', {trails: results.rows}))
    .catch(err =>handleError(err,response));
}

function getOneTrail(request,response) {
  let SQL = 'SELECT * FROM trail WHERE id=$1';

  let values = [request.params.id];

  return client.query(SQL, values)
    .then(result => response.render('pages/trails/detail', {result: result.rows[0]}))
    .catch(err => console.err(err))
}

function embedOneTrail(){
  let embedURL = `https://www.google.com/maps/embed/v1/place?key=AIzaSyB1mbQHleVvGLhxIg8zRtwHDk6d_OgzXk4&q=${q}`
  let q = 'Bend+Oregon';
//get search query for assignment to q.
}

function updateTrail(request,response){
  let { name, summary, difficulty, img_small, length} = request.body;
  let SQL = 'UPDATE trail SET name=$1, summary=$2, difficulty=$3, img_small=$4, length=$5 WHERE id=$6';
  let values = [name, summary, difficulty, img_small, length, request.params.id];

  return client.query(SQL, values)
    .then(response.redirect(`/trails/${request.params.id}`))
    .catch(err => console.error(err));
}

function deleteTrail(request,response){
  let SQL = 'DELETE FROM trail WHERE id=$1';
  let value = [request.params.id];


  return client.query(SQL, value)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}

// Error Handler
// function handleError(error,response) {
//   response.render('error', {error: error})
// }

// About Us Page
function aboutHandler(request,response) {
  response.render('pages/about');
}

// Application Listener
app.listen(PORT, console.log(`Listening on Port: ${PORT}`))
