const title = "Alley Cat Noir";
const version = "v0.13.dev";
document.title = `${title} ${version}`;

// const BG = "#26202a";
// const BGA = "#26202a88";
const VOID = "#0000";
const BG = "#100e23";
const BGB = "#0f0d1cff";
const BGA = "#100e2388";
const BGAP = "#100e23c0";
const RED = "#533"; // 533
const ORANGE = "#432"
const GRAY = "#423e44";
const BROWN = "#332";
const YELLOW = "#442";
const GREEN = "#353";
const PUKE = "#240";
const BLUE = "#335";
const PURPLE = "#424";
const FG = "#eef";
const FGA = "#eefa";

const GAME_SCALE = 64; // size of game coordinates to pixels
const BLOCK_CELLS = 10;
const BLOCK_SIZE = GAME_SCALE * BLOCK_CELLS;

const BPM = 160;
const BEAT = 60000 / BPM;
const TEMPO = BEAT / 2;
const SPB = BEAT / 1000;
const EIGHTH = BEAT / 2;
const SIXTEENTH = BEAT / 4;
const BEAT_SIGNATURE = 24;

const MAX_SEED = 0x7fffffff;

// Math

const {
    min,
    max,
    sqrt,
    floor,
    ceil,
    round,
    cos,
    sin,
    hypot,
    tan,
    atan,
    atan2,
    asin,
    abs,
    sign,
    imul,
    pow,
    random,
    PI,
    SQRT2,
    SQRT1_2,
} = Math;
const PIZZA = PI * 2;
const PIZZA_4 = PI / 2;
const PIZZA_3 = PIZZA / 3;
const normalizeRadians = x => x > PI ? x - PIZZA : x;


const vector = (x = 0, y = 0) => ({ x, y });

const scaleVector = (v, m = 1) => vector(v.x * m, v.y * m);
const rotateVector = (v, r = 0) => vector(v.x * cos(r) - v.y * sin(r), v.x * sin(r) + v.y * cos(r));
const measureVector = (v) => hypot(v.x, v.y);
const vectorRadians = (v) => normalizeRadians(atan2(v.y, v.x));
const normalizeVector = (v = vector(1, 0)) => scaleVector(v, 1 / measureVector(v));

const addVectors = (a = vector(), b = vector()) => vector(a.x + b.x, a.y + b.y);
const subtractVectors = (a = vector(), b = vector()) => vector(a.x - b.x, a.y - b.y);
const distanceBetween = (a = vector, b = vector()) => measureVector(subtractVectors(a, b));
const radiansToVector = (r = 0) => vector(cos(r), sin(r));

// Find the intersection of line segment AB and line segment CD
const intersection = (line1A, line1B, line2C, line2D) => {
    const BA = subtractVectors(line1B, line1A);
    const DC = subtractVectors(line2D, line2C);
    const dX = line1B.x - line1A.x;
    const dY = line1B.y - line1A.y;
    const determinant = BA.x * DC.y - DC.x * BA.y;
    // parallel lines
    if (determinant === 0) {
        return;
    }
    const lambda = ((line2D.y - line2C.y) * (line2D.x - line1A.x) + (line2C.x - line2D.x) * (line2D.y - line1A.y)) / determinant;
    const gamma = ((line1A.y - line1B.y) * (line2D.x - line1A.x) + dX * (line2D.y - line1A.y)) / determinant;
    // no intersection
    if (!(0 <= lambda && lambda <= 1) || !(0 <= gamma && gamma <= 1)) {
        return;
    }
    return vector(line1A.x + lambda * dX, line1A.y + lambda * dY);
};


const stamp = () => Date.now();
const stripe = (l = 0, fn = x => x) => new Array(l).fill(0).map((x, i) => i).map(fn);

const zceil = x => x < 0 ? floor(x) : ceil(x);
const zfloor = x => x > 0 ? floor(x) : ceil(x);
const lerp = (a, b, t = 0) => a + t * (b - a);
const easeInBezier = t => t * t * (2.70158 * t - 1.70158);
const easeInSin = t => 1 - cos(t * PIZZA_4);
const easeInOutExpo = t => t === 0
  ? 0
  : t === 1
        ? 1
        : t < 0.5
            ? 2**(20 * t - 10) / 2
            : (2 - 2**(-20 * t + 10)) / 2;
const easeInOutSin = t => -(cos(PI * t) - 1) / 2;
const easeOutBack = t => 1 + 2.70158 * ((t - 1) ** 3) + 1.70158 * ((t - 1) ** 2);
const easeOutElastic = t => t === 0
    ? 0
    : (t === 1
        ? 1
        : pow(2, -10 * 2) * sin((t * 10 - 0.75) * PIZZA_3) + 1
    );
window.easeFunctions = {
    easeInBezier,
    easeInSin,
    easeInOutExpo,
    easeInOutSin,
    easeOutBack,
    easeOutElastic,
};

const rotate = ([x, y], a) => [x * cos(a) - y * sin(a), x * sin(a) + y * cos(a)];
const lerpAngle = (x, y, t) => {
    const a = (x + PIZZA) % PIZZA;
    const b = (y + PIZZA) % PIZZA;
    let diff = (b - a + PIZZA) % PIZZA;
    if (diff > PI) { diff -= PIZZA; }
    return (a + (diff * t) + PIZZA) % PIZZA;
};
const lerpVector = (a, b, t) => vector(lerp(a.x, b.x, t), lerp(a.y, b.y, t));

const squirrel = (seed = 0, x = 0, y = 0) => {
    let noise = seed % MAX_SEED;
    noise *= 0xb5297a4d;
    noise += (x * 49632) ^ (y * 325176);
    noise ^= (noise >> 8);
    noise += 0x68e31da4;
    noise ^= (noise << 8);
    noise *= 0x1b56c4e9;
    noise ^= (noise >> 8);
    return noise;
};
const squirrelFloat = (...x) => squirrel(...x) / MAX_SEED;
const squirrelByte = (...x) => squirrel(...x) & 0xff;
const squirrelBias = (...x) => squirrelFloat(...x) * 2 - 1;
const squirrelBit = (...x) => squirrel(...x) & 1;
const squirrelDir = (...x) => squirrelBit(...x) * 2 - 1;
const squirrelChoice = (seed, x, y, l = 10) => squirrelFloat(seed, x, y) * l | 0;
const squirrelVector = (...x) => rotateVector(vector(0, 1), squirrelBias(...x) * PI);
const squirrelPick = (seed, x, y, arr) => arr.at(squirrelChoice(seed, x, y, arr.length));
const squirrelRotation = (...x) => squirrelBias(...x) * PI;
const squirrelShuffle = (seed, x, y, a = []) => {
    let s = seed;
    return a.slice().sort(() => {
        s = squirrel(s, x, y);
        return s / MAX_SEED * 2 - 1;
    });
}

const smoothstep = x => 6*x**5 - 15*x**4 + 10*x**3
const smoothlerp = (a, b, t) => lerp(a, b, smoothstep(x));

// Utilities
const listen = (obj, ev, fn, ...x) => obj.addEventListener(ev, fn, ...x);
const once = (obj, ev, fn, ...x) => {
    const r = (...y) => {
        obj.removeEventListener(ev, r, ...x);
        fn(...y);
    };
    obj.addEventListener(ev, r, ...x);
};
const each = (x, f) => x.forEach(f);

// Textures and Rendering Tools ================================
const texture = (w = 64, h = 64, cvs) => {
    const screen = cvs ?? new OffscreenCanvas(w, h);
    const ctx = screen.getContext("2d");
    const s = {
        screen,
        ctx,
        w,
        h,
        w2: w / 2,
        h2: h / 2,
        do(fn) {
            s.save();
            fn(s);
            s.restore();
            return s;
        },
        clear() {
            ctx.clearRect(0, 0, w, h);
            return s;
        },
        center() {
            ctx.translate(s.w2, s.h2);
            return s;
        },
    };
    each([
        "save",
        "restore",
        "translate",
        "rotate",
        "drawImage",
        "putImageData",
        "beginPath",
        "closePath",
        "moveTo",
        "lineTo",
        "bezierCurveTo",
        "arc",
        "ellipse",
        "fill",
        "fillRect",
        "fillText",
        "stroke",
        "strokeText",
        "strokeRect",
        "clearRect",
    ], k => s[k] = (...x) => {
        ctx[k](...x);
        return s;
    });
    each([
        "font",
        "filter",
        "fillStyle",
        "lineWidth",
        "lineCap",
        "strokeStyle",
        "globalCompositeOperation",
        "globalAlpha",
        "imageSmoothingEnabled",
        "shadowColor",
        "shadowBlur",
        "shadowOffsetX",
        "shadowOffsetY",
    ], k => s[k] = (x) => {
        ctx[k] = x;
        return s;
    });
    return s;
};
const noiseTexture = (seed = stamp(), w = 64, h = 64) => {
    const offscreen = texture(w, h);
    const imageData = offscreen.ctx.createImageData(w, h);
    const { data } = imageData;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const v = squirrelByte(seed, x, y);
            const i = (x + y * w) * 4;
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = v;
        }
    }
    return offscreen.putImageData(imageData, 0, 0);
};

const scribbleTexture = (seed = stamp(), w = 128, h = 128, t = 2) => {
    const tex = texture(w, h);
    const b = Math.sqrt(w**2 + h**2);
    const b2 = b / 2;
    const wbuff = tex.w2 - 2 * t;
    const stepY = t * 0.9;
    let dir = squirrelDir(seed, w, h);
    let y = (tex.h2 - b2) + squirrelFloat(seed, w + t, h - t) * t;
    let x = tex.w2 + (dir * wbuff + squirrelBias(seed, 0, y) * t);
    tex
        .strokeStyle("#fff")
        .lineWidth(t)
        .save()
        .translate(tex.w2, tex.h2)
        .rotate(squirrelBias(seed, w + x, h + y) * PI)
        .translate(-tex.w2, -tex.h2)
        .beginPath()
        .moveTo(x, y);
    while (y < b) {
        dir = dir * -1;
        x = tex.w2 + (dir * b2 + squirrelBias(seed, x, y) * t);
        y += stepY + squirrelBias(seed, x, y);
        tex.lineTo(x, y);
    }
    return tex
        .stroke()
        .restore();
};

