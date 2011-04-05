// Listener function waiting for user to interact with page and
// repost something.
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "image"){
      var p = plugin.Post();
      var img = new postImage();
      img.setCaption(request.caption);
      img.setImage(request.src);
      img.setContext(sender.tab.url);
      img.setUuid(p.uuid);
      img.setMetric("-");
      ptable.insertPost(img,0);
      sendResponse({}); // snub them.
      p.content = JSON.stringify(img);
      hw.sendPost(p);
    }else if(request.type == "video"){
      var p = plugin.Post();
      var vid = new postVideo();
      vid.setCaption(request.caption);
      vid.setVideo(request.src);
      vid.setContext(sender.tab.url);
      vid.setUuid(p.uuid);
      vid.setMetric("-");
      ptable.insertPost(vid,0);
      sendResponse({}); // snub them.
      p.content = JSON.stringify(img);
      hw.sendPost(p);
    }
  });

// Insert and send
function insertSend(post){
   
};

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
        textPostBox.className = "textpostbox";
        // Table
        tb = document.createElement("table");
        textPostBox.appendChild(tb);
        row = tb.insertRow(0);
        cell = row.insertCell(0);
        // Caption
        label = document.createElement("label");
        label.innerHTML = "Caption:";
        label.className = "caption";
        cell.appendChild(label);
        caption = document.createElement("input");
        label.appendChild(caption);
        // Content
        label = document.createElement("label");
        label.innerHTML = "Content:";
        label.className = "content";
        content = document.createElement("textarea");
        label.appendChild(content);
        row = tb.insertRow(1);
        cell = row.insertCell(0);
        cell.appendChild(label);
        // Post button
        postbutton = document.createElement("button");
        postbutton.innerText = "Ahoy Buttercup";
        postbutton.onclick = this.sendPost(this,textPostBox);
        row = tb.insertRow(2);
        cell = row.insertCell(0);
        cell.appendChild(postbutton);

        textPostBox.style.visibility = "hidden";
        document.body.appendChild(textPostBox);
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
            var p = plugin.Post();
            var t = new postText();
            t.setCaption(postbox.cap());
            t.setContent(postbox.con());
            t.setLink("");
            t.setUuid(p.uuid);
            t.setMetric("-");
            ptable.insertPost(t,0);
            p.content = JSON.stringify(t);
            hw.sendPost(p);

            postbox.textClear();
            textPostBox.style.visibility = "hidden"
        };
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
    };


};

// When we receive content via repostlib we need to be able to build
// a nice object from the JSON
function buildFromJSON(content){
    var objstr = JSON.parse(content);
    var j = objstr["cname"];
    var obj = new window[objstr["cname"]]();
    obj.loadFromJSON(objstr);
    return obj;
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

// Text content class.
this.postText = function(){

    // image post specific
    var content;
    var caption;
    var link;

    // holders for uuid and metric
    var uuid;
    var metric;

    this.setUuid = function(u){
        uuid = u;
    };

    this.setMetric = function(m){
        metric = m;
    };

    this.setContent = function(con){
        content = con;
    };

    this.setLink = function(lin){
        link = lin;
    };

    this.setCaption = function(cap){
        caption = cap;
    };

    // Construct image content from its parts
    this.getXml = function(uuid, metric) {
        var imagepost = document.createElement("div");
        var previewcaption = document.createElement("div");
        previewcaption.className = "postcaption";
        previewcaption.innerHTML = caption;
        imagepost.appendChild(previewcaption);

        var xmlpost = xmlPost(uuid, metric);
        xmlpost.appendChild(imagepost);
        return xmlpost;
    };
    
    // Load from json packed up in content
    this.loadFromJSON = function(content){
        caption = content["caption"];
        content = content["content"];
        link = content["link"];
    };

    this.toJSON = function() {
        var j = {
            "cname" : "postText",
            "caption" : caption,
            "content" : content,
            "link" : link
        };
        return j;
    };
};


// Video content class.
this.postVideo = function(){

    // image post specific
    var video;
    var caption;
    var context;
    
    // holders for uuid and metric
    var uuid;
    var metric;

    this.setUuid = function(u){
        uuid = u;
    };

    this.setMetric = function(m){
        metric = m;
    };

    this.setCaption = function(cap){
        caption = cap;
    };

    this.setContext = function(con){
        context = con;
    };

    this.setVideo = function(i){
        image = i;
    };

    // Construct image content from its parts
    this.getXml = function(uuid, metric) {
        var imagepost = document.createElement("div");
        var previewimage = document.createElement("image");
        previewimage.className = "postpreview";
        previewimage.src = image;
        imagepost.appendChild(previewimage);

        var previewcaption = document.createElement("div");
        previewcaption.className = "postcaption";
        previewcaption.innerHTML = caption;
        imagepost.appendChild(previewcaption);

        var xmlpost = xmlPost(uuid, metric);
        xmlpost.appendChild(imagepost);
        return xmlpost;
    };
    
    // Load from json packed up in content
    this.loadFromJSON = function(content){
        video = content["video"];
        context = content["context"];
        caption = content["caption"];
    };

    this.toJSON = function() {
        var j = {
            "cname" : "postVideo",
            "video" : video,
            "context" : context,
            "caption" : caption
        };
        return j;
    };
};

// Post Image class. Image content class.
this.postImage = function(){

    // image post specific
    var image;
    var caption;
    var context;
    
    // holders for uuid and metric
    var uuid;
    var metric;

    this.setUuid = function(u){
        uuid = u;
    };

    this.setMetric = function(m){
        metric = m;
    };

    this.setCaption = function(cap){
        caption = cap;
    };

    this.setContext = function(con){
        context = con;
    };

    this.setImage = function(i){
        image = i;
    };

    // Construct image content from its parts
    this.getXml = function() {
        var imagepost = document.createElement("div");

        var previewimage = document.createElement("image");
        previewimage.className = "postpreview";
        previewimage.src = image;
        imagepost.appendChild(previewimage);

        var previewcaption = document.createElement("div");
        previewcaption.className = "postcaption";
        previewcaption.innerHTML = caption;
        imagepost.appendChild(previewcaption);

        var xmlpost = xmlPost(uuid, metric);
        xmlpost.appendChild(imagepost);
        return xmlpost;
    };
    
    // Load from json packed up in content
    this.loadFromJSON = function(content){
        image = content["image"];
        context = content["context"];
        caption = content["caption"];
    };

    this.toJSON = function() {
        var j = {
            "cname" : "postImage",
            "image" : image,
            "context" : context,
            "caption" : caption
        };
        return j;
    };
};

// Callback called when the rpeost plugin has a new post
function checkForPost(post){
    var con = buildFromJSON(post.content);
    con.setUuid(post.uuid);
    con.setMetric(post.metric);
    ptable.insertPost(con,0);
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
        }
    };
    document.addEventListener("keydown",shortFunc);
};

var ptable; // Mainpage table display
var plugin; // the repost plugin instance
var hw; // a repost object

var textbox; // Text post input box

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
        // Create input windows
        textbox = new textPostBox();
        textbox.init();
        // attach repost shortcuts
        addShortCuts();
        // init the posttable
        plugin = document.getElementById("plugin");
        hw = plugin.rePoster();
        hw.init();
        hw.setNewPostCB(checkForPost);
        var acc = plugin.Account();
        // add saved accounts
        for(var i=0; i<accounts.length; i++){
            acc.user = accounts[i].username;
            acc.pass = accounts[i].password;
            acc.type = "XMPP";
            hw.addAccount(acc);
        }
        hw.startRepost();
    }
};


