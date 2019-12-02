import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Frog} from "./frog";
import {addHazardToWorld} from "../../game_logic";
import {FireHazard} from "../hazards/fire";
import {getPlayerOnTile} from "../../map_checks";

export class FireFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_fire.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_FIRE;
        this.atk = 1;
    }

    attackPlayer(tileX, tileY) {
        let player = getPlayerOnTile(tileX, tileY);
        if (player) player.damage(this.atk, this, false);
    }

    spitHazard(tileX, tileY) {
        addHazardToWorld(new FireHazard(tileX, tileY));
    }
}