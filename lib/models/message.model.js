
// Message models
// --------------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Models = root.Models;
    if (typeof Models === 'undefined') Models = root.Models = {};
    if (typeof exports !== 'undefined') module.exports = Models;
    
    Models.MessageModel = Backbone.Model.extend({
    
        // Server settings
        type : 'message',
        sync : _.sync,
        
        idAttribute : '_id',
        
        // attributes
        defaults : {
            text     : '',
            username : ''
        },
        
        allowedToEdit : function(user) {
            return user.get('id') == this.get('user_id');
        },
        
        allowedToView : function(user) {
            return true;
        }
    });
    
    Models.MessageCollection = Backbone.Collection.extend({
        
        // Server communication settings
        model : Models.MessageModel,
        url   : 'messages',
        type  : 'message',
        sync  : _.sync,
        
        comparator : function(message) {
            return new Date(message.get('created')).getTime();
        }
    });

}).call(this)
