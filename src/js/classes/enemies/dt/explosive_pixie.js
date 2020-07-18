import {Enemy} from "../enemy";
import {ENEMY_TYPE, STAGE} from "../../../enums/enums";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {Game} from "../../../game";
import {getChasingOptions, getRelativelyEmptyLitCardinalDirections} from "../../../utils/map_utils";
import {randomChoice} from "../../../utils/random_utils";
import {getPlayerOnTile} from "../../../map_checks";
import {explode} from "../../../game_logic";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class ExplosivePixie extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["explosive_pixie.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 0.25;
        this.type = ENEMY_TYPE.EXPLOSIVE_PIXIE;
        this.lightDistance = 7;
        this.noticeDistance = 4;
        this.angry = false;
        this.canMoveInvisible = true;
        this.exploding = false;
        this.explodeDelay = 1;
        this.SLIDE_ANIMATION_TIME = 8;
        this.setRandomColor();
        this.tallModifier = Game.TILESIZE / 3;
    }

    move() {
        if (this.exploding) {
            if (this.explodeDelay <= 0) {
                this.explode();
            } else {
                this.explodeDelay--;
                this.shake(1, 0);
            }
        } else if (this.maskLayer === undefined) {
            if (tileDistance(this, closestPlayer(this)) <= this.lightDistance) {
                this.visible = true;
                this.maskLayer = {};
                if (Game.stage === STAGE.DARK_TUNNEL) {
                    Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
                }
            }
        } else {
            if (this.angry || tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
                this.angry = true;
                const movementOptions = getChasingOptions(this, closestPlayer(this));
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                    if (player) {
                        this.explode();
                    } else {
                        this.slide(dir.x, dir.y);

                        const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
                        if (sign !== 0) {
                            this.texture = DTEnemiesSpriteSheet["explosive_pixie_right.png"];
                            this.scale.x = sign * Math.abs(this.scale.x);
                        } else {
                            this.texture = DTEnemiesSpriteSheet["explosive_pixie.png"];
                            this.scale.x = Math.abs(this.scale.x);
                        }
                    }
                }
            } else {
                const movementOptions = getRelativelyEmptyLitCardinalDirections(this);
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    this.slide(dir.x, dir.y);
                }
            }
        }
    }

    // mb die on setStun??

    explode() {
        explode(this.tilePosition.x, this.tilePosition.y, 2, 1);
        this.die();
    }

    runDestroyAnimation() {}

    damage(source, dmg, inputX, inputY, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        if (!this.exploding && !this.dead) {
            this.prepareToExplode();
            this.runHitAnimation();
        }
    }

    prepareToExplode() {
        this.texture = DTEnemiesSpriteSheet["explosive_pixie_exploding.png"];
        this.exploding = true;
        this.shake(1, 0);
    }

    setRandomColor() {
        this.tint = randomChoice([0xf7bef7, 0xbef7f4, 0xbef7c9, 0xe2f7be, 0xf7d9be, 0xc3bef7, 0xf7beda]);
    }

    updateIntentIcon() {
        //todo add explosion icon
        super.updateIntentIcon();
        if (this.angry) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}