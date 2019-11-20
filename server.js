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
app.post('/trails', saveTrail);
// app.get('/trails/:id', getOneTrail);
// app.put('/trails/:id', updateTrail);
// app.delete('/trails/:id', deleteTrail);
// app.get('/favorites', getTrails);


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
  const SQL = 'INSERT INTO trail(name, summary, trail_id, difficulty, stars, img_small, latitude, longitude,length, conditionstatus, conditiondetails) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
  let values = Object.values(this);
  return client.query(SQL, values)
  .then(res => {
    console.log(res);
    return res;
  }) 
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
}

function getLocationObjectForm(req, res){
  const locationHandler = {
    query: req.query.data,

    cacheHit: (results) => {
      console.log('Got data from DB');
      res.send(results.rows[0]);
    },
    cacheMiss: () => {
      console.log('No data in DB, fetching...');
      Location.getLocation(req.query.data)
        .then( data => res.send(data));
    }
  };
  Location.lookup(locationHandler);
  return client.query(SQL, values)
    .then(response.redirect(`/trails/${request.params.id}`))
    .catch(err => console.error(err));
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
