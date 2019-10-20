class Player extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.state = "none";
        this.animation = null;
    }

    step(tileStepX) {
        clearTimeout(this.animation);
        this.place(tileSize);
        this.tilePosition.x += tileStepX;
        const frequency = 25;
        const jumpHeight = 25;
        const a = jumpHeight / ((tileStepX * tileSize / 2) ** 2);
        const b = -(this.position.x + (tileStepX * tileSize) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        let counter = 0;
        let player = this;
        const stepX = tileStepX * tileSize / frequency;
        animate();

        function animate() {
            player.animation = setTimeout(() => {
                player.position.x += stepX;
                player.position.y = a * (player.position.x ** 2) + b * player.position.x + c;
                counter++;
                if (counter < frequency) animate();
                else {
                    player.animation = null;
                    player.place(tileSize);
                }
            }, 2)
        }
    }
}