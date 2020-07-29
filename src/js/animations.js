import {Game} from "./game";
import * as PIXI from "pixi.js";
import {randomChoice, randomInt} from "./utils/random_utils";
import {ITEM_OUTLINE_FILTER} from "./filters";
import {HUDTextStyle, HUDTextStyleTitle, miniMapBottomOffset} from "./drawing/draw_constants";
import {HUD} from "./drawing/hud_object";
import {camera} from "./classes/game/camera";
import {ROLE, STAGE} from "./enums/enums";
import {easeInOutQuad, easeInQuad, easeOutQuad, quadraticBezier} from "./utils/math_utils";
import {TileElement} from "./classes/tile_elements/tile_element";
import {EffectsSpriteSheet, HUDSpriteSheet} from "./loader";
import {getZIndexForLayer, Z_INDEXES} from "./z_indexing";
import {getAngleForDirection, setTickTimeout} from "./utils/game_utils";
import {getEnchantmentFilters, getItemLabelColor} from "./game_logic";
import {ENCHANTMENT_TYPE} from "./enums/enchantments";

// the picture is directed to the top left!
export function createWeaponAnimationStab(player, weapon, offsetX, offsetY, animationTime = 8, delay = 4, scaleMod = 1.1, lookingRight = false) {
    let playerOffsetX, playerOffsetY;
    if (Math.abs(offsetX) + Math.abs(offsetY) === 1) {
        playerOffsetX = 0;
        playerOffsetY = 0;
        offsetX -= Math.sign(offsetX) * 0.25;
        offsetY -= Math.sign(offsetY) * 0.25;
    } else {
        playerOffsetX = Math.sign(offsetX) * 0.25;
        playerOffsetY = Math.sign(offsetY) * 0.25;
        offsetX -= Math.sign(offsetX) * 0.5;
        offsetY -= Math.sign(offsetY) * 0.5;
    }
    const weaponSprite = new TileElement(weapon.texture, player.tilePosition.x, player.tilePosition.y);
    weaponSprite.position.set(player.getTilePositionX() + playerOffsetX * Game.TILESIZE, player.getTilePositionY() + playerOffsetY * Game.TILESIZE);
    Game.world.addChild(weaponSprite);
    player.animationSubSprites.push(weaponSprite);
    weaponSprite.zIndex = player.zIndex + 1;
    weaponSprite.scaleModifier = scaleMod;
    weaponSprite.fitToTile();
    weaponSprite.anchor.set(0.5, 0.5);
    if (Math.sign(offsetX) === 1 && Math.sign(offsetY) === 0) weaponSprite.angle = 135;
    else if (Math.sign(offsetX) === -1 && Math.sign(offsetY) === 0) weaponSprite.angle = -45;
    else if (Math.sign(offsetX) === 0 && Math.sign(offsetY) === 1) weaponSprite.angle = -135;
    else if (Math.sign(offsetX) === 0 && Math.sign(offsetY) === -1) weaponSprite.angle = 45;
    else if (Math.sign(offsetX) === -1 && Math.sign(offsetY) === -1) weaponSprite.angle = 0;
    else if (Math.sign(offsetX) === -1 && Math.sign(offsetY) === 1) weaponSprite.angle = -90;
    else if (Math.sign(offsetX) === 1 && Math.sign(offsetY) === -1) weaponSprite.angle = 90;
    else if (Math.sign(offsetX) === 1 && Math.sign(offsetY) === 1) weaponSprite.angle = 180;
    if (lookingRight) {
        weaponSprite.scale.x *= -1;
    }

    const startValX = weaponSprite.position.x;
    const endChangeX = offsetX * Game.TILESIZE;
    const startValY = weaponSprite.position.y;
    const endChangeY = offsetY * Game.TILESIZE;
    const endStayTime = 2;
    let counter = 0;

    const animation = delta => {
        if (Game.paused) return;
        counter += delta;
        if (counter < animationTime / 2) {
            weaponSprite.position.x = startValX + endChangeX * counter / (animationTime / 2);
            weaponSprite.position.y = startValY + endChangeY * counter / (animationTime / 2);
        } else if (counter < animationTime / 2 + delay) {
            weaponSprite.position.x = startValX + endChangeX;
            weaponSprite.position.y = startValY + endChangeY;
        } else if (counter < animationTime + delay) {
            weaponSprite.position.x = startValX + endChangeX - endChangeX * (counter - delay - animationTime / 2) / (animationTime / 2);
            weaponSprite.position.y = startValY + endChangeY - endChangeY * (counter - delay - animationTime / 2) / (animationTime / 2);
        }
        if (counter >= animationTime + delay + endStayTime) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(weaponSprite);
        }
    };
    player.animation = animation;
    Game.app.ticker.add(animation);
}

