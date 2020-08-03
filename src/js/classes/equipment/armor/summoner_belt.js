import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Minion} from "../minion";
import {Equipment} from "../equipment";

export class SummonerBelt extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["summoner_belt.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.SUMMONER_BELT;
        this.passiveMinionAtk = 0.5;
        this.passiveDef = 0.75;
        this.rarity = RARITY.A;
        this.name = "Summoner's Belt";
        this.description = "Summons cat minions that will deal 1 damage to enemies they touch\n+0.75 defense\n+0.5 minion attack";
        this.minions = [new CatMinion(), new CatMinion()];
    }
}

class CatMinion extends Minion {
    constructor(texture = ArmorSpriteSheet["cat_minion.png"]) {
        super(texture);
        this.stepping = true;
        this.tallModifier -= 2;
        this.setScaleModifier(1.05);
    }
}