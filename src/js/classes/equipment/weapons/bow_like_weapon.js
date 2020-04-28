import {Game} from "../../../game"
import {EQUIPMENT_TYPE} from "../../../enums";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, runDestroyAnimation} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {WeaponsSpriteSheet} from "../../../loader";

export class BowLikeWeapon {
    constructor(texture) {
        this.texture = texture;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.arrowTexture = WeaponsSpriteSheet["arrow.png"];
        this.range = 3;
    }

    attack(wielder, dirX, dirY) {
        for (let range = 1; range <= this.range; range++) {
            const atkPos = {x: wielder.tilePosition.x + dirX * range, y: wielder.tilePosition.y + dirY * range};
            if (isAnyWall(atkPos.x, atkPos.y) || !isLit(atkPos.x, atkPos.y)) {
                break;
            }
            if (isEnemy(atkPos.x, atkPos.y)) {
                const atk = this.getAtk(wielder, range);
                Game.map[atkPos.y][atkPos.x].entity.damage(wielder, atk, dirX, dirY);
                this.createBowAnimation(wielder, dirX * range, dirY * range);
                createPlayerAttackTile(atkPos);
                return true;
            }
        }

        return false;
    }

    createBowAnimation(wielder, atkOffsetX, atkOffsetY) {
        const weaponSprite = new TileElement(this.texture, wielder.tilePosition.x, wielder.tilePosition.y);
        weaponSprite.position.set(wielder.getTilePositionX(), wielder.getTilePositionY());
        Game.world.addChild(weaponSprite);
        wielder.animationSubSprites.push(weaponSprite);
        weaponSprite.zIndex = wielder.zIndex + 1;
        weaponSprite.angle = this.getAngleForDir(0, Math.sign(atkOffsetX), Math.sign(atkOffsetY));

        const arrowSprite = new TileElement(this.arrowTexture, wielder.tilePosition.x, wielder.tilePosition.y);
        arrowSprite.position.set(wielder.getTilePositionX(), wielder.getTilePositionY());
        Game.world.addChild(arrowSprite);
        arrowSprite.zIndex = wielder.zIndex + 1;
        arrowSprite.scaleModifier = 0.8;
        arrowSprite.fitToTile();
        arrowSprite.angle = this.getAngleForDir(0, Math.sign(atkOffsetX), Math.sign(atkOffsetY));
        arrowSprite.tilePosition.set(wielder.tilePosition.x + atkOffsetX, wielder.tilePosition.y + atkOffsetY);

        const arrowAnimationTime = 2.5 * Math.max(Math.abs(atkOffsetX), Math.abs(atkOffsetY));
        const arrowDelay = 1;
        const weaponAnimationTime = 9;
        const stepX = atkOffsetX * Game.TILESIZE / arrowAnimationTime;
        const stepY = atkOffsetY * Game.TILESIZE / arrowAnimationTime;
        let counterB = 0;
        let counterA = 0;

        const bowAnimation = delta => {
            counterB += delta;
            if (counterB >= weaponAnimationTime) {
                Game.world.removeChild(weaponSprite);
                Game.app.ticker.remove(bowAnimation);
            }
        };

        const arrowAnimation = delta => {
            counterA += delta;
            if (counterA < arrowAnimationTime) {
                arrowSprite.position.x += stepX * delta;
                arrowSprite.position.y += stepY * delta;
            }

            if (counterA >= arrowAnimationTime + arrowDelay) {
                Game.app.ticker.remove(arrowAnimation);
                runDestroyAnimation(arrowSprite, false, 0, 0.6);
                Game.world.removeChild(arrowSprite);
            }
        };

        wielder.animation = bowAnimation;
        Game.app.ticker.add(bowAnimation);
        Game.app.ticker.add(arrowAnimation);
    }

    getAtk(wielder, range) {
        return wielder.getAtkWithWeapon(this);
    }

    //relative to upper left pointing position
    getAngleForDir(baseAngle, dirX, dirY) {
        if (dirX === 1) return baseAngle + 135;
        else if (dirX === -1) return baseAngle - 45;
        else if (dirY === 1) return baseAngle - 135;
        else if (dirY === -1) return baseAngle + 45;
    }
}