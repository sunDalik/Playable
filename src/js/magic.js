function fireball() {
    let fire = new PIXI.Sprite(resources["src/images/fire.png"].texture);
    const fireHeight = tileSize * 0.4;
    fire.position.set(player.x + player.width / 2, player.y + player.height / 2 - fireHeight / 2);
    fire.width = Math.sqrt((player2.x - player.x) ** 2 + (player.y - player2.y) ** 2);
    fire.height = fireHeight;
    app.stage.addChild(fire);
    fire.rotation = Math.atan((player2.y - player.y) / (player2.x - player.x));
    if ((player2.x - player.x) < 0) {
        fire.rotation += Math.PI;
    }
    createFadingAttack(fire, false);
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

    player2.place(tileSize);
}

function rotateAttack() {
    if (player.state === "none") {
        player.state = "rotate";
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (!(x === 0 && y === 0) && isNotAWall(gameMap, player.tilePosition.x + x, player.tilePosition.y + y)) {
                    const attackPositionX = player.tilePosition.x + x;
                    const attackPositionY = player.tilePosition.y + y;
                    createFadingAttack(new TileElement(resources["src/images/player_attack.png"].texture, attackPositionX, attackPositionY));
                    attackTile(gameMap, attackPositionX, attackPositionY);
                }
            }
        }
        rotate(player);
    }
}

function crossAttack() {
    if (player2.state === "none") {
        player2.state = "cross";
        for (let offset = -2; offset <= 2; offset++) {
            for (let sign = -1; sign < 2; sign += 2) {
                if (offset !== 0 && isNotAWall(gameMap, player2.tilePosition.x + offset, player2.tilePosition.y + offset * sign)) {
                    const attackPositionX = player2.tilePosition.x + offset;
                    const attackPositionY = player2.tilePosition.y + offset * sign;
                    createFadingAttack(new TileElement(resources["src/images/player2_attack.png"].texture, attackPositionX, attackPositionY));
                    attackTile(gameMap, attackPositionX, attackPositionY);
                }
            }
        }
        rotate(player2, false);
    }
}

function rotate(object, clockwise = true) {
    object.setAnchorToCenter();
    const rotateTime = 200;
    let counter = 0;
    let animation = {};
    animateRotation();

    function animateRotation() {
        animation.timeout = setTimeout(() => {
            if (clockwise) object.rotation += 2 * Math.PI / 50;
            else object.rotation -= 2 * Math.PI / 50;
            counter++;
            if (counter < 50) animateRotation();
            else {
                object.resetAnchor();
                object.state = "none";
            }
        }, rotateTime / 50);
    }

    return animation; // animation.timeout can be cancelled
}

function createFadingAttack(attack, tileAttack = true) {
    if (tileAttack) attack.place(tileSize);
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