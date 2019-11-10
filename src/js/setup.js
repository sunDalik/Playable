"use strict";

PIXI.utils.skipHello();
const app = initApplication();
Game.APP = app;
Game.loader = app.loader;
Game.resources = app.loader.resources;
loadAll();

function initApplication() {
    let app = new PIXI.Application({resolution: window.devicePixelRatio});
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resolution = 2;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}

window.addEventListener("resize", () => {
    Game.APP.renderer.resize(window.innerWidth, window.innerHeight);
});

function setup() {
    Game.world = new PIXI.Container();
    Game.APP.stage.addChild(Game.world);

    Game.HUD = new PIXI.Container();
    Game.hearts1 = new PIXI.Container();
    Game.hearts2 = new PIXI.Container();
    Game.slots1 = new PIXI.Container();
    Game.slots2 = new PIXI.Container();
    Game.HUD.addChild(Game.hearts1);
    Game.HUD.addChild(Game.hearts2);
    Game.HUD.addChild(Game.slots1);
    Game.HUD.addChild(Game.slots2);
    Game.APP.stage.addChild(Game.HUD);

    Game.world.sortableChildren = true;
    Game.APP.stage.sortableChildren = true;
    Game.slots1.sortableChildren = true;
    Game.slots2.sortableChildren = true;

    Game.player = new Player(Game.resources["src/images/player.png"].texture, 0, 0);
    Game.player2 = new Player(Game.resources["src/images/player2.png"].texture, 0, 0);
    Game.player.setStats(0, 0.5, 0, 1.00);
    Game.player2.setStats(0, 1.00, 0, 0.5);
    Game.player2.weapon = new Knife();
    Game.player.armor = new BasicArmor();

    drawHUD();
    bindKeys();
    window.addEventListener("resize", () => {
        drawHUD();
        centerCamera();
    });

    Game.player.zIndex = Game.player2.zIndex + 1;
    Game.primaryPlayer = Game.player;

    Game.stage = STAGE.FLOODED_CAVE;
    setVariablesForStage();
    initializeLevel();
}

function initializeLevel() {
    let level = generateLevel();
    Game.map = generateMap(level);
    Game.level = level;
    calculateDetectionGraph(Game.map);
    Game.levelGraph = getLevelPlayerGraph(level);

    Game.player.tilePosition.set(Game.startX, Game.startY);
    Game.player2.tilePosition.set(Game.startX + 1, Game.startY + 1);
    Game.player.place();
    Game.player2.place();
    Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].entity = Game.player;
    Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;

    Game.grid = drawGrid();
    drawTiles();
    drawEntities();
    drawHUD();
    drawOther();
    createDarkness();
    lightPlayerPosition(Game.player);
    lightPlayerPosition(Game.player2);
    centerCamera();
}

