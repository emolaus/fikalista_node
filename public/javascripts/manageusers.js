$(document).ready(function () {

  $('#deleteUserButton').click(function () {
    var userid = $('#selectUserToDelete').val();
    console.log(userid);
    $.ajax({
      url: '/user/' + groupurl + '/' + userid,
      type: 'DELETE'
    }).done(function (error){
      if (!error) location.reload();
      else console.log(error);
    });
    
  });
});