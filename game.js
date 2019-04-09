/* jshint esversion: 6 */
const thrusterForce = .28;
const gravity = .2;
const rotationMultiplier = 1 / 100;

module.exports.game = class game {
    constructor(thrusterAmount) {
        this.stage = {
            "width": 1920,
            "height": 1080
        }
        // rotation in degrees: 0...360; 180 means straight upwards
        this.rocket = {
            "width": 128,
            "height": 128 + 48,
            "rot": 180
        }
        this.rocket["x"] = (this.stage["width"] - this.rocket["width"]) / 2;
        this.rocket["y"] = this.stage["height"] - this.rocket["height"] - this.rocket["height"];
        this.rocket["cx"] = this.rocket["width"] / 2; // to remove later on
        this.rocket["cy"] = this.rocket["height"] / 2; // this too

        this.thrusters = [];
        this.thrusterStates = [];

        let dist = Math.floor((this.rocket["width"] - 3) / thrusterAmount);
        let start = this.rocket["width"] - dist * thrusterAmount;
        for (let i = 0; i < thrusterAmount; i++) {
            this.thrusters[i] = {
                "x": start + i * dist,
                "y": 10,
                "connected": false
            };
            this.thrusterStates[i] = false;
        }

        this.collisions = [
            {"x1": 0, "x2": this.stage["width"], "y1": 0, "y2": 0},
            {"x1": 0, "x2": this.stage["width"], "y1": this.stage["height"], "y2": this.stage["height"]},
            {"x1": 0, "x2": 0, "y1": 0, "y2": this.stage["height"]},
            {"x1": this.stage["width"], "x2": this.stage["width"], "y1": 0, "y2": this.stage["height"]}
        ]

        this.lastTime = Date.now();
        this.vx = 0;
        this.vy = 0;
        this.started = false;
        this.ended = false;
    }

    act() {
        if (this.ended === false) { // ugly but idc
            let t = (Date.now() - this.lastTime) / 1000;
            this.lastTime = Date.now();
            let fm = 0; // force multiplier
            let fx = 0,
                fy = 0; // force loc
            for (const [key, value] of Object.entries(this.thrusterStates)) {
                if (value) {
                    fm++;
                    fx += this.thrusters[key]["x"];
                    fy += this.thrusters[key]["y"];
                }
            }
            if (fm > 0) {
                this.started = true;
                let fcX = fx / fm;
                let am = this.rocket["cx"] - fcX; // angular movement factor
                let accX = -Math.sin(this.rocket["rot"] * Math.PI / 180) * thrusterForce * fm;
                let accY = Math.cos(this.rocket["rot"] * Math.PI / 180) * thrusterForce * fm;
                this.rocket["rot"] += am * rotationMultiplier;
                this.vx += accX * t;
                this.vy += accY * t;
            }
            if (this.started) this.vy += gravity * t;
            this.rocket["x"] += this.vx * t * 1000; // TODO const this 1k
            this.rocket["y"] += this.vy * t * 1000;

            for (const c of this.collisions) {
                let rc = this.rocketOuterCoords();
                if (this.intersects(c, {"x1": rc[0]["x"], "y1": rc[0]["y"], "x2": rc[1]["x"], "y2": rc[1]["y"]}) || 
                    this.intersects(c, {"x1": rc[1]["x"], "y1": rc[1]["y"], "x2": rc[2]["x"], "y2": rc[2]["y"]}) ||
                    this.intersects(c, {"x1": rc[2]["x"], "y1": rc[2]["y"], "x2": rc[3]["x"], "y2": rc[3]["y"]}) ||
                    this.intersects(c, {"x1": rc[3]["x"], "y1": rc[3]["y"], "x2": rc[0]["x"], "y2": rc[0]["y"]})) {
                    this.ended = true;
                    var velocity = Math.sqrt((Math.abs(this.vx) * t) ^ 2 + (Math.abs(this.vy) * t) ^ 2);
                    console.log("crash @ " + velocity);
                }
            }
        }
    }

    // returns true if (a["x1"] : a["y1"]) -> (a["x2"] : a["y2"]) intersects with (b["x1"] : b["y1"]) -> (b["x2"] : b["y2"])
    // i think it even returns true for parallel lines although it says different here: https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    // but it works for identical lines too i guess?
    intersects(a, b) {
        let det, gamma, lambda;
        det = (a["x2"] - a["x1"]) * (b["y2"] - b["y1"]) - (b["x2"] - b["x1"]) * (a["y2"] - a["y1"]);
        if (det === 0) return false;
        lambda = ((b["y2"] - b["y1"]) * (b["x2"] - a["x1"]) + (b["x1"] - b["x2"]) * (b["y2"] - a["y1"])) / det;
        gamma = ((a["y1"] - a["y2"]) * (b["x2"] - a["x1"]) + (a["x2"] - a["x1"]) * (b["y2"] - a["y1"])) / det;
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }

    // calculates the rockets outer coords, only needed for internal code
    rocketOuterCoords() {
        let sin = Math.sin(this.rocket["rot"] * Math.PI / 180);
        let cos = Math.cos(this.rocket["rot"] * Math.PI / 180);
        let x = this.rocket["width"] / 2;
        let y = this.rocket["height"] / 2;
        var coords = [{
                "x": x * cos - y * sin + this.rocket["x"] + this.rocket["width"] / 2,
                "y": x * sin + y * cos + this.rocket["y"] + this.rocket["height"]
            },
            {
                "x": (-x) * cos - y * sin + this.rocket["x"] + this.rocket["width"] / 2,
                "y": (-x) * sin + y * cos + this.rocket["y"] + this.rocket["height"]
            },
            {
                "x": (-x) * cos - (-y) * sin + this.rocket["x"] + this.rocket["width"] / 2,
                "y": (-x) * sin + (-y) * cos + this.rocket["y"] + this.rocket["height"]
            },
            {
                "x": x * cos - (-y) * sin + this.rocket["x"] + this.rocket["width"] / 2,
                "y": x * sin + (-y) * cos + this.rocket["y"] + this.rocket["height"]
            }
        ]
        return coords;
    }

    setState(thruster, state) {
        if (thruster in this.thrusterStates) this.thrusterStates[thruster] = state;
    }

    rocketCoords(debug) {
        let res = {
            "x": this.rocket["x"],
            "y": this.rocket["y"],
            "rot": this.rocket["rot"],
            "width": this.rocket["width"],
            "height": this.rocket["height"]
        };
        if (debug) res["dbg"] = this.rocketOuterCoords();
        return res;
    }

    useNextThruster() {
        let id = this.thrusters.findIndex(t => t["connected"] === false);
        if (id == -1) return false;
        this.thrusters[id]["connected"] = true;
        return id;
    }

    disconnectThruster(id) {
        if (id in this.thrusterStates) this.thrusters[id]["connected"] = false;
    }

}