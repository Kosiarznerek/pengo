class Opponent {
    /**
     * Creates an Opponent object which is invisible
     * @param {Vector} position
     */
    constructor(position) {
        this.position = position;
        this.visible = false;
        this._image = IMAGES.OPPONENT_DOWN1;

        //Movements
        this._move = {
            left: false,
            right: false,
            up: false,
            down: false,
        };
        this.movements = true;
        this._movingDirection = new Vector();
        this._divideSpeedValue = 16; //GCD of 48 and 32

        //Destroying obstacles
        this._obstacleToDestroy = undefined;
        this._destoryingTimer = new Stopwatch(10);
        this._randomDestoyTimerReset = randomInteger(4000, 6000);

        //Walking animation
        this._movementAnimations = {
            left: {
                animationArray: [IMAGES.OPPONENT_LEFT1, IMAGES.OPPONENT_LEFT2],
                currentIndex: 0, counter: 0,
            },
            right: {
                animationArray: [IMAGES.OPPONENT_RIGHT1, IMAGES.OPPONENT_RIGHT2],
                currentIndex: 0, counter: 0,
            },
            up: {
                animationArray: [IMAGES.OPPONENT_UP1, IMAGES.OPPONENT_UP2],
                currentIndex: 0, counter: 0,
            },
            down: {
                animationArray: [IMAGES.OPPONENT_DOWN1, IMAGES.OPPONENT_DOWN2],
                currentIndex: 0, counter: 0,
            },
        };

        //LOOKS AT (front)
        this._lookingAt = new Vector(0, 0);

        //Dead
        this.dead = false;
        this._smashedGraphics = {
            left: IMAGES.OPPONENT_SMASHED_LEFT,
            right: IMAGES.OPPONENT_SMASHED_RIGHT,
            up: IMAGES.OPPONENT_SMASHED_UP,
            down: IMAGES.OPPONENT_SMASHED_DOWN,
        }
        this._smashedBy = undefined;
    }

    /**
     * Draws Opponent on canvas context
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (this.visible) {
            ctx.drawImage(this._image, this.position.x, this.position.y);
        }
    }

    /**
     * Updates Opponent movements
     */
    updateMovemets() {
        //Aplying movements
        if (!this.movements) {
            return undefined
        }

        if (this._isOnGrid() && (this._move.left || this._move.right || this._move.up || this._move.down)) {
            this._movingDirection.multiplyScalar(0);
            if (this._move.left) {
                this._movingDirection.x = -48;
            } else if (this._move.right) {
                this._movingDirection.x = 48;
            } else if (this._move.up) {
                this._movingDirection.y = -32;
            } else if (this._move.down) {
                this._movingDirection.y = 32;
            }
            this._movingDirection.divideScalar(this._divideSpeedValue); //GCD of 48 and 32
        } else if (this._isOnGrid() && !this._move.left && !this._move.right && !this._move.up && !this._move.down) {
            this._movingDirection.multiplyScalar(0);
        }

        let destroyed = this._destroiesObstacle();
        let canvasEdges = this._isGonnaBeOnCanvas();
        if (this.visible && destroyed === 0 && canvasEdges) {
            this.position.add(this._movingDirection);
        }
        if (this.visible && this.dead && (destroyed === 1 || destroyed === -1 || !canvasEdges)) {
            this.removeFromLEVEL_OBJECTS();
            this._smashedBy.smashedOpponent = true;
        }

        //Changing directions
        if (this.dead) {
            return undefined
        }
        if (!this._isOnGrid()) {
            return undefined
        }
        if (this.visible && destroyed === 0 && !canvasEdges) {
            this.selectRandomDirection(true);
        }
        if (destroyed === 1 && this.visible) {
            if (this._destoryingTimer.currentTime === 0) {
                this._obstacleToDestroy._destroy();
                this._destoryingTimer.start();
            }
            this.selectRandomDirection(true);
        }
        if (this._destoryingTimer.currentTime > this._randomDestoyTimerReset) {
            this._destoryingTimer.reset();
        }
        if (destroyed === -1 && this.visible) {
            this.selectRandomDirection(true);
        }
    }

    /**
     * Removes Opponent from the global LEVEL_OBJECTS.opponents
     */
    removeFromLEVEL_OBJECTS() {
        if (!this.dead) {
            return undefined;
        }

        for (let i = 0; i < LEVEL_OBJECTS.opponents.length; i++) {
            let opponent = LEVEL_OBJECTS.opponents[i];
            if (opponent.position.x == this.position.x && opponent.position.y == this.position.y) {
                LEVEL_OBJECTS.opponents.splice(i, 1);
                AMOUNT_OF_OPPONENTS--;
                USER_INTERFACE.updateAmountOfOpponents();
                break;
            }
        }
    }

    /**
     * Choose random direction for Opponent object
     * @param {boolean} free Must be free?
     */
    selectRandomDirection(free) {
        if (!this.movements) {
            return undefined
        }
        if (this.dead) {
            return undefined
        }

        let counter = 0;
        while (true) {
            counter++;

            //Stop moving in any direction
            for (let direction in this._move) {
                this._move[direction] = false;
            }

            //Selecting random direction
            let direction = randomInteger(0, 3);
            switch (direction) {
                case 0:
                    this._move.left = true;
                    break;
                case 1:
                    this._move.right = true;
                    break;
                case 2:
                    this._move.up = true;
                    break;
                case 3:
                    this._move.down = true;
                    break;
            }
            this.updateLookAtPosition();

            //Checking
            let answer = this._destroiesObstacle();
            let canvasEdges = this._isGonnaBeOnCanvas();
            if (free && answer === 0 && canvasEdges) {
                break;
            } else if (!free && (answer === 0 || answer === 1) && canvasEdges) {
                break;
            } else if (counter >= 50) {
                free = false;
            }
        }
    }

    /**
     * No matter what change the direction from time to time
     */
    changeDirectionFromTimeToTime() {
        let that = this;
        let changing = setInterval(function () {
            if (that._isOnGrid()) {
                that.selectRandomDirection(true);
            }
        }, randomInteger(100, 200))
    }

    /**
     * Checks if Opponent's position is corrent with game grid
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
     * Checks if opponet's next position gonna be on canvas based on _lookingAt
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
     * Check if Opponent can destroy Obstacle
     * @returns {Number} (1) - Obstacle destroyed, (-1) - Obstacle can't be destroyd (0) Opponent didn't destroy anything
     */
    _destroiesObstacle() {
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
                let obstacle = LEVEL_OBJECTS.obstacles[i];
                if (obstacle.canBeDestroyed()) {
                    this._obstacleToDestroy = obstacle;
                    return 1
                } else {
                    return -1
                }
            }
        }
        return 0;
    }

    /**
     * Updates Opponent's lookingAt Vector
     */
    updateLookAtPosition() {
        if (this._move.left) {
            this._lookingAt.positionSet(-1, 0);
        } else if (this._move.right) {
            this._lookingAt.positionSet(1, 0);
        } else if (this._move.up) {
            this._lookingAt.positionSet(0, -1);
        } else if (this._move.down) {
            this._lookingAt.positionSet(0, 1);
        }
    }

    /**
     * Updates Opponent image based on direction he moves
     */
    updateAnimations() {
        if (this.dead) {
            return undefined
        }
        ;

        if (this._movingDirection.x > 0) {//opponent moves right
            let index = this._movementAnimations.right.currentIndex;
            this._image = this._movementAnimations.right.animationArray[index];
            this._updateMovementAnimationIndex("right");
        } else if (this._movingDirection.x < 0) {//opponent moves left
            let index = this._movementAnimations.left.currentIndex;
            this._image = this._movementAnimations.left.animationArray[index];
            this._updateMovementAnimationIndex("left");
        } else if (this._movingDirection.y > 0) {//opponent moves down
            let index = this._movementAnimations.down.currentIndex;
            this._image = this._movementAnimations.down.animationArray[index];
            this._updateMovementAnimationIndex("down");
        } else if (this._movingDirection.y < 0) {//opponent moves up
            let index = this._movementAnimations.up.currentIndex;
            this._image = this._movementAnimations.up.animationArray[index];
            this._updateMovementAnimationIndex("up");
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
     * Checks if Opponent is pushing by moving Obstacle
     */
    checkPushWithObstacles() {
        if (!this.visible) {
            return false
        }
        if (this.dead) {
            return false
        }

        let mySquare = [
            new Vector(this.position.x, this.position.y),
            new Vector(this.position.x + 44, this.position.y),
            new Vector(this.position.x + 44, this.position.y + 30),
            new Vector(this.position.x, this.position.y + 30),
        ]

        for (let i = 0; i < LEVEL_OBJECTS.obstacles.length; i++) {
            let obPos = LEVEL_OBJECTS.obstacles[i].position.clone();
            let obSquare = [
                new Vector(obPos.x, obPos.y),
                new Vector(obPos.x + 44, obPos.y),
                new Vector(obPos.x + 44, obPos.y + 30),
                new Vector(obPos.x, obPos.y + 30),
            ];

            for (let j = 0; j < obSquare.length; j++) {
                if (isPointInPolygon(mySquare, obSquare[j])) {
                    this._smashedBy = LEVEL_OBJECTS.obstacles[i];

                    //Stop moving in any direction
                    for (let direction in this._move) {
                        this._move[direction] = false;
                    }

                    //Changing own direction
                    let direction = LEVEL_OBJECTS.obstacles[i]._movingDirection.clone();
                    let newPosition = LEVEL_OBJECTS.obstacles[i].position.clone();

                    if (direction.x > 0) {
                        newPosition.x += 48;
                        this._move.right = true;
                    } else if (direction.x < 0) {
                        newPosition.x -= 48;
                        this._move.left = true;
                    } else if (direction.y > 0) {
                        newPosition.y += 32;
                        this._move.down = true;
                    } else if (direction.y < 0) {
                        newPosition.y -= 32;
                        this._move.up = true;
                    }

                    //Image update
                    if (direction.x > 0) {
                        this._image = this._smashedGraphics.left;
                    } else if (direction.x < 0) {
                        this._image = this._smashedGraphics.right;
                    } else if (direction.y > 0) {
                        this._image = this._smashedGraphics.up;
                    } else if (direction.y < 0) {
                        this._image = this._smashedGraphics.down;
                    }

                    //Update state
                    this.position = newPosition;
                    this._movingDirection = direction;
                    this._divideSpeedValue = LEVEL_OBJECTS.obstacles[i]._divideSpeedValue;
                    this.dead = true;
                    this.updateLookAtPosition();

                    //Sound
                    SOUNDS.OPPONENT_KILLED.currentTime = 0;
                    SOUNDS.OPPONENT_KILLED.play();

                    return true
                }
            }
        }

        return false;
    }
}
