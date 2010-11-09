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

// TODO: add default section support!
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
	function CoreTemplate( a_string ){
		// parse sections...
        var x = a_string.split( /<%@(.+?)%>/ );

		// parse default section...
		var defaultSection = x[ 0 ];
		if( defaultSection)
		
		// for each section...
        for( var i = x.length % 2; i < x.length; i += 2 ){

			// create template function...
            var template_f = compileSection( x[ i + 1 ] );

			// add section template to the object... 
            var name       = x[ i ].replace( /^\s*/, "").replace( /\s*$/, "" );
            this[ name ]   = template_f;
        }
    }
    
	// Define core templates plug-in...
	//---------------------------------
	function PlugIn( a_path ){
		// handle path...
		var _root = "";

		if( $.include.settings && $.include.settings.html ){
			_root = $.include.settings.html.root;
		}

		//TODO: set extension to .html if not present
		var _path = "text!" + _root + a_path;
		
		this.path = function(){ return _path; }
	};

	// mustache to ASP template style compiler...
	//-------------------------------------------
	function mustache2asp( a_text ){
		return a_text
				.replace( /{--(.+?)--}/g, "<%@$1%>" )
				.replace( /{-(.+?)-}/g, "<%$1%>" )
				replace( /{{(.+?)}}/, "<%=$1%>" );
	}
	
	PlugIn.prototype.content = function( a_text ){		
       	return new CoreTemplate( mustache2asp( a_text ) );
	};
	
	// make core template functionality available for other plug-ins...
	PlugIn.CoreTemplate   = CoreTemplate;
	PlugIn.compileSection = compileSection;
	PlugIn.mustache2asp   = mustache2asp;
	return PlugIn;
}();