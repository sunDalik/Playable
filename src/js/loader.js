function loadAll() {
    loader
        .add("src/images/player.png")
        .add("src/images/player2.png")
        .add("src/images/fire.png")
        .add("src/images/wall.png")
        .add("src/images/player_attack.png")
        .add("src/images/player2_attack.png")
        .add("src/images/enemies/roller.png")
        .on("progress", loadProgressHandler)
        .load(setup);
}