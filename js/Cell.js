import { gameOver, getNearbyMines, updateScore, hasWon } from "./scripts.js";

export class Cell {

    constructor(node, x, y) {
        this.node = node;
        this.x = x;
        this.y = y;

        this.node.addEventListener('click', this.onClick);

        this.node.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.toggleFlag();
        });
    }

    onClick = () => {

        if (this.isMine()) {
            gameOver(this);
        }

        if (!this.isClicked()) {
            this.click();
            getNearbyMines(this, this.minesArray);
            updateScore();
        }

        if (hasWon()) {
            const win = true;
            gameOver(this, win);
        }
    }

    toggleFlag = () => {

        if (this.node.hasAttribute('data-flag')) {
            const img = this.node.querySelector('img');
            this.node.removeChild(img);
            this.node.removeAttribute('data-flag');
        } else if (!this.isClicked()) {
            this.node.innerHTML = `<img src="img/flag.png" class="flag" alt="flag">`;
            this.node.setAttribute('data-flag', '');
        }
    }

    isMine() {
        if (this.minesArray) {
            for (let mine of this.minesArray) {
                if (this.x === mine.x && this.y === mine.y) return true
            }
        }
    }

    freeze() {
        this.node.removeEventListener('click', this.onClick);
    }

    explode() {
        this.node.classList.add('exploded');
    }

    showMine() {
        if (this.isMine()) {
            this.node.innerHTML = `<img src="img/mine.png" alt="mine">`;
            this.node.classList.add('clicked');
        }
    }

    isClicked() {
        return this.node.classList.contains('clicked');
    }

    click() {
        this.node.classList.add('clicked');
    }

    writeNumber(number) {
        /**
 * Given the number of nearby mines it return the css class name to color the number
 * @param {number} number the number of nearby mines
 * @returns {string} the nameo of the css class to color the cell
 */
        const getColor = number => {
            switch (number) {
                case 1:
                    return 'blue';
                case 2:
                    return 'green';
                case 3:
                    return 'red';
                case 4:
                    return 'darkblue';
                case 5:
                    return 'darkred';
                case 6:
                    return 'aqua';
                case 7:
                    return 'black';
                case 8:
                    return 'gray';
            }
        }

        this.node.innerText = number;
        const color = getColor(number);
        this.node.classList.add(color);
    }
}