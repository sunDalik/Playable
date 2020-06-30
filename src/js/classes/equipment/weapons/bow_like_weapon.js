import {Game} from "../../../game";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, runDestroyAnimation} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {getAngleForDirection} from "../../../utils/game_utils";

export class BowLikeWeapon extends Weapon {
    constructor(texture) {
        super();
        this.texture = texture;
        this.arrowTexture = WeaponsSpriteSheet["arrow.png"];
        this.range = 3;
        this.bowLike = true;
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
        weaponSprite.angle = getAngleForDirection({x: Math.sign(atkOffsetX), y: Math.sign(atkOffsetY)}, 135);
        if (atkOffsetX > 0) {
            weaponSprite.scale.x *= -1;
            weaponSprite.angle -= 90;
        }

        this.createArrowAnimation(wielder, atkOffsetX, atkOffsetY);

        const animationTime = 9;
        let counter = 0;

        const bowAnimation = delta => {
            counter += delta;
            if (counter >= animationTime) {
                Game.world.removeChild(weaponSprite);
                Game.app.ticker.remove(bowAnimation);
            }
        };

        wielder.animation = bowAnimation;
        Game.app.ticker.add(bowAnimation);
    }

    createArrowAnimation(wielder, atkOffsetX, atkOffsetY) {
        const arrowSprite = new TileElement(this.arrowTexture, wielder.tilePosition.x, wielder.tilePosition.y);
        arrowSprite.position.set(wielder.getTilePositionX(), wielder.getTilePositionY());
        Game.world.addChild(arrowSprite);
        arrowSprite.zIndex = wielder.zIndex + 1;
        arrowSprite.scaleModifier = 0.8;
        arrowSprite.fitToTile();
        arrowSprite.angle = getAngleForDirection({x: atkOffsetX, y: atkOffsetY}, 135);
        arrowSprite.tilePosition.set(wielder.tilePosition.x + atkOffsetX, wielder.tilePosition.y + atkOffsetY);

        const arrowAnimationTime = this.getArrowAnimationTime(atkOffsetX, atkOffsetY);
        const arrowDelay = 1;
        if (!this.piercingBow) {
            createPlayerAttackTile({x: wielder.tilePosition.x + atkOffsetX, y: wielder.tilePosition.y + atkOffsetY},
                arrowAnimationTime + arrowDelay + 2);
        }
        const stepX = atkOffsetX * Game.TILESIZE / arrowAnimationTime;
        const stepY = atkOffsetY * Game.TILESIZE / arrowAnimationTime;
        let counter = 0;

        const animation = delta => {
            counter += delta;
            if (counter < arrowAnimationTime) {
                arrowSprite.position.x += stepX * delta;
                arrowSprite.position.y += stepY * delta;
            }

            if (counter >= arrowAnimationTime + arrowDelay) {
                Game.app.ticker.remove(animation);
                runDestroyAnimation(arrowSprite, false, 0, 0.6);
                Game.world.removeChild(arrowSprite);
            }
        };

        Game.app.ticker.add(animation);
    }

    getArrowAnimationTime(atkOffsetX, atkOffsetY) {
        return 2.5 * Math.max(Math.abs(atkOffsetX), Math.abs(atkOffsetY));
    }

    getAtk(wielder, range) {
        return wielder.getAtk(this);
    }
}