import {Game} from "../game";
import {keyboard} from "./keyboard_handler";
import {playerTurn, switchPlayers} from "../game_logic";
import {toggleMiniMap} from "../drawing/minimap";
import {STORAGE} from "../enums";

const switchKey = keyboard(window.localStorage[STORAGE.KEY_Z_SWITCH]);
const secondHandKeyP1 = keyboard(window.localStorage[STORAGE.KEY_EXTRA_1P]);
const secondHandKeyP2 = keyboard(window.localStorage[STORAGE.KEY_EXTRA_2P]);
const weaponKeyP1 = keyboard(window.localStorage[STORAGE.KEY_WEAPON_1P]);
const weaponKeyP2 = keyboard(window.localStorage[STORAGE.KEY_WEAPON_2P]);
const bagKeyP1 = keyboard(window.localStorage[STORAGE.KEY_BAG_1P]);
const bagKeyP2 = keyboard(window.localStorage[STORAGE.KEY_BAG_2P]);
const mapKey = keyboard(window.localStorage[STORAGE.KEY_MAP]);
let keys = [];

export function bindKeys() {
    for (const key of keys) {
        key.unsubscribe();
    }
    keys = [];

    bindMovement(Game.player, {
        upCode: window.localStorage[STORAGE.KEY_MOVE_UP_1P],
        leftCode: window.localStorage[STORAGE.KEY_MOVE_LEFT_1P],
        downCode: window.localStorage[STORAGE.KEY_MOVE_DOWN_1P],
        rightCode: window.localStorage[STORAGE.KEY_MOVE_RIGHT_1P]
    });
    bindMovement(Game.player2, {
        upCode: window.localStorage[STORAGE.KEY_MOVE_UP_2P],
        leftCode: window.localStorage[STORAGE.KEY_MOVE_LEFT_2P],
        downCode: window.localStorage[STORAGE.KEY_MOVE_DOWN_2P],
        rightCode: window.localStorage[STORAGE.KEY_MOVE_RIGHT_2P]
    });
    bindMagic(Game.player, {
        oneCode: window.localStorage[STORAGE.KEY_MAGIC_1_1P],
        twoCode: window.localStorage[STORAGE.KEY_MAGIC_2_1P],
        threeCode: window.localStorage[STORAGE.KEY_MAGIC_3_1P]
    });
    bindMagic(Game.player2, {
        oneCode: window.localStorage[STORAGE.KEY_MAGIC_1_2P],
        twoCode: window.localStorage[STORAGE.KEY_MAGIC_2_2P],
        threeCode: window.localStorage[STORAGE.KEY_MAGIC_3_2P]
    });

    switchKey.press = () => {
        playerTurn(null, switchPlayers, true)
    };

    secondHandKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.useSecondHand())
    };

    secondHandKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.useSecondHand())
    };

    weaponKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.concentrateWeapon())
    };

    weaponKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.concentrateWeapon())
    };

    bagKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.useBag())
    };

    bagKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.useBag())
    };

    mapKey.press = () => {
        toggleMiniMap();
    };

    //keyboard("KeyN").press = gotoNextLevel;
}

function bindMovement(player, {upCode, leftCode, downCode, rightCode}) {
    const upKey = keyboard(upCode);
    const leftKey = keyboard(leftCode);
    const downKey = keyboard(downCode);
    const rightKey = keyboard(rightCode);
    upKey.press = (e) => {
        playerTurn(player, () => player.move(0, -1, e));
    };
    leftKey.press = (e) => {
        playerTurn(player, () => player.move(-1, 0, e));
    };
    downKey.press = (e) => {
        playerTurn(player, () => player.move(0, 1, e));

    };
    rightKey.press = (e) => {
        playerTurn(player, () => player.move(1, 0, e));
    };
    keys.push(upKey);
    keys.push(leftKey);
    keys.push(downKey);
    keys.push(rightKey);
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function bindMagic(player, {oneCode, twoCode, threeCode}) {
    const oneKey = keyboard(oneCode);
    const twoKey = keyboard(twoCode);
    const threeKey = keyboard(threeCode);
    oneKey.press = () => {
        if (player.magic1) playerTurn(player, () => player.castMagic(player.magic1));
    };
    twoKey.press = () => {
        if (player.magic2) playerTurn(player, () => player.castMagic(player.magic2));
    };
    threeKey.press = () => {
        if (player.magic3) playerTurn(player, () => player.castMagic(player.magic3));
    };
    keys.push(oneKey);
    keys.push(twoKey);
    keys.push(threeKey);
    return {oneKey: oneKey, twoKey: twoKey, threeKey: threeKey}
}


/*
    Mystery
    keyboard("KeyM").press = () => {
        const at = 240;
        const st = 360 / at;
        const p1 = new PIXI.Sprite(Game.resources["src/images/player.png"].texture);
        const p2 = new PIXI.Sprite(Game.resources["src/images/player2.png"].texture);
        p1.visible = false;
        p2.visible = false;
        p1.alpha = 0.9;
        p2.alpha = 0.9;
        p1.anchor.set(0.5, 0.5);
        p2.anchor.set(0.5, 0.5);
        p1.position.set(Game.player.position.x, Game.player.position.y);
        p2.position.set(Game.player2.position.x, Game.player2.position.y);
        p1.width = Game.player.width;
        p1.height = Game.player.height;
        p2.width = Game.player2.width;
        p2.height = Game.player2.height;
        Game.world.addChild(p1);
        Game.world.addChild(p2);
        const astep = 0.01;
        const sstep = 2;

        const animate3 = () => {
            p1.alpha -= astep;
            p2.alpha -= astep;
            p1.width += sstep;
            p2.width += sstep;
            p1.height += sstep;
            p2.height += sstep;
            if (p1.alpha < 0) {
                Game.app.ticker.remove(animate3);
            }
        };

        let acceleration = 1;
        const animate2 = () => {
            Game.player.angle += st * acceleration;
            Game.player2.angle -= st * acceleration;
            acceleration += 0.025;
            if (acceleration >= 17) {
                Game.app.ticker.remove(animate2);
                Game.player.angle = 0;
                Game.player2.angle = 0;
                p1.visible = true;
                p2.visible = true;
                Game.app.ticker.add(animate3);
            }
        };
        Game.app.ticker.add(animate2);
    };
 */