function bindKeys() {
    bindMovement(Game.player, {upCode: 87, leftCode: 65, downCode: 83, rightCode: 68}); //w a s d
    bindMovement(Game.player2, {upCode: 38, leftCode: 37, downCode: 40, rightCode: 39}); //arrows
    bindMagic(Game.player, {oneCode: 49, twoCode: 50, threeCode: 51, fourCode: 52}); //1 2 3 4
    bindMagic(Game.player2, {oneCode: 55, twoCode: 56, threeCode: 57, fourCode: 48}); //7 8 9 0

    const switchKey = keyboard(90); //Z
    switchKey.press = () => {
        playerTurn(null, switchPlayers, true)
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

function generateMap(level) {
    let map = copy2dArray(level);
    let obeliskTiles = [];
    for (let i = 0; i < map.length; ++i) {
        for (let j = 0; j < map[0].length; ++j) {
            let mapCell = {
                tileType: TILE_TYPE.NONE,
                tile: null,
                hazard: null,
                entity: null,
                secondaryEntity: null,
                lit: false
            };
            if (map[i][j] === "w") {
                mapCell.tileType = TILE_TYPE.WALL;
                mapCell.tile = new WallTile(j, i);
            } else if (map[i][j] === "sw") {
                mapCell.tileType = TILE_TYPE.SUPER_WALL;
                mapCell.tile = new SuperWallTile(j, i);
            } else if (map[i][j] === "v") {
                mapCell.tileType = TILE_TYPE.VOID;
            } else if (map[i][j] === "entry") {
                mapCell.tileType = TILE_TYPE.ENTRY;
            } else if (map[i][j] === "path") {
                mapCell.tileType = TILE_TYPE.PATH;
            } else if (map[i][j] === "exit") {
                mapCell.tileType = TILE_TYPE.EXIT;
                mapCell.tile = new FullTileElement(Game.resources["src/images/exit.png"].texture, j, i);
            }

            if (map[i][j] === "r") mapCell.entity = new Roller(j, i);
            else if (map[i][j] === "rb") mapCell.entity = new RollerB(j, i);
            else if (map[i][j] === "s") mapCell.entity = new Star(j, i);
            else if (map[i][j] === "sb") mapCell.entity = new StarB(j, i);
            else if (map[i][j] === "spi") mapCell.entity = new Spider(j, i);
            else if (map[i][j] === "spib") mapCell.entity = new SpiderB(j, i);
            else if (map[i][j] === "sna") mapCell.entity = new Snail(j, i);
            else if (map[i][j] === "snab") mapCell.entity = new SnailB(j, i);
            else if (map[i][j] === "eel") mapCell.entity = new Eel(j, i);
            else if (map[i][j] === "eel_dark") mapCell.entity = new PoisonEel(j, i);
            else if (map[i][j] === "eel_poison") mapCell.entity = new DarkEel(j, i);
            else if (map[i][j] === "statue") mapCell.entity = new Statue(j, i, getRandomWeapon());
            else if (map[i][j] === "chest") mapCell.entity = new Chest(j, i, getRandomChestDrop());
            else if (map[i][j] === "obelisk") {
                let magicPool = [];
                for (let i = 0; i < 4; ++i) {
                    while (true) {
                        const randomSpell = getRandomSpell();
                        if (!magicPool.some(magic => magic.type === randomSpell.type)) {
                            magicPool.push(randomSpell);
                            break;
                        }
                    }
                }
                obeliskTiles.push({x: j, y: i});
                mapCell.entity = new Obelisk(j, i, magicPool);
            }

            map[i][j] = mapCell;
        }
    }

    for (const obelisk of obeliskTiles) {
        const obeliskEntity = map[obelisk.y][obelisk.x].entity;
        if (map[obelisk.y][obelisk.x - 2].tileType === TILE_TYPE.WALL || map[obelisk.y][obelisk.x + 2].tileType === TILE_TYPE.WALL) {
            map[obelisk.y + 1][obelisk.x - 1].entity = obeliskEntity.grail1;
            obeliskEntity.grail1.tilePosition.set(obelisk.x - 1, obelisk.y + 1);
            map[obelisk.y + 1][obelisk.x + 1].entity = obeliskEntity.grail2;
            obeliskEntity.grail2.tilePosition.set(obelisk.x + 1, obelisk.y + 1);
            map[obelisk.y + 2][obelisk.x - 1].entity = obeliskEntity.grail3;
            obeliskEntity.grail3.tilePosition.set(obelisk.x - 1, obelisk.y + 2);
            map[obelisk.y + 2][obelisk.x + 1].entity = obeliskEntity.grail4;
            obeliskEntity.grail4.tilePosition.set(obelisk.x + 1, obelisk.y + 2);
        } else {
            map[obelisk.y][obelisk.x - 1].entity = obeliskEntity.grail1;
            obeliskEntity.grail1.tilePosition.set(obelisk.x - 1, obelisk.y);
            map[obelisk.y][obelisk.x + 1].entity = obeliskEntity.grail2;
            obeliskEntity.grail2.tilePosition.set(obelisk.x + 1, obelisk.y);
            map[obelisk.y][obelisk.x - 2].entity = obeliskEntity.grail3;
            obeliskEntity.grail3.tilePosition.set(obelisk.x - 2, obelisk.y);
            map[obelisk.y][obelisk.x + 2].entity = obeliskEntity.grail4;
            obeliskEntity.grail4.tilePosition.set(obelisk.x + 2, obelisk.y);
        }
        obeliskEntity.placeGrails();
    }

    return map;
}

function incrementStage() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            Game.stage = STAGE.DARK_TUNNEL;
            break;
        case STAGE.DARK_TUNNEL:
            Game.stage = STAGE.RUINS;
            break;
        case STAGE.RUINS:
            Game.stage = STAGE.DUNNO;
            break;
        case STAGE.DUNNO:
            Game.stage = STAGE.FINALE;
            break;
    }
}

function setVariablesForStage() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            Game.normalRooms = FCNormalRooms;
            Game.statueRooms = FCStatueRooms;
            Game.obeliskRooms = FCObeliskRooms;
            Game.chestRooms = FCChestRooms;
            Game.BGColor = "0xabcfd1";
            break;
        case STAGE.DARK_TUNNEL:
            Game.normalRooms = DTNormalRooms;
            Game.statueRooms = DTStatueRooms;
            Game.obeliskRooms = DTObeliskRooms;
            Game.chestRooms = DTChestRooms;
            Game.BGColor = "0x666666";
            break;
    }
}

function calculateDetectionGraph(map) {
    Game.playerDetectionGraph = new Graph(map);
    for (let i = 0; i < Game.playerDetectionGraph.grid.length; ++i) {
        for (let j = 0; j < Game.playerDetectionGraph.grid[0].length; ++j) {
            if (Game.playerDetectionGraph.grid[i][j].weight.tileType === TILE_TYPE.VOID
                || Game.playerDetectionGraph.grid[i][j].weight.tileType === TILE_TYPE.PATH
                || Game.playerDetectionGraph.grid[i][j].weight.tileType === TILE_TYPE.WALL
                || Game.playerDetectionGraph.grid[i][j].weight.tileType === TILE_TYPE.SUPER_WALL) {
                Game.playerDetectionGraph.grid[i][j].weight = 0;
            } else {
                Game.playerDetectionGraph.grid[i][j].weight = 1;
            }
        }
    }
}