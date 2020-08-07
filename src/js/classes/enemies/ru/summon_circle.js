import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {getPlayerOnTile, isEmpty} from "../../../map_checks";
import {RUEnemiesSpriteSheet} from "../../../loader";
import {Z_INDEXES} from "../../../z_indexing";

export class SummonCircle extends Enemy {
    constructor(tilePositionX, tilePositionY, enemy, texture = RUEnemiesSpriteSheet["summon_circle.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 42;
        this.name = "Summon Circle";
        this.type = ENEMY_TYPE.SUMMON_CIRCLE;
        this.atk = 0;
        this.movable = false;
        this.isMinion = true;
        this.currentDelay = 3;
        this.summonedEnemy = enemy;
        this.removeShadow();
        this.setCenterPreservation();
        this.correctZIndex();
    }

    correctZIndex() {
        this.zIndex = Z_INDEXES.HAZARD + 1;
    }

    damageWithHazards() {
        return false;
    }

    move() {
        if (this.currentDelay === 1) {
            this.spin();
        }
        if (this.currentDelay <= 0) {
            Game.world.removeChild(this);
            Game.app.ticker.remove(this.animation);
            removeObjectFromArray(this, Game.enemies);
            if (isEmpty(this.tilePosition.x, this.tilePosition.y)) {
                Game.world.addEnemy(this.summonedEnemy, true);
            } else {
                this.summonedEnemy.die();
                const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y);
                if (player) player.damage(1, this, false, true);
            }
        }
        this.currentDelay--;
    }

    setDelay(delay) {
        this.currentDelay = delay;
    }

    spin() {
        let counter = 0;
        const animationTime = 80;
        const animation = (delta) => {
            counter += delta;
            this.angle = 360 * (counter / animationTime);
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    setStun(stun) {
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.visible = false;
    }
}