import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile, isEmpty} from "../../map_checks";
import {closestPlayer} from "../../utils/game_utils";
import {getChasingOptions} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";

export class Spider extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/spider.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1.5;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SPIDER;
        this.atk = 1;
        this.chase = false;
        this.thrown = false;
        this.STEP_ANIMATION_TIME = 6;
        this.BUMP_ANIMATION_TIME = 12;
    }

    move() {
        if (!this.thrown) {
            if (this.chase) {
                const movementOptions = getChasingOptions(this, closestPlayer(this));
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                    if (player) {
                        this.bump(dir.x, dir.y);
                        player.damage(this.atk, this, true);
                    } else {
                        this.step(dir.x, dir.y);
                    }
                } else this.bump(Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x), Math.sign(closestPlayer(this).tilePosition.y - this.tilePosition.y));
            } else {
                if (this.canSeePlayers()) {
                    this.chase = true;
                    this.move();
                }
            }
        } else this.thrown = false;
    }

    damage(source, dmg, inputX, inputY, magical = false, hazardDamage = false) {
        super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        if (!this.dead && this.stun === 0 && !magical) this.throwAway(inputX, inputY);
        if (Game.afterTurn) {
            this.thrown = false;
        }
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.throwStep(throwX, throwY);
                return true;
            }
        }
        return false;
    }

    throwStep(throwX, throwY) {
        this.step(throwX, throwY);
        this.thrown = true;
        this.cancellable = false;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.thrown) this.intentIcon.texture = Game.resources["src/images/icons/intents/stun.png"].texture;
        else this.intentIcon.texture = Game.resources["src/images/icons/intents/anger.png"].texture;
    }
}