import {Player} from "./player";
import {Z_INDEXES} from "../../z_indexing";
import {Knife} from "../equipment/weapons/knife";
import {Game} from "../../game";

//aka player 2
export class BlackPlayer extends Player {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/player2.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.atkMul = 1;
        this.defMul = 0.5;
        this.weapon = new Knife();
        this.setOwnZIndex(Z_INDEXES.PLAYER);
        this.tallModifier = -5;
    }
}