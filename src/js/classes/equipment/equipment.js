import * as PIXI from "pixi.js";
import {EQUIPMENT_ID, RARITY} from "../../enums/enums";
import {ENCHANTMENT_TYPE} from "../../enums/enchantments";
import {Game} from "../../game";

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
        this.bombImmunity = false;

        this.atk = 0;

        // give passive bonuses to wielder holding item
        this.passiveAtk = 0;
        this.passiveDef = 0;
        this.passiveMagAtk = 0;
        this.passiveMinionAtk = 0;

        // magical items get magic bonuses
        this.magical = false;

        // forbid players from taking this item off
        this.nonremoveable = false;

        this.enchantment = ENCHANTMENT_TYPE.NONE;

        //every equipment can have its own minions
        this.minions = [];
    }

    //executes when wielder picks up this item
    onWear(wielder) {
        if (this.poisonImmunity) wielder.poisonImmunity++;
        if (this.fireImmunity) wielder.fireImmunity++;
        if (this.electricityImmunity) wielder.electricityImmunity++;
        if (this.bombImmunity) wielder.bombImmunity++;
        wielder.atkBase += this.passiveAtk;
        wielder.defBase += this.passiveDef;
        wielder.magAtkBase += this.passiveMagAtk;
        wielder.minionAtkBase += this.passiveMinionAtk;

        if (this.enchantment === ENCHANTMENT_TYPE.CURSED) wielder.addHealthContainers(1);

        for (const minion of this.minions) {
            minion.activate(wielder);
        }
    }

    //executes when wielder drops this item
    onTakeOff(wielder) {
        if (this.poisonImmunity) wielder.poisonImmunity--;
        if (this.fireImmunity) wielder.fireImmunity--;
        if (this.electricityImmunity) wielder.electricityImmunity--;
        if (this.bombImmunity) wielder.bombImmunity--;
        wielder.atkBase -= this.passiveAtk;
        wielder.defBase -= this.passiveDef;
        wielder.magAtkBase -= this.passiveMagAtk;
        wielder.minionAtkBase -= this.passiveMinionAtk;

        for (const minion of this.minions) {
            minion.deactivate();
        }
    }

    //executes BEFORE enemy turn
    onPlayerTurnEnd(wielder) {
        for (const minion of this.minions) {
            minion.attack(this);
        }
    }

    //executes AFTER enemy turn
    onNewTurn(wielder) {
        for (const minion of this.minions) {
            minion.attack(this);
            minion.resetAttackedEnemies();
        }
    }

    //executes AFTER wielder changes its tilePosition (does step or slide)
    onMove(wielder, tileStepX, tileStepY) {
        for (const minion of this.minions) {
            //minion.attack();
            minion.move();
        }
    }

    //executes after wielder attacks (double attacks don't count... or should they?)
    afterAttack(wielder, dirX, dirY) {}

    //executes whenever wielder kills an enemy
    onKill(wielder, enemy) {}

    //executes when the wielder dies
    onDeath(wielder) {
        for (const minion of this.minions) {
            minion.deactivate();
        }
    }

    //executes whenever the wielder is revived with necromancy
    onRevive(wielder) {
        for (const minion of this.minions) {
            minion.activate(wielder);
        }
    }

    //executes at the start of every new level if the wielder is NOT DEAD
    onNextLevel(wielder) {
        for (const minion of this.minions) {
            Game.world.addChild(minion);
            minion.correctTilePosition();
        }
    }

    //executes whenever wielder receives new equipment (this one included)
    onEquipmentReceive(wielder, equipment) {}

    //executes whenever wielder drops any equipment (this one included)
    onEquipmentDrop(player, equipment) {}

}