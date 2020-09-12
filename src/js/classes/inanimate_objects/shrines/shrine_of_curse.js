import {InanimatesSpriteSheet} from "../../../loader";
import {randomChoice} from "../../../utils/random_utils";
import {Shrine} from "./shrine";
import {SLOT} from "../../../enums/enums";
import {ENCHANTMENT_TYPE} from "../../../enums/enchantments";
import {createFadingText, shakeScreen} from "../../../animations";
import {applyEnchantment, removeEquipmentFromPlayer} from "../../../game_logic";

export class ShrineOfCurse extends Shrine {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_curse.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Shrine of Curse";
        this.description = "Curse your random item";
    }

    interact(player) {
        let playerEquipment = [player[SLOT.WEAPON], player[SLOT.EXTRA], player[SLOT.HEADWEAR], player[SLOT.ARMOR], player[SLOT.FOOTWEAR], player[SLOT.ACCESSORY]];
        playerEquipment = playerEquipment.filter(eq => eq !== null && eq.enchantment === ENCHANTMENT_TYPE.NONE);
        if (playerEquipment.length === 0) {
            createFadingText("Did you bring me something?", this.position.x, this.position.y);
            return;
        }
        const item = randomChoice(playerEquipment);
        removeEquipmentFromPlayer(player, item.equipmentType, player.getSlotNameOfItem(item));
        applyEnchantment(item, ENCHANTMENT_TYPE.CURSED);
        this.dropItemOnFreeTile(item);
        shakeScreen(8, 8);
        this.texture = InanimatesSpriteSheet["shrine_of_curse_activated.png"];
    }
}