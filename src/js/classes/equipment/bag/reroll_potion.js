import {EQUIPMENT_ID, INANIMATE_TYPE, RARITY, ROLE} from "../../../enums/enums";
import {BagSpriteSheet, EffectsSpriteSheet} from "../../../loader";
import {BagEquipment} from "../bag_equipment";
import {isOutOfMap} from "../../../map_checks";
import {Game} from "../../../game";
import {
    getRandomBossPedestalItem,
    getRandomChestItem,
    getRandomShopItem,
    getRandomSpell
} from "../../../utils/pool_utils";
import {createSmallOffsetParticle} from "../../../animations";
import {randomChoice} from "../../../utils/random_utils";

export class RerollPotion extends BagEquipment {
    constructor() {
        super();
        this.texture = BagSpriteSheet["reroll_potion.png"];
        this.id = EQUIPMENT_ID.REROLL_POTION;
        this.name = "Reroll Potion";
        this.description = "Drink to reroll all items in grails, shop stands, pedestals and opened chests in radius of 3 tiles";
        this.rarity = RARITY.C;
    }

    useItem(wielder) {
        super.useItem();
        const radius = 3;
        for (let i = wielder.tilePosition.y - radius; i <= wielder.tilePosition.y + radius; i++) {
            for (let j = wielder.tilePosition.x - radius; j <= wielder.tilePosition.x + radius; j++) {
                if (isOutOfMap(j, i)) continue;
                const inanimate = Game.map[i][j].entity;
                if (inanimate && inanimate.role === ROLE.INANIMATE && inanimate.contents) {
                    switch (inanimate.type) {
                        case INANIMATE_TYPE.CHEST:
                            if (!inanimate.opened) continue;
                            inanimate.contents = getRandomChestItem();
                            break;
                        case INANIMATE_TYPE.SHOP_STAND:
                            inanimate.contents = getRandomShopItem();
                            inanimate.calculateKeysAmount();
                            break;
                        case INANIMATE_TYPE.PEDESTAL:
                            inanimate.contents = getRandomBossPedestalItem();
                            break;
                        case INANIMATE_TYPE.GRAIL:
                            inanimate.contents = getRandomSpell();
                            break;
                    }

                    createSmallOffsetParticle(EffectsSpriteSheet["dice_effect.png"], inanimate.tilePosition, randomChoice([-1, 1]), 16);

                    if (inanimate.type === INANIMATE_TYPE.GRAIL) {
                        inanimate.setMagic(inanimate.contents);
                    } else {
                        inanimate.contentsType = inanimate.contents.equipmentType;
                        inanimate.showItem(inanimate.contents);
                    }
                }
            }
        }
    }
}