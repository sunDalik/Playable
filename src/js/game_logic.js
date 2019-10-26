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

function movePlayer(player, tileStepX, tileStepY) {
    if (tileStepX !== 0) {
        if (isEnemy(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            player.attack(tileStepX, 0);
        } else if (isNotAWall(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
            player.stepX(tileStepX);
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
        }
    } else if (tileStepY !== 0) {
        if (isEnemy(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            player.attack(0, tileStepY);
        } else if (isNotAWall(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
            player.stepY(tileStepY);
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
        }
    }
}