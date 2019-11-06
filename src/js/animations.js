"use strict";

function createPlayerWeaponAnimation(tileX1, tileY1, tileX2, tileY2, thin = false) {
    let attackParticle = new PIXI.Sprite(Game.resources["src/images/weapon_particle.png"].texture);
    if (thin) {
        attackParticle.width = Game.TILESIZE / 5;
        attackParticle.height = Game.TILESIZE / 5;
    } else {
        attackParticle.width = Game.TILESIZE / 3;
        attackParticle.height = Game.TILESIZE / 3;
    }
    if (tileX2 > tileX1) attackParticle.anchor.set(0, 0.5);
    else if (tileX2 < tileX1) attackParticle.anchor.set(1, 0.5);
    else if (tileY2 > tileY1) attackParticle.anchor.set(0.5, 0);
    else if (tileY2 < tileY1) attackParticle.anchor.set(0.5, 1);
    centerAttackParticleToPlayer();
    Game.world.addChild(attackParticle);
    const stepX = Math.abs(tileX2 - tileX1) * Game.TILESIZE / (Game.WEAPON_ATTACK_TIME / 2);
    const stepY = Math.abs(tileY2 - tileY1) * Game.TILESIZE / (Game.WEAPON_ATTACK_TIME / 2);
    if (stepX === 0) attackParticle.height = 0;
    if (stepY === 0) attackParticle.width = 0;

    let counter = 0;
    let animation = function () {
        if (counter < Game.WEAPON_ATTACK_TIME / 2) {
            attackParticle.width += stepX;
            attackParticle.height += stepY;
            centerAttackParticleToPlayer()
        } else {
            attackParticle.width -= stepX;
            attackParticle.height -= stepY;
            centerAttackParticleToPlayer()
        }
        counter++;
        if (counter >= Game.WEAPON_ATTACK_TIME) {
            Game.world.removeChild(attackParticle);
            Game.APP.ticker.remove(animation);
        }
    };
    Game.APP.ticker.add(animation);

    function centerAttackParticleToPlayer() {
        attackParticle.position.x = Game.TILESIZE * tileX1 + (Game.TILESIZE - Game.player.width) / 2 + Game.player.width / 2;
        attackParticle.position.y = Game.TILESIZE * tileY1 + (Game.TILESIZE - Game.player.height) / 2 + Game.player.height / 2;
    }
}

function createFadingAttack(attack, tileAttack = true) {
    if (tileAttack) attack.place();
    Game.world.addChild(attack);
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
            Game.world.removeChild(attack);
            removeObjectFromArray(attack, Game.tiles);
        }
    };
    Game.APP.ticker.add(animation);
}

function createFadingText(caption, positionX, positionY) {
    const TEXT_ANIMATION_TIME = 80;
    let counter = 0;
    let text = new PIXI.Text(caption, {
        fontSize: Game.TILESIZE / 65 * 26,
        fill: 0xffffff,
        fontWeight: "bold",
        stroke: 0x000000,
        strokeThickness: 1
    });
    text.position.set(positionX - text.width / 2, positionY - text.height * 1.5);
    text.zIndex = 99;
    Game.world.addChild(text);
    const stepY = Game.TILESIZE / 65 * 30 / TEXT_ANIMATION_TIME;
    const alphaStep = 1 / TEXT_ANIMATION_TIME;

    let animation = () => {
        text.position.y -= stepY;
        if (counter >= TEXT_ANIMATION_TIME / 2) {
            text.alpha -= alphaStep;
        }
        counter++;
        if (counter >= TEXT_ANIMATION_TIME) {
            Game.world.removeChild(text);
            Game.APP.ticker.remove(animation);
        }
    };

    Game.APP.ticker.add(animation);
}