const sketchify = (tex, seed = 0) => texture(tex.w, tex.h)
    .drawImage(noiseTexture(seed, tex.w, tex.h).screen, 0, 0)
    .globalCompositeOperation("source-in")
    .drawImage(tex.screen, 0, 0)
    .globalCompositeOperation("source-over");

const doodle = (tex, seed = 0, t = 2, sketch = true) => {
    const out = texture(tex.w, tex.h)
        .drawImage(scribbleTexture(seed, tex.w, tex.h, t).screen, 0, 0);
    if (sketch) {
        tex
            .globalCompositeOperation("destination-in")
            .drawImage(noiseTexture(seed, tex.w, tex.h).screen, 0, 0);
    }
    return out
        .globalCompositeOperation("source-in")
        .drawImage(tex.screen, 0, 0)
        .globalCompositeOperation("source-over");
};

const renderSmoothPolygon = (tex, points = [], radius, color = BG) => tex.do(s => {
    const len = points.length;
    s.fillStyle(color).beginPath()
    each(points, (b, i) => {
        const [A] = points.at(i - 1);
        const [B] = b;
        const [C] = points.at((i + 1) % len);
        const BA = subtractVectors(A, B);
        const balen = measureVector(BA);
        const nba = normalizeVector(BA);
        const BC = subtractVectors(C, B);
        const bclen = measureVector(BC);
        const nbc = normalizeVector(BC);
        const sinA = nba.x * nbc.y - nba.y * nbc.x;
        const sinA90 = nba.x * nbc.x - nba.y * nbc.y;
        let angle = asin(max(-1, min(1, sinA)));
        let radDirection = 1;
        let drawDirection = false;
        if (sinA90 < 0) {
            if (angle < 0) {
                angle = PI + angle;
            } else {
                angle = PI - angle;
                radDirection = -1;
                drawDirection = true;
            }
        } else {
            if (angle > 0) {
                radDirection = -1;
                drawDirection = true;
            } else {
                angle = PIZZA + angle;
            }
        }
        const halfAngle = angle / 2;
        let lenOut = abs((cos(halfAngle) * radius) / sin(halfAngle));
        let cradius = radius;
        const maxlenout = min(balen / 2, bclen / 2);
        if (lenOut > maxlenout) {
            lenOut = maxlenout;
            cradius = abs((lenOut * sin(halfAngle)) / cos(halfAngle));
        }
        let final = addVectors(
            addVectors(B, scaleVector(nbc, lenOut)),
            scaleVector(vector(-nbc.x, nbc.y), cradius * radDirection)
        );
        s.arc(final.x, final.y, cradius, vectorRadians(nba) + PIZZA_4 * radDirection, vectorRadians(nbc) - PIZZA_4 * radDirection, drawDirection);
    });
    s.closePath().fill();
});

const scribbleLoop = (seed = stamp(), w = GAME_SCALE, h = GAME_SCALE, tex, radius = 10, count, minradius) => {
    const w4 = w / 4;
    const h4 = h / 4;
    const mr = minradius ?? min(w, h) / 2;
    // const len = (w + h) / 8 | 0;
    const len = count || squirrelChoice(seed, w4, h4, 7) + 10;
    const slice = PIZZA / len;
    return (tex ?? texture(w, h)).do(s => {
        // s.fillStyle(BG).center().beginPath();
        const points = stripe(len, (i) => (i + squirrelBias(seed, i, 1) / 5) * slice - PI)
            .sort((a, b) => a - b)
            .map((rads, i) => [
                scaleVector(
                    vector(cos(rads), sin(rads)),
                    (1 - squirrelFloat(seed, w + i, -h + i * 7) / 3) * mr
                ),
                rads
            ]);
        s.center();
        renderSmoothPolygon(s, points, radius, BG);
    });
};

const sprites = new WeakMap();
const textureSprite = (obj, w, h, color, t, withNoise = true) => ({
    w,
    h,
    w2: w / 2,
    h2: h / 2,
    bg: texture(w, h),
    scribble: scribbleTexture(obj.seed, w, h, t).fillStyle(color).do(s => s.globalCompositeOperation("source-in").fillRect(0, 0, w, h)),
    noise: withNoise ? noiseTexture(obj.seed, w, h) : texture(w, h).fillRect(0, 0, w, h),
    final: texture(w, h),
    color,
});
const hasSprite = obj => sprites.has(obj);
const getSprite = (obj, w, h, color = FG, t = 2, withNoise = true) => {
    let sprite = sprites.get(obj);
    if (!sprite) {
        sprite = textureSprite(obj, w, h, color, t, withNoise);
        sprites.set(obj, sprite);
    }
    return sprite;
};
const clearSprite = obj => sprites.delete(obj);
const compositeSprite = (sprite, cleanup = false) => {
    sprite.final.do(s => s.clear()
        .drawImage(sprite.noise.screen, 0, 0)
        .globalCompositeOperation("source-in")
        .drawImage(sprite.scribble.screen, 0, 0)
        .globalCompositeOperation("destination-in")
        .drawImage(sprite.bg.screen, 0, 0)
        .globalCompositeOperation("destination-over") // fill in bg behind
        .drawImage(sprite.bg.screen, 0, 0)
    );
    if (cleanup) {
        sprite.bg = null;
        sprite.scribble = null;
        sprite.noise = null;
    }
};

// Game Definitions ============================================

const entity = (seed = stamp(), x = 0, y = 0, rot = 0) => ({
    seed,
    position: vector(x, y),
    velocity: vector(),
    rot,
    home: null,
    speed: 2,
});

const entityGroups = () => ({
    dumpsters: [],
    lights: [],
    puddles: [],
    splatters: [],
    papers: [],
    bags: [],
    boxes: [],
    doors: [],
    curtains: [],
    sewers: [],
});

const action = (kind = "idle", from = vector(), to = vector(), dur = BEAT / 2, diff = subtractVectors(to, from)) => ({
    kind,
    dur,
    from,
    to,
    // We draw things orientied toward the -y as "forwad", so we have to subtract PI/2
    rot: normalizeRadians(-vectorRadians(diff) - PIZZA_4),
    length: measureVector(diff),
    elapsed: 0,
});

let default_zoom = 1;
const camera = (seed, x, y, r) => ({
    ...entity(seed, x, y, r),
    coa: vector(),
    // zoom: 1,
    zoom: min(window.innerWidth, window.innerHeight, BLOCK_SIZE * 1.5) / BLOCK_SIZE / 1.5,
    follow: true,
});

const light = (seed, x, y, r) => ({
    ...entity(seed, x, y, r),
    // we'll use some variants on the location to get different values
    offset: squirrelBias(seed, x + 1, y - 7),
    radius: 4 + squirrelBias(seed, x, y),
    brightness: 0.5 + squirrelFloat(seed, y + 4, x - 1) * 0.5,
});

const puddle = (seed, x, y, r, d = 2) => ({
    ...entity(seed, x, y, r),
    diameter: d,
});

const splatter = (seed, x, y, r, d = 1, c = RED) => ({
    ...entity(seed, x, y, r),
    diameter: d,
    color: c,
});

const paper = (seed, x, y, r, d = 2, c = BROWN) => ({
    ...entity(seed, x, y, r),
    diameter: d,
    color: c,
});


const curtain = (seed, x, y, r) => ({
    ...light(seed, x, y, r),
});

const dumpster = (seed, x, y, r) => ({
    ...entity(seed, x, y, r),
    contents: [],
});

const cat = (seed = stamp()) => ({
    ...entity(seed),
    home: dumpster(seed),
    speed: 4, reach: 2,
    lives: 9, kills: 0,
    streak: 0, maxStreak: 0,
    distance: 0,
    score: 0,  multiplier: 1,
    dead: false,
    action: null,
    path: [],
    mouth: [],
    // easeFunction: easeOutBack,
    easeFunction: easeInOutExpo,
});

const sewer = (seed, x, y, r) => ({
    ...entity(seed, x, y, r),
    open: squirrelBit(seed, x, y),
});

const bag = (seed, x, y, r, d = 1.5) => ({
    ...entity(seed, x, y, r),
    contents: [],
    diameter: d,
});

const box = (seed, x, y, r) => ({
    ...entity(seed, x, y, r),
    top: squirrelBit(seed, x, y + 1),
    bottom: squirrelBit(seed, x, y - 1),
});

const rat = (seed, x, y, r) => ({
    ...entity(seed, x, y, r),
});

const dog = (s, x, y, r) => ({
    ...entity(s, x, y, r),
    home: box(s, x, y, r),
});

const door = (s, x, y, r) => ({
    ...entity(s, x, y, r),
    pickups: [],
    open: 0,
});

const human = (s, x, y, r) => ({
    ...entity(s, x, y, r),
    home: door(s, x, y),
});

// const neighborhood = stripe(BLOCK_CELLS, (x) => stripe(BLOCK_CELLS, y => vector(x - BLOCK_CELLS / 2, y - BLOCK_CELLS / 2))).filter(v => (v.x + v.y) % 2 === 0);
const neighborhood = stripe(
    BLOCK_CELLS - 1,
    (x) => stripe(
        BLOCK_CELLS - 1,
        y => vector(x - (BLOCK_CELLS - 2) / 2, y - (BLOCK_CELLS - 2) / 2)
    )
).flat().filter(v => (v.x + v.y) % 2 === 0);
const corners = [
    [-5, -5],
    [5,5],
    [-5,5],
    [5,-5],
].map(x => vector(...x));
const walls = texture(21, 21).do(s => {
    s.center()
        .fillStyle("#000")
        .fillRect(-9.5, -9.5, 9, 9)
        .fillRect(-9.5, 0.5, 9, 9)
        .fillRect(0.5, -9.5, 9, 9)
        .fillRect(0.5, 0.5, 9, 9);
});

