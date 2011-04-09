
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


