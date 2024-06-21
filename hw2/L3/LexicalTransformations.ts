import { ClassExp, ProcExp, Exp, Program, makeIfExp, IfExp, Binding, makeAppExp, makePrimOp, makeVarDecl, CExp, VarDecl, makeBoolExp, makeProcExp, makeVarRef, isCompoundExp, isProcExp, isProgram, isIfExp, makeProgram, isExp, isLitExp, isAppExp, isLetExp, isClassExp, isDefineExp, makeDefineExp, makeLetExp, makeClassExp, makeBinding, DefineExp, makeLitExp } from "./L3-ast";
import { Result, makeFailure, makeOk} from "../shared/result";
import { isNonEmptyList, rest , first} from "../shared/list";
import { map } from "ramda";
import { makeSymbolSExp } from "./L3-value";

/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/



export const class2proc = (exp: ClassExp): ProcExp => {

    const makeTestCExp = (funcName: VarDecl): CExp =>
        makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeLitExp(makeSymbolSExp(funcName.var))])

    const createBodySequence = (b: Binding, seq: Binding[]): IfExp => 
        isNonEmptyList<Binding>(seq) ? 
                                makeIfExp(makeTestCExp(b.var), makeAppExp(b.val, []), createBodySequence(first(seq), rest(seq))):
                                    makeIfExp(makeTestCExp(b.var), makeAppExp(b.val, []), makeBoolExp(false));
    
                                    
    const body = isNonEmptyList<Binding>(exp.methods) ? 
                                            createBodySequence(first(exp.methods), rest(exp.methods)):
                                                makeBoolExp(false);
    return makeProcExp(exp.fields, [makeProcExp([makeVarDecl("msg")], [body])]);
}


/*
Purpose: Transform all class forms in the given AST to procs
Signature: lexTransform(AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const lexTransform = (exp: Exp | Program): Result<Exp | Program> =>{

    const lexTransformExp = (exp: Exp): Exp =>
        isDefineExp(exp) ? lexTransformDefineExp(exp): lexTransformCExp(exp);

    const lexTransformDefineExp = (exp: DefineExp): DefineExp =>
        makeDefineExp(exp.var, lexTransformCExp(exp.val));

    const lexTransformCExp = (exp: CExp): CExp =>{
        if (isCompoundExp(exp)) {
            if (isLitExp(exp)) {
                return exp;
            } else if (isAppExp(exp)) {
                return makeAppExp(lexTransformCExp(exp.rator), exp.rands.map(lexTransformCExp));
            } else if (isIfExp(exp)) {
                return makeIfExp(lexTransformCExp(exp.test), lexTransformCExp(exp.then), lexTransformCExp(exp.alt));
            } else if (isProcExp(exp)) {
                return makeProcExp(exp.args, exp.body.map(lexTransformCExp));
            } else if (isLetExp(exp)) {
                return makeLetExp(exp.bindings.map(binding => makeBinding(binding.var.var, lexTransformCExp(binding.val))), exp.body.map(lexTransformCExp));
            } else if (isClassExp(exp)) {
                return class2proc(makeClassExp(exp.fields, exp.methods.map(method => makeBinding(method.var.var, lexTransformCExp(method.val)))));
            } else {
                return exp;
            }
        } else return exp;
    }



    if (isProgram(exp)){
        return isNonEmptyList(exp.exps) ? makeOk(makeProgram(map(lexTransformExp, exp.exps))):
                                            makeOk(exp);
    }
    return isExp(exp) ? makeOk(lexTransformExp(exp)): makeFailure("Invalid AST");
}
