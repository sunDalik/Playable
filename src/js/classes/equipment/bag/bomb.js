import {Game} from "../../../game";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {BagSpriteSheet} from "../../../loader";
import {ShadowTileElement} from "../../tile_elements/shadow_tile_element";
import {BagEquipment} from "../bag_equipment";
import {explode} from "../../../game_logic";

export class Bomb extends BagEquipment {
    constructor() {
        super();
        this.texture = BagSpriteSheet["bomb.png"];
        this.id = EQUIPMENT_ID.BOMB;
        this.name = "Bomb";
        this.description = "Creates 3x3 explosion that destroys walls\nIt also deals 3 damage to enemies and 1 damage to players that got caught in the blast";
        this.fuseDelay = 3;
        this.currentFuseDelay = this.fuseDelay;
        this.bombAtk = 3;
        this.friendlyFire = 1;
        this.sprite = null;
        this.rarity = RARITY.C;
    }

    useItem(wielder) {
        super.useItem();
        const placedBomb = new Bomb();
        placedBomb.sprite = new ShadowTileElement(BagSpriteSheet["bomb_ticking.png"], wielder.tilePosition.x, wielder.tilePosition.y);
        Game.world.addChild(placedBomb.sprite);
        Game.updateList.push(placedBomb);
    }

    update() {
        if (this.currentFuseDelay <= 0) {
            explode(this.sprite.tilePosition.x, this.sprite.tilePosition.y, this.bombAtk, this.friendlyFire);
            removeObjectFromArray(this, Game.updateList);
            Game.world.removeChild(this.sprite);
            Game.world.removeChild(this.sprite.shadow);
        } else {
            this.currentFuseDelay--;
            if (this.currentFuseDelay === 0) {
                this.sprite.tint = 0xff7777;
            }
        }
    }
}