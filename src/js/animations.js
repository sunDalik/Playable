"use strict";

function createWeaponAnimation(tileX1, tileY1, tileX2, tileY2) {
    let counter = 0;
    const startPosX = tileX1 + 0.2 * Math.sign(tileX2 - tileX1);
    const startPosY = tileY1 + 0.2 * Math.sign(tileY2 - tileY1);
    let attackParticles = [new TileElement(Game.resources["src/images/weapon_particle.png"].texture, startPosX, startPosY),
        new TileElement(Game.resources["src/images/weapon_particle.png"].texture, startPosX, startPosY),
        new TileElement(Game.resources["src/images/weapon_particle.png"].texture, startPosX, startPosY)];
    attackParticles[0].alpha = 0.8;
    attackParticles[1].alpha = 0.6;
    attackParticles[2].alpha = 0.4;
    for (const particle of attackParticles) {
        particle.width = Game.TILESIZE / 5;
        particle.height = Game.TILESIZE / 5;
        particle.place();
        Game.gameWorld.addChild(particle);
    }
    const stepX = (tileX2 - tileX1) * Game.TILESIZE / (Game.WEAPON_ATTACK_TIME / 2);
    const stepY = (tileY2 - tileY1) * Game.TILESIZE / (Game.WEAPON_ATTACK_TIME / 2);

    let animation = function () {
        if (counter < Game.WEAPON_ATTACK_TIME / 2) {
            attackParticles[0].position.x += stepX;
            attackParticles[0].position.y += stepY;
            if (counter >= 1) {
                attackParticles[1].position.x += stepX;
                attackParticles[1].position.y += stepY;
            }
            if (counter >= 2) {
                attackParticles[2].position.x += stepX;
                attackParticles[2].position.y += stepY;
            }
        } else {
            for (const particle of attackParticles) {
                particle.position.x -= stepX;
                particle.position.y -= stepY
            }
        }
        counter++;
        if (counter >= Game.WEAPON_ATTACK_TIME) {
            for (const particle of attackParticles) {
                Game.gameWorld.removeChild(particle);
            }
            Game.APP.ticker.remove(animation);
        }
    };

    Game.APP.ticker.add(animation);
}

function createFadingAttack(attack, tileAttack = true) {
    if (tileAttack) attack.place();
    Game.gameWorld.addChild(attack);
    Game.tiles.push(attack);
    const delay = Game.TURNTIME / 2;
    let counter = 0;

    let animation = function () {
        if (counter >= delay) {
            attack.alpha -= 1 / Game.TURNTIME;
        }
        counter++;
        if (counter >= Game.TURNTIME) {
            Game.APP.ticker.remove(animation);
            Game.gameWorld.removeChild(attack);
            removeObjectFromArray(attack, Game.tiles);
        }
    };
    Game.APP.ticker.add(animation);
}