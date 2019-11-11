import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT,} from "../../enums";
import {removePlayerFromGameMap, placePlayerOnGameMap} from "../../game_logic";
import {centerCamera} from "../../camera";

export class Teleport {
    constructor() {
        this.texture = Game.resources["src/images/magic/teleport.png"].texture;
        this.type = MAGIC_TYPE.TELEPORT;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.maxUses = 6;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        if (Game.player.dead || Game.player2.dead) return false;
        let otherPlayer;
        if (wielder === Game.player2) otherPlayer = Game.player;
        else otherPlayer = Game.player2;
        removePlayerFromGameMap(wielder);
        wielder.tilePosition.set(otherPlayer.tilePosition.x, otherPlayer.tilePosition.y);
        placePlayerOnGameMap(wielder);
        wielder.place();
        centerCamera();
        this.uses--;
    }
}