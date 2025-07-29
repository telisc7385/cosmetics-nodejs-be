"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const websocket_1 = require("./socket/websocket");
const PORT = process.env.PORT || 5000;
const server = (0, http_1.createServer)(app_1.default);
(0, websocket_1.initWebSocket)(server);
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
