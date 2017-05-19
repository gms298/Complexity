# Complexity

Simple algorithms for checking basic properties of code complexity.

Two design patterns are implemented here:

* A [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern), which is used to build up state and then finally emit.
* A [Visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern), which is used to abstract the process of visiting a data structure such as abstract syntax tree (AST). The only input to be provided is what action to perform at each node.

## Esprima

The [esprima](http://esprima.org/) library is used to parse code and create a static analyzer for basic code complexity metrics.



