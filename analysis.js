var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var a=0;
var b=0;

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["mystery.js"];
	}
	var filePath = args[0];
	
	complexity(filePath);

	// Report
	for( var node in builders )
	{
		var builder = builders[node];
		builder.report();
	}

}

var builders = {};

// Represent a reusable "class" following the Builder pattern.
function FunctionBuilder()
{
	this.StartLine = 0;
	this.FunctionName = "";
	// Number of if statements/loops + 1
	this.SimpleCyclomaticComplexity = 0;
	// The max depth of scopes (nested ifs, loops, etc)
	this.MaxNestingDepth = 0;
	// The max number of conditions if one decision statement.
	this.MaxConditions = 0;
	// The number of parameters for function.
	this.ParameterCount = 0;
	// The number of return statements in function.
	this.ReturnCount = 0;
	// The max length of a message chain in a function.
	this.MaxMessageChains = 0;

	this.report = function()
	{
		console.log(
		   (
		   	"{0}(): {1}\n" +
		   	"============\n" +
			   "FunctionSimpleCyclomaticComplexity: {2}\t" +
				"MaxNestingDepth: {3}\t" +
				"MaxConditions: {4}\t" +
				"Parameters: {5}\t\t" +
				"Return Count: {6}\t\t" +
				"MaxMessageChains: {7}\n\n"
			)
			.format(this.FunctionName, this.StartLine,
				     this.SimpleCyclomaticComplexity+1, this.MaxNestingDepth,
			        this.MaxConditions, this.ParameterCount, this.ReturnCount, this.MaxMessageChains)
		);
	}
};

// A builder for storing file level information.
function FileBuilder()
{
	this.FileName = "";
	// Number of strings in a file.
	this.Strings = 0;
	// Number of imports in a file.
	this.ImportCount = 0;
	// The total number of conditions in file.
	this.AllConditions = 0;

	this.report = function()
	{
		console.log (
			( "{0}\n" +
			  "~~~~~~~~~~~~\n"+
			  "ImportCount {1}\t" +
			  "Strings {2}\t" +
			  "All Conditions {3}\n"
			).format( this.FileName, this.ImportCount, this.Strings, this.AllConditions));

	}
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}

function complexity(filePath)
{
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);

	//Declaring temporary variables used in computation of metrics
	var temp = 0;
	var temp_result = 0;
	var temp_result_1 = 0;
	var temp_result_2 = 0;
	var temp_result_3 = 0;
	var i = 0;
	var j = 0;
	var k = 0;
	var l = 0;
	var count_mc = 0;
	var count_max = 0;
	var count_all = 0;

	
	// A file level-builder:
	var fileBuilder = new FileBuilder();
	fileBuilder.FileName = filePath;
	fileBuilder.ImportCount = 0;
	fileBuilder.Strings = 0;
	fileBuilder.AllConditions = 0;
	builders[fileBuilder.filePath] = fileBuilder;

	// Tranverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{	
		if (node.type === 'FunctionDeclaration') 
		{	
			var builder = new FunctionBuilder();
			builder.FunctionName = functionName(node);
			builder.StartLine    = node.loc.start.line;

			// Calculating the number of parameters for this function.
			builder.ParameterCount = node.params.length;

			// Initializing all metrics count as 0 for this function.
			builder.SimpleCyclomaticComplexity = 0;
			builder.ReturnCount = 0;
			builder.MaxConditions = 0;
			builder.MaxMessageChains = 0;
			builder.MaxNestingDepth = 0;

			// Initializing the temporary variables (as 0) - used to calculate the required metrics, for this function.
			temp = 0;
			temp_result=0;
			temp_result_1 = 0;
			temp_result_2 = 0;
			temp_result_3 = 0;
			count_mc = 0;
			count_max = 0;
			count_all = 0;
			i = 0;
			j = 0;
			k = 0;
			l = 0;
			
			// Metric calculations
			traverseWithParents(node, function (child) 
			{
				// Calculating Simple cyclomatic complexity for this function.
				if (isDecision(child))
					{	
						builder.SimpleCyclomaticComplexity+=1;
					}

				// Calculating the return statement count for this function.
				if(child.type === 'ReturnStatement')
					{
						builder.ReturnCount+=1;
					}

				// Calculating the max length of a message chain in a function.
				if (child.type === 'ExpressionStatement' && (child.expression.type === 'MemberExpression'|| child.expression.type === 'CallExpression'))
					{
						traverseWithParents(child, function (grandchild) 
							{
								if(grandchild.type === 'ExpressionStatement')
									{
										l=0;
									}
								if(grandchild.type === 'MemberExpression')
									{
										l+=1;
									}
								temp_result = Math.max(temp_result,l);

							});
						builder.MaxMessageChains = temp_result;
						count_mc+=1;
					}

				 //BONUS: Calculating the max nesting depth
				if (isDecision(child))
					{
						j=0;
						if(temp >= 0)
							{
								traverseWithParents(child, function (grandchild) 
									{

										if(isDecision(grandchild))
											{
												j+=1;
												temp_result_1 = Math.max(temp_result_1,j);
											}
									});
								temp+=1;
								builder.MaxNestingDepth = temp_result_1;
							}
					}

				// BONUS: Calculating the max no of conditions in one if statement
				if (child.type == 'IfStatement')
					{
						if (count_max==0)
							{
								traverseWithParents(child, function (grandchild) 
									{
										if(grandchild.type == 'BlockStatement')
											{
												k=0;
											}
										if(isOperator(grandchild))
											{
												k+=1;
											}
										temp_result_2 = Math.max(temp_result_2,k);
									});
								count_max+=1;
								builder.MaxConditions = temp_result_2 + 1;
							}
					}
			});
			builders[builder.FunctionName] = builder;
		}

		// Calculating the total number of string literals used in file.
		if (node.type == 'Literal' && typeof(node.value) === "string") 
		{
			fileBuilder.Strings+=1;
		}

		// Calculating the total number of imports in a file.
		if (node.type == 'CallExpression' && node.callee.name === "require")
		{
			fileBuilder.ImportCount+=1;
		}
		
		// Calculating the total number of conditions in file.
		if(isDecision(node))
		{
			fileBuilder.AllConditions +=1;		
		}

		
	});
}

