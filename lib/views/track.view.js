
// Track view
// ----------

(function() {
    // Save a reference to the global object.
    var root = this;

    // Default number of rows
    var rows = 20;
    
    var track = {
        '500': [{name: 'kick2', volume: 1}],
        '750': [{name: 'kick2', volume: 0.5}],
        '1000': [{name: 'kick2', volume: 1}, {name: 'clap', volume: 0.2}],
        '1500': [{name: 'kick2', volume: 2}],
        '2000': [{name: 'kick2', volume: 1}, {name: 'clap', volume: 1}, {name: 'cymbal', volume: 1}, {name: 'hihat', volume: 1}, {name: 'kickdrum', volume: 1}],
        '2500': [{name: 'kick2', volume: 1}],
        '2750': [{name: 'kick2', volume: 1}],
        '3000': [{name: 'kick2', volume: 1}, {name: 'clap', volume: 0.2}, {name: 'metalclick', volume: 1}, {name: 'shaker', volume: 1}],
        '3500': [{name: 'kick2', volume: 1}],
        '4000': [{name: 'kick2', volume: 1}, {name: 'clap', volume: 1}], 
        'end': 4000
    };
    Tracker.init(track);
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
            console.log('track init', this, options);
            var self = this;
            this.room_id = options.room_id;

            _.bindAll(this, 
                'allBeats', 'addBeat', 'createBeat', 'render',
                'remove', 'mute', 'play', 'pause', 'stop',
                'removeBeat'
            );

            this.model = new Models.TrackModel();
            this.model.view = this;
            
            this.model.bind('change', this.statistics);

            this.model.beats.bind('add',   this.addBeat);
            this.model.beats.bind('reset', this.allBeats);
            this.model.beats.bind('destroy', this.removeBeat);

            this.model.beats.subscribe();
            this.model.beats.fetch({
                query   : {room_id : options.room_id},
                sorting : {},
                success : function(data) {
                }
            });
        },
    
        // render
        render : function() {
            var content = this.model.toJSON(),
                view    = Mustache.to_html(this.template(), content),
                line    = Mustache.to_html(this.lineTemplate()),
                self    = this;

            this.el.html(view);

            this.controls = this.$('.controls');
            this.grid     = this.$('.grid');

            // row creation
            for (var r = 0; r <= rows; r++) {
                var row = $(line).attr('row', r);
                
                this.grid.append(row);
            }

            this.$('.column').droppable({
                accept      : '.sound',
                activeClass : "ui-state-hover",
                hoverClass  : "ui-state-active",
                drop        : function(event, ui) {

                    var data = {
                        name : ui.draggable.find('.name').text(),
                        type : ui.draggable.find('.type').text(),
                        y    : $(this).closest('.row').attr('row'),
                        x    : $(this).attr('col'),
                        room_id : self.room_id
                    };
                    var present = self.model.beats.filter(function(beat) {
                        return (beat.get('x') == data.x && beat.get('y') == data.y);
                    });

                    console.log('present', present);

                    if (!present || !present[0]) {
                        self.model.beats.create(data);
                    }

                    console.log('dropped', ui.draggable, data);
                }
            });

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
            Tracker.mute()
        },

        play : function() {
            
            Tracker.play()
        },

        pause : function() {
            Tracker.pause()
        },

        stop : function() {
            Tracker.stop()
        },

        allBeats : function(beats) {
            this.model.beats.each(this.addBeat);
            return this;
        },
        
        addBeat : function(beat) {
            var view = new Views.BeatView({
                model : beat
            }).render();

            var x = beat.get('x'),
                y = beat.get('y');

            var target = this.grid
                .find('.row[row='+y+']')
                .find('.column[col='+x+']');
            
            target.html(view.el);
        },

        removeBeat : function(beat) {
            $(beat.view.el).remove();
        },

        createBeat : function() {
            
        },

        saveToLibrary : function() {
            
        },

        loadFromLibrary : function() {
            
        }
    });

}).call(this)
