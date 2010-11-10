// Copyright 2010, Vlad Balin aka "Gaperton".
// Dual licensed under the MIT or GPL Version 2 licenses.

// Core Templates plugin
// =====================================
// Mustache and ASP styles are natively supported.
// {{ expr }} or <%= expr %> - inline result of expression
// {- code -} or <% code %>  - inject arbitrary JavaScript
// {-- section_name --} or <%@ section_name %>
//							 - define template's section

// Please, do NOT add more template markup to this plug-in.
// It's intended to be the base for other plug-ins. 

$.include.plugins.html = function(){
	// ASP-style template compiler
	//------------------------------------
	function compileSection( a_str ){
        var fun = "var $1=_$1?_$1:{};var p=[],print=function(){p.push.apply(p,arguments);};"
	            + "with($1){p.push('"
	            + a_str
				.replace( /[\r\t\n]/g, " " )
				.replace( /'(?=[^%]*%>)/g, "\t" )
				.split( "'" ).join( "\\'" )
				.split( "\t" ).join( "'" )
				.replace( /<%=(.+?)%>/g, "',$1,'" )
				.split( "<%" ).join( "');" )
                .split( "%>" ).join( "p.push('" )
	            + "');}return p.join('');";

        return new Function( "_$1,$2,$3", fun );
    }
	
	function trim_spaces( a_string ){
		return a_string.replace( /^\s*/, "").replace( /\s*$/, "" );
	} 
	// Template object with section's support
	//---------------------------------------
	function createTemplate( a_string ){
		// parse sections...
        var x = a_string.split( /<%@(.+?)%>/ );

		function template( a_data ){
			return template.__default_section( a_data );
		}
	
		function render_f( $this, a_context ){
			return $this.html( this.call( template, a_context ) );
		}
		
		// parse default section...
		template.__default_section = compileSection( x[ 0 ] );
		template.renderTo = render_f;
		
		// for each section...
        for( var i = 1; i < x.length; i += 2 ){

			// create template function...
            var section_f = compileSection( x[ i + 1 ] );
			section_f.renderTo = render_f;
			
			// add section template to the object... 
            var name       = x[ i ].replace( /^\s*/, "").replace( /\s*$/, "" );
            template[ name ] = section_f;
        }

		return template;
    }
    
	// Define core templates plug-in...
	//---------------------------------
	function PlugIn( a_path ){
		// handle path...
		var _root = "";

		if( $.include.settings && $.include.settings.html ){
			_root = $.include.settings.html.root;
		}
		
		
		var _path = "text!" + _root + a_path;
		
		this.path = function(){ return _path; }
	};

	// mustache to ASP template style compiler...
	//-------------------------------------------
	function mustache2asp( a_text ){
		return a_text
				.replace( /{--(.+?)--}/g, "<%@$1%>" )
				.replace( /{-(.+?)-}/g, "<%$1%>" )
				.replace( /{{(.+?)}}/g, "<%=$1%>" );
	}
	
	PlugIn.prototype.content = function( a_text ){		
       	return createTemplate( mustache2asp( a_text ) );
	};
	
	// make core template functionality available for other plug-ins...
	PlugIn.compileModule  = createTemplate;
	PlugIn.compileSection = compileSection;
	PlugIn.mustache2asp   = mustache2asp;
	return PlugIn;
}();

// Initial jQuery support for templates.
// $( something ).render( templateOrSection, context )
// should render template in the given context inside given jQuery element.
$.fn.render = function( a_template, a_data ){
	return a_template.renderTo( this, a_data );
}