// Found something send it home
chrome.extension.sendRequest({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});


contentClicker = function() {

    var ImgDialog
    this.init = function(){
       ImgDialog = document.createElement('div');
        ImgDialog.setAttribute('class', 'imgdialog');
        ImgDialog.style.visibility = 'hidden';
        document.body.appendChild(ImgDialog);

        document.addEventListener('click',this.clickListener,false);
    };

    this.clickListener = function(event){
        console.log(event.target);
        cc.createImgDialog("hello");
    };

    this.createImgDialog = function(image){
        caption = document.createElement("input");
        ImgDialog.appendChild(caption);
        ImgDialog.style.visibility = 'visible';
    };
};

var cc = new contentClicker();
cc.init();

