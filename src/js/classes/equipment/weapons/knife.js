import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationSwing} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";

export class Knife  extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["knife.png"];
        this.id = EQUIPMENT_ID.KNIFE;
        this.atk = 1;
        this.name = "Knife";
        this.description = "Attack 1\nClose combat only";
        this.rarity = RARITY.C;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        if (isEnemy(attackTileX, attackTileY)) {
            const atk = wielder.getAtk(this);
            createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 4, 35, 1);
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            Game.map[attackTileY][attackTileX].entity.damage(wielder, atk, tileDirX, tileDirY);
            return true;
        } else return false;
    }
}