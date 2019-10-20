function fireball() {
    let fire = new Sprite(resources["src/images/fire.png"].texture);
    const fireHeight = tileSize * 0.4;
    fire.position.set(player.x + player.width / 2, player.y + player.height / 2 - fireHeight / 2);
    fire.width = Math.sqrt((player2.x - player.x) ** 2 + (player.y - player2.y) ** 2);
    fire.height = fireHeight;
    app.stage.addChild(fire);
    fire.rotation = Math.atan((player2.y - player.y) / (player2.x - player.x));
    if ((player2.x - player.x) < 0) {
        fire.rotation += Math.PI;
    }
    const disappearTime = 300;
    let delay = 40;
    const interval = setInterval(() => {
        if (delay <= 0) {
            fire.alpha -= 0.01;
        }
        delay--;
    }, disappearTime / 100);
    setTimeout(() => {
        app.stage.removeChild(fire);
        clearInterval(interval);
    }, disappearTime)
}

function teleport() {
    if (player2.x > player.x) {
        if (isMovementPossible(gameMap, player.tilePosition.x + 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x + 1;
        } else if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isMovementPossible(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x - 1;
        }
    }
    else if (player2.x < player.x) {
        if (isMovementPossible(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x - 1;
        } else if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isMovementPossible(gameMap, player.tilePosition.x + 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x + 1;
        }
    } else if (player2.tilePosition.y < player.tilePosition.y) {
        if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
        } else if (isMovementPossible(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x--;
        } else if (isMovementPossible(gameMap, player.tilePosition.x + 1, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x++;
        } else if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
        }
    } else {
        if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
        } else if (isMovementPossible(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x--;
        } else if (isMovementPossible(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x++;
        } else if (isMovementPossible(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
        }
    }

    player2.move(tileSize);
}

function rotateMagic() {
    if (playerState === "none") {
        playerState = "rotate";
        const rotateTime = 250;
        let i = 0;
        player.setAnchorToCenter();
        const interval = setInterval(() => {
            player.rotation += 2 * Math.PI / 50;
            i++;
            if (i >= 50) {
                clearInterval(interval);
                player.resetAnchor();
                playerState = "none";
            }
        }, rotateTime / 50);
    }
}