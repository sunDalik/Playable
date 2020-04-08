import {Game} from "../../../game";
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueLeftHandPoint} from "../../inanimate_objects/statue";

export class Scythe {
    constructor() {
        this.texture = WeaponsSpriteSheet["scythe.png"];
        this.type = WEAPON_TYPE.SCYTHE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
        this.name = "Scythe";
        this.description = "Death to them all";
        this.rarity = RARITY.A;
    }

    attack(wielder, tileDirX, tileDirY) {
        let attackTiles = [];
        if (tileDirX !== 0) {
            attackTiles = [{x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + 1}];
        } else if (tileDirY !== 0) {
            attackTiles = [{x: wielder.tilePosition.x, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y}];
        }
        if (attackTiles.length !== 5) return false;
        if (isEnemy(attackTiles[0].x, attackTiles[0].y)
            || isEnemy(attackTiles[1].x, attackTiles[1].y) && isLit(attackTiles[1].x, attackTiles[1].y)
            || isEnemy(attackTiles[2].x, attackTiles[2].y) && isLit(attackTiles[2].x, attackTiles[2].y)
            || isEnemy(attackTiles[3].x, attackTiles[3].y)
            || isEnemy(attackTiles[4].x, attackTiles[4].y)) {

            const atk = wielder.getAtkWithWeapon(this);
            const enemiesToAttack = [];
            for (const attackTile of attackTiles) {
                createPlayerAttackTile(attackTile);
                if (isEnemy(attackTile.x, attackTile.y) && isLit(attackTile.x, attackTile.y)) {
                    enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity); //this is to avoid side effects of spiders' jumps
                }
            }
            for (const enemy of enemiesToAttack) {
                enemy.damage(wielder, atk, tileDirX, tileDirY, false);
            }
            createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 10, 180, 1.2);
            return true;
        } else return false;
    }

    getStatuePlacement() {
        return {x: statueLeftHandPoint.x - 70, y: statueLeftHandPoint.y + 90, angle: -90, scaleModifier: 1};
    }
}