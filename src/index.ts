import {Game} from "../plugins/Game/Game.ts";
import {APP_CONFIG} from "./config.ts";
import {AssetsBase64} from "../plugins/Assets/AssetsBase64.ts";
import {AssetsDB} from "../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {Main} from "./GAME/main.ts";
import {AddAutoIllustrativeText, AddBackground} from "../plugins/Game/GameUIUtils.ts";
import LoadingCurtain from "./UI/LoadingCurtain.ts";

// =====================================================================================

const game = new Game(APP_CONFIG);

// =====================================================================================

window.onload = async () => {
    await game.initialise();

    // GAME BACKGROUND
    // @ts-expect-error API
    if (AssetsDB.texture && AssetsDB.texture.background) await AddBackground(AssetsDB.texture.background);
    game.resize();

    // LOADING
    await Promise.all([
        AssetsBase64.loadAll(),
        LoadingCurtain.Show(game)
    ]);

    await Main(game);

    // FOR IRON-SOURCE
    AddAutoIllustrativeText();

    game.resize();
};

// =====================================================================================