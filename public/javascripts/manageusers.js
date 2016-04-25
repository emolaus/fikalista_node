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
  $('#selectUserToEdit').change(function () {
    var userid = $(this).val();
    if (!userid) {
      $('#editName').val("");
      $('#editEmail').val("");
      return;
    }
    var newName = $('#editName').val();
    var newEmail = $('#editEmail').val();
    $.ajax({
      url: '/user/' + groupurl + '/' + userid + '/' + newName + '/' + newEmail,
      type: 'PUT'
    }).done(function (error){
      if (!error) location.reload();
      else console.log(error);
    });
    
  });
});