import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createFadingAttack, createFadingText} from "../../../animations";
import {FullTileElement} from "../../tile_elements/full_tile_element";
import * as PIXI from "pixi.js";
import {redrawSlotContents} from "../../../drawing/draw_hud";

export class BookOfFlames {
    constructor() {
        this.texture = Game.resources["src/images/weapons/book_of_flames.png"].texture;
        this.type = WEAPON_TYPE.BOOK_OF_FLAMES;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.magical = true;
        this.atk = 2;
        this.maxUses = 2;
        this.uses = this.maxUses;
        this.concentrationLimit = 3;
        this.concentration = 0;
        this.name = "Book of Flames";
        this.description = "Magical wonder";
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
                    const attackSprite = new FullTileElement(PIXI.Texture.WHITE, attackTile.x, attackTile.y);
                    attackSprite.tint = 0x10afa6;
                    createFadingAttack(attackSprite);
                }
                if (isEnemy(attackTile.x, attackTile.y)) {
                    enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity)
                }
            }

            for (const enemy of enemiesToAttack) {
                enemy.damage(wielder, atk, 0, 0, this.magical);
            }
            this.uses--;
            this.updateTexture();
            redrawSlotContents(wielder, wielder.getPropertyNameOfItem(this));
            return true;
        } else return false;
    }

    concentrate(wielder, createText = true) {
        if (this.uses < this.maxUses) {
            this.concentration++;
            this.concentratedThisTurn = true;
            if (this.concentration >= this.concentrationLimit) {
                this.concentration = 0;
                this.uses = this.maxUses;
                this.updateTexture();
                if (createText) createFadingText("Clear mind!", wielder.position.x, wielder.position.y);
            } else {
                this.updateTexture();
                if (createText) createFadingText("Concentrating", wielder.position.x, wielder.position.y);
            }
            redrawSlotContents(wielder, wielder.getPropertyNameOfItem(this));
            return true;
        } else return false;
    }

    updateTexture() {
        if (this.uses === 0) {
            this.texture = Game.resources[`src/images/weapons/book_of_flames_exhausted_${this.concentration}.png`].texture;
        } else if (this.uses < this.maxUses) {
            this.texture = Game.resources[`src/images/weapons/book_of_flames_used_${this.concentration}.png`].texture;
        } else this.texture = Game.resources["src/images/weapons/book_of_flames.png"].texture;
    }

    onNewTurn(wielder) {
        if (!this.concentratedThisTurn && this.uses < this.maxUses) {
            this.concentration = 0;
            this.updateTexture(wielder);
            redrawSlotContents(wielder, wielder.getPropertyNameOfItem(this));
        }
        this.concentratedThisTurn = false;
    }
}