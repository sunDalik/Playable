import {InanimatesSpriteSheet} from "../../../loader";
import {Shrine} from "./shrine";
import {SLOT} from "../../../enums/enums";
import {ENCHANTMENT_TYPE} from "../../../enums/enchantments";
import {createFadingText, shakeScreen} from "../../../animations";
import {applyEnchantment, removeEnchantment, removeEquipmentFromPlayer} from "../../../game_logic";

export class ShrineOfSeraph extends Shrine {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_seraph.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Shrine of Seraph";
        this.description = "Divinize your weapon\nLose 2 heart containers";
        this.setScaleModifier(1.25);
        this.tallModifier = -12;
    }

    interact(player) {
        if (player.maxHealth < 2) {
            createFadingText("You are weak", this.position.x, this.position.y);
            return;
        }

        const weapon = player[SLOT.WEAPON];
        if (!weapon) {
            createFadingText("Bring me a weapon", this.position.x, this.position.y);
            return;
        } else if (weapon.enchantment === ENCHANTMENT_TYPE.DIVINE) {
            createFadingText("You are already divine", this.position.x, this.position.y);
            return;
        }
        removeEnchantment(weapon);
        removeEquipmentFromPlayer(player, weapon.equipmentType, player.getSlotNameOfItem(weapon));
        applyEnchantment(weapon, ENCHANTMENT_TYPE.DIVINE);
        this.dropItemOnFreeTile(weapon);
        if (player.maxHealth === 2) {
            player.removeHealthContainers(1);
            player.voluntaryDamage(1, this, true);
        } else {
            player.removeHealthContainers(2);
            shakeScreen();
        }
    }
}