import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createFadingAttack} from "../../../animations";
import * as PIXI from "pixi.js";
import {TileElement} from "../../tile_elements/tile_element";
import {WeaponsSpriteSheet} from "../../../loader";
import {MagicBook} from "./magic_book";

export class BookOfFlames extends MagicBook {
    constructor() {
        super(WeaponsSpriteSheet["book_of_flames.png"]);
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.type = WEAPON_TYPE.BOOK_OF_FLAMES;
        this.atk = 2;
        this.maxUses = 2;
        this.uses = this.maxUses;
        this.focusNeeded = 3;
        this.primaryColor = 0x10afa6;
        this.name = "Book of Flames";
        this.description = "Magical wonder";
        this.rarity = RARITY.S;
    }

    attack(wielder, dirX, dirY) {
        if (this.uses <= 0) return false;
        let attackTiles = [];
        if (dirX !== 0) {
            attackTiles = [{x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x + dirX * 2, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + dirX * 3, y: wielder.tilePosition.y}];
        } else if (dirY !== 0) {
            attackTiles = [{x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + dirY},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY * 2},
                {x: wielder.tilePosition.x, y: wielder.tilePosition.y + dirY * 3}];
        }
        if (attackTiles.length !== 5) return false;
        //maybe ranged attacks should be blocked by chests and statues? who knows...
        if (isNotAWall(attackTiles[0].x, attackTiles[0].y) &&
            (isEnemy(attackTiles[0].x, attackTiles[0].y)
                || isEnemy(attackTiles[1].x, attackTiles[1].y)
                || isEnemy(attackTiles[2].x, attackTiles[2].y)
                || isEnemy(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[3].x, attackTiles[3].y)
                || isEnemy(attackTiles[4].x, attackTiles[4].y) && isNotAWall(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[4].x, attackTiles[4].y))) {

            const atk = wielder.getAtkWithWeapon(this);
            const enemiesToAttack = [];
            for (let i = 0; i < attackTiles.length; i++) {
                if (i === 3) {
                    if (!isLit(attackTiles[3].x, attackTiles[3].y)) continue;
                } else if (i === 4) {
                    if (!(isNotAWall(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[3].x, attackTiles[3].y) && isLit(attackTiles[4].x, attackTiles[4].y))) continue;
                }
                const attackTile = attackTiles[i];
                if (isNotAWall(attackTile.x, attackTile.y)) {
                    const attackSprite = new TileElement(PIXI.Texture.WHITE, attackTile.x, attackTile.y);
                    attackSprite.tint = 0x10afa6;
                    createFadingAttack(attackSprite);
                }
                if (isEnemy(attackTile.x, attackTile.y)) {
                    enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity)
                }
            }

            for (const enemy of enemiesToAttack) {
                enemy.damage(wielder, atk, dirX, dirY, this.magical);
            }
            this.uses--;
            this.updateTexture(wielder);
            this.holdBookAnimation(wielder, dirX, dirY);
            return true;
        } else return false;
    }
}