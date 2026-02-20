// =====================================================================================

export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
export function randomInt(min: number, max: number): number {
    return Math.floor(random(min, max));
}

export function randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// =====================================================================================

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function clamp(v: number, a: number, b: number) {
    return Math.min(Math.max(v, a), b);
}

// =====================================================================================

export function isNumber(val: any): boolean {
    return typeof val === "number";
}

export function isString(val: any): boolean {
    return typeof val === "string";
}

// =====================================================================================

export function delay(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration * 1000) );
}

// =====================================================================================

/* eslint-disable */
export function debounceFunc(func: (...args: any) => void, ...args: any) {
    const delay = 100;
    let timeoutId: number;
    return () => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            func(args);
        }, delay);
    };
}

// =====================================================================================

export function fillTemplate(template: string, jsonData: any) {
    return Object.keys(jsonData).reduce((result, key) => {
        const placeholder = new RegExp(`{${key}}`, 'g');
        return result.replace(placeholder, jsonData[key]);
    }, template);
}

// =====================================================================================
