import {Game} from "../../../game";
import {RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueLeftHandPoint} from "../../inanimate_objects/statue";
import {Weapon} from "../weapon";

export class Knife  extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["knife.png"];
        this.type = WEAPON_TYPE.KNIFE;
        this.atk = 1;
        this.name = "Knife";
        this.description = "Attack 1\nClose combat only";
        this.rarity = RARITY.C;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtkWithWeapon(this);
            createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 4, 35, 1);
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            Game.map[attackTileY][attackTileX].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else return false;
    }

    getStatuePlacement() {
        return {
            x: statueLeftHandPoint.x + 30,
            y: statueLeftHandPoint.y - 40,
            angle: 0,
            scaleModifier: 0.55,
            mirrorX: true
        };
    }
}