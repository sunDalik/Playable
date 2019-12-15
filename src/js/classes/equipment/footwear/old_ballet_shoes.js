import {Game} from "../../../game"
import {ENEMY_TYPE, EQUIPMENT_TYPE, FOOTWEAR_TYPE} from "../../../enums";

export class OldBalletShoes {
    constructor() {
        this.texture = Game.resources["src/images/footwear/old_ballet_shoes.png"].texture;
        this.type = FOOTWEAR_TYPE.OLD_BALLET_SHOES;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.name = "Old Ballet Shoes";
        this.description = "They are covered in web";
    }

    //not sure if the effect should activate when the wielder has flight...
    //not sure if the effect should activate when the following player moves...
    //not sure if the effect should activate when moving because of the maiden dagger...
    onMove(wielder) {
        for (const enemy of Game.enemies) {
            if (!enemy.dead) {
                if (enemy.type === ENEMY_TYPE.SPIDER || enemy.type === ENEMY_TYPE.SPIDER_GRAY
                    || enemy.type === ENEMY_TYPE.SPIDER_GREEN || enemy.type === ENEMY_TYPE.SPIDER_RED) {
                    enemy.stun++;
                }
            }
        }
    }
}