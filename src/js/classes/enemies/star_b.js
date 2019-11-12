import {Game} from "../../game"
import {Star} from "./star"
import {ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile} from "../../mapChecks";

export class StarB extends Star {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/star_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.type = ENEMY_TYPE.STAR_B;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                if (this.canSeePlayers()) {
                    loop: for (let x = -3; x <= 3; x++) {
                        for (let y = -3; y <= 3; y++) {
                            if (!(Math.abs(x) === 3 || Math.abs(y) === 3) || (Math.abs(y) === 2 && Math.abs(x) === 3) || (Math.abs(x) === 2 && Math.abs(y) === 3)) {
                                if (getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y + y)) {
                                    this.triggered = true;
                                    break loop;
                                }
                            }
                        }
                    }
                }
                if (this.triggered) this.shake(1, 0);
            }
        } else this.turnDelay--;
    }

    attack() {
        this.triggered = false;
        this.attackTileAtOffset(-2, -2);
        this.attackTileAtOffset(-1, -1);
        this.attackTileAtOffset(2, 2);
        this.attackTileAtOffset(1, 1);
        this.attackTileAtOffset(-2, 2);
        this.attackTileAtOffset(-1, 1);
        this.attackTileAtOffset(2, -2);
        this.attackTileAtOffset(1, -1);
        this.attackTileAtOffset(0, 1);
        this.attackTileAtOffset(1, 0);
        this.attackTileAtOffset(0, -1);
        this.attackTileAtOffset(-1, 0);
        this.turnDelay = 1;
    }
}