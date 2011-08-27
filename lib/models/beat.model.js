
// Beat models
// -----------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Models = root.Models;
    if (typeof Models === 'undefined') Models = root.Models = {};
    if (typeof exports !== 'undefined') module.exports = Models;
    
    Models.BeatModel = Backbone.Model.extend({
    
        // Server settings
        type : 'beat',
        sync : _.sync,
        
        idAttribute : '_id',
        
        allowedToEdit : function(user) {
            if (!root.user.get('id') || !this.get('user_id')) {
                return false;
            }
            return root.user.get('id') === this.get('user_id');
        }
    });
    
    Models.BeatCollection = Backbone.Collection.extend({
        
        // Server communication settings
        model : Models.BeatModel,
        url   : 'beats',
        type  : 'beat',
        sync : _.sync
        
    });

}).call(this)
