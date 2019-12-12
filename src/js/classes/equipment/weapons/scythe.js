import {Game} from "../../../game";
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createFadingAttack} from "../../../animations";
import {FullTileElement} from "../../tile_elements/full_tile_element";
import * as PIXI from "pixi.js";

export class Scythe {
    constructor() {
        this.texture = Game.resources["src/images/weapons/scythe.png"].texture;
        this.type = WEAPON_TYPE.SCYTHE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
        this.name = "Scythe";
        this.description = "Death to them all";
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
                if (isNotAWall(attackTile.x, attackTile.y)) {
                    createFadingAttack(new FullTileElement(PIXI.Texture.WHITE, attackTile.x, attackTile.y), 10);
                }
                if (isEnemy(attackTile.x, attackTile.y) && isLit(attackTile.x, attackTile.y)) {
                    enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity); //this is to avoid side effects of spiders' jumps
                }
            }
            for (const enemy of enemiesToAttack) {
                enemy.damage(wielder, atk, tileDirX, tileDirY, false);
            }
            return true;
        } else return false;
    }
}