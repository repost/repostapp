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
    };

    this.submitPost = function(response) {
        if(response) {
            curpost = {cname: "imagePost", image: this.image,
                            context: this.context, caption: caption.val()};
            spCB(curpost);
        }
        displayed = false;
    };

    this.imgClickListener = function(e) {
        if(e.altKey && !displayed) {
            ipb.image = e.currentTarget.src;
            ipb.context = e.currentTarget.baseURI;
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
        $(document).keydown(this.shortcuts());
    };

    this.shortcuts = function(contentclicker){
        return function(e){
            if(e.altKey){
                var code = e.keyCode;
                var c = String.fromCharCode(code).toLowerCase();
                if(c == "t"){ // Text Post Box Popup
                    textbox.display();
                    e.returnValue = false;
                    return false;
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

