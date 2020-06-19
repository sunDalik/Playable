import {EQUIPMENT_ID, RARITY} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {BowLikeWeapon} from "./bow_like_weapon";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {Game} from "../../../game";
import {removeObjectFromArray} from "../../../utils/basic_utils";

export class CerberusBow extends BowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["cerberus_bow.png"]);
        this.id = EQUIPMENT_ID.CERBERUS_BOW;
        this.arrowTexture = WeaponsSpriteSheet["hell_arrow.png"];
        this.atk = 0.75;
        this.name = "Cerberus Bow";
        this.description = "Range 3\nAttack = 0.25 * distance to target\nThis bow can fire up to 2 additional diagonal arrows";
        this.rarity = RARITY.A;
    }

    attack(wielder, dirX, dirY) {
        if (super.attack(wielder, dirX, dirY)) {
            const tileSets = [this.getDiagonalTiles(dirX, dirY, 1), this.getDiagonalTiles(dirX, dirY, -1)];
            for (const tileSet of tileSets) {
                for (let i = 0; i < tileSet.length; i++) {
                    const tile = tileSet[i];
                    const atkPos = {x: wielder.tilePosition.x + tile.x, y: wielder.tilePosition.y + tile.y};
                    if (isAnyWall(atkPos.x, atkPos.y) || !isLit(atkPos.x, atkPos.y)) {
                        if (i === 0) break;
                        else if (i === 1) {
                            [tileSet[2], tileSet[4]].map(t => removeObjectFromArray(t, tileSet));
                            continue;
                        } else if (i === 3) {
                            [tileSet[4], tileSet[5]].map(t => removeObjectFromArray(t, tileSet));
                            continue;
                        }
                    }
                    if (isEnemy(atkPos.x, atkPos.y)) {
                        const atk = this.getDiagonalAtk(wielder, atkPos);
                        Game.map[atkPos.y][atkPos.x].entity.damage(wielder, atk, dirX, dirY);
                        this.createArrowAnimation(wielder, tile.x, tile.y);
                        break;
                    }
                }
            }
            return true;
        } else {
            return false;
        }
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

    getAtk(wielder, range) {
        return wielder.getAtk(this, this.atk * (range / 3));
    }

    getDiagonalAtk(wielder, atkTile) {
        const range = Math.max(Math.abs(atkTile.x - wielder.tilePosition.x), Math.abs(atkTile.y - wielder.tilePosition.y));
        return this.getAtk(wielder, range);
    }

    getArrowAnimationTime(atkOffsetX, atkOffsetY) {
        return 1.5 * (Math.abs(atkOffsetX) + Math.abs(atkOffsetY));
    }
}