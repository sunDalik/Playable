import {Player} from "./player";
import {Z_INDEXES} from "../../z_indexing";
import {Knife} from "../equipment/weapons/knife";
import {CommonSpriteSheet} from "../../loader";
import {Pickaxe} from "../equipment/tools/pickaxe";

//aka player 2
export class BlackPlayer extends Player {
    constructor(tilePositionX, tilePositionY, texture = CommonSpriteSheet["player2.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.atkMul = 1;
        this.defMul = 0.5;
        this.weapon = new Pickaxe();
        this.setOwnZIndex(Z_INDEXES.PLAYER);
        this.tallModifier = -5;
    }
}