const block = (seed, x, y, address) => {
    const h = !!(address.x % 10);
    const v = !!(address.y % 10);
    const xt = (address.x % 10 + 10) % 10;
    const yt = (address.y % 10 + 10) % 10;
    const t = h ? xt : (v ? yt : 0);
    const generated = {
        seed,
        position: vector(x, y),
        address,
        horizontal: h,
        vertical: v,
        type: t,
        ...entityGroups(),
    };
    let clutter = 2;
    if (t === 0) {
        clutter += 3;
        // Intersection
        // If it's the 
        // generated.dumpster = x === 0 && y === 0
        //     ? current.player.home
        //     : (
        //         squirrelBit(seed, x, y)
        //             ? dumpster(seed, x + squirrelBias(seed + 1, x, y), y, squirrelRotation(seed, x + 23, y - 8))
        //             : null
        //     );
        if (x === 0 && y === 0) {
            generated.dumpsters.push(current.player.home);
        } else if (squirrelBit(seed, x, y)) {
            generated.dumpsters.push(dumpster(seed, x + squirrelBias(seed + 1, x, y), y, squirrelRotation(seed, x + 23, y - 8)));
        }
        // Corner lights
        squirrelShuffle(seed - 13, x - 5, y + 5, corners)
            .slice(4 - squirrelChoice(seed, 5, 5, 4))
            .forEach((l, i) => {
                const obj = light(seed + i, l.x + x, l.y + y);
                generated.lights.push(obj);
            });
    } else if (t === 2 || t === 5 || t === 8) {
        // Lights
        //     (doors and boxes)
        clutter += 2;
        const dir = squirrelDir(seed - 7, x, y);
        const where = addVectors(
            generated.position,
            scaleVector(
                h ? vector(0, -5) : vector(-5, 0),
                dir
            )
        );
        const obj = light(seed + 13, where.x, where.y);
        obj.radius += 2;
        generated.lights.push(obj);
    } else {
        clutter += 5;
        // Secondary blocks (curtains, boxes)
        // possible sewer
    }
    // clutter = stripe(clutter, i => addVectors(
    //     scaleVector(
    //         squirrelVector(seed, x + i, y * i - x),
    //         squirrelFloat(seed, x - i * i, y + i + x) * BLOCK_CELLS / 2
    //     ),
    //     generated.position
    // ));
    clutter = squirrelShuffle(seed, x, y, neighborhood)
        .slice(0, clutter)
        .map(p => addVectors(
            scaleVector(squirrelVector(seed, p.x + 7367, p.y - 87863), 0.5),
            addVectors(p, generated.position),
        ));
    // puddles
    stripe(squirrelChoice(seed, x / 3 + 23, y * 6 - 2, min(3, clutter.length)), i => {
        const p = clutter.shift();
        generated.puddles.push(puddle(
            squirrel(seed, p.x, p.y),
            p.x, p.y,
            squirrelRotation(seed, p.x / 7, p.y * 1.3),
            2 + squirrelFloat(seed, p.y / 2, p.x * 3) * 2
        ));
    });
    // splatters
    stripe(squirrelChoice(seed, x / 3 + 23, y * 6 - 2, min(2, clutter.length)), i => {
        const p = clutter.shift();
        const s = squirrel(seed, p.x, p.y)
        generated.splatters.push(splatter(
            s,
            p.x, p.y,
            squirrelRotation(seed, p.x / 7, p.y * 1.3),
            1 + squirrelFloat(seed, p.y / 2, p.x * 3) * 2,
            squirrelPick(s, p.x, p.y, [FGA, RED, PUKE, BLUE, YELLOW])
        ));
    });
    // papers
    stripe(clutter.length, i => {
        const p = clutter.shift();
        const s = squirrel(seed, p.x, p.y);
        generated.papers.push(paper(
            s,
            p.x, p.y,
            squirrelRotation(seed, p.x / 7, p.y * 1.3),
            1 + squirrelFloat(seed, p.y / 2, p.x * 3) * 1.5,
            squirrelPick(s, p.x, p.y, [BROWN, PURPLE, GRAY, ORANGE])
        ));
    });
    // // bags
    // stripe(clutter.length, i => {
    //     const p = clutter.shift();
    //     generated.bags.push(bag(
    //         squirrel(seed, p.x, p.y),
    //         p.x, p.y,
    //         squirrelRotation(seed, p.x / 7, p.y * 1.3),
    //         1.5 + squirrelFloat(seed, p.y / 2, p.x * 3) * 1.5
    //     ));
    // });
    return generated;
};

const game = (seed = stamp() % MAX_SEED) => ({
    seed,
    totaltime: 0,
    now: 0,
    frame: 0,
    gametime: 0,
    paused: true,
    camera: camera(seed),
    player: cat(seed),
    numbers: [squirrel(seed, 13) * squirrelDir(seed, 13, 1), squirrel(seed, 42) * squirrelDir(seed, 42, 1)],
    blocks: {},
    rats: [],
    dogs: [],
    humans: [],
    activeBlocks: [],
    activeGroups: entityGroups(),
});

// Generated Assets ============================================

const logo = doodle(
    texture(360, 360)
        // .fillStyle(BG).fillRect(0, 0, 360, 360)
        .fillStyle("#fff")
        .font("bold 72px sans-serif")
        .do(s => {
            each(title.split(" "), (t, i) => {
                const x = (s.w - s.ctx.measureText(t).width) / 2;
                s.do(ss => ss.fillText(t, x, 60 + i * 72)
                    .filter("blur(10px)")
                    .fillStyle("#fff8")
                    .fillText(t, x - 8, 68 + i * 72)
                );
            });
            s.font("32px monospace");
            const x = max(0, (s.w - s.ctx.measureText(version).width) / 2);
            s.fillText(version, x, 260);
        }),
    1313
);
let debug = false;
const debugSprite = (sprite) => {
    if (!debug) {
        return;
    }
    const r = min(sprite.w, sprite.h);
    const r2 = r * 0.375;
    sprite.final.do(s => s
        .center()
        .lineWidth(2)
        .strokeStyle(FGA)
        .arc(0, 0, r2, 0, PIZZA)
        .stroke()
        .lineWidth(1)
        .strokeStyle(GREEN)
        .arc(0, 0, r / 2 -1, 0, PIZZA)
        .stroke()
    );
};

const renderPuddle = (obj, d = 256, c = BLUE, t = 1) => {
    const sprite = getSprite(obj, d, d, c, t);
    sprite.bg.do(s => {
        s.center().fillStyle(BGAP).beginPath();
        stripe(squirrelChoice(obj.seed, obj.position.x, obj.position.y, 11) + 10, i => scaleVector(squirrelVector(obj.seed, obj.position.x - i * 3, obj.position.y + i * 17), d / 2 - 8))
            .map(p => scaleVector(p, squirrelFloat(obj.seed, p.x, p.y)))
            .forEach(p => {
                const r = min(d / 4, max(5, d / 2.2 - measureVector(p)))
                const r2 = r / 2;
                s.moveTo(p.x, p.y).ellipse(
                    p.x,
                    p.y,
                    r2 + r2 * squirrelFloat(obj.seed, p.x, p.y),
                    r,
                    -vectorRadians(p),
                    0,
                    PIZZA
                );
            });
        s.fill();
    });
    compositeSprite(sprite, true);
    debugSprite(sprite);
    return sprite;
};

const renderSplatter = (obj, d = 256, c = RED, t = 3) => {
    const sprite = getSprite(obj, d, d, c, t);
    const len = squirrelChoice(obj.seed, obj.position.x, obj.position.y, 11) + 10;
    const rad = d / 4;
    const slice = PIZZA / len;
    sprite.bg.do(s => {
        s.center().rotate(obj.rot).fillStyle(BG).beginPath();
        const points = stripe(
            len,
            i => scaleVector(
                radiansToVector(i * slice),
                rad * (2.2 + squirrelBias(obj.seed, obj.position.x + i, slice - i) * 0.25)
            )
        )
            .map(p => {
                const long = rad + measureVector(p) / 5;
                const wide = rad / 1.5 - measureVector(p) / 11;
                const rot = squirrelBias(obj.seed, p.x, p.y) / 8
                s.moveTo(p.x, p.y).ellipse(
                    p.x,
                    p.y,
                    long,
                    wide,
                    rot + vectorRadians(p),
                    0,
                    PIZZA
                );
                return [p, wide, rot, long];
            });
        const c1 = scaleVector(squirrelVector(obj.seed, obj.position.x, obj.position.y), 4);
        const c2 = scaleVector(squirrelVector(obj.seed, obj.position.x, obj.position.y), 4);
        const g = s.ctx.createRadialGradient(
            c1.x, c1.y, 1,
            c2.x, c2.y, d / 2.25
        );
        g.addColorStop(0, BG);
        g.addColorStop(0.3, BG);
        g.addColorStop(0.86, BGA);
        g.addColorStop(0.9, VOID);
        s
            .fill()
            .globalCompositeOperation("source-out")
            .fillStyle(g)
            .beginPath()
            .moveTo(0, 0)
            .arc(0, 0, rad * 1.76, 0, PIZZA)
            .fill()
            .globalCompositeOperation("source-over")
            .fillStyle(BG)
            .beginPath()
            .moveTo(0, 0)
        each(points, (p, i) => {
            const prev = points.at(i - 1);
            let dest = scaleVector(addVectors(p[0], prev[0]), 0.5);
            dest = scaleVector(dest, 1 - squirrelFloat(obj.seed, dest.x, dest.y) * 0.65);
            const cent = scaleVector(squirrelVector(obj.seed, dest.x, dest.y), 4);
            s.lineTo(dest.x, dest.y)
                .arc(dest.x, dest.y, 3 + squirrelBias(obj.seed, cent.x, cent.y), 0, PIZZA)
                .lineTo(dest.x, dest.y)
                .lineTo(cent.x, cent.y);
        })
        s.fill();
    });
    compositeSprite(sprite, true);
    debugSprite(sprite);
    return sprite;

};
// const headlines = ["NEWS", "EXTRA! EXTRA!", "COMING SOON", "BLAH BLAH"]
const renderHeadline = (text, font = "sans-serif") => texture(256, 256)
        .do(s => {
            // s.center();
            let y = 0; // Initial vertical offset
            s.strokeStyle(BG).fillStyle(FG).globalAlpha(0.25);
            each(text.split("\n"), t => {
                s.font(`10px bold ${font}`);
                let x = 256 / s.ctx.measureText(t).width;
                const fs = min(x * 10 | 0, 96);
                s.font(`${fs}px bold ${font}`)
                const m = s.ctx.measureText(t);
                x = (256 - m.width) / 2;
                // y += fs; // Add the height of the character
                y += m.actualBoundingBoxAscent * 1.2;
                s.strokeText(t, x, y).fillText(t, x, y);
            });
        });
