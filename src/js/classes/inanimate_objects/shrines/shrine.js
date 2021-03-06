import {TileElement} from "../../tile_elements/tile_element";
import {ACHIEVEMENT_ID, INANIMATE_TYPE, ROLE} from "../../../enums/enums";
import * as PIXI from "pixi.js";
import {HUDTextStyle} from "../../../drawing/draw_constants";
import {Game} from "../../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../../z_indexing";
import {getCardinalDirections} from "../../../utils/map_utils";
import {getPlayerOnTile, isEmpty} from "../../../map_checks";
import {randomShuffle} from "../../../utils/random_utils";
import {dropItem} from "../../../game_logic";
import {completeAchievement} from "../../../achievements";

export class Shrine extends TileElement {
    constructor(tilePositionX, tilePositionY, texture) {
        super(texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.SHRINE; //should it possible have shrineType?
        this.name = "Shrine";
        this.description = "";
        this.setScaleModifier(1.1);
        this.tallModifier = -8;
    }

    afterMapGen() {
        this.textObj = new PIXI.Text(this.description, Object.assign({}, HUDTextStyle, {
            fontSize: Game.TILESIZE / 3.3,
            strokeThickness: 3
        }));
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.position.set(this.position.x, this.position.y - this.height / 2 - this.textObj.height / 2);
        this.textObj.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        this.textObj.visible = false;
        Game.world.addChild(this.textObj);
    }

    interact(player) {
    }

    dropItemOnFreeTile(item) {
        let droppedItem = false;
        const directions = randomShuffle(getCardinalDirections());
        directions.sort((a, b) => {
            if (a.y === -1) return 1;
            else if (b.y === -1) return -1;
            else return 0;
        });
        for (const dir of directions) {
            const tile = {x: this.tilePosition.x + dir.x, y: this.tilePosition.y + dir.y};
            if (isEmpty(tile.x, tile.y)) {
                dropItem(item, tile.x, tile.y);
                droppedItem = true;
                break;
            }
        }

        if (!droppedItem) {
            dropItem(item, this.tilePosition.x, this.tilePosition.y);
        }
    }

    successfullyActivate() {
        completeAchievement(ACHIEVEMENT_ID.ACTIVATE_SHRINE);
    }

    onUpdate() {
        if (!this.textObj) return;
        this.textObj.visible = false;
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                this.textObj.visible = true;
                break;
            }
        }
    }
}