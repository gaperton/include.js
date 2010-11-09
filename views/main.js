$.include({
	html : "main.html"
})	
.define( function( _ ){
	_.exports = function(){
		return $( _.html.main() );
	}
});