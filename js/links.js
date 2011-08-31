// Begin the nastiness
// Settings for jit

this.linkVisual = function() {
    
    var linkBox; /* send that text */
    var displayed; /* Are we being displayed already? */
    var linkarr = new Array(); /* Array of link */
    var acctarr = new Array(); /* Array of accounts */
    var instance = this;
    var fd;
    var labelType = 'Native';
    var nativeTextSupport = true;
    var useGradients = true;
    var animate = true;
    var forcegraphset = 
    {
        //id of the visualization container
        injectInto: 'infovis',
        //Enable zooming and panning
        //by scrolling and DnD
        Navigation: {
                        enable: true,
                        //Enable panning events only if we're dragging the empty
                        //canvas (and not a node).
                        panning: 'avoid nodes',
                        zooming: 20 //zoom speed. higher is more sensible
                    },
        // Change node and edge styles such as
        // color and width.
        // These properties are also set per node
        // with dollar prefixed data-properties in the
        // JSON structure.
        Node: {
                overridable: true
               },
        Edge: {
                overridable: true,
                color: '#23A4FF',
                lineWidth: 1.4
              },
        //Native canvas text styling
        Label: {
                color: '#000',
                type: labelType, //Native or HTML
                size: 12,        
                font: "Abel", 
                style: 'bold'
               },
       //Add Tips
        Tips: {
                enable: true,
                onShow: function(tip, node) {
                        //count connections
                        var count = 0;
                        node.eachAdjacency(function() { count++; });
                        // Find account error string
                        var errorstr = "";
                        if(instance.isAccount(node)) {
                            for(count = 0; count < acctarr.length; count++) {
                                if(stripResource(acctarr[count].user) == node.name) {
                                    errorstr = acctarr[count].error;
                                }
                            }
                        }
                        //display node info in tooltip
                        tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"
                            + "<div class=\"tip-text\"><b>connections:</b> " + errorstr + "</div>";
                        }
              },
        // Add node events
        Events: {
                    enable: true,
                    //Change cursor style when hovering a node
                    onMouseEnter: function() {
                        fd.canvas.getElement().style.cursor = 'move';
                    },
                    onMouseLeave: function() {
                              fd.canvas.getElement().style.cursor = '';
                    },
                    //Update node positions when dragged
                    onDragMove: function(node, eventInfo, e) {
                            var pos = eventInfo.getPos();
                            node.pos.setc(pos.x, pos.y);
                            fd.plot();
                    },
                    //Implement the same handler for touchscreens
                    onTouchMove: function(node, eventInfo, e) {
                             $jit.util.event.stop(e); //stop default touchmove event
                             this.onDragMove(node, eventInfo, e);
                    },
                    //Add also a click handler to nodes
                    onClick: function(node, eventInfo, e) {
                             var pos = { x: e.clientX, y: e.clientY};
                             if(!node) return;
                             // Run Node handler
                             if(node.name == "you") {
                                 accountAdder(instance);
                             } else if (instance.isAccount(node)) {
                                 accountOptions(instance, node.id, pos);
                                 //linkAdder(instance, node.name);
                             } else {
                                 linkRemover(instance, node.name);
                             }
                         }
        },
        //Number of iterations for the FD algorithm
        iterations: 200,
        //Edge length
        levelDistance: 130,
        // Add text to the labels. This method is only triggered
        // on label creation and only for DOM labels (not native canvas ones).
        onCreateLabel: function(domElement, node){
                    },
        // Change node styles when DOM labels are placed
        // or moved.
        onPlaceLabel: function(domElement, node){
                              var style = domElement.style;
                              var left = parseInt(style.left);
                              var top = parseInt(style.top);
                              var w = domElement.offsetWidth;
                              style.left = (left - w / 2) + 'px';
                              style.top = (top + 10) + 'px';
                              style.display = '';
                          }
    };
    
    this.isAccount = function(node) {
        return (node.data.$reposttype == "account");
    };

    this.init = function(accts, links) {
	      var i;
				for(i=0; i < accts.length; i++) {
					this.addAccount(accts[i]);
				}
				for(i=0; i < links.length; i++) {
					this.addLink(links[i]);
				}
        displayed = false;
    };
    
    this.show = function() {
        if(displayed == false) {
            // Create linkbox dialog
            linkBox = $('<div>').addClass('linkbox')
                                .append($('<div>').attr('id','infovis'));
            linkBox.repostDialog({'modal': true,
                                'centred': false,
                                'draggable': false,
                                'closefunc': function() {
                                                linkBox.remove();
                                                displayed = false;
                                            }});
            $('#repost').append(linkBox);
            linkBox.repostDialog('show');
            // compute positions incrementally and animate.
            var tree = this.createTree(linkarr, acctarr);
            fd = new $jit.ForceDirected(forcegraphset);
            fd.loadJSON(tree);
            fd.computeIncremental({
                iter: 40,
                property: 'end',
                onStep:  function(perc){},
                onComplete: function(){
                    fd.animate({
                        modes: ['linear'],
                        transition: $jit.Trans.Elastic.easeOut,
                        duration: 2500
                    });
                }
            });
            displayed = true;
        }
    };
 
    this.createTree = function(links, accts) {
        var foundhost = false;
        var linklen = links.length;
        var acctlen = accts.length;
        var linktree = new Array();
        var acctree = new Array();
        
        // create you at the center
        var acctyou = {user: "you", host: "you", status: "you"};
        var you = this.createAcctElement(acctyou);
        acctree.push(you);

        // create account tree
        for(var i=0; i<acctlen; i++) {
            var treeobj = this.createAcctElement(accts[i]);
            acctree.push(treeobj);
            var adjobj = this.createAdjacency(stripResource(accts[i].user));
            you.adjacencies.push(adjobj);
        }
        // create link tree
        for(var i=0; i<linklen; i++) {
            for(var x=0; x<acctree.length; x++) {
                if(acctree[x].id == stripResource(links[i].host)) {
                    var treeobj = this.createLinkElement(links[i]);
                    var adjobj = this.createAdjacency(links[i].name);
                    acctree[x].adjacencies.push(adjobj);
                    linktree.push(treeobj);
                }
            }
        }
        // make a tree
        // check if accounts are links and delete
        for(var i=0; i<linktree.length; i++){
            for(var x=0; x<acctree.length; x++){
                if(linktree[i].name == acctree[x].name){
                    linktree.splice(i,1);
                    i = 0; /* size can change so to the begining */
                }
            }
        }
        return acctree.concat(linktree);
    };
   
    this.createLinkElement = function(link) {
        if(link.status == "online"){
            var obj = {
                $reposttype: "link",
                $color:  "#C74243",
                $type:  "circle",
                $dim:  15
            };
        }else if(link.status == "reposter"){
            var obj = {
                $reposttype: "link",
                $color:  "#00BB3F",
                $type:  "circle",
                $dim:  15
            };
        }else if(link.status == "offline"){
            var obj = {
                $reposttype: "link",
                $color:  "#777777",
                $type:  "circle",
                $dim:  15
            };
        }

        return {
                name: link.name,
                id: link.name,
                data: obj,
                adjacencies: new Array()
            };
    };

    this.createAcctElement = function(account) {
        if(account.status == "online"){
            var obj = {
                $reposttype: "account",
                $color:  "#EBB056",
                $type:  "circle",
                $dim:  25
            };
        }else if(account.status == "offline"){
            var obj = {
                $reposttype: "account",
                $color:  "#777777",
                $type:  "circle",
                $dim:  15
            };
        }else if(account.status == "you"){
            var obj = {
                $reposttype: "account",
                $color:  "#EBB056",
                $type:  "circle",
                $dim:  30
            };
        }

        return {
                name: stripResource(account.user),
                id: stripResource(account.user),
                data: obj,
                adjacencies: new Array()
            };
    };
    
    this.addLink = function(link) {
        // Does link already exist in array
        var i;
        var found = false;
        for(i = 0; i < linkarr.length; i++) {
            if(linkarr[i].name == link.name) {
                found = true;
            }
        }
        if(!found) {
            linkarr.push(link);
            // Do we need to display
            if(displayed) {
                var treeobj = this.createLinkElement(link);
                var adj = this.createAdjacency(stripResource(link.host));
                fd.graph.addNode(treeobj);
                fd.graph.addAdjacence(fd.graph.getNode(stripResource(link.host)),
                                fd.graph.getNode(link.name), adj.data);
                fd.computeIncremental({
                    iter: 40,
                    property: 'end',
                    onStep:  function(perc){},
                    onComplete: function(){
                        fd.animate({
                            modes: ['linear'],
                            transition: $jit.Trans.Elastic.easeOut,
                            duration: 2500
                        });
                    }
                });
            }
        }
    };

    this.linkStatusChanged = function(link) {
        var i;
        var found = false;
        console.log("Link " + link.name + " status " + link.status);
        for(i = 0; i < linkarr.length; i++) {
            if(linkarr[i].name == link.name) {
                linkarr[i].status = link.status;
                // If we are displayed we need to update
                if( displayed ) {
                    var node = fd.graph.getNode(link.name);
                    var newnode = this.createLinkElement(link);
                    if(node) {
                        node.setData('color', newnode.$color, 'end');  
                        fd.fx.animate({  
                            modes: ['node-property:color'],
                            duration: 500  
                        });
                    }
                    found = true;
                }
            }
        }
        if( !found ) {
            this.addLink(link);
        }
    };

		this.removeLink = function(user) {
        if(user != "") {
					var i;
					for( i=0; i < linkarr.length; i++) {
						if(linkarr[i].name == user) {
							linkarr.splice(i,1);
						}
					}
					this.removeId(user);
        }
    };

    this.removeId = function(user) {
        if(user != "") {
            var node = fd.graph.getNode(user);
            node.setData('alpha', 0, 'end');  
            node.eachAdjacency(function(adj) {  
                    adj.setData('alpha', 0, 'end');  
                });  
            fd.animate({  
                    modes: ['node-property:alpha',  
                    'edge-property:alpha'],  
                    duration: 500  
                });  
            fd.graph.removeNode(node.id);
        }
    };

    this.addAccount = function(account) {
        // Does link already exist in array
        var i;
        var found = false;
        for(i = 0; i < acctarr.length; i++) {
            if(stripResource(acctarr[i].user) == stripResource(account.user)) {
                found = true;
            }
        }
        if(!found) {
            acctarr.push(account);
            if(displayed) {
                var treeobj = this.createAcctElement(account);
                var adj = this.createAdjacency(stripResource(account.user));
                fd.graph.addNode(treeobj);
                fd.graph.addAdjacence(fd.graph.getNode("you"),
                                fd.graph.getNode(account.user), adj.data);
                fd.computeIncremental({
                    iter: 40,
                    property: ['end', 'start', 'current'],
                    onStep:  function(perc){},
                    onComplete: function(){
                        fd.fx.animate({
                            modes: ['linear'],
                            transition: $jit.Trans.Elastic.easeOut,
                            duration: 2500
                        });
                    }
                });
            }
        }
    };

    this.statusChanged = function(account) {
        var i;
        var found = false;
        console.log("Account " + account.user + " status " + account.status);
        for(i = 0; i < acctarr.length; i++) {
            if(stripResource(acctarr[i].user) == stripResource(account.user)) {
                acctarr[i].status = account.status;
                if(displayed) {
                    var node = fd.graph.getNode(stripResource(account.user));
                    var newnode = this.createAcctElement(account);
                    if(node) {
                        node.setData('color', newnode.$color, 'end');  
                        //node.setData('dim', newnode.$dim, 'end');  
                        fd.computeIncremental({
                                iter: 40,
                                property: 'end',
                                onStep:  function(perc){},
                                onComplete: function(){
                                    fd.fx.animate({  
                                        modes: ['node-property:color', 'node-property:dim'],
                                        duration: 500  
                                    });
                                }
                        });
                    }
                }
                found = true;
            }
        }
        if(!found) {
            this.addAccount(account);
        }
    };

    this.removeAccount = function(user) {
        var i = 0;
        // Remove account from array
        for( i = 0; i < acctarr.length; i++) {
                if( stripResource(acctarr[i].user) == stripResource(user) ) {
                        acctarr.splice(i,1);
                }
        }
        // Remove links from array
        for( i = linkarr.length - 1;  i >= 0; i--) {
                if( stripResource(linkarr[i].host) == stripResource(user) ) {
                        this.removeLink(linkarr[i].name);
                        linkarr.splice(i,1);
                }
        }
        this.removeId(user);
    };

    this.accountDisconnected = function(account, reason) {
        var i;
        console.log("Account " + account.user + " " + reason);
        for(i = 0; i < acctarr.length; i++) {
            if(stripResource(acctarr[i].user) == stripResource(account.user)) {
                acctarr[i].error = reason;
            }
        }
    };

    this.createAdjacency = function(nodeto){
        return {
           data: { color: "#909291"},
           nodeTo: nodeto
        };
    };

    this.remove = function(){
        linkBox.remove();
    };
};

