
// Room Views
// ----------

(function() {
    // Save a reference to the global object.
    var root = this;
  
    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    var Views = root.Views;
    if (typeof Views === 'undefined') Views = root.Views = {};
    if (typeof exports !== 'undefined') module.exports = Views;
    
    // List View
    // ---------

    Views.RoomView = Backbone.View.extend({
    
        // DOM attributes
        tagName        : 'div',
        className      : 'room inactive',
        template       : _.template($('#room-list-template').html()),
        
        // User interaction events
        events : {
        },
        
        initialize : function(options) {
            _.bindAll(this, 'render', 'remove', 'statistics');
            
            this.model.view = this;
            this.model.bind('change', this.statistics);
            this.model.bind('remove', this.remove);
            this.loaded = 0;
        },
        
        render : function() {
            var content = this.model.toJSON();
            
            // Pre-rendering formatting to prevent XSS
            content.name = this.model.escape('name');
            content.description = this.model.escape('description');
            
            var view = Mustache.to_html(this.template(), content);            
            $(this.el).html(view);
            this.statistics();
            return this;
        },

        statistics : function() {
            return this;
        },
        
        remove : function() {
            $(this.el).remove();
            return this;
        },
        
        // Join Channel
        activate : function() {
            return this;
        },
        
        // Leave Channel
        leave : function() {
            Tracker.stop()
            return this;
        }
    });

    // Main view
    // ---------

    Views.RoomMainView = Backbone.View.extend({
    
        // DOM attributes
        tagName   : 'div',
        className : 'main-room',
        template  : _.template($('#room-template').html()),
        libraryTemplate  : _.template($('#library-template').html()),
        
        // Internal memory of the last client to create a message
        lastPoster : '',
        
        // events
        events : {
            'keypress .message-form input' : 'createMessageOnEnter',
            'click #message-submit'        : 'createMessage',
            'click #leave-room'            : 'leave',
            'click .delete-room'           : 'deleteRoom',
            'click #show-library'          : 'showLibrary',
            'click #show-chat'             : 'showChat'
        },

        initialize : function(options) {
            var self = this;
            _.bindAll(this, 
                'allMessages', 'addMessage', 'createMessage', 'render',
                'remove', 'subscribe'
            );
            
            // Bind to model
            this.model.mainView = this;
            this.model.bind('remove', this.remove);
        
            this.model.messages = new Models.MessageCollection();
            this.model.messages.url = _.getUrl(this.model) + ':messages';
            
            this.model.messages.bind('add',   this.addMessage);
            this.model.messages.bind('reset', this.allMessages);
            this.model.messages.bind('subscribe', this.subscribe);
            
            // Create the DOM element
            this.render();

            this.model.track = new Views.TrackView({
                el      : this.$('.track'),
                room_id : self.model.get('id')
            }).render().addLine();

            this.model.track.view = this;

            // Subscribe to the server for all model changes
            this.model.messages.subscribe();
            this.model.messages.fetch({
                query   : {room_id : self.model.get('id')},
                sorting : {sort: [['created', -1]], limit: 1000},
                success : function(data) {
                    self.view.loaded();
                }
            });
        },

        render : function() {
            var content = this.model.toJSON(),
                self    = this;
            
            var sounds = Tracker.sounds;

            // Pre-formatting to prevent XSS
            content.name = this.model.escape('name');
            content.description = this.model.escape('description');
            
            var view = Mustache.to_html(this.template(), content);            
            $(this.el)
                .html(view);

            var lib = Mustache.to_html(this.libraryTemplate(), {sounds : sounds});
            
            
            // Set shortcut methods for DOM items
            this.title       = this.$('.headline');
            this.controls    = this.$('.controls');
            this.description = this.$('.description');
            this.input       = this.$('.create-message');
            this.messageList = this.$('.messages');
            this.library     = this.$('.library');
            this.chat        = this.$('.chat');
            
            // Post-formatting, done here as to prevent conflict
            // with Mustache HTML entity escapement
            this.title.html(_.linkify(self.model.escape('name')));
            this.description.html(_.linkify(self.model.escape('description')));
            this.library.html(lib);
            this.input.focus();

            this.$('.sound').draggable({
                revert   : 'invalid',
                helper   : 'clone',
                snap     : '.column',
                snapMode : 'inner'
            });

            return this;
        },

        subscribe : function(online) {
            this.onlineUsers = this.view.model.users.filter(function(user) {
                return !!~online.indexOf(user.get('_id'));
            });
            return this;
        },

        showLibrary : function() {
            this.chat.fadeOut();
            this.library.fadeIn();
        },

        showChat : function() {
            this.library.fadeOut();
            this.chat.fadeIn();
        },

        statistics : function() {
            return this;
        },

        remove : function() {
            this.model.view && this.model.view.leave();
            this.model && this.model.remove();
            this.model.messages.unsubscribe();
            $(this.el).remove();
            return this;
        },

        deleteRoom : function() {
            this.model.destroy();
            return this;
        },
        
        leave : function() {
            this.view.router.navigate('/', true);
            this.view.deactivateRoom(this.model);
            return this;
        },
        
        allMessages : function(messages) {
            var self = this;
            this.messageList.html('');
            this.model.messages.each(this.addMessage);
            this.messageList
                .delay(400)
                .stop()
                .scrollTop(this.messageList[0].scrollHeight);
            
            return this;
        },

        addMessage : function(message) {
            var view = new Views.MessageView({
                model : message
            }).render();
            
            this.messageList.append(view.el);
            
            var position = this.messageList.height() + this.messageList.scrollTop(),
                buffer   = 300,
                height   = this.messageList[0].scrollHeight;
            
            // Check to see if the user is at the bottom of the list,
            // before scrolling, allowing them to read old msg's
            if (position + buffer >= height) {
                this.messageList
                    .stop()
                    .animate({scrollTop : height}, 200, 'easeInExpo');
            }
            return this;
        },

        createMessage : function() {
            if (!this.input.val()) return;
            this.model.messages.create(this.newAttributes());
            this.input.val('');
            return this;
        },

        createMessageOnEnter : function(e) {
            if (e.keyCode == 13) this.createMessage();
            return this;
        },

        newAttributes : function() {
            var username    = root.user.get('username'),
                displayName = root.user.get('displayName') || root.user.get('username'),
                id          = root.user.get('id') || root.user.id;
            
            return {
                text        : this.input.val(),
                room_id     : this.model.get('id'),
                user_id     : id,
                username    : username,
                displayName : displayName,
                avatar      : root.user.get('avatar')
            };
        }
    });

}).call(this)
