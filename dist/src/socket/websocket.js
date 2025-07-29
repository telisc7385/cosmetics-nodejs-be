"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUpdate = exports.initWebSocket = void 0;
const ws_1 = require("ws");
const jwt_1 = require("../utils/jwt");
let wss;
const clients = new Map();
const initWebSocket = (server) => {
    wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token');
            if (!token) {
                ws.close(1008, 'Unauthorized: Token missing');
                return;
            }
            const payload = (0, jwt_1.verifyToken)(token); // ✅ Same as HTTP auth
            const userId = payload.userId;
            clients.set(userId, ws);
            console.log(`✅ WebSocket connected for user ${userId}`);
            ws.on('close', () => {
                clients.delete(userId);
                console.log(`🔌 WebSocket disconnected for user ${userId}`);
            });
            ws.on('error', (err) => {
                console.error(`❌ WebSocket error for user ${userId}:`, err);
                clients.delete(userId);
            });
        }
        catch (err) {
            console.error('❌ WebSocket auth failed:', err);
            ws.close(1008, 'Unauthorized: Invalid token');
        }
    });
};
exports.initWebSocket = initWebSocket;
const notifyUpdate = (userId, message) => {
    const client = clients.get(userId);
    if (client && client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
    }
};
exports.notifyUpdate = notifyUpdate;
