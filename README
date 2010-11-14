What is it?
===========
include.js is javascript library, intended to simplify development of ajax and offline web applications. It makes MVC-pattern trivial, and provides widely wanted browser-side 'include' directive. It's using approach which is different from common MVC frameworks, and its approach is a lot easier to understand and use. It relies on dynamically loadable modules, and HTML templates is the first-class module type.

Yes, you can include plain JS files, JS modules without garbaging global namespace, HTML templates, HAML templates (not tested), and (soon) CSS files.

And - it can include any custom content you want if you write corresponding plug-in. HTML Templates support is written as plugin, so you already have an example. And, yes - plugins can call each other, so it's _really_ easy to write support for your own templating engine, which you wanted but afraid to implement. Just compile your language to ASP Core Templates style (which is easy to do with .replace), and that's it. 

include.js relies on excellent require.js library as the backend.

Features didgest
================
1. Complete backward compatibility with CommonJS Asynchronous modules, packages, and require.js modules. Since it's based on require.js.
2. New module API, which is far easier to understand and use than original require.js one. Module definitions looks like module definitions, and include looks like traditional include.
3. Plug-in API for custom modules with content of any type.
4. Plug-ins included:
- HTML Templates, supporting ASP and mustache style tags, and JS embedding.
- HAML Templates. I'm using github implementation, and it have not been tested yet. But - it was straightforward to add.
- TODO: CSS files. I can add templating capabilities to CSS content too, if you request.
- TODO: Inline CSS in HTML Temapltes.
5. Straightforward MVC pattern impementation, allowing to decompose your AJAX application into hierarchy of HTML+JS(+CSS) components. In case you're looking for the way to do MVC - this is an easies way ever.
6. jQuery support. You can think of include.js as an easy way to define more advanced widgets:

$.include({
    html: "my_template.html" // include template from file...
})
.define( function( _ ){ // define module...
    _.exports = function widget( $this, a_data, a_events ){ // exporting function...
        _.html.renderTo( $this, a_data ); // which expands template inside of $this.

        $this.find( "#ok").click( a_events.on_click ); // throw event up to the caller...
        $this.find( "#refresh").click( function(){
            widget( $this, a_data, a_events ); // ...and update ourself. Yep, in that easy way.
        });
    }
});

It's said, that Dojo Toolikit have better instruments for writing large AJAX applications, than jQuery. What I could say, as an author of large-scale inhouse jQuery ajax application? That used to be true, until the moment of include.js release.


Comparison with require.js API
==============================
require.js:
define( function(){
	...
	return what_to_export; // looks pretty. However:
				// - there are the mess of 'returns' in JS code - which one is export? 
				// - it's always placed at the end of file.
});

include.js:
$.define( function( _ ){
	...
	_.exports = what_to_export; // you can place it at the beginning, closer to the module interface.
				// or - you can search for it. Or - you can still use require.js style.
});

require.js:
	require( [ 'mod/one', 'mod/two', 'mod/three' ],
		function( first, second, third ){ // try to make a change in this dependency list without mistake.
			...
			return what_we_have_defined;
		});
		
include.js:
	$.include({
		first  : 'mod/one',
		second : 'mod/two',
		third  : 'mod/three'
	})
	.define( function( _ ){
		// you can refer to dependencies as _.first, _.second, _.third
		_.exports = what_we_have_defined;
	});

require.js: 
	require(["a.js", "b.js", "some/module"], function() { // Loading mix of plain .js files and 'modules'.
	    //interesting detail - what will happen with our module arguments? Have an idea?
	});

include.js:
	$.include(
		"a.js",
		"b.js",
		{
			module : "some/module"
		}
	).define( function( _ ){
		// In this case it's clear, isn't it?
	});
	
require.js: // load three modules in order...
	require(["order!one.js", "order!two.js", "order!three.js"], function () {
	    //This callback is called after the three scripts finish loading.
	});

include.js:
	$.include(
		[ "one.js", "two.js", "three.js" ], // feel the difference?
		{
			module : "some/module" // and you still can do this.
		}
	).define( function( _ ){
		//...
	});

