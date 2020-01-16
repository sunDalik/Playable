import {Game} from "./game"
import * as PIXI from "pixi.js"
import {getRandomInt, randomChoice} from "./utils/random_utils";
import {ITEM_OUTLINE_FILTER} from "./filters";
import {HUDTextStyle, HUDTextStyleTitle, miniMapBottomOffset} from "./drawing/draw_constants";
import {HUD} from "./drawing/hud_object";
import {camera} from "./classes/game/camera";
import {ROLE, STAGE} from "./enums";
import {easeInOutQuad, easeInQuad, easeOutQuad, quadraticBezier} from "./utils/math_utils";

export function createPlayerWeaponAnimation(player, tileX2, tileY2, size = Game.TILESIZE / 3) {
    const tileX1 = player.tilePosition.x;
    const tileY1 = player.tilePosition.y;
    let attackParticle = new PIXI.Sprite(PIXI.Texture.WHITE);
    player.animationSubSprites.push(attackParticle);
    attackParticle.width = attackParticle.height = size;
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

    //shakeDirectional(-Math.sign(tileX2 - tileX1), -Math.sign(tileY2 - tileY1), 2, 3);

    const animation = (delta) => {
        if (Game.paused) return;
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
        if (Game.paused) return;
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

export function createFadingText(caption, positionX, positionY, fontSize = Game.TILESIZE / 65 * 26, TEXT_ANIMATION_TIME = 80) {
    let counter = 0;
    const text = new PIXI.Text(caption, {
        fontSize: fontSize,
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
        if (Game.paused) return;
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

export function createFloatingItemAnimation(item) {
    const animationTime = Game.ITEM_FLOAT_ANIMATION_TIME;
    const amplitude = item.height / 4;
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
        if (Game.paused) return;
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

export function shakeDirectional(x, y, amplitude, animationTime) {
    const stepX = x * amplitude / animationTime;
    const stepY = y * amplitude / animationTime;
    let counter = 0;

    const animation = delta => {
        if (Game.paused) return;
        counter += delta;
        if (counter < animationTime / 2) {
            Game.world.position.x -= stepX * delta;
            Game.world.position.y -= stepY * delta;
        } else {
            Game.world.position.x += stepX * delta;
            Game.world.position.y += stepY * delta;
        }
        if (counter >= animationTime) {
            Game.app.ticker.remove(animation);
            if (camera.animation === null) camera.center();
        }
    };

    Game.app.ticker.add(animation);
}

export function longShakeScreen() {
    //shakeScreen(8, 1, 40);
}

export function createHeartAnimation(positionX, positionY, heartSize = Game.TILESIZE / 3, animationTime = 26, pound = false, poundTwice = false) {
    const heart = new PIXI.Sprite(Game.resources["src/images/HUD/heart_full.png"].texture);
    heart.width = heartSize;
    heart.height = heartSize;
    const sizeEndChange = pound ? heartSize : heartSize / 2;
    heart.anchor.set(0.5, 0.5);
    heart.position.set(positionX, positionY - heart.height / 4);
    const startPosY = heart.position.y;
    const posYEndChange = -Game.TILESIZE / 3;
    heart.zIndex = 99;
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
        }
    };

    Game.app.ticker.add(animation);
}

export function createKissHeartAnimation(positionX, positionY) {
    createHeartAnimation(positionX, positionY, Game.TILESIZE / 3, 60, true)
}

export function createStrongKissHeartAnimation(positionX, positionY) {
    createHeartAnimation(positionX, positionY, Game.TILESIZE / 3, 70, true, true)
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

    const slideTime = 20;
    const startVal = Game.itemHelp.position.y;
    const endChange = -Game.itemHelp.height - miniMapBottomOffset;
    const stayTime = 180;
    let placed = false;
    let counter = 0;

    const animation = (delta) => {
        if (Game.paused) return;
        counter += delta;
        if (Game.itemHelp === null) {
            Game.app.ticker.remove(animation);
            return;
        }
        if (counter < slideTime) {
            Game.itemHelp.position.y = startVal + easeOutQuad(counter / slideTime) * endChange;
        } else if (counter >= slideTime + stayTime && counter < slideTime + stayTime + slideTime) {
            Game.itemHelp.position.y = startVal + endChange - easeInQuad((counter - slideTime - stayTime) / slideTime) * endChange;
        }
        if (counter >= slideTime && !placed) {
            placed = true;
            Game.itemHelp.position.y = startVal + endChange;
        }
        if (counter >= slideTime + stayTime + slideTime) {
            Game.app.ticker.remove(animation);
            HUD.removeChild(Game.itemHelp);
        }
    };

    Game.itemHelpAnimation = animation;
    Game.app.ticker.add(animation);
}

export function runDestroyAnimation(tileElement, playerDeath = false, sloMoMul = 0.1) {
    //todo: fix angle
    const YBorders = [0, undefined, undefined, tileElement.texture.height];
    const XBorders = [0, undefined, undefined, tileElement.texture.width];
    const maxOffsetMul = 1 / 9;
    for (let i = 1; i <= 2; i++) {
        YBorders[i] = YBorders[i - 1] + tileElement.texture.height / 3 + getRandomInt(-tileElement.texture.height * maxOffsetMul, tileElement.texture.height * maxOffsetMul);
        XBorders[i] = XBorders[i - 1] + tileElement.texture.width / 3 + getRandomInt(-tileElement.texture.width * maxOffsetMul, tileElement.texture.width * maxOffsetMul);
    }
    for (const region of [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
        {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
        {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}]) {
        const particle = new PIXI.Sprite(tileElement.texture.clone());
        let scaleMul = 1;
        if (playerDeath) scaleMul = 1.2;
        else if (tileElement.role !== undefined) scaleMul = 0.8;
        else scaleMul = 0.4;
        particle.scale.set(tileElement.scale.x, tileElement.scale.y);
        const initScaleX = particle.scale.x;
        const initScaleY = particle.scale.y;
        particle.angle = tileElement.angle;
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
        if (Math.sign(tileElement.scale.x) === -1) offsetX = tileElement.texture.width - offsetX - trimTexWidth;
        if (Math.sign(tileElement.scale.y) === -1) offsetY = tileElement.texture.height - offsetY - trimTexHeight;
        particle.texture.frame = new PIXI.Rectangle(offsetX, offsetY, trimTexWidth, trimTexHeight);
        const trimWidth = trimTexWidth / tileElement.texture.width * tileElement.width;
        const trimHeight = trimTexHeight / tileElement.texture.height * tileElement.height;
        const posOffsetX = trimWidth * (region.x - 1.5) + trimWidth * tileElement.anchor.x;
        const posOffsetY = trimHeight * (region.y - 1.5) + trimHeight * tileElement.anchor.y;
        particle.position.x += posOffsetX;
        particle.position.y += posOffsetY;
        particle.texture.updateUvs();

        let flyDir = 1;
        if (region.x === 0) flyDir = -1;
        else if (region.x === 2) flyDir = 1;
        else if (region.x === 1) flyDir = randomChoice([-1, 1]);
        const flyHeight = getRandomInt(Game.TILESIZE, Game.TILESIZE * 2);
        const oldPosX = particle.position.x;
        const oldPosY = particle.position.y;
        const distX = getRandomInt(-tileElement.width / 4, tileElement.width / 1.5) * flyDir;
        const middlePoint = {x: oldPosX + distX / 2, y: oldPosY - flyHeight};
        const finalPoint = {
            x: oldPosX + distX,
            y: tileElement.getTilePositionY() + (1 - tileElement.anchor.y) * Game.TILESIZE - getRandomInt(0, Game.TILESIZE / 2)
        };

        const animationTime = getRandomInt(10, 14);
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

            if (!Game.paused && playerDeath) {
                Game.world.upWorld.removeChild(particle);
                Game.world.addChild(particle);
            }
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                particle.position.set(finalPoint.x, finalPoint.y);
                if (playerDeath) {
                    Game.world.upWorld.removeChild(particle);
                    Game.world.addChild(particle);
                    particle.zIndex = -1;
                    particle.scale.set(initScaleX * scaleMul, initScaleY * scaleMul);
                }
            }
        };
        Game.app.ticker.add(animation);
    }
}