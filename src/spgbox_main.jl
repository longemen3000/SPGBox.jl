#
# Algorithm of:
#
# NONMONOTONE SPECTRAL PROJECTED GRADIENT METHODS ON CONVEX SETS
# ERNESTO G. BIRGIN, JOSÉ MARIO MARTÍNEZ, AND MARCOS RAYDAN
# SIAM J. O. PTIM. Vol. 10, No. 4, pp. 1196-1211
#
# Originally implemented by J. M. Martínez (IMECC - UNICAMP)
# Translated to Julia by L. Martínez (IQ-UNICAMP)
#
"""
```
spgbox!(f, g!, x::AbstractVector{Real}; lower=..., upper=..., options...)`
```

```
spgbox!(f, g!, lower::AbstractVector{Real}, upper::AbstractVector{Real}, x::AbstractVector{Real}; options...)`
```

Minimizes function `f` starting from initial point `x`, given the function to compute the gradient, `g!`. `f` must be of the form `f(x)`, and `g!` of the form `g!(g,x)`, where `g` is the gradient vector to be modified. It modifies the `x` vector, which will contain the best solution found (see `spgbox` for a non-mutating alternative). 

Optional lower and upper box bounds can be provided using optional arguments `lower` and `upper`, which can be provided as the fourth and fifth arguments or with keyword parameters.

Returns a structure of type `SPGBoxResult`, containing the best solution found in `x` and the final objective function in `f`.

# Examples
```jldocstest
julia> f(x) = x[1]^2 + x[2]^2

julia> function g!(g,x)
         g[1] = 2*x[1]
         g[2] = 2*x[2]
       end
```
## Without bounds

```jldocstest
julia> x = rand(2)

julia> spgbox!(f,g!,x)

 SPGBOX RESULT: 

 Convergence achieved. 

 Final objective function value = 0.0
 Best solution found = [ 0.0, 0.0]
 Projected gradient norm = 0.0

 Number of iterations = 2
 Number of function evaluations = 3
```

## With bounds

```jldocstest
julia> x = 2 .+ rand(2)

julia> spgbox!(f,g!,x,lower=[2.,-Inf])

 SPGBOX RESULT:

 Convergence achieved.

 Final objective function value = 4.0
 Best solution found = [ 2.0, 0.0]
 Projected gradient norm = 0.0

 Number of iterations = 2
 Number of function evaluations = 3
```
"""
function spgbox!(
  f::Function,
  g!::Function,
  lower::Union{Nothing,AbstractVector{Float64}}, 
  upper::Union{Nothing,AbstractVector{Float64}}, 
  x::AbstractVector{Float64};
  eps::Float64 = 1.e-5,
  nitmax::Int = 100,
  nfevalmax::Int = 1000,
  m::Int = 10,
  vaux::VAux = VAux(length(x),m),
  iprint::Int = 0,
  project_x0::Bool = true
) 
  return spgbox!(
    f,g!,x,lower=lower,upper=upper,
    eps=eps, nitmax=nitmax, nfevalmax=nfevalmax, m=m, 
    vaux=vaux, iprint=iprint, project_x0=project_x0
  )
