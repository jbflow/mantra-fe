import type { MidiActionPayload } from "mantra-engine";

export type TextWorkflowAction = {
	id: string;
	type: "text";
	text: string;
};

export type MidiWorkflowAction = MidiActionPayload & {
	id: string;
	type: "midi";
};

export type WorkflowAction = TextWorkflowAction | MidiWorkflowAction;

export type Workflow = {
	id: string;
	trigger: string;
	enabled: boolean;
	actions: WorkflowAction[];
};

export const WORKFLOWS_STORAGE_KEY = "mantra-fe-workflows";

const makeId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `workflow_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const createWorkflowAction = (type: WorkflowAction["type"]): WorkflowAction =>
	type === "text"
		? { id: makeId(), type: "text", text: "" }
		: {
				id: makeId(),
				type: "midi",
				port: "",
				message: "note_on",
				channel: 1,
				data: 60,
				value: 100
			};

export const createWorkflow = (trigger = "New voice command"): Workflow => ({
	id: makeId(),
	trigger,
	enabled: true,
	actions: []
});

export const DEFAULT_WORKFLOWS: Workflow[] = [
	{
		id: "starter-chorus",
		trigger: "start the chorus",
		enabled: true,
		actions: [{ id: "starter-play", type: "text", text: "play" }]
	}
];

const isMidiMessage = (value: unknown): value is MidiActionPayload["message"] =>
	value === "note_on" ||
	value === "note_off" ||
	value === "control_change" ||
	value === "program_change";

const isWorkflowAction = (value: unknown): value is WorkflowAction => {
	if (!value || typeof value !== "object") return false;
	const action = value as Partial<WorkflowAction>;
	if (typeof action.id !== "string") return false;
	if (action.type === "text") return typeof action.text === "string";
	return (
		action.type === "midi" &&
		typeof action.port === "string" &&
		isMidiMessage(action.message) &&
		typeof action.channel === "number" &&
		typeof action.data === "number" &&
		typeof action.value === "number"
	);
};

const isWorkflow = (value: unknown): value is Workflow => {
	if (!value || typeof value !== "object") return false;
	const workflow = value as Partial<Workflow>;
	return (
		typeof workflow.id === "string" &&
		typeof workflow.trigger === "string" &&
		typeof workflow.enabled === "boolean" &&
		Array.isArray(workflow.actions) &&
		workflow.actions.every(isWorkflowAction)
	);
};

const copyDefaults = (): Workflow[] =>
	DEFAULT_WORKFLOWS.map((workflow) => ({
		...workflow,
		actions: workflow.actions.map((action) => ({ ...action }))
	}));

export const parseWorkflows = (serialized: string | null): Workflow[] => {
	if (!serialized) return copyDefaults();
	try {
		const parsed: unknown = JSON.parse(serialized);
		return Array.isArray(parsed) && parsed.every(isWorkflow) ? parsed : copyDefaults();
	} catch {
		return copyDefaults();
	}
};

export const normalizeTrigger = (text: string) => text.trim().toLocaleLowerCase();

export const moveWorkflowAction = <T>(actions: T[], index: number, offset: -1 | 1): T[] => {
	const destination = index + offset;
	if (index < 0 || index >= actions.length || destination < 0 || destination >= actions.length) {
		return [...actions];
	}
	const reordered = [...actions];
	[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
	return reordered;
};