function stripResource(account){
    return account.replace(/\/.*$/g,"");
};

this.accountOptions = function(display, acct, coords){

    var dialog;
    var input;
    var account = acct;
    var cbdisplay = display;
    var instance = this;

    this.init = function(){
        var la = this;
        dialog = $('<div>').addClass('accountoptions')
                    .append($('<div>Add Link</div>')
                                        .addClass('menuopt')
                                        .click($.proxy(la.addLink, la)))
                    .append($('<div>Remove Account</div>')
                                        .addClass('menuopt')
                                        .click($.proxy(la.removeAccount, la)))
                    .repostDialog({modal: false, centred: false});
       $('#repost').append(dialog);
       dialog.repostDialog('show', coords.x, coords.y);
    };

    this.removeAccount = function(){
        accountRemover(display, acct);
        dialog.remove();
    };

    this.addLink = function(){
        linkAdder(display, acct);
        dialog.remove();
    };

    this.init();
};

this.linkAdder = function(display, acct){

    var dialog;
    var input;
    var account = acct;
    var cbdisplay = display;
    var instance = this;

    this.init = function(){
        var la = this;
        input = $('<input>')
                    .addClass('linkinput')
                    .attr('type','textbox');
        dialog = $('<div>').addClass('linkaddbox')
                    .append($('<div>New Link</div>')
                                        .addClass('title'))
                    .append($('<div>Enter Link Name:</div>')
                                        .addClass('message'))
                    .append(input)
                    .confirmDialog({response:$.proxy(la.response, la)});
    };

    this.response = function(rep){
        if(rep) {
            // Add new link
            var link = plugin.Link();
            link.name = input.val();
            link.host = account;
						link.status = "offline";
            // Display new link
            cbdisplay.addLink(link);
            // Add to plugin
            hw.addLink(link);
        }
    };
    this.init();
};