// the picture is directed to the top left!
export function createWeaponAnimationSwing(player, weapon, dirX, dirY, animationTime = 5, angleAmplitude = 90, scaleMod = 1.1, baseAngle = -135, handleAnchor = {
    x: 1,
    y: 1
}, forceSwing = undefined, endAmplitude = angleAmplitude, bladeLookingLeft = true) {
    const weaponSprite = new TileElement(weapon.texture, player.tilePosition.x, player.tilePosition.y);
    weaponSprite.position.set(player.getTilePositionX(), player.getTilePositionY());
    Game.world.addChild(weaponSprite);
    player.animationSubSprites.push(weaponSprite);
    weaponSprite.zIndex = player.zIndex + 1;
    weaponSprite.scaleModifier = scaleMod;
    weaponSprite.fitToTile();
    weaponSprite.anchor.set(handleAnchor.x, handleAnchor.y);
    let swingDir = forceSwing === 1 || forceSwing === -1 ? forceSwing : randomChoice([-1, 1]);
    if (dirX === 1) weaponSprite.angle = -baseAngle - angleAmplitude / 2 * swingDir;
    else if (dirX === -1) weaponSprite.angle = -baseAngle + 180 - angleAmplitude / 2 * swingDir;
    else if (dirY === 1) weaponSprite.angle = -baseAngle + 90 - angleAmplitude / 2 * swingDir;
    else if (dirY === -1) weaponSprite.angle = -baseAngle + 270 - angleAmplitude / 2 * swingDir;

    if (swingDir === 1 && bladeLookingLeft || swingDir === -1 && !bladeLookingLeft) {
        weaponSprite.scale.x *= -1;
        weaponSprite.angle -= (-baseAngle - 90) * 2;
    }

    const endChange = endAmplitude * swingDir;
    const startStayTime = 1;
    const endStayTime = 1;
    const startVal = weaponSprite.angle;
    let counter = 0;

    const animation = delta => {
        if (Game.paused) return;
        counter += delta;
        if (counter >= startStayTime && counter < animationTime + startStayTime) {
            weaponSprite.angle = startVal + endChange * (counter - startStayTime) / animationTime;
        }
        if (counter >= startStayTime + animationTime + endStayTime) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(weaponSprite);
        }
    };
    player.animation = animation;
    Game.app.ticker.add(animation);
}

// the picture is directed to the top left!
export function createWeaponAnimationClub(player, weapon, dirX, dirY, animationTime = 8, delay = 4, angleAmplitude = 90, scaleMod = 1, offset = 0, lookingRight = false) {
    const weaponSprite = new TileElement(weapon.texture, player.tilePosition.x, player.tilePosition.y);
    weaponSprite.position.set(player.getTilePositionX() + offset * Math.sign(dirX) * Game.TILESIZE, player.getTilePositionY() + offset * Math.sign(dirY) * Game.TILESIZE);

    Game.world.addChild(weaponSprite);
    player.animationSubSprites.push(weaponSprite);
    weaponSprite.zIndex = player.zIndex + 1;
    weaponSprite.setScaleModifier(scaleMod);
    weaponSprite.anchor.set(1, 1);
    let baseAngle = 0;
    if (lookingRight) {
        weaponSprite.anchor.set(0, 1);
        baseAngle = -90;
    }
    let swingDir = randomChoice([-1, 1]);
    if (Math.sign(dirX) === 1) swingDir = 1;
    else if (Math.sign(dirX) === -1) swingDir = -1;
    if (dirX === 1) weaponSprite.angle = baseAngle + 135 - angleAmplitude * swingDir;
    else if (dirX === -1) weaponSprite.angle = baseAngle - 45 - angleAmplitude * swingDir;
    else if (dirY === 1) weaponSprite.angle = baseAngle - 135 - angleAmplitude * swingDir;
    else if (dirY === -1) weaponSprite.angle = baseAngle + 45 - angleAmplitude * swingDir;

    //assuming that the "blade" looks to the left on the picture
    if (swingDir === 1 && !lookingRight) {
        weaponSprite.scale.x *= -1;
        weaponSprite.angle -= 90;
    }

    const endChange = angleAmplitude * swingDir;
    const endStayTime = 2;
    const startVal = weaponSprite.angle;
    let counter = 0;

    const animation = delta => {
        if (Game.paused) return;
        counter += delta;
        if (counter < animationTime / 2) {
            weaponSprite.angle = startVal + endChange * counter / (animationTime / 2);
        } else if (counter < animationTime / 2 + delay) {
            weaponSprite.angle = startVal + endChange;
        } else if (counter < animationTime + delay) {
            weaponSprite.angle = startVal + endChange - endChange * (counter - delay - animationTime / 2) / (animationTime / 2);
        }
        if (counter >= animationTime + delay + endStayTime) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(weaponSprite);
        }
    };
    player.animation = animation;
    Game.app.ticker.add(animation);
}

