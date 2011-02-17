
this.account = function(){
    var username;
    var password;
    var id;
    var enabled;
};

this.acctList = function(){

    var table;
    var count = 0;
    var selected;
    var accts = new Array();
    
    this.createList = function(){
        table = document.createElement("table");
        var row = table.createTHead().insertRow(0); // Heading
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
        row.className = "acctListItem";
        row.onclick = function(e){
            al.select(e.currentTarget.rowIndex);
        };
        var cell = row.insertCell(0);
        var acctname = document.createElement("div");
        cell.appendChild(acctname);
        acctname.className = "acctListusername";
        acctname.innerHTML = account.username;
        
        cell = row.insertCell(0);
        var enabled = document.createElement("input");
        cell.appendChild(enabled);
        enabled.type = "checkbox";
        enabled.checked = (account.enabled == "1");
        enabled.className = "acctListenabled";

        count++;
    };

    this.removeAcct = function(pos){
        this.clearSelected();
        accts.splice(pos-1,1); //splice entry out
        table.deleteRow(pos);
        count--;
    };
    
    this.selected = function(){
        return selected;
    };

    this.get = function(pos){
        return accts[pos];
    };

    this.getAll = function(){
        return accts;
    };

    this.clearSelected = function(){
        if( selected != null ){
          table.rows[selected].className = "acctListItem";
        }
        selected = null;
    };

    this.select = function(pos){
        var wasselected = selected;
        this.clearSelected();
        if( wasselected != pos ){
            selected = pos;
            table.rows[pos].className = "acctListSelectedItem";
        }
    };

};

this.addAcctPopup = function(){
    
    var popup;
    var username;
    var password;

    this.createPopup = function(){

        popup = document.createElement("div");
        popup.className = "addAcctPopup";
        
        username = document.createElement("input");
        username.type = "textbox";

        password = document.createElement("input");
        password.type = "password";

        var add = document.createElement("button");
        add.innerText = "Add";
        add.onclick = this.addFromPopup(this);

        var cancel = document.createElement("button");
        cancel.innerText = "Cancel";       
        cancel.onclick = function(e){
            clearPopup(e);
        };

        popup.appendChild(username);
        popup.appendChild(password);
        popup.appendChild(add);
        popup.appendChild(cancel);
    };

    this.username = function(){
        return username.value;
    };

    this.password = function(){
        return password.value;
    };

    this.getPopup = function(){
        return popup;
    };

    this.addFromPopup = function(popup){
       return function(e){
           var acc = new account();
           acc.username = popup.username();
           acc.password = popup.password();
           acc.enabled="1";
           al.addAcct(acc);
           saveAccounts();
           //delete e.currentTarget.parentNode;
       };
    };
   
    this.createPopup();
};
       
function clearPopup(e){
    //delete e.currentTarget.parentNode;
};

function saveAccounts(){
    localStorage["repostaccounts"] = JSON.stringify(al.getAll());

    // Update status to let user know options were saved.
    stat.innerHTML = "Shit Saved.";
    setTimeout(function() {
      stat.innerHTML = "";
    }, 750);
};

function modifyAccount(pos){
};

function delAccount(pos){
    if( pos != null){
        al.removeAcct(pos);
        saveAccounts();
    }
};

var al; // account list
var stat; // account list status
var opt;
function load_options(){

    opt = document.getElementById("repostoptions");

    // Create account list
    al = new acctList();
    opt.appendChild(al.createList());

    // Add button
    var addAcct = document.createElement("button");
    addAcct.className = "acctListButtons";
    addAcct.onclick = function(){
        var aap = new addAcctPopup();
        var r = aap.getPopup();
        opt.appendChild(r);
    };
    addAcct.innerText = "Add";
    opt.appendChild(addAcct);

    // Modify Account
    var modifyAcct = document.createElement("button");
    modifyAcct.className = "acctListButtons";
    modifyAcct.innerText = "Modify";
    modifyAcct.onclick = function () {
        modifyAccount(al.selected());
    };
    opt.appendChild(modifyAcct);

    // Delete Account
    var delAcct = document.createElement("button");
    delAcct.className = "acctListButtons";
    delAcct.innerText = "Delete";
    delAcct.onclick = function(){
        delAccount(al.selected());
    };
    opt.appendChild(delAcct);

    // Status placeholder
    stat = document.createElement("div");
    stat.className = "acctListstatus";
    opt.appendChild(stat);

    // Get saved accounts from local storage
    var as = localStorage["repostaccounts"];
    if( as != null ){
        var accts = JSON.parse(as);
        for(var a in accts){
            al.addAcct(a);
        }
    }
};

