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
const lose = document.querySelector("#lose");
traffic.loop = true;
loop.loop = true;
/* variables */
const modalContent = document.querySelector('.modal-content');
const modal = document.querySelector('.modal');
let lap = 0;
let locked = false;

/**
* Function to build the modal when the page is loaded.
* This modal is used to inform the player about rules and how to play.
**/
(function openingModal() {
  modalContent.innerHTML = '<h1 class="centered">Welcome to the Frogger clone!</h1><h3>Rules are simple:</h3><ul> <li>Avoid Cars;</li><li>Avoid Water;</li><li><strong>Reach the top to gain +1 life and +50 points</strong>;</li><li><strong>Game is won if  the top is reached 5 times!</strong></li><li>3 lifes:<ul><li>hit the car and lose a life;</li><li>splash into the water and lose a life;</li><li>go out of the screen... and yes lose a life;</li></ul> </li><li>Use the floating Logs to pass the river;</li><li>Grass is a safe place to have some rest.</li><li><strong>Bonus, only if the game is won, points are multiplied by lives saved!!!</strong></li></ul><h2 class="centered">Move the frog by arrow keys. Have fun!</h2><button class="close button centered">PLAY!</button>';
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
  constructor(x, y, sprite, speed) {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.speed = speed;
  }
  update(dt) {
    /* sets speed and direction (right) of external logs rows or resets a log */
    if (this.y !== 223) {
      if (this.x < canvasWidth) {
        this.x += this.speed * dt;
      } else { this.x = -40; }
    }
    /* sets speed and direction (left) of central logs rows or resets a log */
    if (this.y === 223){
      if (this.x > -100){
        this.x -= this.speed * dt;
      } else { this.x = 550; }
    }
    /* Player-Log collision check */
    if (player.y === 142) {
      if (collision(player.x,player.y,60,60,log1.x,log1.y,101,60)) {
        player.x = log1.x + 23;
      } else if (collision(player.x,player.y,60,60,log4.x,log4.y,101,60)) {
        player.x = log4.x + 23;
      } else {
        repositionFrog();
        checkLives();
      }
    }
    if (player.y === 225) {
      if (collision(player.x,player.y,60,60,log2.x,log2.y,101,60)) {
        player.x = log2.x + 23;
      } else if (collision(player.x,player.y,60,60,log5.x,log5.y,101,60)) {
        player.x = log5.x + 23;
      } else {
        repositionFrog();
        checkLives();
      }
    }
    if (player.y === 308) {
      if (collision(player.x,player.y,60,60,log3.x,log3.y,101,60)) {
        player.x = log3.x + 23;
      } else if (collision(player.x,player.y,60,60,log6.x,log6.y,101,60)) {
        player.x = log6.x + 23;
      } else {
        repositionFrog();
        checkLives();
      }
    }

  }
}

/**
* All the enemies and an array containing them.
**/
const log1 = new Log(504, 140, 'images/log.png', 200);
const log2 = new Log(0, 223, 'images/log.png', 200);
const log3 = new Log(101, 306, 'images/log.png', 200);
const log4 = new Log(202, 140, 'images/log.png', 200);
const log5 = new Log(305, 223, 'images/log.png', 200);
const log6 = new Log(404, 306, 'images/log.png', 200);

const allLogs = [log1, log2, log3, log4, log5, log6];

/**
* Class that builds a Car, extends the class Character.
* Main parameters are x and y position on canvas and the image.
**/
class Car extends Character {
  constructor(x, y, sprite, speed) {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.speed = speed;
  }

  update(dt) {
    /* sets speed and direction (right) of top row or resets a Car */
    if (this.y === 476) {
      if (this.x <= canvasWidth) {
        this.x += this.speed * dt;
      } else { this.x = -100; }
    }
    /* sets speed and direction (left) of bottom row or resets a Car */
    if (this.y === 559) {
      if (this.x >= -100) {
        this.x -= this.speed * dt;
      } else { this.x = 600; }
    }
    /* Player-Car collision check */
    if (collision(player.x, player.y, 60, 60, this.x, this.y, 101, 66)) {
      /* If Player-Car collision happens -1 life, position reset */
          repositionFrog();
          checkLives();
    }
  }
}

/**
* All the Cars and an array containing them.
**/
const car1 = new Car(30, 476, 'images/red-car.png', 200);
const car2 = new Car(300, 476, 'images/green-car.png', 200);
const car3 = new Car(50, 559, 'images/yellow-car.png', 150);
const car4 = new Car(350, 559, 'images/blue-car.png', 150);

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
    *    he jumps out of the log to prevent a weird horizontal position.
    * The check is active on 2 rows close to water.
    **/
    if (this.y === 391 || this.y === 59) {
      if (this.x > 0 && this.x < 101) { /* Player's between column borders */
        this.x = 20; /* Position centered */
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
    if (locked) return;
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
        checkLap();
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
* The function that handles collision between frog and an element (a car or a log)
* (Px, Py, Pw, Ph, Ex, Ey, Ew, Eh) ===
* (player.x, player.y,playerWidth,playerHeight,element.x,element.y,elementWidth,elementHeight)
**/
let collision = function(Px, Py, Pw, Ph, Ex, Ey, Ew, Eh) {
  /* returns true if player collides an object */
  return (Ex + Ew >= Px && Ex <= Px + Pw && Ey - Eh <= Py && Ey >= Py - Ph);
};

/**
* This function is called when the game is won.
* The modal is cleaned and filled with a victory message and a brief recap.
* It is played a music for the game just won.
**/
function winGame() {
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
function loseGame() {
  stopMusic();
  lose.play();
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
* This function is called to pause the 'jump' sound to prevent an overlap
*   with the 'ouch' sound played if the frog loses 1 life.
**/
function switchSound() {
  jump.pause();
  ouch.play();
}

/**
* This function checks player's laps after a visit to the top.
* The game is won with 5 visits, else the player starts again from bottom.
**/
function checkLap() {
  if (lap === 5) { /*If the game is won */
    locked = true;
    winGame();
    restartButton();
  } else {
    locked = true;
    setTimeout( () => {
      window.scrollTo(0, 500);
      repositionFrog();
      locked = false;
    }, 1500);
    success.play();
  }
}

/**
* This function resets player's current position to start position.
**/
function repositionFrog() {
  player.x = 222;
  player.y = 640;
}

/**
* This function counts player's lives.
* If Frog loses all lives the game is ended.
**/
function checkLives() {
  locked = true;
  switchSound();
  player.lives--;
  if (player.lives === 0) {
    locked = true;
    loseGame();
    restartButton();
  }
  setTimeout( () => {
    locked = false;
  }, 1000);
}

/**
* This function is called to set a listener on the restart button
*   once the button is built if needed.
**/
function restartButton() {
    const restartGame = document.querySelector('.restart');
    restartGame.onclick = function() {
      document.location.reload();
    };
}
