"use strict";

function enemyTurn() {
    if (Game.enemiesTimeout === null) {
        Game.enemiesTimeout = setTimeout(() => {
            moveEnemies();
            updateHazards();
            Game.enemiesTimeout = null;
        }, 60);
    }
}

function moveEnemies() {
    for (const enemy of Game.enemies) {
        if (!enemy.isDead()) {
            if (enemy.cancellable) {
                enemy.cancelAnimation();
            }
            enemy.move();
        }
    }
}

function updateHazards() {
    for (const hazard of Game.hazards) {
        hazard.updateLifetime();
    }
}

function attackTile(attackPositionX, attackPositionY, atk, inputX, inputY) {
    const tileEntity = Game.gameMap[attackPositionY][attackPositionX].entity;
    if (tileEntity != null && tileEntity.role === ROLE.ENEMY) {
        if (!tileEntity.isDead()) {
            tileEntity.damage(atk);
            if (tileEntity.isDead()) {
                Game.gameMap[tileEntity.tilePosition.y][tileEntity.tilePosition.x].entity = null;
                tileEntity.cancelAnimation();
                tileEntity.visible = false;
            } else if (tileEntity.entityType === ENEMY_TYPE.SPIDER || tileEntity.entityType === ENEMY_TYPE.SPIDER_B) {
                tileEntity.throwAway(inputX, inputY);
            }
        }
    }
}

function playerTurn(player, playerMove, bothPlayers = false) {
    if (/*Game.playerMoved !== player
        &&*/ ((bothPlayers && !Game.player.dead && !Game.player2.dead) || (!bothPlayers && !player.dead))) {
        if (Game.enemiesTimeout !== null) {
            clearTimeout(Game.enemiesTimeout);
            moveEnemies();
            updateHazards();
            Game.enemiesTimeout = null;
        }

        if (bothPlayers) {
            Game.player.cancelAnimation();
            Game.player2.cancelAnimation();
        } else player.cancelAnimation();
        playerMove();
        damagePlayersWithHazards();
        /*if (Game.playerMoved !== null) {
            Game.playerMoved.setUnmovedTexture();
            Game.playerMoved = null;*/
        enemyTurn();
        /*} else {
            Game.playerMoved = player;
            Game.playerMoved.setMovedTexture();
        }*/
    }
}

function damagePlayersWithHazards() {
    if (Game.gameMap[Game.player.tilePosition.y][Game.player.tilePosition.x].hazard !== null && !Game.player.dead) {
        Game.player.damage(Game.gameMap[Game.player.tilePosition.y][Game.player.tilePosition.x].hazard.atk)
    }
    if (Game.gameMap[Game.player2.tilePosition.y][Game.player2.tilePosition.x].hazard !== null && !Game.player2.dead) {
        Game.player2.damage(Game.gameMap[Game.player2.tilePosition.y][Game.player2.tilePosition.x].hazard.atk)
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
    if (player === Game.primaryPlayer) {
        Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
        if (Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity !== null && Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity.role === ROLE.PLAYER) {
            Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity = Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity;
            Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
        }
    } else {
        if (player === Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity) {
            Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
        } else {
            Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity = null;
        }
    }
}

function placePlayerOnGameMap(player) {
    if (Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity !== null && Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity.role === ROLE.PLAYER) {
        if (player === Game.primaryPlayer) {
            Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity;
            Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
        } else {
            Game.gameMap[player.tilePosition.y][player.tilePosition.x].secondaryEntity = player;
        }
    } else {
        Game.gameMap[player.tilePosition.y][player.tilePosition.x].entity = player;
    }
}