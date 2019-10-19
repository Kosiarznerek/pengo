class Obstacle {
    /**
     * Creates Obstacle object
     * @param {Vector} position Position on canvas
     * @param {String} className ICE_BLOCK or DIAMOND_BLOCK
     */
    constructor(position, className) {
        this.position = position;
        this.className = className;

        this._image = undefined;
        switch (this.className) {
            case "ICE_BLOCK":
                this._image = IMAGES.ICE_BLOCK;
                break;
            case "DIAMOND_BLOCK":
                this._image = IMAGES.DIAMOND_BLOCK;
                break;
            default:
                console.error("Obstacle class unrecognized " + this.className);
                break;
        }

        //Pushing
        this._movingDirection = new Vector();
        this.moving = {
            left: false,
            right: false,
            up: false,
            down: false,
        }
        this._divideSpeedValue = 8;

        //Destroing
        this._destroyed = false;
        this.shoudBeRemoved = false;
        this._destroyAnimation = {
            animationArray:
                [IMAGES.OBSTACLE_DESTROY1, IMAGES.OBSTACLE_DESTROY2, IMAGES.OBSTACLE_DESTROY3,
                    IMAGES.OBSTACLE_DESTROY4, IMAGES.OBSTACLE_DESTROY5, IMAGES.OBSTACLE_DESTROY6,
                    IMAGES.OBSTACLE_DESTROY7, IMAGES.OBSTACLE_DESTROY8, IMAGES.OBSTACLE_DESTROY9
                ],
            indexCounter: 0,
            counter: 0,
        };

        //Flickering
        this.flickering = {
            start: false,
            stop: false,
        };
        this._flickeringAnimation = {
            animationArray: [IMAGES.ICE_BLOCK, IMAGES.ORANGE_BLOCK],
            indexCounter: 0,
            counter: 0,
        }

        //Smashed opponent
        this.smashedOpponent = false;
    }

    /**
     * Draws object on canvas context
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        this._updateImage();
        ctx.drawImage(this._image, this.position.x, this.position.y);
    }

    /**
     * Updates Obstacle image
     */
    _updateImage() {
        if (this._destroyed) {//When Obstacle is destroyed -> playing animation
            //Updating current frame
            let currentIndex = this._destroyAnimation.indexCounter;
            this._image = this._destroyAnimation.animationArray[currentIndex];

            //Updating counter and index
            this._destroyAnimation.counter++;
            if (this._destroyAnimation.counter % 2 == 0) {//Next frame
                this._destroyAnimation.indexCounter++;
                if (this._destroyAnimation.indexCounter == this._destroyAnimation.animationArray.length) {//The end of animation
                    this.shoudBeRemoved = true;
                }
            }
        } else if (this.flickering.start === true && this.flickering.stop === false) {//Flickering
            //Updating current frame
            let currentIndex = this._flickeringAnimation.indexCounter;
            this._image = this._flickeringAnimation.animationArray[currentIndex];

            //Updating counter and index
            this._flickeringAnimation.counter++;
            if (this._flickeringAnimation.counter % 10 == 0) {//Next frame
                this._flickeringAnimation.indexCounter++;
                if (this._flickeringAnimation.indexCounter == this._flickeringAnimation.animationArray.length) {//The end of animation
                    this._flickeringAnimation.indexCounter = 0;
                }
            }

            //Counter protection
            if (this._flickeringAnimation.counter + 1 >= Number.MAX_SAFE_INTEGER) {
                this._flickeringAnimation.counter = 0;
            }
        } else if (this.flickering.start === true && this.flickering.stop === true) {//Someone want's to stop flickering
            //Setting default image
            switch (this.className) {
                case "ICE_BLOCK":
                    this._image = IMAGES.ICE_BLOCK;
                    break;
                case "DIAMOND_BLOCK":
                    this._image = IMAGES.DIAMOND_BLOCK;
                    break;
            }

            //Settings reset
            this.flickering.start = false;
            this.flickering.stop = false;
        } else if (this.smashedOpponent) {//When obstacle smashed Opponent -> image gonna change for a moment
            this.smashedOpponent = false;
            let that = this;
            setTimeout(function () {
                switch (that.className) {//Changing image
                    case "ICE_BLOCK":
                        that._image = IMAGES.ICE_BLOCK2;
                        break;
                    case "DIAMOND_BLOCK":
                        that._image = IMAGES.DIAMOND_BLOCK2;
                        break;
                }
                setTimeout(function () {//Restoring defaut images
                    switch (that.className) {
                        case "ICE_BLOCK":
                            that._image = IMAGES.ICE_BLOCK;
                            break;
                        case "DIAMOND_BLOCK":
                            that._image = IMAGES.DIAMOND_BLOCK;
                            break;
                    }
                }, 1000)
            }, 200)
        } else {
            return true;
        }
    }

    /**
     * When player push the wall
     * @param {Vector} direction
     */
    push(direction) {
        //Pushing
        if (direction.x > 0) {
            this.moving.right = true;
        } else if (direction.x < 0) {
            this.moving.left = true;
        } else if (direction.y > 0) {
            this.moving.down = true;
        } else if (direction.y < 0) {
            this.moving.up = true;
        }

        //Sounds
        if (this._canBePushed()) {
            SOUNDS.PUSH_ICE_BLOCK.currentTime = 0;
            SOUNDS.PUSH_ICE_BLOCK.play();
        } else if (!this._canBePushed()) {
            SOUNDS.ICE_BLOCK_DESTROYED.currentTime = 0;
            SOUNDS.ICE_BLOCK_DESTROYED.play();
        }

        //Destroying
        if (!this._canBePushed()) {
            this._destroy();
        }
    }

    /**
     * Destroies Obstacle object when it can't be pushed, but not if it's DIAMOND_BLOCK
     * @returns {boolean} True when it can be destroyed
     */
    _destroy() {
        if (this._destroyed || this.className == "DIAMOND_BLOCK") {
            return false;
        } else {
            this._destroyed = true;
            return true;
        }
    }

    /**
     * Checks if obstacle can be destroy
     * @returns {boolean}
     */
    canBeDestroyed() {
        if (this._destroyed || this.className == "DIAMOND_BLOCK") {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Removes Obstacle from the global LEVEL_OBJECTS.obstacles
     */
    removeFromLEVEL_OBJECTS() {
        if (!this.shoudBeRemoved) {
            return undefined;
        }

        for (let i = 0; i < LEVEL_OBJECTS.obstacles.length; i++) {
            let obstacle = LEVEL_OBJECTS.obstacles[i];
            if (obstacle.position.x == this.position.x && obstacle.position.y == this.position.y) {
                LEVEL_OBJECTS.obstacles.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Updates Obstacle position
     */
    updatePosition() {
        if (this._isOnGrid() && (this.moving.left || this.moving.right || this.moving.up || this.moving.down)) {
            this._movingDirection.multiplyScalar(0);
            if (this.moving.left) {
                this._movingDirection.x = -48;
            } else if (this.moving.right) {
                this._movingDirection.x = 48;
            } else if (this.moving.up) {
                this._movingDirection.y = -32;
            } else if (this.moving.down) {
                this._movingDirection.y = 32;
            }
            this._movingDirection.divideScalar(this._divideSpeedValue); //GCD of 48 and 32
        } else if (this._isOnGrid() && !this.moving.left && !this.moving.right && !this.moving.up && !this.moving.down) {
            this._movingDirection.multiplyScalar(0);
        }

        if (this._canBePushed()) {
            this.position.add(this._movingDirection);
        } else {
            for (let direction in this.moving) {
                this.moving[direction] = false;
            }
        }
    }

    /**
     * Checkig if there is a free space where player wants to push the wall
     */
    _canBePushed() {
        let positionWhichShouldBeFree = this.position.clone();
        if (this.moving.right) {
            positionWhichShouldBeFree.x += 48;
        } else if (this.moving.left) {
            positionWhichShouldBeFree.x -= 48;
        } else if (this.moving.down) {
            positionWhichShouldBeFree.y += 32;
        } else if (this.moving.up) {
            positionWhichShouldBeFree.y -= 32;
        }

        //Checking game edges
        if (positionWhichShouldBeFree.x < -43 || positionWhichShouldBeFree.x > 578) {
            return false
        }
        if (positionWhichShouldBeFree.y < -28 || positionWhichShouldBeFree.y > 320) {
            return false
        }

        for (let i = 0; i < LEVEL_OBJECTS.obstacles.length; i++) {
            let obstaclePosition = LEVEL_OBJECTS.obstacles[i].position;
            if (obstaclePosition.x == positionWhichShouldBeFree.x && obstaclePosition.y == positionWhichShouldBeFree.y) {
                return false;
            }

        }

        return true;
    }

    /**
     * Checks if Obstacle's position is corrent with game grid
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
}
