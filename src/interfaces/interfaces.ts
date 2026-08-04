import { Lst, Model, Str } from "spinal-core-connectorjs";

export interface ILog {
	timeStamp: number;
	message: string;
}

export interface IControlAction {
	actionType: string; // "restart", "stop", "start", "update"
	targetId: string; // ID du processus ciblé
	status: string; // "pending", "processing", "completed", "failed"
	timestamp: string; // Quand l'action a été demandée
	result: string; // Résultat de l'action
}

export interface IGenericOrganData extends ISystemMetrics {
	id: string;
	name: string;
	type: string;
	bootTimestamp: number;
	lastHealthTime: number;
	serverName: string;
	version: string;
	logList: ILog[];
	controlActions: IControlAction[];
}

export interface ISystemMetrics {
	cpuUsage: string;
	ramUsage: string;
	totalRam: string;
	ramUsagePercent?: string;
	freeRam: string;
	totalDisk: string;
	freeDisk: string;
	diskUsage: string;
	diskUsagePercent?: string;
	macAddress?: string;
	ipAddress?: string;
}

export interface IProcessInfo {
	id?: string;
	pid?: number;
	pm_id?: number;
	name?: string;
}

// ✅ Nouvelle interface pour les processus PM2
export interface IPM2Process {
	pid: number;
	pm2_id: number;
	name: string;
	status: string;
	alias: string;
	path: string;
	createdAt: number;
	lastUptime: number;
	memory: number;
	cpu: number;
	restarts: number;
}

// ✅ Interface pour les commandes
export interface IRestartCommand {
	targetId: string;
	targetType: string;
	execute: number;
	status: string;
	lastExecuted: string;
	error: string;
}

export interface IRefreshCommand {
	execute: number;
	status: string;
	lastExecuted: string;
}

export interface ICommands {
	restartProcess: IRestartCommand;
	refreshProcesses: IRefreshCommand;
}
