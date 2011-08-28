
// Message view
// ------------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Views = root.Views;
    if (typeof Views === 'undefined') Views = root.Views = {};
    if (typeof exports !== 'undefined') module.exports = Views;

    Views.MessageView = Backbone.View.extend({
        
        // DOM attributes
        tagName   : 'li',
        className : 'message',
        template  : _.template($('#message-template').html()),
    
        // initialize
        initialize : function(options) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
        },
        
        // remove
        remove : function() {
            $(this.el).remove();
            return this;
        },
    
        // render
        render : function() {
            var content = this.model.toJSON();
            
            // Pre-formatting 
            content.text = this.model.escape('text');
            //content.created && (content.created = _.timeFormat(content.created));
            
            var view = Mustache.to_html(this.template(), content);
            $(this.el).html(view);
            
            this.model.concurrent && $(this.el).addClass('concurrent');
            
            // Post-formatting
            this.$('.data')
                .html(_.linkify(content.text))
                .emoticonize({
                    //delay   : 800,
                    //animate : false
                    //exclude : 'pre, code, .no-emoticons'
                });
            
            // Set this as a preference
            this.$('.timeago').timeago();
            return this;
        }
    });

}).call(this)
