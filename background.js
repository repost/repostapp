
function sendPostToListeners(post, rank){
		var bpost = {"type":"rp_newPost", "post": post, "rank": rank};
		chrome.extension.sendRequest(bpost,
							function(response) {});
};

function startrepost() {
		var plug = document.getElementById("plugin");
		var rp = plug.rePoster();
		rp.init();
		rp.setNewPostCB(sendPostToListeners);
    var accounts = loadAccounts();
		if(accounts){
			var acc = plug.Account();
			// add saved accounts
			for(var i=0; i<accounts.length; i++){
					acc.user = accounts[i].username;
					acc.pass = accounts[i].password;
					acc.type = accounts[i].type;
					rp.addAccount(acc);
			}
		}
		rp.startRepost();
		var rep = {"plugin": plug, "repost": rp};
		// Add listener for repost plugin
		chrome.extension.onRequest.addListener(
				 function(request, sender, sendResponse) {
						if(request.type == "rp_pluginRequest"){
							sendResponse(rep); // snub them.
						}else{
							sendResponse({}); // snub them.
						}
				 }
		);
}
