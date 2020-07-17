import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums";
import {isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";

export class Scythe extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["scythe.png"];
        this.id = EQUIPMENT_ID.SCYTHE;
        this.atk = 1;
        this.name = "Scythe";
        this.description = "Attacks 5 enemies in front of you";
        this.rarity = RARITY.A;
    }

    attack(wielder, tileDirX, tileDirY) {
        const tiles = this.getTiles(wielder, tileDirX, tileDirY);
        const enemies = [];
        for (const tile of tiles) {
            if (isEnemy(tile.x, tile.y) && isLit(tile.x, tile.y)) {
                enemies.push(Game.map[tile.y][tile.x].entity);
            }
        }
        if (enemies.length === 0) return false;
        for (const enemy of enemies) {
            enemy.damage(wielder, wielder.getAtk(this), tileDirX, tileDirY);
        }
        for (const tile of tiles) {
            createPlayerAttackTile(tile);
        }
        createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 10, 180, 1.2, -108);
        return true;
    }

    getTiles(wielder, dirX, dirY) {
        if (dirX !== 0) {
            return [{x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + 1}];
        } else if (dirY !== 0) {
            return [{x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y}];
        }
    }
}