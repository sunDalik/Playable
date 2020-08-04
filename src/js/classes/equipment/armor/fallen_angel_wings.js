import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY, SLOT} from "../../../enums/enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {removeEquipmentFromPlayer} from "../../../game_logic";
import {castWind} from "../../../special_move_logic";
import {redrawSlotContents} from "../../../drawing/draw_hud";
import {reviveItemAnimation} from "../../../animations";

export class FallenAngelWings extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["fallen_angel_wings.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.FALLEN_ANGEL_WINGS;
        this.name = "Fallen Angel Wings";
        this.description = "Save you from death with 1 hp\nBreak after 2 revivals";
        this.rarity = RARITY.C;
        this.revivesLeft = this.maxRevives = 2;
    }

    revivePlayer(player) {
        player.health = 1;
        castWind(player, 2, 1, 1, true);
        this.revivesLeft--;
        reviveItemAnimation(this.texture, player);
        if (this.revivesLeft <= 0) {
            this.nonremoveable = false;
            removeEquipmentFromPlayer(player, EQUIPMENT_TYPE.ARMOR);
        } else {
            this.texture = ArmorSpriteSheet["fallen_angel_wings_used.png"];
            redrawSlotContents(player, SLOT.ARMOR);
        }
    }
}