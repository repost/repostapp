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
    this.getXml = function() {
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

