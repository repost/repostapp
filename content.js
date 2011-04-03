contentClicker = function() {

    var ImgDialog;
    var caption;
    var current_target;
    this.init = function(){
        // Create image diaglog
        RepostDialog = document.createElement('div');
        RepostDialog.className = "repostdialog";
        var label = document.createElement("label");
        label.innerHTML = "What say you:";
        label.className = "label";
        RepostDialog.appendChild(label);
        caption = document.createElement("input");
        caption.className = "caption";
        label.appendChild(caption);
        caption.addEventListener('keypress', this.sendImage, false);
        RepostDialog.style.visibility = "hidden";
        document.body.appendChild(RepostDialog);
        
        // add event listener to each image on the page
        var images = document.getElementsByTagName("img");
        for( var i = 0; i < images.length; i++ ){
            images[i].addEventListener('click',this.imgClickListener,false);
        }
        
        var vids = document.getElementsByTagName("video");
        for( var i = 0; i < vids.length; i++ ){
            vids[i].addEventListener('click',this.imgClickListener,false);
        }
    };

    this.imgFocus = function(){
        caption.focus();
    };
    
    this.imgClear = function(){
        caption.value = "";
    };

    this.sendImage = function(event){
        if(event.keyCode == 13){
            current_target.caption = caption.value;
            chrome.extension.sendRequest(current_target, function(response) {
                console.log(response.farewell);
            });
            RepostDialog.style.visibility = "hidden";
            cc.imgClear();
        }
    };

    this.imgClickListener = function(event){
        if(event.altKey){
            current_target = { type: "image",
                               caption: "",
                               src: event.currentTarget.src,
                               context: event.currentTarget.baseURI
                             };
            cc.createRepostDialog(event.currentTarget.src, event.clientX, event.clientY);
            cc.imgFocus();
            event.returnValue = false;
            return false;
        }
    };

    this.vidClickListener = function(event){
        if(event.altKey){
            current_target = { type: "video",
                               caption: "",
                               src: event.currentTarget.src,
                               context: event.currentTarget.baseURI
                            };
            cc.createRepostDialog(event.currentTarget.src, event.clientX, event.clientY);
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

