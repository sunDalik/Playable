import {Enemy} from "../enemy";

export class Boss extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.boss = true;
    }
}