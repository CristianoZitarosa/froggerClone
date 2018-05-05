'use strict';

/**
* Global variables
**/

/* music */
const traffic = document.querySelector("#traffic");
const loop = document.querySelector("#loop");
const jump = document.querySelector("#jump");
const success = document.querySelector("#success");
const ouch = document.querySelector("#ouch");
const win = document.querySelector("#win");
const loose = document.querySelector("#loose");
traffic.loop = true;
loop.loop = true;
/* variables */
const modalContent = document.querySelector('.modal-content');
const modal = document.querySelector('.modal');
let floating = false;
let lap = 0;
let locked = false;

/**
* Function to build the modal when the page is loaded.
* This modal is used to inform the player about rules and how to play.
**/
(function openingModal() {
  modalContent.innerHTML = '<h1 class="centered">Welcome to the Frogger clone!</h1><h3>Rules are simple:</h3><ul> <li>Avoid Cars;</li><li>Avoid Water;</li><li><strong>Reach the top to gain +1 life and +50 points</strong>;</li><li><strong>Game is won if  the top is reached 5 times!</strong></li><li>3 lifes:<ul><li>hit the car loose a life;</li><li>splash into the water and loose a life;</li><li>go out of the screen... and yes loose a life;</li></ul> </li><li>Use the floating Logs to pass the river;</li><li>Grass is a safe place to have some rest.</li><li><strong>Bonus, only if the game is won, points are multiplied by lives saved!!!</strong></li></ul><h2 class="centered">Move the frog by arrow keys. Have fun!</h2><button class="close button centered">PLAY!</button>';
})();

/**
* Listener on the button of the first modal.
* Once the button is pressed, the modal disappears and the music is played.
**/
const closeModal = document.querySelector('.close');
closeModal.onclick = function() {
  modal.style.display = "none";
  traffic.play();
  loop.play();
  window.scrollTo(0, 500);
};

/**
* Class that builds a generic character.
* Main parameters are x and y position on canvas and the image.
**/
class Character {
  constructor (x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

/**
* Class that builds a Log, extends the class Character.
* Main parameters are x and y position on canvas and the image.
**/
class Log extends Character {
  constructor(x, y, sprite) {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }
  update(dt) {
    /* sets speed and direction (right) of external logs rows or resets a log */
    if (this.y !== 223) {
      if (this.x < canvasWidth) {
        this.x += 200*dt;
      } else { this.x = -40; }
    }
    /* sets speed and direction (left) of central logs rows or resets a log */
    if (this.y === 223){
      if (this.x > -100){
        this.x -= 200*dt;
      } else { this.x = 550; }
    }
    /* Player-Log collision check */
    if (player.y < 332 && player.y > 80) { /* if player is on water */
      if (this.x + 101 >= player.x &&
          this.x <= player.x + 60 &&
          this.y - 66 <= player.y &&
          this.y >= player.y - 60) { /* if Player-Log collision happens */
            /* until player is on canvas borders */
            if (player.x > 0 && player.x < canvasWidth) {
              player.x = this.x + 23; /* player floats */
              floating = true;
            } else { /* player outside the canvas -1 life, position reset*/
              player.x = 222; player.y = 640;
              checkLives();
            }
      } else { floating = false; } /* else, player not colliding a log */
    }

  }
}

/**
* All the enemies and an array containing them.
**/
const log1 = new Log(504, 140, 'images/log.png');//0.140
const log2 = new Log(0, 223, 'images/log.png');//103.223
const log3 = new Log(101, 306, 'images/log.png');//202.306
const log4 = new Log(202, 140, 'images/log.png');//202.140
const log5 = new Log(305, 223, 'images/log.png');//305.223
const log6 = new Log(404, 306, 'images/log.png');//404.306

const allLogs = [log1, log2, log3, log4, log5, log6];

/**
* Class that builds a Car, extends the class Character.
* Main parameters are x and y position on canvas and the image.
**/
class Car extends Character {
  constructor(x, y, sprite) {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }

  update(dt) {
    /* sets speed and direction (right) of top row or resets a Car */
    if (this.y === 476) {
      if (this.x <= canvasWidth) {
        this.x += 150*dt;
      } else { this.x = -100; }
    }
    /* sets speed and direction (left) of bottom row or resets a Car */
    if (this.y === 559) {
      if (this.x >= -100) {
        this.x -= 200*dt;
      } else { this.x = 600; }
    }
    /* Player-Car collision check */
    if (this.x + 101 >= player.x &&
        this.x <= player.x + 60 &&
        this.y - 66 <= player.y &&
        this.y >= player.y - 60) { /* If Player-Car collision happens */
          /* -1 life, position reset */
          player.x = 222; player.y = 640;
          checkLives();
    }
  }
}

/**
* All the Cars and an array containing them.
**/
const car1 = new Car(30, 476, 'images/red-car.png');
const car2 = new Car(300, 476, 'images/green-car.png');
const car3 = new Car(50, 559, 'images/yellow-car.png');
const car4 = new Car(350, 559, 'images/blue-car.png');

const allCars = [car1, car2, car3, car4];

/**
* Class that builds the Player, extends the class Character.
* Main parameters are x and y position on canvas and the image.
* Other parameters are lives and score.
**/
class Player extends Character {
  constructor(x, y, sprite) {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.lives = 3;
    this.score = 0;
  }

  update(dt) {
    /**
    * This code is used to center the frog on the block when
    *    jups out of the Log and reaches the top.
    **/
    if (this.y < 83) { /* if Player reaches the top */
      if (this.x > 0 && this.x < 101) { /* Player's position between first column borders */
        this.x = 20; /* Center its position */
      } else if (this.x > 101 && this.x < 202) {
        this.x = 121;
      } else if (this.x > 202 && this.x < 302) {
        this.x = 222;
      } else if (this.x > 302 && this.x < 402) {
        this.x = 323;
      } else if (this.x > 402 && this.x < canvasWidth) {
        this.x = 424;
      }
    }
  }

  handleInput(pressedKeys) {
    /* If the keyboard is set to locked, prevents further key press */
    if (locked) {
      return;
    } else {
      /* Otherwise moves the player and sets canvas' limits */
      if (pressedKeys) {
        jump.currentTime = 0;
        jump.play();

        if (pressedKeys === 'left' && this.x > 33) {
          this.x -= 100;
        }
        else if (pressedKeys === 'up' && this.y > 60) {
          this.y -= 83;
        }
        else if (pressedKeys === 'right' && this.x < 400) {
          this.x += 100;
        }
        else if (pressedKeys === 'down' && this.y < 561) {
          this.y += 83;
        }
        /* If the player reaches the top, points lives and lap are updated */
        if (this.y < 83) {
          this.score += 50;
          this.lives++;
          lap++;
          repositionFrog();
        }

      }
    }
  }
}

/**
* The player.
**/
const player = new Player(222, 640, 'images/frog.png');

/**
* Event listener for pressed keys
**/
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});

