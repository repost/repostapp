
this.statusBar = function() {
    this.checkStatus = function(links, accounts) {
        var online = false;
        var offline = false;

        // create account tree
        for(var i=0; i<accounts.length; i++) {
            if(accounts[i].status == "online") {
                online = true;
            }
            else {
                offline = true;
            }
            if ( online && offline ) {
                $("#repostMenu .statusCircle").css('background','#FCA923');
            }
            else if ( online ) {
                $("#repostMenu .statusCircle").css('background','#23FC40');
            }
            else if ( offline ) {
                $("#repostMenu .statusCircle").css('background','#FC4023');
            }
        }
        // create link tree
        for(var i=0; i<links.length; i++) {
            if(links[i].status == "online") {
            }
            else if(links[i].status == "reposter") {
            }
            else{
            }
        }
    }
}

