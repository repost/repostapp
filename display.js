// Listener function waiting for user to interact with page and
// repost something.
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "image"){
      var img = new postImage(request.caption, request.src, sender.tab.url);
      var post = new Post("" ,img,"-"); 
      ptable.insertPost(post,0);
      sendResponse({}); // snub them.
      hw.sendPost(jPostToCPost(post));
    }
  });

// The repost post table which displays posts
this.posttable = function(){
 
    var rows = 0;       // dependent upon how much stuff you add
    var cols = 5;       // Standard 5 cols wide   
    var numentries = 0; // number of items in table
    var table;          // table instance 
    var tableover = false; // Mouse currently over table
    
    this.createTable = function(){ 
        var page = document.getElementById("repost"); 
        table = document.createElement("table"); 
        page.appendChild(table); 
    }; 

    // Deletes a post from the table given rank
    this.deletePost = function(rank){
        var pos = this.rankToxy(rank);
        this.deletePostXY(pos);
       };

    // Delete a post from table given xy coords
    this.deletePostXY = function(pos){
        var contents = table.rows[pos.y].deleteCell(pos.x);
        if( table.rows[pos.y].cells.length == 0 ){
             table.deleteRow(pos.y);
             rows--;
        }
        numentries--;
    };

    // Deletes a post and shuffles all items in the table down.
    this.delShufflePost = function(rank){
        var pos = this.rankToxy(rank);
        var r = rank;

        for( i = pos.y; i < rows; i++ ){
            this.deletePost(r);
            if( (i+1) >= rows ){
                break;
            }
            var post = this.getPost((1+i)*cols);
            this.addPost(post,((1+i)*cols-1));
            r = (1+i)*cols;
        }
        
    };

    // Convert xy to rank
    this.xytorank = function(x,y){
       return (y*cols + x);
    };

    // Converts a rank into a position in the table.
    this.rankToxy = function(rank){
        var y = Math.floor(rank / cols);
        var x = (rank - cols*y);
        return{ y:y, x:x};
    };

    // Gets the post associated with the rank.
    this.getPost = function(rank){
        var pos = this.rankToxy(rank);
        return this.getPostXY(pos);
    };
    
    // Return post from coord (x,y)
    this.getPostXY = function(pos){
        var contents = table.rows[pos.y].cells[pos.x].children;
        for(x=0; x<contents.length;x++){
            if(contents[x].className == "post"){
                var post = new Post();
                post.setXML(contents[x]);
                return post;
            }
        }
        return null;
    };

    // inserts a post at the given location and 
    // shuffles all posts behind it up a rank.
    this.insertPost = function(post, rank){
        //insert at position
        this.addPost(post,rank);
	    var pos = this.rankToxy(rank);
        var i = pos.y;
        while( table.rows[i].cells.length > cols ){
            var pos;
            pos.x = table.rows[i].cells.length - 1;
            pos.y = i;
            var post = this.getPostXY(pos);
            this.addPost(post,((1+i)*cols));
            this.deletePostXY(pos);
            i++;
        }
    };

    // add the post(expecting innerHTML) to rank whatever
    // If there is a post already there is will remove it
    this.addPost = function( post, rank){
 
        var pos = this.rankToxy(rank);
        var row;
        // check we got enough rows
        if((rows) <= pos.y){
            row = table.insertRow(rows++);
        }else{
	        row = table.rows[pos.y];
        }

        // check if cell exists
        var cell = row.insertCell(pos.x);
        // check we go the cel
        cell.className = "postcell";

        //create the general stuff
        var postspace = document.createElement("div");
        postspace.className = "postspace";
        cell.appendChild(postspace);

        var uparrow = document.createElement("image");
        uparrow.className = "votehand";
        uparrow.src = "./hpu.png";
        cell.appendChild(uparrow);

        var met = document.createElement("div");
        met.className = "metric";
        //met.innerHTML = post.getMetric();
        cell.appendChild(met);

        var downarrow = document.createElement("image");
        downarrow.className = "votehand";
        downarrow.src = "./hpd.png";
        cell.appendChild(downarrow);

        // add some action code to the cells
        uparrow.onclick = function(){
            this.className = "uphand";
        };

        uparrow.onmouseover = function(){
            this.parentNode.className = "rockon";
        };

        uparrow.onmouseout = function(){
            this.parentNode.className = "postcell";
        };

        downarrow.onmouseover = function(){
            this.parentNode.className = "fuckoff";
        };

        downarrow.onmouseout = function(){
            this.parentNode.className = "postcell"
        };

        downarrow.onclick = function(){
            this.className = "downhand";
            ptable.delShufflePost(ptable.xytorank(this.parentNode.cellIndex,
                        this.parentNode.parentNode.rowIndex));
        };

        cell.onmouseover = function(){
         //   over(this);
        };
        
        cell.onmouseout =  function() {

        };

        cell.onmousedown = function(){
        };
        cell.onmouseup = function(){
        };				
        cell.onclick = function(){
        };			
        
        numentries++;

        table.rows[pos.y].cells[pos.x].appendChild(post.getXML());
    };
    
    this.createTable();

};