/**
* This function is called when the game is won.
* The modal is cleaned and filled with a victory message and a brief recap.
* It is played a music for the game just won.
**/
function endGame() {
  cleanModal();
  stopMusic();
  win.play();
  modal.style.display = "block";
  modalContent.innerHTML = `<h1 class="centered">Congratulation!</h1><h3 class="centered">You have completed the game!</h3><h3 class="centered">Points scored: ${player.score}</h3><h3 class="centered">Lives saved: ${player.lives}</h3><h3 class="centered">Final Score: ${player.score*player.lives}</h3><button class="restart button centered">RESTART!</button>`;
}

/**
* This function is called when the game is not won.
* The modal is cleaned and filled with a message about the fail and a brief
*   recap.
* It is played a music for the game failed to win.
**/
function gameOver() {
  cleanModal();
  stopMusic();
  loose.play();
  modal.style.display = "block";
  modalContent.innerHTML = `<h1 class="centered">Game Over!</h1><h3 class="centered">You have lost all lives and collected ${player.score} points!</h3><button class="restart button centered">RESTART!</button>`;
}

/**
* This function is called to pause the game music, when the game is stopped.
**/
function stopMusic() {
  traffic.pause();
  loop.pause();
}

/**
* This function is called to clean the modal.
**/
function cleanModal() {
  while (modalContent.firstChild) {
    modalContent.removeChild(modalContent.firstChild);
  }
}

/**
* This function resets player's position after a visit to the top after a delay.
* If the game is won the game is ended.
**/
function repositionFrog() {
  if (lap === 5) { /*If the game is won */
    locked = true;
    endGame();
    const restartGame = document.querySelector('.restart');
    restartGame.onclick = function() {
    document.location.reload();
    };
  } else {
    locked = true;
    setTimeout( () => {
      window.scrollTo(0, 500);
      player.y = 640;
      locked = false;
    }, 1500);
    success.play();
  }
}

/**
* This function counts player's lives.
* If Player loose all lives the game is ended.
**/
function checkLives() {
  jump.pause();
  ouch.currentTime = 0;
  ouch.play();
  player.lives--;
  if (player.lives === 0) {
    locked = true;
    gameOver();
    const restartGame = document.querySelector('.restart');
    restartGame.onclick = function() {
    document.location.reload();
    };
  }
}
