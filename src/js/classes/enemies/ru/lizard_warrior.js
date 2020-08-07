import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {closestPlayer, getAngleForDirection, tileDistance} from "../../../utils/game_utils";
import {getEmptyCardinalDirections, getEmptyHorizontalDirections} from "../../../utils/map_utils";
import {randomChoice} from "../../../utils/random_utils";
import {getPlayerOnTile, isEmpty} from "../../../map_checks";
import {GRAIL_TEXT_DARK_FILTER, GRAIL_TEXT_WHITE_FILTER} from "../../../filters";
import {TileElement} from "../../tile_elements/tile_element";
import {createEnemyAttackTile} from "../../../animations";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet, WeaponsSpriteSheet} from "../../../loader";
import {soldierAI} from "../../../enemy_movement_ai";

export class LizardWarrior extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["lizard_warrior.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 3;
        this.name = "Lizard Warrior";
        this.type = ENEMY_TYPE.LIZARD_WARRIOR;
        this.atk = 1.5;
        this.SLIDE_ANIMATION_TIME = 5;

        this.triggeredWideSlash = false;
        this.triggeredForwardPierce = false;
        this.attackedLastTurn = false;
        this.attackDirection = {x: 0, y: 0};
        this.lockedPlayer = null;
        this.setScaleModifier(1.1);
        this.intentIcon2 = this.createIntentIcon();
    }

    setStun(stun) {
        super.setStun(stun);
        this.triggeredWideSlash = false;
        this.triggeredForwardPierce = false;
        this.attackedLastTurn = true;
        this.cancelAnimation();
        this.texture = RUEnemiesSpriteSheet["lizard_warrior.png"];

    }

    move() {
        if (this.lockedPlayer === null || this.lockedPlayer.dead) {
            if (tileDistance(this, closestPlayer(this)) < 12) {
                this.lockedPlayer = closestPlayer(this);
            } else {
                const direction = randomChoice(getEmptyCardinalDirections(this));
                if (direction !== undefined) {
                    this.step(direction.x, direction.y);
                }
                return;
            }
        }
        if (!this.triggeredWideSlash && !this.triggeredForwardPierce) {
            this.texture = RUEnemiesSpriteSheet["lizard_warrior.png"];
        }
        this.correctScale();
        if (this.triggeredWideSlash) {
            this.triggeredWideSlash = false;
            this.attackedLastTurn = true;
            if (isEmpty(this.tilePosition.x + this.attackDirection.x, this.tilePosition.y + this.attackDirection.y)) {
                this.slide(this.attackDirection.x, this.attackDirection.y, null, () => this.shake(0.7, 0));
            }
            this.animateSwordBottom(this.attackDirection);
            this.triggeredForwardPierce = true;
            this.texture = RUEnemiesSpriteSheet["lizard_warrior_triggered_forward_pierce.png"];
            for (const attackTile of [{x: this.attackDirection.x, y: 0},
                {x: this.attackDirection.x, y: -1},
                {x: this.attackDirection.x, y: 1}]) {
                const player = getPlayerOnTile(this.tilePosition.x + attackTile.x, this.tilePosition.y + attackTile.y);
                if (player) {
                    if (attackTile.y === 0) player.damage(this.atk, this, true, true);
                    else player.damage(this.atk, this, false, true);
                }
            }
        } else if (this.triggeredForwardPierce) {
            this.triggeredForwardPierce = false;
            this.texture = RUEnemiesSpriteSheet["lizard_warrior_after_attack.png"];
            this.attackedLastTurn = true;
            this.animateSwordForward(this.attackDirection);
            for (const attackTile of [{x: this.attackDirection.x, y: 0}, {x: this.attackDirection.x * 2, y: 0}]) {
                const player = getPlayerOnTile(this.tilePosition.x + attackTile.x, this.tilePosition.y + attackTile.y);
                if (player) {
                    if (attackTile.x === this.attackDirection.x) player.damage(this.atk, this, true, true);
                    else player.damage(this.atk, this, false, true);
                }
            }
        } else if (this.tilePosition.x === this.lockedPlayer.tilePosition.x) {
            this.attackedLastTurn = false;
            const direction = randomChoice(getEmptyHorizontalDirections(this));
            if (direction !== undefined) {
                this.step(direction.x, direction.y);
                this.correctScale();
            } else if (isEmpty(this.tilePosition.x, this.tilePosition.y + Math.sign(this.tilePosition.y - this.lockedPlayer.tilePosition.y))) {
                this.step(0, Math.sign(this.tilePosition.y - this.lockedPlayer.tilePosition.y));
            } else if (isEmpty(this.tilePosition.x, this.tilePosition.y + Math.sign(this.lockedPlayer.tilePosition.y - this.tilePosition.y))) {
                this.step(0, Math.sign(this.lockedPlayer.tilePosition.y - this.tilePosition.y));
            }
        } else if (!this.attackedLastTurn && this.tilePosition.y === this.lockedPlayer.tilePosition.y && tileDistance(this, this.lockedPlayer) === 1 && isEmpty(this.tilePosition.x + Math.sign(this.tilePosition.x - this.lockedPlayer.tilePosition.x), this.tilePosition.y)) {
            this.triggeredWideSlash = true;
            this.slide(Math.sign(this.tilePosition.x - this.lockedPlayer.tilePosition.x), 0, null, () => this.shake(0.7, 0));
            this.texture = RUEnemiesSpriteSheet["lizard_warrior_triggered_wide_slash.png"];
            this.attackDirection = {x: Math.sign(this.lockedPlayer.tilePosition.x - this.tilePosition.x), y: 0};
        } else {
            this.attackedLastTurn = false;
            soldierAI(this, this.lockedPlayer);
        }
    }

    animateSwordBottom(direction) {
        const sword = new TileElement(WeaponsSpriteSheet["rusty_sword.png"], this.tilePosition.x + direction.x, this.tilePosition.y - 1);
        Game.world.addChild(sword);
        sword.zIndex = Game.primaryPlayer.zIndex + 1;
        if (direction.x === 1) sword.angle = 135; // the picture is directed to the top left!!
        else if (direction.x === -1) sword.angle = -45;

        const animationTime = 6;
        const startStayTime = 3;
        const endStayTime = 5;
        const startVal = sword.position.y;
        const endChange = Game.TILESIZE * 2;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter >= startStayTime && counter < animationTime + startStayTime) {
                sword.position.y = startVal + (counter - startStayTime) / animationTime * endChange;
            }
            if (counter >= startStayTime + animationTime + endStayTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(sword);
            }
        };
        Game.app.ticker.add(animation);

        for (const tile of [{x: this.tilePosition.x + direction.x, y: this.tilePosition.y - 1},
            {x: this.tilePosition.x + direction.x, y: this.tilePosition.y},
            {x: this.tilePosition.x + direction.x, y: this.tilePosition.y + 1}]) {
            createEnemyAttackTile(tile, 8);
        }

        /*
        ANGLE VERSION
          const sword = new TileElement(Game.resources["src/images/weapons/rusty_sword.png"].texture, this.tilePosition.x, this.tilePosition.y);
        sword.anchor.set(1, 1);
        if (direction.x === 1) sword.angle = 90;
        const startVal = sword.angle;
        const endChange = 90;

                //sword.position.y = startVal + (counter - startStayTime) / animationTime * endChange;
                if (direction.x === 1) sword.angle = startVal + endChange * (counter - startStayTime) / animationTime; // the picture is directed to the top left!!
                else if (direction.x === -1) sword.angle = startVal - endChange * (counter - startStayTime) / animationTime;
         */
    }

    animateSwordForward(direction) {
        const sword = new TileElement(WeaponsSpriteSheet["rusty_sword.png"], this.tilePosition.x, this.tilePosition.y);
        Game.world.addChild(sword);
        sword.zIndex = Game.primaryPlayer.zIndex + 1;
        if (direction.x === 1) sword.angle = 135;
        else if (direction.x === -1) sword.angle = -45;

        const animationTime = 4;
        const startStayTime = 3;
        const endStayTime = 7;
        const startVal = sword.position.x;
        const endChange = Game.TILESIZE * 2 * direction.x;
        let counter = 0;
        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter >= startStayTime && counter < animationTime + startStayTime) {
                sword.position.x = startVal + (counter - startStayTime) / animationTime * endChange;
            }
            if (counter >= startStayTime + animationTime + endStayTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(sword);
            }
        };
        Game.app.ticker.add(animation);

        for (const tile of [{x: this.tilePosition.x + direction.x, y: this.tilePosition.y},
            {x: this.tilePosition.x + direction.x * 2, y: this.tilePosition.y}]) {
            createEnemyAttackTile(tile, 8);
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.height = this.intentIcon.width;
        this.intentIcon2.visible = false;
        if (this.triggeredWideSlash) {
            this.intentIcon.filters = [];
            this.intentIcon.texture = IntentsSpriteSheet["three_tiles_front.png"];
            this.intentIcon.height = this.intentIcon.texture.height / this.intentIcon.texture.width * this.intentIcon.width;
            this.intentIcon2.visible = true;
            this.intentIcon2.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon2.angle = getAngleForDirection(this.attackDirection);
        } else if (this.triggeredForwardPierce) {
            this.intentIcon.filters = [];
            this.intentIcon.texture = IntentsSpriteSheet["two_tiles_forward.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
            if (this.lockedPlayer === Game.player)
                this.intentIcon.filters = [GRAIL_TEXT_WHITE_FILTER];
            else if (this.lockedPlayer === Game.player2)
                this.intentIcon.filters = [GRAIL_TEXT_DARK_FILTER];
        }
    }


    onMoveFrame() {
        super.onMoveFrame();
        if (this.triggeredWideSlash) {
            if (this.attackDirection.x === 1) this.intentIcon.position.x += this.intentIcon.width / 2;
            else if (this.attackDirection.x === -1) this.intentIcon.position.x -= this.intentIcon.width / 2;

            if (this.intentIcon2) {
                if (this.attackDirection.x === 1) this.intentIcon2.position.x = this.intentIcon.position.x - this.intentIcon.width;
                else if (this.attackDirection.x === -1) this.intentIcon2.position.x = this.intentIcon.position.x + this.intentIcon.width;
            }
        }
    }

    correctScale() {
        if (this.lockedPlayer && this.lockedPlayer.tilePosition.x !== this.tilePosition.x) {
            this.scale.x = Math.sign(this.lockedPlayer.tilePosition.x - this.tilePosition.x) * Math.abs(this.scale.x);
        }
    }
}