(function(window, $, undefined){

    $.ImagePost = function( options, element ){
        this.opts = $.extend({}, $.fn.imagepost.defaults, options);
        this.element = $( element );
        this.loadFromJSON(this.opts.json);
        this.metric = this.opts.metric;
        this.uuid = this.opts.uuid;
        this._create( options );
    };

    $.ImagePost.prototype = {

        // sets up widget
        _create : function( options ) {
            this.element.addClass('imagepost');

            this.ipost = $('<a>')
								.attr('href', this.context)
								.attr('target', '_blank')
                .append($('<image>').addClass('imagepreview')
                                .attr('src', this.image)
                                .attr('alt', this.caption)
                                .attr('title', this.caption));

            // only use lightbox for pics
            patt=/(jpg|png|gif|bmp)/;
            if ( this.context.match (patt))
            {
                this.ipost.addClass('lightbox');
            }
            else
            {
                this.ipost.attr('target', '_blank');
            }
            
            this.element.append(this.ipost);
            this.element.post({uuid: this.uuid, metric: this.metric, masktext: this.caption});
        },

        // Load from json packed up in content
        loadFromJSON : function(content){
            this.image = content["image"];
            this.context = content["context"];
            this.caption = content["caption"];
        },

        toJSON : function() {
            var j = {
                "cname" : "postImage",
                "image" : this.image,
                "context" : this.context,
                "caption" : this.caption
            };
            return j;
        }
       
    };

    $.fn.imagepost = function(options) {
        if ( typeof options === 'string' ) {
            // call method
            var args = Array.prototype.slice.call( arguments, 1 );
            this.each(function(){
                var instance = $.data( this, 'imagepost' );
                if ( !instance ) {
                  logError( "cannot call methods on imagepost prior to initialization; " +
                    "attempted to call method '" + options + "'" );
                  return;
                }
                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
                  logError( "no such method '" + options + "' for imagepost instance" );
                  return;
                }
                // apply method
                instance[ options ].apply( instance, args );
            });
        } else {
            this.each(function(){
                var instance = $.data( this, 'imagepost' );
                if ( instance ) {
                  // apply options & init
                  instance.option( options || {} );
                  instance._init();
                } else {
                  // initialize new instance
                  $.data( this, 'imagepost', new $.ImagePost( options, this ) );
                }
            });
        }
        return this;
    };
    
    $.fn.imagepost.defaults = {
        masktext: '',
        width: ''
    };

})(window, $);


$.fn.textWidth = function(){
      var sensor = $('<div />').css({margin: 0, padding: 0});
        $(this).append(sensor);
          var width = sensor.width();
            sensor.remove();
              return width;
};

(function(window, $, undefined){

    $.Post = function( options, element ){
        this.opts = $.extend({}, $.fn.post.defaults, options);
        this.element = $( element );
        this.metric = this.opts.metric;
        this.uuid = this.opts.uuid;
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
                                .append($('<div>').append($('<div>'+this.opts.masktext+'</div>')
                                        .addClass('postmaskcaption')))
                                .append($('<image>')
                                        .attr('src','/images/repost_r.gif')
                                        .addClass('upvote')
                                        .click($.proxy(post.upvote, post)))
                                .append($('<div>'+this.opts.metric+'</div>').addClass('metric'))
                                .append($('<image>')
                                        .attr('src','/images/repost_x.gif')
                                        .addClass('downvote')
                                        .click($.proxy(post.downvote, post)))
                                .hide();

            post.element.append(mouseover);
        },
       
        upvote : function(){
            hw.upboat(this.uuid);
        },

        downvote : function() {
            hw.downboat(this.uuid);
            ptable.deletePost(this.element);
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

        metricfn : function(value) {
            if(value){
                this.metric = value;
            } else {
                return this.metric;
            }
        },

        uuidfn : function(value) {
            if(value){
                this.uuid = value;
            } else {
                return this.uuid;
            }
        },
    };

    $.fn.post = function(options) {
        if ( typeof options === 'string' ) {
            // call method
            var args = Array.prototype.slice.call( arguments, 1 );
            this.each(function(){
                var instance = $.data( this, 'postclass' );
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
                var instance = $.data( this, 'postclass' );
                if ( instance ) {
                  // apply options & init
                  instance.option( options || {} );
                  instance._init();
                } else {
                  // initialize new instance
                  $.data( this, 'postclass', new $.Post( options, this ) );
                }
            });
        }
        return this;
    };
    
    $.fn.post.defaults = {
        masktext: '',
        width: '',
        uuid: '',
        metric: ''
    };


})(window, $);
