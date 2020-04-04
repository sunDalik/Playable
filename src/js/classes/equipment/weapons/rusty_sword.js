import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {redrawSlotContents} from "../../../drawing/draw_hud";
import {WeaponsSpriteSheet} from "../../../loader";

export class RustySword {
    constructor() {
        this.texture = WeaponsSpriteSheet["rusty_sword.png"];
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
            createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY);
            const atk = wielder.getAtkWithWeapon(this);
            const enemiesToAttack = [];
            for (const attackTile of attackTiles) {
                createPlayerAttackTile(attackTile);
                if (isEnemy(attackTile.x, attackTile.y) && isLit(attackTile.x, attackTile.y)) {
                    enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity);
                }
            }
            for (const enemy of enemiesToAttack) {
                enemy.damage(wielder, atk, tileDirX, tileDirY, false);
            }
            this.uses--;
            if (this.uses <= 0) this.texture = WeaponsSpriteSheet["rusty_sword_broken.png"];
            redrawSlotContents(wielder, wielder.getPropertyNameOfItem(this));
            return true;
        } else return false;
    }

    getStatuePlacement() {
        return {x: 0, y: 0, angle: 0, scaleModifier: 0};
    }
}