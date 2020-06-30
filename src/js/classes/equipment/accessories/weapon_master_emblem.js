import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {drawStatsForPlayer} from "../../../drawing/draw_hud";

export class WeaponMasterEmblem extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["weapon_master_emblem.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.WEAPON_MASTER_EMBLEM;
        this.lastWeaponId = -1;
        this.bonusAtk = 1;
        this.grantedBuff = false;
        this.name = "Weapon Master Emblem";
        this.description = "Switching weapons is a free action now\nWhenever you switch to a different weapon (not -last-) you get +1 atk for your next attack. Attacking resets this buff and marks current weapon as the -last- weapon";
        this.rarity = RARITY.B;
    }

    onTakeOff(wielder) {
        super.onTakeOff(wielder);
        this.revokeBuff(wielder);
    }

    onWeaponSwitch(wielder) {
        if (wielder.weapon && wielder.weapon.id !== this.lastWeaponId) {
            this.grantBuff(wielder);
        } else {
            this.revokeBuff(wielder);
        }
    }

    afterAttack(wielder, dirX, dirY) {
        this.revokeBuff(wielder);
        if (wielder.weapon) this.lastWeaponId = wielder.weapon.id;
    }

    grantBuff(wielder) {
        if (!this.grantedBuff) {
            wielder.atkBase += this.bonusAtk;
            this.grantedBuff = true;
            drawStatsForPlayer(wielder);
        }
    }

    revokeBuff(wielder) {
        if (this.grantedBuff) {
            wielder.atkBase -= this.bonusAtk;
            this.grantedBuff = false;
            drawStatsForPlayer(wielder);
        }
    }
}