export function createEnemyAttackTile(tile, animationTime = 8, alpha = 0.3) {
    const fadingTile = new TileElement(PIXI.Texture.WHITE, tile.x, tile.y, true);
    fadingTile.tint = 0xf4524a;
    fadingTile.alpha = alpha;
    fadingTile.zIndex = Z_INDEXES.HAZARD;
    createFadingAttack(fadingTile, animationTime);
}

export function createPlayerAttackTile(tile, animationTime = 8, alpha = 0.5, tint = 0xffffff) {
    const fadingTile = new TileElement(PIXI.Texture.WHITE, tile.x, tile.y, true);
    fadingTile.tint = tint;
    fadingTile.alpha = alpha;
    fadingTile.zIndex = Z_INDEXES.HAZARD;
    createFadingAttack(fadingTile, animationTime);
}

export function createFadingAttack(attack, animationTime = Game.TURNTIME) {
    Game.world.addChild(attack);
    const ifTile = !!attack.fitToTile;
    if (ifTile) {
        if (Game.stage === STAGE.DARK_TUNNEL && attack.maskLayer) {
            Game.darkTiles[attack.tilePosition.y][attack.tilePosition.x].addLightSource(attack.maskLayer);
        }
    }
    const initAlpha = attack.alpha;
    const delay = animationTime * 3 / 5;
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        if (counter >= delay) {
            attack.alpha = initAlpha - easeInQuad((counter - delay) / (animationTime - delay));
        }
        if (counter >= animationTime) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(attack);
            if (ifTile) {
                if (Game.stage === STAGE.DARK_TUNNEL && attack.maskLayer) {
                    Game.darkTiles[attack.tilePosition.y][attack.tilePosition.x].removeLightSource(attack.maskLayer);
                }
            }
            attack.destroy();
        }
    };
    Game.app.ticker.add(animation);
}

export function createFadingText(caption, positionX, positionY, fontSize = Game.TILESIZE / 65 * 26, animationTime = 70) {
    let counter = 0;
    const text = new PIXI.Text(caption, {
        fontFamily: "Roboto",
        fontSize: fontSize,
        fill: 0xffffff,
        fontWeight: "bold",
        stroke: 0x000000,
        strokeThickness: 1
    });
    text.position.set(positionX - text.width / 2, positionY - text.height * 1.5);
    text.zIndex = getZIndexForLayer(positionY / Game.TILESIZE) + Z_INDEXES.META;
    Game.world.addChild(text);
    const stepY = Game.TILESIZE / 65 * 30 / animationTime;
    const delay = animationTime * 3 / 5;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        text.position.y -= stepY * delta;
        if (counter >= delay) {
            text.alpha = 1 - easeInQuad((counter - delay) / (animationTime - delay));
        }
        if (counter >= animationTime + delay) {
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
        if (Game.paused) return;
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

export function createFloatingItemAnimation(item, height = item.height) {
    const animationTime = Game.ITEM_FLOAT_ANIMATION_TIME;
    const amplitude = height / 4;
    const startVal = item.position.y + amplitude / 2;
    const endChange = -amplitude;
    let goUp = true;
    let counter = animationTime / 2;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;

        if (goUp) item.position.y = startVal + easeInOutQuad(counter / animationTime) * endChange;
        else item.position.y = startVal + endChange - easeInOutQuad(counter / animationTime) * endChange;

        if (counter >= animationTime) {
            counter = 0;
            if (goUp) item.position.y = startVal + endChange;
            else item.position.y = startVal;
            goUp = !goUp;
        }
    };

    Game.app.ticker.add(animation);
    Game.infiniteAnimations.push(animation);
    return animation;
}

// makes about (shakeAnimationTime - 1) random shakes
export function shakeScreen(shakeAmplitude = 12, shakeAnimationTime = 8) {
    let currentShakeAmplitude = shakeAmplitude;
    let offsetX = 0;
    let offsetY = 0;
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        if (counter < shakeAnimationTime) {
            Game.world.position.x -= offsetX;
            Game.world.position.y -= offsetY;
            offsetX = randomInt(-currentShakeAmplitude, currentShakeAmplitude);
            offsetY = randomInt(-currentShakeAmplitude, currentShakeAmplitude);
            Game.world.position.x += offsetX;
            Game.world.position.y += offsetY;
            currentShakeAmplitude = shakeAmplitude - easeOutQuad(counter / shakeAnimationTime);
        } else {
            Game.world.position.x -= offsetX;
            Game.world.position.y -= offsetY;
            Game.app.ticker.remove(animation);
            //this might backstab later...
            if (camera.animation === null) camera.center(); // just in case...
        }
    };

    Game.app.ticker.add(animation);
}

