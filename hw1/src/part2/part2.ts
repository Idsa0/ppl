import * as R from "ramda";

const stringToArray = R.split("");

/* Question 1 */
export const countVowels: (str: string) => number = (str: string) =>
    stringToArray(str)
        .filter(x => x === 'a' || x === 'e' || x === 'i' || x === 'o' || x === 'u' || x === 'A' || x === 'E' || x === 'I' || x === 'O' || x === 'U')
        .length;

/* Question 2 */
const isPairedHelper: (acc: string, curr: string) => string = (acc: string, curr: string) =>
    curr === '(' || curr === '{' || curr === '[' ? acc.concat(curr) :
        curr === ')' && acc[acc.length - 1] === '(' ? acc.slice(0, acc.length - 1) :
            curr === '}' && acc[acc.length - 1] === '{' ? acc.slice(0, acc.length - 1) :
                curr === ']' && acc[acc.length - 1] === '[' ? acc.slice(0, acc.length - 1) : acc.concat("0");

export const isPaired: (str: string) => boolean = (str: string) =>
    stringToArray(str)
        .filter(x => x === '(' || x === '{' || x === '[' || x === ')' || x === '}' || x === ']')
        .reduce((acc, curr) => isPairedHelper(acc, curr), "").length === 0;

/* Question 3 */
export type WordTree = {
    root: string;
    children: WordTree[];
}

export const treeToSentence: (wt: WordTree) => string = (wt: WordTree) =>
    wt.children.length === 0 ? wt.root : wt.root.concat(" ").concat(wt.children.map(x => treeToSentence(x)).join(" "));