this.linkRemover = function(display, user){
    
    var cbdisplay = display;
    var dluser = user;
    var dialog;
    
    this.init = function() {
        var lr = this;
        // Trying to delete
        confirmPopup = $('<div>').addClass('linkremover')
                             .append($('<div>Delete Link</div>')
                                        .addClass('title'))
                             .append($('<div>' + dluser + "?" +'</div>')
                                        .addClass('user'))
                        .confirmDialog({response: $.proxy(lr.response, lr)});
    };

    this.response = function(rep) {
        if(rep == true) {
            // Remove link from plugin
            var link = plugin.Link();
            link.name = dluser;
            hw.rmLink(link);
            // Remove from display
            cbdisplay.removeLink(dluser);
        }
    };

    this.init();
    
};

this.accountAdder = function(display){
        
    var username;
    var password;
    var type;
    var dialog;
    var cbdisplay;

    this.init = function(){
        var aa = this;
        username = $('<input>').addClass('username')
                                    .attr('type','textbox');
        password = $('<input>').addClass('password')
                                    .attr('type','password');
        type = $('<select>').addClass('accounttype')
                        .append('<option value=XMPP>XMPP</option>')
                        .append('<option value=Gtalk>Gtalk</option>');
        dialog = $('<div>').addClass('accountaddbox')
                            .append($('<div>New Account</div>')
                                    .addClass('title'))
                            .append($('<div>Username:</div>')
                                    .addClass('username'))
                            .append(username)
			                      .append($('<div>Password:</div>')
                                    .addClass('password'))
                            .append(password)
                            .append($('<div>Account Type:</div>')
                                    .addClass('accounttype'))
                            .append(type)
                            .confirmDialog({response: $.proxy(aa.response, aa)});
        username.focus();
    };
    
    this.response = function(rep){
        if(rep && username.val() && password.val() && type.val()){
            var acc = plugin.Account();
            acc.user = username.val();
            acc.pass = password.val();
            acc.type = type.val();
            acc.status = "offline";
            // Add to display. Needs to be first as plugin is too fast with
            // status updates.
            display.addAccount(acc);
            // Add Account to plugin
            hw.addAccount(acc);
        }
    };
    this.init();
};
    