const headlines = [
    "MORNING\nNEWS\n🌇",
    "SALE!\n💵",
    "ALBUM\nRELEASE\n🎸",
    "LIVE\nMUSIC\nTONIGHT",
    "EXTRA!\nEXTRA!\n‼️",
    "SHOW\n9pm-1am\n🎭",
    "BEWARE\nOF\nDOG",
    "BEWARE\nOF\n🐶",
    "WANTED\n🐈‍⬛",
    "ALLEY\nCAT NOIR",
    "js13k\ngames\n2025",
    "MISSING\n🐱",
    "LOST\n🐕",
].map(text => [
    "serif",
    "sans-serif",
].map(font => renderHeadline(text, font)
))
.flat();
const renderPaper = (obj, d = 256, c = GRAY, t = 4) => {
    const sprite = getSprite(obj, d, d, c, t);
    const dh = d / SQRT2;
    const dw = dh * (1 - squirrelFloat(obj.seed, obj.position.x, obj.position.y) * 0.3);
    sprite.bg.do(s => {
        s.center()
            .rotate(obj.rot)
            .fillStyle(BG)
            .lineWidth(2)
            .fillRect(-dw / 2, -dh / 2, dw, dh);
    });
    sprite.scribble.do(s => {
        const headline = squirrelPick(obj.seed, obj.position.x, obj.position.y, headlines);
        const f = dw / 256;
        s
            .center()
            .rotate(obj.rot)
            .drawImage(headline.screen,
                0, 0,
                256, 256,
                -dw / 2, -dh / 2,
                dw, dh
            )
            // .drawImage();
    });
    compositeSprite(sprite, true);
    debugSprite(sprite);
    return sprite;
};


const renderBag = (obj, d = GAME_SCALE, c = GRAY, t = 3) => {
    const sprite = getSprite(obj, d, d, c, t);
    scribbleLoop(obj.seed, d, d, sprite.bg);
    // Now let's ensure there is at least a center circle
    sprite.shadow = FGA;
    const rot = squirrelBias(obj.seed, obj.position.x, d - t) * PI
    sprite.bg.do(s => s
        .fillStyle(BG)
        .center()
        .beginPath()
        .moveTo(0, 0)
        .ellipse(
            0, 0,
            d / (2.5 + squirrelFloat(obj.seed, obj.position.y, d + t) / 5),
            d / (2.5),
            rot,
            0,
            PIZZA
        )
        .fill()
    );
    const r = d / 8;
    const d2 = d / 4;
    // const wrap = texture(d2, d2)
    const wrap = scribbleLoop(obj.seed + d2, d2, d2)
        // .drawImage(sprite.bg.screen, 0, 0, d2, d2)
        .globalCompositeOperation("source-in")
        .fillStyle(sprite.color)
        .fillRect(0, 0, d2, d2);
    sprite.scribble.do(s => s
        .center()
        .rotate(-rot)
        .shadowColor(BG)
        .shadowBlur(3)
        .shadowOffsetX(0)
        .shadowOffsetY(0)
        // draw strings
        .lineWidth(3)
        .strokeStyle(BG)
        .beginPath()
        .moveTo(0, 0)
        .bezierCurveTo(d2 + 12, -r - 10, d2 + 10, r - 10, 0, 0)
        .bezierCurveTo(d2 + 10, -r + 10, d2 + 8, r + 10, 0, 0)
        .stroke()
        .strokeStyle(RED)
        .beginPath()
        .moveTo(0, 0)
        .bezierCurveTo(d2 + 12, -r - 10, d2 + 10, r - 10, 0, 0)
        .bezierCurveTo(d2 + 10, -r + 10, d2 + 8, r + 10, 0, 0)
        .stroke()
        // top plastic
        .shadowBlur(1)
        .globalCompositeOperation("destination-out")
        .drawImage(wrap.screen, -r - 2, -r - 2, d2 + 4, d2 + 4)
        .shadowBlur(0)
        // hole in center
        .globalCompositeOperation("source-over")
        .drawImage(wrap.screen, -r, -r, d2, d2)
    );
    sprite.noise.do(s => s
        .center()
        .rotate(-rot)
        .globalCompositeOperation("source-over")
        .globalAlpha(0.5)
        .lineWidth(3)
        .beginPath()
        .moveTo(0, 0)
        .bezierCurveTo(d2 + 12, -r - 10, d2 + 10, r - 10, 0, 0)
        .bezierCurveTo(d2 + 10, -r + 10, d2 + 8, r + 10, 0, 0)
        .stroke()
        .drawImage(wrap.screen, -r, -r, d2, d2)
        .globalCompositeOperation("destination-out")
        .globalAlpha(1)
        .drawImage(wrap.screen, -10, -10, 20, 20)
    );
    compositeSprite(sprite, true);
    return sprite;
};

const renderBlock = (obj, d = BLOCK_SIZE, c = BGB, t = 16) => {
    // const sprite = getSprite(obj, d, d, c, t, false);
    // Special sprite for this one
    const sprite = {
        w: d,
        h: d,
        w2: d / 2,
        h2: d / 2,
        color: c,
        final: texture(d, d),
    };
    sprites.set(obj, sprite);

    const cells = d / GAME_SCALE / 2 | 0;
    const cellSize = d / cells;
    sprite.final.do(s => {
        s
            .filter("blur(4px)")
            .translate(cellSize / 2, cellSize / 2)
            .fillStyle(c)
            .beginPath();
        stripe(cells, x => stripe(cells, (y) => {
            const f = sin(x / (cells - 1) * PI) * sin(y / (cells - 1) * PI);
            // const f = 0;
            const len = 4 + squirrelChoice(obj.seed, x + y, y * x + 7, 6);
            const slice = PIZZA / len;
            // s.fillStyle(BG).beginPath();
            stripe(len, (i) => (
                i + squirrelFloat(obj.seed, y + 2, x - 8) * PIZZA
                + squirrelFloat(obj.seed, x + x * y + i + len, y + x - len * i) / 5
            ) * slice)
                .map((rads, i) => scaleVector(
                    addVectors(
                        // addVectors(
                            vector(x, y),
                        //     scaleVector(squirrelVector(obj.seed, i * 5 - x / 3, i - y * 3), f / 4)
                        // ),
                        scaleVector(
                            radiansToVector(rads),
                            // 0.47 + (f / 4)
                            0.47 + (squirrelFloat(obj.seed, rads * f - y * x, 4 * y + x) * f / 3)
                        )
                    ),
                    cellSize
                )).forEach((p, i, points) => {
                    if (i === 0) {
                        const l = points.at(-1);
                        s.moveTo(l.x, l.y);
                    }
                    s.lineTo(p.x, p.y);
                });
            // s.fill();
        }));
        s
            .fill()
            .translate(-cellSize / 2, -cellSize / 2);
        s
            // .filter("none")
            // .imageSmoothingEnabled(false)
            .globalCompositeOperation("destination-in") // WHEN c = BG
            // .globalAlpha(0.5) // WHEN c = BG
            .globalCompositeOperation("destination-out")
            .globalAlpha(0.65) // WHEN c = BG
            .drawImage(noiseTexture(obj.seed, cells, cells).screen, 0, 0, d, d);
    });
    // compositeSprite(sprite, true);
    return sprite;
};

// When we go to draw lights on top of the rest of the image,
// we probably want to use "overlay", "lighter", and maybe "lighten".
// Others are likely not the best option, but can be played with.
const renderLight = (obj, d = obj.radius * 2, c = "#fff8", t = 5) => {
    const sprite = getSprite(obj, d, d, c, t, false);
    // const sprite = {
    //     w: d,
    //     h: d,
    //     w2: d / 2,
    //     h2: d / 2,
    //     color: c,
    //     final: texture(d, d),
    // };
    // sprites.set(obj, sprite);
    const c1 = scaleVector(squirrelVector(obj.seed, obj.position.x, obj.position.y), 4);
    const c2 = scaleVector(squirrelVector(obj.seed, obj.position.x, obj.position.y), 4);

    const g = sprite.bg.ctx.createRadialGradient(
        c1.x, c1.y, 1,
        c2.x, c2.y, d / 2.25
    );
    const offsets = stripe(3, i => squirrelBias(obj.seed, c1.x + i, c2.y - i) / 9).sort();
    g.addColorStop(0, FGA);
    g.addColorStop(0.23 + offsets[0], YELLOW);
    g.addColorStop(0.42 + offsets[1], FG);
    g.addColorStop(0.70 + offsets[2], YELLOW);
    g.addColorStop(1, VOID);
    // sprite.bg.do(s => s
    sprite.bg.do(s => s
        .center()
        .globalAlpha(0.25) // 0.25
        // .filter("blur(8px)")
        .fillStyle(g) // YELLOW
        .beginPath()
        .arc(0, 0, d / 2 - 8, 0, PIZZA)
        .fill()
        // .globalAlpha(1)
        // .fillStyle(BG).beginPath().arc(0, 0, 13, 0, PIZZA).fill()
    );
    // sketchify(sprite.final, obj.seed);
    sprite.scribble.do(s => s.center().fillStyle(BG).beginPath().arc(0, 0, 13, 0, PIZZA).fill());
    compositeSprite(sprite, true);
    debugSprite(sprite);
    return sprite;
};

