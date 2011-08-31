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
        caption.val('');
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

