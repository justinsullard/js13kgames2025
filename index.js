import StaticServer from "static-server";
import watch from "recursive-watch";

import build from "./scripts/build.js";

const last = {};

const main = async () => {

    const server = new StaticServer({ rootPath: '.', port: 9080 });

    server.start(() => console.log(`Alley Cat Noir is running at http://localhost:${server.port}/src/ and http://localhost:${server.port}/build/`, ));
    
    watch('./src', (filename) => {
        const now = Date.now();
        if (last[filename] && now - last[filename] < 1000) {
            console.log(new Date(now).toISOString(), "Ignoring rapid change to", filename);
            return;
        }
        last[filename] = now;
        console.log(new Date(now).toISOString(), 'something changed with', filename);

        build().then((ok) => console.log("Build", ok ? "success" : "failure")).catch(console.error);
    });

};

main().catch(console.error);