const renderDumpster = (obj) => {
    const d = 5.25 * GAME_SCALE | 0;
    const w = 4 * GAME_SCALE;
    const w2 = w / 2;
    const h = 3.25 * GAME_SCALE;
    const h2 = h / 2;
    const sprite = getSprite(obj, d, d, GREEN, 3);
    sprite.bg.do(s => {
        s
            .center()
            .rotate(obj.rot)
            .fillStyle(BG)
            .strokeStyle(BG)
            .lineWidth(3)
            .fillRect(-w2 + 4, -h2 + 4, w - 8, h - 8)
            .strokeRect(-w2 - 4, -h2 - 4, w + 8, 16);
    });
    sprite.scribble.do(s => {
        const trash = bag(
            obj.seed + 1,
            0,
            0,
            squirrelRotation(obj.seed + 1, 0, 0),
            ceil((1.5 + squirrelFloat(obj.seed + 1, 0, 0)) * GAME_SCALE)
        );
        const wbuff = w2 - trash.diameter / 2 - 8;
        const hbuff = h2 - trash.diameter / 2 - 8;
        s.center()
            .rotate(obj.rot)
            .fillStyle(BGA).globalCompositeOperation("destination-out")
            .fillRect(-w2 + 16, -h2 + 16, w - 32, h - 32)
            .globalCompositeOperation("source-over")
            .globalAlpha(0.7)
            .drawImage(
                renderBag(
                    trash,
                    trash.diameter,
                    squirrelPick(trash.seed, -1, 9, [BGB, FGA, YELLOW, PUKE])
                ).final.screen,
                -trash.diameter / 2 + squirrelBias(trash.seed, 8, 23) * wbuff,
                -trash.diameter / 2 + squirrelBias(trash.seed, 2, 1) * hbuff
            );

    });
    compositeSprite(sprite, true);
    return sprite;
};

// const testScribble = (() => {
//     // const obj = entity(13, 2, 2);
//     // const obj = entity(6381961, 2, 2);
//     const obj = entity(stamp(), 2, 2);
//     obj.rot = squirrelRotation(obj.seed, obj.x, obj.y);
//     const colors = [RED, BLUE, GREEN, YELLOW, GRAY, BROWN];
//     // const color = colors[squirrelChoice(obj.seed, 0, 1, colors.length)];
//     const sprite = (
//         squirrelPick(obj.seed, 2, 4, [
//             // renderBlock,
//             renderBag,
//             renderPuddle,
//             renderSplatter,
//         ])
//     )(
//         obj,
//         squirrelPick(obj.seed, 3, 7, [
//             // 32, 64,
//             96, 128,
//             192, 256,
//             // 320,
//             // 640,
//         ])//,
//         // squirrelPick(obj.seed, 5, 5, colors)
//     )
//     return obj;
// })();
// Game Logic ==================================================

// Alley Cat Noir.
// Stay in the shadows.
// Kill rats.
// Beware of dogs.
// Avoid humans?
// You've got 9 lives.
// Use them wisely.

const gameCanvas = document.getElementById("screen");
const gameCtx = gameCanvas.getContext("2d");
const vectorGameBlock = (v) => {
    const b = vector(...[v.x, v.y].map(v => round(v / BLOCK_CELLS)));
    return !(b.x % 10) || !(b.y % 10) ? b : null;
};

let current;
const mouse = {
    ...entity(stamp(), 0, 0),
    real: vector(),
    click: false,
    touchScreen: false,
    touch: false,
    path: [],
    dist: 0,
};
window.mouse = mouse;

// This is a naive algorithm that will not consider alternative corner turning options
// It is a simple horizontal/vertical turn in the preferred direction
// It will likely favor right turns
const plotPath = (from, to, speed = 2) => {
    const path = [];
    const sourceBlock = vectorGameBlock(from);
    const targetBlock = vectorGameBlock(to);
    if (!sourceBlock || !targetBlock) {
        return path;
    }
    const fromTo = subtractVectors(to, from);
    // Check if we have turned a corner of some sort
    // Any path between blocks with a common x or y are solvable with collision detection, no need to do corner turning
    let collision;
    let junction;
    let offset;
    const corner = BLOCK_CELLS / 2;
    if (sourceBlock.x !== targetBlock.x && sourceBlock.y !== targetBlock.y) {
        // Check for wall collision.
        if (sourceBlock.y % 10) {
            // vertical to horizontal block
            junction = vector(sourceBlock.x, targetBlock.y);
            offset = vector(sign(fromTo.x) * corner, -sign(fromTo.y) * corner);
        } else {
            // horizontal to vertical block
            junction = vector(targetBlock.x, sourceBlock.y);
            offset = vector(-sign(fromTo.x) * corner, sign(fromTo.y) * corner);
        }
        const wallC = addVectors(scaleVector(sourceBlock, BLOCK_CELLS), offset);
        const wallD = addVectors(scaleVector(junction, BLOCK_CELLS), offset);
        // If there's an intersection,
        collision = intersection(from, to, wallC, wallD);
    }
    if (collision) {
        const anchor = addVectors(scaleVector(junction, BLOCK_CELLS), scaleVector(offset, (corner - 0.5) / corner));
        path.push(...plotPath(from, anchor, speed, debug));
        path.push(...plotPath(anchor, to, speed, debug));
    } else {
        const dist = measureVector(fromTo);
        const steps = ceil(dist / speed);
        const step = scaleVector(fromTo, 1 / steps);
        path.push(from);
        let curr = from;
        for (let i = 0; i < steps; i++) {
            curr = addVectors(curr, step);
            path.push(curr);
        }
    }
    return path;
};
window.plotPath = (...x) => plotPath(...x);

const updateMouse = () => {
    const { x, y } = mouse.real;
    // Let's convert to screen space
    // We need to first start at the center, so subtract screen w2 and h2
    const { camera, player } = current;
    const w2 = gameCanvas.width / 2;
    const h2 = gameCanvas.height / 2;
    const scale = 1 / (camera.zoom * GAME_SCALE);
    mouse.position = addVectors(
        rotateVector(
            scaleVector(
                subtractVectors(
                    vector(x, y), vector(w2, h2)
                ),
                scale
            ),
            camera.rot
        ),
        camera.position
    );
    const oldrot = mouse.rot;
    mouse.rot = normalizeRadians(-vectorRadians(subtractVectors(mouse.position, player.position)) - PIZZA_4);
    if (isNaN(mouse.rot)) {
        mouse.rot = oldrot;
    }

    // Let's check if we are allowed to do something
    // For now we will just say yes, but we can verify we are in a block,
    // and also check for collisions with things we can't interact with
    // Really we only need to disallow humans, dogs (not in their home), and... not sure
    const targetBlock = vectorGameBlock(mouse.position);
    mouse.path.length = 0;
    if (targetBlock) {
        // Check for mouse interactions with rats, dumpsters, boxes, bags, and alley floor
        // If it overlaps, we can setup the path towards it
        // We have to account for the current pending path point for the cat, as that will be a destination it is traveling towards
        const startPoint = player.path[0] ?? player.position;
        const addPlayerPosition = !!player.path[0];
        if (addPlayerPosition) {
            mouse.path.push(player.position);
        }
        mouse.path.push(...plotPath(startPoint, mouse.position, player.speed));
        // const startToMouse = subtractVectors(mouse.position, startPoint);
        // const dist = measureVector(startToMouse);
        // const steps = ceil(dist / player.speed);
        // const step = scaleVector(startToMouse, 1 / steps);
        // mouse.path.push(startPoint);
        // let curr = startPoint;
        // for (let i = 0; i < steps; i++) {
        //     curr = addVectors(curr, step);
        //     mouse.path.push(curr);
        // }


        if (mouse.click) {
            // Check if we have an overlapping item inside the block in question
            // Pop everything else off the mouse path, and plug the rest of the path into the player
            // TEMP: Let's just move the player to this position
            // player.position.x = mouse.position.x;
            // player.position.y = mouse.position.y;
            player.path.splice(1, player.path.length - 1, ...mouse.path.slice(addPlayerPosition ? 2 : 1));
        }
    }
    mouse.click = false;
};

const updatePlayer = (delta = 0) => {
    const { player } = current;
    const oldrot = player.rot;
    if (player.dead) {
        // Move it towards home
    } else if (!player.path.length && !player.action) {
        // player.rot = mouse.rot;
        if (!mouse.touchScreen || mouse.touch) {
            player.rot = lerpAngle(player.rot, mouse.rot, 0.1);
        }
    } else {
        // Update towards the next path point.
        const curr = player.action;
        if (curr) {
            // Update the current action
            if (curr.kind === "jumping") {
                curr.elapsed = min(curr.elapsed + delta, curr.dur);
                const t = player.easeFunction(curr.elapsed / curr.dur);
                const dest = lerpVector(curr.from, curr.to, t);
                if (!isNaN(dest.x) && !isNaN(dest.y)) {
                    player.position = dest;
                } 
                player.rot = lerpAngle(player.rot, curr.rot, 0.1);
                if (curr.elapsed >= curr.dur) {
                    // Action is complete, should we:
                    // - play a sound
                    // - add paw prints
                    // - make a splash?
                    
                    // Pop off the first path and clear the action
                    player.path.shift();
                    player.action = null;

                    // Now we check where we landed for:
                    // Dumpster, Sewer, Box, Bag, Rat, Puddle, Paper
                }
            }
        } else if (player.path.length) {
            // Create a new action
            const target = player.path[0];
            const diff = subtractVectors(target, player.position);
            const dur = max(
                10,
                ceil(measureVector(diff) / player.speed * BEAT)
            );
            player.action = action("jumping", player.position, target, dur);
        }
    }
    if (isNaN(player.rot)) {
        player.rot = oldrot;
    }
};

