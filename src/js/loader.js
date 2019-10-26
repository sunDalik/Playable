"use strict";

function loadAll() {
    GameState.loader
        .add("src/images/player.png")
        .add("src/images/player2.png")
        .add("src/images/fire.png")
        .add("src/images/wall.png")
        .add("src/images/player_attack.png")
        .add("src/images/player2_attack.png")
        .add("src/images/weapon_particle.png")
        .add("src/images/enemy_attack.png")
        .add("src/images/enemies/roller.png")
        .add("src/images/enemies/roller_b.png")
        .add("src/images/enemies/star.png")
        .add("src/images/enemies/star_b.png")
        .add("src/images/grid.png")
        .on("progress", loadProgressHandler)
        .load(setup);
}