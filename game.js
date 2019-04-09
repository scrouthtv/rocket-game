const thrusterForce = .28;
const gravity = .2;
const rotationMultiplier = 1/15;

module.exports.game = class game {
    constructor(thrusterAmount) {
        this.stage = { "width": 1920, "height": 1080 }
        // rotation in degrees: 0...360; 180 means straight upwards
        this.rocket = { "width": 64, "height": 72, "rot": 180 }
        this.rocket["x"] = (this.stage["width"] - this.rocket["width"]) / 2;
        this.rocket["y"] = this.stage["height"] - this.rocket["height"] - 20;
        this.rocket["cx"] = this.rocket["width"] / 2; // to remove later on
        this.rocket["cy"] = this.rocket["height"] / 2; // this too
        
        this.thrusters = [];
        this.thrusterStates = [];

        let dist = Math.floor((this.rocket["width"] - 3) / thrusterAmount);
        let start = this.rocket["width"] - dist * thrusterAmount;
        for (let i = 0; i < thrusterAmount; i++) {
            this.thrusters[i] = {"x": start + i * dist, "y": 10, "connected": false};
            this.thrusterStates[i] = false;
        }

        this.collisions = [
            {"x1": 0, "x2": this.stage["width"], "y1": 0, "y2": 0},
            {"x1": 0, "x2": this.stage["width"], "y1": this.stage["height"], "y2": this.stage["height"]},
            {"x1": 0, "x2": 0, "y1": 0, "y2": this.stage["height"]},
            {"x1": this.stage["width"], "x2": this.stage["width"], "y1": 0, "y2": this.stage["height"]}
        ]

        this.lastTime = Date.now();
        this.vx = 0; this.vy = 0;
        this.started = false; this.ended = false;
    }

    act() {
        let t = (Date.now() - this.lastTime) / 1000;
        this.lastTime = Date.now();
        let fm = 0; // force multiplier
        let fx = 0, fy = 0; // force loc
        for (const [key, value] of Object.entries(this.thrusterStates)) {
            if (value) {
                fm++;
                fx += this.thrusters[key]["x"];
                fy += this.thrusters[key]["y"];
            }
        }
        if (fm > 0) {
            this.started = true;
            let fcX = fx / fm; let fcY = fy / fm; // linear force center coords
            let am = this.rocket["cx"] - fcX; // angular movement factor
            let accX = - Math.sin(this.rocket["rot"] * Math.PI / 180) * thrusterForce * fm;
            let accY = Math.cos(this.rocket["rot"] * Math.PI / 180) * thrusterForce * fm;
            this.rocket["rot"] += am * rotationMultiplier;
            this.vx += accX * t; this.vy += accY * t;
        }
        if (this.started) this.vy += gravity * t;
        console.log(this.vy);
        this.rocket["x"] += this.vx * t * 1000; // TODO const this number
        this.rocket["y"] += this.vy * t * 1000;
    }

    setState(thruster, state) {
        if (thruster in this.thrusterStates) this.thrusterStates[thruster] = state;
    }

    rocketCoords() {
        return {
            "x": this.rocket["x"], "y": this.rocket["y"], "rot": this.rocket["rot"],
            "width": this.rocket["width"], "height": this.rocket["height"],
            "sw": this.stage["width"], "sh": this.stage["height"]
        };
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