function createWeaponAnimation(tileX1, tileY1, tileX2, tileY2) {
    let counter = 0;
    const startPosX = tileX1 + 0.3 * Math.sign(tileX2 - tileX1);
    const startPosY = tileY1 + 0.3 * Math.sign(tileY2 - tileY1);
    let attackParticles = [new TileElement(GameState.resources["src/images/weapon_particle.png"].texture, startPosX, startPosY),
        new TileElement(GameState.resources["src/images/weapon_particle.png"].texture, startPosX, startPosY),
        new TileElement(GameState.resources["src/images/weapon_particle.png"].texture, startPosX, startPosY)];
    attackParticles[0].alpha = 0.8;
    attackParticles[1].alpha = 0.6;
    attackParticles[2].alpha = 0.4;
    for (const particle of attackParticles) {
        particle.width = GameState.TILESIZE / 5;
        particle.height = GameState.TILESIZE / 5;
        particle.place();
        GameState.APP.stage.addChild(particle);
    }
    const stepX = (tileX2 - tileX1) * GameState.TILESIZE / (GameState.WEAPON_ATTACK_TIME / 2);
    const stepY = (tileY2 - tileY1) * GameState.TILESIZE / (GameState.WEAPON_ATTACK_TIME / 2);

    let animation = function () {
        if (counter < GameState.WEAPON_ATTACK_TIME / 2) {
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
        if (counter >= GameState.WEAPON_ATTACK_TIME) {
            for (const particle of attackParticles) {
                GameState.APP.stage.removeChild(particle);
            }
            GameState.APP.ticker.remove(animation);
        }
    };

    GameState.APP.ticker.add(animation);
}

function createFadingAttack(attack, tileAttack = true) {
    if (tileAttack) attack.place();
    app.stage.addChild(attack);
    const delay = GameState.TURNTIME / 2;
    let counter = 0;

    let animation = function () {
        if (counter >= delay) {
            attack.alpha -= 1 / GameState.TURNTIME;
        }
        counter++;
        if (counter >= GameState.TURNTIME) {
            GameState.APP.ticker.remove(animation);
            GameState.APP.stage.removeChild(attack);
        }
    };
    GameState.APP.ticker.add(animation);
}