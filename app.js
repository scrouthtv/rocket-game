const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const game = require("./game");

var games = [
    new game.game()
]

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    console.log("someone connected");
})

http.listen(3000, function() {
    console.log("listening on *:3000");
})