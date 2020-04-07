import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createFadingAttack, createFadingText} from "../../../animations";
import * as PIXI from "pixi.js";
import {redrawSlotContents} from "../../../drawing/draw_hud";
import {TileElement} from "../../tile_elements/tile_element";
import {randomChoice} from "../../../utils/random_utils";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueLeftHandPoint} from "../../inanimate_objects/statue";
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

    focus(wielder, createText = true) {
        if (this.uses < this.maxUses) {
            this.currentFocus++;
            this.holdBookAnimation(wielder, 1, 0);
            this.focusedThisTurn = true;
            const fontSize = Game.TILESIZE / 65 * 22;
            if (this.currentFocus >= this.focusNeeded) {
                this.currentFocus = 0;
                this.uses = this.maxUses;
                this.updateTexture(wielder);
                if (createText) createFadingText("Clear mind!", wielder.position.x, wielder.position.y, fontSize, 30);
            } else {
                this.updateTexture(wielder);
                if (createText) createFadingText("Focus", wielder.position.x, wielder.position.y, fontSize * ((this.currentFocus + 1) / this.focusNeeded), 30);
            }
            return true;
        } else return false;
    }

    onNewTurn(wielder) {
        if (!this.focusedThisTurn && this.uses < this.maxUses && this.currentFocus > 0) {
            this.currentFocus = 0;
            this.updateTexture(wielder);
        }
        this.focusedThisTurn = false;
    }

    holdBookAnimation(wielder, dirX, dirY) {
        const offsetMod = 0.3;
        const offsetX = dirX !== 0 ? dirX * offsetMod : randomChoice([offsetMod, -offsetMod]);
        const bookSprite = new TileElement(WeaponsSpriteSheet["book_of_flames.png"], 0, 0);
        bookSprite.position.set(wielder.getTilePositionX() + offsetX * Game.TILESIZE, wielder.getTilePositionY());
        Game.world.addChild(bookSprite);
        wielder.animationSubSprites.push(bookSprite);
        bookSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        bookSprite.scaleModifier = 0.85;
        bookSprite.fitToTile();
        if (Math.sign(offsetX) === -1) bookSprite.scale.x *= -1;

        const animationTime = 20;
        let counter = 0;
        const animation = delta => {
            counter += delta;
            if (counter >= animationTime) {
                Game.world.removeChild(bookSprite);
                Game.app.ticker.remove(animation);
            }
        };

        wielder.animation = animation;
        Game.app.ticker.add(animation);
    }

    getStatuePlacement() {
        return {
            x: statueLeftHandPoint.x + 15,
            y: statueLeftHandPoint.y + 20,
            angle: 20,
            scaleModifier: 0.60,
            texture: this.defaultTexture
        };
    }
}