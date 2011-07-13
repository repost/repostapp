
this.account = function(){
    var proto;
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
        cell.innerHTML = "Type";
        cell = row.insertCell(0);
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
        var accttype = document.createElement("div");
        cell.appendChild(accttype);
        accttype.className = "acctListtype";
        accttype.innerHTML = account.type;
 
        cell = row.insertCell(0);
        var acctname = document.createElement("div");
        cell.appendChild(acctname);
        acctname.className = "acctListusername";
        acctname.innerHTML = account.username;
        
        cell = row.insertCell(0);
        var enabled = document.createElement("input");
        cell.appendChild(enabled);
        enabled.type = "checkbox";
        enabled.checked = account.enabled;
        enabled.className = "acctListenabled";
        enabled.onclick = function(e){
            accts[e.currentTarget.parentNode.parentNode.rowIndex - 1].enabled = this.checked;
            saveAccountList();
        }

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

    this.save = function(){
        saveAccounts(al.getAll());
    }

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
    var type;

    this.createPopup = function(){

        popup = document.createElement("div");
        popup.className = "addAcctPopup";
        
        username = document.createElement("input");
        username.type = "textbox";

        password = document.createElement("input");
        password.type = "password";

        type = document.createElement("select");
        type.name = "Account Type";
        var acctype = document.createElement('option');
        acctype.value = 'Gtalk';
        acctype.appendChild(document.createTextNode('Gtalk'));
        type.appendChild(acctype);
        acctype = document.createElement('option');
        acctype.value = 'XMPP';
        acctype.appendChild(document.createTextNode('XMPP'));
        type.appendChild(acctype);

        var add = document.createElement("button");
        add.innerText = "Add";
        add.onclick = this.addFromPopup(this);

        var cancel = document.createElement("button");
        cancel.innerText = "Cancel";       
        cancel.onclick = this.clearPopup(this);

        popup.appendChild(username);
        popup.appendChild(password);
        popup.appendChild(type);
        popup.appendChild(add);
        popup.appendChild(cancel);
    };

    this.username = function(){
        return username.value;
    };

    this.password = function(){
        return password.value;
    };

    this.type = function(){
        return type.value;
    };

    this.getPopup = function(){
        return popup;
    };
 
    this.deleteMe = function(){
        popup.parentNode.removeChild(popup);
    };

    this.addFromPopup = function(popup){
       return function(e){
           var acc = new account();
           acc.username = popup.username();
           acc.password = popup.password();
           acc.type = popup.type();
           acc.enabled="true";
           al.addAcct(acc);
           saveAccountList();
           popup.deleteMe();
       };
    };

    this.clearPopup = function(popup){
        return function(){
            popup.deleteMe();
        };
    };

    this.createPopup();
};

function modifyAccount(pos){
};

function delAccount(pos){
    
};

function saveAccountList(){
    al.save();
    // Update status to let user know options were saved.
    stat.innerHTML = "Shit Saved.";
    setTimeout(function() {
      stat.innerHTML = "";
    }, 750);

};

function accountDisplay() {
    opt = document.getElementById("mainview");

    var h1 = document.createElement("h1");
    h1.innerText = "Accounts";
    opt.appendChild(h1);

    // Create account list
    al = new acctList();
    opt.appendChild(al.createList());

    // Add button
    var addAcct = document.createElement("button");
    addAcct.className = "acctListButtons";
    addAcct.onclick = function(event){
        var aap = new addAcctPopup();
        var r = aap.getPopup();
        r.style.top = "0px";
        r.style.left = "0px";
        document.body.appendChild(r);
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
        var pos = al.selected();
        if( pos != null){
            al.removeAcct(pos);
            saveAccountList();
        }   
    };
    opt.appendChild(delAcct);

    // Status placeholder
    stat = document.createElement("div");
    stat.className = "acctListstatus";
    opt.appendChild(stat);

    // Get the current accounts
    var accts = loadAccounts();
    for(var i=0, len = accts.length; i<len; i++){
        al.addAcct(accts[i]);
    }
};

function otherCrapDisplay() {
    $("#mainview").empty();
};
function otherOtherCrapDisplay() {
    $("#mainview").empty();
};


var al; // account list
var stat; // account list status
var opt;
function main(){
    $("#accountsPageNav").click(accountDisplay);
    $("#otherPageNav").click(otherCrapDisplay);
    $("#otherOtherPageNav").click(otherOtherCrapDisplay);
    accountDisplay();
};

