// Found something send it home
chrome.extension.sendRequest({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});


contentClicker = function() {

    var ImgDialog
    this.init = function(){
        // Create image diaglog
        ImgDialog = document.createElement('div');
        ImgDialog.className = "imgdialog";
        var label = document.createElement("label");
        label.innerHTML = "Post Caption:";
        label.className = "label";
        ImgDialog.appendChild(label);
        var caption = document.createElement("input");
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

    this.sendImage = function(event){
        if(event.keyCode == 13){
            ImgDialog.style.visibility = "hidden";
        }
    };

    this.clickListener = function(event){
        console.log(event.target);
        if(event.altKey){
            cc.createImgDialog("hello", event.clientX, event.clientY);
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

