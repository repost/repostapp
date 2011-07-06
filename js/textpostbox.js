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

        textPostBox = document.createElement('div');
        caption = document.createElement("input");
        content = document.createElement("textarea");

        // Create dialog
        $(textPostBox)
            .addClass("floater textpostbox")
            // Caption
            .append($(document.createElement('label'))
                        .addClass("caption")
                        .html("Caption:"))
            .append($(caption)
                        .addClass("captioninput"))
            // Content
            .append($(document.createElement('label'))
                        .addClass("content")
                        .html("Content:"))
            .append($(content)
                        .addClass("contentinput"))
            // Post button
            .append($(document.createElement('button'))
                        .addClass("sendtext")
                        .html("Ahoy Buttercup")
                        .click(this.submitPost(this)))
            // 'X'
            .append($(document.createElement('span'))
                        .addClass("floatclose")
                        .html("x")
                        .click(this.onclickclose(this)))
            .appendTo('body');
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
            } else {
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

    this.display = function(x, y) {
        textPostBox.style.visibility = "visible";
        textPostBox.style.top = y + "px";
        textPostBox.style.left = x + "px";
        this.focus();
    };
    this.init(); // Start this shit
};

