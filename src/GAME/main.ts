import {Game} from "../../plugins/Game/Game.ts";
import {Level} from "./game/Level.ts";
import {Chicken} from "./game/Chicken.ts";
import Bank from "../UI/Bank.ts";
import Header, {HeaderScreen} from "../UI/Header.ts";
import Contols, {ControlsScreen} from "../UI/Contols.ts";
import MainTutorial from "../UI/MainTutorial.ts";
import {CreateHandTutorial} from "../UI/HandTutorial.ts";
import {OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AnimPulseIn, AnimScale, Play} from "../../plugins/Utils/Animations.ts";
import Packshot from "../UI/Packshot.ts";
import Chest from "../UI/Chest.ts";
import Wheel from "../UI/Wheel.ts";
import {sound} from "@pixi/sound";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import sdk from "@smoud/playable-sdk";


let _game!: Game;

let level!: Level;
const specials: ({ id: number, func: () => void })[] = [
    // { id: 5, (game) => { game.ui.add(...) } }
    { id: 2, func: async () => {
        blockInput = true;
        await Chest.Show(_game, () => {
            chicken.balanceTxt.text = 'x3.5';
            blockInput = false;
        });
    } },
    { id: 6, func: async () => {
        blockInput = true;
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

    sound.play(AssetsDB.audio.music);

    // ===========================================================================================

    header = await Header.Construct(game);
    controls = await Contols.Construct(game);
    const playBtnAnim = Play(AnimPulseIn(controls.playBtn, .25, .5));

    const mainTutorial = await MainTutorial.Construct(game, header, controls);
    await mainTutorial.show();

    const handTutorialGo = CreateHandTutorial(_game, controls.playBtn);
    handTutorialGo.show();

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
        } else {
            setScore(level.currentSegment?.value || 0);
        }

        if (level.currentSegmentID >= level.length - 1) {
            await Bank.Show(_game, 2);

            await new Promise((resolve) => setTimeout(resolve, 500) );

            const packshot = await Packshot.Construct(_game);
            packshot.container.show();

            OnClick(packshot.btn, () => {
                sound.play(AssetsDB.audio.click);

                sdk.install();
            });

            await Bank.Hide();
        } else {
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