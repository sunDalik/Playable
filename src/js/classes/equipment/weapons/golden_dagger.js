import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {dropItem} from "../../../game_logic";
import {Bomb} from "../bag/bomb";
import {Key} from "../key";
import {HealingPotion} from "../bag/healing_potion";

export class GoldenDagger extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["golden_dagger.png"];
        this.id = EQUIPMENT_ID.GOLDEN_DAGGER;
        this.atk = 1;
        this.name = "Golden Dagger";
        this.description = "Attack 1, Range 1\nKilling an enemy with this weapon gives it additional 30% chance to drop a healing potion, a bomb or a key";
        this.rarity = RARITY.B;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtk(this);
            createWeaponAnimationStab(wielder, this, tileDirX, tileDirY, 7, 1, 1);
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            const enemy = Game.map[attackTileY][attackTileX].entity;
            this.damageEnemies([enemy], wielder, atk, tileDirX, tileDirY);
            if (enemy.dead && !enemy.isMinion) {
                if (Math.random() < 0.3) {
                    const roll = Math.random();
                    if (roll < 0.15) {
                        dropItem(new HealingPotion(), enemy.tilePosition.x, enemy.tilePosition.y);
                    } else if (roll < 0.35) {
                        dropItem(new Bomb(), enemy.tilePosition.x, enemy.tilePosition.y);
                    } else {
                        dropItem(new Key(), enemy.tilePosition.x, enemy.tilePosition.y);
                    }
                }
            }
            return true;
        } else return false;
    }
}