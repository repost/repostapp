this.imagePostBox = function(sendPostCB){
		
	// Dialog
	var imagePostBox;

	// Content
	var image;
	var caption;
	var curpost; /* captured over two events. Cleanest way */

	// Send Post callback
	var spCB = sendPostCB;

	this.init = function(){

		var close; /* close button */
		var label; /* temp label */
		var postbutton; /* send that text */

		// Create Dialog
		imagePostBox = document.createElement('div');
		imagePostBox.className = "repostdialog";
		// Caption
		label = document.createElement("label");
		label.innerHTML = "What say you:";
		label.className = "label";
		caption = document.createElement("input");
		caption.className = "caption";
		caption.addEventListener('keypress', this.submitPost(), false);
		label.appendChild(caption);
		imagePostBox.appendChild(label);
		imagePostBox.style.visibility = "hidden";
		// 'X'
		close = document.createElement("span");
		close.innerHTML = "x";
		close.className = "floatclose";
		close.onclick = this.onclickclose(this);
		imagePostBox.appendChild(close);
		// Append
		document.body.appendChild(imagePostBox);

		// add event listener to each image on the page
		var images = document.getElementsByTagName("img");
		for( var i = 0; i < images.length; i++ ){
			images[i].addEventListener('click',this.imgClickListener(),false);
		}

	};

	this.onclickclose = function(popup){
			return function(){
					popup.close();
			};
	};

	this.close = function(){
        this.clear();
        imagePostBox.style.visibility = "hidden";
	};

	this.clear = function(){
        caption.value = "";
        image.value = "";
  };

	this.focus = function(){
		caption.focus();
	};

	this.submitPost = function(postbox){
		return function(event){
			if(event.keyCode == 13){
				curpost.setCaption(caption.value);
				spCB(curpost);
				imagePostBox.style.visibility = "hidden";
				postbox.clear();
			}
		};
	};

	this.imgClickListener = function(postbox){
		return function(event){
			if(event.altKey){
				curpost = new postImage();
				curpost.setImage(event.currentTarget.src);
				curpost.setContext(event.currentTarget.baseURI);
				postbox.createimagePostBox(event.currentTarget.src,
						event.clientX, event.clientY);
				postbox.focus();
				event.returnValue = false;
				return false;
			}
		};
	};

	this.display = function(image, x, y){
		imagePostBox.style.visibility = "visible";
		imagePostBox.style.top = y + "px";
		imagePostBox.style.left = x + "px";
	};

	this.init();

}

contentClicker = function() {

	var imagebox;
	var textbox;

	this.init = function(){
		imagebox = new imagePostBox(sendPost());
		textbox = new textPostBox(sendPost());
		document.addEventListener("keydown", shortcuts);
	};

	this.shortcuts = function(contentclicker){
		return function(e){
			if(e.altKey){
				var code = e.keyCode;
				var c = String.fromCharCode(code).toLowerCase();
				if(c == "t"){ // Text Post Box Popup
					textbox.display();
				}
			}
		};
	};

	this.sendPost = function(){
			return function(post){
	    chrome.extension.sendRequest(JSON.stringify(cur_post), 
			    function(response) {
			        console.log(response.farewell);
			     });
			};
	};
	this.init();
};

var cc = new contentClicker();

