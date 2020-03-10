import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {randomChoice, randomShuffle} from "../../utils/random_utils";
import {isEmpty} from "../../map_checks";
import {BigFireBullet} from "./bullets/big_fire";
import {tileDistance} from "../../utils/game_utils";
import {FireBullet} from "./bullets/fire";

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
        this.gonnaThrow = false;
        this.throwDirection = 0; //y
        this.SLIDE_ANIMATION_TIME = 3;
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
        this.cryMode = false;
        this.cryTimes = 8;
        this.currentCryTimes = this.cryTimes;
    }

    //can either throw horizontal or diagonal if they can move vertically with vertical distance = [horizontal - 2; horizontal]
    move() {
        if (this.pair.dead && !this.cryMode) {
            this.cryMode = true;
            this.gonnaThrow = false;
            this.turn = false;
            this.texture = Game.resources["src/images/enemies/ping_pong_buddy_cry.png"].texture;
        } else if (this.cryMode) {
            if (this.currentCryTimes > 0) {
                this.cry();
                this.currentCryTimes--;
            } else {
                this.texture = Game.resources["src/images/enemies/ping_pong_buddy_sad.png"].texture;
            }
        }

        if (this.gonnaThrow) {
            const offsetX = this.direction === 1 ? 2 : -1;
            if (this.throwDirection === 0) {
                this.ball = this.pair.ball = new BigFireBullet(this.tilePosition.x + offsetX, this.tilePosition.y,
                    [{x: this.direction, y: 0}]);
            } else if (this.throwDirection === 1) {
                this.ball = this.pair.ball = new BigFireBullet(this.tilePosition.x + offsetX, this.tilePosition.y + 1,
                    [{x: this.direction, y: 1}]);
            } else if (this.throwDirection === -1) {
                this.ball = this.pair.ball = new BigFireBullet(this.tilePosition.x + offsetX, this.tilePosition.y,
                    [{x: this.direction, y: -1}]);
            }
            Game.world.addBullet(this.ball);
            this.pair.turn = true;
            this.turn = false;
            this.gonnaThrow = false;
        } else if (this.turn && (this.ball === null || this.ball.dead || this.isBallNearby())) {
            if (this.ball && !this.ball.dead) this.ball.die(true, false);
            //0 - horizontal, 1 - diagonal down, 2 - diagonal up
            const tryOrder = randomShuffle([0, 1, 2]);
            for (const option of tryOrder) {
                if (option === 0) {
                    const positions = this.canThrowHorizontally();
                    if (positions === false) continue;
                    this.slide(0, positions.thisPosY - this.tilePosition.y);
                    this.pair.slide(0, positions.pairPosY - this.pair.tilePosition.y);
                    if (Game.enemies.indexOf(this.pair) < Game.enemies.indexOf(this)) this.pair.cancellable = false;
                    this.throwDirection = 0;
                    this.gonnaThrow = true;
                    break;
                }
                if (option === 1 || option === 2) {
                    let positions;
                    if (option === 1) positions = this.canThrowDiagonally(1);
                    else positions = this.canThrowDiagonally(-1);
                    if (positions === false) continue;

                    this.slide(0, positions.thisPosY - this.tilePosition.y);
                    this.pair.slide(0, positions.pairPosY - this.pair.tilePosition.y);
                    //assuming we iterate through Game.enemies from end to start
                    if (Game.enemies.indexOf(this.pair) < Game.enemies.indexOf(this)) this.pair.cancellable = false;
                    this.gonnaThrow = true;
                    if (option === 1) this.throwDirection = 1;
                    else this.throwDirection = -1;
                    break;
                }
            }
        }
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slide(tileStepX, tileStepY, onFrame, onEnd, Math.max(12, animationTime * (Math.abs(tileStepX) + Math.abs(tileStepY))));
    }

    isBallNearby() {
        if (this.ball === null || this.ball.dead) return false;
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

    canThrowDiagonally(dirY) {
        if (this.pair.dead) return false;
        const horizontalDistance = Math.abs(this.pair.tilePosition.x - this.tilePosition.x);
        let thisPosY = this.tilePosition.y;
        let pairPosY = this.pair.tilePosition.y;
        let pairLocked = false;
        let thisLocked = false;

        const isCheckPassed = () => {
            return Math.abs(pairPosY - thisPosY) >= horizontalDistance - 2 && pairPosY * dirY > thisPosY * dirY
        };

        while (true) {
            if (isCheckPassed()) {
                break;
            }
            if (isEmpty(this.tilePosition.x, thisPosY - dirY)) {
                thisPosY -= dirY;
            } else thisLocked = true;
            if (isEmpty(this.pair.tilePosition.x, pairPosY + dirY)) {
                pairPosY += dirY;
            } else pairLocked = true;
            if (isCheckPassed()) {
                break;
            }
            if (thisLocked && pairLocked) break;
        }
        if (isCheckPassed()) {
            return {pairPosY: pairPosY, thisPosY: thisPosY};
        } else return false;
    }

    canThrowHorizontally() {
        if (this.pair.dead) return false;
        let posY = false;
        const rand = randomChoice([1, -1]);
        if (isEmpty(this.tilePosition.x, this.tilePosition.y + rand)
            && isEmpty(this.pair.tilePosition.x, this.tilePosition.y + rand)) {
            posY = this.tilePosition.y + rand;
        } else if (isEmpty(this.tilePosition.x, this.tilePosition.y - rand)
            && isEmpty(this.pair.tilePosition.x, this.tilePosition.y - rand)) {
            posY = this.tilePosition.y - rand;
        } else if (isEmpty(this.pair.tilePosition.x, this.tilePosition.y)) {
            posY = this.tilePosition.y;
        }
        if (posY !== false) {
            return {pairPosY: posY, thisPosY: posY};
        } else return false;
    }

    cry() {
        Game.world.addBullet(new FireBullet(this.tilePosition.x - 1, this.tilePosition.y, [{x: -1, y: 0}]));
        Game.world.addBullet(new FireBullet(this.tilePosition.x + 1, this.tilePosition.y, [{x: 1, y: 0}]));
    }

    correctScale() {
        this.scale.x = Math.abs(this.scale.x) * this.direction;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.texture = Game.resources["src/images/icons/intents/question_mark.png"].texture;
    }
}