import { exec } from "node:child_process";
import { URL } from "node:url";
import { PassThrough } from "node:stream";
import { join } from "path";
import { parse } from "@babel/parser";

import { rollup } from "rollup";
import fs from "fs-extra";
import { minify } from "uglify-js";
import { Packer } from "roadroller";
import yazl from "yazl";
import { minify as terser } from "terser";
import CleanCSS from "clean-css";
import { stat } from "node:fs/promises";

const __dirname = new URL('.', import.meta.url).pathname;

const fpath = (x) => join(__dirname, x);

const jamstart = new Date("2025-08-13T11:00:00.000Z").valueOf();
const jamend = new Date("2025-09-13T11:00:00.000Z").valueOf();
const zipmax = 13312;

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const remainingTime = () => {
    let millis = jamend - Date.now();
    return Object.entries({ day, hour, minute, second })
        .map(([k, quant]) => {
            const val = millis / quant | 0;
            millis -= val * quant;
            return val ? `${val} ${k}s` : "";
        }).filter(x => x).join(" ").replace(/, (\d+ \w+)$/, " and $1");
};

const roadrollerit = async (data) => {
    const inputs = [{ data, type: 'js', action: 'eval'}];
    const packer = new Packer(inputs, {
        optimize: 2,
        // allowFreeVars: true,
    });
    await packer.optimize();
    const { firstLine, secondLine } = packer.makeDecoder();
    return firstLine + secondLine;
}
const BABEL_CONFIG = {};

const simplify = (obj = {}) => {
    if (typeof obj !== "object" || !obj) { return obj; }
    if (Array.isArray(obj)) { return obj.map(simplify); }
    const {
        directives,
        loc,
        start,
        end,
        range,
        extra,
        ...kept
    } = obj;
    Object.entries(kept)
        .filter(([k, v]) => v !== undefined)
        .forEach(([k, v]) => {
            if (typeof v === "object") {
                kept[k] = simplify(v);
            }
        });
    return kept;
};

const mapCode = (raw) => simplify(parse(raw, BABEL_CONFIG));

const phrases = [];
let speaking = false;
const speak = () => {
    if (speaking) { return; }
    const msg = phrases.shift();
    if (!msg) { return; }
    speaking = true;
    exec(`espeak ${JSON.stringify(msg)}`, () => { speaking = false; speak(); });
};
const advzip = (zippath) => new Promise((resolve) => {
    exec(`advzip --recompress -4 --iter 1300 ${zippath}`, async () => {
        const stats = await stat(zippath);
        resolve(stats.size);
    })
});
const say = (msg) => {
    console.log(msg);
    phrases.push(msg);
    speak();
}

