// Copyright 2010, Vlad Balin aka "Gaperton".
// Dual licensed under the MIT or GPL Version 2 licenses.

// Include.js wrapper for require.js
//==================================
$.include = function() {
	// Content plugin interface
	// ------------------------
	function DummyPlugIn( a_path ){
		// translate resource address
		this.path = function(){ return a_path; }
	}
	// content transformation...
	DummyPlugIn.prototype.content = function( a_content ){ return a_content; };

	// Helper class to handle require.js interaction
	// ---------------------------------------------
	function Context(){
		var _context = {};
		
		// module's path array for require.js 'define' call 
		this.paths = [];
		
		// handler's array to create the context for include.js body function
		var _args = [];		

		// add new variable to context, and take care of plugins...
		this.add = function( a_name, a_path, a_subname ){
			var plugin = a_name in $.include.plugins ?
							new $.include.plugins[ a_name ]( a_path )
							: new DummyPlugIn( a_path );
			
			this.paths.push( plugin.path() );			
			
			_args.push( function( a_value ){
				// transform value, if plugin is present...
				var value = plugin.content( a_value );
				
				// assign value to the context...
				if( a_subname ){
					_context[ a_name ][ a_subname ] = value;	
				}else{
					_context[ a_name ] = value;
				}				
			});
		}

		// create callback for require.js define function
	    this.on_load = function( a_body_f ){
	        return function() {
				// fill context...
	            for( var i = 0; i < _args.length; i++ ){
	                _args[ i ]( arguments[ i ] );
	            }

				// call module's body...
				_context.exports = {};
	            var res = a_body_f( _context );
	            return res ? res : _context.exports;
	        };
	    }
	}

	// Include interface function definition
	// -------------------------------------
    function include() {
		// initialize plugins at the first run...		
        var _scripts = [];
		var _context = new Context();

		// loop through include's arguments...
        for( var i = 0; i < arguments.length; i++ ) {
            var arg = arguments[ i ];

            if( arg instanceof Array ){
                // Ordered load of plain js scripts...
                for( var j in arg ) {
                    _scripts.push( "order!" + arg[ j ] );
                }
            }
			else if( typeof arg == "string" ){
                // Unordered load of plain js scripts...
                _scripts.push( arg );
            }else{
                // Load require.js modules & other content... 
                for( var name in arg ) {
                    var path = arg[ name ];
					
					if( typeof path == "string" ){
						_context.add( name, path );
					}else{
						for( var subname in path ){
							_context.add( name, path[ subname ], subname );
						}
					}
                }
            }
        }

		// create paths array for require.js
        var _paths = _context.paths.concat( _scripts );

        return {
            main: function( a_body_f ) {
				$(function(){ //TODO: detect if jQuery is not used...
	                if( $.include.settings )
	                	require( include.settings, _paths, _context.on_load( a_body_f ) );
	                else
	                	define( _paths, _context.on_load( a_body_f ) )
				});
            },
            define: function( a_body_f ){
                return define( _paths, _context.on_load( a_body_f ) );
            }
        };
	}
	
	include.plugins = {};
	
	return include;
}();