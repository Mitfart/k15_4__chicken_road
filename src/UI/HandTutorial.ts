import * as PIXI from "pixi.js";
import {Assets, Container, Sprite} from "pixi.js";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

const HAND_SCALE = 1.2;
const TAP_DURATION = 0.5;
const TAP_SCALE_PRESSED = 0.85;
const TAP_INTERVAL = 1.2;

export type HandTutorialInstance = {
    show: () => void;
    hide: () => void;
    destroy: () => void;
    isVisible: () => boolean;
};

export function CreateHandTutorial(
    game: Game,
    targetButton: Container,
    options?: { scale?: number; scalePortrait?: number; tapInterval?: number; offsetX?: number; offsetY?: number; offsetYPortrait?: number; rotation?: number; parentContainer?: Container; zIndex?: number }
): HandTutorialInstance {
    const scale = options?.scale ?? HAND_SCALE;
    const scalePortrait = options?.scalePortrait;
    const tapInterval = options?.tapInterval ?? TAP_INTERVAL;
    const offsetX = options?.offsetX ?? 0;
    const offsetY = options?.offsetY ?? 0;
    const offsetYPortrait = options?.offsetYPortrait;
    const rotation = options?.rotation ?? 0;
    const parentContainer = options?.parentContainer;
    const zIndex = options?.zIndex ?? 999;

    const getCurrentScale = () => {
        const isPortrait = game.resizer.realHeight > game.resizer.realWidth;
        return (isPortrait && scalePortrait != null) ? scalePortrait : scale;
    };

    const container = parentContainer
        ? parentContainer.addChild(new Container())
        : game.ui.add(new Container(), WidgetRoot.CENTER);
    container.sortableChildren = true;
    container.zIndex = zIndex;
    container.eventMode = "none";
    container.interactiveChildren = false;

    const handKey = AssetsDB.texture.hand ?? AssetsDB.texture.cursor2;
    const handTex = Assets.get(handKey);

    const hand = container.addChild(new Sprite({
        texture: handTex,
        anchor: { x: 0.5, y: 0.9 },
        scale,
        rotation,
    }));
    hand.eventMode = "none";

    let tapTween: gsap.core.Tween | null = null;
    let isVisible = false;

    const runTapAnimation = () => {
        if (!isVisible || !container.visible) return;
        const currentScale = getCurrentScale();

        tapTween = gsap.timeline({ repeat: -1, repeatDelay: tapInterval - TAP_DURATION })
            .to(hand.scale, {
                x: currentScale * TAP_SCALE_PRESSED,
                y: currentScale * TAP_SCALE_PRESSED,
                duration: TAP_DURATION / 2,
                ease: "power2.in",
            })
            .to(hand.scale, {
                x: currentScale,
                y: currentScale,
                duration: TAP_DURATION / 2,
                ease: "back.out",
            });
    };

    const stopTapAnimation = () => {
        if (tapTween) {
            tapTween.kill();
            tapTween = null;
        }
        hand.scale.set(getCurrentScale());
    };

    const updatePosition = () => {
        if (!targetButton.parent || !container.parent) return;

        const isPortrait = game.resizer.realHeight > game.resizer.realWidth;
        const currentOffsetY = (isPortrait && offsetYPortrait !== undefined) ? offsetYPortrait : offsetY;
        hand.scale.set(getCurrentScale());

        const bounds = targetButton.getBounds(false);
        const centerX = (bounds.minX + bounds.maxX) / 2 + offsetX;
        const centerY = (bounds.minY + bounds.maxY) / 2 + currentOffsetY;
        const world = { x: centerX, y: centerY };
        const localPos = container.parent.toLocal(world);
        container.position.set(localPos.x, localPos.y);

        if (isVisible && container.visible && tapTween) {
            stopTapAnimation();
            runTapAnimation();
        }
    };

    const resizeAction = () => {
        requestAnimationFrame(() => {
            if (targetButton.parent && container.parent) updatePosition();
        });
    };
    game.resizer.addResizeAction(container.uid, resizeAction);

    const show = () => {
        if (isVisible) return;
        isVisible = true;
        container.visible = true;
        container.alpha = 1;
        updatePosition();
        runTapAnimation();
    };

    const hide = () => {
        if (!isVisible) return;
        isVisible = false;
        stopTapAnimation();
        container.visible = false;
    };

    const destroy = () => {
        stopTapAnimation();
        hide();
        game.resizer.removeResizeAction(container.uid);
        if (parentContainer) {
            parentContainer.removeChild(container);
            container.destroy();
        } else {
            game.ui.remove(container);
        }
    };

    container.visible = false;

    return {
        show,
        hide,
        destroy,
        isVisible: () => isVisible,
    };
}
