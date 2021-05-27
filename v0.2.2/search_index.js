var documenterSearchIndex = {"docs":
[{"location":"usage/#User-guide","page":"User guide","title":"User guide","text":"","category":"section"},{"location":"usage/#Definition-of-the-objective-function-and-gradient-functions","page":"User guide","title":"Definition of the objective function and gradient functions","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"A function must be defined receiving as argument the current point as a vector: ","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> f(x) = x[1]^2 + (x[2]-2)^2\n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"And the gradient must receive as arguments the vector of variables and a vector which will be modified to contain the gradient at the current point:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> function g!(g,x)\n         g[1] = 2*x[1]\n         g[2] = 2*(x[2]-2)\n       end\n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"By Julia convention, to indicate that the gradient function modifies the vector g, we add the ! to its name, although this does not affect at all its behavior.","category":"page"},{"location":"usage/#Calling-the-solver,-without-bounds","page":"User guide","title":"Calling the solver, without bounds","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"The solver spgbox!, which modifies the input value of x, has a minimal calling syntax of","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> x = rand(2);\n\njulia> R = spgbox!(f,g!,x)\n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"The results will be returned to the data structure R of type SPGBoxResult, and will be output as: ","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> R = spgbox!(f,g!,x)\n\n SPGBOX RESULT:\n\n Convergence achieved.\n\n Final objective function value = 0.0\n Best solution found = [ 0.0, 2.0]\n Projected gradient norm = 0.0\n\n Number of iterations = 2\n Number of function evaluations = 3\n","category":"page"},{"location":"usage/#Calling-the-solver,-with-box-bounds","page":"User guide","title":"Calling the solver, with box bounds","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"Box bounds can be provided by the optional keywords l and u for lower and upper bounds, respectively. These are vectors that will delimit the bounds for each variable. For example, assuming the same function and gradient functions defined in the example above, a lower bound will be set for the second variable:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> x = rand(2);\n\njulia> R = spgbox!(f,g!,x,lower=[-Inf,5])\n\n SPGBOX RESULT: \n\n Convergence achieved. \n\n Final objective function value = 9.0\n Best solution found = [ 0.0, 5.0]\n Projected gradient norm = 0.0\n\n Number of iterations = 2\n Number of function evaluations = 3\n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"Upper bounds can be similarly set with upper=[+Inf,-5], for example.","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"Note, the bounds can also be provided as non-keyword parameters, with:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> lower = [-Inf,5]; upper = [+Inf, -2];\n\njulia> R = spgbox!(f,g!,x,lower,upper)\n","category":"page"},{"location":"usage/#Result-data-structure-and-possible-outcomes","page":"User guide","title":"Result data structure and possible outcomes","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"The minimization can result in a successful convergence, on in exceeded numbers of iterations or functional evaluations. These outcomes are explicit in the output printed (second line), and stored in the result structure, which contains the following data: ","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"struct SPGBoxResult\n  x :: Vector{Float64}\n  f :: Float64\n  gnorm :: Float64\n  nit :: Int64\n  nfeval :: Int64\n  ierr :: Int64\nend","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"The data can be accessed as usual, using, for example:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> R.f\n12.0\n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"The data structure contains:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"Variable name Meaning\nx Best point found (solution if ierr=0)\nf Best function value found.\ngnorm Norm of gradient projected on the constraints.\nnit Number of iterations performed.\nnfeval Number of function evaluations.\nierr Exit status.","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"The possible outcomes of ierr are:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"Outcome Meaning\nierr=0 Success: convergence achieved.\nierr=1 Maximum number of iterations achieved.\nierr=2 Maximum number of function evaluations achieved.","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"The convergence criteria can be adjusted using optional keywords, as described in the Options section.","category":"page"},{"location":"usage/#Data-dependent-function-evaluation","page":"User guide","title":"Data-dependent function evaluation","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"If the function requires additional parameters, two strategies are possible while preserving performance: 1) Declare the parameters as constants and define an extra method, or 2) Pass the function as an anonymous closure. ","category":"page"},{"location":"usage/#Constant-parameters-and-new-function-and-gradient-methods","page":"User guide","title":"Constant parameters and new function and gradient methods","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"The solver requires a function with a single argument, x, and a gradient function with two arguments, x and g. If the function and gradient evalutions require more parameters, use, for example: ","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> f(x,a,b,c) = a*x[1]^2 + (x[2]-b)^2 + c\n\njulia> const a = 5. ; const b = 2. ; const c = 3. ;\n\njulia> f(x) = f(x,a,b,c) \n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"To preserve performance it is fundamental to declare the parameters, in this case a, b, and c, as constants (using const), to guarantee their type-stability. This will allow the function specializations and compiler optimizations that make Julia fast. ","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"The gradient function will be defined accordingly:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> function g!(g,x,a,b)\n         g[1] = 2*a*x[1]\n         g[2] = 2*(x[2]-b)\n       end\n\njulia> g!(g,x) = g!(g,x,a,b) \n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"The function method which receives only the current point x, and the gradient method which receives only x and the gradient vector g are the ones actually invoked by the solver.","category":"page"},{"location":"usage/#Using-anonymous-closures","page":"User guide","title":"Using anonymous closures","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"An anonymous closure is a function with a special syntax of the form ","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"x -> f(x)\n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"which should be read as \"given x, return f(x)\". These anonymous functions can be provided directly as arguments to the solver, while providing an interface for  using external parameters. Considering the same function and gradient functions above, one uses anonymous functions  directly as arguments in the solver call:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> R = spgbox!(x -> f(x,a,b,c), (g,x) -> g!(g,x,a,b), x)\n","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"where the first argument, x -> f(x,a,b,c) indicates that the objective function is an anonymous function that, given x, returns f(x,a,b,c). The gradient is evaluated by an anonymous function that, given (g,x), returns g!(g,x,a,b).   This syntax also preserves performance and does not require the parameters to be declared as constants. ","category":"page"},{"location":"usage/#Using-automatic-differentiation-(AD)","page":"User guide","title":"Using automatic differentiation (AD)","text":"","category":"section"},{"location":"usage/","page":"User guide","title":"User guide","text":"Julia provides various packages for automatic differentiation, which can be used in combination with SPGBox. Here, we illustrate the use of ReverseDiff. The only two points that must be taken into consideration are: 1) The AD function must modify an existing gradient vector and 2) use anonymous closures to provide the gradient calculation function to the solver.","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"Here, a simple example, in which we use ReverseDiff.gradient! to compute the derivative of a function which is the sum of squares of the variables:","category":"page"},{"location":"usage/","page":"User guide","title":"User guide","text":"julia> using SPGBox, ReverseDiff\n\njulia> function f(x)\n         f = 0.\n         for i in eachindex(x)\n           f += x[i]^2\n         end\n         f\n       end\n\njulia> x = rand(2)\n\njulia> spgbox!(f, (g,x) -> ReverseDiff.gradient!(g,f,x), x, lower=[-Inf,2.])\n\n SPGBOX RESULT:\n\n Convergence achieved.\n\n Final objective function value = 4.0\n Best solution found = [ 0.0, 2.0]\n Projected gradient norm = 0.0\n\n Number of iterations = 0\n Number of function evaluations = 1\n","category":"page"},{"location":"options/#Options","page":"Options","title":"Options","text":"","category":"section"},{"location":"options/","page":"Options","title":"Options","text":"Several keyword parameters can be used to adjust the convergence criteria and to deal with the memory management of the execution.  ","category":"page"},{"location":"options/#Convergence-criteria","page":"Options","title":"Convergence criteria","text":"","category":"section"},{"location":"options/","page":"Options","title":"Options","text":"Parameters exist to set the convergence threshold, maximum number of iterations, maximum number of functional evaluations, and number of possibly non-monotone steps.","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"These keywords provided to spgbox! with, for example:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"julia> R = spgbox!(f,g!,x,nitmax=1000)\n","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"where nitmax, in this case, is the maximum number of iterations.","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"The available keywords are:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"Keyword Type Meaning Default value\nnitmax Integer Maximum number of iterations allowed. 100\nnfevalmax Integer Maximum number of function evaluations allowed. 1000\neps Real Convergence criteria for the projected gradient norm. 1e-5\nm Integer Number of non-monotone search steps. 10","category":"page"},{"location":"options/#Memory-preallocation","page":"Options","title":"Memory preallocation","text":"","category":"section"},{"location":"options/","page":"Options","title":"Options","text":"The SPGBox method requires four auxiliary vectors, three of them of length equal to the number of variables (g, xn and gn),  and a vector of length equal to the number of non-monotone steps allowed, fprev, of dimension, m  (see below). ","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"These vectors are allocated in the SPGBox.VAux data structure. For preallocating the auxiliary vectors, initialize this data structure before calling spgbox! and pass the data structure using the vaux argument. In brief, do, for 1 million variables:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"julia> n = 1_000_000\n\njulia> auxvecs = SPGBox.VAux(n)\n\njulia> R = spgbox!(f,g!,x,vaux=auxvecs)\n","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"For example, let us minimize the sum of squares of one million variables:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"julia> function f(x)\n         f = 0.\n         for i in eachindex(x)\n           f += x[i]^2\n         end\n         f\n       end\nf (generic function with 1 methods)\n\njulia> function g!(g,x)\n         for i in eachindex(x)\n           g[i] = 2*x[i]\n         end\n       end\ng! (generic function with 1 methods)\n\njulia> n = 1_000_000\n\njulia> x = rand(n);\n","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"Without preallocating the auxiliary arrays:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"julia> using BenchmarkTools\n\njulia> @btime spgbox!($f,$g!,$x)\n  6.639 ms (10 allocations: 22.89 MiB)\n","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"Now we will preallocate all auxiliary arrays. ","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"julia> auxvecs = SPGBox.VAux(n);\n","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"And these arrays will be passed as arguments to the spgbox! function:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"julia> @btime spgbox!($f,$g!,$x,vaux=$auxvecs)\n  6.429 ms (0 allocations: 0 bytes)\n","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"While SPG is very memory efficient, pré-allocation of the arrays reduces significanltly the use of memory, which might be important for multiple executions of the the same code, for example in multi-start approach for global-minimum search.","category":"page"},{"location":"options/#fprev","page":"Options","title":"Size and preallocation of fprev","text":"","category":"section"},{"location":"options/","page":"Options","title":"Options","text":"The auxiliary vector fprev stores the information of the function value of the last m function evaluations, which is the number of non-monotone steps allowed. Thus, it is a vector of size m which is also preallocated by SPGBox.VAux. By default, it is allocated to length 10, which is the default value for m. If m is modified by the user and preallocation will be done, the new m value must be provided to SPGBox.VAux, with:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"julia> auxvecs = SPGBox.VAux(n,m)\n","category":"page"},{"location":"options/#Additional-keywords-available","page":"Options","title":"Additional keywords available","text":"","category":"section"},{"location":"options/","page":"Options","title":"Options","text":"Additional keywords available:","category":"page"},{"location":"options/","page":"Options","title":"Options","text":"Keyword Type Meaning Default value\niprint Integer Printing details (0, 1, or 2) 0\nproject_x0 Bool Projects, or not, the initial point on the bounds. true","category":"page"},{"location":"reference/#Primary-citation-of-the-algorithm:","page":"Reference","title":"Primary citation of the algorithm:","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"E. G. Birgin, J. M. Martínez and M. Raydan, \"Nonmonotone spectral projected gradient methods on convex sets\", SIAM Journal on Optimization 10, pp. 1196-1211, 2000.  (LINK)","category":"page"},{"location":"#SPGBox","page":"Installation","title":"SPGBox","text":"","category":"section"},{"location":"","page":"Installation","title":"Installation","text":"SPGBox is a pure-Julia implementation of the Spectral Projected Gradient Method  for minimization in box constraints, as described in: ","category":"page"},{"location":"","page":"Installation","title":"Installation","text":"E. G. Birgin, J. M. Martínez and M. Raydan, \"Nonmonotone spectral projected gradient methods on convex sets\", SIAM Journal on Optimization 10, pp. 1196-1211, 2000.  (LINK)","category":"page"},{"location":"#How-to-install","page":"Installation","title":"How to install","text":"","category":"section"},{"location":"","page":"Installation","title":"Installation","text":"julia> using Pkg\n\njulia> Pkg.add(\"SPGBox\")","category":"page"},{"location":"","page":"Installation","title":"Installation","text":"or, more concisely,","category":"page"},{"location":"","page":"Installation","title":"Installation","text":"julia> ] add SPGBox\n","category":"page"},{"location":"#Quick-usage-example","page":"Installation","title":"Quick usage example","text":"","category":"section"},{"location":"","page":"Installation","title":"Installation","text":"Define the function to compute the objective function and the gradient, for example with:","category":"page"},{"location":"","page":"Installation","title":"Installation","text":"julia> f(x) = x[1]^2 + x[2]^2\n\njulia> function g!(g,x)\n         g[1] = 2*x[1]\n         g[2] = 2*x[2]\n       end","category":"page"},{"location":"","page":"Installation","title":"Installation","text":"And the objective function can be minimized with optional box bounds. Here, with a lower bound of 2 for the first variable:","category":"page"},{"location":"","page":"Installation","title":"Installation","text":"julia> x = 2 .+ rand(2)\n\njulia> spgbox!(f,g!,x,lower=[2.,-Inf])\n\n SPGBOX RESULT:\n\n Convergence achieved.\n\n Final objective function value = 4.0\n Best solution found = [ 2.0, 0.0]\n Projected gradient norm = 0.0\n\n Number of iterations = 2\n Number of function evaluations = 3\n","category":"page"}]
}
