"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const server_1 = require("./server");
const apis_1 = __importDefault(require("./routers/apis"));
const pine_1 = __importDefault(require("./routers/pine"));
const pdf_1 = __importDefault(require("./routers/pdf"));
const mongoose_1 = __importDefault(require("./services/mongoose"));
const subdom_1 = __importDefault(require("./services/subdom"));
(0, dotenv_1.config)();
server_1.app.use('/', apis_1.default);
server_1.app.use('/pine/', pine_1.default);
server_1.app.use('/pdf/', pdf_1.default);
server_1.app.use('*', (req, res) => res.status(404).end());
const port = process.env.PORT || 3000;
server_1.server.listen(port, () => {
    console.log(`Server is listening to http://localhost:${port}`);
    console.log(`Mongoose version: ${mongoose_1.default.version}`);
    if (subdom_1.default.ready)
        console.log('Subdom is ready.');
});
const bson_1 = require("./utils/bson");
console.log(bson_1.packData);
let x, y, z, m = new Map();
let b = new Uint16Array([1, 2, 3]);
let s = new Set([123.04056]);
let d = new Date(2023, 11, 25, 8 + 8, 30);
m.set('x', 1);
m.set('y', 2);
m.set(123, s);
x = { i: 1.1, j: -2.03, c: ['Hello World!', { d: BigInt(96) }], s, m, b, d };
// x = 127
y = (0, bson_1.packData)(x);
z = (0, bson_1.unpackData)(y);
console.log(x);
console.log(y.length);
console.log(z);