export function createHeartAnimation(positionX, positionY, heartSize = Game.TILESIZE / 3, animationTime = 26, pound = false, poundTwice = false) {
    const heart = new PIXI.Sprite(HUDSpriteSheet["heart_full.png"]);
    heart.width = heart.height = heartSize;
    const sizeEndChange = pound ? heartSize : heartSize / 2;
    heart.anchor.set(0.5, 0.5);
    heart.position.set(positionX, positionY - heart.height / 4);
    const startPosY = heart.position.y;
    const posYEndChange = -Game.TILESIZE / 3;
    heart.zIndex = Math.ceil(getZIndexForLayer(positionY / Game.TILESIZE)) + Z_INDEXES.META;
    Game.world.addChild(heart);
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        heart.position.y = startPosY + easeOutQuad(counter / animationTime) * posYEndChange;
        if (pound) {
            if (poundTwice) {
                if (counter < animationTime / 7) {
                    heart.height = heart.width = heartSize + easeOutQuad(counter / (animationTime / 7)) * sizeEndChange;
                } else if (counter < animationTime * 2 / 7) {
                    heart.height = heart.width = heartSize + sizeEndChange - easeInQuad((counter - animationTime / 7) / (animationTime / 7)) * sizeEndChange;
                } else if (counter < animationTime * 3 / 7) {
                    heart.height = heart.width = heartSize + easeOutQuad((counter - animationTime * 2 / 7) / (animationTime / 7)) * sizeEndChange;
                } else if (counter < animationTime * 4 / 7) {
                    heart.height = heart.width = heartSize + sizeEndChange - easeInQuad((counter - animationTime * 3 / 7) / (animationTime / 7)) * sizeEndChange;
                } else if (counter < animationTime) {
                    heart.height = heart.width = heartSize + easeOutQuad((counter - animationTime * 4 / 7) / (animationTime * 3 / 7)) * sizeEndChange;
                }
            } else {
                if (counter < animationTime / 5) {
                    heart.height = heart.width = heartSize + easeOutQuad(counter / (animationTime / 5)) * sizeEndChange;
                } else if (counter < animationTime * 2 / 5) {
                    heart.height = heart.width = heartSize + sizeEndChange - easeInQuad((counter - animationTime / 5) / (animationTime / 5)) * sizeEndChange;
                } else if (counter < animationTime) {
                    heart.height = heart.width = heartSize + easeOutQuad((counter - animationTime * 2 / 5) / (animationTime * 3 / 5)) * sizeEndChange;
                }
            }

            if (counter >= animationTime * 4 / 5) {
                heart.alpha = 1 - easeOutQuad((counter - animationTime * 4 / 5) / animationTime) * 2;
            }
        } else {
            heart.height = heart.width = heartSize + easeOutQuad(counter / animationTime) * sizeEndChange;
            if (counter >= animationTime * 3 / 4) {
                heart.alpha = 1 - easeOutQuad((counter - animationTime * 3 / 4) / animationTime) * 2;
            }
        }
        if (counter >= animationTime) {
            Game.world.removeChild(heart);
            Game.app.ticker.remove(animation);
            heart.destroy();
        }
    };

    Game.app.ticker.add(animation);
}

export function createKissHeartAnimation(positionX, positionY) {
    createHeartAnimation(positionX, positionY, Game.TILESIZE / 3, 60, true);
}

