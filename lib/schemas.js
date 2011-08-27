
// Mongoose ORM Schemas
// --------------------

var root = this;

// Placeholders
var MessageSchema,
    RoomSchema,
    BeatSchema,
    TrackSchema,
    UserSchema,
    SessionSchema,
    ApplicationSchema;

// Require Underscore, if we're on the server, and it's not already present.
var _ = root._;
if (!_ && (typeof require !== 'undefined')) _ = require('underscore')._;

// Exports for CommonJS
if (typeof exports !== 'undefined') {
    var bcrypt       = require('bcrypt'),
        mongooseAuth = require('mongoose-auth')
}

// Keyword extractor for mongo searchability
function extractKeywords(text) {
    if (!text) return [];
    return text
        .toLowerCase()
        .split(/\s+/)
        .filter(function(v) { return v.length > 2; })
        .filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
}

// Asynchronous bcrypt password protection
function encryptPassword(password) {
    return bcrypt.encrypt_sync(password, bcrypt.gen_salt_sync(10));
}

// Basic schema definitions
function defineModels(mongoose, next) {
    var Schema   = mongoose.Schema,
        ObjectId = Schema.ObjectId;
    
    // Message
    // -------

    MessageSchema = new Schema({
        room_id  : { type : String, index : true },
        text     : String,
        username : String,
        user_id  : String,
        avatar   : String,
        created  : { type : Date, default : Date.now },
        modified : { type : Date, default : Date.now }
    });

    // Rooms
    // -----

    RoomSchema = new Schema({
        name        : { type : String, index : { unique : true } },
        slug        : { type : String, index : { unique : true } },
        user_id     : String,
        keywords    : [String],
        description : String,
        created     : { type : Date, default : Date.now },
        modified    : { type : Date, default : Date.now }
    });
    
    RoomSchema
        .pre('save', function(next) {
            this.set('modified', new Date());
            var keywords  = extractKeywords(this.name),
                descwords = extractKeywords(this.description),
                concat    = keywords.concat(descwords);
            this.keywords = _.unique(concat);
            next();
        });
        
    RoomSchema
        .path('name')
        .set(function(v){
            this.slug = v
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .replace(/-+/g, '');
            return v;
        });

    // Beat
    // ----

    BeatSchema = new Schema({
        track_id : { type : String, index : true },
        room_id  : { type : String, index : true },
        user_id  : String,
        sound    : String,
        x        : Number,
        y        : Number,
        created  : { type : Date, default : Date.now },
        modified : { type : Date, default : Date.now }
    });

    // Track
    // -----

    TrackSchema = new Schema({
        name        : { type : String, index : { unique : true } },
        slug        : { type : String, index : { unique : true } },
        room_id     : String,
        keywords    : [String],
        description : String,
        created     : { type : Date, default : Date.now },
        modified    : { type : Date, default : Date.now }
    });

    // User
    // ----

    UserSchema = new Schema({
        username         : { type : String, index : { unique : true } },
        email            : { type : String, index : { unique : true } },
        displayName      : String,
        crypted_password : String,
        created          : { type : Date, default : Date.now },
        modified         : { type : Date, default : Date.now }
    });

    UserSchema
        .virtual('password')
        .set(function(password) {
            this._password = password;
            this.set('crypted_password', encryptPassword(password));
        })
        .get(function() { 
            return this._password; 
        });
        
    UserSchema
        .path('displayName')
        .set(function(v){
            this.slug = v
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .replace(/-+/g, '');
            return v;
        });

    UserSchema
        .method('authenticate', function(password) {
            return bcrypt.compare_sync(password, this.crypted_password);
            bcrypt.compare(password, this.crypted_password, function(err, result) {
                return result;
            });
        });

    UserSchema
        .pre('save', function(next) {
            this.set('modified', new Date());
            next();
        });
    
    // Session
    // -------

    SessionSchema = new Schema({
        _id     : String,
        session : { type : String, get : function() {
            return JSON.parse(this.session);
        }},
        expires : Number
    });

    // Application
    // -----------

    ApplicationSchema = new Schema({
        server  : { type : String, index : { unique : true } },
        visits  : Number
    });

    // Set models to mongoose
    mongoose.model('user', UserSchema);
    mongoose.model('room', RoomSchema);
    mongoose.model('message', MessageSchema);
    mongoose.model('beat', BeatSchema);
    mongoose.model('track', TrackSchema);
    mongoose.model('session', SessionSchema);
    mongoose.model('application', ApplicationSchema);

    next && next();
};
exports.defineModels = defineModels; 
