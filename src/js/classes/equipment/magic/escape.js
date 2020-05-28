import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {isBullet, isEmpty, isEnemy, isLit, isNotAWall, isNotOutOfMap, tileInsideTheBossRoom} from "../../../map_checks";
import {Game} from "../../../game";
import {randomChoice} from "../../../utils/random_utils";
import {otherPlayer} from "../../../utils/game_utils";
import {lightPlayerPosition} from "../../../drawing/lighting";
import {camera} from "../../game/camera";

export class Escape extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_escape.png"];
        this.type = MAGIC_TYPE.ESCAPE;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.uses = this.maxUses = 6;
        this.name = "Escape";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        const range = 10;
        const safeTiles = [];
        //todo separate players sometimes??
        for (let i = wielder.tilePosition.y - range; i <= wielder.tilePosition.y + range; i++) {
            for (let j = wielder.tilePosition.x - range; j <= wielder.tilePosition.x + range; j++) {
                if (isNotOutOfMap(j, i) && isNotAWall(j, i) && isLit(j, i) && isEmpty(j, i)
                    && Game.map[i][j].hazard === null && this.noEnemiesInRange({x: j, y: i}, 2)
                    && (Game.bossFight === false || tileInsideTheBossRoom(j, i))) {
                    safeTiles.push({x: j, y: i});
                }
            }
        }
        if (safeTiles.length === 0) {
            const stunRange = 2;
            for (let i = wielder.tilePosition.y - stunRange; i <= wielder.tilePosition.y + stunRange; i++) {
                for (let j = wielder.tilePosition.x - stunRange; j <= wielder.tilePosition.x + stunRange; j++) {
                    if (isEnemy(j, i)) {
                        Game.map[i][j].entity.stun += 3;
                    }
                }
            }
        } else {
            const tile = randomChoice(safeTiles);
            wielder.setTilePosition(tile.x, tile.y);
            if (!otherPlayer(wielder).dead) otherPlayer(wielder).setTilePosition(tile.x, tile.y);
            lightPlayerPosition(wielder);
            camera.moveToCenter(5);
        }
        this.uses--;
        return true;
    }

    noEnemiesInRange(tile, range) {
        for (let i = tile.y - range; i <= tile.y + range; i++) {
            for (let j = tile.x - range; j <= tile.x + range; j++) {
                if (isBullet(j, i) || isEnemy(j, i)) return false;
            }
        }
        return true;
    }
}