export function createStrongKissHeartAnimation(positionX, positionY) {
    createHeartAnimation(positionX, positionY, Game.TILESIZE / 3, 70, true, true);
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
    Game.itemHelp.lineStyle(3, 0xFFFFFF, 0.8, 0);
    Game.itemHelp.drawRoundedRect(0, 0, 550, 120, 6);
    const itemSprite = new PIXI.Sprite(item.texture);
    if (item.enchantment !== ENCHANTMENT_TYPE.NONE) {
        itemSprite.filters = getEnchantmentFilters(item.enchantment);
    } else {
        itemSprite.filters = [ITEM_OUTLINE_FILTER];
    }
    itemSprite.width = itemSprite.height = 65;
    const itemOffsetX = 30;
    const topBias = 4;
    const itemOffsetY = (Game.itemHelp.height - itemSprite.height) / 2 - topBias;
    itemSprite.position.set(itemOffsetX, itemOffsetY);
    Game.itemHelp.addChild(itemSprite);

    const textOffsetX = itemSprite.width + itemOffsetX * 1.5;
    const textSpace = Game.itemHelp.width - textOffsetX - itemOffsetX * 0.5;
    const nameText = new PIXI.Text(item.name, HUDTextStyleTitle);
    const descriptionText = new PIXI.Text(item.description, HUDTextStyle);
    nameText.anchor.x = descriptionText.anchor.x = 0.5;
    nameText.style.wordWrap = descriptionText.style.wordWrap = true;
    nameText.style.wordWrapWidth = descriptionText.style.wordWrapWidth = textSpace;
    nameText.style.fill = getItemLabelColor(item);
    nameText.fontSize += 3;
    const textBetweenOffset = 6;
    const textOffsetY = (Game.itemHelp.height - (nameText.height + descriptionText.height + textBetweenOffset)) / 2 - topBias;
    nameText.position.set(textOffsetX + textSpace / 2, textOffsetY);
    descriptionText.position.set(textOffsetX + textSpace / 2, nameText.position.y + nameText.height + textBetweenOffset);
    Game.itemHelp.addChild(nameText);
    Game.itemHelp.addChild(descriptionText);

    if (textOffsetY < 0) {
        // expand help box by one line if too many lines...
        // kinda hacky for now
        Game.itemHelp.clear();
        Game.itemHelp.beginFill(0x000000);
        Game.itemHelp.lineStyle(3, 0xFFFFFF, 0.8, 0);
        const expand = 20;
        Game.itemHelp.drawRoundedRect(0, 0, 550, 120 + expand, 6);
        nameText.position.y += expand / 2;
        descriptionText.position.y += expand / 2;
        itemSprite.position.y += expand / 2;
    }

    HUD.addChild(Game.itemHelp);
    Game.itemHelp.position.set(Game.app.renderer.screen.width / 2 - Game.itemHelp.width / 2, Game.app.renderer.screen.height);
    Game.itemHelp.zIndex = 1;

    const slideTime = 20;
    const startVal = Game.itemHelp.position.y;
    const endChange = -Game.itemHelp.height - miniMapBottomOffset;
    const initTurns = Game.turns;
    const stayTurns = 2;
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        if (counter < slideTime || Game.turns >= initTurns + stayTurns || Game.turns < initTurns) {
            counter += delta;
        }
        if (Game.itemHelp === null) {
            Game.app.ticker.remove(animation);
            return;
        }
        if (counter < slideTime) {
            Game.itemHelp.position.y = startVal + easeOutQuad(counter / slideTime) * endChange;
        } else if (counter >= slideTime && counter < slideTime + slideTime && Game.turns >= initTurns + stayTurns) {
            Game.itemHelp.position.y = startVal + endChange - easeInQuad((counter - slideTime) / slideTime) * endChange;
        } else {
            Game.itemHelp.position.y = startVal + endChange;
        }
        if (counter >= slideTime + slideTime) {
            Game.app.ticker.remove(animation);
            HUD.removeChild(Game.itemHelp);
        }
    };

    Game.itemHelpAnimation = animation;
    Game.app.ticker.add(animation);
}