const updateMap = (/* delta */) => {
    const playerBlock = vectorGameBlock(current.player.position);
    if (!playerBlock) { return; }
    current.activeBlocks.length = 0;
    const kinds = Object.entries(current.activeGroups);
    kinds.forEach(x => { x[1].length = 0; });
    // Let's go through the block we're in and up to two blocks away in each cardinal direction
    for (let x = playerBlock.x - 2; x < playerBlock.x + 3; x++) {
        for (let y = playerBlock.y - 2; y < playerBlock.y + 3; y++) {
            // Skip anything that's not an alley
            if (x % 10 && y % 10) { continue; }
            const key = `${x},${y}`;
            current.activeBlocks.push(key);
            if (!current.blocks[key]) {
                // We are going to both generate the block and prerender the sprite for it
                const b = scaleVector(vector(x, y), BLOCK_CELLS);
                const obj = block(squirrel(current.seed, b.x, b.y), b.x, b.y, vector(x, y));
                current.blocks[key] = obj;
            }
        }
    }
    current.activeBlocks
        .map(b => current.blocks[b])
        .forEach(b => {
            !hasSprite(b) && renderBlock(b, BLOCK_SIZE);
            kinds.forEach(([k, a]) => a.push(...b[k]));
        });

    // Cleanup old records
    each(Object.entries(current.blocks), ([k, b]) => {
        if (!current.activeBlocks.includes(k)) {
            // delete current.blocks[k];
            // Let's remove the sprites for each of these
            clearSprite(b);
            each(Object.keys(entityGroups()), t => each(b[t], obj => clearSprite(obj)));
        }
    });
};

let failed = false;
const updateCamera = (delta, targetMax = 2, playerMax = 8) => {
    if (delta === 0 || current.paused) { return; }
    const { camera, player } = current;
    const toPlayer = subtractVectors(player.position, camera.position);
    const playerDist = measureVector(toPlayer);
    if (playerDist > playerMax) {
        camera.position = addVectors(
            camera.position,
            scaleVector(normalizeVector(toPlayer), playerDist - playerMax)
        );
    }
    let enemies = ([
        // ...(!mouse.touchScreen || mouse.touch ? [mouse] : []),
        mouse,
        // Add in dogs and humans and rats here
    ])
        .filter(x => x === mouse || measureVector(subtractVectors(x.position, player.position)) <= playerMax)
        .map((x, i) => subtractVectors(x.position, player.position))
        .reduce((r, x, i, a) => addVectors(r, scaleVector(x, 1 / a.length / 2)), vector());
    let em = measureVector(enemies);
    if (isNaN(em)) {
        enemies = vector();
        em = 0;
    }
    const target = subtractVectors(
        addVectors(
            player.position,
            (em
                ? scaleVector(normalizeVector(enemies), min(playerMax, em))
                : vector()
            )
        ),
        camera.position
    );
    // const target = subtractVectors(player.position, camera.position);
    const distTarget = measureVector(target);
    camera.coa = distTarget < targetMax
        ? target
        : scaleVector(normalizeVector(target), targetMax);
    // camera.position = addVectors(camera.position, scaleVector(camera.coa, 0.2));
    camera.position = addVectors(camera.position, scaleVector(camera.coa, 0.1));
    // Let's have the camera follow the player a bit
    // let rotdiff = ((player.rot + PIZZA) - (camera.rot + PIZZA)) % PIZZA - PI;
    // rotdiff = sign(rotdiff) * min(abs(rotdiff), delta / 2000 * PI);

    const targetRot = camera.follow ? -player.rot : 0;
    camera.rot = lerpAngle(camera.rot, targetRot, 0.01);
    if (isNaN(camera.rot)) {
        camera.rot = targetRot;
        if (!failed) {
            failed = true;
        }
    }
};

const doNewGame = (seed = stamp()) => {
    current = game(seed);
    updateMap(0);
};
doNewGame(/* 13 */); // Always start with the seed 13 for now.

const update = (delta) => {
    updateDJ(delta);
    updateMouse(delta);
    updateCamera(delta);
    // Special game state updates
        // Game Over
        // New Game
        // Pause/Resume
    // Proc Gen
    updateMap(delta)
    // Camera
    // paused early out

    // Player
    updatePlayer(delta);
    // Dumpsters
    // Boxes
    // Rats
    // Dogs
    // Humans
};

// Drawing

const drawSprite = (sprite, obj, s) => {
    const shadow = s ?? sprite.shadow;
    const { position } = obj;
    gameCtx.save();
    gameCtx.translate(position.x * GAME_SCALE, position.y * GAME_SCALE);
    if (shadow) {
        gameCtx.shadowColor = shadow;
        gameCtx.shadowBlur = 1;
        gameCtx.shadowOffsetX = 0;
        gameCtx.shadowOffsetY = 0;
    }
    gameCtx.drawImage(sprite.final.screen, -sprite.w2, -sprite.h2);
    // Maybe put light logic in here?
    gameCtx.restore();
};

const renderPawPrint = (obj, bg = FGA, fg = BG) => {
    const sprite = getSprite(obj, 32, 32, fg);
    sprite.bg.do(s => s
        .clear()
        .fillStyle(bg)
        .lineCap("round")
        .center()
        .rotate(-obj.rot)
        .beginPath()

        .moveTo(-10, -2)
        .ellipse(-10, -2, 3, 4, -0.5, 0, PIZZA)

        .moveTo(-4, -7)
        .ellipse(-4, -7, 3, 4, -0.15, 0, PIZZA)

        .moveTo(4, -7)
        .ellipse(4, -7, 3, 4, 0.15, 0, PIZZA)

        .moveTo(10, -2)
        .ellipse(10, -2, 3, 4, 0.5, 0, PIZZA)


        .moveTo(0, 3)
        .ellipse(0, 3, 5, 4, 0, 0, PIZZA)

        .moveTo(-5, 8)
        .ellipse(-5, 8, 5, 4, 0, 0, PIZZA)

        .moveTo(5, 8)
        .ellipse(5, 8, 5, 4, 0, 0, PIZZA)
        .fill()
    );
    compositeSprite(sprite);
    return sprite;
};
const mouseSprite = renderPawPrint(mouse);

const drawPath = (path = [], color = FGA, alpha = 0.5) => {
    if (path.length < 2) { return; }
    gameCtx.save();
    gameCtx.globalAlpha = alpha;
    gameCtx.lineWidth = 1;
    gameCtx.setLineDash([2, 3]);
    gameCtx.strokeStyle = color;
    gameCtx.beginPath();
    const last = path.length - 1;
    path.forEach((vec, i) => {
        const x = vec.x * GAME_SCALE;
        const y = vec.y * GAME_SCALE;
        if (i) {
            gameCtx.lineTo(x, y);
            gameCtx.arc(x, y, 7, 0, PIZZA);
        }
        gameCtx.moveTo(x, y);
    });
    gameCtx.stroke();
    // For each node in the path, we either moveTo, or we LineTo
    gameCtx.restore();

}

const drawPuddle = (obj) => {
    if (!hasSprite(obj)) {
        renderPuddle(obj, ceil(obj.diameter * GAME_SCALE));
    }
    drawSprite(getSprite(obj), obj)
};
const drawSplatter = (obj) => {
    if (!hasSprite(obj)) {
        renderSplatter(obj, ceil(obj.diameter * GAME_SCALE), obj.color ?? YELLOW);
    }
    drawSprite(getSprite(obj), obj)
};
const drawPaper = (obj) => {
    if (!hasSprite(obj)) {
        renderPaper(obj, ceil(obj.diameter * GAME_SCALE), obj.color);
    }
    drawSprite(getSprite(obj), obj)
};

const drawBag = (obj) => {
    if (!hasSprite(obj)) {
        renderBag(obj, ceil(obj.diameter * GAME_SCALE), GRAY);
    }
    drawSprite(getSprite(obj), obj)
};

const drawGeneric = (obj, fn) => {
    if (!hasSprite(obj)) {
        fn(obj);
    }
    drawSprite(getSprite(obj), obj)
};

