import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Frog} from "./frog";
import {addHazardOrRefresh} from "../../utils/map_utils";
import {FireHazard} from "../hazards/fire_hazard";

export class FireFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_fire.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_FIRE;
        this.atk = 1;
    }

    spitHazard(tileX, tileY) {
        addHazardOrRefresh(new FireHazard(tileX, tileY));
    }
}