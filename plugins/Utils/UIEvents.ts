import { Container } from "pixi.js";

// =====================================================================================

export function OnClick(el: Container, onClick: () => void) {
    el.eventMode = 'static';
    el.cursor = 'pointer';
    el.addEventListener("pointerdown", onClick);
}

export function OffClick(el: Container, onClick: () => void) {
    el.eventMode = 'none';
    el.cursor = 'none';
    el.removeEventListener("pointerdown", onClick);
}

// =====================================================================================

export function OnHover(el: Container, onHover: () => void) {
    el.addEventListener("pointerenter", onHover);
}

export function OffHover(el: Container, onHover: () => void) {
    el.removeEventListener("pointerenter", onHover);
}

// =====================================================================================

export function OnUnhover(el: Container, onUnhover: () => void) {
    el.addEventListener("pointerleave", onUnhover);
}

export function OffUnhover(el: Container, onUnhover: () => void) {
    el.addEventListener("pointerleave", onUnhover);
}

// =====================================================================================