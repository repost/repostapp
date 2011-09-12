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
    var jsp = $('<div>');
    if(p["cname"] == "postText") {
       jsp.textpost({json: p, metric: 0, uuid: post.uuid});
    } else if(p["cname"] == "postImage") {
       jsp.imagepost({json: p, metric: 0, uuid: post.uuid});
    }
    ptable.insertPost(jsp,0);
    post.content = JSON.stringify(p);
    hw.sendPost(post);
};

// Listener function waiting for user to interact with page and
// repost something.
chrome.extension.onRequest.addListener(
     function(request, sender, sendResponse) {
        var post = JSON.parse(request);
        sendPost(post);
        repostNotify.notification('Post Sent:', post.caption);
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
        var json = JSON.parse(post.content);
        if(json.cname == 'postImage') {
            var test = $('<div>').imagepost({metric: post.metric, uuid: post.uuid, json:JSON.parse(post.content)});
		}
		else if(json.cname == 'postText') {
            var test = $('<div>').textpost({metric: post.metric, uuid: post.uuid, json:JSON.parse(post.content)});
        }
        ptable.insertPost(test,0);
        repostNotify.queueNotification(json["caption"]);
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

    this.notification = function(title, msg){
        // Create a simple text notification:
        var notification = webkitNotifications.createNotification(
                'images/icon-16.jpeg',  // icon url - can be relative
                title,
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

// help stuff
this.helpVisual = function() {
    this.show = function() {
        /* works now but spams the page */
        /*
        var logs = hw.getUserLogs();
        var paths = '';
        for ( i = 0; i < logs.length; i++ )
        {
            var log = { cname: "postText", caption: "LOGS", 
                content: logs[i] };
            var jsp = $(document.createElement("div"));
            jsp.textpost({json: log, metric: 0, uuid: 0});
            ptable.insertPost(jsp,0);
        }
        */

        var help = { cname: "postText", 
                     caption: "alt+click on an image", 
                     content: "to repost an image!"
                   };
        var jsp = $(document.createElement("div"));
        jsp.textpost({json: help, metric: 0, uuid: 0});
        ptable.insertPost(jsp,0);
        var help = { cname: "postText", 
                     caption: "alt+t on a page", 
                     content: "to repost the page you are looking at!"
                   };

        var help = { cname: "postText", 
                     caption: "alt+t on a page", 
                     content: "to repost the page you are looking at!"
                   };
        var jsp = $(document.createElement("div"));
        jsp.textpost({json: help, metric: 0, uuid: 0});
        ptable.insertPost(jsp,0);

        var help = { cname: "postText", 
                     caption: "to add links...", 
                     content: "click on \"Connections\" and click on the account you want to link from!"
                   };
        var jsp = $(document.createElement("div"));
        jsp.textpost({json: help, metric: 0, uuid: 0});
        ptable.insertPost(jsp,0);

        var help = { cname: "postText", 
                     caption: "to add accounts...", 
                     content: "click on \"Connections\" and click on \"You\" to add an account!"
                   };
        var jsp = $(document.createElement("div"));
        jsp.textpost({json: help, metric: 0, uuid: 0});
        ptable.insertPost(jsp,0);


        var help = { cname: "postText", caption: "HELP", 
                     content: "web: www.getrepost.com<br/>irc: #repost on irc.freenode.net",
                     link: "http://www.getrepost.com" };
        var jsp = $(document.createElement("div"));
        jsp.textpost({json: help, metric: 0, uuid: 0});
        ptable.insertPost(jsp,0);

    };
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
    $('#helplink').click(function(){
        helpdisplay.show();
    });

    // Repost app menu dialog
    $('#createimagepost').click(function(){
        imagebox.display();
    });
    $('#createtextpost').click(function(){
        textbox.display();
    });
};

function createRemoteText(clickdata, tab) {
    // Create request
    var request = {"type": "textPost"};
    chrome.tabs.sendRequest(tab.id, JSON.stringify(request), 
            function(response) {
            });
};

function createRemoteImage(clickdata, tab) {
    // Create request
    var request = {"type": "imagePost",
                    "target": {"baseURI": clickdata.pageUrl, 
                                "src": clickdata.srcUrl}
    };
    chrome.tabs.sendRequest(tab.id, JSON.stringify(request), 
            function(response) {
            });
};

// Context Menus
function createContextMenus(){
    // Remove all before we start
    chrome.contextMenus.removeAll();
    // Text post
    chrome.contextMenus.create({type: "normal",
                                title: "Create Text Post",
                                contexts: ["page"],
                                onclick: createRemoteText
    });

    // Image post
    chrome.contextMenus.create({type: "normal",
                                title: "Create Image Post",
                                contexts: ["image"],
                                onclick: createRemoteImage
    });
};

// Repost app menu animation
$(document).ready(function(){
    $('li.headlink').hover(
        function() { $('ul', this).css('display', 'block'); },
        function() { $('ul', this).css('display', 'none'); });
});

function checkStatus() {
    statusBar.checkStatus(hw.getLinks(), hw.getAccounts());
}

function postmetricupdate(post){
	ptable.updateMetric(post);
}

var ptable; // Mainpage table display
var plugin; // the repost plugin instance
var hw; // a repost object

var textbox; // Text post input box
var imagebox; // Text post input box
var linksdisplay;

var repostNotify;

var wel;
var statusBar;

var helpdisplay;

function main() {
    $('document').ready(function(){
        helpdisplay = new helpVisual();
        linksdisplay = new linkVisual();
        // Create instance of plugin
        plugin = document.getElementById("plugin");
        hw = plugin.rePoster();
        // Set UI callbacks
        var postuiops = plugin.PostUiOps();
        postuiops.newpostcb = checkForPost;
        postuiops.postmetriccb = postmetricupdate;
        hw.setPostUiOps(postuiops);
        var networkuiops = plugin.NetworkUiOps();
        networkuiops.statuschangedcb = $.proxy(linksdisplay.statusChanged, linksdisplay);
        networkuiops.linkstatuschangedcb = $.proxy(linksdisplay.linkStatusChanged, linksdisplay);
        networkuiops.accountdisconnectcb = $.proxy(linksdisplay.accountDisconnected, linksdisplay);
        hw.setNetworkUiOps(networkuiops);
        hw.init();
        hw.startRepost();
        // Initialise UI
        ptable = new posttable();
        // Create input windows
        textbox = new textPostBox(sendPost);
        imagebox = new fullImagePost(sendPost);
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
        // Add context menus
        createContextMenus();
		
        // Get repost rolling
        hw.getInitialPosts();
        setInterval("checkStatus()",10000);
    });
};


