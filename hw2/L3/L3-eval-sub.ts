// L3-eval.ts
import { map } from "ramda";
import { Binding, ClassExp, isCExp, isClassExp, isLetExp, makeClassExp } from "./L3-ast";
import { BoolExp, CExp, Exp, IfExp, LitExp, NumExp,
         PrimOp, ProcExp, Program, StrExp, VarDecl } from "./L3-ast";
import { isAppExp, isBoolExp, isDefineExp, isIfExp, isLitExp, isNumExp,
             isPrimOp, isProcExp, isStrExp, isVarRef } from "./L3-ast";
import { makeBoolExp, makeLitExp, makeNumExp, makeProcExp, makeStrExp } from "./L3-ast";
import { parseL3Exp } from "./L3-ast";
import { applyEnv, makeEmptyEnv, makeEnv, Env } from "./L3-env-sub";
import { isClosure, makeClosure, Closure, Value, Class, makeClass, isClass, CObject, makeCObject, isCObject, isSymbolSExp, makeClosureEnv } from "./L3-value";
import { first, rest, isEmpty, List, isNonEmptyList, allT } from '../shared/list';
import { isBoolean, isNumber, isString } from "../shared/type-predicates";
import { Result, makeOk, makeFailure, bind, mapResult, mapv } from "../shared/result";
import { renameExps, substitute } from "./substitute";
import { applyPrimitive } from "./evalPrimitive";
import { parse as p } from "../shared/parser";
import { Sexp } from "s-expression";
import { format } from "../shared/format";

// ========================================================
// Eval functions

const L3applicativeEval = (exp: CExp, env: Env): Result<Value> =>
    isNumExp(exp) ? makeOk(exp.val) : 
    isBoolExp(exp) ? makeOk(exp.val) :
    isStrExp(exp) ? makeOk(exp.val) :
    isPrimOp(exp) ? makeOk(exp) :
    isVarRef(exp) ? applyEnv(env, exp.var) :
    isLitExp(exp) ? makeOk(exp.val) :
    isIfExp(exp) ? evalIf(exp, env) :
    isProcExp(exp) ? evalProc(exp, env) :
    isClassExp(exp) ? evalClass(exp): //L31
    isAppExp(exp) ? bind(L3applicativeEval(exp.rator, env), (rator: Value) =>
                        bind(mapResult(param => L3applicativeEval(param, env), exp.rands), (rands: Value[]) =>
                                L3applyProcedure(rator, rands, env))) :
    isLetExp(exp) ? makeFailure('"let" not supported (yet)') :
    makeFailure('Never');

export const isTrueValue = (x: Value): boolean =>
    ! (x === false);

const evalIf = (exp: IfExp, env: Env): Result<Value> =>
    bind(L3applicativeEval(exp.test, env), (test: Value) => 
        isTrueValue(test) ? L3applicativeEval(exp.then, env) : 
        L3applicativeEval(exp.alt, env));

const evalProc = (exp: ProcExp, env: Env): Result<Closure> =>
    makeOk(makeClosure(exp.args, exp.body));

// L31
const evalClass = (exp: ClassExp): Result<Class> =>
    makeOk(makeClass(exp.fields, exp.methods));

const L3applyProcedure = (proc: Value, args: Value[], env: Env): Result<Value> =>
    isPrimOp(proc) ? applyPrimitive(proc, args) :
    isClass(proc) ? applyClass(proc, args) :
    isCObject(proc) ? applyCObject(proc, args, env) :
    isClosure(proc) ? applyClosure(proc, args, env) :
    makeFailure(`Bad procedure ${format(proc)}`);

// Applications are computed by substituting computed
// values into the body of the closure.
// To make the types fit - computed values of params must be
// turned back in Literal Expressions that eval to the computed value.
const valueToLitExp = (v: Value): NumExp | BoolExp | StrExp | LitExp | PrimOp | ProcExp | ClassExp =>
    isNumber(v) ? makeNumExp(v) :
    isBoolean(v) ? makeBoolExp(v) :
    isString(v) ? makeStrExp(v) :
    isPrimOp(v) ? v :
    isClosure(v) ? makeProcExp(v.params, v.body) :
    isClass(v) ? makeClassExp(v.fields, v.methods) :
    makeLitExp(v);

const applyClosure = (proc: Closure, args: Value[], env: Env): Result<Value> => {
    const vars = map((v: VarDecl) => v.var, proc.params);
    const body = renameExps(proc.body);
    const litArgs : CExp[] = map(valueToLitExp, args);
    return evalSequence(substitute(body, vars, litArgs), env);
    //return evalSequence(substitute(proc.body, vars, litArgs), env);
}

// L31

export const applyClass = (cls: Class, args: Value[]): Result<CObject> => {
    const procs: CExp[] = cls.methods.map(method => method.val);
    const vars: string[] = map(((field: VarDecl) => field.var), cls.fields);
    const funcNames: string[] = map(((method: Binding) => method.var.var), cls.methods);
    const renamedProcs = renameExps(procs);
    const appliedProcs = substitute(renamedProcs, vars, map(valueToLitExp, args))
    if (!allT(isProcExp, appliedProcs)){
        throw new Error("All methods must be ProcExp"); // TODO makeFailure instead
    }
    const closures =  map(((proc: ProcExp) => makeClosure(proc.args, proc.body)), appliedProcs);
    return makeOk(makeCObject(funcNames, closures));
}
    

export const applyCObject = (obj: CObject, args: Value[], env: Env): Result<Value> => {
    if (args.length === 0) {
        return makeFailure("No function name provided");
    }
    const name = args[0];
    if (!isSymbolSExp(name)) {
        return makeFailure("Function name is not a symbol");
    }
    const funcName = name.val;
    if (!obj.funcNames.includes(funcName)) {
        return makeFailure(`Unrecognized method: ${funcName}`);
    }
    
    const closureIndex = obj.funcNames.indexOf(funcName);
    const closure = obj.closures[closureIndex];
    
    return applyClosure(closure, args.slice(1), env);
}

// Evaluate a sequence of expressions (in a program)
export const evalSequence = (seq: List<Exp>, env: Env): Result<Value> =>
    isNonEmptyList<Exp>(seq) ? 
        isDefineExp(first(seq)) ? evalDefineExps(first(seq), rest(seq), env) :
        evalCExps(first(seq), rest(seq), env) :
    makeFailure("Empty sequence");

const evalCExps = (first: Exp, rest: Exp[], env: Env): Result<Value> =>
    isCExp(first) && isEmpty(rest) ? L3applicativeEval(first, env) :
    isCExp(first) ? bind(L3applicativeEval(first, env), _ => 
                            evalSequence(rest, env)) :
    makeFailure("Never");

// Eval a sequence of expressions when the first exp is a Define.
// Compute the rhs of the define, extend the env with the new binding
// then compute the rest of the exps in the new env.
const evalDefineExps = (def: Exp, exps: Exp[], env: Env): Result<Value> =>
    isDefineExp(def) ? bind(L3applicativeEval(def.val, env), 
                            (rhs: Value) => 
                                evalSequence(exps, 
                                    makeEnv(def.var.var, rhs, env))) :
    makeFailure(`Unexpected in evalDefine: ${format(def)}`);

// Main program
export const evalL3program = (program: Program): Result<Value> =>
    evalSequence(program.exps, makeEmptyEnv());

export const evalParse = (s: string): Result<Value> =>
    bind(p(s), (sexp: Sexp) => 
        bind(parseL3Exp(sexp), (exp: Exp) =>
            evalSequence([exp], makeEmptyEnv())));
