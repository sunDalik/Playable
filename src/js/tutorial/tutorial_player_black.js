import {TutorialPlayer} from "./tutorial_player";
import {Knife} from "../classes/equipment/weapons/knife";
import {Z_INDEXES} from "../z_indexing";
import {CommonSpriteSheet} from "../loader";

export class TutorialPlayerBlack extends TutorialPlayer {
    constructor(tilePositionX, tilePositionY, texture = CommonSpriteSheet["player2.png"]) {
        super(tilePositionX, tilePositionY, texture);

        // copy paste from playerBlack
        this.atkMul = 1;
        this.defMul = 0.5;
        this.weapon = new Knife();
        this.setOwnZIndex(Z_INDEXES.PLAYER);
        this.tallModifier = -5;

        this.dead = true;
        this._health = 0;
    }

}