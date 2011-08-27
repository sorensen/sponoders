
// Room models
// -----------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Models = root.Models;
    if (typeof Models === 'undefined') Models = root.Models = {};
    if (typeof exports !== 'undefined') module.exports = Models;
    
    Models.RoomModel = Backbone.Model.extend({
    
        // Server settings
        type : 'room',
        sync : _.sync,
        
        idAttribute : '_id',
        
        // defaults
        defaults : {
            name : 'Unknown',
        },

        remove : function() {
        },
        
        allowedToEdit : function(user) {
            if (!user.get('id') || !this.get('user_id')) {
                return false;
            }
            return user.get('id') === this.get('user_id');
        },
        
        allowedToView : function(user) {
            return !~_.indexOf(this.get('banned'), user.get('id'));
        }
    });
    
    // Private
    // -------
    
    Models.PrivateRoomModel = Models.RoomModel.extend({
    
        // Default attributes
        defaults : {
            name      : 'Unknown',
            messages  : [],
            allowed   : [],
            banned    : []
        },
        
        allowedToView : function(user) {
            return !!~_.indexOf(this.get('allowed'), user.get('id'))
                || user.get('id') === this.get('user_id');
        }
    });
    
    Models.RoomCollection = Backbone.Collection.extend({
        
        // Server settings
        model : Models.RoomModel,
        url   : 'rooms',
        type  : 'room',
        sync  : _.sync,
        
        comparator : function(room) {
            
        }
    });

}).call(this)
