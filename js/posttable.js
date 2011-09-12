// helper function to get outer html
(function($) {
   $.fn.outerHTML = function() {
       return $(this).clone().wrap('<div></div>').parent().html();
   }
})(jQuery);

(function($) {
	/**
	* Resizes an inner element's font so that the inner element completely fills the outer element.
	* @author Russ Painter WebDesign@GeekyMonkey.com
	* @version 0.1
	* @param {Object} Options which are maxFontPixels (default=40), innerTag (default='span')
	* @return All outer elements processed
	* @example <div class='mybigdiv filltext'><span>My Text To Resize</span></div>
	*/
	$.fn.textfill = function(options) {
		var defaults = {
			maxFontPixels: 40,
			innerTag: 'span'
		};
		var Opts = jQuery.extend(defaults, options);
		return this.each(function() {
			var fontSize = Opts.maxFontPixels;
			var ourText = $(Opts.innerTag + ':visible:first', this);
			var maxHeight = $(this).height();
			var maxWidth = $(this).width();
			var textHeight;
			var textWidth;
			do {
				ourText.css('font-size', fontSize);
				textHeight = ourText.height();
				textWidth = ourText.width();
				fontSize = fontSize - 1;
			} while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 3);
		});
	};
})(jQuery);

// Holds the post while we move posts around
this.postHolder = function(){

    var xml;

    this.setXml = function(x){
        xml = x;
    };

    this.getXml = function(){
        return xml;
    };
}

// The repost post table which displays posts
this.posttable = function(){
 
    var rows = 0;       // dependent upon how much stuff you add
    var divtable;
    var MAX_ROWS = 4;       // dependent upon how much stuff you add
    var MAX_COLS = 4;       // Standard 4 cols wide   
    var MAX_POSTS = MAX_COLS * MAX_ROWS;

    this.createTable = function(){ 
        divtable = $('<div>').addClass('divtable');
        $('#repost').append(divtable); 
        divtable.masonry({itemSelector: '.post', isAnimated: true});
    }; 

    this.count = function() {
        return $(divtable).length;
    };
    this.min = function() {
        return MAX_POSTS;
    };

    // Deletes a post from the table given rank
    this.deleteRank = function(rank){
        // get the children
        var posts = divtable.children();
        if(rank < posts.length) {
            $(posts[rank]).remove();
        }
    };

    // Deletes all posts with a given uuid
    this.deleteUuid = function(uuid){
        // get the children
        posts = divtable.children();
        $(posts).each( function(i) {
            if ( $(this).data("uuid") == uuid ) {
                $(this).remove();
            }
        });
        divtable.masonry('reload');
    };

    // Deletes a post from the table given rank
    this.deletePost = function(post){
        // get the children
        $(post).remove();
        divtable.masonry('reload');
    };

    // Gets the post associated with the rank.
    this.getPost = function(rank){
        // get the children
        var posts = divtable.children();
        if( rank < posts.length) {
            return posts[rank]
        } else {
            return;
        }
    };
    
    // inserts a post at the given location and 
    // shuffles all posts behind it up a rank.
    this.insertPost = function(post, rank){
        // get the children
        var posts = divtable.children();
        // Do we need to make room?
        if(posts.length > 15) {
            this.deleteRank(15);
        }
        // Perform the insertion
        if(posts.length < rank || posts.length == 0) {
            divtable.append(post);   
        } else {
            $(posts[rank]).before(post);
        }
        var tp = post.find('.textpost');
        if(tp.length > 0){
            post.textfill();
            divtable.masonry('reload');
        } else {
            post.find('img').load( function() {
                divtable.masonry('reload')
            });
        }
    };

    // add the post(expecting innerHTML) to rank whatever
    // If there is a post already there is will remove it
    this.addPost = function( post, rank){
         // get the children
        var posts = divtable.children();
        // Do we need to make room?
        if(posts.length > 15) {
            this.deleteRank(15);
        }
        // Perform the insertion
        if(posts.length < rank || posts.length == 0) {
            divtable.append(post);   
        } else {
            $(posts[rank]).after(post);
        }
        post.textfill();
        divtable.masonry('reload');       
    };
    
    this.updateMetric = function(uppost) {
        var posts = divtable.children();
        var plen = posts.length;
        var i;
        for(i=0; i < plen; i++) {
            if(uppost.uuid == $(posts[i]).post('uuidfn')) {
                $(posts[i]).post('metricfn', uppost.metric);
                return;
            }
        }
    };

    this.createTable();

};