export function runDestroyAnimation(tileElement, playerDeath = false, sloMoMul = 0.1, scaleMod = undefined) {
    //todo: BUGGED with rotated textures!!!!
    const YBorders = [0, undefined, undefined, tileElement.texture.frame.height];
    const XBorders = [0, undefined, undefined, tileElement.texture.frame.width];
    const maxOffsetMul = 1 / 9;
    for (let i = 1; i <= 2; i++) {
        YBorders[i] = YBorders[i - 1] + tileElement.texture.frame.height / 3 + randomInt(-tileElement.texture.frame.height * maxOffsetMul, tileElement.texture.frame.height * maxOffsetMul);
        XBorders[i] = XBorders[i - 1] + tileElement.texture.frame.width / 3 + randomInt(-tileElement.texture.frame.width * maxOffsetMul, tileElement.texture.frame.width * maxOffsetMul);
    }
    const particles = [];
    for (const region of [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
        {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
        {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}]) {
        const particle = new PIXI.Sprite(new PIXI.Texture(tileElement.texture.baseTexture, tileElement.texture.frame));
        //hack to enable culling for death particles
        particle.tilePosition = {x: tileElement.tilePosition.x, y: tileElement.tilePosition.y};
        let scaleMul = 1;
        if (scaleMod !== undefined) scaleMul = scaleMod;
        else if (playerDeath) scaleMul = 1;
        else if (tileElement.role === ROLE.INANIMATE) scaleMul = 1;
        else if (tileElement.role !== undefined) scaleMul = 0.8;
        else scaleMul = 0.4;
        particle.scale.set(tileElement.scale.x, tileElement.scale.y);
        const initScaleX = particle.scale.x;
        const initScaleY = particle.scale.y;
        particle.angle = tileElement.angle;
        if (tileElement.texture.rotate === 2) particle.angle -= 90;
        particle.anchor.set(tileElement.anchor.x, tileElement.anchor.y);
        particle.position.set(tileElement.position.x, tileElement.position.y);
        if (playerDeath) particle.zIndex = 2;
        else particle.zIndex = -1;
        if (playerDeath) Game.world.upWorld.addChild(particle);
        else Game.world.addChild(particle);

        let offsetX = XBorders[region.x];
        let offsetY = YBorders[region.y];
        const trimTexWidth = XBorders[region.x + 1] - XBorders[region.x];
        const trimTexHeight = YBorders[region.y + 1] - YBorders[region.y];
        if (Math.sign(tileElement.scale.x) === -1) offsetX = tileElement.texture.frame.width - offsetX - trimTexWidth;
        if (Math.sign(tileElement.scale.y) === -1) offsetY = tileElement.texture.frame.height - offsetY - trimTexHeight;
        particle.texture.frame = new PIXI.Rectangle(tileElement.texture.frame.x + offsetX, tileElement.texture.frame.y + offsetY, trimTexWidth, trimTexHeight);
        const trimWidth = trimTexWidth / tileElement.texture.frame.width * tileElement.width;
        const trimHeight = trimTexHeight / tileElement.texture.frame.height * tileElement.height;
        const posOffsetX = trimWidth * (region.x - 1.5) + trimWidth * tileElement.anchor.x;
        const posOffsetY = trimHeight * (region.y - 1.5) + trimHeight * tileElement.anchor.y;
        particle.position.x += posOffsetX;
        particle.position.y += posOffsetY;
        particle.texture.updateUvs();

        const flyDir = region.x === 1 ? randomChoice([-1, 1]) : region.x - 1;
        const flyHeight = randomInt(Game.TILESIZE, Game.TILESIZE * 2);
        const oldPosX = particle.position.x;
        const oldPosY = particle.position.y;
        const distX = randomInt(-tileElement.width / 4, tileElement.width / 1.5) * flyDir;
        const middlePoint = {x: oldPosX + distX / 2, y: oldPosY - flyHeight};
        const finalPoint = {
            x: oldPosX + distX,
            y: tileElement.getTilePositionY() + (1 - tileElement.anchor.y) * Game.TILESIZE - randomInt(0, Game.TILESIZE / 2)
        };

        const animationTime = randomInt(10, 14);
        const step = 1 / animationTime;
        let counter = 0;

        const animation = delta => {
            if (playerDeath && Game.paused) counter += delta * sloMoMul;
            else if (Game.paused) return;
            else counter += delta;
            const t = counter * step;
            particle.scale.set(initScaleX * (1 - counter / animationTime) + initScaleX * (counter / animationTime) * scaleMul,
                initScaleY * (1 - counter / animationTime) + initScaleY * (counter / animationTime) * scaleMul);
            particle.position.x = quadraticBezier(t, oldPosX, middlePoint.x, finalPoint.x);
            particle.position.y = quadraticBezier(t, oldPosY, middlePoint.y, finalPoint.y);

            if (tileElement.fadingDestructionParticles) {
                particle.alpha = 1 - counter / animationTime;
            }

            if (!Game.paused && playerDeath) {
                Game.world.upWorld.removeChild(particle);
                Game.world.addChild(particle);
            }
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                particle.position.set(finalPoint.x, finalPoint.y);
                if (tileElement.fadingDestructionParticles) Game.world.removeChild(particle);
                if (playerDeath) {
                    Game.world.upWorld.removeChild(particle);
                    Game.world.addChild(particle);
                    particle.zIndex = -1;
                    particle.scale.set(initScaleX * scaleMul, initScaleY * scaleMul);
                }
            }
        };
        particle.animation = animation;
        Game.app.ticker.add(animation);
        particles.push(particle);
    }
    if (!tileElement.fadingDestructionParticles) Game.destroyParticles.push(particles);
}

