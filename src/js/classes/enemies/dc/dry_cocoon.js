import {DCEnemiesSpriteSheet} from "../../../loader";
import {Cocoon} from "../fc/cocoon";

export class DryCocoon extends Cocoon {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["dry_cocoon.png"]) {
        super(tilePositionX, tilePositionY, texture);
    }
}