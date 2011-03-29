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
    }
  });

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
    this.getXml = function(uuid, metric) {
        var imagepost = document.createElement("div");
        imagepost.setAttribute("data-context", context);

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
function checkForPost(post,rank){
    var con = buildFromJSON(post.content);
    con.setUuid(post.uuid);
    con.setMetric(post.metric);
    ptable.insertPost(con,rank);
};

// Creates the link to the options page. Should probably redirect in future.
function createOptionsLink(){
    var optlink = document.createElement("div");
    optlink.innerHTML = "You don't seem to have any accounts. Please goto "+
                        "options page and add one. <a href=\"options.html\">Options "+
                        "Page</a>";
    return optlink;
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


