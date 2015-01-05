class MonotonicCubicSpline
  
# adapted from: 
# http://sourceforge.net/mailarchive/forum.php?thread_name=EC90C5C6-C982-4F49-8D46-A64F270C5247%40gmail.com&forum_name=matplotlib-users
# (easier to read at http://old.nabble.com/%22Piecewise-Cubic-Hermite-Interpolating-Polynomial%22-in-python-td25204843.html)

# with help from:
# F N Fritsch & R E Carlson (1980) 'Monotone Piecewise Cubic Interpolation', SIAM Journal of Numerical Analysis 17(2), 238 - 246.
# http://en.wikipedia.org/wiki/Monotone_cubic_interpolation
# http://en.wikipedia.org/wiki/Cubic_Hermite_spline

  constructor: (x, y) ->
    n = x.length
    delta = []; m = []; alpha = []; beta = []; dist = []; tau = []
    for i in [0...(n - 1)]
      delta[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i])
      m[i] = (delta[i - 1] + delta[i]) / 2 if i > 0
    m[0] = delta[0]
    m[n - 1] = delta[n - 2]
    to_fix = []
    for i in [0...(n - 1)]
      to_fix.push(i) if delta[i] == 0
    for i in to_fix
      m[i] = m[i + 1] = 0
    for i in [0...(n - 1)]
      alpha[i] = m[i] / delta[i]
      beta[i]  = m[i + 1] / delta[i] 
      dist[i]  = Math.pow(alpha[i], 2) + Math.pow(beta[i], 2)
      tau[i]   = 3 / Math.sqrt(dist[i])
    to_fix = []
    for i in [0...(n - 1)]
      to_fix.push(i) if dist[i] > 9
    for i in to_fix
      m[i]     = tau[i] * alpha[i] * delta[i]
      m[i + 1] = tau[i] * beta[i]  * delta[i]
    @x = x[0...n]  # copy
    @y = y[0...n]  # copy
    @m = m
  
  interpolate: (x) ->
    for i in [(@x.length - 2)..0]
      break if @x[i] <= x
    h = @x[i + 1] - @x[i]
    t = (x - @x[i]) / h
    t2 = Math.pow(t, 2)
    t3 = Math.pow(t, 3)
    h00 =  2 * t3 - 3 * t2 + 1
    h10 =      t3 - 2 * t2 + t
    h01 = -2 * t3 + 3 * t2
    h11 =      t3  -    t2
    y = h00 * @y[i] + 
        h10 * h * @m[i] + 
        h01 * @y[i + 1] + 
        h11 * h * @m[i + 1]
    y


class CubicSpline  # natural or clamped
  
# adapted from:
# http://www.michonline.com/ryan/csc/m510/splinepresent.html

  constructor: (x, a, d0, dn) ->
    return unless x? and a?
    clamped = d0? and dn?
    n = x.length - 1
    h = []; y = []; l = []; u = []; z = []; c = []; b = []; d = []; k = []; s = []
    for i in [0...n]
      h[i] = x[i + 1] - x[i]
      k[i] = a[i + 1] - a[i]
      s[i] = k[i] / h[i]
    if clamped
      y[0] = 3 * (a[1] - a[0]) / h[0] - 3 * d0
      y[n] = 3 * dn - 3 * (a[n] - a[n - 1]) / h[n - 1]
    for i in [1...n]
      y[i] = 3 / h[i] * (a[i + 1] - a[i]) - 3 / h[i - 1] * (a[i] - a[i - 1])
    if clamped
      l[0] = 2 * h[0]
      u[0] = 0.5
      z[0] = y[0] / l[0]
    else
      l[0] = 1
      u[0] = 0
      z[0] = 0
    for i in [1...n]
      l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * u[i - 1]
      u[i] = h[i] / l[i]
      z[i] = (y[i] - h[i - 1] * z[i - 1]) / l[i]
    if clamped
      l[n] = h[n - 1] * (2 - u[n - 1])
      z[n] = (y[n] - h[n - 1] * z[n - 1]) / l[n]
      c[n] = z[n]
    else
      l[n] = 1
      z[n] = 0
      c[n] = 0
    for i in [(n - 1)..0]
      c[i] = z[i] - u[i] * c[i + 1]
      b[i] = (a[i + 1] - a[i]) / h[i] - h[i] * (c[i + 1] + 2 * c[i]) / 3
      d[i] = (c[i + 1] - c[i]) / (3 * h[i])
    @x = x[0..n]  # copy
    @a = a[0...n]
    @b = b
    @c = c[0...n]
    @d = d

  derivative: ->
    s = new this.constructor()
    s.x = @x[0...@x.length]  # copy
    s.a = @b[0...@b.length]  # copy
    s.b = 2 * c for c in @c
    s.c = 3 * d for d in @d
    s.d = 0 for x in [0...@d.length]
    s

  interpolate: (x) ->
    for i in [(@x.length - 1)..0]
      break if @x[i] <= x
    deltaX = x - @x[i]
    y = @a[i] + 
        @b[i] * deltaX + 
        @c[i] * Math.pow(deltaX, 2) + 
        @d[i] * Math.pow(deltaX, 3)
    y
