import {DCEnemiesSpriteSheet} from "../../../loader";
import {Snail} from "../fc/snail";

export class DrySnail extends Snail {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["dry_snail.png"]) {
        super(tilePositionX, tilePositionY, texture);
    }
}