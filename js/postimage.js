
// Post Image class. Image content class.
this.postImage = function(){

    // image post specific
    var image;
    var caption;
    var context;
    
    // holders for uuid and metric
    var uuid;
    var metric;

    this.setUuid = function(u){
        uuid = u;
    };

    this.setMetric = function(m){
        metric = m;
    };

    this.setCaption = function(cap){
        caption = cap;
    };

    this.setContext = function(con){
        context = con;
    };

    this.setImage = function(i){
        image = i;
    };

    this.getUuid = function(u){
        return uuid;
    };

    this.getMetric = function(m){
        return metric;
    };

    this.getCaption = function(cap){
        return caption;
    };

    this.getContext = function(con){
        return context;
    };

    this.getImage = function(i){
        return image;
    };

    // Construct image content from its parts
    this.getXml = function() {
        var imagepost = document.createElement("div");
        imagepost.className = "imagepost"

        var previewimage = document.createElement("img");
        previewimage.className = "imagepreview";
        previewimage.src = image;
        previewimage.alt = caption;
        previewimage.title = caption;

        var contextlink = document.createElement('a');
        contextlink.href = context;
        // only use lightbox for pics
        patt=/(jpg|png|gif|bmp)/;
        if ( context.match (patt))
        {
            contextlink.className = "lightbox";
        }
        else
        {
            contextlink.target = "_blank";
        }
        contextlink.appendChild(previewimage);
        imagepost.appendChild(contextlink);

        /*
        var previewcaption = document.createElement("div");
        previewcaption.className = "imagepostcaption postcaption";
        previewcaption.innerHTML = caption;
        imagepost.appendChild(previewcaption);
        */
        var xmlpost = xmlPost(uuid, metric);
        xmlpost.appendChild(imagepost);
        return xmlpost;
    };
    
    // Load from json packed up in content
    this.loadFromJSON = function(content){
        image = content["image"];
        context = content["context"];
        caption = content["caption"];
    };

    this.toJSON = function() {
        var j = {
            "cname" : "postImage",
            "image" : image,
            "context" : context,
            "caption" : caption
        };
        return j;
    };
};

(function(window, $, undefined){

    $.Post = function( options, element ){
        this.opts = $.extend({}, $.fn.repostDialog.defaults, options);
        this.element = $( element );
        this._create( options );
    };

    $.Post.prototype = {

        // sets up widget
        _create : function( options ) {

            var post = this;
            post.element.addClass('post')
                    .mouseover($.proxy(post.mover, post))
                    .mouseout($.proxy(post.mout, post));
            var mouseover = $('<div>').addClass('postmask')
                                .append($('<image>')
                                        .attr('src','/images/hpu.png')
                                        .addClass('uphand')
                                        .addClass('votehand')
                                        .click($.proxy(post.upvote, post)))
                                .append($('<div>100</div>').addClass('metric'))
                                .append($('<image>')
                                        .attr('src','/images/hpd.png')
                                        .addClass('downhand')
                                        .addClass('votehand')
                                        .click($.proxy(post.downvote, post)))
                                .hide();

            post.element.append(mouseover);
        },
       
        upvote : function(){
                uparrow.src = "./images/hpuselect.png";
                var pos = ptable.rankToxy(rank);
                var uppost = ptable.getPostXY(pos);
                uppost["upvoted"] = true;
                hw.upboat(ptable.getUuid(pos));
        },

        downvote : function() {
            var pos = ptable.rankToxy(rank);
            hw.downboat(ptable.getUuid(pos));
            ptable.delShufflePost(rank);
        },

        mover : function() {
            var post = this;
            var postmask = post.element.children('.postmask');
            postmask.show();
        },
        
        mout : function() {
            var post = this;
            var postmask = post.element.children('.postmask');
            postmask.hide();
        },

        metric : function() {
        },

        uuid : function() {
        },
    };

    $.fn.post = function(options) {
        if ( typeof options === 'string' ) {
            // call method
            var args = Array.prototype.slice.call( arguments, 1 );
            this.each(function(){
                var instance = $.data( this, 'post' );
                if ( !instance ) {
                  logError( "cannot call methods on repostDialog prior to initialization; " +
                    "attempted to call method '" + options + "'" );
                  return;
                }
                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
                  logError( "no such method '" + options + "' for post instance" );
                  return;
                }
                // apply method
                instance[ options ].apply( instance, args );
            });
        } else {
            this.each(function(){
                var instance = $.data( this, 'post' );
                if ( instance ) {
                  // apply options & init
                  instance.option( options || {} );
                  instance._init();
                } else {
                  // initialize new instance
                  $.data( this, 'post', new $.Post( options, this ) );
                }
            });
        }
        return this;
    };
    
    $.fn.post.defaults = {

    };

})(window, $);
