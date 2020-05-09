import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {isAnyWall, isEnemy, isLit} from "../../../map_checks";
import {TileElement} from "../../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {createFadingAttack} from "../../../animations";
import {Game} from "../../../game";

export class BookOfWebs extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_webs.png"]);
        this.type = WEAPON_TYPE.BOOK_OF_WEBS;
        this.atk = 2;
        this.uses = this.maxUses = 1;
        this.focusTime = 3;
        this.primaryColor = 0x3f3f3f;
        this.holdTime = 20;
        this.name = "Book of Webs";
        this.description = "Cast a single huge web";
        this.rarity = RARITY.A;
        this.range = 6;
        this.diagonalRange = 4;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        const enemies = [];
        const tiles = this.getTiles(wielder, dirX, dirY);
        for (const tile of tiles) {
            if (isEnemy(tile.x, tile.y)) {
                enemies.push(Game.map[tile.y][tile.x].entity);
            }
        }
        if (enemies.length === 0) return false;
        const atk = wielder.getAtkWithWeapon(this);
        for (const enemy of enemies) {
            enemy.damage(wielder, atk, dirX, dirY, this.magical);
        }
        for (const tile of tiles) {
            const attackSprite = new TileElement(PIXI.Texture.WHITE, tile.x, tile.y, true);
            attackSprite.tint = this.primaryColor;
            createFadingAttack(attackSprite);
        }
        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
    }

    getTiles(wielder, dirX, dirY) {
        const tiles = [];
        for (let r = 1; r <= this.range; r++) {
            const tile = {x: wielder.tilePosition.x + dirX * r, y: wielder.tilePosition.y + dirY * r};
            if (isAnyWall(tile.x, tile.y) || !isLit(tile.x, tile.y)) break;
            tiles.push(tile);
        }
        for (let r = 1; r <= this.diagonalRange; r++) {
            const tile = dirX !== 0 ? {x: wielder.tilePosition.x + dirX * r, y: wielder.tilePosition.y + r}
                : {x: wielder.tilePosition.x + r, y: wielder.tilePosition.y + dirY * r};
            if (isAnyWall(tile.x, tile.y) || !isLit(tile.x, tile.y)) break;
            tiles.push(tile);
        }
        for (let r = 1; r <= this.diagonalRange; r++) {
            const tile = dirX !== 0 ? {x: wielder.tilePosition.x + dirX * r, y: wielder.tilePosition.y - r}
                : {x: wielder.tilePosition.x - r, y: wielder.tilePosition.y + dirY * r};
            if (isAnyWall(tile.x, tile.y) || !isLit(tile.x, tile.y)) break;
            tiles.push(tile);
        }
        return tiles;
    }
}