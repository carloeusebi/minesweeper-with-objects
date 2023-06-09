export class Mine {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isNewMine(minesArray) {
        for (let mine of minesArray) {
            if (mine.x === this.x && mine.y === this.y) return false;
        }
        return true;
    }
}