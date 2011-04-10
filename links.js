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
                    type: labelType, //Native or HTML
                    size: 10,
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
                             // Build the right column relations list.
                             // This is done by traversing the clicked node connections.
                             var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",
                                 list = [];
                             node.eachAdjacency(function(adj){
                                     list.push(adj.nodeTo.name);
                                     });
                             //append connections information
                             $jit.id('inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";
                         }
                    },
                        //Number of iterations for the FD algorithm
            iterations: 200,
            //Edge length
            levelDistance: 130,
            // Add text to the labels. This method is only triggered
            // on label creation and only for DOM labels (not native canvas ones).
            onCreateLabel: function(domElement, node){
                            domElement.innerHTML = node.name;
                            var style = domElement.style;
                            style.fontSize = "0.8em";
                            style.color = "#ddd";
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
        linkBox.className = "linkbox";
        // Caption
        label = document.createElement("label");
        label.innerHTML = "Link Management";
        label.className = "caption";
        //linkBox.appendChild(label);
        // Visualisation
        vis = document.createElement("div");
        vis.className = "infovis";
        vis.id = "infovis";
        linkBox.appendChild(vis);
        // Link save button
        savebutton = document.createElement("button");
        savebutton.innerText = "Save";
        savebutton.className = "linkboxsave";
        //linkBox.appendChild(savebutton);

        //linkBox.style.visibility = "hidden";
        document.body.appendChild(linkBox);
    };
    
    this.createJSON = function(links){
        var len = links.length;
        var tree = new Array();
        var hosts = 0;
        var buddyobj = {
            $color:  "#83548B",
            $type:  "circle",
            $dim:  10
        };
        var hostobj = {
            $color:  "#83548B",
            $type:  "square",
            $dim:  40
        };
        for(var i=0; i<len; i++) {
            // create object
            var treeobj = {
                    name: links[i].name,
                    id: links[i].name,
                    data: buddyobj,
                    adjacencies: new Array()
            };
            tree[hosts] = treeobj;
            hosts = hosts + 1;
            // check if its a new host
            for(var x=0; x<i; x++) {
                // found the host add adjacencies
                if(tree[x].name == links[i].host) {
                    var adjobj = {
                           data: { color: "#909291"},
                           nodeTo: links[i].name
                    };
                    tree[x].adjacencies[tree[x].adjacencies.length] = adjobj;
                    break;
                }
            }
            // Got to end add host
            if( x == i ) {
                var adjobj = {
                       data: { color: "#909291"},
                       nodeTo: links[i].name
                 };
                var treeobj = {
                        name: links[i].host,
                        id: links[i].host,
                        data: hostobj,
                        adjacencies: new Array()
                };
                treeobj.adjacencies[0] = adjobj;
                tree[hosts] = treeobj;
                hosts = hosts + 1;
            }
        }
        return tree;
    };

    this.show = function(linkarr){
        var tree = this.createJSON(linkarr);
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
