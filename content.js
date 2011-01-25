

contentClicker = function() {

    var ImgDialog;
    var caption;
    var current_target;
    this.init = function(){
        // Create image diaglog
        ImgDialog = document.createElement('div');
        ImgDialog.className = "imgdialog";
        var label = document.createElement("label");
        label.innerHTML = "What say you:";
        label.className = "label";
        ImgDialog.appendChild(label);
        caption = document.createElement("input");
        caption.className = "caption";
        label.appendChild(caption);
        caption.addEventListener('keypress', this.sendImage, false);
        ImgDialog.style.visibility = "hidden";
        document.body.appendChild(ImgDialog);
        
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

    this.sendImage = function(event){
        if(event.keyCode == 13){
            current_target.caption = caption.value;
            chrome.extension.sendRequest(current_target, function(response) {
                console.log(response.farewell);
            });
            ImgDialog.style.visibility = "hidden";
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
            cc.createImgDialog(event.currentTarget.src, event.clientX, event.clientY);
            cc.imgFocus();
            event.returnValue = false;
            return false;
        }
    };

    this.createImgDialog = function(image, x, y){
        ImgDialog.style.visibility = "visible";
        ImgDialog.style.top = y + "px";
        ImgDialog.style.left = x + "px";
    };
};

var cc = new contentClicker();
cc.init();

