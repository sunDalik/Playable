import {Game} from "../../game";
import {getEffectivePlayerCenter} from "../../utils/game_utils";
import {areWeInTheBossRoom} from "../../game_logic";

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
        }
    };

    camera.animation = animation;
    if (time === 0) camera.setup(x, y);
    else Game.app.ticker.add(animation);
};

camera.setup = (x, y) => {
    Game.world.position.x = Game.app.renderer.screen.width / 2 - x * Game.world.scale.x;
    Game.world.position.y = Game.app.renderer.screen.height / 2 - y * Game.world.scale.y;
    camera.x = x;
    camera.y = y;
    Game.app.ticker.remove(camera.animation);
    camera.animation = null;
};

camera.center = () => {
    camera.moveToCenter(0);
};

camera.moveToCenter = (animationTime) => {
    const endRoomTime = animationTime === 0 ? 0 : 15;
    if (Game.player.dead && Game.player2.dead) return;
    if (areWeInTheBossRoom()) {
        camera.setNewPoint((Game.endRoomBoundaries[0].x + (Game.endRoomBoundaries[1].x - Game.endRoomBoundaries[0].x) / 2) * Game.TILESIZE + Game.TILESIZE / 2,
            (Game.endRoomBoundaries[0].y + (Game.endRoomBoundaries[1].y - Game.endRoomBoundaries[0].y) / 2) * Game.TILESIZE + Game.TILESIZE / 2, endRoomTime);
    } else camera.setNewPoint(getEffectivePlayerCenter().x, getEffectivePlayerCenter().y, animationTime);
};