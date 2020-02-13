import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {closestPlayer, tileDistance} from "../../utils/game_utils";

export class MudMage extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/mud_mage.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.MUD_MAGE;
        this.atk = 0;
        this.SLIDE_ANIMATION_TIME = 5;
        this.turnDelay = 2;
        this.currentTurnDelay = this.turnDelay;
        this.casting = false;
        this.cooldown = 10;
        this.currentCooldown = 0;
        this.castDistance = 10;
        this.dangerDistance = 3;
        this.castTime = 2;
        this.currentCastTime = this.castTime;
    }

    move() {
        if (this.casting) {
            this.currentCooldown = this.cooldown;
            this.currentCastTime--;
            if (this.currentCastTime <= 0) {
                //summon
            }
        } else if (this.currentCooldown <= 0 && tileDistance(this, closestPlayer(this)) <= this.castDistance) {
            this.casting = true;
            this.currentCastTime = this.castTime;
            //prepare appearance blocks
        } else {
            //move
        }
        this.currentCooldown--;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.casting) {
            if (this.currentCastTime === 1) {

            } else {

            }
        } else if (this.currentTurnDelay <= 0) {

        } else {

        }
    }
}