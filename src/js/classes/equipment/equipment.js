import * as PIXI from "pixi.js";
import {RARITY} from "../../enums";
import {redrawSlotContents} from "../../drawing/draw_hud";

export class Equipment {
    constructor() {
        this.texture = PIXI.Texture.WHITE;
        this.name = "NAME";
        this.description = "DESCRIPTION";
        this.rarity = RARITY.C;
        this.wielder = null;

        // if maxUses <= 0 this means the item is NOT active and cannot gain uses/maxUses increases
        this._uses = this.maxUses = 0;

        // immunity to hazards and bullets in some way
        this.poisonImmunity = false;
        this.fireImmunity = false;
        this.electricityImmunity = false;

        // give passive attack and defense bonuses
        this.atk = 0;
        this.def = 0;

        // give passive atk bonus to magic and magical weapons
        this.magAtk = 0;

        // magical items get magic bonuses
        this.magical = false;

        // forbid players from taking this item off
        this.nonremoveable = false;
    }

    set uses(value) {
        this._uses = value;
        if (this.wielder) this.wielder.redrawEquipmentSlot(this);
    }

    get uses() {
        return this._uses;
    }

    //executes when wielder picks up this item
    onWear() {
        if (this.poisonImmunity) this.wielder.poisonImmunity++;
        if (this.fireImmunity) this.wielder.fireImmunity++;
        if (this.electricityImmunity) this.wielder.electricityImmunity++;
    }

    //executes when wielder drops this item
    onTakeOff() {
        if (this.poisonImmunity) this.wielder.poisonImmunity--;
        if (this.fireImmunity) this.wielder.fireImmunity--;
        if (this.electricityImmunity) this.wielder.electricityImmunity--;
    }

    //executes AFTER enemy turn
    onNewTurn() {}

    //executes when wielder changes his tilePosition (does step or slide)
    onMove() {}

    //executes after wielder attacks (double attacks don't count... or should they?)
    afterAttack(dirX, dirY) {}

    //executes whenever wielder kills an enemy
    onKill() {}

    //executes when the wielder dies
    onDeath() {}

    //executes whenever the wielder is revived with necromancy
    onRevive() {}

    //executes at the start of every new level
    onNextLevel() {}

    //executes whenever wielder receives new equipment (this one included)
    onEquipmentReceive(wielder, equipment) {}

    //executes whenever wielder drops any equipment (this one included)
    onEquipmentDrop(player, equipment) {}

}