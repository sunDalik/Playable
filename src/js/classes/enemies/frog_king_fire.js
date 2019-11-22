import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {KingFrog} from "./frog_king";
import {addHazardOrRefresh} from "../../utils/map_utils";
import {FireHazard} from "../hazards/fire_hazard";

export class KingFireFrog extends KingFrog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_king_fire.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_KING_FIRE;
        this.atk = 1.25;
    }

    spitHazard(tileX, tileY) {
        addHazardOrRefresh(new FireHazard(tileX, tileY));
    }
}