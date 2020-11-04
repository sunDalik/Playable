import {ENEMY_TYPE} from "../../../enums/enums";
import {MarbleChessSpriteSheet} from "../../../loader";
import {CHESS_ALIGNMENT} from "../bosses/marble_chess";
import {ChessFigure} from "./chess_figure";

export class Knight extends ChessFigure {
    constructor(tilePositionX, tilePositionY, texture = MarbleChessSpriteSheet["white_knight.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Knight";
        this.type = ENEMY_TYPE.KNIGHT;
    }

    setUpChessFigure(alignment) {
        if (alignment === CHESS_ALIGNMENT.WHITE) {
            this.texture = MarbleChessSpriteSheet["white_knight.png"];
        } else {
            this.texture = MarbleChessSpriteSheet["black_knight.png"];
        }
    }

    getMoves(x, y) {
        const moves = [];

        return moves;
    }
}