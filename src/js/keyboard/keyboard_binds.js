import {Game} from "../game";
import {keyboard} from "./keyboard_handler";
import {playerTurn, switchPlayers} from "../game_logic";

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

    const shieldKeyP1 = keyboard("KeyE");
    shieldKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.activateShield())
    };

    const shieldKeyP2 = keyboard("KeyO");
    shieldKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.activateShield())
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