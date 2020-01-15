import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE, STAGE,} from "../../enums";
import {isNotAWall, getPlayerOnTile, isEnemy, isObelisk} from "../../map_checks";
import {createFadingAttack, rotate} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";

export class Aura {
    constructor() {
        this.texture = Game.resources["src/images/magic/aura.png"].texture;
        this.type = MAGIC_TYPE.AURA;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 2;
        this.healAmount = 1;
        this.maxUses = 3;
        this.uses = this.maxUses;
        this.name = "Aura";
        this.description = "Heal and enlighten";
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                const attackPositionX = wielder.tilePosition.x + x;
                const attackPositionY = wielder.tilePosition.y + y;
                if (!(x === 0 && y === 0) && Math.abs(x) + Math.abs(y) <= 2 && isNotAWall(attackPositionX, attackPositionY)) {
                    const attackSprite = new TileElement(Game.resources["src/images/player_attack.png"].texture, attackPositionX, attackPositionY);
                    if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
                    createFadingAttack(attackSprite);
                    if (isEnemy(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage(wielder, this.atk, 0, 0, true);
                    } else if (isObelisk(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage();
                    }
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player) player.heal(this.healAmount);
                }
            }
        }
        rotate(wielder, true);
        this.uses--;
        return true;
    }
}