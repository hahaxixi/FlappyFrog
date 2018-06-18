require.register('sounds.js', function(exports, require, module) {
'use strict';

var global = require('global');
var utils = require('utils');
var preloadAudio = utils.preloadAudio;
var settings = global.settings;

function SoundArray(name, opts) {
  this.sounds = [];
  this.name = name;
  this.count = opts.count || 0;
  this.currentIndex = 0;
  this.recentIndex = 0;
  this.loop = !!opts.loop;
  this.playing = false;
  this.manuallyStopped = false;
}

SoundArray.prototype.preload = function() {
  if (!this.count) {
    preloadAudio(this.name);
    return;
  }

  var key, name = this.name;
  for (var i = 0, l = this.count; i < l; i++) {
    key = name + '/' + (i + 1);
    preloadAudio(key);
  }
};

SoundArray.prototype.createSound = function(key) {
  var sound = global.phaserGame.add.audio(key);
  sound.onStop.add(this.onStop, this);
  return sound;
};

SoundArray.prototype.create = function() {
  if (!this.count) {
    this.sounds[0] = this.createSound(this.name);
    this.count = 1;
    return;
  }

  var key, name = this.name;
  for (var i = 0, l = this.count; i < l; i++) {
    key = name + '/' + (i + 1);
    this.sounds[i] = this.createSound(key);
  }
};

SoundArray.prototype.random = function() {
  if (this.count === 1) {
    return;
  }
  var index = Math.floor(Math.random() * this.count);
  if (this.count < 5) {
    this.currentIndex = index;
    return;
  }
  if ( (index !== this.currentIndex && index !== this.recentIndex) ||
    (index === this.currentIndex && index === this.recentIndex) ) {
    this.recentIndex = this.currentIndex;
    this.currentIndex = index;
    return;
  }
  return this.random();
}

SoundArray.prototype.getSound = function() {
  return this.sounds[this.currentIndex];
};

SoundArray.prototype.isPlaying = function() {
  return this.playing;
};

SoundArray.prototype.onStop = function() {
  if (this.loop && !this.manuallyStopped) {
    this.play();
    return;
  }
  this.playing = false;
};

SoundArray.prototype.playSound = function() {
  this.playing = true;
  this.getSound().play();
};

SoundArray.prototype.play = function() {
  this.manuallyStopped = false;
  this.random();
  this.playSound();
  if (settings.debug)
    console.log('sound', this.name, this.currentIndex + 1);
};

SoundArray.prototype.playCustom = function(id) {
  this.manuallyStopped = true;
  this.currentIndex = id - 1;
  this.playSound();
};

SoundArray.prototype.stop = function() {
  this.manuallyStopped = true;
  this.getSound().stop();
};

SoundArray.prototype.toggle = function() {
  this.playing ? this.stop() : this.play();
};

var sounds;

exports = function(name) {
  return sounds[name];
};

exports.preload = function() {
  sounds = {
    'bgm': {loop: true},
    'crash': {},
    'flap': {},
    'ha': {},
    'hurt': {count: settings.hurtSounds},
    'score': {count: settings.scoreSounds}
  };

  var opts;
  for (var name in sounds) {
    opts = sounds[name];
    sounds[name] = new SoundArray(name, opts);
    sounds[name].preload();
  }
};

exports.create = function() {
  for (var name in sounds) {
    sounds[name].create();
  }
};

module.exports = exports;

});
