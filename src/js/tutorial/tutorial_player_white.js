import {TutorialPlayer} from "./tutorial_player";
import {Spear} from "../classes/equipment/weapons/spear";
import {swapEquipmentWithPlayer} from "../game_logic";
import {LeatherArmor} from "../classes/equipment/armor/leather";
import {Z_INDEXES} from "../z_indexing";
import {CommonSpriteSheet} from "../loader";

export class TutorialPlayerWhite extends TutorialPlayer {
    constructor(tilePositionX, tilePositionY, texture = CommonSpriteSheet["player.png"]) {
        super(tilePositionX, tilePositionY, texture);

        // copy paste from whitePlayer
        this.atkMul = 0.5;
        this.defMul = 1;
        this.weapon = new Spear();
        swapEquipmentWithPlayer(this, new LeatherArmor(), false);
        this.setOwnZIndex(Z_INDEXES.PLAYER_PRIMARY);
        this.tallModifier = 5;
    }
}