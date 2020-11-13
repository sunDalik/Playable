import {Boss} from "./boss";
import {ENEMY_TYPE, TILE_TYPE} from "../../../enums/enums";
import {Game} from "../../../game";
import {getPlayerOnTile, tileInsideTheBossRoomExcludingWalls} from "../../../map_checks";
import {randomChoice} from "../../../utils/random_utils";
import {Pawn} from "../mm/pawn";
import {Knight} from "../mm/knight";
import {MarbleChessSpriteSheet} from "../../../loader";

export class MarbleKing extends Boss {
    constructor(tilePositionX, tilePositionY, texture = MarbleChessSpriteSheet["white_pawn.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 22;
        this.name = "Marble King";
        this.type = ENEMY_TYPE.MARBLE_KING;
        this.figures = [];
        this.removeShadow();
    }

    static getBossRoomStats() {
        return {width: 10, height: 10};
    }

    afterMapGen() {
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

        let direction = {x: 1, y: 0};
        for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
            if (Game.map[Game.endRoomBoundaries[0].y][x].tileType === TILE_TYPE.ENTRY) {
                direction = {x: 0, y: -1};
                break;
            } else if (Game.map[Game.endRoomBoundaries[1].y][x].tileType === TILE_TYPE.ENTRY) {
                direction = {x: 0, y: 1};
                break;
            }
        }

        for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
            if (Game.map[y][Game.endRoomBoundaries[0].x].tileType === TILE_TYPE.ENTRY) {
                direction = {x: -1, y: 0};
                break;
            } else if (Game.map[y][Game.endRoomBoundaries[1].x].tileType === TILE_TYPE.ENTRY) {
                direction = {x: 1, y: 0};
                break;
            }
        }

        if (direction.y !== 0) {
            let pawnY;
            let figuresY;
            if (direction.y === 1) {
                pawnY = Game.endRoomBoundaries[0].y + 2;
                figuresY = pawnY - 1;
            } else {
                pawnY = Game.endRoomBoundaries[1].y - 2;
                figuresY = pawnY + 1;
            }
            for (let i = 0; i < 8; i++) {
                const x = Game.endRoomBoundaries[0].x + 1 + i;
                const pawn = new Pawn(x, pawnY);
                pawn.direction = {x: direction.x, y: direction.y};
                Game.world.addEnemy(pawn, true);
                this.figures.push(pawn);
                if (i === 1 || i === 6) {
                    const knight = new Knight(x, figuresY);
                    Game.world.addEnemy(knight, true);
                    this.figures.push(knight);
                    if (i === 1) knight.scale.x = -Math.abs(knight.scale.x);
                }

                if (direction.y === 1 && i === 3 || direction.y === -1 && i === 4) {
                    this.setTilePosition(x, figuresY);
                }
            }
        } else {
            let pawnX;
            let figuresX;
            if (direction.x === 1) {
                pawnX = Game.endRoomBoundaries[0].x + 2;
                figuresX = pawnX - 1;
            } else {
                pawnX = Game.endRoomBoundaries[1].x - 2;
                figuresX = pawnX + 1;
            }
            for (let i = 0; i < 8; i++) {
                const y = Game.endRoomBoundaries[0].y + 1 + i;
                const pawn = new Pawn(pawnX, y);
                pawn.direction = {x: direction.x, y: direction.y};
                Game.world.addEnemy(pawn, true);
                this.figures.push(pawn);
                if (i === 1 || i === 6) {
                    const knight = new Knight(figuresX, y);
                    Game.world.addEnemy(knight, true);
                    this.figures.push(knight);
                    if (direction.x === 1) knight.scale.x = -Math.abs(knight.scale.x);
                }
                if (direction.x === 1 && i === 3 || direction.x === -1 && i === 4) {
                    this.setTilePosition(figuresX, y);
                }
            }
        }
    }

    onBossModeActivate() {
        super.onBossModeActivate();
        for (const figure of this.figures) {
            figure.isMinion = false;
        }
    }

    move() {
        const figureArray = this.figures.filter(f => !f.dead);
        if (figureArray.length === 0) return;
        let usedTurn = false;

        // try to find a killer move first
        for (const figure of figureArray) {
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
            for (const figure of figureArray) {
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
            const figure = randomChoice(figureArray.filter(f => f.cachedMoves.length !== 0));
            if (figure) {
                const move = randomChoice(figure.cachedMoves);
                figure.moveTo(move.x, move.y);
            }
        }
    }

    die(source) {
        super.die(source);
        for (const figure of this.figures) {
            if (!figure.dead) figure.die(null);
        }
    }
}