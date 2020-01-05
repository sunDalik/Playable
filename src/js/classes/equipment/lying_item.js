import {Game} from "../../game"
import {createFloatingItemAnimation} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";
import {swapEquipmentWithPlayer} from "../../game_logic";

export class LyingItem extends TileElement {
    constructor(tilePositionX, tilePositionY, item) {
        super(item.texture, tilePositionX, tilePositionY);
        this.item = item;
        this.animation = createFloatingItemAnimation(this);
        this.width = Game.TILESIZE * 0.9;
        this.height = Game.TILESIZE * 0.9;
        this.zIndex = -1;
    }

    pickUp(player) {
        this.item = swapEquipmentWithPlayer(player, this.item);
        if (this.item === null) {
            Game.world.removeChild(this);
            Game.map[this.tilePosition.y][this.tilePosition.x].item = null;
            Game.app.ticker.remove(this.animation);
        } else {
            this.texture = this.item.texture;
            this.width = Game.TILESIZE * 0.9;
            this.height = Game.TILESIZE * 0.9;
        }
    }
}