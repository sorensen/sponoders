
// Track view
// ----------

(function() {
    // Save a reference to the global object.
    var root = this;

    // Default number of rows
    var rows = 7;
    
    var defaultTrack = {
        end : 0
    };

    var track = {
        end : 0
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
            var self = this;
            this.room_id = options.room_id;

            _.bindAll(this, 
                'allBeats', 'addBeat', 'createBeat', 'render',
                'remove', 'mute', 'play', 'pause', 'stop',
                'removeBeat', 'dragDrop'
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

            Tracker.bind('playing', function(position) {
                self.$('.row').removeClass('selected')
                self.$('.row[row='+position/250+']').effect('highlight', {}, 250)
            })

            Tracker.bind('stop', function(position) {
                self.$('.row[row='+position/250+']').addClass('selected')
            })

            this.dragDrop();

            return this;
        },

        dragDrop : function() {
            var self = this;

            $('.sound').draggable({
                revert   : 'invalid',
                helper   : 'clone',
                snap     : '.column',
                snapMode : 'inner',
                appendTo :  '#main-content'
            }).hover(function(e) {
                $(this).find('.playSound').show();
            }, function() {
                $(this).find('.playSound').hide();
            })

            $('.playSound').live('click', function() {
                var name = $(this).parent().parent().find('.name').text();
                Tracker.playSound(name);
            })

            this.$('.column').droppable({
                accept      : '.sound, .beat',
                activeClass : "ui-state-hover",
                hoverClass  : "ui-state-active",
                drop        : function(event, ui) {
                    var exist = ui.draggable.attr('class');
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

                    if (!present || !present[0]) {
                        self.model.beats.create(data);

                        if (!!~exist.indexOf('beat')) {
                            var id = ui.draggable.attr('_id');
                            self.model.beats.get(id).destroy();
                        }
                    }
                }
            });
            return this;
        },

        addLine : function() {
            var line = Mustache.to_html(this.lineTemplate());
            var count = this.$('.row').length;

            this.grid.append($(line).attr('row', count));
            this.dragDrop();
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
            this.$('.mute')
                .addClass('selected')
                .siblings()
                .removeClass('selected');
            
            Tracker.mute()
        },

        play : function() {
            this.$('.play')
                .addClass('selected')
                .siblings()
                .removeClass('selected');
            
            Tracker.play()
        },

        pause : function() {
            this.$('.pause')
                .addClass('selected')
                .siblings()
                .removeClass('selected');
            
            Tracker.pause()
        },

        stop : function() {
            this.$('.stop')
                .addClass('selected')
                .siblings()
                .removeClass('selected');
            
            Tracker.stop()
        },

        allBeats : function(beats) {
            this.model.beats.each(this.addBeat);
            this.dragDrop();
            return this;
        },

        checkEnd : function() {
            this.model.beats.sort({silent : true});
            var beat = this.model.beats.at(0);
            if (beat) {
                track.end = (beat.get('y') * 250) + 250;
            } else {
                track.end = 0;
                this.render();
            }
        },

        addToTracker : function(beat) {
            var time = beat.get('y') * 250;
            if (!track[time]) track[time] = [];
            track[time][beat.get('x')] = {
                id     : beat.get('id'),
                name   : beat.get('name'),
                volume : beat.get('volume')
            };
            this.checkEnd();
        },

        removeFromTracker : function(beat) {
            var time = beat.get('y') * 250;
            if (track[time] && track[time][beat.get('x')]) {
                track[time][beat.get('x')] = {};
            }
            this.checkEnd();
        },
        
        addBeat : function(beat) {
            this.addToTracker(beat);
            var view = new Views.BeatView({
                model : beat
            }).render();

            var x = beat.get('x'),
                y = beat.get('y');

            var count = this.$('.row').length;

            if (y > count - 5) {
                this.addLine();
                this.addLine();
                this.addLine();
                this.addLine();
                this.addLine();
            }

            var target = this.grid
                .find('.row[row='+y+']')
                .find('.column[col='+x+']');
            
            target.html(view.el);
        },

        removeBeat : function(beat) {
            this.model.beats.remove(beat);
            this.removeFromTracker(beat);
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
