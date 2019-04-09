module.exports.game = class game {
    constructor() {
        this.stageWidth = 1920;
        this.stageHeight = 1080;
        this.rocketWidth = 64;
        this.rocketHeight = 72;
        this.rocketX = (this.stageWidth - this.rocketWidth);
        console.log(this.rocketX);
    }
}