// Creating Text post from main page
this.textPostBox = function(sendPostCB) {

    // Dialog
    var textPostBox;

    // Content
    var caption;
    var content;

    // Send Post callback
    var spCB = sendPostCB;

    this.init = function(){

        var close; /* close button */
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
        postbutton.onclick = this.submitPost(this);
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

    this.sendPost = function(post){
        spCB(post);
    };

    this.submitPost = function(postbox){
        return function(event){
            // Lets send this post
            var t = new postText();
            t.setCaption(postbox.cap());
            t.setContent(postbox.con());
            // See if we are posting from repost page
            var rpurl = new RegExp("chrome-extension://.*");
            if(rpurl.test(event.currentTarget.baseURI)){
                t.setLink("");
            }else{
                t.setLink(event.currentTarget.baseURI);
            }
            t.setUuid("");
            t.setMetric("");
            postbox.sendPost(t);
            postbox.close();
        };
    };

    this.close = function(){
        this.clear();
        textPostBox.style.visibility = "hidden";
    };

    this.focus = function(){
        caption.focus();
    };

    this.clear = function(){
        caption.value = "";
        content.value = "";
    };

    this.display = function(x, y){
        textPostBox.style.visibility = "visible";
        textPostBox.style.top = y + "px";
        textPostBox.style.left = x + "px";
        this.focus();
    };
    this.init(); // Start this shit
};

