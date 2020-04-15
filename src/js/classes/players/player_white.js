import {Player} from "./player";
import {CommonSpriteSheet} from "../../loader";
import {Spear} from "../equipment/weapons/spear";
import {BasicArmor} from "../equipment/armor/basic";
import {Z_INDEXES} from "../../z_indexing";
import {Game} from "../../game";

//aka player 1
export class WhitePlayer extends Player {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/player.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.setStats(0, 0.5, 0, 1.00);
        this.weapon = new Spear();
        this.armor = new BasicArmor();
        this.setOwnZIndex(Z_INDEXES.PLAYER_PRIMARY);
        this.tallModifier = 5;
    }
}