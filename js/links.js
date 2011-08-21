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
            linkBox = new repostdialog($('<div>')
                                           .attr('id','infovis'),
                                           function() {
                                                $("#infovis").children().remove();
                                                displayed = false;
                                            });
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
            inputPopup = new singleFieldPopup("Enter Link Name:", "", this.response);       
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
        inputPopup.remove();
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
            confirmPopup = new confirmationPopup("Delete Link " + node.name + "?" ,"", this.response);
            confirmPopup.display();
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
        confirmPopup.remove();
    };

    this.init(node);
    
};

// Simple confirmation popup. 
// message = message to display
// divclass = class to call it
// callback = cb to call when user clicks. Should take bool option
this.confirmationPopup = function(message, divclass, callback){
    
    var cback = callback;
    var dialog;
    var msg;

    this.createPopup = function(message, divclass){
        
        dialog = $('<div>')
            .hide()
            .attr('id', 'rpdialog')
            .addClass("confirmation")
            .append($('<img src=images/repost_x.gif>')
                .addClass('floatclose')
                .click( function() {
                        dialog.fadeOut('fast', dialog.remove() )
                }))
            .append($('<span>' + message +'</span>')
                        .addClass('message'))
            .append($('<button>Ok</button>')
                        .addClass('ok')
                        .click( this.ok(this) ))
            .append($('<button>Cancel</button>')
                                .addClass('cancel')
                                .click( this.cancel(this) ))
        ;
        $("#repost").append(dialog);
    };
    
    this.cb = function(result){
        cback(result);
    };

    this.ok = function(popup){
       return function(e){
           popup.cb(true);
       };
    };
    
    this.cancel = function(popup){
       return function(e){
           popup.cb(false);
       };
    };
    
    this.updateMessage = function(message){
        msg.innerHTML = message;
    };

    this.display = function(){
        dialog.show();
    };

    this.remove = function(){
        dialog.remove();
    };
 
    this.createPopup(message, divclass);

};


// Simple single field popup.
// message = message to display
// divclass = class to call it
// callback = cb to call when user clicks. Should take string user input
this.singleFieldPopup = function(message, divclass, callback){
    
    var cback = callback;
    var popup;
    var children;
    var input;

    this.createPopup = function(message, divclass){
       
        input = $('<input>')
                    .addClass('inputbox')
                    .attr('type','textbox');
        children = $('<div>').append($('<span>'+message+'</span>')
                                        .addClass('message'))
                    .append(input)
                    .append($('<button>Ok</button>')
                                .addClass('ok')
                                .click(this.ok(this)))
                    .append($('<button>Cancel</button>')
                                .addClass('cancel')
                                .click(this.cancel(this)));

        popup = new repostdialog(children, function(){});
        popup.addClass('singlefield');
    };

    this.cb = function(result){
        cback(result);
    };

    this.ok = function(popup){
       return function(e){
           popup.cb(input.value);
           popup.remove();
       };
    };
    
    this.cancel = function(popup){
       return function(e){
           popup.cb("");
           popup.remove();
       };
    };
    
    this.updateMessage = function(message){
        msg.innerHTML = message;
    };

    this.show = function(){
        popup.show();
    };

    this.textFocus = function(){
        input.focus();
    };
 
    this.remove = function(){
        popup.remove();
    };
 
    this.createPopup(message, divclass);

};

this.repostdialog = function(c, cf){
    
    var children = c;
    var popup = null;
    var closefunc = cf;
    var input;
    var startx;
    var starty;

    this.createPopup = function(children, closefunc){
        // Create dialog
        popup = $('<div>')
            .hide()
            .attr('id', 'rpdialog')
            //.addClass("linkbox")
            .append($('<img src=images/repost_x.gif>')
                .addClass('floatclose')
                .click(this.closureRemove(this)))
            .append(children)
            .mousedown(this.onmousedown(this))
            .mouseup(this.onmouseup(this))
            .mouseleave(this.onmouseleave(this));

        $("#repost").append(popup);
    };
    
    this.onmousedown = function(dialog){
        return function(e){
            pop = dialog.getpopup();
            dialog.startx(e.clientX);
            dialog.starty(e.clientY);
            pop.mousemove(dialog.onmousemove(dialog));
        };
    };

    this.onmousemove = function(dialog){
        return function(e){
            pop = dialog.getpopup();
            pop.offset({top: e.clientY - dialog.starty(),  left: e.clientX - dialog.startx()});
        };
    };

    this.onmouseup = function(dialog){
        return function(e){
            pop = dialog.getpopup();
            pop.unbind('mousemove');
        };
    };

    this.onmouseleave = function(dialog){
        return function(e){
            pop = dialog.getpopup();
            pop.unbind('mousemove');
        };
    };

    this.starty = function(y){
        if(y == null){
            y = starty;
        }
        starty = y;
        return starty;
    };

    this.startx = function(x){
        if(x == null){
            x = startx;
        }
        startx = x;
        return startx;
    };


    this.getpopup = function(){
        return popup;
    };

    this.show = function(){
        popup.show();
    };
    
    this.closureRemove = function(dialog){
        return function(){
            dialog.remove();
        };
    };

    this.remove = function(){
        popup.fadeOut('fast', function() {
                                popup.remove();
                                closefunc();
                            });
    };

    this.addClass = function(c){
        popup.addClass(c);
    };
 
    this.createPopup(children, closefunc);

};
