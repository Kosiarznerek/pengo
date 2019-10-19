class UserIntercase {
    /**
     * Creates a Grafics User Interface
     */
    constructor() {
        this.playerLifes = [];
        this.amountOfOpponents = [];
        this.load();
    }

    /**
     * Updates player's lifes based on global LEVEL_OBJECT.player.lifes
     */
    updatePlayerLifes() {
        for (let i = 0; i < this.playerLifes.length; i++) {
            let div = this.playerLifes[i];
            div.style.display = "none";
        }

        for (let i = 0; i < LEVEL_OBJECTS.player.lifes; i++) {
            let div = this.playerLifes[i];
            div.style.display = "inline-block";
        }
    }

    /**
     * Updates amount of opponents based on global AMOUNT_OF_OPPONENTS
     */
    updateAmountOfOpponents() {
        for (let i = 0; i < this.amountOfOpponents.length; i++) {
            let div = this.amountOfOpponents[i];
            div.style.display = "none";
        }

        for (let i = 0; i < AMOUNT_OF_OPPONENTS; i++) {
            let div = this.amountOfOpponents[i];
            div.style.display = "inline-block";
        }
    }

    /**
     * Starts the game
     * @param {CanvasRenderingContext2D} ctx
     */
    startGame(ctx) {
        if (GAME_STARTED) {
            return undefined
        }
        createLevelObjects(CURRENT_LEVEL);
        document.getElementById("main").style.display = "none";
        GAME_STARTED = true;
        this.load();
        setInterval(function () {
            animation(ctx)
        }, 1000 / 30);
    }

    /**
     * Loads divs
     */
    load() {
        //Clear
        document.getElementById("playerLifes").innerHTML = "";
        document.getElementById("amountOfOppenents").innerHTML = "";

        try {
            //Creating divs
            for (let i = 0; i < LEVEL_OBJECTS.player.lifes; i++) {
                let div = document.createElement("div");
                this.playerLifes.push(div);
                document.getElementById("playerLifes").appendChild(div);
            }
            for (let i = 0; i < AMOUNT_OF_OPPONENTS; i++) {
                let div = document.createElement("div");
                this.amountOfOpponents.push(div);
                document.getElementById("amountOfOppenents").appendChild(div);
            }

            //Updating data
            this.updateAmountOfOpponents();
            this.updatePlayerLifes();
        } catch (e) {
        }
    }
}
