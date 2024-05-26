import { countVowels, isPaired, treeToSentence, WordTree } from "../../src/part2/part2";

describe("Assignment 1 Part 2", () => {
    describe("countVowels", () => {
        it("counts letters", () => {
            expect(countVowels("aaabbbb")).toEqual(3);
        });
        it("counts letters", () => {
            expect(countVowels("AaaBbbb")).toEqual(3);
        });
        it("counts letters", () => {
            expect(countVowels("ABbbaab")).toEqual(3);
        });
        it("counts letters", () => {
            expect(countVowels("I am robot")).toEqual(4);
        });
        it("counts letters", () => {
            expect(countVowels("abcABCaabbcc d")).toEqual(4);
        });
    });

    describe("isPaired", () => {
        it("returns true for a string with paired parens", () => {
            expect(isPaired("([{}])")).toBe(true);
        });
        it("returns true for a string with paired parens", () => {
            expect(isPaired("This is ([some]) {text}.")).toBe(true);
        });
        it("returns true for a string with paired parens", () => {
            expect(isPaired("No parens, no problems.")).toBe(true);
        });
        it("returns true for a string with paired parens", () => {
            expect(isPaired("[](){}")).toBe(true);
        });

        it("returns false when the parens are not paired", () => {
            expect(isPaired("(]")).toBe(false);
            expect(isPaired("This is ]some[ }text{")).toBe(false);
            expect(isPaired("(")).toBe(false);
            expect(isPaired(")(")).toBe(false);
            expect(isPaired("())")).toBe(false);
        });
    });

    describe("treeToSentence", () => {
        it("Represents a tree as a sentence", () => {
            const t1: WordTree = {root:"hello", children:[{root: "world", children:[]}]}
            expect(treeToSentence(t1)).toBe("hello world");
        });

        it("Represents a tree as a sentence", () => {
            const t2: WordTree = {root:"hello", children:[{root: "there", children:[]}, {root:"!", children:[]}]}
            expect(treeToSentence(t2)).toBe("hello there !");
        });
        it("Represents a tree as a sentence", () => {
            const t3: WordTree = {root:"hello", children:[{root: "there", children:[{root:"!", children:[]}]}]}
            expect(treeToSentence(t3)).toBe("hello there !");
        });
        it("Represents a tree as a sentence", () => {
            const t4: WordTree = {root:"hello", children:[]}
            expect(treeToSentence(t4)).toBe("hello");
        });
        it("Represents a tree as a sentence", () => {
            const t5: WordTree = {root:"", children:[]}
            expect(treeToSentence(t5)).toBe("");
        });
    });
});

