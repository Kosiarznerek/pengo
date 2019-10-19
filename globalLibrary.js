/**
 * Function creates a two dementional Array with specyfied size and fill
 * @param {Number} row Number of rows
 * @param {Number} coll Number of collumns
 * @param {any} fillVariable Array gonna be field with specyfied argument
 */
function create2DArray(row, coll, fillVariable = 0) {
    if (!Number.isInteger(row) || !Number.isInteger(coll)) {
        console.error("Row and collumn must be intiger");
        return undefined;
    }

    let arr = new Array(row);
    for (let i = 0; i < arr.length; i++) {
        let arr2 = new Array(coll);
        arr2.fill(fillVariable);
        arr[i] = arr2;
    }
    return arr;
}

/**
 * Adding on click event based on parent element
 */
HTMLElement.prototype.childrenOnClick = function (fnc) {
    let children = this.children;

    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        child.onclick = function () {
            fnc(this);
        }
    }
}

class Vector {
    /**
     * Creates a Vector object
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Set's Vector's position
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    positionSet(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Copies parameters from given Vector
     * @param {Vector} vec
     */
    copy(vec) {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
    }

    /**
     * Clones Vector
     * @returns {Vector}
     */
    clone() {
        return new Vector(this.x, this.y, this.z);
    }

    /**
     * Calculates vector lenght
     * @returns {Number} Vector's length
     */
    length() {
        return Math.hypot(this.x, this.y, this.z);
    }

    /**
     * Set's the length of Vector to 1
     */
    normalize() {
        let length = Math.hypot(this.x, this.y, this.z);
        this.x /= length;
        this.y /= length;
        this.z /= length;
    }

    /**
     * Divides each Vector's component by given value
     * @param {Number} value
     */
    divideScalar(value) {
        this.x /= value;
        this.y /= value;
        this.z /= value;
    }

    /**
     * Multiplies each Vector's component by given value
     * @param {Number} value
     */
    multiplyScalar(value) {
        this.x *= value;
        this.y *= value;
        this.z *= value;
    }

    /**
     * Adds to Vector other Vector
     * @param {Vector} vect
     */
    add(vect) {
        this.x += vect.x;
        this.y += vect.y;
        this.z += vect.z;
    }

    /**
     * Substracts from Vector other Vector
     * @param {Vector} vect
     */
    substract(vect) {
        this.x -= vect.x;
        this.y -= vect.y;
        this.z -= vect.z;
    }
}

/**
 * Function creates image objects based on path in object's keys
 * @param {Object} imagesToLoad
 * @param {String} imagesToLoad.src Path to image must be string but key is any
 * @param {Function} callBack Callback fuction will be execute after preloading all images
 */
function preloadImages(imagesToLoad, callBack) {

    let amountOfImagesToLoad = Object.keys(imagesToLoad).length;
    let currentlyLoaded = 0;

    for (let imgKey in imagesToLoad) {
        (function (imgKey) {
            let image = new Image();
            image.onload = function () {
                currentlyLoaded++;
                imagesToLoad[imgKey] = image;
                if (currentlyLoaded == amountOfImagesToLoad) {
                    if (typeof callBack == "function") {
                        try {
                            callBack()
                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        console.error("Callback must be function");
                    }
                }
            }
            image.src = imagesToLoad[imgKey];
        }(imgKey))
    }

}

/**
 * To make an object constant, recursively freezes each property which is of type object
 * @param {Object} obj Object to freeze
 */
function deepFreeze(obj) {
    if (typeof obj != "object") {
        console.error("You can only freeze objects");
        return undefined;
    }
    var propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(function (name) {
        var prop = obj[name];
        if (typeof prop == 'object' && prop !== null)
            deepFreeze(prop);
    });
    return Object.freeze(obj);
}


/**
 * Function clones object by JSON method
 * @param {Object|Array} obj Object to clone
 * @returns {Object|Array} Object's clone
 */
function cloneByStringify(obj) {
    let clone = JSON.stringify(obj);
    clone = JSON.parse(clone);
    return clone;
}

/**
 * Function maps value from old range to new one
 * @param {any} value Value to map
 * @param {any} in_min Input starting range
 * @param {any} in_max Input ending rage
 * @param {any} out_min Output starting range
 * @param {any} out_max Output ending range
 * @returns {Number} Value mapped to new range
 */
function mapValue(value, in_min, in_max, out_min, out_max) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * Function generates random integer number from range
 * @param {Number} min Range's begin (included)
 * @param {Number} max Range's end (included)
 * @returns {Number}
 */
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Function generates random floating point number from given range
 * @param {Number} min Range's begin
 * @param {Number} max Range's end
 * @returns {Number}
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

class Stopwatch {
    /**
     * Creates a Stopwatch object
     * @param {Number} accuracy Refreshes currentTime variable after some time in miliseconds
     */
    constructor(accuracy) {
        this.currentTime = 0;
        this.accuracy = accuracy || 1000;

        this._timeInterval = undefined;
    }

    /**
     * Starts the stopwatch
     */
    start() {
        let that = this;
        if (this._timeInterval) {
            clearInterval(this._timeInterval);
            this._timeInterval = undefined;
        }
        this._timeInterval = setInterval(function () {
            that.currentTime += that.accuracy;
        }, this.accuracy)
    }

    /**
     * Pauses the stopwatch
     */
    pause() {
        clearInterval(this._timeInterval);
        this._timeInterval = undefined;
    }

    /**
     * Resets the stopwatch
     */
    reset() {
        this.pause();
        this.currentTime = 0;
    }
}

/**
 * Checks if point belongs to polygon
 * @param {Array} poly Array of cords objects
 * @param {Object} pt Object with x and y keys
 */
function isPointInPolygon(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}
