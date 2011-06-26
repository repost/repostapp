contentClicker = function() {

    var ImgDialog;
    var caption;
    var cur_post;

    this.init = function(){
        // Create image dialog
        RepostDialog = document.createElement('div');
        RepostDialog.className = "repostdialog";
        var label = document.createElement("label");
        label.innerHTML = "What say you:";
        label.className = "label";
        RepostDialog.appendChild(label);
        caption = document.createElement("input");
        caption.className = "caption";
        label.appendChild(caption);
        caption.addEventListener('keypress', this.sendContent, false);
        RepostDialog.style.visibility = "hidden";
        document.body.appendChild(RepostDialog);
        
        // add event listener to each image on the page
        var images = document.getElementsByTagName("img");
        for( var i = 0; i < images.length; i++ ){
            images[i].addEventListener('click',this.imgClickListener,false);
        }
    };

    this.imgFocus = function(){
        caption.focus();
    };
    
    this.imgClear = function(){
        caption.value = "";
    };

    this.sendContent = function(event){
        if(event.keyCode == 13){
            cur_post.setCaption(caption.value);
            chrome.extension.sendRequest(JSON.stringify(cur_post), 
                function(response) {
                    console.log(response.farewell);
                });
            RepostDialog.style.visibility = "hidden";
            cc.imgClear();
        }
    };

    this.imgClickListener = function(event){
        if(event.altKey){
            cur_post = new postImage();
            cur_post.setImage(event.currentTarget.src);
            cur_post.setContext(event.currentTarget.baseURI);
            cc.createRepostDialog(event.currentTarget.src,
                        event.clientX, event.clientY);
            cc.imgFocus();
            event.returnValue = false;
            return false;
        }
    };

    this.linkClickListner = function(event){
        if(event.altKey){
            cur_post = new postText();
            cur_post.setLink(event.currentTarget.baseURI);
            cc.createRepostDialog(event.currentTarget.src,
                            event.clientX, event.clientY);
            cc.imgFocus();
            event.returnValue = false;
            return false;
        }
    };

    this.createRepostDialog = function(image, x, y){
        RepostDialog.style.visibility = "visible";
        RepostDialog.style.top = y + "px";
        RepostDialog.style.left = x + "px";
    };
};

var cc = new contentClicker();
cc.init();

