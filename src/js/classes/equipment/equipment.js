import * as PIXI from "pixi.js";
import {RARITY} from "../../enums";
import {removeObjectFromArray} from "../../utils/basic_utils";

export class Equipment {
    constructor() {
        this.texture = PIXI.Texture.WHITE;
        this.name = "NAME";
        this.description = "DESCRIPTION";
        this.rarity = RARITY.C;

        // if maxUses <= 0 this means the item is NOT active and cannot gain uses/maxUses increases
        this.uses = this.maxUses = 0;

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

        this.onMoveFrameSubscriber = null;
    }

    //executes when wielder picks up this item
    onWear(wielder) {
        if (this.poisonImmunity) wielder.poisonImmunity++;
        if (this.fireImmunity) wielder.fireImmunity++;
        if (this.electricityImmunity) wielder.electricityImmunity++;
        if (this.onMoveFrameSubscriber) {
            wielder.onMoveFrameSubscribers.push(this.onMoveFrameSubscriber);
            this.onMoveFrameSubscriber(wielder);
        }
    }

    //executes when wielder drops this item
    onTakeOff(wielder) {
        if (this.poisonImmunity) wielder.poisonImmunity--;
        if (this.fireImmunity) wielder.fireImmunity--;
        if (this.electricityImmunity) wielder.electricityImmunity--;
        if (this.onMoveFrameSubscriber) {
            removeObjectFromArray(this.onMoveFrameSubscriber, wielder.onMoveFrameSubscribers);
            this.onMoveFrameSubscriber(wielder, true);
        }
    }

    //executes AFTER enemy turn
    onNewTurn(wielder) {}

    //executes AFTER wielder changes its tilePosition (does step or slide)
    onMove(wielder) {}

    //executes after wielder attacks (double attacks don't count... or should they?)
    afterAttack(wielder, dirX, dirY) {}

    //executes whenever wielder kills an enemy
    onKill(wielder) {}

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