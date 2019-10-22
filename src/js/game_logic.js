function moveEnemies() {
    if (GameState.enemiesTimeout === null) {
        GameState.enemiesTimeout = setTimeout(() => {
            for (const enemy of GameState.enemies) enemy.move();
            GameState.enemiesTimeout = null;
        }, 60);
    }
}


function addEnemyToStage(enemy) {
    enemy.place();
    app.stage.addChild(enemy);
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

function playerTurn(player, playerMove, bothPlayers = false) {
    if (GameState.enemiesTimeout !== null) {
        clearTimeout(GameState.enemiesTimeout);
        for (const enemy of GameState.enemies) enemy.move();
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

function isNotAWall(tilePositionX, tilePositionY) {
    if (tilePositionX <= GameState.gameMap[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= GameState.gameMap.length - 1 && tilePositionY >= 0) {
            if (GameState.gameMap[tilePositionY][tilePositionX] !== "w") {
                return true
            }
        }
    }
    return false;
}

function movePlayer(player, tileStepX, tileStepY) {
    if (tileStepX !== 0) {
        if (isNotAWall(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            player.stepX(tileStepX);
        }
    } else if (tileStepY !== 0) {
        if (isNotAWall(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            player.stepY(tileStepY);
        }
    }
}