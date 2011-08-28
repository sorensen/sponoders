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
        this._paused = false;
        this.sounds = [
            {name: 'clap', type: 'percussion'},
            {name: 'cymbal', type: 'percussion'}, 
            {name: 'hihat', type: 'percussion'}, 
            {name: 'kick2', type: 'drums'}, 
            {name: 'kickdrum', type: 'drums'}, 
            {name: 'metalclick', type: 'percussion'},
            {name: 'shaker', type: 'percussion'}
        ];
    }

    _.extend(Tracker.prototype, Backbone.Events)

    Tracker.prototype.init = function(track) {
        this.track = track;
    }

    Tracker.prototype.play =  function(pos) {
        var that = this;
        this.playing = true;
        this._play(this.position);
        var interval = function() {
            that.position += 250;
            that._play(that.position)
            that.trigger('playing', that.position)
        }
        this.timer = setInterval(interval, 250)
    }

    Tracker.prototype.playSound = function(sound) {
        soundManager.play(sound);
    }

    Tracker.prototype.stop = function() {
        this.playing = false;
        this.position = 0;
        soundManager.stopAll()
        clearTimeout(this.timer);
    }

    Tracker.prototype.pause = function() {
        if (this.paused) {
            this.paused = false;
            this.play(this.position)
            soundManager.resumeAll()
        } else {
            this.paused = true;
            soundManager.pauseAll()
            clearInterval(this.timer);
        }
    }

    Tracker.prototype._play = function(position) {
        var track = this.track;
        if (track.end === position) return this.position = 0;
        if (track[''+position]) {
            for (var key in track[''+position]) {
                var sound = track[''+position][key]
                soundManager.play(sound.name, {volume: this.volume * sound.volume});
            }
        }
    }

    Tracker.prototype.setVolume = function(volume) {
        this.volume = volume;
    }

    window.Tracker = new Tracker();

    soundManager.url = 'swf/';
    soundManager.flashVersion = 9; // optional: shiny features (default = 8)
    soundManager.useFlashBlock = true; // optionally, enable when you're ready to dive in
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
