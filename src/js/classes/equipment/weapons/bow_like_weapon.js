import {Game} from "../../../game";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, runDestroyAnimation} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {getAngleForDirection} from "../../../utils/game_utils";
import {removeObjectFromArray} from "../../../utils/basic_utils";

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
            if (isAnyWall(atkPos.x, atkPos.y)) {
                break;
            }
            if (isEnemy(atkPos.x, atkPos.y) && isLit(atkPos.x, atkPos.y)) {
                const atk = this.getAtk(wielder, range);
                this.damageEnemies([Game.map[atkPos.y][atkPos.x].entity], wielder, atk, dirX, dirY);
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

    createArrowAnimation(wielder, atkOffsetX, atkOffsetY, diagonal = false) {
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
        if (!this.piercingBow || diagonal) {
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

    shootDiagonally(wielder, dirX, dirY, sign) {
        const tileSet = this.getDiagonalTiles(dirX, dirY, sign);
        for (let i = 0; i < tileSet.length; i++) {
            const tile = tileSet[i];
            const atkPos = {x: wielder.tilePosition.x + tile.x, y: wielder.tilePosition.y + tile.y};
            if (isAnyWall(atkPos.x, atkPos.y)) {
                if (i === 0) break;
                else if (i === 1) {
                    [tileSet[2], tileSet[4]].map(t => removeObjectFromArray(t, tileSet));
                    continue;
                } else if (i === 3) {
                    [tileSet[4], tileSet[5]].map(t => removeObjectFromArray(t, tileSet));
                    continue;
                }
            }
            if (isEnemy(atkPos.x, atkPos.y) && isLit(atkPos.x, atkPos.y)) {
                const atk = this.getDiagonalAtk(wielder, atkPos);
                this.damageEnemies([Game.map[atkPos.y][atkPos.x].entity], wielder, atk, dirX, dirY);
                this.createArrowAnimation(wielder, tile.x, tile.y, true);
                return true;
            }
        }
        return false;
    }

    getDiagonalTiles(dirX, dirY, sign) {
        const dir = dirX !== 0 ? dirX : dirY;
        const tiles = [{x: dir, y: sign}, {x: dir * 2, y: sign}, {x: dir * 3, y: sign},
            {x: dir * 2, y: sign * 2}, {x: dir * 3, y: sign * 2}, {x: dir * 3, y: sign * 3}];

        if (dir === dirY) {
            for (const tile of tiles) {
                const temp = tile.x;
                tile.x = tile.y;
                tile.y = temp;
            }
        }
        return tiles;
    }

    getDiagonalAtk(wielder, atkTile) {
        const range = Math.max(Math.abs(atkTile.x - wielder.tilePosition.x), Math.abs(atkTile.y - wielder.tilePosition.y));
        return this.getAtk(wielder, range);
    }
}