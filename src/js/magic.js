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
    const disappearTime = 200;
    const delay = 20;
    let counter = 0;
    animateFire();

    function animateFire() {
        setTimeout(() => {
            if (counter >= delay) {
                fire.alpha -= 0.02;
            }
            counter++;
            if (counter >= 50) app.stage.removeChild(fire);
            else animateFire();
        }, disappearTime / 50);
    }
}

function teleport() {
    if (player2.x > player.x) {
        if (isNotAWall(gameMap, player.tilePosition.x + 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x + 1;
        } else if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isNotAWall(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x - 1;
        }
    }
    else if (player2.x < player.x) {
        if (isNotAWall(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x - 1;
        } else if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
            player2.tilePosition.x = player.tilePosition.x
        } else if (isNotAWall(gameMap, player.tilePosition.x + 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x = player.tilePosition.x + 1;
        }
    } else if (player2.tilePosition.y < player.tilePosition.y) {
        if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
        } else if (isNotAWall(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x--;
        } else if (isNotAWall(gameMap, player.tilePosition.x + 1, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x++;
        } else if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
        }
    } else {
        if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player2.tilePosition.y = player.tilePosition.y + 1;
        } else if (isNotAWall(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x--;
        } else if (isNotAWall(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player2.tilePosition.y = player.tilePosition.y;
            player2.tilePosition.x++;
        } else if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player2.tilePosition.y = player.tilePosition.y - 1;
        }
    }

    player2.move(tileSize);
}

function rotateMagic() {
    if (playerState === "none") {
        playerState = "rotate";
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (!(x === 0 && y === 0) && isNotAWall(gameMap, player.tilePosition.x + x, player.tilePosition.y + y)) {
                    const attack = new TileElement(resources["src/images/player_attack.png"].texture, player.tilePosition.x + x, player.tilePosition.y + y);
                    attack.move(tileSize);
                    app.stage.addChild(attack);
                    const disappearTime = 200;
                    const delay = 20;
                    let counter = 0;
                    animateAttack();

                    function animateAttack() {
                        setTimeout(() => {
                            if (counter >= delay) {
                                attack.alpha -= 0.02;
                            }
                            counter++;
                            if (counter < 50) animateAttack();
                            else app.stage.removeChild(attack);
                        }, disappearTime / 50);
                    }
                }
            }
        }

        player.setAnchorToCenter();
        const rotateTime = 200;
        let counter = 0;
        animateRotation();

        function animateRotation() {
            setTimeout(() => {
                player.rotation += 2 * Math.PI / 50;
                counter++;
                if (counter >= 50) {
                    player.resetAnchor();
                    playerState = "none";
                } else animateRotation();
            }, rotateTime / 50);
        }
    }
}