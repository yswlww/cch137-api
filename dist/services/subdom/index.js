"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../../server");
const random_1 = __importDefault(require("../../utils/random"));
const subdom = {
    ready: true,
    wss: server_1.wss
};
const players = new Map();
class Player {
    constructor() {
        this.x = 127;
        this.y = 127;
        this.rgb = [255, 255, 255];
        let i = 0;
        for (; i < 256; i++) {
            if (!players.has(i))
                break;
        }
        if (i === 256)
            throw 'Too Many Players';
        players.set(i, this);
        this.id = i;
        this.rgb = [random_1.default.randInt(0, 256), random_1.default.randInt(0, 256), random_1.default.randInt(0, 256)];
    }
    get array() {
        return [this.id, this.x, this.y, ...this.rgb];
    }
}
server_1.wss.on('connection', (socket, req) => {
    const player = new Player();
    function broadcastUintArray(uintArray) {
        for (const client of server_1.wss.clients) {
            client.send(Buffer.from(uintArray));
        }
    }
    socket.on('open', () => {
        broadcastUintArray([101, player.id, player.x, player.y]);
        broadcastUintArray([102, player.id, ...player.rgb]);
    });
    socket.on('message', (data, isBinary) => {
        if (!isBinary)
            return;
        const [cmd, ...items] = data;
        switch (cmd) {
            case 100: // init Player
                socket.send(Buffer.from([112, ...player.rgb]));
                players.forEach((p) => {
                    socket.send(Buffer.from([101, p.id, p.x, p.y]));
                    socket.send(Buffer.from([102, p.id, ...p.rgb]));
                });
                break;
            case 101: // Player Move
                const moveCode = items[0];
                switch (moveCode % 10) {
                    case 1:
                        player.x -= 1;
                        break;
                    case 3:
                        player.x += 1;
                        break;
                }
                switch (Math.floor(moveCode / 10)) {
                    case 1:
                        player.y -= 1;
                        break;
                    case 3:
                        player.y += 1;
                        break;
                }
                if (player.x < 0)
                    player.x = 0;
                else if (player.x > 255)
                    player.x = 255;
                if (player.y < 0)
                    player.y = 0;
                else if (player.y > 255)
                    player.y = 255;
                broadcastUintArray([101, player.id, player.x, player.y]);
                break;
            case 102: // Player Change Color
                const [r, g, b] = items;
                player.rgb = [r, g, b];
                broadcastUintArray([102, player.id, ...player.rgb]);
                break;
        }
    });
    socket.on('close', () => {
        players.delete(player.id);
        for (const client of server_1.wss.clients) {
            client.send(Buffer.from([104, player.id]));
        }
    });
});
exports.default = subdom;
