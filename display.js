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

// Creating Text post from main page
this.textPostBox = function(x,y){
    
    // Location
    var X = x;
    var Y = y;
    
    // Content
    var caption;
    var content;

     this.init = function(){

        var tb; /* Table to form things up */
        var row; /* temp row */
        var cell; /* temp cell */
        var label; /* temp label */
        var postbutton; /* send that text */

        // Create dialog
        textPostBox = document.createElement('div');
        textPostBox.className = "floater textpostbox";
        // Caption
        label = document.createElement("label");
        label.innerHTML = "Caption:";
        label.className = "caption";
        caption = document.createElement("input");
        caption.className = "captioninput";
        textPostBox.appendChild(label);
        textPostBox.appendChild(caption);
        // Content
        label = document.createElement("label");
        label.innerHTML = "Content:";
        label.className = "content";
        content = document.createElement("textarea");
        content.className = "contentinput";
        textPostBox.appendChild(label);
        textPostBox.appendChild(content);
        // Post button
        postbutton = document.createElement("button");
        postbutton.innerText = "Ahoy Buttercup";
        postbutton.onclick = this.sendPost(this,textPostBox);
        postbutton.className = "sendtext";
        textPostBox.appendChild(postbutton);
        // 'X'
        close = document.createElement("span");
        close.innerHTML = "x";
        close.className = "floatclose";
        close.onclick = this.onclickclose(this);
        textPostBox.appendChild(close);
        textPostBox.style.visibility = "hidden";
        document.body.appendChild(textPostBox);
    };
    
    this.onclickclose = function(popup){
        return function(){
            popup.close();
        };
    };

    this.con = function(){
        return content.value;
    };

    this.cap = function(){
        return caption.value;
    };

    this.sendPost = function(postbox, textPostBox){
        return function(){
            // Lets send this post
            var t = new postText();
            t.setCaption(postbox.cap());
            t.setContent(postbox.con());
            t.setLink("");
            t.setUuid("");
            t.setMetric("");
            sendPost(t);
            postbox.close();
        };
    };

    this.close = function(){
        this.textClear();
        textPostBox.style.visibility = "hidden";
    };

    this.textFocus = function(){
        caption.focus();
    };
    
    this.textClear = function(){
        caption.value = "";
        content.value = "";
    };

    this.createTextPostBox = function(x, y){
        textPostBox.style.visibility = "visible";
        textPostBox.style.top = y + "px";
        textPostBox.style.left = x + "px";
        this.textFocus();
    };
};

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
function checkForPost(post,rank){
    if( post.content ){
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
                textbox.createTextPostBox();
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
    // Check we have an account to log into
    var accounts = loadAccounts();
    /*if( accounts == null || accounts.length == 0 ){
        // direct to options page
        var page = document.getElementById("repost"); 
        page.appendChild(createOptionsLink());
    }else{*/
        // start repost
        ptable = new posttable();
        // Create input windows
        textbox = new textPostBox();
        textbox.init();
        repostNotify = new repostNotification();
        wel = document.getElementById("welcome");
        // attach repost shortcuts
        addShortCuts();
        // init the posttable
        plugin = document.getElementById("plugin");
        hw = plugin.rePoster();
        hw.init();
        hw.setNewPostCB(checkForPost);
        // Create link management window
        links = new linkVisual();
        links.init();
        if(accounts){
          var acc = plugin.Account();
          // add saved accounts
          for(var i=0; i<accounts.length; i++){
              acc.user = accounts[i].username;
              acc.pass = accounts[i].password;
              acc.type = accounts[i].type;
              hw.addAccount(acc);
          }
        }
        hw.startRepost();
        hw.getInitialPosts(checkForPost);
    /*}*/
};


