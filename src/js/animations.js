import {Game} from "./game"
import * as PIXI from "pixi.js"
import {randomChoice} from "./utils/random_utils";
import {ITEM_OUTLINE_FILTER} from "./filters";
import {HUDTextStyle, HUDTextStyleTitle} from "./drawing/draw_constants";
import {HUD} from "./drawing/hud_object";
import {camera} from "./classes/game/camera";
import {STAGE} from "./enums";

export function createPlayerWeaponAnimation(player, tileX2, tileY2, thin = false) {
    const tileX1 = player.tilePosition.x;
    const tileY1 = player.tilePosition.y;
    let attackParticle = new PIXI.Sprite(PIXI.Texture.WHITE);
    player.animationSubSprites.push(attackParticle);
    if (thin) {
        attackParticle.width = Game.TILESIZE / 5;
        attackParticle.height = Game.TILESIZE / 5;
    } else {
        attackParticle.width = Game.TILESIZE / 3;
        attackParticle.height = Game.TILESIZE / 3;
    }
    if (tileX2 > tileX1) attackParticle.anchor.set(0, 0.5);
    else if (tileX2 < tileX1) attackParticle.anchor.set(1, 0.5);
    else if (tileY2 > tileY1) attackParticle.anchor.set(0.5, 0);
    else if (tileY2 < tileY1) attackParticle.anchor.set(0.5, 1);
    attackParticle.position.x = Game.TILESIZE * tileX1 + (Game.TILESIZE - Game.player.width) / 2 + Game.player.width / 2;
    attackParticle.position.y = Game.TILESIZE * tileY1 + (Game.TILESIZE - Game.player.height) / 2 + Game.player.height / 2;
    Game.world.addChild(attackParticle);
    const stepX = Math.abs(tileX2 - tileX1) * Game.TILESIZE / (Game.WEAPON_ATTACK_TIME / 2);
    const stepY = Math.abs(tileY2 - tileY1) * Game.TILESIZE / (Game.WEAPON_ATTACK_TIME / 2);
    if (stepX === 0) attackParticle.height = 0;
    if (stepY === 0) attackParticle.width = 0;

    attackParticle.zIndex = Game.primaryPlayer.zIndex + 1;
    let counter = 0;
    //big hack
    let goBack = false;
    const oldW = attackParticle.width;
    const oldH = attackParticle.height;

    const animation = (delta) => {
        if (counter < Game.WEAPON_ATTACK_TIME / 2) {
            attackParticle.width += stepX * delta;
            attackParticle.height += stepY * delta;
        } else {
            attackParticle.width -= stepX * delta;
            attackParticle.height -= stepY * delta;
        }
        counter += delta;
        //big hack
        if (!goBack && counter >= Game.WEAPON_ATTACK_TIME / 2) {
            goBack = true;
            counter = Game.WEAPON_ATTACK_TIME / 2;
            attackParticle.width = oldW + stepX * Game.WEAPON_ATTACK_TIME / 2;
            attackParticle.height = oldH + stepY * Game.WEAPON_ATTACK_TIME / 2;
        }

        if (counter >= Game.WEAPON_ATTACK_TIME) {
            Game.world.removeChild(attackParticle);
            Game.app.ticker.remove(animation);
        }
    };
    player.animation = animation;
    Game.app.ticker.add(animation);
}

export function createFadingAttack(attack, animationTime = Game.TURNTIME) {
    Game.world.addChild(attack);
    const ifTile = !!attack.fitToTile;
    if (ifTile) {
        if (Game.stage === STAGE.DARK_TUNNEL && attack.maskLayer) {
            Game.darkTiles[attack.tilePosition.y][attack.tilePosition.x].addLightSource(attack.maskLayer);
        }
    }
    const delay = animationTime / 2;
    let counter = 0;

    const animation = (delta) => {
        if (counter >= delay) {
            attack.alpha -= 1 / animationTime * delta;
        }
        counter += delta;
        if (counter >= animationTime) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(attack);
            if (ifTile) {
                if (Game.stage === STAGE.DARK_TUNNEL && attack.maskLayer) {
                    Game.darkTiles[attack.tilePosition.y][attack.tilePosition.x].removeLightSource(attack.maskLayer);
                }
            }
        }
    };
    Game.app.ticker.add(animation);
}

