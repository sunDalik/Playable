"use strict";

function fireball() {
    let fire = new PIXI.Sprite(GameState.resources["src/images/fire.png"].texture);
    const fireHeight = GameState.TILESIZE * 1;
    fire.anchor.set(0, 0.5);
    fire.position.set(GameState.player.x, GameState.player.y);
    fire.width = Math.sqrt((GameState.player2.x - GameState.player.x) ** 2 + (GameState.player.y - GameState.player2.y) ** 2);
    fire.height = fireHeight;
    GameState.gameWorld.addChild(fire);
    fire.rotation = Math.atan((GameState.player2.y - GameState.player.y) / (GameState.player2.x - GameState.player.x));
    if ((GameState.player2.x - GameState.player.x) < 0) {
        fire.rotation += Math.PI;
    }
    fire.getBounds();
    let fireCorrectVertexData;
    const fv = fire.vertexData;
    const fa = fire.angle >= 0 ? fire.angle : 360 - fire.angle;
    if (fa > 0 && fa <= 90) {
        fireCorrectVertexData = [fv[6], fv[7], fv[0], fv[1], fv[2], fv[3], fv[4], fv[5]]
    } else if (fa > 90 && fa <= 180) {
        fireCorrectVertexData = [fv[4], fv[5], fv[6], fv[7], fv[0], fv[1], fv[2], fv[3]]
    } else if (fa > 180 && fa <= 270) {
        fireCorrectVertexData = [fv[2], fv[3], fv[4], fv[5], fv[6], fv[7], fv[0], fv[1]]
    } else {
        fireCorrectVertexData = [fv[0], fv[1], fv[2], fv[3], fv[4], fv[5], fv[6], fv[7]]
    }
    if (fire.width !== 0) {
        createFadingAttack(fire, false);
        for (const enemy of GameState.enemies) {
            if (!enemy.isDead()) {
                if (collisionCheck(fireCorrectVertexData, enemy.vertexData)) {
                    enemy.damage(3);
                    if (enemy.isDead()) {
                        GameState.gameMap[enemy.tilePosition.y][enemy.tilePosition.x].entity = null;
                        enemy.cancelAnimation();
                        enemy.visible = false;
                    }
                }
            }
        }
    }
}

function teleport() {
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x].entity = null;
    if (GameState.player2.x > GameState.player.x) {
        if (isNotAWallOrEnemy(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x + 1;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x - 1;
        }
    } else if (GameState.player2.x < GameState.player.x) {
        if (isNotAWallOrEnemy(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x - 1;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x + 1;
        }
    } else if (GameState.player2.tilePosition.y < GameState.player.tilePosition.y) {
        if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x--;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x++;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
        }
    } else {
        if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x--;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x++;
        } else if (isNotAWallOrEnemy(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
        }
    }
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x].entity = GameState.player2;
    GameState.player2.place();
    centerCamera();
}

function rotateAttack() {
    for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
            if (!(x === 0 && y === 0) && isNotAWall(GameState.player.tilePosition.x + x, GameState.player.tilePosition.y + y)) {
                const attackPositionX = GameState.player.tilePosition.x + x;
                const attackPositionY = GameState.player.tilePosition.y + y;
                createFadingAttack(new FullTileElement(GameState.resources["src/images/player_attack.png"].texture, attackPositionX, attackPositionY));
                attackTile(attackPositionX, attackPositionY, 2);
            }
        }
    }
    rotate(GameState.player);
}

function crossAttack() {
    for (let offset = -2; offset <= 2; offset++) {
        for (let sign = -1; sign <= 1; sign += 2) {
            if (offset !== 0 && isNotAWall(GameState.player2.tilePosition.x + offset, GameState.player2.tilePosition.y + offset * sign)) {
                const attackPositionX = GameState.player2.tilePosition.x + offset;
                const attackPositionY = GameState.player2.tilePosition.y + offset * sign;
                createFadingAttack(new FullTileElement(GameState.resources["src/images/player2_attack.png"].texture, attackPositionX, attackPositionY));
                attackTile(attackPositionX, attackPositionY, 2);
            }
        }
    }
    rotate(GameState.player2, false);
}

function rotate(object, clockwise = true) {
    let counter = 0;

    object.animation = function () {
        if (clockwise) object.rotation += 2 * Math.PI / GameState.TURNTIME;
        else object.rotation -= 2 * Math.PI / GameState.TURNTIME;
        counter++;
        if (counter >= GameState.TURNTIME) GameState.APP.ticker.remove(object.animation);
    };

    GameState.APP.ticker.add(object.animation);
}

function switchPlayers() {
    const temp = GameState.player2.zIndex;
    GameState.player2.zIndex = GameState.player.zIndex;
    GameState.player.zIndex = temp;
    if (GameState.primaryPlayer === GameState.player2) {
        GameState.primaryPlayer = GameState.player;
    } else GameState.primaryPlayer = GameState.player2;
}