let busy = false;
let queue = false;
export const build = async () => {
    if (Date.now() >= jamend) {
        console.error("It's too late, the jam is over");
    }
    if (busy) {
        queue = true;
        const msg = "Dude, you're saving stuff too quick. I'll queue this one.";
        say(msg);
        return false;
    }
    busy = true;
    const timestamp = Date.now() - jamstart;
    const version = new Date(timestamp).toISOString().split("-").pop().replace(/\D+/g, "");
    const timer = "Build Time";
    console.time(timer);
    // Let's figure out what day it is of the jam...
    const dayof = (timestamp / day) | 0;
    say(`building v0.13.${version} on day ${dayof}`);
    // clear the build folder
    await fs.emptyDir("../build/");
    // create staging folder in build folder
    // copy everything from src that matters (.js, .glsl, .css, .html)
    await fs.copy(fpath("../src/"), fpath("../build/staging/"), {
        filter: (x) => !x.includes("font/") || x.includes("image.js")
    });
    
    // Adjust version number
    const titlepath = fpath("../build/staging/index.js");
    const titlesrc = await fs.readFile(titlepath, "utf-8");
    await fs.writeFile(titlepath, titlesrc.replace("v0.13.dev", `v0.13.${version}`));

    const packagepath = fpath("../package.json");
    const packagesrc = await fs.readFile(packagepath, "utf-8");
    const newpackage = packagesrc.replace(/"0\.13\.\d+"/, `"0.13.${version}"`);
    await fs.writeFile(packagepath, newpackage, "utf-8");

    // // inline glsl for shaders
    // const screenpath = fpath("../build/staging/hardware/screen.js");
    // const screensrc = await fs.readFile(screenpath, "utf-8");
    // const vertexsrc = await fs.readFile(fpath("../build/staging/hardware/vertex.glsl"), "utf-8");
    // const fragmentsrc = await fs.readFile(fpath("../build/staging/hardware/fragment.glsl"), "utf-8");
    // const shadermin = (src) => src.replace(/^ +/g, "");
    // await fs.writeFile(screenpath, screensrc
    //     .replace(/vertexShaderSrc = vertexShaderSrc.+/, "")
    //     .replace(/fragmentShaderSrc = fragmentShaderSrc.+/, "")
    //     .replace(/let vertexShaderSrc;/, `const vertexShaderSrc = \`${shadermin(vertexsrc)}\`;`)
    //     .replace(/let fragmentShaderSrc;/, `const fragmentShaderSrc = \`${shadermin(fragmentsrc)}\`;`)
    // );

    // flatten and treeshake with rollup
	let bundle;
	let buildFailed = false;
    let rolledup;
	try {
		// create a bundle
		bundle = await rollup({
            input: fpath("../build/staging/index.js"),
            treeshake: true,
        });
        const { output } = await bundle.generate({});
        rolledup = output.map(x => x.code).join("\n");
		await fs.writeFile(fpath("../build/staging/index.rollup.js"), rolledup);
	} catch (error) {
		buildFailed = true;
        say("Build error! You broke it! Fix it, dude!");
        console.error(error);
	}
	if (bundle) {
		// closes the bundle
		await bundle.close();
	}
    if (buildFailed) {
        if (queue) {
            setTimeout(() => {
                busy = false;
                queue = false;
                build();            
            }, 10);
        } else {
            busy = false;
        }
        console.timeEnd(timer);
        return false;
    }

    // minifications
    // attempt uglify
    const { error: uglyerror, code: uglycode } = minify(rolledup, { mangle: { toplevel: true, properties: false } });
    if (uglycode) {
        await fs.writeFile(fpath("../build/staging/index.uglify.js"), uglycode);
    }
    // attempt terser
    let tersered;
    try {
        const obj = await terser(rolledup, {
            // not sure what options we want to use aside from default
        });
        tersered = obj.code;
    } catch (e) {
        console.error("Error with terser", e);
    }
    if (tersered) {
        await fs.writeFile(fpath("../build/staging/index.terser.js"), uglycode);
    }
    // attempt roadroller
    const roadrollered = await roadrollerit(rolledup);
    await fs.writeFile(fpath("../build/staging/index.roadroller.js"), roadrollered);

    // attempt custom
    const mapped = mapCode(rolledup);
    await fs.writeFile(fpath("../build/staging/index.mapped.json"), JSON.stringify(mapped, false, 2));
    // attempt custom > roadroller
    // attempt uglify > roadroller
    const uglyroller = await roadrollerit(uglycode);
    await fs.writeFile(fpath("../build/staging/index.uglyroller.js"), uglyroller);
    // attempt terser > roadroller

    const terserroller = await roadrollerit(tersered);
    await fs.writeFile(fpath("../build/staging/index.terserroller.js"), terserroller);
    
    // attempt uglify > custom
    // ?

    // build final html
    const htmlpath = fpath("../build/staging/index.html");
    const csspath = fpath("../build/staging/index.css");
    const htmlsrc = await fs.readFile(htmlpath, "utf-8");
    const csssrc = await fs.readFile(csspath, "utf-8");
    const cssmin = new CleanCSS({}).minify(csssrc).styles;
    await fs.writeFile(fpath("../build/staging/index.min.css"), cssmin);
    await fs.writeFile(fpath("../build/index.html"),
        htmlsrc.split("\n").map(x => {
            if (x.startsWith("<link")) {
                return `<style>${cssmin}</style>`;
            }
            if (x.startsWith("<script")) {
                // choose the winner
                const winner = Object.entries({
                    uglycode,
                    // tersered,
                    roadrollered,
                    uglyroller,
                    terserroller,
                }).sort((a, b) => a[1].length - b[1].length)[0];
                say(`${winner[0]} is the smallest`);
                return `<script type=module>${winner[1]}</script>`
            }
            return x;
        }).join("\n")
    );

    // build zip files based on minifications
    const stream = new PassThrough();
    const zip = new yazl.ZipFile();
    zip.outputStream.pipe(stream);
    zip.addFile(fpath("../build/index.html"), "index.html");
    zip.end({ forceZip64Format: false }, () => console.log("yazl zip ended"));
    const buff = await new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (c) => chunks.push(Buffer.from(c)));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
    const zippath = fpath(`../build/alleycatnoir.v0.13.${version}.zip`);
    await fs.writeFile(zippath, buff);
    const bytes = await advzip(zippath);
    console.log(`advzip saved ${buff.length - bytes} bytes (was ${buff.length} bytes from yazl)`);
    const percent = (bytes / zipmax * 100).toFixed(1);
    say(`Built zip ${bytes} of ${zipmax} bytes (${percent}%)`);
    console.timeEnd(timer);
    if (queue) {
        setTimeout(() => {
            busy = false;
            queue = false;
            build();
        }, 10);
    } else {
        busy = false;
        // console.log("Build ready");
        say(`Build ready. ${remainingTime()} remain in the jam.`);
    }
    return true;
};
export default build;
