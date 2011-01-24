//////////////////////////////////////
//      On-A-Page Interface         //
//////////////////////////////////////

// A generic onclick callback function.
function repostOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
  var img = new postimage("awesome cat", info["srcUrl"]);
  ptable.addPost(img.getImageElement(),0);
}


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
        var contents = table.rows[pos.y].cells[pos.x].children;
        for(x=0; x<contents.length;x++){
            if(contents[x].className == "post"){
                return contents[x];
            }
        }
        return null;
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
        var cell = table.rows[pos.y].cells[pos.x];
        if( cell == null ){
            cell = row.insertCell(pos.x);
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
        }else{
            table.rows[pos.y].cells[pos.x].removeChild(this.getPost(rank));
        }
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
var reposter= document.getElementById("pluginId");

var ptable;
var pos=0;
function main() {
    // Create one test item for each context type.
    var contexts = ["image"];
    //var contexts = ["selection","link","image","video","audio"];
    
    //var plugin = document.getElementById("plugin");
    //var hw = plugin.reposter();
    //var hello = hw.GetPost();

    for (var i = 0; i < contexts.length; i++) {
      var context = contexts[i];
      var title = "repost that '" + context ;
      var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                           "onclick": repostOnClick});
    }

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
}

// Handles feed parsing errors.
function handleFeedParsingFailed(error) {
  var feed = document.getElementById("feed");
  feed.className = "error";
  feed.innerText = "Error: " + error;
}

// Handles errors during the XMLHttpRequest.
function handleError() {
  handleFeedParsingFailed('Failed to fetch RSS feed.');
}

// Handles parsing the feed data we got back from XMLHttpRequest.
function handleResponse() {
  var doc = fu;
  if (!doc) {
    handleFeedParsingFailed("Not a valid feed.");
    return;
  }
  buildPreview(doc);
}

// The maximum number of feed items to show in the preview.
var maxFeedItems = 5;

// Where the more stories link should navigate to.
var moreStoriesUrl;

// Expecting something like this
// <image> someurl </image>
// <caption> caption </caption>

function buildPreview(doc) {
  // Construct the iframe's HTML.
    var body_src =  "<img src=\"" + doc + "\" />"
    page = document.getElementById("repost");
    var item = document.createElement("div");
    var image = document.createElement("image");
    image.className = "item_title";
    // Give title an ID for use with ARIA
    image.name = "testimage"
    image.src = fu;
    item.appendChild(image);
    page.appendChild(item);
}

// Show |url| in a new tab.
function showUrl(url) {
  // Only allow http and https URLs.
  if (url.indexOf("http:") != 0 && url.indexOf("https:") != 0) {
    return;
  }
  chrome.tabs.create({url: url});
}

function moreStories(event) {
  showUrl(moreStoriesUrl);
}

function keyHandlerShowDesc(event) {
// Display content under heading when spacebar or right-cellow pressed
// Hide content when spacebar pressed again or left-cellow pressed
// Move to next heading when down-cellow pressed
// Move to previous heading when up-cellow pressed
  if (event.keyCode == 32) {
    showDesc(event);
  } else if ((this.parentNode.className == "item opened") &&
           (event.keyCode == 37)) {
    showDesc(event);
  } else if ((this.parentNode.className == "item") && (event.keyCode == 39)) {
    showDesc(event);
  } else if (event.keyCode == 40) {
    if (this.parentNode.nextSibling) {
      this.parentNode.nextSibling.children[1].focus();
    }
  } else if (event.keyCode == 38) {
    if (this.parentNode.previousSibling) {
      this.parentNode.previousSibling.children[1].focus();
    }
  }
}

function showDesc(event) {
  var item = event.currentTarget.parentNode;
  var items = document.getElementsByClassName("item");
  for (var i = 0; i < items.length; i++) {
    var iframe = items[i].getElementsByClassName("item_desc")[0];
    if (items[i] == item && items[i].className == "item") {
      items[i].className = "item opened";
      iframe.contentWindow.postMessage("reportHeight", "*");
      // Set the ARIA state indicating the tree item is currently expanded.
      items[i].getElementsByClassName("item_title")[0].
        setAttribute("aria-expanded", "true");
      iframe.tabIndex = 0;
    } else {
      items[i].className = "item";
      iframe.style.height = "0px";
      // Set the ARIA state indicating the tree item is currently collapsed.
      items[i].getElementsByClassName("item_title")[0].
        setAttribute("aria-expanded", "false");
      iframe.tabIndex = -1;
    }
  }
}

function iframeMessageHandler(e) {
  // Only listen to messages from one of our own iframes.
  var iframes = document.getElementsByTagName("IFRAME");
  for (var i = 0; i < iframes.length; i++) {
    if (iframes[i].contentWindow == e.source) {
      var msg = JSON.parse(e.data);
      if (msg) {
        if (msg.type == "size") {
          iframes[i].style.height = msg.size + "px";
        } else if (msg.type == "show") {
          var url = msg.url;
          if (url.indexOf("http://news.google.com") == 0) {
            // If the URL is a redirect URL, strip of the destination and go to
            // that directly.  This is necessary because the Google news
            // redirector blocks use of the redirects in this case.
            var index = url.indexOf("&url=");
            if (index >= 0) {
              url = url.substring(index + 5);
              index = url.indexOf("&");
              if (index >= 0)
                url = url.substring(0, index);
            }
          }
          showUrl(url);
        }
      }
      return;
    }
  }
}

window.addEventListener("message", iframeMessageHandler);

