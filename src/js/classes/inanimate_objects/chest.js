import {Game} from "../../game"
import {FullTileElement} from "../tile_elements/full_tile_element"
import {ROLE, INANIMATE_TYPE} from "../../enums";
import {createFloatingItemAnimation} from "../../animations";
import {swapEquipmentWithPlayer, removeEquipmentFromPlayer} from "../../game_logic";
import {TileElement} from "../tile_elements/tile_element";

export class Chest extends FullTileElement {
    constructor(tilePositionX, tilePositionY, contents) {
        super(Game.resources["src/images/other/chest.png"].texture, tilePositionX, tilePositionY);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.CHEST;
        this.opened = false;
        this.contentsSprite = new TileElement(this.contents.texture, this.tilePosition.x, this.tilePosition.y - 0.5);
        this.contentsSprite.width = Game.TILESIZE * 0.9;
        this.contentsSprite.height = Game.TILESIZE * 0.9;
        this.contentsSprite.visible = false;
        this.contentsSprite.zIndex = 3;
        Game.world.addChild(this.contentsSprite);
        Game.tiles.push(this.contentsSprite);
    }

    interact(player) {
        this.texture = Game.resources["src/images/other/chest_opened.png"].texture;
        if (this.opened) {
            if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
            else this.contents = removeEquipmentFromPlayer(player, this.contentsType);
        } else {
            this.opened = true;
            createFloatingItemAnimation(this.contentsSprite);
        }
        if (this.contents) {
            Game.app.ticker.remove(this.contentsSprite.animation);
            Game.app.ticker.add(this.contentsSprite.animation);
            this.contentsSprite.texture = this.contents.texture;
            this.contentsSprite.width = Game.TILESIZE * 0.9;
            this.contentsSprite.height = Game.TILESIZE * 0.9;
            this.contentsSprite.visible = true;
        } else {
            Game.app.ticker.remove(this.contentsSprite.animation);
            this.contentsSprite.visible = false;
        }
    }
}