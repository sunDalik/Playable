import {ENEMY_TYPE} from "../../../enums/enums";
import {MarbleChessSpriteSheet} from "../../../loader";
import {CHESS_ALIGNMENT} from "../bosses/marble_chess";
import {ChessFigure} from "./chess_figure";
import {isEmpty, isRelativelyEmpty, tileInsideTheBossRoom} from "../../../map_checks";

export class Knight extends ChessFigure {
    constructor(tilePositionX, tilePositionY, texture = MarbleChessSpriteSheet["white_knight.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Knight";
        this.type = ENEMY_TYPE.KNIGHT;
        this.sliding = false;
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
        const allMoves = [{x: x + 2, y: y - 1},
            {x: x + 2, y: y + 1},
            {x: x - 2, y: y - 1},
            {x: x - 2, y: y + 1},
            {x: x - 1, y: y - 2},
            {x: x + 1, y: y - 2},
            {x: x - 1, y: y + 2},
            {x: x + 1, y: y + 2}];
        for (const move of allMoves) {
            if (isRelativelyEmpty(move.x, move.y) && tileInsideTheBossRoom(move.x, move.y)) {
                moves.push(move);
            }
        }
        return moves;
    }
}