// Found something send it home
chrome.extension.sendRequest({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});


contentClicker = function() {
    this.init = function(){
        document.addEventListener('click',this.clickListener,false);
    };

    this.clickListener = function(event){
        console.log(event.target);
    };
};

var cc = new contentClicker();
cc.init();

