import {Game} from "../../game";
import {getEffectivePlayerCenter} from "../../utils/game_utils";

export const camera = {
    animation: null,
    x: 0,
    y: 0
};

camera.setNewPoint = (x, y, time) => {
    const stepX = (x - camera.x) / time;
    const stepY = (y - camera.y) / time;
    let counter = 0;
    if (camera.animation) Game.app.ticker.remove(camera.animation);
    const animation = (delta) => {
        counter += delta;
        Game.world.position.x -= stepX * delta * Game.world.scale.x;
        Game.world.position.y -= stepY * delta * Game.world.scale.y;
        camera.x += stepX * delta;
        camera.y += stepY * delta;
        if (counter >= time) {
            camera.setup(x, y);
            Game.app.ticker.remove(animation);
            camera.animation = null;
        }
    };

    camera.animation = animation;
    Game.app.ticker.add(animation);
};

camera.setup = (x, y) => {
    Game.world.position.x = Game.app.renderer.screen.width / 2 - x * Game.world.scale.x;
    Game.world.position.y = Game.app.renderer.screen.height / 2 - y * Game.world.scale.y;
    camera.x = x;
    camera.y = y;
};

camera.center = () => {
    camera.setup(getEffectivePlayerCenter().x, getEffectivePlayerCenter().y);
};