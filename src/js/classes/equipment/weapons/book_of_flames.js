import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isNotAWall} from "../../../map_checks";
import {createFadingAttack} from "../../../animations";
import {FullTileElement} from "../../tile_elements/full_tile_element";
import * as PIXI from "pixi.js";
import {redrawSlotContents} from "../../../drawing/draw_hud";

export class BookOfFlames {
    constructor() {
        this.texture = Game.resources["src/images/weapons/book_of_flames.png"].texture;
        this.type = WEAPON_TYPE.BOOK_OF_FLAMES;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 2;
        this.maxUses = 2;
        this.uses = this.maxUses;
        this.concentrationLimit = 3;
        this.concentration = 0;
    }

    attack(wielder, tileDirX, tileDirY) {
        if (this.uses <= 0) return false;
        let attackTiles = [];
        if (tileDirX !== 0) {
            attackTiles = [{x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x + tileDirX * 2, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + tileDirX * 3, y: wielder.tilePosition.y}];
        } else if (tileDirY !== 0) {
            attackTiles = [{x: wielder.tilePosition.x, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + tileDirY * 2},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + tileDirY * 3}];
        }
        if (attackTiles.length !== 5) return false;
        if (isEnemy(attackTiles[0].x, attackTiles[0].y)
            || isEnemy(attackTiles[1].x, attackTiles[1].y)
            || isEnemy(attackTiles[2].x, attackTiles[2].y)
            || isEnemy(attackTiles[3].x, attackTiles[3].y)
            || isEnemy(attackTiles[4].x, attackTiles[4].y)) {

            const atk = wielder.getAtkWithWeapon(this);
            for (const attackTile of attackTiles) {
                if (isNotAWall(attackTile.x, attackTile.y)) {
                    const attackSprite = new FullTileElement(PIXI.Texture.WHITE, attackTile.x, attackTile.y);
                    attackSprite.tint = 0x10afa6;
                    createFadingAttack(attackSprite);
                }
                if (isEnemy(attackTile.x, attackTile.y)) {
                    Game.map[attackTile.y][attackTile.x].entity.damage(atk, 0, 0, true);
                }
            }
            this.uses--;
            redrawSlotContents(wielder, "weapon");
            return true;
        } else return false;
    }

    concentrate() {
        if (this.uses < this.maxUses) {
            this.concentration++;
            if (this.concentration >= this.concentrationLimit) {
                this.concentration = 0;
                this.uses = this.maxUses;
            }
        } else return false;
    }
}