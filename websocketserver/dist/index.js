"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer();
const wss = new ws_1.WebSocketServer({ server });
const set = new Set();
const playerpostions = {};
wss.on("connection", (ws) => {
    console.log(" coneection has beenn made again ... again the connection has been made");
    console.log("Client connected");
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            console.log("id are ");
            set.forEach((data) => {
                console.log(data.id);
            });
            //  console.log(data)
            if (data.event == "call" || data.event == "accept") {
                const id = data.id;
                console.log("id of the user is ", id);
                set.forEach((dataa) => {
                    if (dataa.id == id) {
                        console.log("sending the data to the user");
                        console.log(dataa.id);
                        dataa.client.send(JSON.stringify(data));
                    }
                });
                return;
            }
            //   if (data.event == "accept"){
            //     const id = data.id
            //     if (id){
            //         set.forEach((dataa)=>{
            //             if (dataa.id == id ){
            //                dataa.client.send(JSON.stringify(data))
            //             }
            //         })
            //     return
            //  }
            if (data.event == "connect") {
                playerpostions[data.id] = {
                    x: data.x,
                    y: data.y
                };
                set.add({ client: ws, id: data.id });
                console.log("Positions of the player is >>.");
                console.log(playerpostions);
            }
            else if (data.event == "move") {
                console.log("player moved");
                playerpostions[data.id].x = data.x;
                playerpostions[data.id].y = data.y;
                console.log(playerpostions);
            }
            set.forEach((dataa) => {
                if (dataa.client != ws) {
                    // solve issue here
                    console.log("client is a different one");
                }
                else if (dataa.client == ws) {
                    console.log("client is the same one");
                }
                dataa.client.send(JSON.stringify({ direction: data.direction, movedplayer: dataa.id, id: data.id, playerpostions: playerpostions }));
            });
        }
        catch (err) {
            console.log(err);
        }
    });
    ws.on("close", () => {
        set.forEach((data) => {
            if (data.client == ws) {
                delete playerpostions[data.id];
                set.delete(data);
                console.log("client removed");
            }
        });
    });
});
server.listen((8001), () => {
    console.log("Listening to the port 8001");
});
