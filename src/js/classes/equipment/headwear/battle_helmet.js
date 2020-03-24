import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY} from "../../../enums";
import {HeadWearSpriteSheet} from "../../../loader";

export class BattleHelmet {
    constructor() {
        this.texture = HeadWearSpriteSheet["battle_helmet.pngz"];
        this.type = HEAD_TYPE.BATTLE_HELMET;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.name = "Battle Helmet";
        this.description = "+0.5 defense";
        this.rarity = RARITY.B;
        this.def = 0.5;
    }
}