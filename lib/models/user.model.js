
// User model
// ----------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Models = root.Models;
    if (typeof Models === 'undefined') Models = root.Models = {};
    if (typeof exports !== 'undefined') module.exports = Models;
    
    Models.UserModel = Backbone.Model.extend({
        
        // Server settings
        type : 'user',
        sync : _.sync,
        
        idAttribute : '_id',
        
        // Model defaults
        defaults : {
            username  : 'anonymous',
            email     : '',
            created   : '',
            modified  : ''
        },
        
        initialize : function(options) {
        }
    });
    
    // User Collection
    Models.UserCollection = Backbone.Collection.extend({
        
        model : Models.UserModel,
        
        // Server settings
        type : 'user',
        url  : 'users',
        sync : _.sync
    });

}).call(this)
