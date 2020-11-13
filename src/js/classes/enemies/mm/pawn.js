import {ENEMY_TYPE} from "../../../enums/enums";
import {MarbleChessSpriteSheet} from "../../../loader";
import {ChessFigure} from "./chess_figure";
import {getPlayerOnTile, isEmpty} from "../../../map_checks";

// needs direction to be set up
export class Pawn extends ChessFigure {
    constructor(tilePositionX, tilePositionY, texture = MarbleChessSpriteSheet["white_pawn.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Pawn";
        this.type = ENEMY_TYPE.PAWN;
        this.direction = {x: 1, y: 0};
        this.initialPos = {x: tilePositionX, y: tilePositionY};
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