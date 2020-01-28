import {Game} from "../game";

export function keyboard(code, storageSource = null) {
    const key = {
        code: code,
        isDown: false,
        isUp: true,
        press: undefined,
        release: undefined,
        storageSource: storageSource
    };
    Game.keys.push(key);

    key.downHandler = event => {
        if (event.code === key.code) {
            if (key.isUp && key.press) key.press(event);
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    key.upHandler = event => {
        if (event.code === key.code) {
            if (key.isDown && key.release) key.release(event);
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener("keydown", downListener);
    window.addEventListener("keyup", upListener);

    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}

export function keyboardS(storageSource) {
    return keyboard(window.localStorage[storageSource], storageSource);
}