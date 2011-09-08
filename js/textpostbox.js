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
        comment = $('<textarea>').addClass('commentinput');
                                //.attr('type', 'text');
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
        caption.val('');
    };

    this.sendPost = function(post){
        spCB(post);
    };

    this.submitPost = function(response){
        if(response){
            var link;
            // See if we are posting from repost page
            var rpurl = new RegExp("chrome-extension://.*");
            if(rpurl.test(event.currentTarget.baseURI)){
                link = "";
            }else{
                link = event.currentTarget.baseURI;
            }
            // Lets send this post
            var t = { cname: "postText", caption: caption.val(), content: comment.val(),
                               link: link};
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

