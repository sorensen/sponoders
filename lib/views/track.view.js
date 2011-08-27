
// Track view
// ----------

(function() {
    // Save a reference to the global object.
    var root = this;

    // Default number of rows
    var rows = 20;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Views = root.Views;
    if (typeof Views === 'undefined') Views = root.Views = {};
    if (typeof exports !== 'undefined') module.exports = Views;

    Views.TrackView = Backbone.View.extend({
        
        // DOM attributes
        template      : _.template($('#track-template').html()),
        lineTemplate  : _.template($('#track-line-template').html()),
    
        events : {
            'click .mute'  : 'mute',
            'click .play'  : 'play',
            'click .pause' : 'pause',
            'click .stop'  : 'stop'
        },

        // initialize
        initialize : function(options) {
            console.log('track init', this);
            var self = this;

            _.bindAll(this, 
                'allBeats', 'addBeat', 'createBeat', 'render',
                'remove', 'mute', 'play', 'pause', 'stop'
            );

            this.model = new Models.TrackModel();
            this.model.view = this;
            
            this.model.bind('change', this.statistics);

            this.model.beats.bind('add',   this.addBeat);
            this.model.beats.bind('reset', this.allBeats);

            this.model.beats.subscribe();
            this.model.beats.fetch({
                query   : {room_id : options.room_id},
                sorting : {},
                success : function(data) {
                    self.view.loaded();
                }
            });
        },
    
        // render
        render : function() {
            var content = this.model.toJSON(),
                view    = Mustache.to_html(this.template(), content),
                line    = Mustache.to_html(this.lineTemplate());

            this.el.html(view);

            // row creation
            for (var r = 0; r <= rows; r++) {
                var row = $(line)
                    .addClass('row_' + r);
                
                $(this.el)
                    .append(row);
            }
            return this;
        },

        addLine : function() {
            var line = Mustache.to_html(this.lineTemplate());
            var count = this.$('.row').length;

            $(this.el).append($(line).addClass('row_' + count));
            return this;
        },
        
        // remove
        remove : function() {
            $(this.el).remove();
            return this;
        },

        statistics : function() {
            
        },

        mute : function() {
            
        },

        play : function() {
            
        },

        pause : function() {
            
        },

        stop : function() {
            
        },
        
        addBeat : function() {
            
        },

        allBeats : function() {
            
        },

        removeBeat : function() {
            
        },

        createBeat : function() {
            
        },

        saveToLibrary : function() {
            
        },

        loadFromLibrary : function() {
            
        }
    });

}).call(this)
