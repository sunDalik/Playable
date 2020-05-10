import {Game} from "../game";
import {keyboard, keyboardS} from "./keyboard_handler";
import {playerTurn, swapEquipmentWithPlayer, switchPlayers} from "../game_logic";
import {toggleMiniMap} from "../drawing/minimap";
import {STORAGE} from "../enums";
import {getRandomChestDrop} from "../utils/pool_utils";

const upKeyP1 = keyboardS(STORAGE.KEY_MOVE_UP_1P);
const leftKeyP1 = keyboardS(STORAGE.KEY_MOVE_LEFT_1P);
const downKeyP1 = keyboardS(STORAGE.KEY_MOVE_DOWN_1P);
const rightKeyP1 = keyboardS(STORAGE.KEY_MOVE_RIGHT_1P);
const upKeyP2 = keyboardS(STORAGE.KEY_MOVE_UP_2P);
const leftKeyP2 = keyboardS(STORAGE.KEY_MOVE_LEFT_2P);
const downKeyP2 = keyboardS(STORAGE.KEY_MOVE_DOWN_2P);
const rightKeyP2 = keyboardS(STORAGE.KEY_MOVE_RIGHT_2P);

const magicOneKeyP1 = keyboardS(STORAGE.KEY_MAGIC_1_1P);
const magicTwoKeyP1 = keyboardS(STORAGE.KEY_MAGIC_2_1P);
const magicThreeKeyP1 = keyboardS(STORAGE.KEY_MAGIC_3_1P);
const magicOneKeyP2 = keyboardS(STORAGE.KEY_MAGIC_1_2P);
const magicTwoKeyP2 = keyboardS(STORAGE.KEY_MAGIC_2_2P);
const magicThreeKeyP2 = keyboardS(STORAGE.KEY_MAGIC_3_2P);

const switchKey = keyboardS(STORAGE.KEY_Z_SWITCH);
const secondHandKeyP1 = keyboardS(STORAGE.KEY_EXTRA_1P);
const secondHandKeyP2 = keyboardS(STORAGE.KEY_EXTRA_2P);
const weaponKeyP1 = keyboardS(STORAGE.KEY_WEAPON_1P);
const weaponKeyP2 = keyboardS(STORAGE.KEY_WEAPON_2P);
const bagKeyP1 = keyboardS(STORAGE.KEY_BAG_1P);
const bagKeyP2 = keyboardS(STORAGE.KEY_BAG_2P);
const mapKey = keyboardS(STORAGE.KEY_MAP);

export function bindKeys() {
    for (const key of Game.keys) {
        if (key.storageSource !== null) {
            key.code = window.localStorage[key.storageSource];
        }
    }

    upKeyP1.press = (e) => playerTurn(Game.player, () => Game.player.move(0, -1, e));
    leftKeyP1.press = (e) => playerTurn(Game.player, () => Game.player.move(-1, 0, e));
    downKeyP1.press = (e) => playerTurn(Game.player, () => Game.player.move(0, 1, e));
    rightKeyP1.press = (e) => playerTurn(Game.player, () => Game.player.move(1, 0, e));

    upKeyP2.press = (e) => playerTurn(Game.player2, () => Game.player2.move(0, -1, e));
    leftKeyP2.press = (e) => playerTurn(Game.player2, () => Game.player2.move(-1, 0, e));
    downKeyP2.press = (e) => playerTurn(Game.player2, () => Game.player2.move(0, 1, e));
    rightKeyP2.press = (e) => playerTurn(Game.player2, () => Game.player2.move(1, 0, e));

    magicOneKeyP1.press = () => playerTurn(Game.player, () => Game.player.castMagic(Game.player.magic1));
    magicTwoKeyP1.press = () => playerTurn(Game.player, () => Game.player.castMagic(Game.player.magic2));
    magicThreeKeyP1.press = () => playerTurn(Game.player, () => Game.player.castMagic(Game.player.magic3));

    magicOneKeyP2.press = () => playerTurn(Game.player2, () => Game.player2.castMagic(Game.player2.magic1));
    magicTwoKeyP2.press = () => playerTurn(Game.player2, () => Game.player2.castMagic(Game.player2.magic2));
    magicThreeKeyP2.press = () => playerTurn(Game.player2, () => Game.player2.castMagic(Game.player2.magic3));

    secondHandKeyP1.press = () => playerTurn(Game.player, () => Game.player.useSecondHand());
    secondHandKeyP2.press = () => playerTurn(Game.player2, () => Game.player2.useSecondHand());

    weaponKeyP1.press = () => playerTurn(Game.player, () => Game.player.focusWeapon());
    weaponKeyP2.press = () => playerTurn(Game.player2, () => Game.player2.focusWeapon());

    bagKeyP1.press = () => playerTurn(Game.player, () => Game.player.useBag());
    bagKeyP2.press = () => playerTurn(Game.player2, () => Game.player2.useBag());

    switchKey.press = () => playerTurn(null, switchPlayers, true);
    mapKey.press = () => toggleMiniMap();

    //keyboard("KeyN").press = gotoNextLevel;
    keyboard("KeyN").press = () => swapEquipmentWithPlayer(Game.player, getRandomChestDrop());
}