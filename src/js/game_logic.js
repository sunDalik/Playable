"use strict";

function moveEnemies() {
    if (GameState.enemiesTimeout === null) {
        GameState.enemiesTimeout = setTimeout(() => {
            for (const enemy of GameState.enemies) {
                if (!enemy.isDead()) {
                    enemy.cancelAnimation();
                    enemy.move();
                }
            }
            GameState.enemiesTimeout = null;
        }, 60);
    }
}

function attackTile(attackPositionX, attackPositionY) {
    const tileEntity = (GameState.gameMap[attackPositionY][attackPositionX]).entity;
    if (tileEntity !== null && tileEntity.role === ROLE.ENEMY) {
        if (!tileEntity.isDead()) {
            tileEntity.damage(100);
            if (tileEntity.isDead()) {
                GameState.gameMap[tileEntity.tilePosition.y][tileEntity.tilePosition.x].entity = null;
                tileEntity.cancelAnimation();
                tileEntity.visible = false;
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
            if (!enemy.isDead()) {
                enemy.cancelAnimation();
                enemy.move();
            }
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
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        const tileEntity = GameState.gameMap[tilePositionY][tilePositionX].entity;
        if (tileEntity !== null && tileEntity.role === ROLE.PLAYER) return tileEntity;
    }
    return null;
}


//also check on collisions with enemy and if player tries to steps on enemy it attacks instead
function movePlayer(player, tileStepX, tileStepY) {
    if (tileStepX !== 0) {
        if (isNotAWall(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
            player.stepX(tileStepX);
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
        }
    } else if (tileStepY !== 0) {
        if (isNotAWall(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
            player.stepY(tileStepY);
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
        }
    }
}

function isNotAWall(tilePositionX, tilePositionY) {
    if (isNotOutOfMap(tilePositionX, tilePositionY)) {
        if (GameState.gameMap[tilePositionY][tilePositionX].wall === false) {
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