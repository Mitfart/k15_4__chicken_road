import {Game} from "../../plugins/Game/Game.ts";
import {Level} from "./game/Level.ts";
import {Chicken} from "./game/Chicken.ts";
import Bank from "../UI/Bank.ts";
import Header, {HeaderScreen} from "../UI/Header.ts";
import Contols, {ControlsScreen} from "../UI/Contols.ts";
import MainTutorial from "../UI/MainTutorial.ts";
import {CreateHandTutorial} from "../UI/HandTutorial.ts";
import {OffClick, OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AnimPulseIn, AnimScale, Play} from "../../plugins/Utils/Animations.ts";
import Chest from "../UI/Chest.ts";
import Panel from "../UI/Panel.ts";
import Wheel from "../UI/Wheel.ts";
import {sound} from "@pixi/sound";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import sdk from "@smoud/playable-sdk";
import {delay} from "../../plugins/Utils/utils.ts";
import VFX from "../VFX/VFX.ts";
import {Packshot_Horizontal, Packshot_Vertical} from "../UI/Packshot.ts";
import {ChestLevelView} from "../UI/ChestLevelView.ts";
import {GAME_CONFIG} from "../game.config.ts";
import {Container} from "pixi.js";
import {OnlineUsers} from "../UI/OnlineUsers.ts";
import {Tutorial} from "../../plugins/Utils/Components/Tutorial.ts";


let _game!: Game;

let level!: Level;
const specials: ({ id: number, func: () => void })[] = [
    // { id: 5, (game) => { game.ui.add(...) } }
    { id: 2, func: async () => {
        blockInput = true;

        chestLevelView.visible = false;

        await Chest.Show(_game, () => {
            sound.play(AssetsDB.audio.win);

            chicken.balanceTxt.text = 'x3.5';
            blockInput = false;
        });
    } },
    { id: 6, func: async () => {
        blockInput = true;
        await Wheel.Show(_game, () => {
            sound.play(AssetsDB.audio.win);

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

let chestLevelView!: Container;


export async function Main(game: Game) {
    // ===========================================================================================
    _game = game;

    level = game.container.addChild(new Level());
    chicken = game.container.addChild(new Chicken(chickenJump.height, chickenJump.duration));

    game.resizer.addResizeAction(_game.container.uid, (w, h) => {
        game.container.scale.set(Math.max(
            1,
            w / level.width * .8,
            h / level.height * 1.125
        ));

        level.position.set(0, h * .45 / game.container.scale.y);

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
        chestLevelView = segment.addChild(ChestLevelView());
        chestLevelView.position.set(
            GAME_CONFIG.level.segmentSize / 2,
            -10
        );
    }

    sound.play(AssetsDB.audio.music, { volume: .5, });

    // ===========================================================================================

    header = await Header.Construct(game);

    await OnlineUsers.Construct(game);

    controls = await Contols.Construct(game);
    const playBtnAnim = Play(AnimPulseIn(controls.playBtn, .25, .5));

    const handTutorialGo = CreateHandTutorial(_game, controls.playBtn, {
        offsetY: -50,
        offsetYPortrait: -120,
        rotation: Math.PI,
    });

    blockInput = true;
    const mainTutorial = await MainTutorial.Construct(game, header, controls, {
        onShow: () => blockInput = true,
        onHide: () => {
            blockInput = false;
            handTutorialGo.show();
        },
        otherTutorials: [
            { isVisible: () => handTutorialGo.isVisible(), hide: () => handTutorialGo.hide(), show: () => handTutorialGo.show() },
        ],
    });
    await mainTutorial.show();

    OnClick(controls.playBtn, () => {
        if (blockInput) return;
        handTutorialGo.hide();
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
            return;
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
    const confetti = _game.container.addChild(VFX.confetti());
    confetti.scale = 1.5;
    confetti.position.set(
        level.x + chicken.x,
        level.y - 25
    );

    chicken.playWin();

    sound.play(AssetsDB.audio.win);
    await delay(.5);

    controls.container.zIndex = 1000;

    Panel.Show(_game, {
        text: "CONGRATULATIONS",
        amountText: "7 000 EUR",
        showButton: false,
        useCover: true,
        autoCloseAfter: 10,
        onClaim: () => cashClick()
    });

    const cashTutorial = controls.cashBtn.addChild(new Tutorial(AssetsDB.texture.hand));

    cashTutorial.show();

    let cashed: boolean = false;
    const cashClick = async () => {
        if (cashed) return;
        cashed = true;
        OffClick(controls.cashBtn, cashClick);

        controls.container.zIndex = 0;

        AnimPulseIn(controls.cashBtn, .5, .5);
        cashTutorial.hide();

        await Promise.all([
            Panel.Hide(),
            Bank.Show(_game, 2),
        ]);
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
    };
    OnClick(controls.cashBtn, cashClick);
}