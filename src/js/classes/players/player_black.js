import {Player} from "./player";
import {CommonSpriteSheet} from "../../loader";
import {Z_INDEXES} from "../../z_indexing";
import {Knife} from "../equipment/weapons/knife";
import {Spikes} from "../equipment/magic/spikes";
import {VampireSpikes} from "../equipment/magic/vampire_spikes";
import {InfernalSpikes} from "../equipment/magic/infernal_spikes";

//aka player 2
export class BlackPlayer extends Player {
    constructor(tilePositionX, tilePositionY, texture = CommonSpriteSheet["player2.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.atkMul = 1;
        this.defMul = 0.5;
        this.weapon = new Knife();
        this.magic1 = new Spikes();
        this.magic2 = new VampireSpikes();
        this.magic3 = new InfernalSpikes();
        this.setOwnZIndex(Z_INDEXES.PLAYER);
        this.tallModifier = -5;
    }
}