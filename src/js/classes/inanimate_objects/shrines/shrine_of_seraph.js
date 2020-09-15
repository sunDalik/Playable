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
        const weapon = player[SLOT.WEAPON];
        let errorMessage = "";
        if (!weapon) {
            errorMessage = "Bring me a weapon";
        } else if (weapon.enchantment === ENCHANTMENT_TYPE.DIVINE) {
            errorMessage = "You are already divine";
        } else if (weapon.isMinionStaff) {
            errorMessage = "Minion staves cannot be divine";
        } else if (player.maxHealth < 2) {
            errorMessage = "You are weak";
        }

        if (errorMessage !== "") {
            createFadingText(errorMessage, this.position.x, this.position.y);
            return;
        }

        removeEnchantment(weapon);
        removeEquipmentFromPlayer(player, weapon.equipmentType, player.getSlotNameOfItem(weapon));
        applyEnchantment(weapon, ENCHANTMENT_TYPE.DIVINE);
        this.dropItemOnFreeTile(weapon);
        this.successfullyActivate();
        if (player.maxHealth === 2) {
            player.removeHealthContainers(1);
            player.voluntaryDamage(1, this, true);
        } else {
            player.removeHealthContainers(2);
            shakeScreen();
        }
    }
}