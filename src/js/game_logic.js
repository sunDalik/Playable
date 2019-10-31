"use strict";

function enemyTurn() {
    if (GameState.enemiesTimeout === null) {
        GameState.enemiesTimeout = setTimeout(() => {
            moveEnemies();
            updateHazards();
            GameState.enemiesTimeout = null;
        }, 60);
    }
}

function moveEnemies() {
    for (const enemy of GameState.enemies) {
        if (!enemy.isDead()) {
            if (enemy.cancellable) {
                enemy.cancelAnimation();
            }
            enemy.move();
        }
    }
}

function updateHazards() {
    for (const hazard of GameState.hazards) {
        hazard.updateLifetime();
    }
}

function attackTile(attackPositionX, attackPositionY, atk, inputX, inputY) {
    const tileEntity = GameState.gameMap[attackPositionY][attackPositionX].entity;
    if (tileEntity != null && tileEntity.role === ROLE.ENEMY) {
        if (!tileEntity.isDead()) {
            tileEntity.damage(atk);
            if (tileEntity.isDead()) {
                GameState.gameMap[tileEntity.tilePosition.y][tileEntity.tilePosition.x].entity = null;
                tileEntity.cancelAnimation();
                tileEntity.visible = false;
            } else if (tileEntity.entityType === ENEMY_TYPE.SPIDER || tileEntity.entityType === ENEMY_TYPE.SPIDER_B) {
                tileEntity.throwAway(inputX, inputY);
            }
        }
    }
}

function playerTurn(player, playerMove, bothPlayers = false) {
    if ((bothPlayers && !GameState.player.dead && !GameState.player2.dead) || (!bothPlayers && !player.dead)) {
        if (GameState.enemiesTimeout !== null) {
            clearTimeout(GameState.enemiesTimeout);
            moveEnemies();
            updateHazards();
            GameState.enemiesTimeout = null;
            enemyTurn();
        }

        if (bothPlayers) {
            GameState.player.cancelAnimation();
            GameState.player2.cancelAnimation();
        } else player.cancelAnimation();
        playerMove();
        damagePlayersWithHazards();
        enemyTurn();
    }
}

function damagePlayersWithHazards() {
    if (GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x].hazard !== null && !GameState.player.dead) {
        GameState.player.damage(GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x].hazard.atk)
    }
    if (GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x].hazard !== null && !GameState.player2.dead) {
        GameState.player2.damage(GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x].hazard.atk)
    }
}

function movePlayer(player, tileStepX, tileStepY) {
    if (tileStepX !== 0) {
        if (isEnemy(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            player.attack(tileStepX, 0);
        } else if (isNotAWall(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            removePlayerFromGameMap(player);
            player.stepX(tileStepX);
            placePlayerOnGameMap(player);
        }
    } else if (tileStepY !== 0) {
        if (isEnemy(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            player.attack(0, tileStepY);
        } else if (isNotAWall(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            removePlayerFromGameMap(player);
            player.stepY(tileStepY);
            placePlayerOnGameMap(player);
        }
    }
}

function removePlayerFromGameMap(player) {
    if (player === GameState.primaryPlayer) {
        GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
        if (GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity !== null && GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity.role === ROLE.PLAYER) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity;
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
        }
    } else {
        if (player === GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
        } else {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
        }
    }
}

function placePlayerOnGameMap(player) {
    if (GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity !== null && GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity.role === ROLE.PLAYER) {
        if (player === GameState.primaryPlayer) {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity;
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
        } else {
            GameState.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = player;
        }
    } else {
        GameState.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
    }
}