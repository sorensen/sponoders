/*
*
*   Tracker.js for Tracker.io
*
*
*
*
*
*
*
*
*
*
*
*
*
*/

(function(window) {
    var Tracker = function() {
        this.position = 0
        this.volume = 100
        this.playing = false;
        this.paused = false;
        this.muted = false;
        this.sounds = [
            {name: 'backward', type: 'synth'},
            {name: 'bandpass-zap-down', type: 'synth'},
            {name: 'bendy-resonance', type: 'synth'},
            {name: 'buzzsaw', type: 'synth'},
            {name: 'thicknote', type: 'synth'},
            {name: 'classicrave', type: 'synth'},
            {name: 'shortchord', type: 'synth'},
            {name: 'oldskool', type: 'synth'},
            {name: 'NRG', type: 'synth'},
            {name: 'heavynote', type: 'synth'},
            {name: 'hi-score', type: 'synth'},
            {name: 'hip-hop-snare', type: 'synth'},
            {name: 'honk', type: 'synth'},
            {name: 'junglesine', type: 'synth'},
            {name: 'kewl-reverse', type: 'synth'},
            {name: 'dragnethorn', type: 'synth'},
            {name: 'evil-zannng', type: 'synth'},
            {name: 'distorto', type: 'synth'},
            {name: 'deep-verb-pluck1', type: 'synth'},
            {name: 'deep-verb-pluck2', type: 'synth'},
            {name: 'crescendo-stab', type: 'synth'},
            {name: 'fart', type: 'bass'},
            {name: 'bombdive', type: 'bass'},
            {name: 'eurobas', type: 'bass'},
            {name: 'resybass', type: 'bass'},
            {name: 'fat-808-sub', type: 'bass'},
            {name: 'final-round', type: 'bass'},
            {name: 'flarz', type: 'bass'},
            {name: 'gliding-808-sub', type: 'bass'},
            {name: 'dirty-whoopend', type: 'bass'},
            {name: 'poweron', type: 'bass'},
            {name: 'curious', type: 'bass'},
            {name: 'bass-synth', type: 'bass'},
            {name: 'cymbal1', type: 'drums'},
            {name: 'cymbal2', type: 'drums'},
            {name: 'cymbal3', type: 'drums'},
            {name: 'cymbal4', type: 'drums'},
            {name: 'cymbal5', type: 'drums'},
            {name: 'cymbal6', type: 'drums'},
            {name: 'cymbal7', type: 'drums'},
            {name: 'cymbal8', type: 'drums'},
            {name: 'kick1', type: 'drums'},
            {name: 'kick2', type: 'drums'},
            {name: 'snare1', type: 'drums'},
            {name: 'snare2', type: 'drums'},
            {name: 'tom1', type: 'drums'},
            {name: 'tom2', type: 'drums'},
            {name: 'tom3', type: 'drums'},
            {name: 'tom4', type: 'drums'},
            {name: 'warm-horn-hit', type: 'horn'},
            {name: 'punch', type: 'horn'},
            {name: 'punch2', type: 'horn'},
            {name: 'dark-sax-hit', type: 'horn'},
        ];
    }

    _.extend(Tracker.prototype, Backbone.Events)

    Tracker.prototype.init = function(track) {
        this.track = track;
    }

    Tracker.prototype.play =  function(pos) {
        var that = this;
        if (this.playing === false) {
            this.paused = false;
            this.position = pos || this.position;
            this.playing = true;
            this._play(this.position);
            var interval = function() {
                that.position += 250;
                that._play(that.position)
                that.trigger('playing', that.position)
            }
            this.timer = setInterval(interval, 250)
        }
    }

    Tracker.prototype.playSound = function(sound) {
        soundManager.play(sound);
    }

    Tracker.prototype.stop = function() {
        this.playing = false;
        this.position = 0;
        soundManager.stopAll()
        this.trigger('stop', this.position);
        clearTimeout(this.timer);
    }

    Tracker.prototype.pause = function() {
        if (!this.paused) {
            this.paused = true;
            this.playing = false;
            this.trigger('stop', this.position);
            soundManager.pauseAll()
            clearInterval(this.timer);
        }
    }

    Tracker.prototype._play = function(position) {
        var line = this.track;
        if (line.end === position) return this.position = -250;
        line = line[''+position];
        if (line) {
            for (var key in line) {
                if (line[key].name) {
                    var sound = line[key]
                    soundManager.play(sound.name, {volume: this.volume * sound.volume});
                }
            }
        }
    }

    Tracker.prototype.mute = function() {
        if (!this.muted) {
            this.muted = true;
            soundManager.mute();
        } else {
            this.muted = false;
            soundManager.unmute();
        }
    }

    Tracker.prototype.setVolume = function(volume) {
        this.volume = volume;
    }

    window.Tracker = new Tracker();

    soundManager.url = 'swf/';
    soundManager.flashVersion = 9; // optional: shiny features (default = 8)
    soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
    soundManager.useHTML5Audio = false;
    soundManager.useHighPerformance = true;
    soundManager.useFastPolling = true;
    soundManager.debugMode = false;

    soundManager.onready(function() {
        var Tracker = window.Tracker;
        var sounds = Tracker.sounds;
        soundManager.defaultOptions.autoLoad = true;
        var soundsLength = sounds.length;
        var allReady = 0;
        for (var i = 0; i < soundsLength; i++) {
            soundManager.createSound({
                id: sounds[i].name, 
                url: 'sounds/'+sounds[i].name+'.mp3',
                onload: function(isReady) {
                    if (isReady) {
                        allReady += 1;
                    } else {
                        if (this.readyState === 3) {
                            allReady += 1;
                        } else {
                            // XXX put error stuff here
                        }
                    }
                    if (allReady >= soundsLength) Tracker.trigger('ready');
                }
            })
        }

    });

})(window)
