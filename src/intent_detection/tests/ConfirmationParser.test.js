import {expect, test} from "vitest";
import { ConfirmationParser } from "../confirmationParser";

const confirmationParser = new ConfirmationParser()

test("Test extractVerb converts int 1 to str rename", () => {
    expect(confirmationParser.extractVerb(1).toBe("rename"))
})
test("Test extract verb converts int 2 to str load", () => {
    expect(confirmationParser.extractVerb(2).toBe("load"))
})
test("Test extract verb converts int 3 to str select", () => {
    expect(confirmationParser.extractVerb(3).toBe("select"))
})

test("Test extractNounAdj converts array [3, 1, 0] to str track 1", () =>{
    expect(confirmationParser.extractNounAdj([3,1,0]).toBe("track 1"))
})

test("Test extractNounAdj converts array [3, 1, 0, 10, 2, 0] to str track 1 device 2", () =>{
    expect(confirmationParser.extractNounAdj([3,1,0,10, 2, 0]).toBe("track 1 device 2"))
})

test("Test extractNounAdj converts array [3, 1, 0, 40, 1, 0] to str amp on track 1", () =>{
    expect(confirmationParser.extractNounAdj([]).toBe("amp on track 1"))
})

test("Test extractNounAdj converts array [3, 1, 0, 42, 10, 0] to str pitch on track 1", () =>{
    expect(confirmationParser.extractNounAdj([]).toBe("amp on track 1"))
})

