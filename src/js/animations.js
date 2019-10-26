function createWeaponAnimation(tileX1, tileY1, tileX2, tileY2) {
    let counter = 0;
    let attackParticles = [new TileElement(GameState.resources["src/images/weapon_particle.png"].texture, tileX1, tileY1),
        new TileElement(GameState.resources["src/images/weapon_particle.png"].texture, tileX1, tileY1),
        new TileElement(GameState.resources["src/images/weapon_particle.png"].texture, tileX1, tileY1)];
    for (const particle of attackParticles) {
        particle.width = GameState.TILESIZE / 2;
        particle.height = GameState.TILESIZE / 2;
        particle.place();
        console.log(particle);
    }
    const stepX = (tileX2 - tileX1) / (GameState.TURNTIME / 2);
    const stepY = (tileY2 - tileY1) / (GameState.TURNTIME / 2);

    function animate() {
        if (counter < GameState.TURNTIME / 2) {
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
        if (counter >= GameState.TURNTIME) {
            GameState.APP.ticker.remove(this);
        }
    }

    GameState.APP.ticker.add(animate);
}