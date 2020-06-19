import {Game} from "../../../game";
import {DAMAGE_TYPE, EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {isEnemy} from "../../../map_checks";
import {TileElement} from "../../tile_elements/tile_element";
import {randomChoice} from "../../../utils/random_utils";
import {easeOutQuad} from "../../../utils/math_utils";
import {getCardinalDirections} from "../../../utils/map_utils";

export class PossessedSandals extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["possessed_sandals.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.id = EQUIPMENT_ID.POSSESSED_SANDALS;
        this.name = "Possessed Sandals";
        this.description = "Moving from a tile damages all enemies that stood near that tile by 1 atk";
        this.rarity = RARITY.A;
    }

    onMove(wielder, tileStepX, tileStepY) {
        for (const dir of getCardinalDirections()) {
            if (isEnemy(wielder.tilePosition.x - tileStepX + dir.x, wielder.tilePosition.y - tileStepY + dir.y)) {
                const enemy = Game.map[wielder.tilePosition.y - tileStepY + dir.y][wielder.tilePosition.x - tileStepX + dir.x].entity;
                enemy.damage(wielder, 1, -tileStepX, -tileStepY, DAMAGE_TYPE.MAGICAL);
                this.animateDemon(wielder.tilePosition.x - tileStepX, wielder.tilePosition.y - tileStepY, enemy);
            }
        }
    }

    animateDemon(srcX, srcY, dst) {
        const demon = new TileElement(FootwearSpriteSheet["sandals_demon.png"], srcX, srcY);
        Game.world.addChild(demon);
        const shiftX = Game.TILESIZE / 2;
        const dirX = Math.sign(dst.tilePosition.x - srcX);
        const dirY = Math.sign(dst.tilePosition.y - srcY);
        if (dirX === -1) {
            demon.scale.x *= -1;
            demon.position.x -= shiftX;
        } else if (dirX === 1) {
            demon.position.x += shiftX;
        } else {
            demon.scale.x *= randomChoice([-1, 1]);
            demon.position.y += dirY * shiftX;
        }
        if (dirY === 0) {
            demon.position.y += Game.TILESIZE / 4;
        }
        demon.width = demon.height = Game.TILESIZE / 3;
        const alpha = demon.alpha = 0.9;
        const initSize = demon.width;
        const sizeChange = Game.TILESIZE * 0.7;
        const startPosX = demon.position.x;
        const startPosY = demon.position.y;
        const posXEndChange = dirX !== 0 ? dirX * Game.TILESIZE / 2 : 0;
        const posYEndChange = dirY !== 0 ? dirY * Game.TILESIZE / 2 : -Game.TILESIZE / 4;
        demon.zIndex = dst.zIndex + 1;

        const animationTime = 22;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            demon.position.x = startPosX + easeOutQuad(counter / animationTime) * posXEndChange;
            demon.position.y = startPosY + easeOutQuad(counter / animationTime) * posYEndChange;
            demon.height = demon.width = initSize + easeOutQuad(counter / animationTime) * sizeChange;
            if (counter >= animationTime * 4 / 5) {
                demon.alpha = alpha - easeOutQuad((counter - animationTime * 4 / 5) / (animationTime / 5)) * alpha;
            }

            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(demon);
                demon.destroy();
            }
        };

        Game.app.ticker.add(animation);
    }
}