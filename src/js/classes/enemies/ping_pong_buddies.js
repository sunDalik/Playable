import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {randomChoice} from "../../utils/random_utils";
import {isEmpty} from "../../map_checks";
import {BigFireBullet} from "./bullets/big_fire";
import {tileDistance} from "../../utils/game_utils";

export class PingPongBuddy extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/ping_pong_buddy.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.PING_PONG_BUDDY;
        this.atk = 1;
        this.main = true;
        this.pair = null;
        this.direction = randomChoice([1, -1]);
        this.ball = null;
        this.turn = true;
    }

    afterMapGen() {
        if (!this.main) return;
        if (!isEmpty(this.tilePosition.x + this.direction, this.tilePosition.y)
            || !isEmpty(this.tilePosition.x + this.direction * 2, this.tilePosition.y)) {
            this.direction *= -1;
        }
        if (!isEmpty(this.tilePosition.x + this.direction, this.tilePosition.y)
            || !isEmpty(this.tilePosition.x + this.direction * 2, this.tilePosition.y)) {
            this.die();
        }
        let offset = 2 * this.direction;
        const limit = 8;
        for (let x = 2; x <= limit; x++) {
            if (!isEmpty(this.tilePosition.x + (x + 1) * this.direction, this.tilePosition.y) || x === limit) {
                offset = x * this.direction;
                break;
            }
        }
        this.pair = new PingPongBuddy(this.tilePosition.x + offset, this.tilePosition.y);
        this.pair.placeOnMap();
        Game.world.addChild(this.pair);
        Game.enemies.push(this.pair);
        this.pair.direction = this.direction * -1;
        this.pair.main = false;
        this.pair.turn = false;
        this.pair.pair = this;
        this.correctScale();
        this.pair.correctScale();
    }

    //can either throw horizontal or diagonal if they can move vertically with vertical distance = [horizontal - 2; horizontal]
    move() {
        if (this.turn && (this.ball === null || this.ball.dead || this.isBallNearby())) {
            if (this.ball && !this.ball.dead) this.ball.die(true, false);
            let offset;
            if (this.direction === 1) offset = 2;
            else offset = -1;
            this.ball = this.pair.ball = new BigFireBullet(this.tilePosition.x + offset, this.tilePosition.y,
                [{x: this.direction, y: 0}]);
            Game.world.addBullet(this.ball);
            this.pair.turn = true;
            this.turn = false;
        }
    }

    isBallNearby() {
        for (const tile of [{x: this.ball.tilePosition.x, y: this.ball.tilePosition.y},
            {x: this.ball.tilePosition.x - 1, y: this.ball.tilePosition.y},
            {x: this.ball.tilePosition.x, y: this.ball.tilePosition.y - 1},
            {x: this.ball.tilePosition.x - 1, y: this.ball.tilePosition.y - 1}]) {
            if (tileDistance(this, {tilePosition: {x: tile.x, y: tile.y}}) === 1) {
                return true;
            }
        }
        return false;
    }

    correctScale() {
        this.scale.x = Math.abs(this.scale.x) * this.direction;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.texture = Game.resources["src/images/icons/intents/question_mark.png"].texture;
    }
}