export function createFadingText(caption, positionX, positionY) {
    const TEXT_ANIMATION_TIME = 80;
    let counter = 0;
    const text = new PIXI.Text(caption, {
        fontSize: Game.TILESIZE / 65 * 26,
        fill: 0xffffff,
        fontWeight: "bold",
        stroke: 0x000000,
        strokeThickness: 1
    });
    text.position.set(positionX - text.width / 2, positionY - text.height * 1.5);
    text.zIndex = 99;
    Game.world.addChild(text);
    const stepY = Game.TILESIZE / 65 * 30 / TEXT_ANIMATION_TIME;
    const alphaStep = 1 / TEXT_ANIMATION_TIME;

    const animation = (delta) => {
        text.position.y -= stepY * delta;
        if (counter >= TEXT_ANIMATION_TIME / 2) {
            text.alpha -= alphaStep * delta;
        }
        counter += delta;
        if (counter >= TEXT_ANIMATION_TIME) {
            Game.world.removeChild(text);
            Game.app.ticker.remove(animation);
        }
    };

    Game.app.ticker.add(animation);
}

//maybe need to move it to AnimatedTileElement class?
export function rotate(object, clockwise = true) {
    let counter = 0;
    const intendedRotation = object.rotation;

    const animation = (delta) => {
        if (clockwise) object.rotation += 2 * Math.PI / Game.TURNTIME * delta;
        else object.rotation -= 2 * Math.PI / Game.TURNTIME * delta;
        counter += delta;
        if (counter >= Game.TURNTIME) {
            Game.app.ticker.remove(animation);
            object.rotation = intendedRotation;
        }
    };
    object.animation = animation;
    Game.app.ticker.add(animation);
}

export function createFloatingItemAnimation(item) {
    let counter = 0;
    const step = item.height / 4 / Game.ITEM_FLOAT_ANIMATION_TIME;

    item.animation = (delta) => {
        if (counter < Game.ITEM_FLOAT_ANIMATION_TIME / 4) {
            item.position.y -= step * delta;
        } else if (counter < Game.ITEM_FLOAT_ANIMATION_TIME * 3 / 4) {
            item.position.y += step * delta;
        } else if (counter < Game.ITEM_FLOAT_ANIMATION_TIME) {
            item.position.y -= step * delta;
        }
        counter += delta;
        if (counter >= Game.ITEM_FLOAT_ANIMATION_TIME) {
            counter = 0;
        }
    };

    Game.app.ticker.add(item.animation);
    Game.infiniteAnimations.push(item.animation);
}

export function shakeScreen(shakeAnimationTime = Game.SHAKE_TIME, shakeCount = 1, shakeAmplitude = Game.SHAKE_AMPLITUDE, xOnly = false) {
    let counter = 0;
    let shakeCounter = 0;
    const step = shakeAmplitude / shakeAnimationTime;
    const stepY = xOnly ? 0 : randomChoice([-1, 1]) * step / 2;
    if (Game.shakeAnimation) {
        Game.app.ticker.remove(Game.shakeAnimation);
        if (camera.animation === null) camera.center();
    }

    const animation = (delta) => {
        if (counter < shakeAnimationTime / 4) {
            Game.world.position.x -= step * delta;
            Game.world.position.y -= stepY * delta;
        } else if (counter < shakeAnimationTime * 3 / 4) {
            Game.world.position.x += step * delta;
            Game.world.position.y += stepY * delta;
        } else if (counter < shakeAnimationTime) {
            Game.world.position.x -= step * delta;
            Game.world.position.y -= stepY * delta;
        }
        counter += delta;
        if (counter >= shakeAnimationTime) {
            counter = 0;
            shakeCounter++;
        }
        if (shakeCounter >= shakeCount) {
            Game.app.ticker.remove(animation);
            if (camera.animation === null) camera.center();
        }
    };

    Game.shakeAnimation = animation;
    Game.app.ticker.add(animation);
}

export function longShakeScreen() {
    shakeScreen(Game.LONG_SHAKE_TIME, 2, Game.SHORT_SHAKE_AMPLITUDE, true);
}

