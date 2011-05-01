// Text content class.
this.postText = function(){

    // image post specific
    var cont;
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
        cont = con;
    };

    this.setLink = function(lin){
        link = lin;
    };

    this.setCaption = function(cap){
        caption = cap;
    };

    // Construct image content from its parts
    this.getXml = function() {
        var xmlpost; /* generic xml post holder */
        var textpost = document.createElement("div");
        var cap = document.createElement("div");
        var text = document.createElement("div");
        
        cap.innerHTML = caption;
        cap.className = "textpostcaption postcaption";
        text.innerHTML = cont;
        text.className = "posttextbody";
        textpost.className = "textpost";
        textpost.appendChild(cap);
        textpost.appendChild(text);

        xmlpost = xmlPost(uuid, metric);
        xmlpost.appendChild(textpost);
        return xmlpost;
    };
   
    // Load from json packed up in content
    this.loadFromJSON = function(content){
        caption = content["caption"];
        cont = content["content"];
        link = content["link"];
    };

    this.toJSON = function() {
        var j = {
            "cname" : "postText",
            "caption" : caption,
            "content" : cont,
            "link" : link
        };
        return j;
    };
};

