###
Smooth.js version 0.1.7

Turn arrays into smooth functions.

Copyright 2012 Spencer Cohen
Licensed under MIT license (see "Smooth.js MIT license.txt")

###


###Constants (these are accessible by Smooth.WHATEVER in user space)###
Enum = 
	###Interpolation methods###
	METHOD_NEAREST: 'nearest' #Rounds to nearest whole index
	METHOD_LINEAR: 'linear' 
	METHOD_CUBIC: 'cubic' # Default: cubic interpolation
	METHOD_LANCZOS: 'lanczos'
	METHOD_SINC: 'sinc'

	###Input clipping modes###
	CLIP_CLAMP: 'clamp' # Default: clamp to [0, arr.length-1]
	CLIP_ZERO: 'zero' # When out of bounds, clip to zero
	CLIP_PERIODIC: 'periodic' # Repeat the array infinitely in either direction
	CLIP_MIRROR: 'mirror' # Repeat infinitely in either direction, flipping each time

	### Constants for control over the cubic interpolation tension ###
	CUBIC_TENSION_DEFAULT: 0 # Default tension value
	CUBIC_TENSION_CATMULL_ROM: 0


defaultConfig = 
	method: Enum.METHOD_CUBIC                       #The interpolation method
	
	cubicTension: Enum.CUBIC_TENSION_DEFAULT        #The cubic tension parameter
	
	clip: Enum.CLIP_CLAMP                           #The clipping mode
	
	scaleTo: 0                                      #The scale-to value (0 means don't scale) (can also be a range)
	
	sincFilterSize: 2                               #The size of the sinc filter kernel (must be an integer)

	sincWindow: undefined                           #The window function for the sinc filter

###Index clipping functions###
clipClamp = (i, n) -> Math.max 0, Math.min i, n - 1

clipPeriodic = (i, n) ->
	i = i % n #wrap
	i += n if i < 0 #if negative, wrap back around
	i

clipMirror = (i, n) ->
	period = 2*(n - 1) #period of index mirroring function
	i = clipPeriodic i, period
	i = period - i if i > n - 1 #flip when out of bounds 
	i


###
Abstract scalar interpolation class which provides common functionality for all interpolators

Subclasses must override interpolate().
###

class AbstractInterpolator

	constructor: (array, config) ->
		@array = array.slice 0 #copy the array
		@length = @array.length #cache length

		#Set the clipping helper method
		throw "Invalid clip: #{config.clip}" unless @clipHelper = {
			clamp: @clipHelperClamp
			zero: @clipHelperZero
			periodic: @clipHelperPeriodic
			mirror: @clipHelperMirror
		}[config.clip]


    # Get input array value at i, applying the clipping method
	getClippedInput: (i) ->
		#Normal behavior for indexes within bounds
		if 0 <= i < @length
			@array[i]
		else
			@clipHelper i

	clipHelperClamp: (i) -> @array[clipClamp i, @length]

	clipHelperZero: (i) -> 0

	clipHelperPeriodic: (i) -> @array[clipPeriodic i, @length]

	clipHelperMirror: (i) -> @array[clipMirror i, @length]

	interpolate: (t) -> throw 'Subclasses of AbstractInterpolator must override the interpolate() method.'


#Nearest neighbor interpolator (round to whole index)
class NearestInterpolator extends AbstractInterpolator
	interpolate: (t) -> @getClippedInput Math.round t


#Linear interpolator (first order Bezier)
class LinearInterpolator extends AbstractInterpolator
	interpolate: (t) ->
		k = Math.floor t
		#Translate t to interpolate between k and k+1
		t -= k
		return (1-t)*@getClippedInput(k) + (t)*@getClippedInput(k+1)


class CubicInterpolator extends AbstractInterpolator
	constructor: (array, config)->
		#clamp cubic tension to [0,1] range
		@tangentFactor = 1 - Math.max 0, Math.min 1, config.cubicTension
		super

	# Cardinal spline with tension 0.5)
	getTangent: (k) -> @tangentFactor*(@getClippedInput(k + 1) - @getClippedInput(k - 1))/2

	interpolate: (t) ->
		k = Math.floor t
		m = [(@getTangent k), (@getTangent k+1)] #get tangents
		p = [(@getClippedInput k), (@getClippedInput k+1)] #get points
		#Translate t to interpolate between k and k+1
		t -= k
		t2 = t*t #t^2
		t3 = t*t2 #t^3
		#Apply cubic hermite spline formula
		return (2*t3 - 3*t2 + 1)*p[0] + (t3 - 2*t2 + t)*m[0] + (-2*t3 + 3*t2)*p[1] + (t3 - t2)*m[1]

{sin, PI} = Math
#Normalized sinc function
sinc = (x) -> if x is 0 then 1 else sin(PI*x)/(PI*x)

#Make a lanczos window function for a given filter size 'a'
makeLanczosWindow = (a) -> (x) -> sinc(x/a)

#Make a sinc kernel function by multiplying the sinc function by a window function
makeSincKernel = (window) -> (x) -> sinc(x)*window(x)