this.accountRemover = function(display, account){
    
    var cbdisplay = display;
    var dlaccount = account;
    var dialog;
    
    this.init = function() {
        var ar = this;
        // Trying to delete
        confirmPopup = $('<div>').addClass('linkremover')
                             .append($('<div>Delete Account</div>')
                                        .addClass('title'))
                             .append($('<div>' + stripResource(dlaccount) + "?" +'</div>')
                                        .addClass('user'))
                        .confirmDialog({response: $.proxy(ar.response, ar)});
    };

    this.response = function(rep) {
        if(rep == true) {
            // Remove from display
            cbdisplay.removeAccount(dlaccount);
            // Remove link from plugin
            var acc = plugin.Account();
            acc.user = dlaccount;
						acc.type = "XMPP";
            hw.rmAccount(acc);
        }
    };

    this.init();
    
};


(function(window, $, undefined){

    $.fn.confirmDialog = function(options) {
        var opts = $.extend({}, $.fn.confirmDialog.defaults, options);
        
        var ok = function(sf){
            opts.response(true);
            $(sf).repostDialog('remove');
        };

        var cancel = function(sf){
            opts.response(false);
            $(sf).repostDialog('remove');
        };

        return this.each(function(){
            var sf = this;  
            $(this).addClass("confirmation")
                .append($('<button>Ok</button>')
                            .addClass('ok')
                            .click(function(){ok(sf)}))
                .append($('<button>Cancel</button>')
                            .addClass('cancel')
                            .click(function(){cancel(sf)}))
                .repostDialog({'modal': true, 
                                'centred': true});
            $('#repost').append(this);
            $(this).repostDialog('show');
        });
    };
    
    $.fn.confirmDialog.defaults = {
        response: function(){}
    };

})(window, $);   

