// Begin the nastiness
// Settings for jit

this.linkVisual = function() {
    
    var linkBox; /* send that text */
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
                            zooming: 10 //zoom speed. higher is more sensible
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
                    lineWidth: 0.4
                  },
            //Native canvas text styling
            Label: {
                    color: '#000',
                    type: labelType, //Native or HTML
                    size: 12,        
                    font: "Lucida Console", 
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
    
    // Here we create the box to hold this shit
    this.init = function(){
        var label; /* temp label */
        // Create dialog
        linkBox = document.createElement('div');
        linkBox.className = "floater linkbox";
        // 'X'
        close = document.createElement("span");
        close.innerHTML = "x";
        close.className = "floatclose";
        close.onclick = function() {
            linkBox.style.visibility = "hidden";
            var cell = document.getElementById("infovis");
            if ( cell.hasChildNodes() )
            {
                while ( cell.childNodes.length >= 1 )
                {
                    cell.removeChild( cell.firstChild );       
                } 
            }

        };
        linkBox.appendChild(close);
        // Visualisation
        vis = document.createElement("div");
        vis.className = "infovis";
        vis.id = "infovis";
        linkBox.appendChild(vis);
        // Link save button
        savebutton = document.createElement("button");
        savebutton.innerText = "Save";
        savebutton.className = "linkboxsave";

        document.body.appendChild(linkBox);
    };
    
    this.createTree = function(links){
        var foundhost = false;
        var len = links.length;
        var linktree = new Array();
        var acctree = new Array();

        // create account tree
        for(var i=0; i<len; i++) {
            foundhost = false;
            for(var x=0; x<acctree.length; x++) {
                if(acctree[x].name == links[i].host) {
                    foundhost = true;
                    break;
                }
            }
            if( foundhost == false ) {
                var treeobj = createTreeElement(links[i].host, links[i].host, "hostobj");
                acctree.push(treeobj);
            }
        }
        // create link tree
        for(var i=0; i<len; i++) {
            for(var x=0; x<acctree.length; x++) {
                if(acctree[x].name == links[i].host) {
                    var treeobj = createTreeElement(links[i].name, links[i].name, "buddyobj");
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
                }
            }
        }
        return acctree.concat( linktree);
    };
    
    this.getTree = function(){
        return fd;
    };

    this.show = function(linkarr){
        var tree = this.createTree(linkarr);
        linkBox.style.visibility = "visible";
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

    };
};

this.createAdjacency = function(nodeto){
    return {
       data: { color: "#909291"},
       nodeTo: nodeto
    };
};

this.createTreeElement = function(name, id, type){
    if(type == "buddyobj"){
        var obj = {
            $reposttype: "buddyobj",
            $color:  "#C74243",
            $type:  "circle",
            $dim:  15
        };

    }else if(type == "hostobj"){
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
    var buddyPopup;
        this.init = function(node){
        var type = node.data.$reposttype;
        if(type == "hostobj"){
            var treeobj = createTreeElement("t","t","buddyobj");
            var adj = createAdjacency("");
            tree.graph.addNode(treeobj);
            tree.graph.addAdjacence(node,tree.graph.getNode("t"),adj.data);
        }
    };

    this.response = function(rep){
    };
    this.init(node);
};

this.linkNodeRemover = function(t, n){
    
    var tree = t;
    var node = n;
    var confirmPopup;
    
    this.init = function(node){
        confirmPopup = new confirmationPopup("", "", this.response);
        var type = node.data.$reposttype;
        if(type == "buddyobj"){
            // Trying to delete
            confirmPopup.updateMessage("Delete Link " + node.name + "?");
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
    var popup;
    var msg;

    this.createPopup = function(message, divclass){
        
        popup = document.createElement("div");
        popup.className = "floater confirmationPopup "+divclass;
        
        // Confirmation message
        msg = document.createElement("span");
        msg.className = "message";
        msg.innerHTML = message;
        popup.appendChild(msg);

        // Ok and cancel button
        var ok = document.createElement("button");
        ok.className = "ok";
        ok.innerText = "Ok";
        ok.onclick = this.ok(this);
        popup.appendChild(ok);

        var cancel = document.createElement("button");
        cancel.className = "cancel";
        cancel.innerText = "Cancel";
        cancel.onclick = this.cancel(this);
        popup.appendChild(cancel);

        document.body.appendChild(popup);
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
        popup.style.visibility = "visible";
    };

    this.remove = function(){
        document.body.removeChild(popup);
    };
 
    this.createPopup(message, divclass);

};


/*
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
        cancel.onclick = this.clearPopup(this);

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
 
    this.deleteMe = function(){
        popup.parentNode.removeChild(popup);
    };

    this.addFromPopup = function(popup){
       return function(e){
           var acc = new account();
           acc.username = popup.username();
           acc.password = popup.password();
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

*/

