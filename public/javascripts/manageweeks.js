$(document).ready(function () {
  // var groupurl injected from jade
  $('#addWeekExceptionButton').click(function () {
    var year = $('#yearInput').val();
    var week = $('#weekInput').val();
    $.ajax({
      url: '/weekexception/'+ groupurl + '/' + year + '/' + week,
      type: 'PUT'
    }).done(function (error) {
      if (!error) location.reload();
      else console.log(error);
    });
  });
  $('.deleteWeek').click(function () {
    var weekid = $(this).data('id');
    $.ajax({
      url: '/weekexception/' + groupurl + '/' + weekid,
      type: 'DELETE'
    }).done(function (error){
      if (!error) location.reload();
      else console.log(error);
    });
    
  });
});