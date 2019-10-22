"use strict";

function moveEnemies() {
    if (GameState.enemiesTimeout === null) {
        GameState.enemiesTimeout = setTimeout(() => {
            for (const enemy of GameState.enemies) {
                enemy.cancelAnimation();
                enemy.move();
            }
            GameState.enemiesTimeout = null;
        }, 60);
    }
}

function attackTile(attackPositionX, attackPositionY) {
    if (["r"].includes(GameState.gameMap[attackPositionY][attackPositionX])) {
        for (const enemy of GameState.enemies) {
            if (!enemy.isDead() && enemy.tilePosition.x === attackPositionX && enemy.tilePosition.y === attackPositionY) {
                enemy.damage(100);
                if (enemy.isDead()) {
                    GameState.gameMap[enemy.tilePosition.y][enemy.tilePosition.x] = "";
                    enemy.visible = false;
                    break;
                }
            }
        }
    }
}

function damagePlayer(player, damage) {
    player.damage(damage);
}

function playerTurn(player, playerMove, bothPlayers = false) {
    if (GameState.enemiesTimeout !== null) {
        clearTimeout(GameState.enemiesTimeout);
        for (const enemy of GameState.enemies) {
            enemy.cancelAnimation();
            enemy.move();
        }
        GameState.enemiesTimeout = null;
        moveEnemies();
    }

    if (bothPlayers) {
        GameState.player.cancelAnimation();
        GameState.player2.cancelAnimation();
    } else player.cancelAnimation();
    playerMove();
    moveEnemies();
}

function getPlayerOnTile(tilePositionX, tilePositionY) {
    if (tilePositionX <= GameState.gameMap[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= GameState.gameMap.length - 1 && tilePositionY >= 0) {
            if (GameState.gameMap[tilePositionY][tilePositionX] === "p1") return GameState.player;
            if (GameState.gameMap[tilePositionY][tilePositionX] === "p2") return GameState.player2;
        }
    }
    return null;
}

function movePlayer(player, tileStepX, tileStepY) {
    const playerSymbol = player === GameState.player ? "p1" : "p2";
    if (tileStepX !== 0) {
        if (isNotAWall(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x] = "";
            player.stepX(tileStepX);
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x] = playerSymbol;
        }
    } else if (tileStepY !== 0) {
        if (isNotAWall(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x] = "";
            player.stepY(tileStepY);
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x] = playerSymbol;
        }
    }
}

function isNotAWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (GameState.gameMap[tilePositionY][tilePositionX] !== "w") {
            return true
        }
    }
    return false;
}

function isNotOutOfMap(tilePositionX, tilePositionY) {
    if (tilePositionX <= GameState.gameMap[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= GameState.gameMap.length - 1 && tilePositionY >= 0) {
            return true
        }
    }
    return false;
}