const drawPlayer = () => {
    const { player, gametime } = current;
    // const bg = "#000";
    // const fg = "#223";//BG;
    const bg = BG;
    const fg = "#000";
    const sprite = getSprite(player, 256, 256, fg, 3);
    // Draw Mouth Item
    // Draw Base Shape
    const cycle = sin(gametime / SIXTEENTH);
    const tcycle = sin(gametime / EIGHTH) * 0.5;
    const head = vector(cycle * 3, -45);
    const body = vector(0, 0);
    const headRot =  cycle * 0.25;
    // const headRX = 40;
    // const headRY = 35;
    // const bodyRX = 35;
    // const bodyRY = 32.5;
    const headRX = 35;
    const headRY = 30;
    const bodyRX = 30;
    const bodyRY = 27.5;
    const bodyRot = 0;
    const tail = rotateVector(vector(0, 116), -tcycle);
    // Head and body
    sprite.bg
        .save()
        .clear()
        .fillStyle(bg)
        .strokeStyle(bg)
        .lineWidth(2)
        .lineCap("round")
        .center()
        .rotate(-player.rot)
        // Head and whiskers
        .do(s => s
            .translate(head.x, head.y)
            .rotate(headRot)
            .beginPath()
            .ellipse(0, 0, headRX, headRY, 0, 0, PIZZA)
            .closePath()
            .fill()
            .beginPath()
            .moveTo(0, 5).lineTo(-50, 0)
            .moveTo(0, 5).lineTo(-50, -10)
            .moveTo(0, 5).lineTo(-50, 10)
            .moveTo(0, 5).lineTo(50, 0)
            .moveTo(0, 5).lineTo(50, -10)
            .moveTo(0, 5).lineTo(50, 10)
            // add a temp circle around the whole thing
            .stroke()
            .globalCompositeOperation("destination-out") // subtract ears
            .fillRect(-20, -headRY - 2, 42, 20) // ears
            .globalCompositeOperation("source-over")
        )
        // Body
        .do(s => s
                .beginPath()
                .ellipse(body.x, body.y, bodyRX, bodyRY, bodyRot, 0, PIZZA)
                .closePath()
                .fill()
        )
        // Tail
        .do(s => {
            if (!player.dead) {
                s
                    .lineWidth(6)
                    .beginPath()
                    // .arc(0, 0, 122, 0, PIZZA) // Temp circle around the whole thing
                    .moveTo(0, bodyRY)
                    .bezierCurveTo(
                        tail.x * 0.5, bodyRY * 2,
                        tail.x * -0.25,  tail.y * 0.8 + abs(tail.x) / 2, //tail.y + bodyRY / 2,
                        tail.x, tail.y)
                    .stroke()
            }
        })
        // Legs
        .restore();

    // gameCtx.save();
    // gameCtx.globalAlpha = 0.75;
    // gameCtx.lineWidth = 1;
    // gameCtx.setLineDash([2, 3]);
    // gameCtx.strokeStyle = GREEN;
    // gameCtx.beginPath();
    // const last = player.path - 1;
    // player.path.forEach((vec, i) => {
    //     const x = vec.x * GAME_SCALE;
    //     const y = vec.y * GAME_SCALE;
    //     if (i && 1 != last) {
    //         gameCtx.lineTo(x, y);
    //         gameCtx.arc(x, y, 7, 0, PIZZA);
    //     }
    //     gameCtx.moveTo(x, y);
    // });
    // gameCtx.stroke();
    // // For each node in the path, we either moveTo, or we LineTo
    // gameCtx.restore();
    
    // drawPath(mouse.path.slice(player.path.length ? 1 : 0), FG, 0.5);
    if (!mouse.touchScreen || mouse.touch) {
        drawPath(mouse.path.slice(player.path.length ? 1 : 0));
    }
    drawPath([player.position, ...player.path], GREEN, 1);

    // Final Composite
    compositeSprite(sprite);
    if (player.dead) {
        gameCtx.globalAlpha = 0.5;
    };
    drawSprite(sprite, player, FGA);
    if (player.dead) {
        gameCtx.globalAlpha = 1;
    };

};

const drawLight = (obj) => {
    if (!hasSprite(obj)) {
        renderLight(obj, ceil(obj.radius * 2 * GAME_SCALE), FGA);
    }
    gameCtx.save();
    gameCtx.globalAlpha = obj.brightness ?? 1;
    drawSprite(getSprite(obj), obj)
    gameCtx.restore();
};

const drawLightFX = (obj) => {
    if (!hasSprite(obj)) {
        renderLight(obj, ceil(obj.radius * 2 * GAME_SCALE), FGA);
    }
    gameCtx.save();
    // "overlay", "lighter", and maybe "lighten"
    // gameCtx.globalAlpha = 0.5;
    gameCtx.globalAlpha = (obj.brightness ?? 1) / 2;
    gameCtx.globalCompositeOperation = "lighter";
    // gameCtx.filter = "blur(8px)";
    drawSprite(getSprite(obj), obj);
    gameCtx.restore();
}

const drawMouse = () => {
    // if (mouse.touchScreen && !mouse.touch) { return; }
    // For now, we'll ignore changing anything other than the drawing of it
    const hit = !current.player.dead && mouse.path.length;
    const bg = hit ? FGA : RED; // We should base this on if it's allowed or not
    const fg = BG; // We should base this on if it's allowed or not
    renderPawPrint(mouse, bg, fg);
    drawSprite(mouseSprite, mouse);
    if (current.player.dead) {
        return;
    }
    // // Should we now add a possible thing for it? Good question
    // gameCtx.save();
    // gameCtx.globalAlpha = 0.5;
    // gameCtx.lineWidth = 1;
    // gameCtx.setLineDash([2, 3]);
    // gameCtx.strokeStyle = FG;
    // gameCtx.beginPath();
    // const last = mouse.path - 1;
    // mouse.path.forEach((vec, i) => {
    //     const x = vec.x * GAME_SCALE;
    //     const y = vec.y * GAME_SCALE;
    //     if (i && 1 != last) {
    //         gameCtx.lineTo(x, y);
    //         gameCtx.arc(x, y, 7, 0, PIZZA);
    //     }
    //     gameCtx.moveTo(x, y);
    // });
    // gameCtx.stroke();
    // // For each node in the path, we either moveTo, or we LineTo
    // gameCtx.restore();
};
const fix = n => n.toFixed(2);

let pauseScreen = null;
let drawDeltas = stripe(7);
let lowFPS = 0;
const draw = (delta) => {
    let fps = 0;
    drawDeltas.push(delta);
    drawDeltas.shift();
    fps = 1000 / (drawDeltas.reduce((a, b) => a + b, 0) / 7);
    if (fps < 55) {
        lowFPS = max(0, min(lowFPS + 5, 30));
    }
    if (current.paused && !pauseScreen && current.gametime) {
        const w = gameCanvas.width;
        const h = gameCanvas.height;
        pauseScreen = texture(w, h).drawImage(gameCanvas, 0, 0);
    } else if (!current.paused && pauseScreen) {
        pauseScreen = null;
    }
    const { camera } = current;
    const WIDTH = min(1920, window.innerWidth);
    const HEIGHT = min(1080, window.innerHeight);
    const W2 = WIDTH / 2;
    const H2 = HEIGHT / 2;
    gameCanvas.width = WIDTH;
    gameCanvas.height = HEIGHT;
    gameCtx.fillStyle = "#000";
    gameCtx.fillRect(0, 0, WIDTH, HEIGHT);

    // Pause Screen Early Escape
    if (current.paused) {
        if (pauseScreen) {
            const f = sin(current.totaltime / 6000 * PIZZA);
            gameCtx.filter = `blur(${-f + 2.5}px)`;
            gameCtx.globalAlpha = 0.75 + 0.125 * f;
            gameCtx.drawImage(pauseScreen.screen, 0, 0, WIDTH, HEIGHT);
            gameCtx.filter = "none";
            gameCtx.globalAlpha = 1;
        }
        gameCtx.fillStyle = FG;
        gameCtx.font = 'bold 16px Palatino'; // Georgia, Palatino, Times New Roman, Times
        gameCtx.drawImage(logo.screen, W2 - logo.w2, H2 - logo.h / 2);
        return;
    }

    // Move to Camera Context
    const { zoom, rot, position } = camera;
    gameCtx.save();
    gameCtx.translate(W2, H2);
    gameCtx.scale(zoom, zoom);
    gameCtx.rotate(-rot);
    gameCtx.translate(-position.x * GAME_SCALE, -position.y * GAME_SCALE);

    // Draw Background
    // Current blocks
    const entities = current.activeGroups;
    current.activeBlocks.forEach(key => {
        const b = current.blocks[key];
        drawSprite(getSprite(b), b);
    });

    // drawSprite(getSprite(testScribble), testScribble);
    // Draw Lights
    entities.lights.forEach(drawLight);
    // Draw Splatters
    entities.splatters.forEach(drawSplatter);
    // Draw Papers
    entities.papers.forEach(drawPaper);
    // Draw Puddles
    entities.puddles.forEach(drawPuddle);
    // Draw Bags
    entities.bags.forEach(drawBag);
    // Draw Box Bottoms
    // Draw Rats
    // Draw Dumpster Bottoms
    entities.dumpsters.forEach(x => drawGeneric(x, renderDumpster));
    // Draw Player
    drawPlayer();
    // Draw Dogs
    // Draw Box Tops
    // Draw Dumpster Tops
    // Draw FX
    // Draw Light FX
    entities.lights.forEach(drawLightFX);

    // Draw Shadows/ Walls
    gameCtx.save();
    gameCtx.imageSmoothingEnabled = false;
    gameCtx.filter = "blur(4px)";
    const wallCenter = vector(
        round(position.x / 100) * 100,
        round(position.y / 100) * 100
    );
    gameCtx.translate(wallCenter.x * GAME_SCALE, wallCenter.y * GAME_SCALE);
    // const b = vector(...[v.x, v.y].map(v => round(v / BLOCK_CELLS)));
    // return !(b.x % 10) || !(b.y % 10) ? b : null;
    gameCtx.scale(GAME_SCALE * 10, GAME_SCALE * 10);
    gameCtx.drawImage(walls.screen, -10.5, -10.5, 21, 21);
    gameCtx.restore();


    // Draw Mouse
    drawMouse();

    // Reset from Camera Context
    gameCtx.restore();
    // Draw HUD
    // score and multiplier
    // lives
    // pause button or 


    // // Temp for the moment
    // const { player } = current;
    if (fps) {
        gameCtx.fillStyle = FG;
        gameCtx.font = 'bold 10px monospace';
        gameCtx.fillText(`FPS: ${fps | 0}`, 10, HEIGHT - 12);
        if (lowFPS) {
            lowFPS--;
            gameCtx.fillStyle = RED;
            gameCtx.fillText("LOW FPS WARNING", 10, HEIGHT - 22);
        }
    }
    // gameCtx.fillText(`Player [${fix(player.position.x)}, ${fix(player.position.y)}]: Mouse [${fix(mouse.position.x)}, ${fix(mouse.position.y)}]`, 10, HEIGHT - 24);
    // gameCtx.fillText(`Alley Cat Noir ${version}: seed ${current.seed} frame ${current.frame} gametime ${current.gametime.toFixed(3)}${current.paused ? " paused" : ""} mouse ${mouse.path.length}`, 10, HEIGHT - 10);
    // Object.entries(entities).forEach(([k, a], i) => gameCtx.fillText(` - ${k}: ${a.length}`, 10, HEIGHT - 12 * (i + 3)));
};

