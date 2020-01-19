import {Game} from "../../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE, STAGE, RARITY,} from "../../../enums";
import {isNotAWall, getPlayerOnTile, isEnemy, isObelisk} from "../../../map_checks";
import {createFadingAttack, rotate} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";

export class Spikes {
    constructor() {
        this.texture = Game.resources["src/images/magic/spikes.png"].texture;
        this.type = MAGIC_TYPE.SPIKES;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 3;
        this.friendlyFire = 1;
        this.maxUses = 4;
        this.uses = this.maxUses;
        this.name = "Spikes";
        this.description = "Wield with care";
        this.rarity = RARITY.A;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let offset = -2; offset <= 2; offset++) {
            for (let sign = -1; sign <= 1; sign += 2) {
                const attackPositionX = wielder.tilePosition.x + offset;
                const attackPositionY = wielder.tilePosition.y + offset * sign;
                if (offset !== 0 && isNotAWall(attackPositionX, attackPositionY)) {
                    const attackSprite = new TileElement(Game.resources["src/images/player2_attack.png"].texture, attackPositionX, attackPositionY);
                    if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
                    createFadingAttack(attackSprite);
                    if (isEnemy(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage(wielder, this.atk, 0, 0, true);
                    } else if (isObelisk(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage();
                    }
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player) player.damage(this.friendlyFire, wielder);
                }
            }
        }
        rotate(wielder, false);
        this.uses--;
        return true;
    }
}