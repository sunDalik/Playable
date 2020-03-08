import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {getPlayerOnTile, isEmpty} from "../../map_checks";

export class SummonCircle extends Enemy {
    constructor(tilePositionX, tilePositionY, enemy, texture = Game.resources["src/images/enemies/summon_circle.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 42;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SUMMON_CIRCLE;
        this.atk = 0;
        this.movable = false;
        this.energyDrop = 0;
        this.delay = 3;
        this.currentDelay = this.delay;
        this.summonedEnemy = enemy;
        this.zIndex = -2;
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
                this.summonedEnemy.placeOnMap();
                Game.world.addChild(this.summonedEnemy);
                this.summonedEnemy.updateIntentIcon();
                Game.enemies.push(this.summonedEnemy);
            } else {
                this.summonedEnemy.die();
                const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y);
                if (player) player.damage(1, this, false, true);
            }
        }
        this.currentDelay--;
    }

    setDelay(delay) {
        this.delay = delay;
        this.currentDelay = this.delay;
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

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.visible = false;
    }
}