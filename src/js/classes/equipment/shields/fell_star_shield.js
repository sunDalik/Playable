import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";

export class FellStarShield extends Shield {
    constructor() {
        super();
        this.texture = Game.resources["src/images/shields/fell_star_shield.png"].texture;
        this.type = SHIELD_TYPE.FELL_STAR_SHIELD;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 5;
        this.uses = this.maxUses;
        this.usedOnThisTurn = false;
        this.name = "The Fell Star Shield";
        this.description = "Radiates beams on block";
        this.rarity = RARITY.A;
    }

    onBlock(source, wielder, directHit) {
        if (!this.usedOnThisTurn) {
            this.usedOnThisTurn = true;
        }
    }

    onNewTurn() {
        this.usedOnThisTurn = false;
    }
}