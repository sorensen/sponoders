
// Application Router
// ------------------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Routers = root.Routers;
    if (typeof Routers === 'undefined') Routers = root.Routers = {};
    if (typeof exports !== 'undefined') module.exports = Routers;
    
    Routers.Application = Backbone.Router.extend({
    
        // routes
        routes : {
            '/rooms/:id'  : 'joinRoom',
            '/users/:id'  : 'viewProfile',
            '/tracks/:id' : 'viewTrack',
            '/'           : 'home',
            '*uri'        : 'invalid',
        },
        
        //###initialize
        initialize : function(options) {
            this.view = new Views.ApplicationView({
                el : $('#application')
            });
            this.view.router = this;
        },
        
        // home
        home : function() {
        },
        
        // join room
        joinRoom : function(slug) {
        },
        
        // join profile
        viewProfile : function(slug) {
        },
        
        // view track
        viewTrack : function(slug) {
        },
        
        // default
        invalid : function(uri) {
            this.navigate('/', true);
        }
    });

}).call(this)
