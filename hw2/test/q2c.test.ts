import { expect } from 'chai';
import { unparseL3, parseL3, parseL3Exp } from '../L3/L3-ast';
import { lexTransform } from '../L3/LexicalTransformations';
import { makeOk, bind, isFailure } from '../shared/result';
import { parse as p } from "../shared/parser";

describe('Q2C Tests', () => {

    it('trnasform class-exp to proc-exp', () => {
          expect(bind(bind(bind(p(`(class (a b) ((first (lambda () a)) (second (lambda () b)) (sum (lambda () (+ a b)))))`), parseL3Exp), lexTransform),  x=>makeOk(unparseL3(x)))).to.deep.equal(makeOk(`(lambda (a b) (lambda (msg) (if (eq? msg 'first) ((lambda () a) ) (if (eq? msg 'second) ((lambda () b) ) (if (eq? msg 'sum) ((lambda () (+ a b)) ) #f)))))`));
     });

     it('trnasform class-exp program to proc-exp', () => {
          expect(bind(bind(parseL3(`(L3 (define pair (class (a b) ((first (lambda () a)) (second (lambda () b)) (sum (lambda () (+ a b)))))) (let ((p12 (pair 1 2)) (p34 (pair 3 4))) (if (> (p12 'first) (p34 'second)) #t #f)))`), lexTransform),  x=>makeOk(unparseL3(x)))).to.deep.equal(makeOk(`(L3 (define pair (lambda (a b) (lambda (msg) (if (eq? msg 'first) ((lambda () a) ) (if (eq? msg 'second) ((lambda () b) ) (if (eq? msg 'sum) ((lambda () (+ a b)) ) #f)))))) (let ((p12 (pair 1 2)) (p34 (pair 3 4))) (if (> (p12 'first) (p34 'second)) #t #f)))`));
     });
     
});