// Feed URL.
var feedUrl = 'http://news.google.com/?output=rss';

// A generic onclick callback function.
function repostOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
}

// Create one test item for each context type.
var contexts = ["selection","link","image","video","audio"];

for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = "repost that '" + context ;
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": repostOnClick});
  console.log("'" + context + "' item:" + id);
}

var fu = "http://1.bp.blogspot.com/_3aZSroALBqY/THViBPqdmII/AAAAAAAAAMM/AuWtXUQu64c/s1600/fuck-you-i-am-cat.jpg"

// The XMLHttpRequest object that tries to load and parse the feed.
var reposter= document.getElementById("pluginId");

function main() {
    //create new reposter
    //reposter = new Repost();
    //reposter.sethandleResponse = handleResponse;
    //repost.go();
    handleResponse();
}

// Handles feed parsing errors.
function handleFeedParsingFailed(error) {
  var feed = document.getElementById("feed");
  feed.className = "error";
  feed.innerText = "Error: " + error;
}

// Handles errors during the XMLHttpRequest.
function handleError() {
  handleFeedParsingFailed('Failed to fetch RSS feed.');
}

// Handles parsing the feed data we got back from XMLHttpRequest.
function handleResponse() {
  var doc = fu;
  if (!doc) {
    handleFeedParsingFailed("Not a valid feed.");
    return;
  }
  buildPreview(doc);
}

// The maximum number of feed items to show in the preview.
var maxFeedItems = 5;

// Where the more stories link should navigate to.
var moreStoriesUrl;

function buildPreview(doc) {
  // Construct the iframe's HTML.
    var body_src =  "<img src=\"" + doc + "\" />"
    page = document.getElementById("repost");
    var item = document.createElement("div");
    var image = document.createElement("image");
    image.className = "item_title";
    // Give title an ID for use with ARIA
    image.name = "testimage"
    image.src = fu;
    item.appendChild(image);
    page.appendChild(item);
}

// Show |url| in a new tab.
function showUrl(url) {
  // Only allow http and https URLs.
  if (url.indexOf("http:") != 0 && url.indexOf("https:") != 0) {
    return;
  }
  chrome.tabs.create({url: url});
}

function moreStories(event) {
  showUrl(moreStoriesUrl);
}

function keyHandlerShowDesc(event) {
// Display content under heading when spacebar or right-arrow pressed
// Hide content when spacebar pressed again or left-arrow pressed
// Move to next heading when down-arrow pressed
// Move to previous heading when up-arrow pressed
  if (event.keyCode == 32) {
    showDesc(event);
  } else if ((this.parentNode.className == "item opened") &&
           (event.keyCode == 37)) {
    showDesc(event);
  } else if ((this.parentNode.className == "item") && (event.keyCode == 39)) {
    showDesc(event);
  } else if (event.keyCode == 40) {
    if (this.parentNode.nextSibling) {
      this.parentNode.nextSibling.children[1].focus();
    }
  } else if (event.keyCode == 38) {
    if (this.parentNode.previousSibling) {
      this.parentNode.previousSibling.children[1].focus();
    }
  }
}

function showDesc(event) {
  var item = event.currentTarget.parentNode;
  var items = document.getElementsByClassName("item");
  for (var i = 0; i < items.length; i++) {
    var iframe = items[i].getElementsByClassName("item_desc")[0];
    if (items[i] == item && items[i].className == "item") {
      items[i].className = "item opened";
      iframe.contentWindow.postMessage("reportHeight", "*");
      // Set the ARIA state indicating the tree item is currently expanded.
      items[i].getElementsByClassName("item_title")[0].
        setAttribute("aria-expanded", "true");
      iframe.tabIndex = 0;
    } else {
      items[i].className = "item";
      iframe.style.height = "0px";
      // Set the ARIA state indicating the tree item is currently collapsed.
      items[i].getElementsByClassName("item_title")[0].
        setAttribute("aria-expanded", "false");
      iframe.tabIndex = -1;
    }
  }
}

function iframeMessageHandler(e) {
  // Only listen to messages from one of our own iframes.
  var iframes = document.getElementsByTagName("IFRAME");
  for (var i = 0; i < iframes.length; i++) {
    if (iframes[i].contentWindow == e.source) {
      var msg = JSON.parse(e.data);
      if (msg) {
        if (msg.type == "size") {
          iframes[i].style.height = msg.size + "px";
        } else if (msg.type == "show") {
          var url = msg.url;
          if (url.indexOf("http://news.google.com") == 0) {
            // If the URL is a redirect URL, strip of the destination and go to
            // that directly.  This is necessary because the Google news
            // redirector blocks use of the redirects in this case.
            var index = url.indexOf("&url=");
            if (index >= 0) {
              url = url.substring(index + 5);
              index = url.indexOf("&");
              if (index >= 0)
                url = url.substring(0, index);
            }
          }
          showUrl(url);
        }
      }
      return;
    }
  }
}

window.addEventListener("message", iframeMessageHandler);

