'use strict';

const express = require('express');
const trailRouter = express.Router();

trailRouter.post('/trails', saveTrail);
trailRouter.get('/trails/:id', getOneTrail);
trailRouter.put('/trails/:id', updateTrail);
trailRouter.delete('/trails/:id', deleteTrail);
trailRouter.get('/favorites', getTrails);

/**
 * Redirects client after saving trail to database
 * @param {*} req 
 * @param {*} res 
 */
function saveTrail(request, response) {
  let trailDetails = new Trail(JSON.parse(req.body.object));
  trailDetails.save()
    .then(response.redirect('/favorites'));
}

/**
 * Renders all saved trails from database
 * @param {*} request 
 * @param {*} response 
 */
function getTrails(request, response){
  let SQL = 'SELECT * FROM trail';
  return client.query(SQL)
    .then( results => response.render('pages/favorite', {trails: results.rows}))
    .catch(err =>handleError(err,response));
}

/**
 * Opens selected trail in detailed view
 * @param {*} request 
 * @param {*} response 
 */
function getOneTrail(request,response) {
  let SQL = 'SELECT * FROM trail WHERE id=$1';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then(result => response.render('pages/trails/detail', {result: result.rows[0]}))
    .catch(err => console.err(err))
}

/**
 * Updated selected trail information in database
 * @param {*} request 
 * @param {*} response 
 */
function updateTrail(request,response){
  let { name, summary, difficulty, img_small, length} = request.body;
  let SQL = 'UPDATE trail SET name=$1, summary=$2, difficulty=$3, img_small=$4, length=$5 WHERE id=$6';
  let values = [name, summary, difficulty, img_small, length, request.params.id];

  return client.query(SQL, values)
    .then(response.redirect(`/trails/${request.params.id}`))
    .catch(err => console.error(err));
}

/**
 * Deletes selected trail from database
 * @param {*} request 
 * @param {*} response 
 */
function deleteTrail(request,response){
  let SQL = 'DELETE FROM trail WHERE id=$1';
  let value = [request.params.id];

  return client.query(SQL, value)
    .then(response.redirect('/favorites'))
    .catch(err => handleError(err, response));
}

/**
 * Error Handler
 * @param {*} error 
 * @param {*} response 
 */
function handleError(error,response) {
  response.render('error', {error: error})
}

module.exports = trailRouter;