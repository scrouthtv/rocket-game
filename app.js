const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const game = require("./game");

var games = [
    new game.game(4)//, new game.game(5)
]

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    var i = 0;
    for (let game of games) {
        i++;
        let port = game.useNextThruster();
        if (port !== false) {
            console.log("someone registered on #" + i + ":" + port);
            socket.on("ge", msg => game.setState(port, msg)); // game event
            socket.on("sr", fn => fn(game.rocketCoords())); // state request
            socket.on("disconnect", msg => {
                game.disconnectThruster(port)
                console.log("#" + i + ":" + port + " disconnected");
            });
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