'use strict';

$('.select-button').on('click', function() {
  event.preventDefault()
  $('#hidden-form').removeClass('hide-me');
});

$('.btn-update').on('click', function() {
  event.preventDefault()
  $('#hidden-form').removeClass('hide-me');
});
