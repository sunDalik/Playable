import {ENEMY_TYPE} from "../../../enums/enums";
import {DTEnemiesSpriteSheet} from "../../../loader";
import {MageEnemy} from "../mage_enemy";

export class LostMage extends MageEnemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["lost_mage.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.name = "Lost Mage";
        this.type = ENEMY_TYPE.LOST_MAGE;

        this.neutralTexture = texture;
        this.preparingTexture = DTEnemiesSpriteSheet["lost_mage_prepare.png"];
        this.castingTexture = DTEnemiesSpriteSheet["lost_mage_cast.png"];
    }

}