const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const game = require("./game");

var games = [
    new game.game(4), new game.game(5)
]

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    for (let game of games) {
        let port = game.useNextThruster();
        if (port !== false) {
            socket.on("ge", msg => game.setState(port, msg)); // game event
            socket.on("disconnect", msg => game.disconnectThruster(port));
            socket.on("sr", fn => fn(game.rocketCoords())); // state request
            break;
        }
    }
})

http.listen(3000, function() {
    console.log("listening on *:3000");
})

function update() {
    for (let game of games) game.act();
}

setInterval(update, 20);