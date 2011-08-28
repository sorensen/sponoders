
// Beat view
// ---------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Views = root.Views;
    if (typeof Views === 'undefined') Views = root.Views = {};
    if (typeof exports !== 'undefined') module.exports = Views;

    Views.BeatView = Backbone.View.extend({
        
        // DOM attributes
        tagName   : 'div',
        className : 'beat',
        template  : _.template($('#beat-template').html()),
    
        events : {
            'click .remove' : 'deleteBeat'
        },

        // initialize
        initialize : function(options) {
            _.bindAll(this, 'render', 'remove', 'deleteBeat');
            this.model.bind('change', this.render);
            this.model.view = this;
        },
        
        // remove
        remove : function() {
            this.el.remove();
            return this;
        },

        deleteBeat : function() {
            this.model.destroy();
            return this;  
        },
    
        // render
        render : function() {
            var content = this.model.toJSON(),
                view = Mustache.to_html(this.template(), content);

            $(this.el).html(view);
            return this;
        },

        mute : function() {
            
        },

        play : function() {
            
        }
    });

}).call(this)
