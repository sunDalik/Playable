import {Game} from "../../../game";
import {RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationClub} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueRightHandPoint} from "../../inanimate_objects/statue";
import {Weapon} from "../weapon";

export class Hammer  extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["hammer.png"];
        this.type = WEAPON_TYPE.HAMMER;
        this.atk = 0.75;
        this.name = "Hammer";
        this.description = "Stuns enemies";
        this.rarity = RARITY.C;
    }

    attack(wielder, dirX, dirY) {
        const attackTileX = wielder.tilePosition.x + dirX;
        const attackTileY = wielder.tilePosition.y + dirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtkWithWeapon(this);
            createWeaponAnimationClub(wielder, this, dirX, dirY, 6, 5, 90, 1);
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            const enemy = Game.map[attackTileY][attackTileX].entity;
            enemy.damage(wielder, atk, dirX, dirY, false);
            enemy.stun++;
            return true;
        } else return false;
    }

    getStatuePlacement() {
        return {
            x: statueRightHandPoint.x - 25,
            y: statueRightHandPoint.y - 80,
            angle: 30,
            scaleModifier: 0.7
        };
    }
}