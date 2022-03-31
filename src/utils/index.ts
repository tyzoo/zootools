export function removeLineBreaks(str: string): string {
	return str.replace(/[\r\n]+/gm, '');
}

export function makeid(length: number): string {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export function randomInt(min:number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function first(array: any[], n = 1){
	if( n === 1 ) return array[0]
	return array.filter( ( _: any, idx: number ) => idx < n )
}

export function last(array: any[], n = 1){
	if( n === 1 ) return array[array.length - 1]
	return array.filter( ( _: any, idx: number ) => (array.length-idx) <= n )
}

export function sample(array: any[]){
	return array[randomInt(0, array.length-1)]
}

export function pluck(array: any[], key: string){
	return array.map(element=>element[key])
}

export function groupBy(array: any[], key: string){
	return array.reduce((group, element) => {
		const keyValue = element[key]
		return {
			...group, 
			[keyValue]: [...(group[keyValue] ?? []), element]
		}
	})
}

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);

export function formatNumber(number:number){
	return NUMBER_FORMATTER.format(number);
}
const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat(undefined, {
	notation: "compact"
} as Intl.NumberFormatOptions);

export function formatCompactNumber(number:number){
	return COMPACT_NUMBER_FORMATTER.format(number);
}