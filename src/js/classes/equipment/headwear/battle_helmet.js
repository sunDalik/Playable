import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY} from "../../../enums";

export class BattleHelmet {
    constructor() {
        this.texture = Game.resources["src/images/headwear/battle_helmet.png"].texture;
        this.type = HEAD_TYPE.BATTLE_HELMET;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.name = "Battle Helmet";
        this.description = "+0.5 defense";
        this.rarity = RARITY.B;
        this.def = 0.5;
    }
}