var esprima = require("esprima");
var fs = require("fs");
var bob = require("bob");

function main()
{
  var x = "hello";
  var y = "xyz";
}

function chains()
{
  return cfield.toUpperCase( 
      x.y.z.data
       .forty.two
 );
}

function params(a,b,c)
{
}

function conditions(a)
{
   if( a > 1 )
   {
      if( a > 3 || a > 2 )
      {
      }

      if( a > 10 && a < 31 ||  
          a == 33
        )
      {
        console.log("");
      }
   }  
}

function depth()
{
   if( true )
   {
      if( false )
      {

      }
   }

   if( true )
   {
       if( false )
       {
          if( true )
          {

          }

          console.log();
          if( true )
          {
             if( false )
             {
                return;
             }
          }
       }
   }

   console.log();
   return;
}