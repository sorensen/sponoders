
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
            // Bind to model
            _.bindAll(this, 'render', 'highlight', 'remove', 'statistics');
            
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
        
        remove : function() {
            $(this.el).remove();
        },
        
        //###activate
        // Join Channel
        activate : function() {            
            $(this.el)
                .addClass('active')
                .addClass('current')
                .removeClass('inactive')
                .siblings()
                .addClass('inactive')
                .removeClass('current');
        },
        
        // Leave Channel
        leave : function() {            
            $(this.el)
                .removeClass('active')
                .removeClass('current')
                .addClass('inactive');
        }
    });

    // Main view
    // ---------

    Views.RoomMainView = Backbone.View.extend({
    
        // DOM attributes
        tagName   : 'div',
        className : 'main-room',
        template  : _.template($('#room-template').html()),
        
        // Internal memory of the last client to create a message
        lastPoster : '',
        
        // events
        events : {
            'keypress .message-form input' : 'createMessageOnEnter',
            'click #message-submit'        : 'createMessage',
            'click #leave-room'            : 'leave'
        },

        initialize : function(options) {
            _.bindAll(this, 
                'allMessages', 'addMessage', 'createMessage', 'render',
                'remove'
            );
            
            // Bind to model
            this.model.mainView = this;
            this.model.bind('remove', this.remove);
        
            this.model.messages = new Models.MessageCollection();
            this.model.messages.url = _.getUrl(this.model) + ':messages';
            
            this.model.messages.bind('add',   this.addMessage);
            this.model.messages.bind('reset', this.allMessages);
            
            // Create the DOM element
            this.render();
            
            var self = this;
            // Subscribe to the server for all model changes
            this.model.messages.subscribe();
            this.model.messages.fetch({
                query    : {room_id : self.model.get('id')},
                sorting  : {sort: [['created', -1]], limit: 1000},
                success : function(data) {
                    self.view.loaded();
                }
            });
        },

        render : function() {
            var content = this.model.toJSON(),
                self    = this;
            
            // Pre-formatting to prevent XSS
            content.name = this.model.escape('name');
            content.description = this.model.escape('description');
            
            var view = Mustache.to_html(this.template(), content);            
            $(this.el)
                .html(view);
            
            // Set shortcut methods for DOM items
            this.title       = this.$('.headline');
            this.controls    = this.$('.controls');
            this.description = this.$('.description');
            this.input       = this.$('.create-message');
            this.messageList = this.$('.messages');
            
            // Post-formatting, done here as to prevent conflict
            // with Mustache HTML entity escapement
            this.title.html(_.linkify(self.model.escape('name')));
            this.description.html(_.linkify(self.model.escape('description')));
            
            this.input.focus();
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
        },
        
        leave : function() {
            this.view.router.navigate('/', true);
            this.view.deactivateRoom(this.model);
        },
        
        allMessages : function(messages) {
            this.messageList.html('');
            this.model.messages.each(this.addMessage);
            this.statistics()
                .messageList
                .delay(400)
                .stop()
                .scrollTop(this.messageList[0].scrollHeight);
                
            return this;
        },

        addMessage : function(message) {
            //this.concurrency(message);
            var view = new Views.MessageView({
                model : message
            }).render();
            
            this.model.view && this.model.view.highlight();
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
