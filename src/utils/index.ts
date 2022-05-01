/**
 * String utils
 */

/**
 * Remove hidden line breaks from a string
 * @param str 
 * @returns a string
 */
export function removeLineBreaks(str: string): string {
	return str.replace(/[\r\n]+/gm, '');
}

/**
 * Strip non base58 chars from a string of text
 * @param text 
 * @returns 
 */
export function b58(text: string): string {
	return text.split("").map(
		(c) => ("0IOl".indexOf(c) === -1 ? c : null)
	).filter(x => x !== null).join("");
}

export interface IMakeIdOptions {
	uppercase: boolean;
	lowercase: boolean;
	numbers: boolean;
	base58: boolean;
	symbols: boolean;
	length: number;
}

export const defaultMakeIdOptions: IMakeIdOptions = {
	uppercase: true,
	lowercase: true,
	numbers: true,
	base58: true,
	symbols: false,
	length: 5
}

/**
 * Make a random ID string
 * @param lengthOrOptions provide length or provide makeIdOptions obj
 * ex options: { 
 * 	uppercase: boolean, 
 * 	lowercase: boolean, 
 * 	numbers: boolean,
 *  base58: boolean,
 *  length: number,
 *  symbols: false,
 * }
 * @returns a string
 */
export function makeid(lengthOrOptions: number | Partial<IMakeIdOptions>): string {
	let dictonary: string = ""
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowercase = uppercase.toLowerCase();
	const numbers = range(0,9).join("");
	const symbols = `!@#$%^&*()-_=+`;
	if(typeof lengthOrOptions === "number"){
		dictonary = b58(uppercase + lowercase + numbers);
	}else{
		lengthOrOptions = objectAssign(defaultMakeIdOptions, lengthOrOptions) as IMakeIdOptions;
		let options: Partial<IMakeIdOptions> = lengthOrOptions;
		if(options.uppercase) dictonary += uppercase;
		if(options.lowercase) dictonary += lowercase;
		if(options.numbers) dictonary += numbers;
		if(options.base58) dictonary = b58(dictonary);
		if(options.symbols) dictonary += symbols;
		lengthOrOptions = options.length
	}
	let result = '';
	for (let i = 0; i < lengthOrOptions; i++) {
		result += dictonary.charAt(
			Math.floor( 
				Math.random() * dictonary.length 
			)
		);
	}
	return result;
}

/**
 * Format a string into propper case. Optionally force the string to lowercase
 * @param text 
 * @param lc 
 * @returns 
 */
 export const proper = (text: string, lc: boolean = false): string => {
	if(lc) text = text.toLowerCase()
	return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Format a string into lower case
 * @param text 
 * @returns 
 */
export const lc = (text: string): string => text.toLowerCase();

/**
 * Format a string to upper case
 * @param text 
 * @returns 
 */
export const uc = (text: string): string => text.toUpperCase();

/**
 * Truncate a string by a spcific number of characters (adding '...' if char limit is exceeded)
 * @param text 
 * @param chars 
 * @returns 
 */
export const truncate = (text: string, chars: number): string => {
	if (text.length > chars) return text.slice(0, chars) + "...";
	return text;
}

/**
 * Convert comma seperated listed of numbers to rgb or rgba hex
 * @param rgb 
 * @returns 
 */
export const rgbToHex = (...rgb: number[]): string => {
	return (
	  "#" + rgb.map((x) => {
		let h = x.toString(16);
		return h.length === 1 ? `0${h}` : h;
	  })
	  .join("")
	);
};

/**
 * Encode a base 64 string
 * ex:
 * 	encoded = b2a("some string")
 * 
 * https://gist.github.com/oeon/0ada0457194ebf70ec2428900ba76255
 * @param a 
 * @returns 
 */
 export function b2a(a:string): string {
    var c: number, 
    d: number, 
    e: number, 
    f: number, 
    g: number, 
    h: number, 
    i: number, 
    j: number, 
    o: number, 
    b: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
    k: number = 0, 
    l: number = 0, 
    m: string = "", 
    n: any[] = [];
    if (!a) return a;
    do c = a.charCodeAt(k++), d = a.charCodeAt(k++), e = a.charCodeAt(k++), j = c << 16 | d << 8 | e, 
    f = 63 & j >> 18, g = 63 & j >> 12, h = 63 & j >> 6, i = 63 & j, n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i); while (k < a.length);
    return m = n.join(""), o = a.length % 3, (o ? m.slice(0, o - 3) :m) + "===".slice(o || 3);
}

