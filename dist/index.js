"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const server_1 = require("./server");
const apis_1 = __importDefault(require("./routers/apis"));
const pine_1 = __importDefault(require("./routers/pine"));
const mongoose_1 = __importDefault(require("./services/mongoose"));
(0, dotenv_1.config)();
server_1.app.use('/', apis_1.default);
server_1.app.use('/pine/', pine_1.default);
server_1.app.use('*', (req, res) => res.status(404).end());
const port = process.env.PORT || 3000;
server_1.server.listen(port, () => {
    console.log(`Server is listening to http://localhost:${port}`);
    console.log(`Mongoose version: ${mongoose_1.default.version}`);
});
