/*
 * **********************************************
 * Printing result depth
 *
 * You can enlarge it, if needed.
 * **********************************************
 */
maximum_printing_depth(100).

/*
:- current_prolog_flag(toplevel_print_options, A),
   (select(max_depth(_), A, B), ! ; A = B),
   maximum_printing_depth(MPD),
   set_prolog_flag(toplevel_print_options, [max_depth(MPD)|B]).
*/

edge(a,b).
edge(a,c).
edge(c,b).
edge(c,a).


% Signature: path(Node1, Node2, Path)/3
% Purpose: Path is a path, denoted by a list of nodes, from Node1 to Node2.

path(Node1, Node2, [Node1, Node2]) :- edge(Node1, Node2).
path(Node1, Node2, [Node1|Path]) :- edge(Node1, Node3), path(Node3, Node2, Path).


% Signature: cycle(Node, Cycle)/2
% Purpose: Cycle is a cyclic path, denoted a list of nodes, from Node1 to Node1.

cycle(Node, Cycle) :- path(Node, Node, Cycle).


% Signature: reverse(Graph1,Graph2)/2
% Purpose: The edges in Graph1 are reversed in Graph2

reverse_edge([A, B], [B, A]).

reverse([], []).
reverse([E1|Graph1], [E2|Graph2]) :- reverse_edge(E1, E2), reverse(Graph1, Graph2).


% Signature: degree(Node, Graph, Degree)/3
% Purpose: Degree is the degree of node Node, denoted by a Church number (as defined in class)

degree(_, [], zero).
degree(Node,[[Node,_]|Rest], s(Degree):- degree(Node, Rest, Degree).
degree(Node, [_|Rest], Degree) :- degree(Node, Rest, Degree).