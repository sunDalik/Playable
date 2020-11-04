import {Boss} from "./boss";
import {ENEMY_TYPE, TILE_TYPE} from "../../../enums/enums";
import {Game} from "../../../game";
import {getPlayerOnTile, tileInsideTheBossRoomExcludingWalls} from "../../../map_checks";
import {FCEnemiesSpriteSheet} from "../../../loader";
import {randomChoice} from "../../../utils/random_utils";
import {Pawn} from "../mm/pawn";
import {Knight} from "../mm/knight";

export class MarbleChess extends Boss {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["spider.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 22;
        this.type = ENEMY_TYPE.MARBLE_CHESS;
        this.whiteFigures = [];
        this.blackFigures = [];
        this.currentAlignment = CHESS_ALIGNMENT.WHITE;
        this.canMoveInvisible = true;
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
                let figuresY;
                if (figureSet.direction.y === 1) {
                    pawnY = Game.endRoomBoundaries[0].y + 2;
                    figuresY = pawnY - 1;
                } else {
                    pawnY = Game.endRoomBoundaries[1].y - 2;
                    figuresY = pawnY + 1;
                }
                for (let i = 0; i < 8; i++) {
                    const x = Game.endRoomBoundaries[0].x + 1 + i;
                    const pawn = new Pawn(x, pawnY);
                    pawn.setUpChessFigure(figureSet.alignment, figureSet.direction);
                    Game.world.addEnemy(pawn, true);
                    figureSet.array.push(pawn);
                    if (i === 1 || i === 6) {
                        const knight = new Knight(x, figuresY);
                        knight.setUpChessFigure(figureSet.alignment);
                        Game.world.addEnemy(knight, true);
                        figureSet.array.push(knight);
                        if (i === 1) knight.scale.x = -Math.abs(knight.scale.x);
                    }
                }
            } else {
                let pawnX;
                let figuresX;
                if (figureSet.direction.x === 1) {
                    pawnX = Game.endRoomBoundaries[0].x + 2;
                    figuresX = pawnX - 1;
                } else {
                    pawnX = Game.endRoomBoundaries[1].x - 2;
                    figuresX = pawnX + 1;
                }
                for (let i = 0; i < 8; i++) {
                    const y = Game.endRoomBoundaries[0].y + 1 + i;
                    const pawn = new Pawn(pawnX, y);
                    pawn.setUpChessFigure(figureSet.alignment, figureSet.direction);
                    Game.world.addEnemy(pawn, true);
                    figureSet.array.push(pawn);
                    if (i === 1 || i === 6) {
                        const knight = new Knight(figuresX, y);
                        knight.setUpChessFigure(figureSet.alignment);
                        Game.world.addEnemy(knight, true);
                        figureSet.array.push(knight);
                        if (figureSet.direction.x === 1) knight.scale.x = -Math.abs(knight.scale.x);
                    }
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
        let figuresArray = this.currentAlignment === CHESS_ALIGNMENT.WHITE ? this.whiteFigures : this.blackFigures;
        figuresArray = figuresArray.filter(f => !f.dead);
        if (figuresArray.length === 0) {
            this.switchAlignment();
            return this.move();
        }

        let usedTurn = false;

        // try to find a killer move first
        for (const figure of figuresArray) {
            const possibleMoves = figure.getMoves(figure.tilePosition.x, figure.tilePosition.y);
            figure.cachedMoves = possibleMoves;
            const playerKillerMove = possibleMoves.find(move => getPlayerOnTile(move.x, move.y) !== null);
            if (playerKillerMove) {
                usedTurn = true;
                figure.moveTo(playerKillerMove.x, playerKillerMove.y);
                break;
            }
        }

        // then try to find a move that would kill on the next turn
        if (!usedTurn) {
            for (const figure of figuresArray) {
                const potentialKillerMove = figure.cachedMoves.find(move => {
                    const nextTurnMoves = figure.getMoves(move.x, move.y);
                    return nextTurnMoves.find(nextTurnMove => getPlayerOnTile(nextTurnMove.x, nextTurnMove.y) !== null);
                });
                if (potentialKillerMove) {
                    usedTurn = true;
                    figure.moveTo(potentialKillerMove.x, potentialKillerMove.y);
                    break;
                }
            }
        }

        // if nothing works, do a random move
        if (!usedTurn) {
            const figure = randomChoice(figuresArray.filter(f => f.cachedMoves.length !== 0));
            if (figure) {
                const move = randomChoice(figure.cachedMoves);
                figure.moveTo(move.x, move.y);
            }
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