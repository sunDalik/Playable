import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {isEnemy, isLit} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationClub} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {tileDistance} from "../../../utils/game_utils";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class GiantSword extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["giant_sword.png"];
        this.id = EQUIPMENT_ID.GIANT_SWORD;
        this.atk = 1;
        this.name = "Giant Sword";
        this.description = "Piercing weapon that attacks both enemies in range 2\nAttack 1 at range 2\nAttack 1.5 at range 1";
        this.rarity = RARITY.A;
    }

    attack(wielder, dirX, dirY) {
        const enemies = [];
        const tiles = [{x: wielder.tilePosition.x + dirX, y: wielder.tilePosition.y + dirY},
            {x: wielder.tilePosition.x + dirX * 2, y: wielder.tilePosition.y + dirY * 2}];
        for (const tile of tiles) {
            if (isEnemy(tile.x, tile.y) && isLit(tile.x, tile.y)) {
                enemies.push(Game.map[tile.y][tile.x].entity);
            }
        }
        if (enemies.length === 0) return false;

        for (const tile of tiles) {
            createPlayerAttackTile(tile, 12);
        }
        this.damageEnemies(enemies, wielder, 0, dirX, dirY, DAMAGE_TYPE.PHYSICAL_WEAPON, enemies.map(e => {
            return {enemy: e, atk: this.getAtk(wielder, e)};
        }));
        createWeaponAnimationClub(wielder, {texture: WeaponsSpriteSheet["giant_sword_projectile.png"]}, dirX, dirY, 7, 6, 90, 2);
        return true;
    }

    getAtk(wielder, enemy) {
        if (tileDistance(enemy, wielder) === 1) return wielder.getAtk(this, this.atk + 0.5);
        else return wielder.getAtk(this);
    }
}