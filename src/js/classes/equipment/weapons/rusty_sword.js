import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {createFadingAttack} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {redrawSlotContents} from "../../../drawing/draw_hud";

export class RustySword {
    constructor() {
        this.texture = Game.resources["src/images/weapons/rusty_sword.png"].texture;
        this.type = WEAPON_TYPE.RUSTY_SWORD;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 2;
        this.maxUses = 15;
        this.uses = this.maxUses;
        this.name = "Rusty Sword";
        this.description = "Powerful, but breakable";
        this.rarity = RARITY.UNIQUE;
    }

    attack(wielder, tileDirX, tileDirY) {
        if (this.uses <= 0) return false;
        let attackTiles;
        if (tileDirX !== 0) {
            attackTiles = [{x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y - 1},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + 1}];
        } else {
            attackTiles = [{x: wielder.tilePosition.x, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + tileDirY}];
        }

        if (isEnemy(attackTiles[0].x, attackTiles[0].y)
            || isEnemy(attackTiles[1].x, attackTiles[1].y) && isLit(attackTiles[1].x, attackTiles[1].y)
            || isEnemy(attackTiles[2].x, attackTiles[2].y) && isLit(attackTiles[2].x, attackTiles[2].y)) {
            this.createWeaponAnimation(wielder, tileDirX, tileDirY);
            const atk = wielder.getAtkWithWeapon(this);
            const enemiesToAttack = [];
            for (const attackTile of attackTiles) {
                if (isNotAWall(attackTile.x, attackTile.y)) {
                    const fadingTile = new TileElement(PIXI.Texture.WHITE, attackTile.x, attackTile.y);
                    fadingTile.alpha = 0.5;
                    createFadingAttack(fadingTile, 8);
                }
                if (isEnemy(attackTile.x, attackTile.y) && isLit(attackTile.x, attackTile.y)) {
                    enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity);
                }
            }
            for (const enemy of enemiesToAttack) {
                enemy.damage(wielder, atk, tileDirX, tileDirY, false);
            }
            this.uses--;
            if (this.uses <= 0) this.texture = Game.resources["src/images/weapons/rusty_sword_broken.png"].texture;
            redrawSlotContents(wielder, wielder.getPropertyNameOfItem(this));
            return true;
        } else return false;
    }

    createWeaponAnimation(wielder, dirX, dirY) {
        const sword = new TileElement(this.texture, wielder.tilePosition.x, wielder.tilePosition.y);
        Game.world.addChild(sword);
        sword.zIndex = Game.primaryPlayer.zIndex + 1;
        sword.scaleModifier = 1.1;
        sword.fitToTile();
        sword.anchor.set(1, 1);
        let endChange;
        // the picture is directed to the top left!!
        if (dirX === 1) {
            if (Math.random() < 0.5) {
                sword.angle = 90;
                endChange = 90;
            } else {
                sword.angle = 180;
                endChange = -90;
            }
        } else if (dirX === -1) {
            if (Math.random() < 0.5) {
                sword.angle = 0;
                endChange = -90;
            } else {
                sword.angle = -90;
                endChange = 90;
            }
        } else if (dirY === 1) {
            if (Math.random() < 0.5) {
                sword.angle = -90;
                endChange = -90;
            } else {
                sword.angle = 180;
                endChange = 90;
            }
        } else if (dirY === -1) {
            if (Math.random() < 0.5) {
                sword.angle = 0;
                endChange = 90;
            } else {
                sword.angle = 90;
                endChange = -90;
            }
        }

        const animationTime = 4;
        const startStayTime = 1;
        const endStayTime = 1;
        const startVal = sword.angle;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter >= startStayTime && counter < animationTime + startStayTime) {
                sword.angle = startVal + endChange * (counter - startStayTime) / animationTime;
            }
            if (counter >= startStayTime + animationTime + endStayTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(sword);
            }
        };
        wielder.animation = animation;
        Game.app.ticker.add(animation);
    }
}