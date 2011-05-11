
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

    this.getUuid = function(u){
        return uuid;
    };

    this.getMetric = function(m){
        return metric;
    };

    this.getCaption = function(cap){
        return caption;
    };

    this.getContext = function(con){
        return context;
    };

    this.getImage = function(i){
        return image;
    };

    // Construct image content from its parts
    this.getXml = function() {
        var imagepost = document.createElement("div");
        imagepost.className = "imagepost"

        var previewimage = document.createElement("image");
        previewimage.className = "imagepreview";
        previewimage.src = image;

        var contextlink = document.createElement('a');
        contextlink.href = context;
        contextlink.target = "_blank";
        contextlink.appendChild(previewimage);
        imagepost.appendChild(contextlink);

        var previewcaption = document.createElement("div");
        previewcaption.className = "imagepostcaption postcaption";
        previewcaption.innerHTML = caption;
        imagepost.appendChild(previewcaption);
        // To prevent overflow chars respect limit
        if(caption.length > 40){
            previewcaption.innerHTML = caption.substring(0,43);
            previewcaption.innerHTML += "...";
        }

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


