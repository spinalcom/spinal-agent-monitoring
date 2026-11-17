import { ISystemMetrics } from "../interfaces/interfaces";
export declare function getDefaultSystemMetrics(): ISystemMetrics;
export declare function isLocalAddress(ipAddress: string): boolean;
export declare function getIpAddress(): string;
export declare function getHubInfo(): {
    host: string;
    port: number;
} | null;
