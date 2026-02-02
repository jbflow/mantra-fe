import { beforeEach, describe, expect, it, vi } from "vitest";

let speakMock = vi.fn();

beforeEach(() => {
	speakMock = vi.fn((utt: SpeechSynthesisUtterance) => {
		utt.onstart?.({} as SpeechSynthesisEvent);
		utt.onend?.({} as SpeechSynthesisEvent);
	});

	(window as any).speechSynthesis = { speak: speakMock, cancel: vi.fn() };

	if (!("SpeechSynthesisUtterance" in window)) {
		(window as any).SpeechSynthesisUtterance = class {
			public text: string;
			public onstart?: (e: SpeechSynthesisEvent) => void;
			public onend?: (e: SpeechSynthesisEvent) => void;
			public onerror?: (e: SpeechSynthesisEvent) => void;
			constructor(text: string) {
				this.text = text;
			}
		};
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
