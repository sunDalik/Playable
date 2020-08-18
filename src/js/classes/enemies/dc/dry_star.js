import {DCEnemiesSpriteSheet} from "../../../loader";
import {Star} from "../fc/star";

export class DryStar extends Star {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["dry_star.png"]) {
        super(tilePositionX, tilePositionY, texture);
    }
}