$(document).ready(function () {
  console.log('HERE');
  $('#addWeekExceptionButton').click(function () {
    var year = $('#yearInput').val();
    var week = $('#weekInput').val();
    $.ajax({
      url: '/restapi/weekexception',
      type: 'PUT',
      data: {year: year, week: week}
    }).done(function () {
      console.log(arguments);
      
    });
  });
});