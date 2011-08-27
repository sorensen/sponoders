
// Application view
// -----------------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Views = root.Views;
    if (typeof Views === 'undefined') Views = root.Views = {};
    if (typeof exports !== 'undefined') module.exports = Views;
    
    Views.ApplicationView = Backbone.View.extend({
    
        el : $('#application'),
    
        // templates
        template : _.template($('#application-template').html()),
        
        // events
        events : {
        },
        
        // initialize
        initialize : function(options) {
            _.bindAll(this, 
                'render', 'loading', 'loaded', 'subscribed'
            );

            // model bindings
            this.model = new Models.ApplicationModel();
            this.model.view = this;
            this.model.bind('change',    this.statistics);
            this.model.bind('subscribe', this.ready);
        
            this.render();
            
            // DOM shortcuts
            this.mainContent  = this.$('#main-content');
            this.overlay      = this.$('#overlay');
            this.outerSpinner = this.$('#spinner');
            this.innerSpinner = this.$('#inner-spinner');

            // spinner options
            this.spinnerOpts = {
                lines  : 12,
                length : 17,
                width  : 7,
                radius : 18,
                color  : '#fff',
                speed  : 0.8,
                trail  : 60,
                shadow : true
            };
            this.spinner = new Spinner(this.spinnerOpts);
            this.isLoading = false;
            this.loading();
        },
        
        // render
        render : function() {
            var content = this.model.toJSON(),
                view    = Mustache.to_html(this.template(), content);
            
            this.el.html(view);
            return this;
        },

        // subscription
        subscribed : function(resp) {
        },

        // loading
        loading : function() {
            var self = this;
            if (!this.isLoading) {
                this.outerSpinner.fadeIn(50);
                this.spinner.spin(self.innerSpinner.get(0));
                this.isLoading = true;
            }
            return this;
        },

        // loaded
        loaded : function() {
            var self = this;
            if (this.isLoading) {
                _.defer(function() {
                    self.spinner.stop();
                    self.outerSpinner.fadeOut(200);
                    self.isLoading = false;
                })
            }
            return this;
        }
    });

}).call(this)
