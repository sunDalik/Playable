import {Game} from "../game";
import {keyboard} from "./keyboard_handler";
import {carryPlayer, playerTurn, switchPlayers} from "../game_logic";
import * as PIXI from "pixi.js"

export function bindKeys() {
    bindMovement(Game.player, {upCode: "KeyW", leftCode: "KeyA", downCode: "KeyS", rightCode: "KeyD"});
    bindMovement(Game.player2, {upCode: "KeyI", leftCode: "KeyJ", downCode: "KeyK", rightCode: "KeyL"});
    bindMagic(Game.player, {oneCode: "Digit1", twoCode: "Digit2", threeCode: "Digit3", fourCode: "Digit4"});
    bindMagic(Game.player2, {oneCode: "Digit7", twoCode: "Digit8", threeCode: "Digit9", fourCode: "Digit0"});

    const switchKey = keyboard("KeyZ");
    switchKey.press = () => {
        playerTurn(null, switchPlayers, true)
    };

    const secondHandKeyP1 = keyboard("KeyE");
    secondHandKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.useSecondHand())
    };

    const secondHandKeyP2 = keyboard("KeyO");
    secondHandKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.useSecondHand())
    };

    const weaponKeyP1 = keyboard("KeyQ");
    weaponKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.concentrateWeapon())
    };

    const weaponKeyP2 = keyboard("KeyU");
    weaponKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.concentrateWeapon())
    };

    const pushKeyP1 = keyboard("KeyR");
    pushKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.pushOrPull())
    };

    const pushKeyP2 = keyboard("KeyP");
    pushKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.pushOrPull())
    };

    const releaseKey = keyboard("Space");
    releaseKey.press = () => {
        playerTurn(null, () => {
            if (Game.player.releaseMagic()) return true;
            else return Game.player2.releaseMagic();
        }, true);
    };

    const carryKey = keyboard("KeyX");
    carryKey.press = () => {
        playerTurn(null, carryPlayer, true)
    };
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
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function bindMagic(player, {oneCode, twoCode, threeCode, fourCode}) {
    const oneKey = keyboard(oneCode);
    const twoKey = keyboard(twoCode);
    const threeKey = keyboard(threeCode);
    const fourKey = keyboard(fourCode);
    oneKey.press = () => {
        if (player.magic1) playerTurn(player, () => player.castMagic(player.magic1));
    };
    twoKey.press = () => {
        if (player.magic2) playerTurn(player, () => player.castMagic(player.magic2));
    };
    threeKey.press = () => {
        if (player.magic3) playerTurn(player, () => player.castMagic(player.magic3));
    };
    fourKey.press = () => {
        if (player.magic4) playerTurn(player, () => player.castMagic(player.magic4));
    };

    return {oneKey: oneKey, twoKey: twoKey, threeKey: threeKey, fourKey: fourKey}
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