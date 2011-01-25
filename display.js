//////////////////////////////////////
//      On-A-Page Interface         //
//////////////////////////////////////

// A generic onclick callback function.
function repostOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
  }

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.type == "image"){
      var img = new postimage(request.caption, request.src);
      ptable.insertPost(img.getImageElement(),0);
      sendResponse({}); // snub them.
    }
  });


//////////////////////////////////
//      App Interface           //
//////////////////////////////////

this.posttable = function(){
 
    var rows = 0;     // dependent upon how much stuff you add
    var cols = 5;     // Standard 5 cols wide   
    var table;    // table instance 
    var tableover = false;
    var numentries = 0;
    
    this.createTable = function(){ 
        var page = document.getElementById("repost"); 
        table = document.createElement("table"); 
        page.appendChild(table); 
    }; 

    // Deletes a post from the table.
    this.deletePost = function(rank){
        // calc where we need to put this shit.
        var pos = this.rankToxy(rank);
        this.deletePostXY(pos);
       };

    this.deletePostXY = function(pos){
    
        var contents = table.rows[pos.y].deleteCell(pos.x);
        if( table.rows[pos.y].cells.length == 0 ){
             table.deleteRow(pos.y);
             rows--;
        }
        numentries--;
        this.adjustRanks();
    
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
        this.adjustRanks();
        
    };

    // Cycles through the table adjusting the rank attribute for
    // each cell to ensure it is correct.
    this.adjustRanks = function(){
        // this is good to visually shuffle but now we need
        // to update the rank id for each item.
        for( ii = 0; ii < numentries; ii++ ){
            var pos = this.rankToxy(ii);
            var cell = table.rows[pos.y].cells[pos.x];
            if( cell != null ){
                cell.setAttribute("rank",ii);
            }
        }
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

    this.getPostXY = function(pos){
        var contents = table.rows[pos.y].cells[pos.x].children;
        for(x=0; x<contents.length;x++){
            if(contents[x].className == "post"){
                return contents[x];
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
        this.adjustRanks();
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
        cell.setAttribute("rank",rank);

        //create the general stuff
        var postspace = document.createElement("div");
        postspace.className = "postspace";
        cell.appendChild(postspace);

        var uparrow = document.createElement("image");
        uparrow.className = "votehand";
        uparrow.src = "./hpu.png";
        cell.appendChild(uparrow);

        var downarrow = document.createElement("image");
        downarrow.className = "votehand";
        downarrow.src = "./hpd.png";
        cell.appendChild(downarrow);

        // add some action code to the cells
        uparrow.onmouseclick = function(){
        };

        uparrow.onmouseover = function(){
            this.parentNode.className = "rockon"
        };

        uparrow.onmouseout = function(){
            this.parentNode.className = "postcell"
        };

        downarrow.onmouseover = function(){
            this.parentNode.className = "fuckoff";
        };

        downarrow.onmouseout = function(){
            this.parentNode.className = "postcell"
        };

        downarrow.onclick = function(){
            ptable.delShufflePost(this.parentNode.getAttribute("rank"));
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

        table.rows[pos.y].cells[pos.x].appendChild(post);
    };
    
    this.enlargeitem = function(obj){
         var post = obj.lastChild;
         var frm = document.createElement("div");
         frm.className = "zoomer";

         var image = document.createElement("image");
         image.className = "bigpost";
         image.src = post.getAttribute("data-src");
         image.name = post.getAttribute("data-title");
         frm.appendChild(image);

         var title = document.createElement("div");
         title.className = "title";
         title.innerHTML = post.getAttribute("data-title"); 
         frm.appendChild(title);

         obj.appendChild(frm,post);
    };

    this.shrinkitem = function(obj){
       obj.parentNode.removeChild(obj);
    };

    this.out = function(obj){
    };

    this.createTable();

};

this.postimage = function(cap, image){

    var url = image;
    var caption = cap;

    this.getImageElement = function() {

        var imagepost = document.createElement("div");

        imagepost.className = "post";
        imagepost.setAttribute("data-src",url);
        imagepost.setAttribute("data-title",caption);
	
        var image = document.createElement("image");
        image.className = "smallpost";
        image.name = caption
        image.src = url;
        imagepost.appendChild(image);

        var title = document.createElement("div");
        title.className = "title";
        title.innerHTML = caption;
        imagepost.appendChild(title);

        return imagepost;
    };
};

var fu = "http://1.bp.blogspot.com/_3aZSroALBqY/THViBPqdmII/AAAAAAAAAMM/AuWtXUQu64c/s1600/fuck-you-i-am-cat.jpg"

// The XMLHttpRequest object that tries to load and parse the feed.
//var reposter= document.getElementById("pluginId");
var ptable;
var pos = 0;
function main() {
    // Create one test item for each context type.
    var contexts = ["image"];
    //var contexts = ["selection","link","image","video","audio"];
    
    //var plugin = document.getElementById("plugin");
    //var hw = plugin.reposter();
    //var hello = hw.GetPost();

 //   for (var i = 0; i < contexts.length; i++) {
   //   var context = contexts[i];
     // var title = "repost that '" + context ;
      //var id = chrome.contextMenus.create({"title": title, "contexts":[context],
       //                                    "onclick": repostOnClick});
 //   }

    ptable = new posttable();
    img = new postimage("awesome cat", fu);
    for(x=0;x<15;x++){
    	ptable.addPost(img.getImageElement(),x);
	}
for(x=0;x<15;x++){
    	ptable.delShufflePost(0);
	}
for(x=0;x<15;x++){
    	//ptable.addPost(img.getImageElement(),x);
	}
};


