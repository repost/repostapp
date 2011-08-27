// Begin the nastiness
// Settings for jit

this.linkVisual = function() {
    
    var linkBox; /* send that text */
    var displayed; /* Are we being displayed already? */
    var linkarr;
    var acctarr;
    var instance = this;
    var vis;
    var fd;
    var labelType = 'Native';
    var nativeTextSupport = true;
    var useGradients = true;
    var animate = true;
    var created = false;
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
                        //display node info in tooltip
                        tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"
                            + "<div class=\"tip-text\"><b>connections:</b> " + count + "</div>";
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
                    onClick: function(node) {
                                 if(!node) return;
                                 // Run Node handler
                                 if(node.name == "you") {
                                     accountAdder(instance);
                                 } else {
                                     linkRemover(instance, node.name);
                                     linkAdder(instance, node.name);
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
    
    this.init = function(aa, la) {
        acctarr = aa;
        linkarr = la;
        // Create linkbox dialog
        linkBox = $('<div>').addClass('linkbox')
                            .repostDialog({'modal': true,
                                        'centred': false,
                                        'draggable': false,
                                        'closefunc': function() {
                                                        displayed = false;
                                                    }})
                            .append($('<div>').attr('id','infovis'));
        $('#repost').append(linkBox);
        displayed = false;
    };
    
    this.show = function() {
        if(displayed == false) {
            linkBox.repostDialog('show');
            this.create();
            displayed = true;
        }
    };
 
    this.create = function(){
        if( created == false) {
            // Create tree and load
            var tree = this.createTree(linkarr, acctarr);
            fd = new $jit.ForceDirected(forcegraphset);
            fd.loadJSON(tree);
            // compute positions incrementally and animate.
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
            created = true;
        }
    };

    this.createTree = function(links, accts) {
        var foundhost = false;
        var linklen = links.length;
        var acctlen = accts.length;
        var linktree = new Array();
        var acctree = new Array();
        
        // create you at the center
        var you = this.createTreeElement("you", "you", "you");
        acctree.push(you);

        // create account tree
        for(var i=0; i<acctlen; i++) {
            var treeobj;
            var user = stripResource(accts[i].user);
            if(accts[i].status == "online")
            {
                treeobj = this.createTreeElement(user, user, "onlineacct");
            }
            else
            {
                treeobj = this.createTreeElement(user, user, "offlineacct");
            }
            acctree.push(treeobj);
            var adjobj = this.createAdjacency(user);
            you.adjacencies.push(adjobj);
        }
        // create link tree
        for(var i=0; i<linklen; i++) {
            for(var x=0; x<acctree.length; x++) {
                if(acctree[x].name == links[i].host) {
                    var treeobj; 
                    if(links[i].status == "online") {
                        treeobj = this.createTreeElement(links[i].name,
                                            links[i].name, "onlinelink");
                    }else if(links[i].status == "reposter") {
                        treeobj = this.createTreeElement(links[i].name, 
                                            links[i].name, "reposterlink");
                    }else{
                        treeobj = this.createTreeElement(links[i].name,
                                            links[i].name, "offlinelink");
                    }
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
   
    this.createTreeElement = function(name, id, type){
        if(type == "onlinelink"){
            var obj = {
                $reposttype: "buddyobj",
                $color:  "#C74243",
                $type:  "circle",
                $dim:  15
            };
        }else if(type == "reposterlink"){
            var obj = {
                $reposttype: "buddyobj",
                $color:  "#00BB3F",
                $type:  "circle",
                $dim:  15
            };
        }else if(type == "offlinelink"){
            var obj = {
                $reposttype: "buddyobj",
                $color:  "#777777",
                $type:  "circle",
                $dim:  15
            };
        }else if(type == "onlineacct"){
            var obj = {
                $reposttype: "hostobj",
                $color:  "#EBB056",
                $type:  "circle",
                $dim:  25
            };
        }else if(type == "offlineacct"){
            var obj = {
                $reposttype: "buddyobj",
                $color:  "#777777",
                $type:  "circle",
                $dim:  15
            };
        }else if(type == "you"){
            var obj = {
                $reposttype: "hostobj",
                $color:  "#EBB056",
                $type:  "circle",
                $dim:  30
            };
        }else{
            return;
        }

        return {
                name: name,
                id: id,
                data: obj,
                adjacencies: new Array()
            };
    };
    
    this.addLink = function(user, account) {
        if(user != "" && account != "") {
            var treeobj = this.createTreeElement(user, user,"reposterlink");
            var adj = this.createAdjacency(account);
            fd.graph.addNode(treeobj);
            fd.graph.addAdjacence(fd.graph.getNode(account),
                            fd.graph.getNode(user),adj.data);
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
    };

    this.addAccount = function(account) {
        if(account != "") {
            var treeobj = this.createTreeElement(account, account,"offlineacct");
            var adj = this.createAdjacency(account);
            fd.graph.addNode(treeobj);
            fd.graph.addAdjacence(fd.graph.getNode("you"),
                            fd.graph.getNode(account),adj.data);
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
    };

    this.removeLink = function(user) {
        if(user != "") {
            var node = fd.graph.getNode(user);
            node.setData('alpha', 0, 'end');  
            node.eachAdjacency(function(adj) {  
                    adj.setData('alpha', 0, 'end');  
                    });  
            fd.fx.animate({  
                            modes: ['node-property:alpha',  
                            'edge-property:alpha'],  
                            duration: 500  
                        });  
            fd.graph.removeNode(node.id);
        }
    };

    this.statusChanged = function(account) {
        console.log("HELLO " + account.user);
    };

    this.accountDisconnected = function(account, reason) {
        //var node = fd.graph.getNode(stripResource(account.user));
        console.log("disconnected " + account.user);
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
            hw.addLink(link);
            // Display new link
            cbdisplay.addLink(input.val(), account);
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
            // Add Account to plugin
            var acc = plugin.Account();
            acc.user = username.val();
            acc.pass = password.val();
            acc.type = type.val();
            hw.addAccount(acc);
            // Add to display
            display.addAccount(username.val());
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
        confirmPopup = $('<div>').append($('<span>'+"Delete Link "
                                            + dluser + "?" +'</span>')
                        .addClass('message'))
                        .confirmDialog({response: $.proxy(ar.response, ar)});
    };

    this.response = function(rep) {
        if(rep == true) {
            // Remove link from plugin
            var acc = plugin.Account();
            acc.user = dlaccount;
            hw.rmAccount(acc);
            // Remove from display
            cbdisplay.removeLink(dlaccount);
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

    $.fn.repostDialog = function(options) {
        var opts = $.extend({}, $.fn.repostDialog.defaults, options);

        $.Dialog = function( options, element ){
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
                if(opts.draggable == true){
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

            show : function(){
                if(opts.modal == true){
                    var dialog = this;
                    // Keep moving indexes outwards
                    var zindex = parseInt($('#mask').css('z-index'));
                    $('#mask').css({'z-index': zindex+3});
                    dialog.element.css({'z-index': zindex+4});

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
                if(opts.centred == true){
                    //Get the window height and width
                    var winH = $(window).height();
                    var winW = $(window).width();
                    this.element.css({'top': winH/2-this.element.height()/2, 
                                        'left': winW/2-this.element.width()/2})
                }
                this.element.show();
            },
            
            remove : function(){
                var el = this.element;
                this.element.fadeOut('fast', function() {
                                        opts.closefunc(el);
                                        });
                if(opts.modal == true){
                    var zindex = parseInt($('#mask').css('z-index'));
                    $('#mask').css('z-index', zindex-3);
                    if( (zindex-3) <= 9000){
                        $('#mask').hide();
                    }
                }
            },

        };
 
        return this.each(function(){
            if ( typeof options === 'string' ) {
                  // call method
                  var args = Array.prototype.slice.call( arguments, 1 );

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
                } else {
                    var instance = $.data( this, 'rpdialog' );
                    if ( instance ) {
                      // apply options & init
                      instance.option( options || {} );
                      instance._init();
                    } else {
                      // initialize new instance
                      $.data( this, 'rpdialog', new $.Dialog( options, this ) );
                    }
                }
        });
    };
    
    $.fn.repostDialog.defaults = {
        modal: true,
        centred: true,
        draggable: true,
        closefunc: function(el){el.remove();}
    };
})(window, $);
