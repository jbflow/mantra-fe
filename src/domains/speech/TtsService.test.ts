import { beforeEach, describe, expect, it, vi } from "vitest";

let speakMock: ReturnType<typeof vi.fn>;

class MockUtterance {
	text: string;
	onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
	onend: ((event: SpeechSynthesisEvent) => void) | null = null;
	onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
	constructor(text: string) { this.text = text; }
}

beforeEach(() => {
	speakMock = vi.fn((utt: SpeechSynthesisUtterance) => {
		utt.onstart?.({} as SpeechSynthesisEvent);
		utt.onend?.({} as SpeechSynthesisEvent);
	});

	Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speak: speakMock, cancel: vi.fn() } });

	if (!("SpeechSynthesisUtterance" in window)) {
		Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
			configurable: true,
			value: MockUtterance as unknown as typeof SpeechSynthesisUtterance
		});
	}
});

import { TtsService } from "./TtsService";

describe("TtsService", () => {
	it("emits start and end events", () => {
		const svc = new TtsService();
		const order: string[] = [];

		svc.on("start", () => order.push("start"));
		svc.on("end", () => order.push("end"));

		svc.speak("hi");
		expect(order).toEqual(["start", "end"]);
	});
});
