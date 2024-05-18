import {expect, test} from "vitest";
import { ConfirmationParser } from "../confirmationParser";

const confirmationParser = new ConfirmationParser()


test("Test buildNounAdj converts [3, 1, 0] to string() 'track_1'", () => {
    expect(confirmationParser.buildNounAdj([3,1,0])).toBe("track_1")
})

test("Test extractVerb converts int() 1 to string() 'rename'", () => {
    expect(confirmationParser.extractVerb(1)).toBe("rename")
})
test("Test extractVerb converts int() 2 to string() 'load'", () => {
    expect(confirmationParser.extractVerb(2)).toBe("load")
})
test("Test extractVerb converts int() 3 to string() 'select'", () => {
    expect(confirmationParser.extractVerb(3)).toBe("select")
})

test("Test extractNounAdj converts array() [3, 1, 0] to obj() {subject: 'track_1', path: ''}", () =>{
    expect(confirmationParser.extractNounAdj([3,1,0])).toStrictEqual({subject: "track_1", path: ""})
})

test("Test extractNounAdj converts array() [3, 1, 0, 10, 2, 0] to obj() {subject: 'device_2', path: 'track_1'}", () =>{
    expect(confirmationParser.extractNounAdj([3,1,0,10,2,0])).toStrictEqual({subject: "device_2", path: "track_1"})
})

test("Test extractNounAdj converts array() [3, 1, 0, 10, 2, 0, 22, 10, 0] to obj() {subject: 'parameter_10', path: 'track_1_device_2'}", () =>{
    expect(confirmationParser.extractNounAdj([3, 1, 0, 10, 2, 0, 22, 10, 0])).toStrictEqual({subject: "parameter_10", path: "track_1_device_2"})
})

test("Test extractNounAdj converts array() [3, 1, 0, 40, 1, 0] to obj() {subject: 'audioDevice_1', path: 'track_1'}", () =>{
    expect(confirmationParser.extractNounAdj([3, 1, 0, 40, 1, 0])).toStrictEqual({subject: "audioDevice_1", path: "track_1"})
})

test("Test extractNounAdj converts array() [3, 1, 0, 42, 10, 0] to obj() {subject: 'midiDevice_10', path: 'track_1'}", () =>{
    expect(confirmationParser.extractNounAdj([3, 1, 0, 41, 10, 0])).toStrictEqual({subject: "midiDevice_10", path: "track_1"})
})

