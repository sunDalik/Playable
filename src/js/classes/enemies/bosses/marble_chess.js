import {Boss} from "./boss";
import {ENEMY_TYPE, TILE_TYPE} from "../../../enums/enums";
import {Game} from "../../../game";
import {tileInsideTheBossRoomExcludingWalls} from "../../../map_checks";
import {FCEnemiesSpriteSheet} from "../../../loader";
import {randomChoice} from "../../../utils/random_utils";
import {Pawn} from "../mm/pawn";

export class MarbleChess extends Boss {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["spider.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 22;
        this.type = ENEMY_TYPE.MARBLE_CHESS;
        this.whiteFigures = [];
        this.blackFigures = [];
        this.currentAlignment = CHESS_ALIGNMENT.WHITE;
        this.removeShadow();
    }

    static getBossRoomStats() {
        return {width: 10, height: 10};
    }

    placeOnMap() {
    }

    afterMapGen() {
        this.removeFromMap();
        for (const floorTile of Game.floorTiles) {
            if (tileInsideTheBossRoomExcludingWalls(floorTile.tilePosition.x, floorTile.tilePosition.y)) {
                const relativePos = {
                    x: floorTile.tilePosition.x - Game.endRoomBoundaries[0].x + 1,
                    y: floorTile.tilePosition.y - Game.endRoomBoundaries[0].y + 1
                };
                if ((relativePos.x + relativePos.y) % 2 === 1) {
                    floorTile.texture = Game.resources["src/images/tilesets/mm_tileset/black_marble_floor_tile_0.png"].texture;
                }
            }
        }

        // white direction
        let direction = {x: randomChoice([-1, 1]), y: 0};
        // if door is horizontal then make direction vertical
        for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
            if (Game.map[y][Game.endRoomBoundaries[0].x].tileType === TILE_TYPE.ENTRY
                || Game.map[y][Game.endRoomBoundaries[1].x].tileType === TILE_TYPE.ENTRY) {
                direction = {x: 0, y: randomChoice([-1, 1])};
                break;
            }
        }

        for (const figureSet of [{alignment: CHESS_ALIGNMENT.WHITE, direction: direction, array: this.whiteFigures},
            {alignment: CHESS_ALIGNMENT.BLACK, direction: {x: -direction.x, y: -direction.y}, array: this.blackFigures}
        ])
            if (figureSet.direction.y !== 0) {
                let pawnY;
                if (figureSet.direction.y === 1) {
                    pawnY = Game.endRoomBoundaries[0].y + 2;
                } else {
                    pawnY = Game.endRoomBoundaries[1].y - 2;
                }
                for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
                    const pawn = new Pawn(x, pawnY);
                    pawn.setUpChessFigure(figureSet.alignment, figureSet.direction);
                    Game.world.addEnemy(pawn, true);
                    figureSet.array.push(pawn);
                }
            } else {
                let pawnX;
                if (figureSet.direction.x === 1) {
                    pawnX = Game.endRoomBoundaries[0].x + 2;
                } else {
                    pawnX = Game.endRoomBoundaries[1].x - 2;
                }
                for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
                    const pawn = new Pawn(pawnX, y);
                    pawn.setUpChessFigure(figureSet.alignment, figureSet.direction);
                    Game.world.addEnemy(pawn, true);
                    figureSet.array.push(pawn);
                }
            }
    }

    onBossModeActivate() {
        super.onBossModeActivate();
        for (const figure of this.whiteFigures.concat(this.blackFigures)) {
            figure.isMinion = false;
        }
    }

    move() {
        if (this.whiteFigures.every(f => f.dead) && this.blackFigures.every(f => f.dead)) return;
        const figuresArray = this.currentAlignment === CHESS_ALIGNMENT.WHITE ? this.whiteFigures : this.blackFigures;
        if (figuresArray.every(f => f.dead)) {
            this.switchAlignment();
            return this.move();
        }

        for (const figure of figuresArray) {
            const possibleMoves = figure.getMoves();
        }

        this.switchAlignment();
    }

    switchAlignment() {
        if (this.currentAlignment === CHESS_ALIGNMENT.WHITE) {
            this.currentAlignment = CHESS_ALIGNMENT.BLACK;
        } else {
            this.currentAlignment = CHESS_ALIGNMENT.WHITE;
        }
    }
}

export const CHESS_ALIGNMENT = Object.freeze({WHITE: 0, BLACK: 1});