import {EQUIPMENT_ID, EQUIPMENT_TYPE, HAZARD_TYPE, RARITY} from "../../../enums/enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {Game} from "../../../game";

export class MushroomGreaves extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["mushroom_greaves.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.id = EQUIPMENT_ID.MUSHROOM_GREAVES;
        this.name = "Mushroom Greaves";
        this.description = "Immunity to poison hazards\n+0.25 defense\nYou absorb poison beneath you";
        this.rarity = RARITY.B;
        this.poisonImmunity = true;
        this.passiveDef = 0.25;
    }

    // absorb poison both before enemy turn (to prevent other player damage from poison beneath you)
    // and after enemy turn (to absorb fresh poison from enemies)
    onPlayerTurnEnd(wielder) {
        this.absorb(wielder);
    }

    onNewTurn(wielder) {
        this.absorb(wielder);
    }


    absorb(wielder) {
        const hazard = Game.map[wielder.tilePosition.y][wielder.tilePosition.x].hazard;
        if (hazard) {
            if (hazard.type === HAZARD_TYPE.POISON || hazard.type === HAZARD_TYPE.DARK_POISON) {
                hazard.removeFromWorld();
            }
        }
    }
}