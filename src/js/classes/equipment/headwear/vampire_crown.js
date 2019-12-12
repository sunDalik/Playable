import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE} from "../../../enums";

export class VampireCrown {
    constructor() {
        this.texture = Game.resources["src/images/headwear/vampire_crown.png"].texture;
        this.type = HEAD_TYPE.VAMPIRE_CROWN;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.killsNeeded = 10;
        this.killsMade = 0;
        this.healAmount = 0.5;
        this.name = "Vampire Crown";
        this.description = "Kills heal";
    }

    onKill(player) {
        this.killsMade++;
        if (this.killsMade >= this.killsNeeded) {
            player.heal(this.healAmount);
            this.killsMade = 0;
        }
    }
}