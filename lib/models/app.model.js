
// Application model
// -----------------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Models = root.Models;
    if (typeof Models === 'undefined') Models = root.Models = {};
    if (typeof exports !== 'undefined') module.exports = Models;
    
    Models.ApplicationModel = Backbone.Model.extend({
    
        // Server settings
        type    : 'application',
        urlRoot : 'app',
        
        initialize : function(options) {
            var self = this;

            // history
            var history = _.after(2, function() {
                Backbone.history.start();
                self.view.loaded();
            });

            // user collection
            this.users = new Models.UserCollection();
            this.users.url = this.url() + ':users';
            if (bootstrap.users && bootstrap.users.length) {
                this.users.reset(bootstrap.users);
                history();
            } else {
                this.users.fetch({
                    query   : {},
                    success : function(resp) {
                        history();
                    }
                });
            }
            
            // room collection
            this.rooms = new Models.RoomCollection();
            this.rooms.url = this.url() + ':rooms';
            if (bootstrap.rooms && bootstrap.rooms.length) {
                this.rooms.reset(bootstrap.rooms);
                history();
            } else {
                this.rooms.fetch({
                    query   : {},
                    success : function(resp) {
                        history();
                    }
                });
            }
            
            // Wait a while and then force-start history
            _.delay(function() {
                try {
                    Backbone.history.start();
                    self.view.loaded();
                } catch (error) {}
            }, 5000);
        },

        setupUser : _.once(function(cb) {
            root.user = new Models.UserModel();
            root.user.collection = this.users;
            if (bootstrap.user) {
                root.user.set(bootstrap.user);
            }
        })
    });

}).call(this)
