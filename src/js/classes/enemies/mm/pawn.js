import {ENEMY_TYPE} from "../../../enums/enums";
import {MarbleChessSpriteSheet} from "../../../loader";
import {CHESS_ALIGNMENT} from "../bosses/marble_chess";
import {ChessFigure} from "./chess_figure";

export class Pawn extends ChessFigure {
    constructor(tilePositionX, tilePositionY, texture = MarbleChessSpriteSheet["white_pawn.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Pawn";
        this.type = ENEMY_TYPE.PAWN;
        this.atk = 1;
        this.direction = {x: 1, y: 0};
    }

    setUpChessFigure(alignment, direction) {
        if (alignment === CHESS_ALIGNMENT.WHITE) {
            this.texture = MarbleChessSpriteSheet["white_pawn.png"];
        } else {
            this.texture = MarbleChessSpriteSheet["black_pawn.png"];
        }
        this.direction = direction;
    }
}