
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
        createRoomTemplate : _.template($('#create-room-template').html()),
        
        // events
        events : {
            'keyup'              : 'hideOnEscape',
            'click #show-rooms'  : 'showRooms',
            'click #show-users'  : 'showUsers',
            'click .cancel'      : 'hideDialogs',
            'click #overlay'     : 'hideDialogs',

            // Create new room form
            'click #create-room'               : 'showCreateRoom',
            'click #create-room-form .submit'  : 'createRoom',
            'keypress #create-room-form input' : 'createRoomOnEnter',
            
            // Search form
            'keypress #search'  : 'searchOnEnter',
            'click #search-now' : 'searchOnEnter',
        },
        
        // initialize
        initialize : function(options) {
            _.bindAll(this, 
                'render', 'loading', 'loaded', 'subscribed',
                'addRoom', 'allRooms', 'showCreateRoom', 'createRoom',
                'addUser', 'allUsers'
            );
            this.model = new Models.ApplicationModel();
            this.model.view = this;

            // model bindings
            this.model.bind('change',    this.statistics);
            this.model.bind('subscribe', this.ready);
        
            // user bindings
            this.model.users.bind('add',   this.addUser);
            this.model.users.bind('reset', this.allUsers);
            
            // room bindings
            this.model.rooms.bind('add',   this.addRoom);
            this.model.rooms.bind('reset', this.allRooms);

            this.render();
            
            // DOM shortcuts
            this.mainContent  = this.$('#main-content');
            this.overlay      = this.$('#overlay');
            this.outerSpinner = this.$('#spinner');
            this.innerSpinner = this.$('#inner-spinner');
            this.createRoomDialog = this.$('#create-room-dialog');

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
            //this.loading();
        },
        
        // Model interactions
        // ------------------
        
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
        },
        
        hideOnEscape : function(e) {
            if (e.keyCode == 27) {
                this.hideDialogs();
                this.loaded();
            }
        },

        hideDialogs : function() {
            this.$('.dialog').fadeOut(300);
            this.overlay.hide(300);
        },
        
        // Room interactions
        // -----------------

        allRooms : function(rooms) {
            //this.roomList.html('');
            this.model.rooms.each(this.addRoom);
        },
        
        addRoom : function(room) {
            var view = new Views.RoomView({
                model : room
            }).render();
            
            this.roomList
                .append(view.el);
        },
        
        showRooms : function() {
        },

        deactivateRoom : function() {
            if (this.activeRoom) {
                this.mainContent
                    .hide()
                    .html('');
                
                this.activeRoom.remove();
            }
        },

        activateRoom : function(params) {
            this.deactivateRoom();
            
            // Get model by slug
            var model = this.model.rooms.filter(function(room) {
                return room.get('slug') === params;
            });

            if (!model || !model[0]) {
                this.router.navigate('/', true);
                return;
            }

            this.activeRoom = new Views.RoomMainView({
                model : model[0]
            });
            
            this.activeRoom.view = this;
            this.loading();
            
            var self = this;
            this.mainContent
                .html(self.activeRoom.el)
                .fadeIn(50, function(){
                    // Placeholder
                })
                .show();
            
            // This will set the list view as active
            model[0].view && model[0].view.activate();
        },

        createRoom : function() {
            this.loading();
            var name        = this.$('input[name="room"]'),
                restricted  = this.$('input[name="restricted"]'),
                description = this.$('textarea[name="description"]');

            var self = this;
            this.model.rooms.create({
                name        : name.val(),
                user_id     : root.user.get('id') || root.user.id,
                restricted  : restricted.val(),
                description : description.val()
            }, {
                finished : function(resp) {
                    _.defer(function() {
                        self.loaded();
                        self.router.navigate('/rooms/' + resp.slug, true);
                    });
                }
            });
            
            // Should probably pass this in a success function
            this.createRoomDialog.fadeOut(150);
            this.overlay.hide();
            
            // Reset fields
            name.val('');
            restricted.val('');
            description.val('');
        },

        createRoomOnEnter : function(e) {
            if (e.keyCode == 13) this.createRoom();
        },

        showCreateRoom : function() {
            var self = this;
            this.hideDialogs();
            this.overlay.fadeIn(150);
            this.createRoomDialog
                .html(Mustache.to_html(this.createRoomTemplate()))
                .fadeIn(150, function(){
                
                    // Apply happy validation schema, this might be 
                    // better placed and only accessed here, as the 
                    // DOM elements must exist before they can be happy
                    self.$('#create-room-form').isHappy({
                        fields : {
                            '#create-room-name' : {
                                required : true,
                                message  : 'Please name this room'
                            },
                            '#create-room-description' : {
                                required : true,
                                message  : 'Give some info about this room'
                            }
                        },
                        submitButton : '#create-room-submit',
                        unHappy : function() {
                            console.log('Create room is unhappy. :(');
                        }
                    });
                })
                .draggable()
                .find('input[name="room"]').focus();
        },

        searchOnEnter : _.debounce(function() {
            var self  = this,
                input = this.searchInput.val(),
                query = (input.length < 1) ? {} : {
                    keywords : { $in : [ input ] }
                };
            
            this.model.rooms.fetch({
                query : query
            });
            
        }, 1000),

        // User interactions
        // -----------------

        saveSettings : function() {
            var self = this;
                data = {
                    bio         : this.$('textarea[name="bio"]').val(),
                    email       : this.$('input[name="email"]').val(),
                    password    : this.$('input[name="password"]').val(),
                    displayName : this.$('input[name="displayname"]').val()
                };
            
            user.save(data, {channel : 'app:users'});
            this.settingsDialog.fadeOut(150);
            this.overlay.hide();
        },

        showUsers : function() {
        },
        
        allUsers : function(users) {
            //this.userList.html('');
            this.model.users.each(this.addUser);
        },
        
        addUser : function(user) {
            var view = new Views.UserView({
                model : user
            }).render();
            
            this.userList
                .append(view.el);
        },
    });

}).call(this)
