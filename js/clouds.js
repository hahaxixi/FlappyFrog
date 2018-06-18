require.register('clouds.js', function(exports, require, module) {
'use strict';

var global = require('global');
var utils = require('utils');
var preloadSpritesheet = utils.preloadSpritesheet;

var settings = global.settings;

var cloudGroup;

var spawnTime = Math.random(), timeElapsed = 0;

function resetCloud(cloud) {
  cloud.x = global.phaserGame.width;
  cloud.y = Math.random() * global.phaserGame.height / 2;
  cloud.frame = Math.floor(4 * Math.random());
  var cloudScale = 2 + 2 * Math.random();
  cloud.alpha = 2 / cloudScale;
  if (cloud.alpha > 0.7)
    cloud.alpha = 0.7;
  cloud.scale.setTo(cloudScale, cloudScale);
  cloud.body.velocity.x = -settings.speed / cloudScale;
}

function spawn() {
  var cloud = cloudGroup.getFirstDead();
  if (cloud) {
    cloud.revive();
  } else {
    cloud = cloudGroup.create(global.phaserGame.width, global.phaserGame.height, 'clouds');
  }
  resetCloud(cloud);
}

exports.update = function() {
  cloudGroup.forEachAlive(function(cloud) {
    if (cloud.x + cloud.width < global.phaserGame.world.bounds.left) {
      cloud.kill();
    }
  });

  timeElapsed += global.phaserGame.time.physicsElapsed;
  if (timeElapsed >= spawnTime) {
    spawnTime = 4 * Math.random();
    timeElapsed = 0;
    spawn();
  }

  //console.log(cloudGroup.length);
};

exports.preload = function() {
  preloadSpritesheet('clouds', 128, 64);
};

exports.create = function() {
  cloudGroup = global.phaserGame.add.group();
};

});