// Post class. Generic post container
this.Post = function( u, cont, met){
    
    var uuid = u;
    var content = cont;
    var metric = met;

    this.getXML = function(){
        var xmlpost = document.createElement("div");
        xmlpost.className = "post";
        xmlpost.setAttribute("data-uuid",uuid);
        xmlpost.setAttribute("data-metric",metric);
        // Trying to let content object decide how displays in 
        // post box
        xmlpost.appendChild(content.getContent());
        return xmlpost;
    };

    this.setXML  = function(xmlpost){
        uuid = xmlpost.getAttribute("data-uuid");
        metric = xmlpost.getAttribute("data-metric");
        content = xmlpost.firstChild;
    };

    this.getUuid = function(){
        return uuid;
    };

    this.getMetric = function(){
        return metric;
    };
};

// Post Image class. Image content class.
this.postImage = function(cap, img, con){

    var image = img;
    var caption = cap;
    var context = con;

    // Construct image content from its parts
    this.getContent = function() {
        var imagepost = document.createElement("div");
        imagepost.setAttribute("data-context", context);
        var previewimage = document.createElement("image");
        previewimage.className = "postpreview";
        previewimage.src = image;
        previewimage.onclick = "location.href=" + context;
        imagepost.appendChild(previewimage);

        var previewcaption = document.createElement("div");
        previewcaption.className = "postcaption";
        previewcaption.innerHTML = caption;
        imagepost.appendChild(previewcaption);

        return imagepost;
    };

    this.setContent = function(xml) {
        //todo
    };
};

var ptable; // Mainpage table display
var plugin; // the repost plugin instance
var hw; // a repost object

function main() {
    // Check we have an account to log into
    var accounts = loadAccounts();
    if( accounts == null || accounts.length == 0 ){
        // direct to options page
        var page = document.getElementById("repost"); 
        page.appendChild(createOptionsLink());
    }else{
        // start repost
        ptable = new posttable();
        // plugin init
        plugin = document.getElementById("plugin");
        hw = plugin.rePoster();
        hw.init();
        hw.setNewPostCB(checkForPost);
        // add saved accounts
        for(var i=0; i<accounts.length; i++){
            hw.addAccount(accounts[i].username, accounts[i].password, "jabber");
        }
        hw.startRepost();
    }
};

// Creates the link to the options page. Should probably redirect in future.
function createOptionsLink(){
    var optlink = document.createElement("div");
    optlink.innerHTML = "You don't seem to have any accounts. Please goto "+
                        "options page and add one. <a href=\"options.html\">Options "+
                        "Page</a>";
    return optlink;
};

// Converts a js instance of a post into the c++ representation
function jPostToCPost(post){
    var p = hw.newPost();
    p.uuid = post.uuid;
    p.content = JSON.stringify(post.content);
    p.metric = post.metric;
    return p;
};

// Converts a c++ post to a js representation
function cPostToJPost(post){
    var p = new Post(post.uuid,JSON.parse(post.content),post.metric);
    return p;
};

// Callback called when the rpeost plugin has a new post
function checkForPost(post){
    ptable.insertPost(cPostToJPost(post),0);
};

