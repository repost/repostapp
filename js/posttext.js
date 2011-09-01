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

    this.getUuid = function(u){
        return uuid;
    };

    this.getMetric = function(m){
        return metric;
    };

    this.getCaption = function(cap){
        return caption;
    };

    this.getContent = function(con){
        return cont;
    };

    this.getLink = function(lin){
        return link;
    };

    var addBlankPageTarget  = {
        callback: function( text, href ) {
            return href ? '<a href="' + href + '" title="' + href + '" target="_blank" >' 
                    + text + '</a>' : text;
        },
        punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
    };

    // Construct text content from its parts
    this.getXml = function() {
        var xmlpost; /* generic xml post holder */
        var textpost = document.createElement("div");
        var cap = document.createElement("div");
        var text = document.createElement("div");
        
        if(link){
            cap.innerHTML = '<a href="' + link + '" title="' + link + '" target="_blank" >' 
                    + caption + '</a>';
        }else{
            cap.innerHTML = linkify(caption, addBlankPageTarget);
        }
        cap.className = "textpostcaption postcaption";
        text.innerHTML = linkify(cont, addBlankPageTarget);
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