// Helper function for checking if an operator has a valid value
function isOperator(node)
{
	if(node.operator == '&&' || node.operator == '||')
			{
			return true;
			}
			return false;		
}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}

// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();

function Crazy (argument) 
{

	var date_bits = element.value.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/);
	var new_date = null;
	if(date_bits && date_bits.length == 4 && parseInt(date_bits[2]) > 0 && parseInt(date_bits[3]) > 0)
    new_date = new Date(parseInt(date_bits[1]), parseInt(date_bits[2]) - 1, parseInt(date_bits[3]));

    var secs = bytes / 3500;

      if ( secs < 59 )
      {
          return secs.toString().split(".")[0] + " seconds";
      }
      else if ( secs > 59 && secs < 3600 )
      {
          var mints = secs / 60;
          var remainder = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var szmin;
          if ( mints > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          return mints.toString().split(".")[0] + " " + szmin + " " +
remainder.toString() + " seconds";
      }
      else
      {
          var mints = secs / 60;
          var hours = mints / 60;
          var remainders = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var remainderm = parseInt(mints.toString().split(".")[0]) -
(parseInt(hours.toString().split(".")[0]) * 60);
          var szmin;
          if ( remainderm > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          var szhr;
          if ( remainderm > 1 )
          {
              szhr = "hours";
          }
          else
          {
              szhr = "hour";
              for ( i = 0 ; i < cfield.value.length ; i++)
				  {
				    var n = cfield.value.substr(i,1);
				    if ( n != 'a' && n != 'b' && n != 'c' && n != 'd'
				      && n != 'e' && n != 'f' && n != 'g' && n != 'h'
				      && n != 'i' && n != 'j' && n != 'k' && n != 'l'
				      && n != 'm' && n != 'n' && n != 'o' && n != 'p'
				      && n != 'q' && n != 'r' && n != 's' && n != 't'
				      && n != 'u' && n != 'v' && n != 'w' && n != 'x'
				      && n != 'y' && n != 'z'
				      && n != 'A' && n != 'B' && n != 'C' && n != 'D'
				      && n != 'E' && n != 'F' && n != 'G' && n != 'H'
				      && n != 'I' && n != 'J' && n != 'K' && n != 'L'
				      && n != 'M' && n != 'N' &&  n != 'O' && n != 'P'
				      && n != 'Q' && n != 'R' && n != 'S' && n != 'T'
				      && n != 'U' && n != 'V' && n != 'W' && n != 'X'
				      && n != 'Y' && n != 'Z'
				      && n != '0' && n != '1' && n != '2' && n != '3'
				      && n != '4' && n != '5' && n != '6' && n != '7'
				      && n != '8' && n != '9'
				      && n != '_' && n != '@' && n != '-' && n != '.' )
				    {
				      window.alert("Only Alphanumeric are allowed.\nPlease re-enter the value.");
				      cfield.value = '';
				      cfield.focus();
				    }
				    cfield.value =  cfield.value.toUpperCase();
				  }
				  return;
          }
          return hours.toString().split(".")[0] + " " + szhr + " " +
mints.toString().split(".")[0] + " " + szmin;
      }
  }
 