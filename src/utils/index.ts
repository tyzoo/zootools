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

export function randomInt(x:number, y?: number): number {
	if(y === undefined) {
		y = x;
		x = 0;
	}
	return Math.floor(Math.random() * (y - x + 1) + x);
}

export function first(array: any[], n?: number): any {
	if( n === undefined ) return array[0];
	return array.slice( 0, n );
}

export function last(array: any[], n = 1): any {
	if( n === 1 ) return array[array.length - 1]
	return array.filter( ( _: any, idx: number ) => (array.length-idx) <= n )
}

export function sample(array: any[]): any {
	return array[ randomInt( array.length - 1 ) ];
}

export function pluck(array: any[], key: string): any[] {
	return array.map(element=>element[key])
}

export function groupBy(array: any[], key: string): any {
	return array.reduce((group, element) => {
		const keyValue = element[key]
		return {
			...group, 
			[keyValue]: [...(group[keyValue] ?? []), element]
		}
	})
}

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);

export function formatNumber(number:number): string {
	return NUMBER_FORMATTER.format(number);
}
const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat(undefined, {
	notation: "compact"
} as Intl.NumberFormatOptions);

export function formatCompactNumber(number:number): string {
	return COMPACT_NUMBER_FORMATTER.format(number);
}

export function urn(str: string): string {
    const urnPrefix = 'urn:decentraland:matic:collections-v2:';
    return urnPrefix + str;
}

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