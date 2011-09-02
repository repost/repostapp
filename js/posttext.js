(function(window, $, undefined){

    $.TextPost = function( options, element ){
        this.opts = $.extend({}, $.fn.textpost.defaults, options);
        this.element = $( element );
        this.loadFromJSON(this.opts.json);
				this.metric = this.opts.metric;
				this.uuid = this.opts.uuid;
        this._create( options );
    };

    $.TextPost.prototype = {

        // sets up widget
        _create : function( options ) {
						var addBlankPageTarget  = {
										callback: function( text, href ) {
												return href ? '<a href="' + href + '" title="' 
												+ href + '" target="_blank" >' + text + '</a>' : text;
										},
										punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
								};


            this.element.addClass('textpost');
						var cap;
						var cont;
						if(this.link){
							cap = $('<a>'+this.caption+'</a>')
											.attr('href', this.link)
											.attr('target', '_blank')
											.attr('title', this.link);
						}else{
							cap= linkify(this.caption, addBlankPageTarget);
						}
						cont = linkify(this.content, addBlankPageTarget);
            this.tpost = $('<div>').append(cap);

            this.element.append(this.tpost);
            this.element.post({uuid: this.uuid, metric: this.metric, masktext: cont});
        },

        // Load from json packed up in content
        loadFromJSON : function(content){
            this.link = content["link"];
            this.content = content["content"];
            this.caption = content["caption"];
        },

        toJSON : function() {
            var j = {
                "cname" : "postText",
                "link" : this.link,
                "content" : this.content,
                "caption" : this.caption
            };
            return j;
        }
       
    };

    $.fn.textpost = function(options) {
        if ( typeof options === 'string' ) {
            // call method
            var args = Array.prototype.slice.call( arguments, 1 );
            this.each(function(){
                var instance = $.data( this, 'textpost' );
                if ( !instance ) {
                  logError( "cannot call methods on textpost prior to initialization; " +
                    "attempted to call method '" + options + "'" );
                  return;
                }
                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
                  logError( "no such method '" + options + "' for textpost instance" );
                  return;
                }
                // apply method
                instance[ options ].apply( instance, args );
            });
        } else {
            this.each(function(){
                var instance = $.data( this, 'textpost' );
                if ( instance ) {
                  // apply options & init
                  instance.option( options || {} );
                  instance._init();
                } else {
                  // initialize new instance
                  $.data( this, 'textpost', new $.TextPost( options, this ) );
                }
            });
        }
        return this;
    };
    
    $.fn.textpost.defaults = {
        masktext: '',
        width: ''
    };

})(window, $);


