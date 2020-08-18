import {DCEnemiesSpriteSheet} from "../../../loader";
import {Frog} from "../fc/frog";

export class DryFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["dry_frog.png"]) {
        super(tilePositionX, tilePositionY, texture);
    }
}