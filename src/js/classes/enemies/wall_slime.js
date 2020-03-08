import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, PANE} from "../../enums";
import {randomChoice} from "../../utils/random_utils";
import {isEmpty} from "../../map_checks";

export class WallSlime extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/wall_slime.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.WALL_SLIME;
        this.atk = 1;
        this.pane = randomChoice([PANE.VERTICAL, PANE.HORIZONTAL]);
        this.turnDelay = 5;
        this.currentTurnDelay = this.turnDelay;
        this.spawnAttempt = false;
        this.baseSlime = null;
        this.subSlimes = [];
    }

    afterMapGen() {
        if (this.pane === PANE.VERTICAL) {
            if (isEmpty(this.tilePosition.x, this.tilePosition.y - 1)
                && isEmpty(this.tilePosition.x, this.tilePosition.y - 2)
                && isEmpty(this.tilePosition.x, this.tilePosition.y + 1)
                && isEmpty(this.tilePosition.x, this.tilePosition.y + 2)) {
                const subSlimes = [new WallSlime(this.tilePosition.x, this.tilePosition.y - 1),
                    new WallSlime(this.tilePosition.x, this.tilePosition.y - 2),
                    new WallSlime(this.tilePosition.x, this.tilePosition.y + 1),
                    new WallSlime(this.tilePosition.x, this.tilePosition.y + 2)];
                this.subSlimes = subSlimes;
                for (const slime of subSlimes) {
                    slime.baseSlime = this;
                    slime.pane = this.pane;
                    Game.world.addChild(slime);
                    Game.enemies.push(slime);
                    slime.placeOnMap()
                }
            } else {
                if (this.spawnAttempt) {
                    return;
                }
                this.pane = PANE.HORIZONTAL;
                this.spawnAttempt = true;
                this.afterMapGen();
            }
        } else if (this.pane === PANE.HORIZONTAL) {
            if (isEmpty(this.tilePosition.x - 1, this.tilePosition.y)
                && isEmpty(this.tilePosition.x - 2, this.tilePosition.y)
                && isEmpty(this.tilePosition.x + 1, this.tilePosition.y)
                && isEmpty(this.tilePosition.x + 2, this.tilePosition.y)) {
                const subSlimes = [new WallSlime(this.tilePosition.x - 1, this.tilePosition.y),
                    new WallSlime(this.tilePosition.x - 2, this.tilePosition.y),
                    new WallSlime(this.tilePosition.x + 1, this.tilePosition.y),
                    new WallSlime(this.tilePosition.x + 2, this.tilePosition.y)];
                this.subSlimes = subSlimes;
                for (const slime of subSlimes) {
                    slime.baseSlime = this;
                    slime.pane = this.pane;
                    Game.world.addChild(slime);
                    Game.enemies.push(slime);
                    slime.placeOnMap()
                }
            } else {
                if (this.spawnAttempt) {
                    return;
                }
                this.pane = PANE.VERTICAL;
                this.spawnAttempt = true;
                this.afterMapGen();
            }
        }
    }

    move() {
        if (this.baseSlime) return;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
    }
}