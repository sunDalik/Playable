import {Game} from "../../../game";
import {DAMAGE_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {getPlayerOnTile, isEnemy, isNotAWall, isObelisk} from "../../../map_checks";
import {createCrazySpikeAnimation, createPlayerAttackTile, rotate} from "../../../animations";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Spikes extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_spikes.png"];
        this.type = MAGIC_TYPE.SPIKES;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 2;
        this.friendlyFire = 1;
        this.uses = this.maxUses = 4;
        this.name = "Spikes";
        this.description = `Cast 4 diagonal spikes that deal ${this.atk} damage to enemies\nIt can also hurt allies and deal ${this.friendlyFire} damage to them`;
        this.attackDirs = [{x: -1, y: -1}, {x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}]
            .flatMap(d => [d, {x: d.x * 2, y: d.y * 2}]);
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        let enemiesDamaged = 0;
        let playerDamaged = false;
        for (const attackDir of this.attackDirs) {
            const attackTile = {x: wielder.tilePosition.x + attackDir.x, y: wielder.tilePosition.y + attackDir.y};
            if (isNotAWall(attackTile.x, attackTile.y)) {
                if (isEnemy(attackTile.x, attackTile.y)) {
                    Game.map[attackTile.y][attackTile.x].entity.damage(wielder, wielder.getAtk(this), attackTile.x - wielder.tilePosition.x, attackTile.y - wielder.tilePosition.y, DAMAGE_TYPE.MAGICAL);
                    enemiesDamaged++;
                } else if (isObelisk(attackTile.x, attackTile.y)) {
                    Game.map[attackTile.y][attackTile.x].entity.damage();
                }
                const player = getPlayerOnTile(attackTile.x, attackTile.y);
                if (player) {
                    player.damage(this.friendlyFire, wielder);
                    playerDamaged = true;
                }
                createPlayerAttackTile(attackTile, 12);
            }
        }
        this.attackEffect(wielder, enemiesDamaged, playerDamaged);
        this.createAttackAnimation(wielder);
        rotate(wielder, false);
        this.uses--;
        return true;
    }

    createAttackAnimation(wielder, color = 0x3d4f8f) {
        createCrazySpikeAnimation(wielder, -2, -2, color);
        createCrazySpikeAnimation(wielder, 2, -2, color);
        createCrazySpikeAnimation(wielder, -2, 2, color);
        createCrazySpikeAnimation(wielder, 2, 2, color);
    }

    attackEffect(wielder, enemiesDamaged, playerDamaged) {}
}