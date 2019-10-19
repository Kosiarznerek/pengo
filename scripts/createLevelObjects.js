/**
 * Function creates level's objects with specified level to the global LEVEL_OBJECTS variable
 * @param {Number} level Number of level
 * @param {boolean} restart Restarting level flag
 * @returns {void}
 */
function createLevelObjects(level, restart = false) {
    //Sounds
    SOUNDS.LEVEL_START.currentTime = 0;
    SOUNDS.LEVEL_START.play();
    setTimeout(function () {
        SOUNDS.BACKGROUND_MUSIC.currentTime = 0;
        SOUNDS.BACKGROUND_MUSIC.play();
        SOUNDS.BACKGROUND_MUSIC.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
    }, 3000)

    //Detecting level's data
    let levelData = undefined;
    switch (level) {
        case 1:
            levelData = cloneByStringify(LEVEL01);
            break;
        case 2:
            levelData = cloneByStringify(LEVEL02);
            break;
    }

    //Clearing current data
    if (!restart) {
        LEVEL_OBJECTS.obstacles = [];
        LEVEL_OBJECTS.opponents = [];
        LEVEL_OBJECTS.player = undefined;
    }

    //Creating objects
    for (let row = 0; row < levelData.length; row++) {
        for (let coll = 0; coll < levelData[row].length; coll++) {
            let itemData = levelData[row][coll];
            if (itemData != "NONE") {
                let position = new Vector(itemData.position.x, itemData.position.y);
                let className = itemData.itemName;

                switch (className) {
                    case "ICE_BLOCK":
                    case "DIAMOND_BLOCK":
                        if (!restart) {
                            let obstacle = new Obstacle(position, className);
                            LEVEL_OBJECTS.obstacles.push(obstacle);
                        }
                        break;
                    case "PENGO":
                        let savedLevel = undefined;
                        if (restart) {
                            savedLevel = LEVEL_OBJECTS.player.lifes;
                        }
                        LEVEL_OBJECTS.player = new Player(position);
                        if (restart) {
                            LEVEL_OBJECTS.player.lifes = savedLevel;
                        }
                        break;
                }
            }
        }
    }

    //When players position is the same as obstacle position
    if (restart) {
        let pPos = LEVEL_OBJECTS.player.position;
        for (let i = 0; i < LEVEL_OBJECTS.obstacles.length; i++) {
            let obsPos = LEVEL_OBJECTS.obstacles[i].position;
            if (pPos.x == obsPos.x && pPos.y == obsPos.y) {
                LEVEL_OBJECTS.player.position = getFreePositionOnMap();
                break;
            }
        }
    }

    //New random location for opponents
    let indexes = [];
    for (let i = 0; i < LEVEL_OBJECTS.opponents.length; i++) {
        let opponent = LEVEL_OBJECTS.opponents[i];
        let randomPosition = getFreePositionOnMap(false);
        opponent.position = randomPosition;
    }

    //Creating opponents
    addOpponents(3, restart);
}

/**
 * Function looks for free position spot on map
 * @returns {Vector} Position
 */
function getFreePositionOnMap() {
    let randomPosition = new Vector();
    let free = true;

    do {//Looking for free spot
        free = true;
        let randColl = randomInteger(0, 11);
        let randRow = randomInteger(0, 9);
        randomPosition.x = (randColl * (44 + 4)) + 4;
        randomPosition.y = (randRow * (30 + 2)) + 2;

        for (let j = 0; j < LEVEL_OBJECTS.obstacles.length; j++) {
            let obstacle = LEVEL_OBJECTS.obstacles[j];
            if (obstacle.position.x == randomPosition.x && obstacle.position.y == randomPosition.y) {
                free = false;
                break;
            }

            //The same spot as player
            if (randomPosition.x == LEVEL_OBJECTS.player.position.x && randomPosition.y == LEVEL_OBJECTS.player.position.y) {
                free = false;
                break;
            }
        }
    } while (!free)

    return randomPosition;
}

/**
 * Adds Opponent object to the global LEVEL_OBJECTS.opponents
 * @param {Number} amount Amount of opponents to create
 * @param {boolean} restart Was level restarted?
 */
function addOpponents(amount, restart) {
    //Creating opponents
    let pickedIndexes = [];
    for (let i = 0; i < amount; i++) {
        let randomIndex = undefined;
        let obstacleClassName = undefined;
        while (true) {//Picking random obstacle's position
            randomIndex = randomInteger(0, LEVEL_OBJECTS.obstacles.length - 1);
            obstacleClassName = LEVEL_OBJECTS.obstacles[randomIndex].className;
            if (obstacleClassName === "ICE_BLOCK" && !pickedIndexes.includes(randomIndex)) {
                break;
            }
        }
        pickedIndexes.push(randomIndex);

        //Creating Opponent at the same spot
        let obstacle = LEVEL_OBJECTS.obstacles[randomIndex];
        let opponent = undefined;
        if (!restart) {
            opponent = new Opponent(obstacle.position.clone());
            LEVEL_OBJECTS.opponents.push(opponent);
        }

        //Obstacle is flickering
        setTimeout(function () {//To avoid flickering all of them at the same time
            obstacle.flickering.start = true;
            setTimeout(function () {//After 5s all of them gonna stop flickering
                obstacle.flickering.stop = true;

                if (restart) {
                    for (let i = 0; i < LEVEL_OBJECTS.opponents.length; i++) {
                        let opponent = LEVEL_OBJECTS.opponents[i];
                        opponent.movements = true;
                    }
                }

                if (!restart) {
                    obstacle._destroy();
                    setTimeout(function () {//Waiting until the destroying animation will end
                        opponent.visible = true;
                        opponent.selectRandomDirection(true);
                        opponent.changeDirectionFromTimeToTime();
                        SOUNDS.OPPONENT_SPAWNING.currentTime = 0;
                        SOUNDS.OPPONENT_SPAWNING.play();
                    }, 1000)
                }
            }, 5000)
        }, i * 200)
    }
}
