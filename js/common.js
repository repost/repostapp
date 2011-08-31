// Confirm Dialog
// Repost dialog with the permanent addition of an ok and cancel
(function(window, $, undefined){

    $.fn.confirmDialog = function(options) {
        var opts = $.extend({}, $.fn.confirmDialog.defaults, options);
        
        var ok = function(sf){
            opts.response(true);
            $(sf).repostDialog('remove');
        };

        var cancel = function(sf){
            opts.response(false);
            $(sf).repostDialog('remove');
        };

        return this.each(function(){
            var sf = this;  
            $(this).addClass("confirmation")
                .append($('<button>Ok</button>')
                            .addClass('ok')
                            .click(function(){ok(sf)}))
                .append($('<button>Cancel</button>')
                            .addClass('cancel')
                            .click(function(){cancel(sf)}))
                .repostDialog({'modal': true, 
                                'centred': true});
            $('#repost').append(this);
            $(this).repostDialog('show');
        });
    };
    
    $.fn.confirmDialog.defaults = {
        response: function(){}
    };

})(window, $);   

// Repost Dialog
// JQuery plugin that turns a div into a nice float
// that can be modal, draggable and with a 'x' close 
// button
(function(window, $, undefined){

    $.Dialog = function( options, element ){
        this.opts = $.extend({}, $.fn.repostDialog.defaults, options);
        this.element = $( element );
        this._create( options );
    };

    $.Dialog.prototype = {

        // sets up widget
        _create : function( options ) {
            var dialog = this;
            this.element
                    .hide()
                    .attr('id', 'rpdialog')
                    .append($('<img src=' + chrome.extension.getURL('images/repost_x.gif>'))
                        .addClass('floatclose')
                        .click(function(){dialog.remove()}));
            if(this.opts.draggable == true){
                 this.element.mousedown(function(e){dialog.mdown(e)})
                            .mouseup(function(e){dialog.mup(e)});
            }
        },

        mdown : function(e){
            var dialog = this;
            this.offsetx = dialog.element.offset().left;
            this.offsety = dialog.element.offset().top;
            this.startx = e.clientX;
            this.starty = e.clientY;
            $(document).mousemove(function(e){dialog.mmove(e)});
        },

        mmove : function(e){
            var dialog = this;
            dialog.element.offset({top: this.offsety + e.clientY - this.starty,  
                        left: this.offsetx + e.clientX - this.startx});
        },

        mup : function(e){
            $(document).unbind('mousemove');
        },

        show : function(x, y){
            var dialog = this;
            // Keep moving indexes outwards
            var zindex = parseInt($('#mask').css('z-index'));
            dialog.element.css({'z-index': zindex+4});

            if(this.opts.modal == true){
                $('#mask').css({'z-index': zindex+3});
                // Get the screen height and width
                var maskHeight = $(document).height();
                var maskWidth = $(window).width();

                // Set height and width to mask to fill up the whole screen
                $('#mask').css({'width':maskWidth,'height':maskHeight});

                // transition effect     
                $('#mask').fadeIn(500);    
                $('#mask').fadeTo("slow",0.8);  
                $('#mask').show();
            }
            if(this.opts.centred == true){
                //Get the window height and width
                var winH = $(window).height();
                var winW = $(window).width();
                this.element.css({'top': winH/2-this.element.height()/2, 
                                    'left': winW/2-this.element.width()/2})
            } else if( x && y) {
                this.element.css({'top': y,
                                    'left': x});
            }
            this.element.show();
        },
        
        remove : function(){
            var kthis = this;
            this.element.fadeOut('fast', function() {
                                    kthis.opts.closefunc(kthis.element);
                                    });
            if(this.opts.modal == true){
                var zindex = parseInt($('#mask').css('z-index'));
                $('#mask').css('z-index', zindex-3);
                if( (zindex-3) <= 9000){
                    $('#mask').hide();
                }
            }
        },

    };

    $.fn.repostDialog = function(options) {
        if ( typeof options === 'string' ) {
            // call method
            var args = Array.prototype.slice.call( arguments, 1 );
            this.each(function(){
                var instance = $.data( this, 'rpdialog' );
                if ( !instance ) {
                  logError( "cannot call methods on repostDialog prior to initialization; " +
                    "attempted to call method '" + options + "'" );
                  return;
                }
                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
                  logError( "no such method '" + options + "' for repostDialog instance" );
                  return;
                }
                // apply method
                instance[ options ].apply( instance, args );
            });
        } else {
            this.each(function(){
                var instance = $.data( this, 'rpdialog' );
                if ( instance ) {
                  // apply options & init
                  instance.option( options || {} );
                  instance._init();
                } else {
                  // initialize new instance
                  $.data( this, 'rpdialog', new $.Dialog( options, this ) );
                }
            });
        }
        return this;
    };
    
    $.fn.repostDialog.defaults = {
        modal: true,
        centred: true,
        draggable: true,
        closefunc: function(el){el.remove();}
    };
})(window, $);
