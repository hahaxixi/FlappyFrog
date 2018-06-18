require.register('game.js', function(exports, require, module) {
'use strict';

var global = require('global');
var preloadImage = require('utils').preloadImage;
var sounds = require('sounds');
var pipes = require('pipes');
var clouds = require('clouds');

var settings = global.settings;

var ground, bird;
var gameStarted = false, crashed = false, crashedGround = false;
var scoreText, score;
var timeElapsedText, timeElapsed, startTime;

function createBackground() {
  var graphics = global.phaserGame.add.graphics(0, 0);
  graphics.beginFill(0xDDEEFF, 1);
  graphics.drawRect(0, 0, global.phaserGame.width, global.phaserGame.height);
  graphics.endFill();
}

function createGround() {
  global.phaserGame.world.bounds.height = global.phaserGame.height + 16;

  var height = 32;
  ground = global.phaserGame.add.tileSprite(
    0,
    global.phaserGame.height - height,
    global.phaserGame.width,
    height,
    'ground'
  );
  ground.tileScale.setTo(2, 2);
}

function createBird() {
  bird = global.phaserGame.add.sprite(
    global.phaserGame.width / 2,
    global.phaserGame.height / 2,
   'frog'
  );
  bird.anchor.setTo(0.5, 0.5);
  bird.body.collideWorldBounds = true;
}

function createTexts() {
  scoreText = global.phaserGame.add.text(
    global.phaserGame.width / 2,
    global.phaserGame.height / 4,
    '',
    {
      font: '14px ' + global.font,
      fill: '#fff',
      stroke: '#430',
      strokeThickness: 4,
      align: 'center'
    }
  );
  scoreText.anchor.setTo(0.5, 0.5);

  timeElapsedText = global.phaserGame.add.text(
    global.phaserGame.width / 2,
    scoreText.y + scoreText.height,
    '',
    {
      font: '14px ' + global.font,
      fill: '#f00',
      align: 'center'
    }
  );
  timeElapsedText.anchor.setTo(0.5, 0.5);
}

function updateGround() {
  if (crashed)
    return;
  var t = global.phaserGame.time.physicsElapsed;
  var v = settings.speed;
  ground.tilePosition.x -= t * v / 2;
}

function updateBird() {
  if (!gameStarted) {
    var y = global.phaserGame.height / 2;
    bird.y = y + 8 * Math.cos(global.phaserGame.time.now / 200);
    return;
  }

  if (crashed)
    return;

  var dvy = settings.flap + bird.body.velocity.y;
  bird.angle = (90 * dvy / settings.flap) - 180;
  if (bird.angle < 0) {
    bird.angle = 0;
  }
}

function resetBird() {
  bird.body.gravity.y = 0;
  bird.x = global.phaserGame.width / 4 + bird.width / 2;
  bird.angle = 0;
  bird.scale.setTo(1, 1);
}

function flap() {
  if (!gameStarted)
    return;

  if (!crashed) {
    bird.body.velocity.y = -settings.flap;
    sounds('flap').isPlaying() || sounds('flap').play();
  }
}

function crash() {
  bird.angle = -20;
  bird.scale.setTo(1, -1);
  sounds('score').stop();
  sounds('ha').play();
  sounds('crash').play();
}

function crashGround() {
  bird.angle = -20;
  bird.scale.setTo(1, -1);
  sounds('score').stop();
  !!crashed || sounds('crash').play();
}

function checkCollision() {
  if (!crashed) {
    if (
      (settings.ceiling && bird.body.bottom - bird.body.height <= global.phaserGame.world.bounds.top) ||
      pipes.checkCollision(
        bird.body.right - bird.body.width,
        bird.body.bottom - bird.body.height,
        bird.body.right,
        bird.body.bottom)
    ) {
      stop();
      crash();
      crashed = true;

    } else if (pipes.checkScore(bird.body.right)) {
      addScore();
    }
  }

  if (!crashedGround) {
    if (bird.body.bottom >= global.phaserGame.world.bounds.bottom) {
      stop();
      crashGround();
      crashed = true;
      crashedGround = true;
      endGame();
    }
  }
}

function addScore() {
  score += 1;
  updateScoreText();
  sounds('score').play();
}

function updateScoreText() {
  scoreText.setText(
    '+ %s s'.replace('%s', score)
  );
}

function updateTimeElapsed() {
  if (crashed)
    return;
  var a = Math.floor(global.phaserGame.time.elapsedSecondsSince(startTime)) + 1;
  if (timeElapsed == a)
    return;
   timeElapsed = a;
   timeElapsedText.setText(
     '- %s s'.replace('%s', timeElapsed)
   );
}

var onGameOver;
function endGame() {
  global.timeElapsed = timeElapsed;
  global.score = score;
  if (!global.bestScore || global.bestScore < score) {
    global.bestScore = score;
  }

  setTimeout(function() {
    sounds('hurt').play();
    onGameOver();
  }, 500);
}

function stop() {
  if (crashed)
    return;

  pipes.stop();
}

exports.start = function(cb) {
  startTime = global.phaserGame.time.now;

  sounds('hurt').stop();
  onGameOver = cb;

  bird.body.gravity.y = settings.gravity;
  updateScoreText();
  scoreText.visible = true;
  pipes.start();
  gameStarted = true;

  flap();
};

exports.reset = function() {
  timeElapsedText.setText('');

  score = 0;
  gameStarted = false;
  crashed = false;
  crashedGround = false;

  scoreText.visible = false;

  pipes.reset();
  resetBird();
};

exports.preload = function() {
  pipes.preload();
  clouds.preload();
  preloadImage('frog');
  preloadImage('ground');
};

exports.create = function() {
  createBackground();
  pipes.create();
  createBird();
  createGround();
  createTexts();
  clouds.create();

  global.phaserGame.input.onDown.add(flap);

  exports.reset();
};

exports.update = function() {
  clouds.update();
  updateBird();
  updateGround();
  if (gameStarted) {
    updateTimeElapsed();
    checkCollision();
    pipes.update();
  }
};

exports.render = function() {
  if (settings.debug)
    global.phaserGame.debug.renderSpriteBody(bird);;
  pipes.render();
};

});
