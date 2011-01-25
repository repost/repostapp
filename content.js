

contentClicker = function() {

    var ImgDialog;
    var caption;

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
            images[i].addEventListener('click',this.clickListener,false);
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
            var target = { caption: caption.value, 
                           src: "fasasdas.jpg",
                           context: "asdsdad.asdas"
                         };
            chrome.extension.sendRequest(target, function(response) {
                console.log(response.farewell);
            });
            ImgDialog.style.visibility = "hidden";
            cc.imgClear();
        }
    };

    this.clickListener = function(event){
        console.log(event.target);
        if(event.altKey){
            cc.createImgDialog("hello", event.clientX, event.clientY);
            cc.imgFocus();
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

