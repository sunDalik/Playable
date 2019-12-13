import {Game} from "../../game"
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE,} from "../../enums";
import {centerCamera, scaleGameMap} from "../../camera";
import {drawInteractionKeys, drawMovementKeyBindings} from "../../drawing/draw_hud";
import {otherPlayer} from "../../utils/game_utils";

export class Teleport {
    constructor() {
        this.texture = Game.resources["src/images/magic/teleport.png"].texture;
        this.type = MAGIC_TYPE.TELEPORT;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.maxUses = 20;
        this.uses = this.maxUses;
        this.name = "Teleport";
        this.description = "Teleport";
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        if (Game.player.dead || Game.player2.dead) return false;
        if (wielder.tilePosition.x === otherPlayer(wielder).tilePosition.x
            && wielder.tilePosition.y === otherPlayer(wielder).tilePosition.y) return false;
        wielder.removeFromMap();
        wielder.tilePosition.set(otherPlayer(wielder).tilePosition.x, otherPlayer(wielder).tilePosition.y);
        wielder.placeOnMap();
        wielder.place();
        drawMovementKeyBindings();
        drawInteractionKeys();
        scaleGameMap();
        centerCamera();
        this.uses--;
        return true;
    }
}