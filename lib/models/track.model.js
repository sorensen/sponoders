
// Track models
// ------------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Models = root.Models;
    if (typeof Models === 'undefined') Models = root.Models = {};
    if (typeof exports !== 'undefined') module.exports = Models;
    
    Models.TrackModel = Backbone.Model.extend({
        
        // Server settings
        url  : 'tracks',
        type : 'track',
        sync : function(){},
        
        idAttribute : '_id',

        initialize : function(options) {

            this.beats = new Models.BeatCollection();
            this.beats.url = _.getUrl(this.model) + ':beats';
        }
    });

}).call(this)
