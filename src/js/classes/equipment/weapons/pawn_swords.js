import {Game} from "../../../game";
import {RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";

export class PawnSwords extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["pawn_swords.png"];
        this.type = WEAPON_TYPE.PAWN_SWORDS;
        this.atk = 1;
        this.name = "Pawn Swords";
        this.description = "Attacks two diagonal enemies";
        this.rarity = RARITY.C;
    }

    attack(wielder, tileDirX, tileDirY) {
        let attackTiles = [];
        if (tileDirX !== 0)
            attackTiles = [{x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y - 1}];
        else if (tileDirY !== 0)
            attackTiles = [{x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + tileDirY}];

        const enemiesToAttack = [];
        for (const attackTile of attackTiles) {
            if (isEnemy(attackTile.x, attackTile.y) && isLit(attackTile.x, attackTile.y)) {
                enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity);
            }
        }

        if (enemiesToAttack.length === 0) return false;
        createWeaponAnimationStab(wielder, {texture: WeaponsSpriteSheet["pawn_sword_separate.png"]},
            attackTiles[0].x - wielder.tilePosition.x, attackTiles[0].y - wielder.tilePosition.y);
        createWeaponAnimationStab(wielder, {texture: WeaponsSpriteSheet["pawn_sword_separate.png"]},
            attackTiles[1].x - wielder.tilePosition.x, attackTiles[1].y - wielder.tilePosition.y, 6);
        createPlayerAttackTile(attackTiles[0]);
        createPlayerAttackTile(attackTiles[1]);

        const atk = wielder.getAtk(this);
        for (const enemy of enemiesToAttack) {
            enemy.damage(wielder, atk, tileDirX, tileDirY, false, false);
        }
        return true;
    }
}