'use strict'

$('#button-submit').on('submit', submitListener);

function submitListener(event){
  event.preventDefault();
  let locationQueryString = $('#input-search').val.toLowerCase();
  console.log(locationQueryString);
  $.ajax('http://localhost:3000/location',{
    data: {data: locationQueryString}
  })
    .then( trails => {
      console.log('trails',trails);
    })
}
