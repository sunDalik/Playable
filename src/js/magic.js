"use strict";

function fireball() {
    let fire = new PIXI.Sprite(Game.resources["src/images/fire.png"].texture);
    const fireHeight = Game.TILESIZE * 1;
    fire.anchor.set(0, 0.5);
    fire.position.set(Game.player.x, Game.player.y);
    fire.width = Math.sqrt((Game.player2.x - Game.player.x) ** 2 + (Game.player.y - Game.player2.y) ** 2);
    fire.height = fireHeight;
    Game.world.addChild(fire);
    fire.rotation = Math.atan((Game.player2.y - Game.player.y) / (Game.player2.x - Game.player.x));
    if ((Game.player2.x - Game.player.x) < 0) {
        fire.rotation += Math.PI;
    }
    fire.getBounds();
    let fireCorrectVertexData;
    const fv = fire.vertexData;
    const fa = fire.angle >= 0 ? fire.angle : 360 - Math.abs(fire.angle);
    if (fa > 0 && fa <= 90) {
        fireCorrectVertexData = [fv[6], fv[7], fv[0], fv[1], fv[2], fv[3], fv[4], fv[5]]
    } else if (fa > 90 && fa <= 180) {
        fireCorrectVertexData = [fv[4], fv[5], fv[6], fv[7], fv[0], fv[1], fv[2], fv[3]]
    } else if (fa > 180 && fa <= 270) {
        fireCorrectVertexData = [fv[2], fv[3], fv[4], fv[5], fv[6], fv[7], fv[0], fv[1]]
    } else {
        fireCorrectVertexData = [fv[0], fv[1], fv[2], fv[3], fv[4], fv[5], fv[6], fv[7]]
    }
    if (fire.width !== 0) {
        createFadingAttack(fire, false);
        for (const enemy of Game.enemies) {
            if (!enemy.isDead()) {
                if (collisionCheck(fireCorrectVertexData, enemy.vertexData)) {
                    enemy.damage(3);
                    if (enemy.isDead()) {
                        enemy.die();
                    }
                }
            }
        }
    }
}

function teleport() {
    Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = null;
    if (Game.player2.x > Game.player.x) {
        if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x = Game.player.tilePosition.x + 1;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
            Game.player2.tilePosition.x = Game.player.tilePosition.x
        } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
            Game.player2.tilePosition.x = Game.player.tilePosition.x
        } else if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x = Game.player.tilePosition.x - 1;
        }
    } else if (Game.player2.x < Game.player.x) {
        if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x = Game.player.tilePosition.x - 1;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
            Game.player2.tilePosition.x = Game.player.tilePosition.x
        } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
            Game.player2.tilePosition.x = Game.player.tilePosition.x
        } else if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x = Game.player.tilePosition.x + 1;
        }
    } else if (Game.player2.tilePosition.y < Game.player.tilePosition.y) {
        if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x--;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y - 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x++;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
        }
    } else {
        if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x--;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y;
            Game.player2.tilePosition.x++;
        } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
            Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
        }
    }
    Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;
    Game.player2.place();
    centerCamera();
}

function rotateAttack() {
    for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
            if (!(x === 0 && y === 0) && isNotAWall(Game.player.tilePosition.x + x, Game.player.tilePosition.y + y)) {
                const attackPositionX = Game.player.tilePosition.x + x;
                const attackPositionY = Game.player.tilePosition.y + y;
                createFadingAttack(new FullTileElement(Game.resources["src/images/player_attack.png"].texture, attackPositionX, attackPositionY));
                attackTile(attackPositionX, attackPositionY, 2);
                const player = getPlayerOnTile(attackPositionX, attackPositionY);
                if (player !== null) {
                    player.heal(1);
                }
            }
        }
    }
    rotate(Game.player);
}

function crossAttack() {
    for (let offset = -2; offset <= 2; offset++) {
        for (let sign = -1; sign <= 1; sign += 2) {
            if (offset !== 0 && isNotAWall(Game.player2.tilePosition.x + offset, Game.player2.tilePosition.y + offset * sign)) {
                const attackPositionX = Game.player2.tilePosition.x + offset;
                const attackPositionY = Game.player2.tilePosition.y + offset * sign;
                createFadingAttack(new FullTileElement(Game.resources["src/images/player2_attack.png"].texture, attackPositionX, attackPositionY));
                attackTile(attackPositionX, attackPositionY, 2);
                const player = getPlayerOnTile(attackPositionX, attackPositionY);
                if (player !== null) {
                    player.damage(1);
                }
            }
        }
    }
    rotate(Game.player2, false);
}

function rotate(object, clockwise = true) {
    let counter = 0;

    object.animation = function () {
        if (clockwise) object.rotation += 2 * Math.PI / Game.TURNTIME;
        else object.rotation -= 2 * Math.PI / Game.TURNTIME;
        counter++;
        if (counter >= Game.TURNTIME) Game.APP.ticker.remove(object.animation);
    };

    Game.APP.ticker.add(object.animation);
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