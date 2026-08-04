export declare const config: {
    spinalConnector: {
        protocol: string | undefined;
        user: string | undefined;
        password: string | undefined;
        host: string | undefined;
        port: string | undefined;
    };
    monitoringApiConfig: {
        organName: string | undefined;
        serverPort: string | undefined;
        systemInfoIntervalMs: string | number;
    };
    zabbixConfig: {
        enabled: boolean;
        serverHost: string | undefined;
        serverPort: string | number;
        hostName: string | undefined;
        pushIntervalMs: string | number;
        retryBaseMs: string | number;
        retryMaxMs: string | number;
    };
};
export declare function getConfig(): {
    monitoringPath: string;
    updateInterval: number;
    cpuAlertThreshold: number;
};
export default config;
