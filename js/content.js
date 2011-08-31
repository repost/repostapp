this.itemPostBox = function(sendPostCB){

    // Dialog
    var itemPostBox;

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
                            .click(ipb.submitPost);
        itemPostBox = $('<div>').addClass('imagepostbox')
                                .append($('<div>Comment:</div>')
                                            .addClass('label'))
                                .repostDialog();
        $('#repost').append(itemPostBox);
        itemPostBox.repostDialog('show');
    };

    this.clear = function(){
        caption.val('');
        image = "";
    };

    this.submitPost = function(response){
        if(response){
            curpost.setCaption(caption.val());
            spCB(curpost);
        }
    };

    this.imgClickListener = function(e){
        if(e.altKey){
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

