import {Player} from "./player";
import {CommonSpriteSheet} from "../../loader";
import {Z_INDEXES} from "../../z_indexing";
import {Knife} from "../equipment/weapons/knife";
import {DarkBoots} from "../equipment/footwear/dark";
import {swapEquipmentWithPlayer} from "../../game_logic";

//aka player 2
export class BlackPlayer extends Player {
    constructor(tilePositionX, tilePositionY, texture = CommonSpriteSheet["player2.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.atkMul = 1;
        this.defMul = 0.5;
        this.weapon = new Knife();
        this.setOwnZIndex(Z_INDEXES.PLAYER);
        this.tallModifier = -5;
        swapEquipmentWithPlayer(this, new DarkBoots())
    }
}