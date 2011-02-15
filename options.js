function save_options(form) {
  localStorage["username"] = form.username.value;
  localStorage["password"] = form.password.value;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Shit Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var username = localStorage["username"];
  var password = localStorage["password"];
  var form = document.getElementById("form");
  form.username.value = username;
  form.password.value = password;
}