export function fadeOutAndDie(object, destroyTexture = false, animationTime = 10) {
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        object.alpha = 1 - easeInQuad(counter / animationTime);
        if (counter >= animationTime) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(object);
            if (destroyTexture) object.texture.destroy();
            object.destroy();
        }
    };
    Game.app.ticker.add(animation);
}

export function createSpikeAnimation(origin, offsetX, offsetY, color = 0xffffff, zIndex = origin.zIndex - 1) {
    const attack = new TileElement(EffectsSpriteSheet["spike.png"], origin.tilePosition.x, origin.tilePosition.y);
    attack.tint = color;
    attack.position.set(origin.getTilePositionX(), origin.getTilePositionY());
    attack.zIndex = zIndex;
    attack.anchor.set(0, 0.5);
    attack.angle = getAngleForDirection({x: offsetX, y: offsetY});
    Game.world.addChild(attack);
    const animationTime = 10;
    const pythagorSideMul = Math.max(Math.abs(offsetX), Math.abs(offsetY)) === 2 ? 1.25 : 1.5;
    const sizeMod = Math.sqrt((pythagorSideMul * Math.abs(offsetX)) ** 2 + (pythagorSideMul * Math.abs(offsetY)) ** 2);
    const widthStep = attack.width * sizeMod / (animationTime / 2);
    attack.width = 1;
    const delay = 6;
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        if (counter < animationTime / 2) {
            attack.width = widthStep * counter;
        } else if (counter < animationTime / 2 + delay) {
            attack.width = widthStep * animationTime / 2;
        } else if (counter >= animationTime / 2 + delay) {
            attack.width -= widthStep;
            if (attack.width <= 0) attack.width = 1;
        }
        if (counter >= animationTime + delay) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(attack);
            attack.destroy();
        }
    };
    Game.app.ticker.add(animation);
}

export function createCrazySpikeAnimation(origin, offsetX, offsetY, color, bottom = false) {
    const sideDiff = 0.07;
    setTickTimeout(() =>
            createSpikeAnimation(origin,
                offsetX + Math.random() * sideDiff * 2 - sideDiff,
                offsetY + Math.random() * sideDiff * 2 - sideDiff, color, bottom ? origin.zIndex - 2 : origin.zIndex - 1),
        Math.random() * 4);
}

export function createThunderAnimation(enemy) {
    const strikeTime = 4;
    const angleStayTime = 3;

    createPlayerAttackTile(enemy.tilePosition, strikeTime + angleStayTime * 2);

    const thunderSprite = new TileElement(EffectsSpriteSheet["thunder_effect.png"], enemy.tilePosition.x, enemy.tilePosition.y);
    thunderSprite.zIndex = enemy.zIndex + 1;
    Game.world.addChild(thunderSprite);
    thunderSprite.anchor.set(0.5, 1);
    thunderSprite.position.set(enemy.position.x, enemy.position.y);
    const offsetY = Game.TILESIZE * 0.75;
    thunderSprite.position.y -= offsetY;
    const initPos = thunderSprite.position.y;
    let counter = 0;
    let firstAngle = randomInt(12, 18);
    let secondAngle = randomInt(-12, -18);
    if (Math.random() < 0.5) [firstAngle, secondAngle] = [secondAngle, firstAngle];
    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        if (counter < strikeTime) {
            thunderSprite.position.y = initPos + counter / strikeTime * offsetY;
        } else if (counter >= strikeTime && counter < strikeTime + angleStayTime) {
            thunderSprite.position.y = initPos + offsetY;
            thunderSprite.angle = firstAngle;
        } else if (counter >= strikeTime + angleStayTime && counter < strikeTime + angleStayTime * 2) {
            thunderSprite.angle = secondAngle;
        } else {
            Game.world.removeChild(thunderSprite);
            Game.app.ticker.remove(animation);
            thunderSprite.destroy();
        }
    };

    Game.app.ticker.add(animation);
}

