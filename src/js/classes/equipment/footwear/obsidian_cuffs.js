import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class ObsidianCuffs extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["obsidian_cuffs.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.id = EQUIPMENT_ID.OBSIDIAN_CUFFS;
        this.name = "Obsidian Cuffs";
        this.description = "Immunity to fire hazards";
        this.rarity = RARITY.C;
        this.fireImmunity = true;
    }
}