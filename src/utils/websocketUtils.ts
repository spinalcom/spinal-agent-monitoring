import { LOG_STREAM_EVENT_TYPE, PM2_PROCESS_EVENT_TYPE, websocketEventTypes } from "./constants";

export function isValidMessage(message: any): boolean {
	try {
		if (typeof message === "string") message = JSON.parse(message);

		if (typeof message !== "object" || message === null) return false;
		if (!("type" in message) || !websocketEventTypes.includes(message.type)) return false;
		if (!isValidDataForType(message.type, message.data)) return false;
		return true;
	} catch (error) {
		return false;
	}
}

function isValidDataForType(type: string, data: any): boolean {
	switch (type) {
		// case PM2_PROCESS_EVENT_TYPE:

		case LOG_STREAM_EVENT_TYPE:
			return typeof data === "object" && ["number", "string"].includes(typeof data.id);

		default:
			return true; // For other types, assume valid for now
	}
}
