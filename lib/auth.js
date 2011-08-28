
// Authentication middleware
// -------------------------

// Function helpers to make restricting routes and 
// accessing session info easier
var Auth;

// Mongoose connection
var database,
    User;

var tokens = {};

// Exports for CommonJS
if (typeof exports !== 'undefined') {
}

Auth = {

    // Config
    config : function(mongoose) {
        database = mongoose;
        User = database.model('user');
    },

    // Authenticate user with password
    authenticate : function(username, password, next) {
        if (!username || !password) return next(new Error('Missing fields'));
        var query = {
            username : username
        };
        User.findOne(query, function(error, doc) {
            if (error) return next(new Error('Internal error'));
            if (!doc) return next(new Error('No such user'));
            if (doc.authenticate(password)) {
                next(null, doc);
            }  else {
                return next(new Error('Invalid password'));
            }
        });
    },

    // Register a new user
    register : function(data, next) {
        if (!data.username || !data.password || !data.email) return next(new Error('Missing fields'));
        var instance = new User(data);
        instance.save(function (err) {
            if (err) return (next(new Error(err)));
            next(null, instance);
        });
    },

    // Restrict access to route
    restricted : function(req, res, next) {
        console.log('restricted', req.session.user);
        if (req.session.user) {
            User.findById(req.session.user._id, function(error, doc) {
                if (error) return next(new Error('Internal error'));
                if (!doc) return next(new Error('No such user'));
                req.session.user = doc;
                next();
            });
        } else {
            // Force login
            req.session.err = 'Access denied';
            res.redirect('/login');
        }
    }
};

module.exports = Auth;
