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
			 if(request.type && (request.type == "rp_sendPost")){
			    var post = buildFromJSON(request);
					sendPost(post);
					sendResponse({}); // snub them.
			 }
     }
);

chrome.extension.onRequest.addListener(
     function(msg, sender, sendResponse) {
				if(msg.type && (msg.type == "rp_newPost")){
					if( msg.post.content ){
							var con = buildFromJSON(msg.post.content);
							con.setUuid(msg.post.uuid);
							con.setMetric(msg.post.metric);
							ptable.insertPost(con, msg.rank);
							repostNotify.queueNotification(con.getCaption());
					}
				}
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

this.repostNotification = function(){

  var msgQueue;
  var timeout;

  this.init = function(){
    this.msgQueue = new Array();
  };
  
  this.sendMsg = function(msg){
    // Create a simple text notification:
    var notification = webkitNotifications.createNotification(
        'icon-16.jpeg',  // icon url - can be relative
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
                links.show(linkarr, acctarr);       
            }
        }
    };
    document.addEventListener("keydown",shortFunc);
};

var ptable; // Mainpage table display
var plugin; // the repost plugin instance
var hw; // a repost object

var textbox; // Text post input box
var links;

var repostNotify;

var wel;

function main() {
		// start repost
		ptable = new posttable();
		// Create input windows
		textbox = new textPostBox(sendPost);
		repostNotify = new repostNotification();
		wel = document.getElementById("welcome");
		// attach repost shortcuts
		addShortCuts();
		// init the posttable
		var request = {"type": "rp_pluginRequest"};
		chrome.extension.sendRequest(request,
							function(response) {
								plugin = response.plugin;
								hw = response.repost;
							});
		plugin = document.getElementById("plugin");
		// Create link management window
		links = new linkVisual();
		links.init();
};


