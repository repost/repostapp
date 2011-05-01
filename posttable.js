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
    var cols = 5;       // Standard 5 cols wide   
    var numentries = 0; // number of items in table
    var table;          // table instance 
    var tableover = false; // Mouse currently over table
    
    var plugin; // the repost plugin instance
    var hw; // a post object

    this.createTable = function(){ 
        var page = document.getElementById("repost"); 
        table = document.createElement("table"); 
        page.appendChild(table); 
    }; 

    // Deletes a post from the table given rank
    this.deletePost = function(rank){
        var pos = this.rankToxy(rank);
        this.deletePostXY(pos);
    };

    // Delete a post from table given xy coords
    this.deletePostXY = function(pos){
        var contents = table.rows[pos.y].deleteCell(pos.x);
        if( table.rows[pos.y].cells.length == 0 ){
             table.deleteRow(pos.y);
             rows--;
        }
        numentries--;
    };

    // Deletes a post and shuffles all items in the table down.
    this.delShufflePost = function(rank){
        var pos = this.rankToxy(rank);
        var r = rank;

        for( i = pos.y; i < rows; i++ ){
            this.deletePost(r);
            if( (i+1) >= rows ){
                break;
            }
            var post = this.getPost((1+i)*cols);
            this.addPost(post,((1+i)*cols-1));
            r = (1+i)*cols;
        }
    };

    // Convert xy to rank
    this.xytorank = function(x,y){
       return (y*cols + x);
    };

    // Converts a rank into a position in the table.
    this.rankToxy = function(rank){
        var y = Math.floor(rank / cols);
        var x = (rank - cols*y);
        return{ y:y, x:x};
    };

    // Gets the post associated with the rank.
    this.getPost = function(rank){
        var pos = this.rankToxy(rank);
        return this.getPostXY(pos);
    };
    
    // Return post from coord (x,y)
    this.getPostXY = function(pos){
        var contents = table.rows[pos.y].cells[pos.x].children[0].children;
        for(x=0; x<contents.length;x++){
            if(contents[x].className == "post"){
                var post = new postHolder();
                post.setXml(contents[x]);
                return post;
            }
        }
        return null;
    };

    // Return the uuid from the (x,y)
    this.getUuid = function(pos){
        var postcon = this.getPostXY(pos).getXml();
        return postcon.attributes["data-uuid"].value;
    };

    // inserts a post at the given location and 
    // shuffles all posts behind it up a rank.
    this.insertPost = function(post, rank){
        //insert at position
        this.addPost(post,rank);
	    var pos = this.rankToxy(rank);
        var i = pos.y;
        while( table.rows[i].cells.length > cols ){
            var pos;
            pos.x = table.rows[i].cells.length - 1;
            pos.y = i;
            var post = this.getPostXY(pos);
            this.addPost(post,((1+i)*cols));
            this.deletePostXY(pos);
            i++;
        }
    };

    // add the post(expecting innerHTML) to rank whatever
    // If there is a post already there is will remove it
    this.addPost = function( post, rank){
 
        var pos = this.rankToxy(rank);
        var row;
        // check we got enough rows
        if((rows) <= pos.y){
            row = table.insertRow(rows++);
        }else{
	        row = table.rows[pos.y];
        }

        // check if cell exists
        var cell = row.insertCell(pos.x);
        // check we go the cel
        cell.className = "postcell";

        //create the general stuff
        var postspace = document.createElement("div");
        postspace.className = "postspace";
        cell.appendChild(postspace);

        var uparrow = document.createElement("image");
        uparrow.className = "uphand votehand";
        uparrow.src = "./hpu.png";
        postspace.appendChild(uparrow);

        var met = document.createElement("div");
        met.className = "metric";
        //met.innerHTML = post.getMetric();
        postspace.appendChild(met);

        var downarrow = document.createElement("image");
        downarrow.className = "downhand votehand";
        downarrow.src = "./hpd.png";
        postspace.appendChild(downarrow);

        // add some action code to the cells
        uparrow.onclick = function(){
            uparrow.src = "./hpuselect.png";
            var pos = {x:this.parentNode.parentNode.cellIndex,
                        y:this.parentNode.parentNode.parentNode.rowIndex};
            if ( plugin === undefined )
            {
                plugin = document.getElementById("plugin");
                hw = plugin.Post();
            }
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
            var pos = {x:this.parentNode.parentNode.cellIndex,
                        y:this.parentNode.parentNode.parentNode.rowIndex};
            if ( plugin === undefined )
            {
                plugin = document.getElementById("plugin");
                hw = plugin.Post();
            }
            hw.downboat(ptable.getUuid(pos));
            ptable.delShufflePost(ptable.xytorank(pos.x,pos.y));
        };

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
        
        numentries++;
        postspace.appendChild(post.getXml());
        table.rows[pos.y].cells[pos.x].appendChild(postspace);
    };
    
    this.createTable();

};

