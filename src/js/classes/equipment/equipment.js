import * as PIXI from "pixi.js";
import {EQUIPMENT_ID, RARITY} from "../../enums";

export class Equipment {
    constructor() {
        this.texture = PIXI.Texture.WHITE;
        this.id = EQUIPMENT_ID.KNIFE;
        this.name = "NAME";
        this.description = "DESCRIPTION";
        this.rarity = RARITY.C;

        // if maxUses <= 0 this means the item is NOT active and cannot gain uses/maxUses increases
        this.uses = this.maxUses = 0;

        // immunity to hazards and bullets in some way
        this.poisonImmunity = false;
        this.fireImmunity = false;
        this.electricityImmunity = false;

        this.atk = 0;

        // give passive bonuses to wielder holding item
        this.passiveAtk = 0;
        this.passiveDef = 0;
        this.passiveMagAtk = 0;

        // magical items get magic bonuses
        this.magical = false;

        // forbid players from taking this item off
        this.nonremoveable = false;
    }

    //executes when wielder picks up this item
    onWear(wielder) {
        if (this.poisonImmunity) wielder.poisonImmunity++;
        if (this.fireImmunity) wielder.fireImmunity++;
        if (this.electricityImmunity) wielder.electricityImmunity++;
        wielder.atkBase += this.passiveAtk;
        wielder.defBase += this.passiveDef;
        wielder.magAtkBase += this.passiveMagAtk;
    }

    //executes when wielder drops this item
    onTakeOff(wielder) {
        if (this.poisonImmunity) wielder.poisonImmunity--;
        if (this.fireImmunity) wielder.fireImmunity--;
        if (this.electricityImmunity) wielder.electricityImmunity--;
        wielder.atkBase -= this.passiveAtk;
        wielder.defBase -= this.passiveDef;
        wielder.magAtkBase -= this.passiveMagAtk;
    }

    //executes AFTER enemy turn
    onNewTurn(wielder) {}

    //executes AFTER wielder changes its tilePosition (does step or slide)
    onMove(wielder, tileStepX, tileStepY) {}

    //executes after wielder attacks (double attacks don't count... or should they?)
    afterAttack(wielder, dirX, dirY) {}

    //executes whenever wielder kills an enemy
    onKill(wielder, enemy) {}

    //executes when the wielder dies
    onDeath(wielder) {}

    //executes whenever the wielder is revived with necromancy
    onRevive(wielder) {}

    //executes at the start of every new level
    onNextLevel(wielder) {}

    //executes whenever wielder receives new equipment (this one included)
    onEquipmentReceive(wielder, equipment) {}

    //executes whenever wielder drops any equipment (this one included)
    onEquipmentDrop(player, equipment) {}

}