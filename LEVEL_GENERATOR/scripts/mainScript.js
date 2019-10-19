//ONLOAD
window.onload = function () {
    main();
}

//GLOBAL VARIABLES
let GAME_MAP = create2DArray(10, 12, "NONE");
let SELECTED_ITEM = undefined;
let ITEMS_IMAGES = {
    DIAMOND_BLOCK: "graphics/diamondBlock.png",
    ICE_BLOCK: "graphics/iceBlock.png",
    PENGO: "graphics/pengo.png",
    NONE: "graphics/none.png",
}

/**
 * Function called after the whole page has been loaded
 */
function main() {
    createGrid();

    //Items list on click
    document.getElementById("itemsList").childrenOnClick(function (item) {
        //unselection all
        let items = document.getElementById("itemsList").children;
        for (let i = 0; i < items.length; i++) {
            items[i].style.backgroundColor = "rgb(255,255,255)";
        }

        //selecting selected one
        selectItemFromList(item);
    })

    //Loading data from given JSON
    document.getElementById("loadFromJSON").onclick = function () {
        loadFromJSON();
    }

}

/**
 * Function creates grid in HTML DOM Element with id="gameMap"
 * @returns {void}
 */
function createGrid() {
    let container = document.getElementById("gameMap");

    for (let row = 0; row < GAME_MAP.length; row++) {
        for (let coll = 0; coll < GAME_MAP[row].length; coll++) {
            let cell = document.createElement("div");
            //position
            cell.style.left = (coll * (44 + 4)) + 4 + "px";
            cell.style.top = (row * (30 + 2)) + 2 + "px";

            //atributes
            cell.setAttribute("row", row);
            cell.setAttribute("coll", coll);

            //id
            cell.id = "cell" + row + ";" + coll;

            //onclick event
            cell.onclick = function () {
                cellOnClick(this);
            }
            container.appendChild(cell);
        }
    }
}

/**
 * Function executes when cell gonna be clicked
 * @param {HTMLElement} clickedCell
 */
function cellOnClick(clickedCell) {
    //validation
    if (!SELECTED_ITEM) {
        alert("Select an item first");
        return undefined;
    }

    //saving data
    let row = clickedCell.getAttribute("row");
    let coll = clickedCell.getAttribute("coll");
    let item = undefined;
    if (SELECTED_ITEM != "NONE") {
        item = {
            itemName: SELECTED_ITEM,
            gridPosition: {
                row: row,
                coll: coll,
            },
            position: new Vector((coll * (44 + 4)) + 4, (row * (30 + 2)) + 2),
        }
    }

    GAME_MAP[row][coll] = item || "NONE";

    //applying image
    clickedCell.style.backgroundImage = "url(" + ITEMS_IMAGES[SELECTED_ITEM] + ")"

    //generating JSON
    genarateJSON();
}

/**
 * Function generates JSON string based on global GAME_MAP variable and shows it in the HTML DOM Element with id="JSONdata"
 * after cellOnClick()
 */
function genarateJSON() {
    let string = JSON.stringify(GAME_MAP, undefined, 3);
    document.getElementById("JSONdata").value = string;
}

/**
 * Function selects element from items list and saves it to the global variable SELECTED_ITEM
 * @param {HTMLElement} clickedItem
 */
function selectItemFromList(clickedItem) {
    let itemName = clickedItem.getAttribute("itemName");
    SELECTED_ITEM = itemName;
    clickedItem.style.backgroundColor = "rgba(255,0,0,0.5)";
}

/**
 * Loads data from JSON
 */
function loadFromJSON() {
    //parsing data
    let JSONString = document.getElementById("JSONdata").value;
    let gameMap = undefined;
    try {
        gameMap = JSON.parse(JSONString);
    } catch (e) {
        console.error(e);
        return undefined;
    }

    for (let row = 0; row < gameMap.length; row++) {
        for (let coll = 0; coll < gameMap[row].length; coll++) {
            let item = gameMap[row][coll];
            if (item != "NONE") {
                let cell = document.getElementById("cell" + item.gridPosition.row + ";" + item.gridPosition.coll);
                cell.style.backgroundImage = "url(" + ITEMS_IMAGES[item.itemName] + ")";
            }
        }
    }

    GAME_MAP = gameMap;
}
