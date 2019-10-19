//ONLOAD
window.onload = function () {
    setup();
};

//GLOBAL VARIABLES
const WIDTH = 580; //Canvas width
const HEIGHT = 322; //Canvas height
const LEVEL_OBJECTS = {
    player: undefined,
    opponents: [],
    obstacles: [],
}
let CURRENT_LEVEL = 1;
let AMOUNT_OF_OPPONENTS = 6;
let USER_INTERFACE = undefined;
let GAME_STARTED = false;

/**
 * Main function execute after the whole page has been loaded
 */
function setup() {
    //Creating canvas
    let canvas = document.createElement("canvas");
    canvas.id = "canvas";
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    let ctx = canvas.getContext('2d');
    document.getElementById("gameCanvas").appendChild(canvas);

    //Preloading images
    preloadImages(IMAGES, function () {
        //User Interface
        USER_INTERFACE = new UserIntercase();
    })

    //Keypress event
    document.body.onkeydown = function (e) {
        let key = e.key.toUpperCase();
        switch (key) {
            case "A":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.left = true;
                break;
            case "D":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.right = true;
                break;
            case "W":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.up = true;
                break;
            case "S":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.down = true;
                break;
            case " ":
                if (GAME_STARTED) {
                    LEVEL_OBJECTS.player.pushObstacle();
                } else {
                    USER_INTERFACE.startGame(ctx);
                }
                break;
        }
    }
    document.body.onkeyup = function (e) {
        let key = e.key.toUpperCase();
        switch (key) {
            case "A":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.left = false;
                break;
            case "D":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.right = false;
                break;
            case "W":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.up = false;
                break;
            case "S":
                if (GAME_STARTED) LEVEL_OBJECTS.player.move.down = false;
                break;
        }
    }
}

/**
 * Aniamation loop 30 frames per second
 * @param {CanvasRenderingContext2D} ctx
 */
function animation(ctx) {
    //BackgroundColor
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "black";

    //Adding opponents
    if (LEVEL_OBJECTS.opponents.length < 3 && AMOUNT_OF_OPPONENTS > 0) {
        addOpponents(1, false);
    }

    //Opponents update
    for (let i = 0; i < LEVEL_OBJECTS.opponents.length; i++) {
        let opponent = LEVEL_OBJECTS.opponents[i];
        opponent.checkPushWithObstacles();
        opponent.updateLookAtPosition();
        opponent.updateMovemets();
        opponent.updateAnimations();
        opponent.draw(ctx);
    }

    //Obstacles
    for (let i = LEVEL_OBJECTS.obstacles.length - 1; i >= 0; i--) {
        let obstacle = LEVEL_OBJECTS.obstacles[i];
        if (obstacle.shoudBeRemoved) {
            obstacle.removeFromLEVEL_OBJECTS();
        }
    }
    for (let i = 0; i < LEVEL_OBJECTS.obstacles.length; i++) {
        let obstacle = LEVEL_OBJECTS.obstacles[i];
        obstacle.updatePosition();
        obstacle.draw(ctx);
    }

    //Player
    LEVEL_OBJECTS.player.updateLookAtPosition();
    LEVEL_OBJECTS.player.updateMovemets();
    LEVEL_OBJECTS.player.updateAnimations();
    if (LEVEL_OBJECTS.player.getsKilledByOpponent()) {
        LEVEL_OBJECTS.player.gotKilled();
    }
    LEVEL_OBJECTS.player.updateDeadAnimation(); //Only when it's dead

    //Next level
    if (LEVEL_OBJECTS.player.winByArrange() || AMOUNT_OF_OPPONENTS <= 0) {
        SOUNDS.BACKGROUND_MUSIC.pause();
        LEVEL_OBJECTS.player._passedLevel = true;
        CURRENT_LEVEL++;
        if (CURRENT_LEVEL > 2) {
            CURRENT_LEVEL = 1;
        }
        AMOUNT_OF_OPPONENTS = 6;
        createLevelObjects(CURRENT_LEVEL);
        LEVEL_OBJECTS.player._passedLevel = false;
        USER_INTERFACE = new UserIntercase();
    }
    LEVEL_OBJECTS.player.draw(ctx);
}
