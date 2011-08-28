
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
        template           : _.template($('#application-template').html()),
        createRoomTemplate : _.template($('#create-room-template').html()),
        settingsTemplate   : _.template($('#settings-template').html()),
        homeTemplate       : _.template($('#home-template').html()),
        
        // events
        events : {
            //'keyup'              : 'hideOnEscape',
            //'click #show-rooms'  : 'showRooms',
            //'click #show-users'  : 'showUsers',
            //'click .cancel'      : 'hideDialogs',
            //'click #overlay'     : 'hideDialogs',
            //'click #users'       : 'showUsers',
            //'click #rooms'       : 'showRooms',

            // Create new room form
            //'click #create-room'               : 'showCreateRoom',
            'click #create-room-form .submit'  : 'createRoom',
            'keypress #create-room-form input' : 'createRoomOnEnter',
            'click #quicklaunch li'            : 'navSelected',
            
            // Search form
            'keypress #search'  : 'searchOnEnter',
            'click #search-now' : 'searchOnEnter',

            // Settings
            'click #settings-form .submit'  : 'saveSettings',
            'keypress #settings-form input' : 'saveSettingsOnEnter',
        },
        
        // initialize
        initialize : function(options) {
            _.bindAll(this, 
                'render', 'loading', 'loaded', 'subscribed',
                'addRoom', 'allRooms', 'showCreateRoom', 'createRoom',
                'addUser', 'allUsers'
            );
            this.onlineUsers = 0;
            this.model = new Models.ApplicationModel();
            this.model.view = this;

            // model bindings
            //this.model.bind('change',    this.statistics);
            //this.model.bind('subscribe', this.ready);
        
            // user bindings
            this.model.users.bind('add',   this.addUser);
            this.model.users.bind('reset', this.allUsers);
            this.model.users.bind('subscribe', this.subscribed);
            
            // room bindings
            this.model.rooms.bind('add',   this.addRoom);
            this.model.rooms.bind('reset', this.allRooms);

            this.render();
            
            // DOM shortcuts
            this.mainContent      = this.$('#main-content');
            this.overlay          = this.$('#overlay');
            this.outerSpinner     = this.$('#spinner');
            this.innerSpinner     = this.$('#inner-spinner');
            this.createRoomDialog = this.$('#create-room-dialog');
            this.roomList         = this.$('#room-list');
            this.userList         = this.$('#user-list');
            this.trackList        = this.$('#track-list');

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
            this.showingRooms = true;
        },
        
        // Model interactions
        // ------------------
        
        // render
        render : function() {
            var content = this.model.toJSON(),
                view    = Mustache.to_html(this.template(), content);
            
            this.el.html(view);

            if (root.user.get('displayName') === 'anonymous') {
                $('#logout').parent().hide()
            } else {
                $('#login').parent().hide()
                $('#register').parent().hide()
            }

            return this;
        },

        navSelected : function() {
        },

        statistics : function() {
            
        },

        // subscription
        subscribed : function(online) {
            this.online = online;
            this.onlineUsers = this.model.users.filter(function(user) {
                return !!~online.indexOf(user.get('_id'));
            });
            return this;
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
        
        home : function() {
            Tracker.stop()
            this.showRooms();
            return;
            this.mainContent.html(Mustache.to_html(this.homeTemplate()));
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
            //this.model.rooms.each(this.addRoom);
        },

        showRooms : function() {
            Tracker.stop()
            this.showingRooms = true;
            this.mainContent.html('');
            this.model.rooms.each(this.addRoom);
        },
        
        addRoom : function(room) {
            if (!this.showingRooms) return;

            var view = new Views.RoomView({
                model : room
            }).render();

            //this.roomViews.append(view);
            
            this.mainContent
                .append(view.el);
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
            this.showingRooms = false;
            // Get model by slug
            var model = this.model.rooms.filter(function(room) {
                return room.get('slug') === params;
            });

            if (!model || !model[0]) {
                this.router.navigate('/', true);
                return this;
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
            
            return this;
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
                        self.loaded();
                        self.router.navigate('/rooms/' + resp.slug, true);
                    _.defer(function() {
                        //_.delay(function() {
                            self.loaded();
                            var slug = resp.get('slug') || resp.get('name');
                            self.router.navigate('/rooms/' + slug, true);
                        //}, 300, resp);
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
            this.showingRooms = false;
            Tracker.stop()
            var self = this;
            //this.hideDialogs();
            //this.overlay.fadeIn(150);
            this.mainContent
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
                            }
                        },
                        submitButton : '#create-room-submit',
                        unHappy : function() {
                        }
                    });
                })
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

        showSettings : function() {
            this.showingRooms = false;
            Tracker.stop()
            var self = this;
            this.mainContent
                .html(Mustache.to_html(this.settingsTemplate(), user.toJSON()))
                .fadeIn(150, function() {

                })
                .find('input[name="displayname"]').focus();
        },

        saveSettings : function() {
            console.log('svae settings');
            var self = this;
                data = {
                    bio         : this.$('textarea[name="bio"]').val(),
                    email       : this.$('input[name="email"]').val(),
                    password    : this.$('input[name="password"]').val(),
                    displayName : this.$('input[name="displayname"]').val()
                };
            
            root.user.save(data, {channel : 'app:users'});
            this.router.navigate('/', true);
        },
        
        saveSettingsOnEnter: function(e) {
            if (e.keyCode == 13) this.saveSettings();
        },

        showUsers : function() {
        },
        
        allUsers : function(users) {
            //this.userList.html('');

            if (this.onlineUsers.length > 1) {
                this.subscribed(this.online);
            }
        },

        showUsers : function() {
            this.showingRooms = false;
            this.mainContent.html('');
            this.model.users.each(this.addUser);
        },
        
        addUser : function(user) {
            var view = new Views.UserView({
                model : user
            }).render();

            //this.userViews.append(view);
            
            this.mainContent
                .append(view.el);
        },
    });

}).call(this)
