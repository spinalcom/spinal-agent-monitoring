"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidMessage = isValidMessage;
const constants_1 = require("./constants");
function isValidMessage(message) {
    try {
        if (typeof message === "string")
            message = JSON.parse(message);
        if (typeof message !== "object" || message === null)
            return false;
        if (!("type" in message) || !constants_1.websocketEventTypes.includes(message.type))
            return false;
        if (!isValidDataForType(message.type, message.data))
            return false;
        return true;
    }
    catch (error) {
        return false;
    }
}
function isValidDataForType(type, data) {
    switch (type) {
        // case PM2_PROCESS_EVENT_TYPE:
        case constants_1.LOG_STREAM_EVENT_TYPE:
            return typeof data === "object" && ["number", "string"].includes(typeof data.id);
        default:
            return true; // For other types, assume valid for now
    }
}
//# sourceMappingURL=websocketUtils.js.map