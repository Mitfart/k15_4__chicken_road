import * as PIXI from "pixi.js";
import {gsap} from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

// @ts-expect-error API
import Animation = gsap.core.Animation;
import {Container} from "pixi.js";
import EaseString = gsap.EaseString;

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

// =====================================================================================

export function AnimScaleLoop(
    target: Container,
    scale: { from: number, to: number } = { from: 1, to: 1.05 },
    duration: number = 3,
    ease: EaseString = "power1"
): Animation {
    target.scale = scale.from;
    return gsap.to(target, {
        duration: duration / 2,
        ease: ease,
        pixi: { scale: scale.to },
        repeat: -1,
        yoyo: true,
    });
}

// =====================================================================================

export function AnimAlphaLoop(
    target: Container,
    alpha: { from: number, to: number } = { from: .5, to: 1 },
    duration: number = 1,
    ease: EaseString = "power1"
): Animation {
    target.alpha = alpha.from;
    return gsap.to(target, {
        duration: duration / 2,
        ease: ease,
        pixi: { alpha: alpha.to },
        repeat: -1,
        yoyo: true,
    });
}

// =====================================================================================