/**
 * Decode a base 64 string
 * ex:
 * 	decoded = a2b(encoded)
 * 
 * https://gist.github.com/oeon/0ada0457194ebf70ec2428900ba76255
 * @param {String} a raw string
 * @returns 
 */
export function a2b(a:string): string {
    var b: number, 
    c: number, 
    d: number, 
    e: any = {}, 
    f: number = 0, 
    g: number = 0, 
    h: string = "", 
    i: (...codes: number[]) => string = String.fromCharCode, 
    j: number = a.length;
    for (b = 0; 64 > b; b++) e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(b)] = b;
    for (c = 0; j > c; c++) for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8; ) ((d = 255 & f >>> (g -= 8)) || j - 2 > c) && (h += i(d));
    return h;
}

/**
 * Parse a JSON Web Token
 * https://stackoverflow.com/a/38552302
 * @param  {String} token The JWT
 * @return {Object}       The decoded payload
 */
export function parse(token: string){
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(a2b(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

/**
 * All string utils
 */
const string = {
	removeLineBreaks,
	b58,
	makeid,
	proper,
	lc,
	uc,
	truncate,
	rgbToHex,
	b2a,
	a2b,
	parse
}

/**
 * Number utils
 */

/**
 * Get a random integer between two numbers
 * @param x required
 * @param y 
 * @returns number
 */
export function randomInt(x:number, y?: number): number {
	if(y === undefined) {
		y = x;
		x = 0;
	}
	return Math.floor(Math.random() * (y - x + 1) + x);
}

/**
 * Round a number to a certain number of decimal places
 * @param num 
 * @param decimals 
 * @param pad force a trailing zeros/decimals
 * @returns a number
 */
export function round(num: number, decimals: number, pad: boolean = false): number {
	let p = ``, n = Number(Math.round(Number(num + "e" + decimals)) + "e-" + decimals)
	if(pad){
		p += n.toString();
		let decimalCount = p.split(".")[1]?.length || 0;
		if(decimalCount < decimals){
			range(1,decimals).forEach(() => p += `0`);
		}
		return p;
	}
	return n;
}


/**
 * Round a number to a certain number of decimal places forces padded zeros 
 * and the output is a string.
 * @param num 
 * @param decimals 
 * @returns string
 */
 export function roundPad(
	num: number,
	decimals: number,
): string {
	let p = ``, n = Number(Math.round(Number(num + "e" + decimals)) + "e-" + decimals);
	p += n.toString();
	let decimalCount = p.split(".")[1]?.length || 0;
	let padCount = decimals - decimalCount;
	if (decimalCount === 0) p += `.`;
	if (padCount > 0) {
		range(1, padCount).forEach(() => (p += `0`));
	}
	return p;
}

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);
/**
 * Format a number using international formatter
 * @param number 
 * @returns 
 */
export function formatNumber(number:number): string {
	return NUMBER_FORMATTER.format(number);
}

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat(undefined, {
	notation: "compact"
} as Intl.NumberFormatOptions);
/**
 * Format a number into a compact number string
 * @param number 
 * @returns 
 */
export function formatCompactNumber(number:number): string {
	return COMPACT_NUMBER_FORMATTER.format(number);
}

/**
 * The following function returns the logarithm of y with base x (ie. log x y ):
 * @param x base
 * @param y 
 * @returns 
 */
export const getBaseLog = (x: number, y: number) => Math.log(y) / Math.log(x);

export const log2 = (n: number) => getBaseLog(2,n);


/**
 * All number utils
 */
 const number = {
	randomInt,
	round,
	roundPad,
	formatNumber,
	formatCompactNumber,
	getBaseLog,
	log2,
}


/**
 * Array utils
 */

/**
 * Get the first n items from an array
 * @param array 
 * @param n number of items (default 1)
 * @returns first n items
 */
export function first(array: any[], n?: number): any {
	if( n === undefined ) return array[0];
	return array.slice( 0, n );
}

/**
 * Get the last n items from an array
 * @param array 
 * @param n number of items (default 1)
 * @returns last n items
 */
export function last(array: any[], n = 1): any {
	if( n === 1 ) return array[array.length - 1]
	return array.filter( ( _: any, idx: number ) => (array.length-idx) <= n )
}

/**
 * Grab a random item from an array
 * @param array 
 * @returns one random item
 */
export function sample(array: any[]): any {
	return array[ randomInt( array.length - 1 ) ];
}

/**
 * Pluck all values that match key from an array of objects
 * @param array array of objects
 * @param key key of object
 * @returns list of values that match key
 */
export function pluck(array: any[], key: string): any[] {
	return array.map(element=>element[key])
}

/**
 * Group array of objects by common key/property
 * @param array array of objects
 * @param key key 
 * @returns object of arrays of objects
 */
export function groupBy(array: any[], key: string): any {
	return array.reduce((group: any, element: any) => {
		const keyValue = element[key]
		return {
			...group, 
			[keyValue]: [...(group[keyValue] ?? []), element]
		}
	}, {})
}

/**
 * Create a list of a particular type and add helper functions
 * @param format 
 * @returns 
 */
 export function createList<T>(
    format?: (value: T) => any
): {
    list: T[];
    has: (item: T) => boolean;
    add: (item: T | T[]) => void;
}{
    const list: T[] = [];
    const has = (item: T): boolean => list.indexOf(format ? format(item) : item) > -1;
    const add = (item: T | T[]): void => { 
        if(!Array.isArray(item)) item = [item];
        item.forEach(it => {
            it = format ? format(it) : it;
            if(!has(it)) list.push(it); 
        })
    }
    return { list, has, add }
}

/**
 * Get an array of integers between two integers
 * @param from starting number 
 * @param to ending number
 * @returns array of numbers
 */
export function range(from: number, to: number): number[] {
	const len = (to - from) + 1;
	return Array.from(Array(len).keys()).map(a => a += from);
}

/**
 * All array utils
 */
 const array = {
	first,
	last,
	sample,
	pluck,
	groupBy,
	createList,
	range,
}


/**
 * Apply props to a default (target) object
 * @param targetObject 
 * @param props 
 * @returns 
 */
export function objectAssign(targetObject: any, props: any): any {
	Object.keys(props).forEach(key=> targetObject[key] = props[key]);
	return targetObject;
}

/**
 * All object utils
 */
const object = {
	objectAssign
}

/**
 * Date utils
 */

/**
 * Check if a value is a valid date
 * @param val 
 * @returns 
 */
 export const isDateValid = (val: any): boolean => !isNaN(new Date(val).valueOf())

/**
 * All date utils
 */
const date = {
	 isDateValid,
}
 

/**
 * Random untils
 */

/**
 * Prefix decentraland wearable urn to a string (default is layer 2 prefix)
 * @param str 
 * @returns 
 */
export function urn(str: string, layer?: number): string {
	switch(layer){
		case 1: return 'urn:decentraland:ethereum:collections-v1:' + str;
		default: case 2: return 'urn:decentraland:matic:collections-v2:' + str;
	}
}

/**
 * Helper functions to calculate specfic scene limitations for Decentraland
 */
export const sceneLimitations = {
	triangles: (nParcels: number) => nParcels * 10000,
	entities: (nParcels: number) => nParcels * 200,
	bodies: (nParcels: number) => nParcels * 300,
	materials: (nParcels: number) => Math.ceil(log2(nParcels+1) * 20),
	textures: (nParcels: number) => Math.ceil(log2(nParcels+1) * 10),
	height: (nParcels: number) => round(log2(nParcels+1) * 20, 2),
	filesizeMb: (nParcels: number) => nParcels * 15,
	fileCount: (nParcels: number) => nParcels * 200
}

/**
 * Calculate all scene limitations at once
 * @param nParcels 
 * @returns object 
 */
export function getSceneLimitations(nParcels: number) {
	let o: any = { parcels: nParcels };
	Object.keys(sceneLimitations).forEach(key => {
		o[key] = sceneLimitations[key](nParcels);
	});
	return o;
}

/**
 * All other utils
 */
const dcl = {
	urn,
	sceneLimitations, 
	getSceneLimitations,
}


export const zootils = { string, number, array, object, date, dcl }



// export function debouncer(
// 	cb: (...args:any[]) => any, 
// 	delay: number = 1,
// ) {
// 	let timeout: {
// 		reset: () => void
// 	} | undefined;
// 	return (...args: any[]) => {
// 		const { reset } = timeout;
// 		if(reset) reset();
// 		timeout = Dash_Wait(() => {
// 			cb(...args);
// 		}, delay);
// 	}
// }