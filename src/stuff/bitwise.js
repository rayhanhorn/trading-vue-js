// http://michalbe.blogspot.com.br/2013/03/javascript-less-known-parts-bitwise.html
// http://jsperf.com/bitwise-vs-math-object
// http://united-coders.com/christian-harms/results-for-game-for-forfeits-and-the-winner-is/
// https://mudcu.be/journal/2011/11/bitwise-gems-and-other-optimizations/
// https://dreaminginjavascript.wordpress.com/2009/02/09/bitwise-byte-foolish/
// http://jsperf.com/math-min-max-vs-ternary-vs-if/24


var PI = Math.PI;
var HALF_PI = PI * 0.5;
var TWO_PI = PI * 2;
var RADIAN = 180 / PI;

// Max int for simple bitwise operations
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Signed_32-bit_integers
var MAX_SIGNED_32_BIT_INT = Math.pow(2, 31) - 1;
var MIN_SIGNED_32_BIT_INT = ~MAX_SIGNED_32_BIT_INT;

// ECMAScript 6 - MIN/MAX safe integer
if (Number.MAX_SAFE_INTEGER === void 0) {
	Number.MIN_SAFE_INTEGER = -( Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1 );
}

function ABS_INT(n) {
	return (n ^ (n >> 31)) - (n >> 31);
}

function MAX_INT(a, b) {
	return a - ((a - b) & ((a - b) >> 31));
	//return a ^ ((a ^ b) & -(a < b));
	//  var c = a - b;
	//  return a - ((c >> 31) & 0x1) * c;  
}

function MIN_INT(a, b) {
	return a - ((a - b) & ((b - a) >> 31));
	// return b ^ ((a ^ b) & -(a < b));
}

function CLAMP_INT( x, min, max ) {
	x = x - ((x - max) & ((max - x) >> 31));
	return x - ((x - min) & ((x - min) >> 31));
	//return ( n > max ) ? max : ( n < min ) ? n : min;
}

function IS_INT_POWER_OF_TWO( value ) {
	return ( value & ( value - 1 ) ) === 0 && value !== 0;
}

function PLUS_ONE_INT(n) { // slower than ++
	return -~n;
}

function MINUS_ONE_INT() { // slower than --
	return ~-n;
}

function IS_ODD_INT(n) {
	return (n & 1) === 1;
}

function ARRAY_SWAP_INT(array, i, j) {
	array[i] ^= array[j];
	array[j] ^= array[i];
	array[i] ^= array[j];
}

function HAS_SAME_SIGN(a, b) {
	return (a ^ b) >= 0;
}

function POW_OF_2_INT(n) { // === Math.pow(2, n)
	return 2 << (n - 1);
}

function AVG_INT(a, b) { // a + b / 2
	return (a + b) >> 1;
}

function TOGGLE_A_B_INT(n, a, b) { // if(x==a) x=b; if(x==b) x=a;
	return a ^ b ^ n;
}


function SET_BIT(n, bit) {
	return n | (1 << bit);
}

function CLEAR_BIT(n, bit) {
	return n & ~(1 << bit);
}

function MODULO_INT(numerator, divisor) { // 600% faster out of function than %
	return numerator & (divisor - 1);
} 
