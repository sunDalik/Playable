"use strict";

function fireball() {
    let fire = new PIXI.Sprite(resources["src/images/fire.png"].texture);
    const fireHeight = GameState.TILESIZE * 0.4;
    fire.anchor.set(0, 0.5);
    fire.position.set(GameState.player.x, GameState.player.y - fireHeight / 2);
    fire.width = Math.sqrt((GameState.player2.x - GameState.player.x) ** 2 + (GameState.player.y - GameState.player2.y) ** 2);
    fire.height = fireHeight;
    app.stage.addChild(fire);
    fire.rotation = Math.atan((GameState.player2.y - GameState.player.y) / (GameState.player2.x - GameState.player.x));
    if ((GameState.player2.x - GameState.player.x) < 0) {
        fire.rotation += Math.PI;
    }
    createFadingAttack(fire, false);
}

function teleport() {
    if (GameState.player2.x > GameState.player.x) {
        if (isNotAWall(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x + 1;
        } else if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWall(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x - 1;
        }
    }
    else if (GameState.player2.x < GameState.player.x) {
        if (isNotAWall(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x - 1;
        } else if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x
        } else if (isNotAWall(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x = GameState.player.tilePosition.x + 1;
        }
    } else if (GameState.player2.tilePosition.y < GameState.player.tilePosition.y) {
        if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
        } else if (isNotAWall(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x--;
        } else if (isNotAWall(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x++;
        } else if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
        }
    } else {
        if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y + 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y + 1;
        } else if (isNotAWall(GameState.player.tilePosition.x - 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x--;
        } else if (isNotAWall(GameState.player.tilePosition.x + 1, GameState.player.tilePosition.y)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y;
            GameState.player2.tilePosition.x++;
        } else if (isNotAWall(GameState.player.tilePosition.x, GameState.player.tilePosition.y - 1)) {
            GameState.player2.tilePosition.y = GameState.player.tilePosition.y - 1;
        }
    }

    GameState.player2.place();
}

function rotateAttack() {
    for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
            if (!(x === 0 && y === 0) && isNotAWall(GameState.player.tilePosition.x + x, GameState.player.tilePosition.y + y)) {
                const attackPositionX = GameState.player.tilePosition.x + x;
                const attackPositionY = GameState.player.tilePosition.y + y;
                createFadingAttack(new TileElement(resources["src/images/player_attack.png"].texture, attackPositionX, attackPositionY));
                attackTile(attackPositionX, attackPositionY);
            }
        }
    }
    rotate(GameState.player);
}

function crossAttack() {
    for (let offset = -2; offset <= 2; offset++) {
        for (let sign = -1; sign < 2; sign += 2) {
            if (offset !== 0 && isNotAWall(GameState.player2.tilePosition.x + offset, GameState.player2.tilePosition.y + offset * sign)) {
                const attackPositionX = GameState.player2.tilePosition.x + offset;
                const attackPositionY = GameState.player2.tilePosition.y + offset * sign;
                createFadingAttack(new TileElement(resources["src/images/player2_attack.png"].texture, attackPositionX, attackPositionY));
                attackTile(attackPositionX, attackPositionY);
            }
        }
    }
    rotate(GameState.player2, false);
}

function rotate(object, clockwise = true) {
    const rotateTime = 200;
    let counter = 0;
    animateRotation();

    function animateRotation() {
        object.animation = setTimeout(() => {
            if (clockwise) object.rotation += 2 * Math.PI / 50;
            else object.rotation -= 2 * Math.PI / 50;
            counter++;
            if (counter < 50) animateRotation();
            else {
            }
        }, rotateTime / 50);
    }
}

function createFadingAttack(attack, tileAttack = true) {
    if (tileAttack) attack.place();
    app.stage.addChild(attack);
    const disappearTime = 200;
    const delay = 50 / 2.5;
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