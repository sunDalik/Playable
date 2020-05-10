import {Game} from "../../../game";
import {RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueRightHandPoint} from "../../inanimate_objects/statue";
import {Weapon} from "../weapon";

export class RustySword extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["rusty_sword.png"];
        this.type = WEAPON_TYPE.RUSTY_SWORD;
        this.atk = 2;
        this.uses = this.maxUses = 15;
        this.name = "Rusty Sword";
        this.description = `Attack 2\nBreaks after ${this.maxUses} uses`;
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
            return true;
        } else return false;
    }

    getStatuePlacement() {
        return {x: statueRightHandPoint.x - 24, y: statueRightHandPoint.y - 100, angle: 30, scaleModifier: 0.9};
    }
}