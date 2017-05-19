# Complexity

Simple algorithms for checking basic properties of code complexity.

Two design patterns are implemented here:

* A [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern), which is used to build up state and then finally emit.
* A [Visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern), which is used to abstract the process of visiting a data structure such as abstract syntax tree (AST). The only input to be provided is what action to perform at each node.

## Esprima

The [esprima](http://esprima.org/) library is used to parse code and create a static analyzer for basic code complexity metrics.

## Instructions

This repository contains a [stub](https://github.com/gms298/Complexity/blob/master/analysis.js) that parses a javascript file and visits each function. 

1. Run the program and print all the tokens in an ast.

   ```
      npm install
      node analysis.js 
   ```

2. The following calculations are done using one or more visitors (Visitor Pattern):

   * **String Usage**: How many string literals are used in file? (FileBuilder)
   * **ParameterCount**: The number of parameters for functions (FunctionBuilder)
   * **PackageComplexity**: The number of imports used in file.
   * **Returns**: The number of return statements in function. 
   * **AllConditions**: The total number of conditions in file.
   * **SimpleCyclomaticComplexity**: The number of if statements/loops + 1.
   * **MaxMessageChains**: The max length of a message chain in a function. A 		message chain can be formed from a method call (), a data access (.), 		or array access [0].
  
     For example, 
     
     ```
     // Message Chain: 4
     mints.name.toString().split(".")[0];
     ``` 
     
	* **MaxConditions**: The max number of conditions inside one if statement per function.
	* **MaxNestingDepth**: The max depth of scopes (nested ifs, loops, etc) per function.
