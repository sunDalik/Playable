import {ENEMY_TYPE} from "../../../enums/enums";
import {MarbleChessSpriteSheet} from "../../../loader";
import {CHESS_ALIGNMENT} from "../bosses/marble_chess";
import {ChessFigure} from "./chess_figure";
import {getPlayerOnTile, isEmpty} from "../../../map_checks";

export class Pawn extends ChessFigure {
    constructor(tilePositionX, tilePositionY, texture = MarbleChessSpriteSheet["white_pawn.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Pawn";
        this.type = ENEMY_TYPE.PAWN;
        this.atk = 1;
        this.direction = {x: 1, y: 0};
        this.initialPos = {x: tilePositionX, y: tilePositionY};
    }

    setUpChessFigure(alignment, direction) {
        if (alignment === CHESS_ALIGNMENT.WHITE) {
            this.texture = MarbleChessSpriteSheet["white_pawn.png"];
        } else {
            this.texture = MarbleChessSpriteSheet["black_pawn.png"];
        }
        this.direction = direction;
    }

    getMoves(x, y) {
        const moves = [];
        if (isEmpty(x + this.direction.x, y + this.direction.y)) {
            moves.push({x: x + this.direction.x, y: y + this.direction.y});

            if (x === this.initialPos.x && y === this.initialPos.y
                && isEmpty(x + this.direction.x * 2, y + this.direction.y * 2)) {
                moves.push({x: x + this.direction.x * 2, y: y + this.direction.y * 2});
            }
        }

        const killerTiles = [{x: x + this.direction.x - this.direction.y, y: y + this.direction.y - this.direction.x},
            {x: x + this.direction.x + this.direction.y, y: y + this.direction.y + this.direction.x}];
        for (const killerTile of killerTiles) {
            if (getPlayerOnTile(killerTile.x, killerTile.y) !== null) {
                moves.push(killerTile);
            }
        }
        return moves;
    }
}