export function createEmpyrealWrathAnimation(enemy) {
    const wrathSprite = new TileElement(EffectsSpriteSheet["empyreal_wrath_effect.png"], enemy.tilePosition.x, enemy.tilePosition.y);
    wrathSprite.setScaleModifier(1.3);
    wrathSprite.zIndex = enemy.zIndex + 1;
    Game.world.addChild(wrathSprite);
    wrathSprite.anchor.set(0.5, 1);
    wrathSprite.position.set(enemy.position.x, enemy.position.y);
    const angle = randomInt(-45, 45);
    wrathSprite.angle = angle;
    const offsetY = Game.TILESIZE * 2;
    const offsetX = offsetY * angle / 45;
    wrathSprite.position.y -= offsetY;
    wrathSprite.position.x += offsetX;
    const initPos = {x: wrathSprite.position.x, y: wrathSprite.position.y};

    const strikeTime = 5 + Math.abs(offsetX) / offsetY * 3;
    const stayTime = 3;
    createPlayerAttackTile(enemy.tilePosition, strikeTime + stayTime);
    let counter = 0;
    shakeScreen(6, 3);
    const animation = delta => {
        if (Game.paused) return;
        counter += delta;
        if (counter < strikeTime) {
            wrathSprite.position.y = initPos.y + counter / strikeTime * offsetY;
            wrathSprite.position.x = initPos.x - counter / strikeTime * offsetX;
        } else if (counter >= strikeTime && counter < strikeTime + stayTime) {
            wrathSprite.position.y = initPos.y + offsetY;
            wrathSprite.position.x = initPos.x - offsetX;
        } else {
            Game.world.removeChild(wrathSprite);
            Game.app.ticker.remove(animation);
            wrathSprite.destroy();
        }
    };

    Game.app.ticker.add(animation);
}

export function createShadowFollowers(entity, amount, animationTime) {
    for (let i = 0; i < amount; i++) {
        const shadow = new PIXI.Sprite(entity.texture);
        shadow.anchor.set(entity.anchor.x, entity.anchor.y);
        shadow.scale.set(entity.scale.x, entity.scale.y);
        shadow.position.set(entity.position.x, entity.position.y);
        Game.world.addChild(shadow);
        shadow.alpha = 0.6 - (i / amount) * 0.6;

        animationTime += 1 + i;
        let counter = 0;
        let delay = i + 1;
        const entityPositions = [{x: entity.position.x, y: entity.position.y}];

        const animation = delta => {
            counter += delta;
            entityPositions.push({x: entity.position.x, y: entity.position.y});
            if (counter <= delay) return;
            shadow.position.set(entityPositions[0].x, entityPositions[0].y);
            entityPositions.shift();

            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(shadow);
                shadow.destroy();
            }
        };

        Game.app.ticker.add(animation);
    }
}

export function createSmallOffsetParticle(texture, tile, side = randomChoice([-1, 1]), animationTime = 10) {
    const particle = new TileElement(texture, tile.x, tile.y);
    Game.world.addChild(particle);
    particle.position.x += randomInt(Game.TILESIZE / 10, Game.TILESIZE / 3) * side;
    particle.position.y -= randomInt(-Game.TILESIZE / 4, Game.TILESIZE / 3);
    particle.width = particle.height = Game.TILESIZE / 3;
    const initSize = particle.width;
    const sizeChange = Game.TILESIZE / 4;
    const startPosY = particle.position.y;
    const posYEndChange = -Game.TILESIZE / 2;
    particle.zIndex = getZIndexForLayer(tile.y) + Z_INDEXES.META;

    let counter = 0;

    const animation = delta => {
        if (Game.paused) return;
        counter += delta;
        particle.position.y = startPosY + easeOutQuad(counter / animationTime) * posYEndChange;
        particle.height = particle.width = initSize + easeOutQuad(counter / animationTime) * sizeChange;
        if (counter >= animationTime * 3 / 4) {
            particle.alpha = 1 - easeOutQuad((counter - animationTime * 3 / 4) / (animationTime / 4));
        }

        if (counter >= animationTime) {
            Game.app.ticker.remove(animation);
            Game.world.removeChild(particle);
            particle.destroy();
        }
    };

    Game.app.ticker.add(animation);
}