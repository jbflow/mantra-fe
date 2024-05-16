import {expect, test} from "vitest";
import { ConfirmationParser } from "../confirmationParser";

const confirmationParser = new ConfirmationParser()

test("", () => {
    expect(confirmationParser.extractVerb(3).toBe(""))
})