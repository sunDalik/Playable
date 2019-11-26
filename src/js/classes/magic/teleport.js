import {Game} from "../../game"
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE,} from "../../enums";
import {centerCamera} from "../../camera";

export class Teleport {
    constructor() {
        this.texture = Game.resources["src/images/magic/teleport.png"].texture;
        this.type = MAGIC_TYPE.TELEPORT;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
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
        wielder.removeFromMap();
        wielder.tilePosition.set(otherPlayer.tilePosition.x, otherPlayer.tilePosition.y);
        wielder.placeOnMap();
        wielder.place();
        centerCamera();
        this.uses--;
        return true;
    }
}