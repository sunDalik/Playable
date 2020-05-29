import {Game} from "../../../game";
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class OldBalletShoes extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["old_ballet_shoes.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.type = FOOTWEAR_TYPE.OLD_BALLET_SHOES;
        this.name = "Old Ballet Shoes";
        this.description = "Spiders don't move when you move";
        this.rarity = RARITY.C;
    }

    //not sure if the effect should activate when the wielder has flight...
    //not sure if the effect should activate when moving because of the maiden dagger...
    onMove(wielder) {
        for (const enemy of Game.enemies) {
            if (enemy.visible) {
                if (enemy.spiderLike) {
                    enemy.stun++;
                }
            }
        }
    }
}