class Player {
    /**
     * Creates Player object
     * @param {Vector} position
     */
    constructor(position) {
        this.position = position;
        this._image = IMAGES.PENGO_DOWN2;

        //Movements
        this.move = {
            left: false,
            right: false,
            up: false,
            down: false,
        };
        this._movingDirection = new Vector();
        this._movementAnimations = {
            left: {
                animationArray: [IMAGES.PENGO_LEFT1, IMAGES.PENGO_LEFT2],
                currentIndex: 0, counter: 0,
            },
            right: {
                animationArray: [IMAGES.PENGO_RIGHT1, IMAGES.PENGO_RIGHT2],
                currentIndex: 0, counter: 0,
            },
            up: {
                animationArray: [IMAGES.PENGO_UP1, IMAGES.PENGO_UP2],
                currentIndex: 0, counter: 0,
            },
            down: {
                animationArray: [IMAGES.PENGO_DOWN1, IMAGES.PENGO_DOWN2],
                currentIndex: 0, counter: 0,
            },
        };

        //LOOKS AT (front)
        this._lookingAt = new Vector(0, 1);

        //PUSHING OBSTACLES
        this._pushing = false;
        this._obstacleToPush = undefined;
        this._pushImages = {
            left: IMAGES.PENGO_PUSH_LEFT,
            right: IMAGES.PENGO_PUSH_RIGHT,
            up: IMAGES.PENGO_PUSH_UP,
            down: IMAGES.PENGO_PUSH_DOWN,
        };

        //Lifes
        this.lifes = 3;
        this.dead = false;
        this.collisionWithOpponents = true;

        //Dead animation
        this._deadAnimation = {
            animationArray: [IMAGES.PENGO_DEAD1, IMAGES.PENGO_DEAD2],
            currentIndex: 0, counter: 0,
        }

        //Level passed
        this._passedLevel = false;
    }

    /**
     * Draws Player object on canvas context
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.drawImage(this._image, this.position.x, this.position.y);
    }

    /**
     * Moves Players object based on grid and this.move object
     */
    updateMovemets() {
        if (this.dead) {
            return false
        }

        if (this._isOnGrid() && (this.move.left || this.move.right || this.move.up || this.move.down)) {
            this._movingDirection.multiplyScalar(0);
            if (this.move.left) {
                this._movingDirection.x = -48;
            } else if (this.move.right) {
                this._movingDirection.x = 48;
            } else if (this.move.up) {
                this._movingDirection.y = -32;
            } else if (this.move.down) {
                this._movingDirection.y = 32;
            }
            this._movingDirection.divideScalar(16); //GCD of 48 and 32
        } else if (this._isOnGrid() && !this.move.left && !this.move.right && !this.move.up && !this.move.down) {
            this._movingDirection.multiplyScalar(0);
        }
        if (!this._wantsToPushObstacle() && this._isGonnaBeOnCanvas()) {
            this.position.add(this._movingDirection);
        }
    }

    /**
     * Updates Player's lookingAt Vector
     */
    updateLookAtPosition() {
        if (this.move.left) {
            this._lookingAt.positionSet(-1, 0);
        } else if (this.move.right) {
            this._lookingAt.positionSet(1, 0);
        } else if (this.move.up) {
            this._lookingAt.positionSet(0, -1);
        } else if (this.move.down) {
            this._lookingAt.positionSet(0, 1);
        }
    }

