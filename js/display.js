// When we receive content via repostlib we need to be able to build
// a nice object from the JSON
function buildFromJSON(content){
    if( content ){
      var objstr = JSON.parse(content);
      var j = objstr["cname"];
      var obj = new window[objstr["cname"]]();
      obj.loadFromJSON(objstr);
      return obj;
    }
    return; 
}; 
// Sends and inserts jsPosts
function sendPost(p){
    var post = plugin.Post();
    p.setUuid(post.uuid);
    ptable.insertPost(p,0);
    post.content = JSON.stringify(p);
    hw.sendPost(post);
};

// Listener function waiting for user to interact with page and
// repost something.
chrome.extension.onRequest.addListener(
     function(request, sender, sendResponse) {
        var post = buildFromJSON(request);
        sendPost(post);
        sendResponse({}); // snub them.
     }
);

// Returns the generic post container to attach visual elements
// to
function xmlPost(uuid, metric){
    var xmlpost = document.createElement("div");
    xmlpost.className = "post";
    xmlpost.setAttribute("data-uuid",uuid);
    xmlpost.setAttribute("data-metric",metric);
    return xmlpost;    
};

// Callback called when the rpeost plugin has a new post
function checkForPost(post,rank) {
    if( post.content ) {
        var con = buildFromJSON(post.content);
        con.setUuid(post.uuid);
        con.setMetric(post.metric);
        ptable.insertPost(con,rank);
        repostNotify.queueNotification(con.getCaption());
   }
};

this.repostNotification = function(){

  var msgQueue;
  var timeout;

  this.init = function(){
    this.msgQueue = new Array();
  };
  
  this.sendMsg = function(msg){
    // Create a simple text notification:
    var notification = webkitNotifications.createNotification(
        'images/icon-16.jpeg',  // icon url - can be relative
        'New Repost:',
        msg
        );
    notification.onclick = function(){ window.focus(); this.cancel(); };
    setTimeout(function(){ notification.cancel();}, '5000');
    notification.show();
  };
  
  // On the timeout if there is only 1 post send out the caption
  // more than one send out the number
  this.onTimeOut = function(){
    this.timeout = null;
    if(this.msgQueue.length == 1){
      this.sendMsg(this.msgQueue.pop());
    }else if( this.msgQueue.length > 1){
      this.sendMsg(this.msgQueue.length + " New Posts");
      while(this.msgQueue.length > 0){
        this.msgQueue.pop();
      }
    }
  };
  
  // Need to make timeout a closure so we can access our object
  this.closedOnTimeOut = function(){
    var _this = this;
    return function(){
      _this.onTimeOut();
    };
  };

  // Queue up notifications so we don't get an explosition across the screen
  this.queueNotification = function(message){
    if(message){
      this.msgQueue.push(message);
      if(this.timeout == null){
        this.timeout = setTimeout(this.closedOnTimeOut(), '1000'); // Time to queue em up before flushing
      }
    }
  };

  this.init();

};


// Creates the link to the options page. Should probably redirect in future.
function createOptionsLink(){
    var optlink = document.createElement("div");
    optlink.innerHTML = "You don't seem to have any accounts. Please goto "+
                        "options page and add one. <a href=\"options.html\">Options "+
                        "Page</a>";
    return optlink;
};

// Adds shortcuts to main page for repostin'
function addShortCuts(){
    var shortFunc = function(e){
        if(e.altKey){
            var code = e.keyCode;
            var c = String.fromCharCode(code).toLowerCase();
            if(c == "t"){ // Text Post Box Popup
                textbox.display();
            }
            if(c == "l"){ // Text Post Box Popup
                var linkarr = hw.getLinks();
                var acctarr = hw.getAccounts();
                linksdisplay.show(linkarr, acctarr);       
            }
        }
    };
    document.addEventListener("keydown",shortFunc);
    $('#connlink').click(function(){ // Text Post Box Popup
                linksdisplay.show();       
            });
};

function checkStatus() {
    statusBar.checkStatus(hw.getLinks(), hw.getAccounts());
}

function postmetricupdate(){
	console.log("Metric update");
}

var ptable; // Mainpage table display
var plugin; // the repost plugin instance
var hw; // a repost object

var textbox; // Text post input box
var linksdisplay;

var repostNotify;

var wel;
var statusBar;

function main() {
    $('document').ready(function(){
        // Create instance of plugin
        plugin = document.getElementById("plugin");
        hw = plugin.rePoster();
        // Set UI callbacks
        linksdisplay = new linkVisual();
        var postuiops = plugin.PostUiOps();
        postuiops.newpostcb = checkForPost;
        postuiops.postmetriccb = postmetricupdate;
        hw.setPostUiOps(postuiops);
        var networkuiops = plugin.NetworkUiOps();
        networkuiops.statuschangedcb = $.proxy(linksdisplay.statusChanged, linksdisplay);
        networkuiops.accountdisconnectcb = $.proxy(linksdisplay.accountDisconnected, linksdisplay);
        hw.setNetworkUiOps(networkuiops);
        hw.init();
        // Initialise UI
        ptable = new posttable();
        // Create input windows
        textbox = new textPostBox(sendPost);
        repostNotify = new repostNotification();
        wel = document.getElementById("welcome");
        // attach repost shortcuts
        addShortCuts();
        // setup status bar
        statusBar = new statusBar();
        // Create link management window
        var linkarr = hw.getLinks();
        var acctarr = hw.getAccounts();
        linksdisplay.init(acctarr, linkarr);
		
        // Get repost rolling
        hw.startRepost();
        hw.getInitialPosts();
        setTimeout("checkStatus()",10000);
    })
};


