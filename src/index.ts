import {Game} from "../plugins/Game/Game.ts";
import {APP_CONFIG} from "./config.ts";
import {AssetsBase64} from "../plugins/Assets/AssetsBase64.ts";
import {Main} from "./GAME/main.ts";
import {AddAutoIllustrativeText} from "../plugins/Game/GameUIUtils.ts";
import LoadingCurtain from "./UI/LoadingCurtain.ts";
import Header from "./UI/Header.ts";
import {GAME_CONFIG} from "./game.config.ts";

// =====================================================================================

const game = new Game(APP_CONFIG);

// =====================================================================================

window.onload = async () => {
    await game.initialise();

    await AssetsBase64.loadAll();

    await LoadingCurtain.Construct(game);

    const header = await Header.Construct(game);
    header.balanceTxt.setValue(GAME_CONFIG.initialBalance, GAME_CONFIG.initialBalance);

    game.resize();

    await LoadingCurtain.Show(game);
    LoadingCurtain.Hide(game);

    await Main(game);

    // FOR IRON-SOURCE
    AddAutoIllustrativeText();

    game.resize();
};

// =====================================================================================