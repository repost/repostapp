
this.account = function(){
    var username;
    var password;
    var id;
    var enabled;
};

this.acctList = function(){

    var table;
    var count = 0;
    var accts;
    
    this.createList = function(){
        var table = document.createElement("table");
        var row = table.insertRow(0); // Heading
        row.className = "acctListHeading";
        var cell = row.insertCell(0);
        cell.innerHTML = "Username";
        cell = row.insertCell(0);
        cell.innerHTML = "Enabled";
        return table;
    };

    this.addAcct = function(account){
        // Add to array
        accts[count] = account;

        // Add display
        var row = table.insertRow(count+1);
        var cell = row.insertCell(0);
        var acctname = document.createElement("div");
        cell.appendChild(acctname);
        acctname.className = "username";
        acctname.innerHTML = account.username;
        
        cell = row.insertCell(0);
        var enabled = document.createElement("checkbox");
        cell.appendChild(enabled);
        enabled.value = account.enabled;

        count++;
    };

    this.removeAcct = function(pos){
    };
    
    this.selected = function(){
    };

    this.get = function(pos){
    };

    this.getAll = function(){

    };

};

function saveAccounts(){
    localStorage["repostaccounts"] = JSON.stringify(al.getAll());
}

function addAccount(){
};

function modifyAccount(pos){
};

var al;
function load_options(){
    var opt = document.getElementById("repostoptions");
 
    // Create account list
    al = new acctList();
    opt.appendChild(al.createList());

    // Add button
    var addAcct = document.createElement("button");
    addAcct.className = "acctListButtons";
    addAcct.onclick = addAccount();
    addAcct.innerText = "Add";
    opt.appendChild(addAcct);

    // Modify Account
    var modifyAcct = document.createElement("button");
    modifyAcct.className = "acctListButtons";
    modifyAcct.innerText = "Modify";
    modifyAcct.onclick = modifyAccount(al.selected());
    opt.appendChild(modifyAcct);

    // Delete Account
    var delAcct = document.createElement("button");
    delAcct.className = "acctListButtons";
    delAcct.innerText = "Delete";
    delAcct.onclick = modifyAccount(al.selected());
    opt.appendChild(delAcct);

    // Get saved accounts from local storage
    var accts = JSON.parse(localStorage["repostaccounts"]);
    for(var a in accts){
        al.addAcct(a);
    }
}

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


