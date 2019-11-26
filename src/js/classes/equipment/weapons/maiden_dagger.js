import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isAnyWall, isEmpty, isEnemy, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";
import * as PIXI from "pixi.js";

export class MaidenDagger {
    constructor() {
        this.texture = Game.resources["src/images/weapons/maiden_dagger.png"].texture;
        this.type = WEAPON_TYPE.MAIDEN_DAGGER;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
    }

    onWear(player) {
        //player.voluntaryDamage(0.25)?
    }

    attack(wielder, tileDirX, tileDirY) {
        if (wielder.secondHand && wielder.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && wielder.secondHand.type === this.type) {
            const ATStepX = tileDirX === 0 ? 1 : 0;
            const ATStepY = tileDirY === 0 ? 1 : 0;
            const enemyDmgValues = [1, 2, 1];
            const playerStepPosition = {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + tileDirY};
            const atkPositions = [
                {x: wielder.tilePosition.x + tileDirX - ATStepX, y: wielder.tilePosition.y + tileDirY - ATStepY},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x + tileDirX + ATStepX, y: wielder.tilePosition.y + tileDirY + ATStepY}];
            let foundEnemy = false;
            const enemiesToAttack = [];
            for (let i = 0; i < atkPositions.length; i++) {
                const atkPos = atkPositions[i];
                if (isEnemy(atkPos.x, atkPos.y)) {
                    foundEnemy = true;
                    const entity = Game.map[atkPos.y][atkPos.x].entity;
                    if (entity.movable) {
                        entity.cancelAnimation();
                        if (isEmpty(atkPos.x + tileDirX, atkPos.y + tileDirY)) {
                            entity.step(tileDirX, tileDirY);
                        } else {
                            if (tileDirX) entity.bumpX(tileDirX);
                            else if (tileDirY) entity.bumpY(tileDirY);
                            if (isAnyWall(atkPos.x + tileDirX, atkPos.y + tileDirY)) {
                                enemyDmgValues[i]++;
                            }
                        }
                    }
                    enemiesToAttack.push(entity);
                } else enemiesToAttack.push(null);
            }

            if (!foundEnemy) return false;
            if (isRelativelyEmpty(playerStepPosition.x, playerStepPosition.y)) {
                wielder.step(tileDirX, tileDirY);
            } else {
                wielder.bump(tileDirX, tileDirY);
            }
            this.createMaidenDaggersAnimation(wielder, tileDirX, tileDirY);
            for (let i = 0; i < enemiesToAttack.length; i++) {
                if (enemiesToAttack[i] === null) continue;
                enemiesToAttack[i].damage(wielder, wielder.getAtkWithWeapon(null, enemyDmgValues[i]), tileDirX, tileDirY, false);
            }
            return true;
        } else {
            const attackTileX = wielder.tilePosition.x + tileDirX;
            const attackTileY = wielder.tilePosition.y + tileDirY;
            const atk = wielder.getAtkWithWeapon(this);
            if (isEnemy(attackTileX, attackTileY)) {
                createPlayerWeaponAnimation(wielder, attackTileX, attackTileY);
                Game.map[attackTileY][attackTileX].entity.damage(wielder, atk, tileDirX, tileDirY, false);
                return true;
            } else return false;
        }
    }

    createMaidenDaggersAnimation(player, tileDirX, tileDirY) {
        let attackSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        let attackSprite2 = new PIXI.Sprite(PIXI.Texture.WHITE);
        const px = player.tilePosition.x * Game.TILESIZE + (Game.TILESIZE - Game.player.width) / 2 + Game.player.width / 2;
        const py = player.tilePosition.y * Game.TILESIZE + (Game.TILESIZE - Game.player.height) / 2 + Game.player.height / 2;
        player.animationSubSprites.push(attackSprite);
        player.animationSubSprites.push(attackSprite2);
        const size = Game.TILESIZE / 2.5;
        attackSprite.width = size;
        attackSprite.height = size;
        attackSprite2.width = size;
        attackSprite2.height = size;
        const angle = 60;
        if (tileDirX > 0) {
            attackSprite.anchor.set(0, 0.5);
            attackSprite2.anchor.set(0, 0.5);
            attackSprite.position.set(px, py - Game.TILESIZE);
            attackSprite2.position.set(px, py + Game.TILESIZE);
            attackSprite.angle = angle;
            attackSprite2.angle = -angle;
        } else if (tileDirX < 0) {
            attackSprite.anchor.set(1, 0.5);
            attackSprite2.anchor.set(1, 0.5);
            attackSprite.position.set(px, py - Game.TILESIZE);
            attackSprite2.position.set(px, py + Game.TILESIZE);
            attackSprite.angle = -angle;
            attackSprite2.angle = angle;
        } else if (tileDirY > 0) {
            attackSprite.anchor.set(0.5, 0);
            attackSprite2.anchor.set(0.5, 0);
            attackSprite.position.set(px - Game.TILESIZE, py);
            attackSprite2.position.set(px + Game.TILESIZE, py);
            attackSprite.angle = -angle;
            attackSprite2.angle = angle;
        } else if (tileDirY < 0) {
            attackSprite.anchor.set(0.5, 1);
            attackSprite2.anchor.set(0.5, 1);
            attackSprite.position.set(px - Game.TILESIZE, py);
            attackSprite2.position.set(px + Game.TILESIZE, py);
            attackSprite.angle = angle;
            attackSprite2.angle = -angle;
        }
        Game.world.addChild(attackSprite);
        Game.world.addChild(attackSprite2);

        const animationTime = Game.WEAPON_ATTACK_TIME + 2;
        const stepX = Math.abs(tileDirX * 1.5) * Game.TILESIZE / (animationTime / 2);
        const stepY = Math.abs(tileDirY * 1.5) * Game.TILESIZE / (animationTime / 2);
        if (stepX === 0) {
            attackSprite.height = 0;
            attackSprite2.height = 0;
        }
        if (stepY === 0) {
            attackSprite.width = 0;
            attackSprite2.width = 0;
        }

        let counter = 0;

        let animation = function () {
            if (counter < animationTime / 2) {
                attackSprite.width += stepX;
                attackSprite.height += stepY;
                attackSprite2.width += stepX;
                attackSprite2.height += stepY;
            } else {
                attackSprite.width -= stepX;
                attackSprite.height -= stepY;
                attackSprite2.width -= stepX;
                attackSprite2.height -= stepY;
            }
            counter++;
            if (counter >= animationTime) {
                Game.world.removeChild(attackSprite);
                Game.world.removeChild(attackSprite2);
                Game.APP.ticker.remove(animation);
            }
        };
        Game.APP.ticker.add(animation);
    }
}