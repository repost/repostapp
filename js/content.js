this.itemPostBox = function(sendPostCB){

    // Dialog
    var itemPostBox;
    var displayed = false;

    // Content
    var ipb = this;
    var image;
    var caption;
    var curpost; /* captured over two events. Cleanest way */

    // Send Post callback
    var spCB = sendPostCB;

    this.init = function(){
        // add event listener to each image on the page
        var images = $('img');
        for( var i = 0; i < images.length; i++ ){
            $(images[i]).click(ipb.imgClickListener);
        }
    };

    this.createDialog = function() {

        // Create Dialog
        caption = $('<input>').addClass('caption')
                            .keypress(function(e) {
                                        if(e.which == 13) {
                                            ipb.submitPost(true);
                                            itemPostBox.confirmDialog('remove');
                                        }
                            });
        itemPostBox = $('<div>').addClass('itempostbox')
                                .append($('<div>Comment:</div>')
                                            .addClass('label'))
                                .append(caption)
                                .confirmDialog({response: $.proxy(ipb.submitPost, ipb)});
        caption.focus();
    };

    this.clear = function() {
        caption.val('');
        image = "";
    };

    this.submitPost = function(response) {
        if(response) {
            curpost.setCaption(caption.val());
            spCB(curpost);
        }
        displayed = false;
    };

    this.imgClickListener = function(e) {
        if(e.altKey && !displayed) {
            curpost = new postImage();
            curpost.setImage(e.currentTarget.src);
            image = e.currentTarget.src;
            curpost.setContext(e.currentTarget.baseURI);
            ipb.createDialog();
            e.returnValue = false;
            return false;
        }
    };

    this.init();
}

this.contentClicker = function() {

    var imagebox;
    var textbox;

    this.init = function(){
        imagebox = new itemPostBox(this.sendPost());
        textbox = new textPostBox(this.sendPost());
        $('body').append($('<div>').attr('id','repost'));
        document.addEventListener("keydown", this.shortcuts());
    };

    this.shortcuts = function(contentclicker){
        return function(e){
            if(e.altKey){
                var code = e.keyCode;
                var c = String.fromCharCode(code).toLowerCase();
                if(c == "t"){ // Text Post Box Popup
                    textbox.display();
                }
            }
        };
    };

    this.sendPost = function(){
        return function(post){
            chrome.extension.sendRequest(JSON.stringify(post), 
                    function(response) {
                    console.log(response.farewell);
                    });
        };
    };
    this.init();
};

var cc = new contentClicker();
// Creating Text post from main page
this.textPostBox = function(sendPostCB) {

    // Dialog
    var textPostBox;

    // Content
    var caption;
    var content;

    // Send Post callback
    var spCB = sendPostCB;

    this.init = function() {
    };

    this.create = function() {
        var tpb = this;
        // Caption input
        caption = $('<input>').addClass('captioninput')
                                .attr('type', 'text');
        // Comment input
        comment = $('<input>').addClass('commentinput')
                                .attr('type', 'text');
        // Create dialog
        textPostBox = $('<div>').addClass('textpostbox')
                            .append($('<div>Caption:</div>')
                                        .addClass('caption'))
                            .append(caption)
                            .append($('<div>Comment:</div>')
                                        .addClass('comment'))
                            .append(comment)
                            .confirmDialog({response: $.proxy(tpb.submitPost, tpb)});
        caption.focus();
    };

    this.sendPost = function(post){
        spCB(post);
    };

    this.submitPost = function(response){
        if(response){
            // Lets send this post
            var t = new postText();
            t.setCaption(caption.val());
            t.setContent(comment.val());
            // See if we are posting from repost page
            var rpurl = new RegExp("chrome-extension://.*");
            if(rpurl.test(event.currentTarget.baseURI)){
                t.setLink("");
            }else{
                t.setLink(event.currentTarget.baseURI);
            }
            t.setUuid("");
            t.setMetric("");
            this.sendPost(t);
        }
    };

    this.clear = function(){
        caption.value = "";
        content.value = "";
    };

    this.display = function(x, y){
        this.create();
    };
    this.init(); // Start this shit
};

