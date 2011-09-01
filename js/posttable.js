// helper function to get outer html
(function($) {
   $.fn.outerHTML = function() {
       return $(this).clone().wrap('<div></div>').parent().html();
   }
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
    var numentries = 0; // number of items in table
    var divtable;
    var MAX_ROWS = 4;       // dependent upon how much stuff you add
    var MAX_COLS = 4;       // Standard 4 cols wide   
    var MAX_POSTS = MAX_COLS * MAX_ROWS;

    this.createTable = function(){ 
        divtable = $('<div>').addClass('divtable');
        $('#repost').append(divtable); 
        divtable.imagesLoaded( function() {
            divtable.masonry({itemSelector: '.post'});
        });
        divtable.masonry({itemSelector: '.post'});
    }; 

    // Deletes a post from the table given rank
    this.deletePost = function(rank){
        var pos = this.rankToxy(rank);
        this.deletePostXY(pos);
    };

    // Delete a post from table given xy coords
    this.deletePostXY = function(pos){
        // hack so chrome repaints the screen nicely when downvoting
        $("#divRow"+pos.y+"Col"+pos.x).hide(0);
        $("#divRow"+pos.y+"Col"+pos.x).empty();
        numentries--;
    };

    // Deletes a post and shuffles all items in the table down.
    this.delShufflePost = function(rank){
        var pos = this.rankToxy(rank);

        for( i = rank; i < numentries; i++ ) {
            this.deletePost(i);
            if ( ( i + 1 ) > numentries ) {
                break;
            }
            var post = this.getPostXY(this.rankToxy(1+i));
            this.addPost(post,i);
        }
    };

    // Convert xy to rank
    this.xytorank = function(x,y){
       return (y*MAX_COLS + x);
    };

    // Converts a rank into a position in the table.
    this.rankToxy = function(rank){
        var y = Math.floor(rank / MAX_COLS);
        var x = (rank - MAX_COLS*y);
        return{ y:y, x:x};
    };

    // Gets the post associated with the rank.
    this.getPost = function(rank){
        var pos = this.rankToxy(rank);
        return this.getPostXY(pos);
    };
    
    // Return copy post from coord (x,y)
    this.getPostXY = function(pos) {
        var post = new postHolder();
        var postdom = $("#divRow"+pos.y+"Col"+pos.x+" .post");
        if ( postdom == null )
          return null;

        post.setXml(postdom[0]);
        return post;
    };

    // Return the uuid from the (x,y)
    this.getUuid = function(pos){
        return $("#divRow"+pos.y+"Col"+pos.x+" .post").attr("data-uuid");
    };

    // inserts a post at the given location and 
    // shuffles all posts behind it up a rank.
    this.insertPost = function(post, rank){
        // get the children
        var posts = divtable.children();
        if(posts.size() == 0) {
            divtable.append(post.getXml());   
        }else {
            $(posts[rank]).before(post.getXml());
        }
        divtable.masonry('reload');
    };

    // add the post(expecting innerHTML) to rank whatever
    // If there is a post already there is will remove it
    this.addPost = function( post, rank){
        
        // Hack to remove welcome
        if ( $("#welcome").length ) {
            $("#welcome").remove();
        }

        var pos = this.rankToxy(rank);
        var row;

        // check we got enough rows
        if ( rows <= pos.y ) {
            //row = table.insertRow(rows++);
            row = document.createElement("div");
            row.id = "divRow"+rows++;
            row.className = "divrow";
            divtable.appendChild(row);
        }
        else {
            row = document.getElementById("divRow"+pos.y);
        }

        // check if cell exists
        //var cell = row.insertCell(pos.x);
        var cell = document.getElementById("divRow"+pos.y+"Col"+pos.x);
        if ( !cell ) {
            cell = document.createElement("div");
            cell.id = "divRow"+pos.y+"Col"+pos.x;
            cell.className = "divCol"+pos.x+" divcol";
            row.appendChild(cell);
        }
        // hack so chrome repaints the screen nicely when downvoting
        $("#divRow"+pos.y+"Col"+pos.x).show(0);

        //create the general stuff
        var postspace = document.createElement("div");
        postspace.className = "postspace";
        cell.appendChild(postspace);

        var uparrow = document.createElement("image");
        uparrow.className = "uphand votehand";
        uparrow.src = "./images/hpu.png";
        postspace.appendChild(uparrow);

        var met = document.createElement("div");
        met.className = "metric";
        //met.innerHTML = post.getMetric();
        postspace.appendChild(met);

        var downarrow = document.createElement("image");
        downarrow.className = "downhand votehand";
        downarrow.src = "./images/hpd.png";
        postspace.appendChild(downarrow);

        // add some action code to the cells
        uparrow.onclick = function(){
            uparrow.src = "./images/hpuselect.png";
            var pos = ptable.rankToxy(rank);
            var uppost = ptable.getPostXY(pos);
            uppost["upvoted"] = true;
            hw.upboat(ptable.getUuid(pos));
        };

        uparrow.onmouseover = function(){
            this.parentNode.className += " rockon";
        };

        uparrow.onmouseout = function(){
            this.parentNode.className = this.parentNode.className.replace(" rockon",'')
        };

        downarrow.onmouseover = function(){
            this.parentNode.className += " fuckoff";
        };

        downarrow.onmouseout = function(){
            this.parentNode.className = this.parentNode.className.replace(" fuckoff",'')
        };

        downarrow.onclick = function(){
            //var pos = {x:this.parentNode.parentNode.cellIndex,
            //            y:this.parentNode.parentNode.parentNode.rowIndex};
            var pos = ptable.rankToxy(rank);
            hw.downboat(ptable.getUuid(pos));
            ptable.delShufflePost(rank);
        };

        /*
        postspace.onmouseover = function(){
        };
        postspace.onmouseout =  function() {
        };
        postspace.onmousedown = function(){
        };
        postspace.onmouseup = function(){
        };                
        postspace.onclick = function(){
        };            
        */
        
        numentries++;
        // Ensure that upvote highlighting follows post around table
        var postxml = post.getXml();
        if (postxml["upvoted"]){
            uparrow.src = "./images/hpuselect.png";
        }

        //var test = post.getXml();
        postspace.appendChild(post.getXml());
        cell.appendChild(postspace);

        $(".downhand").hide();
        $(".uphand").hide();
        $("#"+cell.id+" .postspace").mouseenter(function() {
            $("#"+cell.id+" .uphand").fadeIn("fast");
            $("#"+cell.id+" .downhand").fadeIn("fast");
          }).mouseleave(function() {
            $("#"+cell.id+" .uphand").fadeOut("fast");
            $("#"+cell.id+" .downhand").fadeOut("fast");
        });

        // lightbox all images
        $('a.lightbox').lightBox();
    };
    
    this.createTable();

};