(function(window, $, undefined){

    $.Dialog = function( options, element ){
        this.opts = $.extend({}, $.fn.repostDialog.defaults, options);
        this.element = $( element );
        this._create( options );
    };

    $.Dialog.prototype = {

        // sets up widget
        _create : function( options ) {
            var dialog = this;
            this.element
                    .hide()
                    .attr('id', 'rpdialog')
                    .append($('<img src=images/repost_x.gif>')
                        .addClass('floatclose')
                        .click(function(){dialog.remove()}));
            if(this.opts.draggable == true){
                 this.element.mousedown(function(e){dialog.mdown(e)})
                            .mouseup(function(e){dialog.mup(e)});
            }
        },

        mdown : function(e){
            var dialog = this;
            this.offsetx = dialog.element.offset().left;
            this.offsety = dialog.element.offset().top;
            this.startx = e.clientX;
            this.starty = e.clientY;
            $(document).mousemove(function(e){dialog.mmove(e)});
        },

        mmove : function(e){
            var dialog = this;
            dialog.element.offset({top: this.offsety + e.clientY - this.starty,  
                        left: this.offsetx + e.clientX - this.startx});
        },

        mup : function(e){
            $(document).unbind('mousemove');
        },

        show : function(x, y){
            var dialog = this;
            // Keep moving indexes outwards
            var zindex = parseInt($('#mask').css('z-index'));
            dialog.element.css({'z-index': zindex+4});

            if(this.opts.modal == true){
                $('#mask').css({'z-index': zindex+3});
                // Get the screen height and width
                var maskHeight = $(document).height();
                var maskWidth = $(window).width();

                // Set height and width to mask to fill up the whole screen
                $('#mask').css({'width':maskWidth,'height':maskHeight});

                // transition effect     
                $('#mask').fadeIn(500);    
                $('#mask').fadeTo("slow",0.8);  
                $('#mask').show();
            }
            if(this.opts.centred == true){
                //Get the window height and width
                var winH = $(window).height();
                var winW = $(window).width();
                this.element.css({'top': winH/2-this.element.height()/2, 
                                    'left': winW/2-this.element.width()/2})
            } else if( x && y) {
                this.element.css({'top': y,
                                    'left': x});
            }
            this.element.show();
        },
        
        remove : function(){
            var kthis = this;
            this.element.fadeOut('fast', function() {
                                    kthis.opts.closefunc(kthis.element);
                                    });
            if(this.opts.modal == true){
                var zindex = parseInt($('#mask').css('z-index'));
                $('#mask').css('z-index', zindex-3);
                if( (zindex-3) <= 9000){
                    $('#mask').hide();
                }
            }
        },

    };

    $.fn.repostDialog = function(options) {
        if ( typeof options === 'string' ) {
            // call method
            var args = Array.prototype.slice.call( arguments, 1 );
            this.each(function(){
                var instance = $.data( this, 'rpdialog' );
                if ( !instance ) {
                  logError( "cannot call methods on repostDialog prior to initialization; " +
                    "attempted to call method '" + options + "'" );
                  return;
                }
                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
                  logError( "no such method '" + options + "' for repostDialog instance" );
                  return;
                }
                // apply method
                instance[ options ].apply( instance, args );
            });
        } else {
            this.each(function(){
                var instance = $.data( this, 'rpdialog' );
                if ( instance ) {
                  // apply options & init
                  instance.option( options || {} );
                  instance._init();
                } else {
                  // initialize new instance
                  $.data( this, 'rpdialog', new $.Dialog( options, this ) );
                }
            });
        }
        return this;
    };
    
    $.fn.repostDialog.defaults = {
        modal: true,
        centred: true,
        draggable: true,
        closefunc: function(el){el.remove();}
    };
})(window, $);
