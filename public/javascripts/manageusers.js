$(document).ready(function () {
  
  $('#addUserButton').click(function () { 
    var name = $('#addName').val();
    var email = $('#addEmail').val();
    $.ajax({
      url: '/adduser/' + groupurl + '/' + name + '/' + email,
      type: 'PUT'
    }).done(function (error){
      if (!error) location.reload();
    });
  });
  $('#deleteUserButton').click(function () {
    var userid = $('#selectUserToDelete').val();
    $.ajax({
      url: '/user/' + groupurl + '/' + userid,
      type: 'DELETE'
    }).done(function (error){
      if (!error) location.reload();
    });
  });
  $('#selectUserToEdit').change(function () {
    var userid = $(this).val();
    console.log(userid);
    if (!userid) {
      $('#editName').val("");
      $('#editEmail').val("");
      return;
    }
    // TODO set name, email
    var selectedOption = $(this).find(":selected");
    var name = selectedOption.data('name');
    var email = selectedOption.data('email');
    $('#editName').val(name);
    if (email != "null") $('#editEmail').val(email);
  });
  
  $('#editUserButton').click(function () {
    var newName = $('#editName').val();
    var newEmail = $('#editEmail').val();
    var userid = $('#selectUserToEdit').val();
    if (!userid) return;
    
    $.ajax({
      url: '/user/' + userid + '/' + newName + '/' + newEmail,
      type: 'PUT'
    }).done(function (error){
      if (!error) location.reload();
    });
  });
  
  $('#switchWeeksButton').click(function () {
    var selectedUser1 = $('#selectUser1').find(':selected');
    var selectedUser2 = $('#selectUser2').find(':selected');
    if (selectedUser1.val() == '' || selectedUser2.val() == '') return;
    $.ajax({
      url: '/restapi/switchweeks/'+ groupurl + '/' + selectedUser1.val() + '/' + selectedUser2.val(),
      type: 'PUT'
    }).done(function (error){
      if (!error) location.reload();
      else console.log(error);
    });
    
  });
});