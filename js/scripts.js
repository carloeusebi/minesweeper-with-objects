import { Cell } from './Cell.js';
import { Mine } from './Mine.js';

// DOM Elements
const field = document.getElementById('field');
const difficultyInput = document.getElementById('difficulty');
const highScoreOutput = document.getElementById('high-score');
const currentScoreOutput = document.getElementById('current-score');
const playButton = document.getElementById('play-button');
const smile = playButton.querySelector('img')
const winText = document.getElementById('win-text');

const numberOfMines = 16;
const smilePlay = 'img/smile.png';
const gameOverSmile = 'img/gameover.png';

let numberOfCells;
let cellsMatrix = [];
let currentScore = 0;
let highScore = 0;
let winningScore = 0;

/*********************************************** */
/*** FUNCTIONS ********************************* */
/*********************************************** */


/**
 * Handles the gameover procedure
 * @param {Cell} thisCell the clicked cell
 * @param {boolean} win normally false, if true triggers behaveiours of player victory
 */
export const gameOver = (losingCell, win = false) => {

    if (win) winText.classList.remove('hidden');
    else {
        losingCell.explode();
        smile.src = gameOverSmile;
    }

    // checks if the current game score is new high score
    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreOutput.innerText = currentScore;
    }

    for (let row of cellsMatrix) {
        for (let cell of row) {
            cell.freeze();
            cell.showMine();
        }
    }
}

/**
 * get the number of nearby mines when a cell is clicked
 * @param {Cell} cell the cell that wants to count the nearby mines
 * @param {array} mines nearby
 */
export const getNearbyMines = (cell, mines) => {

    /**
     * it returns the valid neighbours of a cell, if a cell is on the edge of the field
     * @param {Cell} cell the cell which we want to know the valid neighbours
     * @returns {array} an array containing the valid neighbour nodes
     */
    const getValidNeighbours = cell => {

        const { x, y } = cell;
        const validNeighbours = [];

        // checks if cell is not on the edge of the matrix
        const isValidIndex = (x, y) =>
            x >= 0 && x < cellsMatrix.length && y >= 0 && y < cellsMatrix[0].length;

        // add the cell to the valid neighbours only if it passes the check
        const addValidNeighbour = (x, y) => {
            if (isValidIndex(x, y)) {
                validNeighbours.push(cellsMatrix[x][y]);
            }
        };

        // Check left
        addValidNeighbour(x - 1, y);
        addValidNeighbour(x - 1, y - 1);
        addValidNeighbour(x - 1, y + 1);

        // Check right
        addValidNeighbour(x + 1, y + 1);
        addValidNeighbour(x + 1, y);
        addValidNeighbour(x + 1, y - 1);

        // Check top and bottom
        addValidNeighbour(x, y - 1);
        addValidNeighbour(x, y + 1);

        return validNeighbours;
    }

    const validNeighbours = getValidNeighbours(cell);

    let nearbyMines = 0;

    // counts neaerby mines
    for (let neighbour of validNeighbours) {
        if (neighbour.isMine()) nearbyMines++;
    }

    // if there are nearby mines it writes the number of nearby mines on the cell; if there are not nearby mines it clicks neighbours and checks if they have nearby mines
    if (nearbyMines) {
        cell.writeNumber(nearbyMines);
    } else {
        for (let neighbour of validNeighbours) {
            if (!neighbour.isClicked()) {
                neighbour.click();
                getNearbyMines(neighbour, mines);
            }
        }
    }
    currentScore++;

}

export const updateScore = () => {
    currentScoreOutput.innerText = currentScore;
}

export const hasWon = () => currentScore === winningScore;

// LOGIC ------------------------------------------ //

function startGame() {
    /**
  * Returns the number of cells when inputed the result of the difficulty setting
  * @param {string} difficulty the difficulty setting inputted by the user
  * @returns {number} the number of cells
  */
    const getNumberOfCells = difficulty => {
        switch (difficulty) {
            case 'easy':
                return 100;
            case 'hard':
                return 49;
            default:
                return 81;
        }
    }

    /**
    * Creates and renders the minefield, given the element where to print them and the number of cells to print
    * @param {node} field the place where the nodes will be placed
    * @param {number} numberOfCells the number of cells (based on difficulty) the field will have
    * @param {string} difficulty the difficulty leve, it is used to give the field a class to render cells size based on how many there are
    */
    const renderField = (field, numberOfCells, difficulty) => {
        /**
         * Create a new cell element. The required number is the position where the cell will be placed in the field
         * @param {number} position the position in the field where the cell wil be located, it is needed to derminate if it will contain the bomb
         * @returns {Node}
         *  */
        const createCell = (x, y) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            const cell = new Cell(cellElement, x, y);
            return cell;
        }

        const rows = Math.sqrt(numberOfCells);
        const cols = rows;
        let matrix = [];

        for (let i = 0; i < rows; i++) {
            matrix[i] = []
            for (let j = 0; j < cols; j++) {
                const cell = createCell(i, j);
                field.appendChild(cell.node)
                matrix[i][j] = cell;
            }
        }


        //class assegnation decides how big the cells are
        field.className = difficulty;

        return matrix;
    }

    /**
* Generates 16 mines at random positions, and return an array containing the positions
* @param {number} numeberOfCells the number of cells, mines should not be placed in non existing cells
* @param {number} numberOfMines the total number of mines to generate
* @returns {[array]}
*/
    const generateMines = (numberOfCells, numberOfMines) => {

        const getRndNumber = max => Math.floor(Math.random() * max);
        const mines = [];
        const max = Math.sqrt(numberOfCells);

        while (mines.length < numberOfMines) {
            const x = getRndNumber(max);
            const y = getRndNumber(max);
            const mine = new Mine(x, y);
            if (mine.isNewMine(mines)) mines.push(mine);
        }

        // I pass the mines array to every cell, this way every cell is able to make checks on its own without external parameters being passed every time.
        for (let row of cellsMatrix) {
            for (let cell of row) {
                cell.minesArray = mines;
            }
        }

        return mines;
    }



    // FIELD RESET
    field.innerHTML = ``;
    currentScoreOutput.innerText = currentScore = 0;
    smile.src = smilePlay;
    winText.classList.add('hidden');

    // there is no need to validate difficulty input, the app can handles different values from expected ones and it will default to a medium difficulty
    const difficulty = difficultyInput.value;

    // from difficulty calculates the number of cell to render and the winning score
    numberOfCells = getNumberOfCells(difficulty);
    winningScore = numberOfCells - numberOfMines;

    // renders the field and creates the matrix with all the cells
    cellsMatrix = renderField(field, numberOfCells, difficulty);

    // generates the mines and saves an array with all the mines in every cell object
    generateMines(numberOfCells, numberOfMines);
}


/*********************************************** */
/*** MAIN ************************************** */
/*********************************************** */


playButton.addEventListener('click', startGame);

difficultyInput.addEventListener('change', startGame);
