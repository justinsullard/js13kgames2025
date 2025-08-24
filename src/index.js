let now = 0;
let frame = 0;
let paused = false;
let gametime = 0;

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const version = "v0.13.dev";

const { min } = Math;

// Welcome to the Alley Cat Noir. Stay in the shadows. Catch those dirty rats. Watch out for dogs and pesky humans. You've got 9 lives. Use them wisely.

const update = (delta) => {

};

const draw = (delta) => {
    const WIDTH = min(1920, window.innerWidth);
    const HEIGHT = min(1080, window.innerHeight);
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx.fillStyle = "#101";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = '16px monospace';
    ctx.fillText(`Alley Cat Noir ${version}: frame ${frame} gametime ${gametime}${paused ? " paused" : ""}`, 10, HEIGHT - 10);
};

const r = () => requestAnimationFrame((time = 0) => {
    const delta = time - now;
    now = time;
    frame++;
    gametime += paused ? 0 : delta;
    update(delta);
    draw(delta);
    r();
});
r();
