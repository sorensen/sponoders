
// Sponoders Application Server
// ============================

require.paths.unshift(__dirname + '/lib');

// Dependencies
// ------------

// Include all project dependencies
var express      = require('express'),
    Auth         = require('auth'),
    Mongo        = require('mongodb'),
    SessionStore = require('connect-mongo'),
    Mongoose     = require('mongoose'),
    Redis        = require('redis'),
    Schemas      = require('schemas'),
    Backbone     = require('backbone'),
    _            = require('underscore')._,
    middleware   = require('backbone-dnode'),
    DNode        = require('dnode'),
    browserify   = require('browserify'),
    // receiving err on: $ npm install canvas @ https://gist.github.com/1175864
    //canvas       = require('canvas'),
    stylus       = require('stylus'),
    nib          = require('nib'),
    nko          = require('nko')('GZaRxOX8YG3IsxAC'),
    app          = module.exports = express.createServer();

// Settings
// --------

var token        = '',
    staticViews  = __dirname + '/public',
    staticAge    = 60000 * 60 * 24 * 365,
    cookieAge    = 60000 * 60 * 1,
    port         = 3000,
    secret       = 'abcdefg',
    redisConfig  = {
        host : '127.0.0.1',
        port : 6379,
    },
    mongoConfig  = {
        host : 'mongodb://localhost',
        port : 27017,
        name : 'sponoders',
        path : 'mongodb://localhost/db'
    },
    sessionConfig = {
        host     : 'localhost',
        port     : 27017,
        name     : 'db',
        username : '',
        password : ''
    };

// Configuration
// -------------

// Browserify bundles
var core = browserify({
    ignore : [
        'underscore',
        'backbone',
    ],
    require : [
        'dnode',
        'backbone-dnode'
    ],
    entry : [
        /**
        __dirname + '/lib/models/message.model.js',
        __dirname + '/lib/models/user.model.js',
        __dirname + '/lib/models/app.model.js',
        __dirname + '/lib/models/room.model.js',

        __dirname + '/lib/views/message.view.js',
        __dirname + '/lib/views/room.view.js',
        __dirname + '/lib/views/user.view.js',
        __dirname + '/lib/views/app.view.js',

        __dirname + '/lib/routers/app.router.js',

        __dirname + '/public/js/google.js',
        __dirname + '/public/js/helpers.js',
        __dirname + '/public/js/init.js'
        **/
    ],
    mount  : '/core.js'
    //filter : require('uglify-js')
});

// Development
app.configure('development', function() {
    app.use(express.static(staticViews));
    app.use(express.static(__dirname + '/lib'));
    app.use(express.errorHandler({
        dumpExceptions : true,
        showStack      : true
    }));
});

// Production
app.configure('production', function() {
    port = 80;
    app.use(express.static(staticViews, {maxAge: cacheAge}));
    app.use(express.static(__dirname + '/lib', {maxAge: cacheAge}));
    app.use(express.errorHandler());
});

// Session
var session = new SessionStore({
    db : 'db'
});

// Redis
var pub = Redis.createClient(redisConfig.port, redisConfig.host, redisConfig.options),
    sub = Redis.createClient(redisConfig.port, redisConfig.host, redisConfig.options),
    rdb = Redis.createClient(redisConfig.port, redisConfig.host, redisConfig.options);

/**
 * Stylus compiler
 * # For development use the following process:
 * $ cd /path/to/sponoders/public/css
 * $ stylus --watch --line-numbers -include ../../node_modules/nib/lib
 */
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    //.set('linenos', true)
    //.set('force', true)
    //.set('warn', true)
    .use(nib());
}

// General
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());

    app.set('view engine', 'jade');
    app.use(stylus.middleware({
      src: staticViews,
      compile: compile
    }));

    app.use(express.session({
        cookie : {maxAge : cookieAge},
        secret : secret,
        store  : session
    }));

    app.use(core);
});

// Mongoose setup / schemas
Schemas.defineModels(Mongoose, function() {
    database = Mongoose.connect('mongodb://localhost/db');
    middleware.crud.config(database);
    middleware.pubsub.config({
        publish   : pub,
        subscribe : sub,
        //database  : rdb
    });
    Auth.config(database);
});

// Routes
// ------

// Main app
app.get('/', Auth.restricted, function(req, res) {
    res.render('index.jade', {
        locals : {
            port  : port,
            token : req.session.id,
            bootstrap : {
                user  : req.session.user,
                users : [],
                rooms : []
            }
        }
    });
});

// Login
app.get('/login', function(req, res) {
    error = req.session.err;
    req.session.err = null;

    res.render('login.jade', {
        locals : {
            error : error
        }
    });
});

app.post('/login', function(req, res) {
    Auth.authenticate(req.body.username, req.body.password, function(err, user) {
        
        console.log('err', err, user);

        if (user) {
            req.session.regenerate(function() {
                req.session.user = user;
                res.redirect('home');
            });
        } else {
            req.session.err = 'Authentication failed, please check your '
                + ' username and password.';
            res.redirect('back');
        }
        console.log('session', req.session);
    });
});

// Register
app.get('/register', function(req, res) {
    error = req.session.err;
    req.session.err = null;

    res.render('register.jade', {
        locals : {
            error : error
        }
    });
});

app.post('/register', function(req, res) {
    var data = {
        username : req.body.username,
        password : req.body.password,
        email    : req.body.email
    }
    Auth.register(data, function(err, user) {
        
        console.log('err', err, user);
        
        if (user) {
            req.session.regenerate(function() {
                req.session.user = user;
                res.redirect('home');
            });
        } else {
            req.session.err = 'Registration failed, please check your '
                + ' username and password.';
            res.redirect('back');
        }

        console.log('session', req.session);
    });
})

// Logout
app.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.redirect('home');
    });
});

// Initialize
// ----------

app.listen(port);
//app.listen(parseInt(process.env.PORT) || 7777); 
console.log('Listening on ' + app.address().port);

// Attatch the DNode middleware and connect
DNode()
    .use(middleware.pubsub)
    .use(middleware.crud)
    .listen(app)

