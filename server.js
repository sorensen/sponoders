
// Sponoders Application Server
// ============================

require.paths.unshift(__dirname + '/lib');

// Dependencies
// ------------

// Include all project dependencies
var express      = require('express'),
    Mongo        = require('mongodb'),
    SessionStore = require('connect-mongodb'),
    Mongoose     = require('mongoose'),
    Redis        = require('redis'),
    Schemas      = require('schemas'),
    Backbone     = require('backbone'),
    _            = require('underscore')._,
    middleware   = require('backbone-dnode'),
    DNode        = require('dnode'),
    browserify   = require('browserify'),
    stylus       = require('stylus'),
    app          = module.exports = express.createServer();

// Settings
// --------

var token        = '',
    staticViews  = __dirname + '/public',
    staticAge    = 60000 * 60 * 24 * 365,
    cookieAge    = 60000 * 60 * 1,
    port         = 8080,
    secret       = 'abcdefg',
    redisConfig  = {
        host : '127.0.0.1',
        port : 6379,
    },
    mongoConfig  = {
        host : 'mongodb://localhost',
        port : 27017,
        name : 'sponoders'
        path : 'mongodb://localhost/sponoders'
    },
    sessionConfig = {
        host     : 'localhost',
        port     : 27017,
        name     : 'sponoders',
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
    ],
    mount  : '/core.js'
    filter : require('uglify-js')
});

// Development
app.configure('development', function() {
    app.use(express.static(staticViews));
    app.use(express.errorHandler({
        dumpExceptions : true, 
        showStack      : true 
    }));
});

// Production
app.configure('production', function() {
    port = 80;
    app.use(express.static(staticViews, {maxAge: cacheAge}));
    app.use(express.errorHandler());
});

// Session
var mongoConfig = new Mongo.Server(session.host, session.post, session.options),
    mongoDb     = new Mongo.Db(session.name, mongoConfig, {}),
    session     = new SessionStore({db : mongoDb});

// Redis
var pub = Redis.createClient(redisConfig.port, redisConfig.host, redisConfig.options),
    sub = Redis.createClient(redisConfig.port, redisConfig.host, redisConfig.options),
    rdb = Redis.createClient(redisConfig.port, redisConfig.host, redisConfig.options);

// General
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.set('view engine', 'jade');
    app.use(stylus.middleware({ src: staticViews }));

    app.use(express.session({
        cookie : {maxAge : cookieAge},
        secret : secret,
        store  : session
    }));

    app.use(core);
});

// Mongoose setup / schemas
Schemas.defineModels(Mongoose, function() {
    database = Mongoose.connect(config.mongo.host);
    middleware.crud.config(database);
    middleware.pubsub.config({
        publish   : pub,
        subscribe : sub,
        database  : rdb
    });
    auth.config(database, session);
});

// Routes
// ------

// Main app
app.get('/', function(req, res) {
    req.session.regenerate(function () {

        token = req.session.id;
        res.render('index.jade', {
            locals : {
                port  : port,
                token : token,
            }
        });
    });
});

// Initialize
// ----------

app.listen(port);

// Attatch the DNode middleware and connect
DNode()
    .use(middleware.pubsub)
    .use(middleware.crud)
    .listen(app)