Yep, require.js is really the great library. Unfortunately, I can't use their API. Fingers refusing to type, man. :)

MVC, and using include.js with jQuery.
======================================
Suppose you're developing single-page ajax application. In this case, you have problem with growing mess in your single HTML page. I will show how to make it really simple with include.js, demonstrating implementation of MVC pattern. 

Don't panic - MVC is performed _really_ simple in our case. Because, an only thing which is _really_ needed to perform MVC - is modules, and HTML template modules in particular. We have them, and this is enough.

1. Model - is you data. Model can be trivialy decomposed to modules, as shown above.

2. View - is the _file_ with HTML template. This file can be _included_ as regular module, under 'html' name. On inclusion, it will be compiled to JS function. Function take context, and expands the template returning HTML. It looks like this.

$.include({
	html: "template.html"
	model : "model"
})
.define( function( _ ){
...
	var plain_html = _.html( _.model.query_data() ); 
...
});

Yes, you can include multiple tempates at once. You need to specify an object with name-path pairs instead of string in 'html' property. And - then access them as _.html.yourFile. See an example for detailed templates explanation. 

3. Controller. This is the module, including Model, View, attaching event handling, and performing DOM manipulation in order to insert template instance to HTML document. It looks like this:

$.include({
	html: "template.html"
	model : "model"
})
.define( function( _ ){
	_.exports = function( $this, a_data, a_events ){
		function update(){
			// taking context out of model...
			var context = _.model.query_data( a_data );
			_.model.on_update( update ); // subscribe for model updates...
			
			// render template, inserting instance to $this jQuery object.
			_.html.renderTo( $this, context ); // yes, we support jQuery!
			
			// attach event handlers
			$this.find( '#ok' ).click( a_events.on_ok ); // ok - pass to the caller.
			$this.find( '#refresh ).click( update ); // We know how to process this event. We update ourself.
		}

		update();

		return {
			force_update : update; // return control interface to caller. Rarely needed, but important. 
		};
	}
});

So, how you design your application? Answer is simple. You decompose it to the hierarchy of controllers. Controllers include views, as HTML templates, and other controllers. Controller function in all cases do the dame things:
1) Prepare context talking to the model.
2) Render view.
3) Attach events to its templates instance.
4) Render included controllers
5) Return control object, if necessary.

Ok, _what_ is controller? It's plain function of the following kind:
function( root_DOM_node, data_or_parameters, callbacks ) -> control_object | undefined.

root_DOM_node: this is jQuery object, controller-view should be placed inside. It's responsibility of controller to perform all DOM manipulations required until the return;

data_or_parameters: if controller takes any data or parameters, it will be the second argument. Controller knows, how to process them;

callbacks: set of callbacks for event processing. Controller can pass some events up to the controllers tree.

control_object: in case some external control for controller instance is needed, this is the way how you achieve it. 

That's it. And if you don't think that this is an easiest way to do MVC ever, please, write me a letter. I'm really curious what can be easier.

How can I try it?
=================
First - see an example. This example show you complete explanation of core templates language, if you execute it. Just put the files in include.js directory under your web root, and open 'core templates.html'.

In order to evaluate it in your jquery project you need to include 'include-bootstrap' instead of your jquery.min.js, and read an exampe in order to understand, how to start the library.

Don't panic, and say 'bye' to complicated frameworks. It's is not this case. The code is really short, friendly, and easy to read.  

Why?
====
In short - because it's great to feel the kind of PHP development simplicity when working in browser.

Development of ajax and offline web applications is painful. Such application lives in the single HTML page, and there are no any standard way to hierarchically decompose large application to the number of small and reusable building blocks, incorporating parts of HTML *and* related JS.

<script> tags allows JS file inclusions, but they are unaware of dependencies.

There are module systems, based on CommonJS. And, have you looked at their API? It looks like anything, but not module specifications. And they are unaware of HTML templates, which is one natural module types.

There are dozens of JS templating libraries, but they are unaware of modules, templates are not files, and they can't be a part of module's dependency tree.

Frameworks like Dojo solve these problem, but they have quite tough learning curve.

I believe that there are no real reasons for things to be so complicated. That's why I have created this library.