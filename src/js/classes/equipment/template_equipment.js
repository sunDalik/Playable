import {EQUIPMENT_TYPE, RARITY} from "../../enums";

export class TemplateEquipment {
    constructor() {
        this.texture = Game.resources["src/images/folder/image.png"].texture;
        this.type = YOUR_TYPE.TYPE;
        this.equipmentType = EQUIPMENT_TYPE.YOUR_TYPE;
        this.name = "Name";
        this.description = "Description";
        this.rarity = RARITY.C;

        //for bag items
        this.amount = 1;

        //for magic
        this.maxUses = 0;
        this.uses = this.maxUses;

        //optional
        this.def = 0;
        this.atk = 0;
        this.nonremoveable = true;
        this.infinite = true;
        this.passive = true;
    }

    //for weapons
    attack(wielder, tileDirX, tileDirY) {
    }

    //for tools
    use(wielder, tileDirX, tileDirY) {
    }

    //for magic
    cast(wielder) {
    }

    //listeners:

    //executes when wielder picks up this item
    onWear(wielder) {
    }

    //executes when wielder drops this item
    onTakeOff(wielder) {
    }

    //executes AFTER enemy turn
    onNewTurn(wielder) {
    }

    //executes when wielder changes his tilePosition (does step or slide)
    onMove(wielder) {
    }

    //executes after wielder attacks (double attacks don't count... or should they?)
    afterAttack(wielder, dirX, dirY) {
    }

    //executes whenever wielder kills an enemy
    onKill(wielder) {
    }

    //executes when the wielder dies
    onDeath(wielder) {
    }

    //executes whenever the wielder is revived with necromancy
    onRevive(wielder) {
    }

    //executes at the start of every new level
    onNextLevel(wielder) {
    }

    //executes whenever wielder receives new equipment (this one included)
    onEquipmentReceive(wielder, equipment) {
    }

    //executes whenever wielder drops any equipment (this one included)
    onEquipmentDrop(player, equipment) {
    }

    //for shields. Executes whenever this shield blocks a damage from some source. Shields should also extend Shield
    onBlock(source, wielder) {
    }
}