$.include({ 		   // include...
	html : "main.html" // ...html template for main page. 
					   // Since html root is set in $.include.settings object, 
					   // it will take the file from html/ dir.
})	
.define( function( _ ){ // define module...
	_.exports = function( $this ){ // ...which exports function, taking jQuery object as parameter...
		_.html.renderTo( $this, {
			tags : [
				{ desc: 'Inline result of JS expression',
				  mustache: '{{ expression }}',
				  asp: '<%= expression %>' },
				{ desc: 'Insert arbitrary JS code',
				  mustache: '{- code; code; code; -}',
				  asp: '<% code; code; code; %>' }
			],
		
			sections : [
			{ desc: 'Define template section',
			  mustache: '{-- name --}',
			  asp: '<%@ name %>' }			
			],
			block: '{-}', end: '{-}-}'
		});// ...rendering template to the content of $this parameter.
	}
});