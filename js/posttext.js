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
            
            // Check text lengths to determire style
            if(this.caption.length < 20 && this.content.length < 20) {
                this.element.addClass('size1');
            } else if(this.caption.length < 75 && this.content.length < 50) {
                this.element.addClass('size2');
            } else {
                this.element.addClass('size3');
            }
            this.element.addClass('textpost');
            this.tpost = $('<span>'+this.caption+'</span>');
            this.element.append(this.tpost);
            this.element.post({uuid: this.uuid, metric: this.metric, masktext: this.content});
        },

        metric : function(value) {
            return this.element.post('metric', value);
        },

        uuid : function(value) {
            return this.element.post('uuid', value);
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