class SincFilterInterpolator extends AbstractInterpolator
	constructor: (array, config) ->
		super
		#Create the lanczos kernel function
		@a = config.sincFilterSize

		#Cannot make sinc filter without a window function
		throw 'No sincWindow provided' unless config.sincWindow
		#Window the sinc function to make the kernel
		@kernel = makeSincKernel config.sincWindow

	interpolate: (t) ->
		k = Math.floor t
		#Convolve with Lanczos kernel
		sum = 0
		sum += @kernel(t - n)*@getClippedInput(n) for n in [(k - @a + 1)..(k + @a)]
		sum


#Extract a column from a two dimensional array
getColumn = (arr, i) -> (row[i] for row in arr)


#Take a function with one parameter and apply a scale factor to its parameter
makeScaledFunction = (f, baseScale, scaleRange) ->
	if scaleRange.join is '0,1'
		f #don't wrap the function unecessarily
	else 
		scaleFactor = baseScale/(scaleRange[1] - scaleRange[0])
		translation = scaleRange[0]
		(t) -> f scaleFactor*(t - translation)


getType = (x) -> Object::toString.call(x)[('[object '.length)...-1]

#Throw exception if input is not a number
validateNumber = (n) ->
	throw 'NaN in Smooth() input' if isNaN n
	throw 'Non-number in Smooth() input' unless getType(n) is 'Number'
	throw 'Infinity in Smooth() input' unless isFinite n
		

#Throw an exception if input is not a vector of numbers which is the correct length
validateVector = (v, dimension) ->
	throw 'Non-vector in Smooth() input' unless getType(v) is 'Array'
	throw 'Inconsistent dimension in Smooth() input' unless v.length is dimension
	validateNumber n for n in v
	return

isValidNumber = (n) -> (getType(n) is 'Number') and isFinite(n) and not isNaN(n)

normalizeScaleTo = (s) ->
	invalidErr = "scaleTo param must be number or array of two numbers"
	switch getType s
		when 'Number'
			throw invalidErr unless isValidNumber s
			s = [0, s]
		when 'Array'
			throw invalidErr unless s.length is 2
			throw invalidErr unless isValidNumber(s[0]) and isValidNumber(s[1])
		else throw invalidErr
	return s

shallowCopy = (obj) ->
	copy = {}
	copy[k] = v for own k,v of obj
	copy

Smooth = (arr, config = {}) ->
	#Properties to copy to the function once it is created
	properties = {}
	#Make a copy of the config object to modify
	config = shallowCopy config

	#Make another copy of the config object to save to the function
	properties.config = shallowCopy config

	#Alias 'period' to 'scaleTo'
	config.scaleTo ?= config.period

	#Alias lanczosFilterSize to sincFilterSize
	config.sincFilterSize ?= config.lanczosFilterSize

	config[k] ?= v for own k,v of defaultConfig #fill in defaults

	#Get the interpolator class according to the configuration
	throw "Invalid method: #{config.method}" unless interpolatorClass = {
			nearest: NearestInterpolator
			linear: LinearInterpolator
			cubic: CubicInterpolator
			lanczos: SincFilterInterpolator #lanczos is a specific case of sinc filter
			sinc: SincFilterInterpolator
	}[config.method]

	if config.method is 'lanczos'
		#Setup lanczos window
		config.sincWindow = makeLanczosWindow config.sincFilterSize


	#Make sure there's at least one element in the input array
	throw 'Array must have at least two elements' if arr.length < 2

	#save count property
	properties.count = arr.length

	#See what type of data we're dealing with

	smoothFunc = switch getType arr[0]
			when 'Number' #scalar
				properties.dimension = 'scalar'
				#Validate all input if deep validation is on
				validateNumber n for n in arr if Smooth.deepValidation
				#Create the interpolator
				interpolator = new interpolatorClass arr, config
				#make function that runs the interpolator
				(t) -> interpolator.interpolate t

			when 'Array' # vector
				properties.dimension = dimension = arr[0].length
				throw 'Vectors must be non-empty' unless dimension
				#Validate all input if deep validation is on
				validateVector v, dimension for v in arr if Smooth.deepValidation
				#Create interpolator for each column
				interpolators = (new interpolatorClass(getColumn(arr, i), config) for i in [0...dimension])
				#make function that runs the interpolators and puts them into an array
				(t) -> (interpolator.interpolate(t) for interpolator in interpolators)

			else throw "Invalid element type: #{getType arr[0]}"

	# Determine the end of the original function's domain
	if config.clip is 'periodic' then baseDomainEnd = arr.length #after last element for periodic
	else baseDomainEnd = arr.length - 1 #at last element for non-periodic

	config.scaleTo ||= baseDomainEnd #default scales to the end of the original domain for no effect
	
	properties.domain = normalizeScaleTo config.scaleTo
	smoothFunc = makeScaledFunction smoothFunc, baseDomainEnd, properties.domain
	properties.domain.sort()

	###copy properties###
	smoothFunc[k] = v for own k,v of properties

	return smoothFunc

#Copy enums to Smooth
Smooth[k] = v for own k,v of Enum

Smooth.deepValidation = true

(exports ? window).Smooth = Smooth
