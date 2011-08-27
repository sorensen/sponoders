
// User views
// ----------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Views = root.Views;
    if (typeof Views === 'undefined') Views = root.Views = {};
    if (typeof exports !== 'undefined') module.exports = Views;
    
    Views.UserView = Backbone.View.extend({
    
        // DOM attributes
        tagName   : 'div',
        className : 'user inactive',
        template  : _.template($('#user-list-template').html()),
        
        // User interaction events
        events : {
            'click' : 'activate'
        },
        
        // View constructor
        initialize : function(options) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('remove', this.clear);
            this.model.view = this;
            this.render();
        },
    
        // render
        render : function() {
            var content = this.model.toJSON(),
                view    = Mustache.to_html(this.template(), content);
            
            $(this.el).html(view);

            return this;
        },
        
        // remove
        remove : function() {
            this.el.remove();
        },
        
        // activate user
        activate : function() {
        }
    });
    
    Views.ProfileView = Backbone.View.extend({
    
        // DOM attributes
        tagName   : 'div',
        className : 'user-profile',
        template  : _.template($('#user-template').html()),
        
        // events
        events : {
            'click #leave-profile' : 'deactivate'
        },

        initialize : function(options) {
            this.model.bind('remove', this.remove);
            this.model.view = this;
            this.render();
            return this;
        },
        
        render : function() {
            var content = this.model.toJSON(),
                view    = Mustache.to_html(this.template(), content);   
            
            $(this.el).html(view)
        },
        
        remove : function() {
            this.model && this.model.remove();
            $(this.el).remove();
        },
        
        deactivate : function() {
            this.view.router.navigate('/', true);
        }
    });

}).call(this)
