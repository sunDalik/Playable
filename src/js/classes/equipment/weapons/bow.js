import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createPlayerAttackTile, runDestroyAnimation} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {WeaponsSpriteSheet} from "../../../loader";

export class Bow {
    constructor() {
        this.texture = WeaponsSpriteSheet["bow.png"];
        this.arrowTexture = WeaponsSpriteSheet["arrow.png"];
        this.type = WEAPON_TYPE.BOW;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 0.75;
        this.name = "Bow";
        this.description = "Long-range weak attacks";
        this.rarity = RARITY.A;
    }

    attack(wielder, dirX, dirY) {
        const attackTile1 = {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + dirY};
        const attackTile2 = {x: wielder.tilePosition.x + dirX * 2, y: wielder.tilePosition.y + dirY * 2};
        const attackTile3 = {x: wielder.tilePosition.x + dirX * 3, y: wielder.tilePosition.y + dirY * 3};
        const atk = wielder.getAtkWithWeapon(this);
        //maybe should weaken close-range attacks for bow? who knows...
        if (isEnemy(attackTile1.x, attackTile1.y)) {
            this.createBowAnimation(wielder, dirX, dirY);
            Game.map[attackTile1.y][attackTile1.x].entity.damage(wielder, atk, dirX, dirY, false);
            createPlayerAttackTile(attackTile1);
            return true;
            //Assuming that tiles directly adjacent to players are always lit
        } else if (isEnemy(attackTile2.x, attackTile2.y) && isNotAWall(attackTile1.x, attackTile1.y) && isLit(attackTile2.x, attackTile2.y)) {
            this.createBowAnimation(wielder, dirX * 2, dirY * 2);
            Game.map[attackTile2.y][attackTile2.x].entity.damage(wielder, atk, dirX, dirY, false);
            createPlayerAttackTile(attackTile2);
            return true;
        } else if (isEnemy(attackTile3.x, attackTile3.y) && isNotAWall(attackTile2.x, attackTile2.y) && isNotAWall(attackTile1.x, attackTile1.y) && isLit(attackTile3.x, attackTile3.y) && isLit(attackTile2.x, attackTile2.y)) {
            this.createBowAnimation(wielder, dirX * 3, dirY * 3);
            Game.map[attackTile3.y][attackTile3.x].entity.damage(wielder, atk, dirX, dirY, false);
            createPlayerAttackTile(attackTile3);
            return true;
        } else return false;
    }

    createBowAnimation(wielder, atkOffsetX, atkOffsetY) {
        const weaponSprite = new TileElement(this.texture, 0, 0);
        weaponSprite.position.set(wielder.getTilePositionX(), wielder.getTilePositionY());
        Game.world.addChild(weaponSprite);
        wielder.animationSubSprites.push(weaponSprite);
        weaponSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        weaponSprite.angle = this.getAngleForDir(0, Math.sign(atkOffsetX), Math.sign(atkOffsetY));

        const arrowSprite = new TileElement(this.arrowTexture, 0, 0);
        arrowSprite.position.set(wielder.getTilePositionX(), wielder.getTilePositionY());
        Game.world.addChild(arrowSprite);
        arrowSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        arrowSprite.scaleModifier = 0.8;
        arrowSprite.fitToTile();
        arrowSprite.angle = this.getAngleForDir(0, Math.sign(atkOffsetX), Math.sign(atkOffsetY));
        arrowSprite.tilePosition.set(wielder.tilePosition.x + atkOffsetX, wielder.tilePosition.y + atkOffsetY);

        const animationTime = 5;
        const stepX = atkOffsetX * Game.TILESIZE / animationTime;
        const stepY = atkOffsetY * Game.TILESIZE / animationTime;
        let counterB = 0;
        let counterA = 0;

        const bowAnimation = delta => {
            counterB += delta;
            if (counterB >= animationTime + 1) {
                Game.world.removeChild(weaponSprite);
                Game.app.ticker.remove(bowAnimation);
            }
        };

        const arrowAnimation = delta => {
            counterA += delta;
            arrowSprite.position.x += stepX * delta;
            arrowSprite.position.y += stepY * delta;

            if (counterA >= animationTime) {
                Game.app.ticker.remove(arrowAnimation);
                runDestroyAnimation(arrowSprite, false, 0, 0.6);
                Game.world.removeChild(arrowSprite);
            }
        };

        wielder.animation = bowAnimation;
        Game.app.ticker.add(bowAnimation);
        Game.app.ticker.add(arrowAnimation);
    }

    //relative to upper left pointing position
    getAngleForDir(baseAngle, dirX, dirY) {
        if (dirX === 1) return baseAngle + 135;
        else if (dirX === -1) return baseAngle - 45;
        else if (dirY === 1) return baseAngle - 135;
        else if (dirY === -1) return baseAngle + 45;
    }

    getStatuePlacement() {
        return {x: 0, y: 0, angle: 0, scaleModifier: 0};
    }
}