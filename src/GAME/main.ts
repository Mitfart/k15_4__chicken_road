import {Game} from "../../plugins/Game/Game.ts";
import {Level} from "./game/Level.ts";
import {Chicken} from "./game/Chicken.ts";
import Bank from "../UI/Bank.ts";
import Header, {HeaderScreen} from "../UI/Header.ts";
import Contols, {ControlsScreen} from "../UI/Contols.ts";
import {OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AnimPulseIn, AnimScale, Play} from "../../plugins/Utils/Animations.ts";
import Chest from "../UI/Chest.ts";
import Wheel from "../UI/Wheel.ts";
import {sound} from "@pixi/sound";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import sdk from "@smoud/playable-sdk";
import {delay} from "../../plugins/Utils/utils.ts";
import VFX from "../VFX/VFX.ts";
import {Packshot_Horizontal, Packshot_Vertical} from "../UI/Packshot.ts";
import {ChestLevelView} from "../UI/ChestLevelView.ts";
import {GAME_CONFIG} from "../game.config.ts";


let _game!: Game;

let level!: Level;
const specials: ({ id: number, func: () => void })[] = [
    // { id: 5, (game) => { game.ui.add(...) } }
    { id: 2, func: async () => {
        blockInput = true;
        sound.play(AssetsDB.audio.win);
        await Chest.Show(_game, () => {
            chicken.balanceTxt.text = 'x3.5';
            blockInput = false;
        });
    } },
    { id: 6, func: async () => {
        blockInput = true;
        sound.play(AssetsDB.audio.win);
        await Wheel.Show(_game, () => {
            chicken.balanceTxt.text = 'x300';
            blockInput = false;
        });
    } }
];

let chicken!: Chicken;
const chickenJump = {
    height: 25,
    duration: .5
};

let blockInput: boolean = false;

let score: number = 0;

let header!: HeaderScreen;
let controls!: ControlsScreen;


export async function Main(game: Game) {
    // ===========================================================================================
    _game = game;

    level = game.container.addChild(new Level());
    chicken = game.container.addChild(new Chicken(chickenJump.height, chickenJump.duration));

    game.resizer.addResizeAction((w, h) => {
        game.container.scale.set(Math.max(
            1,
            w / level.width * .8,
            h / level.height * .8
        ));

        level.position.set(0, h * .23 / game.container.scale.y);

        chicken.position.set(level.currentPosition, level.position.y);
    });

    // ===========================================================================================

    game.ui.setFollowObject(chicken, {x: .475, y: .5});
    game.ui.setFollowBounds(level);

    // ===========================================================================================

    level.nextSegment?.target();
    level.startRandomDriveThrow();

    const segment = level.getSegment(2);
    if (segment) {
        segment.addChild(ChestLevelView()).position.set(
            GAME_CONFIG.level.segmentSize / 2,
            -10
        );
    }

    sound.play(AssetsDB.audio.music, { volume: .5, });

    // ===========================================================================================

    header = await Header.Construct(game);
    controls = await Contols.Construct(game);
    const playBtnAnim = Play(AnimPulseIn(controls.playBtn, .25, .5));

    OnClick(controls.playBtn, () => {
        if (blockInput) return;
        blockInput = true;

        playBtnAnim();
        play();
    });

    // ===========================================================================================
}


async function play() {
    if (chicken.isJumping
        || level.nextSegment?.Available
        || level.currentSegment?.Available
        || level.currentSegmentID >= level.length - 1)
        return;

    level.currentSegmentID++;

    sound.play(AssetsDB.audio.click);

    Play(AnimScale(chicken.balanceBlock, { from: chicken.balanceBlock.scale.x, to: 1 }))();

    level.prevSegment?.complete();

    chicken.jumpTo(level.currentPosition, level.position.y, async () => {
        level.currentSegment?.activate();
        level.nextSegment?.target();

        const special = specials.find(s => s.id === level.currentSegmentID);
        if (special) {
            special.func();
            return;
        } else if (level.currentSegmentID >= level.length - 1) {
            await finish();
            return
        } else {
            setScore(level.currentSegment?.value || 0);
            chicken.balanceTxt.text = level.currentSegment?.value_view ?? '';
            blockInput = false;
        }
    });
}


async function setScore(value: number) {
    header.balanceTxt.setValue(score, value);
    controls.balanceTxt.setValue(score, value);

    score = value;
}


async function finish() {
    sound.play(AssetsDB.audio.win);

    await delay(.5);

    const confetti = _game.container.addChild(VFX.confetti());
    confetti.scale = 1.5;
    confetti.position.set(
        level.x + chicken.x,
        level.y - 25
    );

    chicken.playWin();

    await Bank.Show(_game, 2);

    await delay(.5);


    const packshot_ver = await Packshot_Vertical.Construct(_game);
    packshot_ver.screen.show();

    const packshot_hor = await Packshot_Horizontal.Construct(_game);
    packshot_hor.screen.show();

    const install = () => {
        sound.play(AssetsDB.audio.click);

        sdk.install();
    };

    OnClick(packshot_ver.btn, install);
    OnClick(packshot_hor.btn, install);

    await Bank.Hide();
}