export function createHeartAnimation(positionX, positionY, heartSize = Game.TILESIZE / 3, angleStep = 0, animationTime = 30) {
    const heart = new PIXI.Sprite(Game.resources["src/images/HUD/heart_full.png"].texture);
    heart.width = heartSize;
    heart.height = heartSize;
    heart.anchor.set(0.5, 0.5);
    heart.position.set(positionX, positionY - heart.height / 4);
    heart.zIndex = 99;
    Game.world.addChild(heart);
    const stepY = Game.TILESIZE / 2.5 / animationTime;
    const alphaStep = 1 / animationTime;
    let counter = 0;

    const animation = (delta) => {
        heart.position.y -= stepY * delta;
        heart.width += heartSize / 3 / animationTime * delta;
        heart.height += heartSize / 3 / animationTime * delta;
        if (counter >= animationTime / 2) {
            heart.alpha -= alphaStep * delta;
        }
        if (counter < animationTime / 4) {
            heart.angle -= angleStep * delta
        } else if (counter < animationTime * 3 / 4) {
            heart.angle += angleStep * delta
        } else if (counter < animationTime) {
            heart.angle -= angleStep * delta;
        }
        counter += delta;
        if (counter >= animationTime) {
            Game.world.removeChild(heart);
            Game.app.ticker.remove(animation);
        }
    };

    Game.app.ticker.add(animation);
}

export function createKissHeartAnimation(positionX, positionY) {
    createHeartAnimation(positionX, positionY, Game.TILESIZE / 2.5, 1.5, 50)
}

export function showHelpBox(item) {
    if (Game.itemHelpAnimation) {
        Game.app.ticker.remove(Game.itemHelpAnimation);
        Game.itemHelpAnimation = null;
    }
    if (Game.itemHelp) {
        HUD.removeChild(Game.itemHelp);
        Game.itemHelp = null;
    }

    Game.itemHelp = new PIXI.Graphics();
    Game.itemHelp.beginFill(0x000000);
    Game.itemHelp.lineStyle(3, 0xFFFFFF, 0.7);
    Game.itemHelp.drawRoundedRect(0, 0, 600, 100, 6);
    const itemSprite = new PIXI.Sprite(item.texture);
    itemSprite.filters = [ITEM_OUTLINE_FILTER];
    itemSprite.width = itemSprite.height = 60;
    const itemOffsetX = 40;
    const itemOffsetY = itemSprite.height / 3.5;
    itemSprite.position.set(40, itemOffsetY);
    Game.itemHelp.addChild(itemSprite);
    const textOffsetX = itemOffsetX + itemSprite.width;
    const nameText = new PIXI.Text(item.name, HUDTextStyleTitle);
    nameText.fontSize += 3;
    nameText.position.set(textOffsetX + (Game.itemHelp.width - textOffsetX) / 2 - nameText.width / 2, itemOffsetY - 4);
    Game.itemHelp.addChild(nameText);
    const descriptionText = new PIXI.Text(item.description, HUDTextStyle);
    descriptionText.position.set(textOffsetX + (Game.itemHelp.width - textOffsetX) / 2 - descriptionText.width / 2,
        nameText.position.y + nameText.height + 10);
    Game.itemHelp.addChild(descriptionText);

    HUD.addChild(Game.itemHelp);
    Game.itemHelp.position.set(Game.app.renderer.screen.width / 2 - Game.itemHelp.width / 2, Game.app.renderer.screen.height);
    Game.itemHelp.zIndex = 1;

    const slideTime = 14;
    const slideStep = Game.itemHelp.height / slideTime;
    const stayTime = 180;
    let counter = 0;

    const animation = (delta) => {
        if (counter < slideTime) {
            Game.itemHelp.position.y -= slideStep * delta;
        } else if (counter >= slideTime + stayTime && counter < slideTime + stayTime + slideTime) {
            Game.itemHelp.position.y += slideStep * delta;
        }
        counter += delta;
        if (counter >= slideTime + stayTime + slideTime) {
            Game.app.ticker.remove(animation);
            HUD.removeChild(Game.itemHelp);
        }
    };

    Game.itemHelpAnimation = animation;
    Game.app.ticker.add(animation);
}