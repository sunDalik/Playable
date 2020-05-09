import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";
import {isEnemy, isLit} from "../../../map_checks";
import {Game} from "../../../game";
import {TileElement} from "../../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {createFadingAttack} from "../../../animations";

export class BookOfIce extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_ice.png"]);
        this.type = WEAPON_TYPE.BOOK_OF_ICE;
        this.atk = 1;
        this.uses = this.maxUses = 3;
        this.focusTime = 3;
        this.primaryColor = 0x6696d7;
        this.holdTime = 20;
        this.name = "Book of Ice";
        this.description = "Cast a stunning ice bolt in range 2";
        this.rarity = RARITY.B;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        const enemy = this.getEnemy(wielder, dirX, dirY);
        if (enemy === null) return false;
        const atk = wielder.getAtkWithWeapon(this);
        const tile = {x: enemy.tilePosition.x, y: enemy.tilePosition.y};
        enemy.damage(wielder, atk, dirX, dirY, this.magical);
        enemy.stun += 4;
        const attackSprite = new TileElement(PIXI.Texture.WHITE, tile.x, tile.y, true);
        attackSprite.tint = this.primaryColor;
        createFadingAttack(attackSprite);
        this.uses--;
        this.updateTexture(wielder);
        this.holdBookAnimation(wielder, dirX, dirY);
        return true;
    }

    //todo account for walls
    getEnemy(wielder, dirX, dirY) {
        for (let i = 1; i <= 2; i++) {
            const tile = {x: wielder.tilePosition.x + dirX * i, y: wielder.tilePosition.y + dirY * i};
            if (isEnemy(tile.x, tile.y) && isLit(tile.x, tile.y)) return Game.map[tile.y][tile.x].entity;
        }
        return null;
    }
}