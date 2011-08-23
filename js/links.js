// Begin the nastiness
// Settings for jit

this.linkVisual = function() {
    
    var linkBox; /* send that text */
    var displayed; /* Are we being displayed already? */
    var vis;
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
                                     linkNodeRemover(fd,node);
                                     linkNodeAdder(fd,node);
                                 }
            },
            //Number of iterations for the FD algorithm
            iterations: 200,
            //Edge length
            levelDistance: 130,
            // Add text to the labels. This method is only triggered
            // on label creation and only for DOM labels (not native canvas ones).
            onCreateLabel: function(domElement, node){
                            var nameContainer = document.createElement('span');
                            nameContainer.className = 'name';  
                            nameContainer.innerHTML = node.name; 
                            var style = domElement.style;
                            style.fontSize = "0.8em";
                            style.color = "#ddd";
                            var closeButton = document.createElement('span')
                            closeButton.className = 'close';  
                            closeButton.innerHTML = 'x';  
                            domElement.appendChild(nameContainer);  
                            domElement.appendChild(closeButton);  
                            //Fade the node and its connections when  
                            //clicking the close button  
                            closeButton.onclick = function() {  
                                    node.setData('alpha', 0, 'end');  
                                    node.eachAdjacency(function(adj) {  
                                        adj.setData('alpha', 0, 'end');  
                                    });  
                                    fd.fx.animate({  
                                          modes: ['node-property:alpha','edge-property:alpha'], duration: 500 
                                    });  
                            };
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
    
    this.init = function(){
        displayed = false;
            var inputPopup = $('<div>').singleFieldDialog({title: "Enter Link Name:", field:"", response: this.response});       
            var inputPopup = $('<div>').confirmDialog({title: "Enter Link Name:", field:"", response: this.response});       
    };

    this.createTree = function(links, accts){
        var foundhost = false;
        var linklen = links.length;
        var acctlen = accts.length;
        var linktree = new Array();
        var acctree = new Array();
        
        // create you at the center
        var you = createTreeElement("you", "you", "you");
        acctree.push(you);

        // create account tree
        for(var i=0; i<acctlen; i++) {
            var treeobj;
            if(accts[i].status == "online")
            {
                treeobj = createTreeElement(accts[i].user, accts[i].user, "onlineacct");
            }
            else
            {
                treeobj = createTreeElement(accts[i].user, accts[i].user, "offlineacct");
            }
            acctree.push(treeobj);
            var adjobj = createAdjacency(accts[i].user);
            you.adjacencies.push(adjobj);
        }
        // create link tree
        for(var i=0; i<linklen; i++) {
            for(var x=0; x<acctree.length; x++) {
                if(acctree[x].name == links[i].host) {
                    var treeobj; 
                    if(links[i].status == "online") {
                        treeobj = createTreeElement(links[i].name, links[i].name, "onlinelink");
                    }else if(links[i].status == "reposter") {
                        treeobj = createTreeElement(links[i].name, links[i].name, "reposterlink");
                    }else{
                        treeobj = createTreeElement(links[i].name, links[i].name, "offlinelink");
                    }

                    var adjobj = createAdjacency(links[i].name);
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
    
    this.getTree = function(){
        return fd;
    };

    this.show = function(linkarr, acctarr){
        if(displayed == false){
            linkBox = new repostdialog({'modal': true,
                                        'children': $('<div>')
                                           .attr('id','infovis'),
                                           'closefunction': function() {
                                                $("#infovis").children().remove();
                                                displayed = false;
                                            }});
            linkBox.addClass('linkbox');
            var tree = this.createTree(linkarr, acctarr);
            linkBox.show();
            fd = new $jit.ForceDirected(forcegraphset);
            // load JSON data.
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
            displayed = true;
        }
    };

    this.remove = function(){
        linkBox.remove();
    };
};

this.createAdjacency = function(nodeto){
    return {
       data: { color: "#909291"},
       nodeTo: nodeto
    };
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

this.linkNodeAdder = function(t, n){

    var tree = t;
    var node = n;
    var inputPopup;

    this.init = function(node){
        var type = node.data.$reposttype;
        if(type == "hostobj"){
            inputPopup = $('<div>'). singleFieldPopup({title: "Enter Link Name:", field:"", response: this.response});       
            inputPopup.show();
            inputPopup.textFocus();
        }
    };

    this.response = function(rep){
        if(rep != ""){
            var treeobj = createTreeElement(rep,rep,"reposterlink");
            var adj = createAdjacency("");
            tree.graph.addNode(treeobj);
            tree.graph.addAdjacence(node,tree.graph.getNode(rep),adj.data);
            tree.computeIncremental({
                iter: 40,
                property: 'end',
                onStep:  function(perc){},
                onComplete: function(){
                    tree.animate({
                        modes: ['linear'],
                        transition: $jit.Trans.Elastic.easeOut,
                        duration: 2500
                    });
                }
            });
            /* TODO error checking etc...*/
            link = plugin.Link();
            link.name = rep;
            link.host = node.name;
            hw.addLink(link);
        }
    };
    this.init(node);
};

this.linkNodeRemover = function(t, n){
    
    var tree = t;
    var node = n;
    var confirmPopup;
    
    this.init = function(node){
        var type = node.data.$reposttype;
        if(type == "buddyobj"){
            // Trying to delete
            confirmPopup = $('<div>').confirmatDialog();
        }
    };

    this.response = function(rep){
        if(rep == true){
            // delete buddy node here
            node.setData('alpha', 0, 'end');  
            node.eachAdjacency(function(adj) {  
                    adj.setData('alpha', 0, 'end');  
                    });  
            tree.fx.animate({  
                            modes: ['node-property:alpha',  
                            'edge-property:alpha'],  
                            duration: 500  
                        });  
            tree.graph.removeNode(node.id);
            link = plugin.Link();
            link.name = node.name;
            hw.rmLink(link);
        }
    };

    this.init(node);
    
};

(function(window, $, undefined){

    $.fn.confirmDialog = function(options) {
        var opts = $.extend({}, $.fn.confirmDialog.defaults, options);
        
        var ok = function(sf){
            opts.response(true);
            sf.dialog.repostDialog('remove');
        };

        var cancel = function(sf){
            opts.response(false);
            sf.dialog.repostDialog('remove');
        };

        return this.each(function(){
            var sf = this;  
            this.dialog = $('<div>').addClass('confirmation')
                        .append($('<span>'+opts.title+'</span>')
                                            .addClass('message'))
                        .append($('<button>Ok</button>')
                                    .addClass('ok')
                                    .click(function(){ok(sf)}))
                        .append($('<button>Cancel</button>')
                                    .addClass('cancel')
                                    .click(function(){cancel(sf)}))
                        .repostDialog({'modal': true, 
                                        'centred': true});
            $('#repost').append(this.dialog);
            this.dialog.repostDialog('show');
        });
    };
    
    $.fn.confirmDialog.defaults = {
        title: "title",
        field: "",
        response: function(){}
    };

})(window, $);   

// Simple single field popup.
// message = message to display
// divclass = class to call it
// callback = cb to call when user clicks. Should take string user input
(function(window, $, undefined){

    $.fn.singleFieldDialog = function(options) {
        var opts = $.extend({}, $.fn.singleFieldDialog.defaults, options);
        
        var ok = function(sf){
            opts.response(sf.input.value);
            sf.dialog.repostDialog('remove');
        };

        var cancel = function(sf){
            opts.response();
            sf.dialog.repostDialog('remove');
        };

        return this.each(function(){
            var sf = this;  
            this.input = $('<input>')
                        .addClass('inputbox')
                        .attr('type','textbox');
            this.dialog = $('<div>').addClass('singlefield')
                        .append($('<span>'+opts.title+'</span>')
                                            .addClass('message'))
                        .append(this.input)
                        .append($('<button>Ok</button>')
                                    .addClass('ok')
                                    .click(function(){ok(sf)}))
                        .append($('<button>Cancel</button>')
                                    .addClass('cancel')
                                    .click(function(){cancel(sf)}))
                        .repostDialog({'modal': true, 
                                        'centred': true});
            $('#repost').append(this.dialog);
            this.input.focus();
            this.dialog.repostDialog('show');
        });
    };
    
    $.fn.singleFieldDialog.defaults = {
        title: "title",
        field: "",
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
                if(opts.centred == true){
                    //Get the window height and width
                    var winH = $(window).height();
                    var winW = $(window).width();
                    this.element.css({'top': winH/2-this.element.height()/2, 
                                        'left': winW/2-this.element.width()/2})
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
                this.element.show();
            },
            
            remove : function(){
                this.element.fadeOut('fast', function() {
                                        //$.fn.repostDialog.closefunc();
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
        draggable: true
    };
})(window, $);
