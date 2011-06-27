function saveAccounts(accounts){
    localStorage["repostaccounts"] = JSON.stringify(accounts);
};

function loadAccounts(){
    // Get saved accounts from local storage
    var as = localStorage["repostaccounts"];
    var accts;
    if( as != null ){
        accts = JSON.parse(as);
    }
    return accts;
}
