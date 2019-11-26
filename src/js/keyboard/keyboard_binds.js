import {Game} from "../game";
import {keyboard} from "./keyboard_handler";
import {carryPlayer, playerTurn, switchPlayers} from "../game_logic";

export function bindKeys() {
    bindMovement(Game.player, {upCode: "KeyW", leftCode: "KeyA", downCode: "KeyS", rightCode: "KeyD"});
    /*bindMovement(Game.player2, {
        upCode: "ArrowUp",
        leftCode: "ArrowLeft",
        downCode: "ArrowDown",
        rightCode: "ArrowRight"
    }); */
    //experimental
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