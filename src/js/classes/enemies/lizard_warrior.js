import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {closestPlayer, tileDistance} from "../../utils/game_utils";
import {getDirectionsWithConditions, getEmptyHorizontalDirections} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";
import {isEmpty} from "../../map_checks";
import {GRAIL_TEXT_DARK_FILTER, GRAIL_TEXT_WHITE_FILTER} from "../../filters";

export class LizardWarrior extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/lizard_warrior.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.LIZARD_WARRIOR;
        this.atk = 1.5;
        this.zIndex = Game.primaryPlayer.zIndex + 1;
        this.SLIDE_ANIMATION_TIME = 5;

        this.triggeredWideSlash = false;
        this.triggeredForwardPierce = false;
        this.attackDirection = {x: 0, y: 0};
        this.lockedPlayer = null;
        this.scaleModifier = 1.1;
        this.fitToTile();
        this.place();
    }

    move() {
        if (this.lockedPlayer === null || this.lockedPlayer.dead) {
            this.lockedPlayer = closestPlayer(this);
        }
        this.correctScale();
        if (this.triggeredWideSlash) {
            this.triggeredWideSlash = false;
            if (isEmpty(this.tilePosition.x + this.attackDirection.x, this.tilePosition.y + this.attackDirection.y)) {
                this.slide(this.attackDirection.x, this.attackDirection.y);
            }
            //todo: attack
            this.triggeredForwardPierce = true;
        } else if (this.triggeredForwardPierce) {
            this.triggeredForwardPierce = false;
        } else if (this.tilePosition.x === this.lockedPlayer.tilePosition.x) {
            const direction = randomChoice(getEmptyHorizontalDirections(this));
            if (direction !== undefined) {
                this.step(direction.x, direction.y);
                this.correctScale();
            } else if (isEmpty(this.tilePosition.x, this.tilePosition.y + Math.sign(this.tilePosition.y - this.lockedPlayer.tilePosition.y))) {
                this.step(0, Math.sign(this.tilePosition.y - this.lockedPlayer.tilePosition.y));
            } else if (isEmpty(this.tilePosition.x, this.tilePosition.y + Math.sign(this.lockedPlayer.tilePosition.y - this.tilePosition.y))) {
                this.step(0, Math.sign(this.lockedPlayer.tilePosition.y - this.tilePosition.y));
            }
        } else if (this.tilePosition.y === this.lockedPlayer.tilePosition.y && tileDistance(this, this.lockedPlayer) === 1 && isEmpty(this.tilePosition.x + Math.sign(this.tilePosition.x - this.lockedPlayer.tilePosition.x), this.tilePosition.y)) {
            this.triggeredWideSlash = true;
            this.slide(Math.sign(this.tilePosition.x - this.lockedPlayer.tilePosition.x), 0, null, () => this.shake(1, 0));
            this.attackDirection = {x: Math.sign(this.lockedPlayer.tilePosition.x - this.tilePosition.x), y: 0};
        } else {
            const forward = {x: Math.sign(this.lockedPlayer.tilePosition.x - this.tilePosition.x), y: 0};
            const align = {x: 0, y: Math.sign(this.lockedPlayer.tilePosition.y - this.tilePosition.y)};
            if (this.tilePosition.y === this.lockedPlayer.tilePosition.y) {
                const directions = [forward];
                if (tileDistance(this, this.lockedPlayer) > 2) {
                    directions.push(forward);
                    directions.push({x: 0, y: 1});
                    directions.push({x: 0, y: -1});
                    directions.push({x: -forward.x, y: 0});
                } else if (tileDistance(this, this.lockedPlayer) === 2 && this.lockedPlayer.lastTileStepX === -forward.x) {
                    directions.push({x: -forward.x, y: 0});
                } else if (tileDistance(this, this.lockedPlayer) === 1) {
                    directions.push({x: 0, y: 1});
                    directions.push({x: 0, y: -1});
                }
                const direction = randomChoice(getDirectionsWithConditions(this, directions, isEmpty));
                if (direction !== undefined) {
                    this.step(direction.x, direction.y);
                }
            } else {
                const directions = [align, align, forward];
                const direction = randomChoice(getDirectionsWithConditions(this, directions, isEmpty));
                if (direction !== undefined) {
                    this.step(direction.x, direction.y);
                }
            }
        }

    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.height = this.intentIcon.width;
        if (this.triggeredWideSlash) {
            this.intentIcon.filters = [];
            this.intentIcon.texture = Game.resources["src/images/icons/intents/three_tiles_front.png"].texture;
            this.intentIcon.height = this.intentIcon.texture.height / this.intentIcon.texture.width * this.intentIcon.width;
        } else if (this.triggeredForwardPierce) {
            this.intentIcon.filters = [];
            this.intentIcon.texture = Game.resources["src/images/icons/intents/two_tiles_forward.png"].texture;
        } else {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/anger.png"].texture;
            if (this.lockedPlayer === Game.player)
                this.intentIcon.filters = [GRAIL_TEXT_WHITE_FILTER];
            else if (this.lockedPlayer === Game.player2)
                this.intentIcon.filters = [GRAIL_TEXT_DARK_FILTER];
        }
    }

    place() {
        this.position.x = this.getTilePositionX();
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE * 1.1 + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
        if (this.healthContainer) this.moveHealthContainer();
    }

    correctScale() {
        if (this.lockedPlayer && this.lockedPlayer.tilePosition.x !== this.tilePosition.x) {
            this.scale.x = Math.sign(this.lockedPlayer.tilePosition.x - this.tilePosition.x) * Math.abs(this.scale.x);
        }
    }
}