end
#
# call with lower and upper as keyword parameters
#
function spgbox!(
  f::Function,
  g!::Function,
  x::AbstractVector{Float64};
  lower::Union{Nothing,AbstractVector{Float64}} = nothing, 
  upper::Union{Nothing,AbstractVector{Float64}} = nothing, 
  eps::Float64 = 1.e-5,
  nitmax::Int = 100,
  nfevalmax::Int = 1000,
  m::Int = 10,
  vaux::VAux = VAux(length(x),m),
  iprint::Int = 0,
  project_x0::Bool = true
)

  # Number of variables
  n = length(x)

  # Auxiliary arrays (associate names and check dimensions)
  g = vaux.g
  xn = vaux.xn
  gn = vaux.gn
  fprev = vaux.fprev
  @assert length(g) == n "Auxiliar gradient vector `g` must be of the same length as `x`"
  @assert length(xn) == n "Auxiliar vector `xn` must be of the same length as `x`"
  @assert length(gn) == n "Auxiliar vector `gn` must be of the same length as `x`"
  @assert length(fprev) == m "Auxiliar vector `fprev` must be of length `m`"

  # Check if bounds are defined, project or not the initial point on them
  if !isnothing(lower)
    @assert length(lower) == n "Lower bound vector `lower` must be of the same length than x, got: $(length(lower))"
    if project_x0
      @. x = max(x,lower)
    else
      for i in eachindex(x)
        if x[i] < lower[i]
          error(" Initial value of variable $i smaller than lower bound, and `project_x0` is set to `false`. ")
        end
      end
    end
  end
  if !isnothing(upper)
    @assert length(upper) == n "Upper bound vector `upper` must be of the same length than `x`, got: $(length(upper))"
    if project_x0
      @. x = min(x,upper)
    else
      for i in eachindex(x)
        if x[i] > lower[i]
          error(" Initial value of variable $i greater than upper bound, and `project_x0` is set to `false`. ")
        end
      end
    end
  end

  # Objective function at initial point
  nfeval = 1
  fcurrent = f(x)
  g!(g,x)
  gnorm = pr_gradnorm(g,x,lower,upper)

  tspg = 1.
  for i in eachindex(fprev)
    fprev[i] = fcurrent
  end

  # Iteration counter
  nit = 0
  while nit < nitmax

    if iprint > 0
      println("----------------------------------------------------------- ")
      println(" Iteration: ", nit )
      println(" x = ", x[begin], " ... ", x[end] )
      println(" Objective function value = ", fcurrent)
    end
    
    # Compute gradient norm
    gnorm = pr_gradnorm(g,x,lower,upper)

    if iprint > 0
      println(" ")
      println(" Norm of the projected gradient = ", gnorm)
      println(" Number of function evaluations = ", nfeval)
    end

    # Stopping criteria
    if gnorm <= eps
      ierr = 0
      return SPGBoxResult(x,fcurrent,gnorm,nit,nfeval,ierr)
    end
    if nfeval >= nfevalmax
      ierr = 2
      return SPGBoxResult(x,fcurrent,gnorm,nit,nfeval,ierr)
    end

    t = tspg
    fref = maximum(fprev)

    if iprint > 2
      println(" fref = ", fref)
      println(" fprev = ", fprev)
      println(" t = ", t)
    end

    fn = +Inf
    while( fn > fref )
      for i in eachindex(x)
        xn[i] = x[i] - t*g[i]
        if !isnothing(upper)
          xn[i] = min(xn[i],upper[i])
        end
        if !isnothing(lower)
          xn[i] = max(xn[i],lower[i])
        end
      end 
      if iprint > 2
        println(" xn = ", xn[begin], " ... ", xn[end])
      end
      nfeval = nfeval + 1
      fn = f(xn)
      if iprint > 2
        println(" f[end] = ", fn, " fref = ", fref )
      end
      # Maximum number of function evaluations achieved
      if nfeval > nfevalmax 
        ierr = 2
        return SPGBoxResult(x,fcurrent,gnorm,nit,nfeval,ierr)
      end
      # Reduce region
      t = t/2
    end

    g!(gn,xn)
    num = 0.
    den = 0.
    for i in eachindex(x)
      num = num + (xn[i]-x[i])^2
      den = den + (xn[i]-x[i])*(gn[i]-g[i])
    end
    if den <= 0.
      tspg = 100.
    else
      tspg =  min(1.e3,num/den)
    end
    fcurrent = fn
    for i in eachindex(x)
      x[i] = xn[i]
      g[i] = gn[i]
    end
    for i in firstindex(fprev):lastindex(fprev)-1
      fprev[i] = fprev[i+1]
    end
    fprev[end] = fcurrent
    nit = nit + 1
  end

  # Maximum number of iterations achieved
  ierr = 1
  return SPGBoxResult(x,fcurrent,gnorm,nit,nfeval,ierr)

end

"""

```
spgbox(f, g!, x::AbstractVector{Real}; lower=..., upper=..., options...)`
```

```
spgbox(f, g!, lower::AbstractVector{Real}, upper::AbstractVector{Real}, x::AbstractVector{Real}; options...)`
```

Minimizes function `f` starting from initial point `x`, given the function to compute the gradient, `g!`. `f` must be of the form `f(x)`, and `g!` of the form `g!(g,x)`, where `g` is the gradient vector to be modified. This call *does not* mutate the `x` vector, instead it will create a (deep)copy of it (see `spgbox!` to the inplace alternative). 

Optional lower and upper box bounds can be provided using optional arguments `lower` and `upper`, which can be provided as the fourth and fifth arguments or with keyword parameters.

Returns a structure of type `SPGBoxResult`, containing the best solution found in `x` and the final objective function in `f`.


"""
function spgbox(
  f::Function,
  g!::Function,
  lower::Union{Nothing,AbstractVector{Float64}}, 
  upper::Union{Nothing,AbstractVector{Float64}}, 
  x::AbstractVector{Float64};
  eps::Float64 = 1.e-5,
  nitmax::Int = 100,
  nfevalmax::Int = 1000,
  m::Int = 10,
  vaux::VAux = VAux(length(x),m),
  iprint::Int = 0,
  project_x0::Bool = true
) 
  x0 = deepcopy(x)
  return spgbox!(
    f,g!,x0,lower=lower,upper=upper,
    eps=eps, nitmax=nitmax, nfevalmax=nfevalmax, m=m, 
    vaux=vaux, iprint=iprint, project_x0=project_x0
  )
end
#
# call with lower and upper as keyword parameters
#
function spgbox(
  f::Function,
  g!::Function,
  x::AbstractVector{Float64};
  lower::Union{Nothing,AbstractVector{Float64}} = nothing, 
  upper::Union{Nothing,AbstractVector{Float64}} = nothing, 
  eps::Float64 = 1.e-5,
  nitmax::Int = 100,
  nfevalmax::Int = 1000,
  m::Int = 10,
  vaux::VAux = VAux(length(x),m),
  iprint::Int = 0,
  project_x0::Bool = true
)
  x0 = deepcopy(x)
  return spgbox!(
    f,g!,x0,lower=lower,upper=upper,
    eps=eps, nitmax=nitmax, nfevalmax=nfevalmax, m=m, 
    vaux=vaux, iprint=iprint, project_x0=project_x0
  )
end
