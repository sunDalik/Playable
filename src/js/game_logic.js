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
        if (!enemy.dead) {
            if (enemy.stun <= 0) {
                if (enemy.cancellable) {
                    enemy.cancelAnimation();
                }
                enemy.move();
            } else enemy.stun--;
        }
    }
}

function updateHazards() {
    for (const hazard of Game.hazards) {
        hazard.updateLifetime();
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
    if (Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].hazard !== null && !Game.player.dead) {
        Game.player.damage(Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].hazard.atk)
    }
    if (Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].hazard !== null && !Game.player2.dead) {
        Game.player2.damage(Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].hazard.atk)
    }
}

function removePlayerFromGameMap(player) {
    if (player === Game.primaryPlayer) {
        Game.map[player.tilePosition.y][player.tilePosition.x].entity = null;
        if (Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity !== null && Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity.role === ROLE.PLAYER) {
            Game.map[player.tilePosition.y][player.tilePosition.x].entity = Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity;
            Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
        }
    } else {
        if (player === Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity) {
            Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
        } else {
            Game.map[player.tilePosition.y][player.tilePosition.x].entity = null;
        }
    }
}

function placePlayerOnGameMap(player) {
    if (Game.map[player.tilePosition.y][player.tilePosition.x].entity !== null && Game.map[player.tilePosition.y][player.tilePosition.x].entity.role === ROLE.PLAYER) {
        if (player === Game.primaryPlayer) {
            Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = Game.map[player.tilePosition.y][player.tilePosition.x].entity;
            Game.map[player.tilePosition.y][player.tilePosition.x].entity = player;
        } else {
            Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = player;
        }
    } else {
        Game.map[player.tilePosition.y][player.tilePosition.x].entity = player;
    }
}

function switchPlayers() {
    let temp = Game.player2.zIndex;
    Game.player2.zIndex = Game.player.zIndex;
    Game.player.zIndex = temp;
    if (Game.primaryPlayer === Game.player2) {
        Game.primaryPlayer = Game.player;
    } else Game.primaryPlayer = Game.player2;
    if (Game.player.tilePosition.x === Game.player2.tilePosition.x
        && Game.player.tilePosition.y === Game.player2.tilePosition.y) {
        temp = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity = temp;
    }
}