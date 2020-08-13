import {Game} from "../../../game";
import {ENEMY_TYPE} from "../../../enums/enums";
import {closestPlayer} from "../../../utils/game_utils";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {get8Directions, getDirectionsOnSquare} from "../../../utils/map_utils";
import {MudBlock} from "./mud_block";
import {isNotAWall} from "../../../map_checks";
import {RUEnemiesSpriteSheet} from "../../../loader";
import {MageEnemy} from "../mage_enemy";

export class MudMage extends MageEnemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["mud_mage.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.name = "Mud Mage";
        this.type = ENEMY_TYPE.MUD_MAGE;
        this.minions = [];
        this.minionsMax = 10;

        this.neutralTexture = texture;
        this.preparingTexture = RUEnemiesSpriteSheet["mud_mage_prepare.png"];
        this.castingTexture = RUEnemiesSpriteSheet["mud_mage_cast.png"];
    }

    cast() {
        for (const tile of this.getRandomPattern()) {
            if (isNotAWall(tile.x, tile.y)) {
                const enemy = new MudBlock(tile.x, tile.y);
                Game.world.addEnemyViaSummonCircle(enemy, 2);
                this.minions.push(enemy);
            }
        }
    }

    canCast() {
        return this.aliveMinionsCount() < this.minionsMax;
    }

    getRandomPattern() {
        //anticlockwise
        const radius = randomInt(1, 3);
        const pattern = [randomChoice(getDirectionsOnSquare(radius, true))]; //dumb hack
        let directionX;
        let directionY;

        const setDirections = (tile) => {
            if (tile.y === radius && tile.x === radius) {
                directionX = -1;
                directionY = -1;
            } else if (tile.y === -radius && tile.x === radius) {
                directionX = -1;
                directionY = 1;
            } else if (tile.y === -radius && tile.x === -radius) {
                directionX = 1;
                directionY = 1;
            } else if (tile.y === radius && tile.x === -radius) {
                directionX = 1;
                directionY = -1;
            } else if (tile.y === radius) {
                directionX = 1;
                directionY = -1;
            } else if (tile.y === -radius) {
                directionX = -1;
                directionY = 1;
            } else if (tile.x === radius) {
                directionX = -1;
                directionY = -1;
            } else if (tile.x === -radius) {
                directionX = 1;
                directionY = 1;
            }
        };

        setDirections(pattern[0]);

        let attempt = 0;
        while (attempt < 100) {
            let direction = randomChoice([
                {x: 0, y: directionY},
                {x: directionX, y: 0},
                {x: directionX, y: directionY}]);
            if (pattern.length === 1) {
                if (pattern[0].y === radius) direction = {x: 1, y: 0};
                if (pattern[0].y === -radius) direction = {x: -1, y: 0};
                if (pattern[0].x === radius) direction = {x: 0, y: -1};
                if (pattern[0].x === -radius) direction = {x: 0, y: 1};
            }
            const newTile = {
                x: pattern[pattern.length - 1].x + direction.x,
                y: pattern[pattern.length - 1].y + direction.y
            };
            if (Math.abs(newTile.x) < Math.max(radius - 1, 1) && Math.abs(newTile.y) < Math.max(radius - 1, 1)) {
                attempt++;
                continue;
            }
            if (pattern.find(tile => tile.x === newTile.x && tile.y === newTile.y)) {
                attempt++;
                continue;
            }
            pattern.push(newTile);
            attempt = 0;

            if (pattern.length >= 4 * radius) {
                for (const dir of get8Directions()) {
                    if (newTile.x === pattern[0].x + dir.x && newTile.y === pattern[0].y + dir.y) {
                        attempt = 9999; //to break from while
                        break;
                    }
                }
            }
            setDirections(newTile);
        }
        const targetPlayer = closestPlayer(this);
        return pattern.map(tile => {
            tile.x += targetPlayer.tilePosition.x;
            tile.y += targetPlayer.tilePosition.y;
            return tile;
        });
    }

    aliveMinionsCount() {
        this.minions = this.minions.filter(minion => !minion.dead);
        return this.minions.length;
    }
}