// Game loop

const r = () => requestAnimationFrame((time = 0) => {
    const delta = time - current.now;
    current.now = time;
    current.frame++;
    current.totaltime += delta;
    current.gametime += current.paused ? 0 : delta;
    update(delta);
    draw(delta);
    r();
});
r();

window.currentGame = () => current;
listen(window, "keydown", (ev) => {
    switch (ev.key.toLowerCase()) {
        case "c":
            current.camera.follow = !current.camera.follow;
            break;
        case "escape":
        case "p":
            current.paused = !current.paused;
            break;
        case "d":
            debug = !debug;
        default:
    }
});


const isTouchDevice = () => {
  const isMobile = /android|ipad|iphone|ipod|windows phone|iemobile|blackberry|webos|opera mini/i.test(navigator.userAgent || navigator.vendor || window.opera);
    return isMobile && (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 // for older IE versions
    );
};

if (isTouchDevice()) {
    mouse.touchScreen = true;
    let touchtime = 0;
    listen(window, "touchstart", (ev) => {
        const [touch] = ev.touches;
        ev.preventDefault();
        mouse.real.x = touch.clientX;
        mouse.real.y = touch.clientY;
        mouse.touch = true;
        touchtime = Date.now();
        // mouse.click = !current.paused;
        // if (current.paused) { current.paused = false; }
    });
    listen(window, "touchmove", (ev) => {
        const [touch] = ev.touches;
        ev.preventDefault();
        mouse.real.x = touch.clientX;
        mouse.real.y = touch.clientY;
        mouse.touch = true;
        // mouse.click = !current.paused;
        // if (current.paused) { current.paused = false; }
    });
    listen(window, "touchend", (ev) => {
        const [touch] = ev.changedTouches;
        ev.preventDefault();
        mouse.real.x = touch.clientX;
        mouse.real.y = touch.clientY;
        mouse.touch = false;
        if (Date.now() - touchtime < 500) {            
            mouse.click = !current.paused;
            if (current.paused) { current.paused = false; }
        }
    });
    listen(window, "touchcancel", (ev) => {
        const [touch] = ev.changedTouches;
        ev.preventDefault();
        mouse.real.x = touch.clientX;
        mouse.real.y = touch.clientY;
        mouse.touch = false;
    });
} else {
    listen(window, "click", (ev) => {
        mouse.real.x = ev.clientX;
        mouse.real.y = ev.clientY;
        mouse.click = !current.paused;
        if (current.paused) { current.paused = false; }
    });
    listen(document, "mousemove", ({ clientX: x, clientY: y }) => {
        mouse.real.x = x;
        mouse.real.y = y;
    });
}

// Music

let musicActive = false;
let musicDJ;
let musicReverb;
let updateDJ = () => {}; // noop until the DJ is hired
const hireDJ = () => {
    if (musicDJ) { return; }
    window.removeEventListener("click", hireDJ);
    window.removeEventListener("touchstart", hireDJ);
    musicDJ = new AudioContext();
    musicReverb = musicDJ.createConvolver();
    const rate = musicDJ.sampleRate;
    const decay = 3;
    const length = 3 * rate; // 3 second reverb
    const impulse = musicDJ.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
        let n = i;
        impulseL[i] = (random() * 2 - 1) * pow(1 - n / length, decay);
        impulseR[i] = (random() * 2 - 1) * pow(1 - n / length, decay);
    }
    musicReverb.buffer = impulse;
    musicReverb.connect(musicDJ.destination);

    musicActive = true;

    const melodies = {
        idle: {
            scale: 0,
            octave: 3,
            key: 4,
            notes: [
                [0, 4, 1], // nev
                [1, 5, 1], // er
                [2, 8, 1], // gon
                [3, 5, 1], // na
                [4, 10, 1], // give
                [6, 10, 1.5], // you
                [8,  9, 2], // up

                [12,  4, 1], // nev
                [13,  5, 1], // er
                [14, 8, 1], // gon
                [15, 5, 1], // na
                [16, 9, 1], // make
                [18, 9, 1.5], // you
                [20, 8, 2.5], // cry
            ],
            bass: [
                // [3, 4, 4],
                // [4, 10, 4],
                // [8,  9, 4],
                // [12,  4, 4],
                // [16, 9, 4],
                // [20, 8, 7],
                [4, 10, 3], // give
                [6, 10, 4], // you
                [8,  9, 7], // up

                [16, 9, 3], // make
                [18, 9, 4], // you
                [20, 8, 7], // cry
            ],
        }
    };
    const notes = stripe(144, x => 432 * 2**((x - (48)) / 12));
    const scales = stripe(7, i => {
        const s = [0, 2, 4, 5, 7, 9, 11];
        s.push(...s.splice(0, (i % 7 + 7) % 7).map(x => x + 12))
        return s;
    });

    let lasttick = -1;
    let melody = melodies.idle;
    let measure = 0;
    let key = melody.key;
    let scale = scales[melody.scale];

    const startMeasure = () => {
        measure++;
        // Potentially change keys at the start of the measure?
        // console.log("startMeasure", measure);
    };
    const endMeasure = () => {
        // scale  = scales[(melody.scale + measure + 1) % scales.length];

        // randomly switch modes
        scale = squirrelPick(current.seed, measure, key, scales);

        // console.log("endMeasure", measure);
    };
    const changeMelody = x => {
        melody = melodies[x] ?? melody;
        scale = scales[melody.scale] ?? scale;
        key = melody.key ?? key;
        measure = 0;
    };

    const tickOfMeasure = (dur) => ((((dur / TEMPO) % BEAT_SIGNATURE) | 0) + 1) % BEAT_SIGNATURE;

    const lramp = (x, ...y) => x.linearRampToValueAtTime(...y);
    const expramp = (x, ...y) => x.exponentialRampToValueAtTime(...y);
    const sval = (x, ...y) => x.setValueAtTime(...y);
    const con = (a, b, ...x) => a.connect(b, ...x);
    // note, len, vol, verb, attack, deflate
    const play = (tick, dur, type = "sine", octave = 1, note = 0, len = 1, vol = 0.5, verb = 0.5, attack = 0.001, deflate = 0.5) => {
        const decay = len * SPB;
        const oct = octave + (note < 0 ? -1 : (note / 7) | 0);
        // const oct = octave;
        const freq = notes[key + (oct * 12) + scale[(note + 7) % 7]];
        // console.log({ tick, note, octave, oct, n: (note + 7) % 7, sick: key + (oct * 13) + scale[(note + 7) % 7], freq });

        const t = musicDJ.currentTime;
        const offset = max(((BEAT_SIGNATURE + tick) - ((dur / TEMPO) % BEAT_SIGNATURE)) % BEAT_SIGNATURE * SPB, 0);
        const when = t + offset;

        const osc = musicDJ.createOscillator({ type });
        const gain = musicDJ.createGain();
        const comp = musicDJ.createDynamicsCompressor();
        const verbage = musicDJ.createGain();
        const split = musicDJ.createChannelSplitter(2);
        const over = when + decay + 0.1;
        // console.log("play", tick, dur, osc.frequency, freq, when, t);
        sval(osc.frequency, freq, when);
        sval(osc.frequency, freq, when + attack);
        expramp(osc.frequency, freq * deflate, when + decay);

        sval(gain.gain, 0.01, t);
        lramp(gain.gain, vol * 0.5, when);
        expramp(gain.gain, vol, when + attack);
        expramp(gain.gain, 0.01, over);

        sval(comp.threshold, -27, t);
        sval(comp.knee, 39, when);
        sval(comp.ratio, 13, when);
        sval(comp.attack, 0, when);
        sval(comp.release, max(0, min(decay, 1)), when);


        lramp(verbage.gain, vol * verb, when + 0.1);
        lramp(verbage.gain, 0.01, when + decay);

        con(osc, gain);
        con(gain, comp);
        con(comp, split);
        con(split, verbage, 1, 0);
        con(verbage, musicReverb);

        osc.start(when);
        osc.stop(over);
        setTimeout(() => each([osc, gain, comp, split, verbage], x => x.disconnect()), (over - t + 1) * 1000)
    };

    const bass = (tick, dur) => {
        const sing =  melody.bass.find(([x]) => x === tick);
        if (!sing) { return; }
        play(tick, dur, "square", 1, sing[1], sing[2],  0.5, 0.7, 0.01, 0.98);
        // console.log("bass", tick, sing, offset);
    };

    const drum = (tick, dur) => {
        const sing =  melody.notes.find(([x]) => x === tick);
        if (!sing) { return; }
        const offset = measure % 3
            ? (squirrelFloat(current.seed, tick, dur) > 0.66
                ? squirrelPick(current.seed, dur, tick, [-3, -4, 2, 3, 4, 8, -8])
                : 0
            )
            : 0;
        play(tick, dur, "sawtooth", melody.octave, sing[1], sing[2] + offset, 0.7, 0.8, 0.005, 0.98);
        // console.log("drum", tick, sing, offset);
    };

    const scheduled = new Set();

    updateDJ = () => {
        const dur = current.gametime;
        const tick = tickOfMeasure(dur);
        if (tick !== lasttick) {
            scheduled.delete(lasttick);
            lasttick = tick;
            // console.log("tick", tick);
        }
        if (musicActive && !scheduled.has(tick)) {
            if (tick === 0) {
                startMeasure();
            }
            scheduled.add(tick);
            drum(tick, dur);
            bass(tick, dur);
            if (tick === 23) {
                endMeasure();
            }
        }
    }

};
listen(window, "click", hireDJ);
listen(window, "touchstart", hireDJ);