    /**
     * Checks if Player's position is corrent with game grid
     * @returns {boolean}
     */
    _isOnGrid() {
        //X: coll * (44 + 4)) + 4, Y: (row * (30 + 2)) + 2
        if ((this.position.x - 4) % 48 == 0 && (this.position.y - 2) % 32 == 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Checks if player next position gonna be on canvas based on _lookingAt
     * @returns {boolean}
     */
    _isGonnaBeOnCanvas() {
        let nextPosition = this.position.clone();
        if (this._lookingAt.x > 0) {
            nextPosition.x += 48;
        } else if (this._lookingAt.x < 0) {
            nextPosition.x -= 48;
        } else if (this._lookingAt.y > 0) {
            nextPosition.y += 32;
        } else if (this._lookingAt.y < 0) {
            nextPosition.y -= 32;
        }

        //Checking game edges
        if (nextPosition.x < -43 || nextPosition.x > 578) {
            return false
        }
        if (nextPosition.y < -28 || nextPosition.y > 320) {
            return false
        }
        return true;
    }

    /**
     * Check if player want to push Obstacle
     * @returns {boolean}
     */
    _wantsToPushObstacle() {
        let speculatedObstaclePostion = this.position.clone();
        if (this._lookingAt.x > 0) {
            speculatedObstaclePostion.x += 48;
        } else if (this._lookingAt.x < 0) {
            speculatedObstaclePostion.x -= 48;
        } else if (this._lookingAt.y > 0) {
            speculatedObstaclePostion.y += 32;
        } else if (this._lookingAt.y < 0) {
            speculatedObstaclePostion.y -= 32;
        }

        for (let i = 0; i < LEVEL_OBJECTS.obstacles.length; i++) {
            let obstaclePosition = LEVEL_OBJECTS.obstacles[i].position;
            if (obstaclePosition.x == speculatedObstaclePostion.x && obstaclePosition.y == speculatedObstaclePostion.y) {
                this._obstacleToPush = LEVEL_OBJECTS.obstacles[i];
                return true;
            }

        }

        this._obstacleToPush = undefined;
        return false;
    }

    /**
     * Updates Player image based on direction he moves
     */
    updateAnimations() {
        if (this._pushing) {
            return undefined
        }
        if (this._movingDirection.x > 0) {//player moves right
            let index = this._movementAnimations.right.currentIndex;
            this._image = this._movementAnimations.right.animationArray[index];
            this._updateMovementAnimationIndex("right");
        } else if (this._movingDirection.x < 0) {//player moves left
            let index = this._movementAnimations.left.currentIndex;
            this._image = this._movementAnimations.left.animationArray[index];
            this._updateMovementAnimationIndex("left");
        } else if (this._movingDirection.y > 0) {//player moves down
            let index = this._movementAnimations.down.currentIndex;
            this._image = this._movementAnimations.down.animationArray[index];
            this._updateMovementAnimationIndex("down");
        } else if (this._movingDirection.y < 0) {//player moves up
            let index = this._movementAnimations.up.currentIndex;
            this._image = this._movementAnimations.up.animationArray[index];
            this._updateMovementAnimationIndex("up");
        } else if (this.dead) {//player is dead
            let index = this._deadAnimation.currentIndex;
            this._image = this._deadAnimation.animationArray[index];
        }
    }

    /**
     * Updates indexes in _movementAnimations based on counters
     * Updates counters in _movementAnimations by incresing their valus by 1
     * @param {String} direction Object key in _movenetAnimations
     */
    _updateMovementAnimationIndex(direction) {
        //Increasing counter by 1
        this._movementAnimations[direction].counter++;
        if (this._movementAnimations[direction].counter + 1 >= Number.MAX_SAFE_INTEGER) {
            this._movementAnimations[direction].counter = 0;
        }

        //Every 10 frames changing animation's image
        if (this._movementAnimations[direction].counter % 10 == 0) {
            this._movementAnimations[direction].currentIndex++;
            if (this._movementAnimations[direction].currentIndex >= this._movementAnimations[direction].animationArray.length) {
                this._movementAnimations[direction].currentIndex = 0;
            }
        }
    }

    /**
     * When it's near the Obstacle object he push it
     */
    pushObstacle() {
        if (this.dead) {
            return undefined
        }
        if (!this._obstacleToPush) {
            return undefined
        }
        ;

        //Pushing Obstacle
        let direction = new Vector(this._lookingAt.x, this._lookingAt.y);
        this._obstacleToPush.push(direction);
        this._obstacleToPush = undefined;

        //Changing graphic
        this._pushing = true;
        if (direction.x > 0) {
            this._image = this._pushImages.right;
        } else if (direction.x < 0) {
            this._image = this._pushImages.left;
        } else if (direction.y > 0) {
            this._image = this._pushImages.down;
        } else if (direction.y < 0) {
            this._image = this._pushImages.up;
        }
        let that = this;
        setTimeout(function () {
            that._pushing = false;
            //Reseting image
            if (that._lookingAt.x > 0) {
                let index = that._movementAnimations.right.currentIndex;
                that._image = that._movementAnimations.right.animationArray[index];
            } else if (that._lookingAt.x < 0) {
                let index = that._movementAnimations.left.currentIndex;
                that._image = that._movementAnimations.left.animationArray[index];
            } else if (that._lookingAt.y > 0) {
                let index = that._movementAnimations.down.currentIndex;
                that._image = that._movementAnimations.down.animationArray[index];
            } else if (that._lookingAt.y < 0) {
                let index = that._movementAnimations.up.currentIndex;
                that._image = that._movementAnimations.up.animationArray[index];
            }
        }, 200)
    }

    /**
     * Function checks if player arrange all DIAMOND_BLOCK's in one line
     * @returns {boolean}
     */
    winByArrange() {
        if (this._passedLevel) {
            return false
        }

        //Selecting only DIAMOND BLOCK's
        let diamondBlocks = [];
        for (let i = 0; i < LEVEL_OBJECTS.obstacles.length; i++) {
            let obstacle = LEVEL_OBJECTS.obstacles[i];
            if (obstacle.className == "DIAMOND_BLOCK") {
                diamondBlocks.push(obstacle);
                if (diamondBlocks.length == 3) {
                    break;
                }
            }
        }

        //They can't move in any direction
        for (let i = 0; i < diamondBlocks.length; i++) {
            let diamondMoving = diamondBlocks[i].moving;
            if (diamondMoving.left || diamondMoving.right || diamondMoving.up || diamondMoving.down) {
                return false;
            }
        }

        //Checking horizontal
        if (
            diamondBlocks[0].position.y == diamondBlocks[1].position.y &&
            diamondBlocks[1].position.y == diamondBlocks[2].position.y
        ) {
            //Sorting ascending by X value
            function compare(a, b) {
                if (a.position.x < b.position.x) {
                    return -1
                }
                if (a.position.x > b.position.x) {
                    return 1
                }
                return 0;
            }

            diamondBlocks.sort(compare);

            //Checking if they are close together
            for (let i = 0; i < diamondBlocks.length - 1; i++) {
                let posX = diamondBlocks[i].position.x;
                let nextPosX = diamondBlocks[i + 1].position.x;
                if ((nextPosX - posX) != 48) {
                    return false;
                }
            }
            return true;
        }

        //Checking vertical
        else if (
            diamondBlocks[0].position.x == diamondBlocks[1].position.x &&
            diamondBlocks[1].position.x == diamondBlocks[2].position.x
        ) {
            //Sorting ascending by Y value
            function compare(a, b) {
                if (a.position.y < b.position.y) {
                    return -1
                }
                if (a.position.y > b.position.y) {
                    return 1
                }
                return 0;
            }

            diamondBlocks.sort(compare);

            //Checking if they are close together
            for (let i = 0; i < diamondBlocks.length - 1; i++) {
                let posY = diamondBlocks[i].position.y;
                let nextPosY = diamondBlocks[i + 1].position.y;
                if ((nextPosY - posY) != 32) {
                    return false;
                }
            }
            return true;
        } else {
            return false
        }
    }

    /**
     * Checks if player got killed by opponent object
     * @returns {boolean}
     */
    getsKilledByOpponent() {
        let mySquare = [
            new Vector(this.position.x, this.position.y),
            new Vector(this.position.x + 44, this.position.y),
            new Vector(this.position.x + 44, this.position.y + 30),
            new Vector(this.position.x, this.position.y + 30),
        ]

        for (let i = 0; i < LEVEL_OBJECTS.opponents.length; i++) {
            let opMove = LEVEL_OBJECTS.opponents[i].movements;
            if (!opMove) {
                continue
            }

            let opPos = LEVEL_OBJECTS.opponents[i].position.clone();
            let opSquare = [
                new Vector(opPos.x, opPos.y),
                new Vector(opPos.x + 44, opPos.y),
                new Vector(opPos.x + 44, opPos.y + 30),
                new Vector(opPos.x, opPos.y + 30),
            ];

            for (let j = 0; j < opSquare.length; j++) {
                if (isPointInPolygon(mySquare, opSquare[j])) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Killing player and playing animation
     */
    gotKilled() {
        //Only once
        if (!this.dead) {
            for (let i = 0; i < LEVEL_OBJECTS.opponents.length; i++) {
                let opponent = LEVEL_OBJECTS.opponents[i];
                if (!opponent.dead) {
                    opponent.movements = false;
                }
            }
            this.lifes -= 1;
            this.dead = true;
            this._movingDirection.multiplyScalar(0);

            //Sounds 
            SOUNDS.BACKGROUND_MUSIC.pause();
            SOUNDS.PLAYER_KILLED.currentTime = 0;
            SOUNDS.PLAYER_KILLED.play();
        }
        if (!this.dead) {
            return
        }
    }

    /**
     * Updates animation when Player is dead
     */
    updateDeadAnimation() {
        if (!this.dead) {
            return
        }

        //Updating animation index
        this._deadAnimation.counter++;
        if (this._deadAnimation.counter % 10 == 0) {
            this._deadAnimation.currentIndex++;
            if (this._deadAnimation.currentIndex >= this._deadAnimation.animationArray.length) {
                this._deadAnimation.currentIndex = 0;
            }
        }

        //When animation should stop
        if (this._deadAnimation.counter >= 100) {
            this._deadAnimation.counter = 0;
            this._deadAnimation.currentIndex = 0;
            this.dead = false;
            this.updateAnimations();
            if (this.lifes <= 0) {
                CURRENT_LEVEL = 1;
                AMOUNT_OF_OPPONENTS = 6;
                createLevelObjects(CURRENT_LEVEL);
                USER_INTERFACE.updatePlayerLifes();
            } else {
                createLevelObjects(CURRENT_LEVEL, true);
                USER_INTERFACE.updatePlayerLifes();
            }
        }
    }
}
