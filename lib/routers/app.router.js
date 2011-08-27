
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
            '/rooms'        : 'showRooms',
            '/rooms/:id'    : 'joinRoom',
            '/create-room'  : 'createRoom',
            '/users'        : 'showUsers',
            '/users/:id'    : 'viewProfile',
            '/tracks'       : 'showTracks',
            '/tracks/:id'   : 'viewTrack',
            '/settings'     : 'editSettings',
            '/'             : 'home',
            '*uri'          : 'invalid',
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
            this.view.home();
        },

        showRooms : function() {
            this.view.showRooms();
        },

        createRoom : function() {
            console.log('create room');
            this.view.showCreateRoom();  
        },
        
        // join room
        joinRoom : function(slug) {
            this.view.activateRoom(slug);
        },

        showUsers : function() {
            this.view.showUsers();  
        },
        
        // join profile
        viewProfile : function(slug) {
            this.view.activateUser(slug);
        },
        
        // view track
        viewTrack : function(slug) {
        },

        editSettings : function() {
            this.view.showSettings();  
        },
        
        // default
        invalid : function(uri) {
            this.navigate('/', true);
        }
    });

}).call(this)
