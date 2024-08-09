import { levenshtein } from './levenshtein';

export const normalizeSearchString = (s: string) => {
	let result = '';
	for (const char of s) {
		const charcode = char.charCodeAt(0);
		if (charcode >= 97 && charcode <= 122) {
			result += String.fromCharCode(charcode - 32);
		} else if (charcode >= 65 && charcode <= 90) {
			result += char;
		}
	}
	return result;
};

export const findResults = (query: string, targets: { index: string }[]) => {
	const normalizedQuery = normalizeSearchString(query);
	const results: [number, number][] = [];
	for (let i = 0; i < targets.length; ++i) {
		let distance: number | null = null;
		if (targets[i].index.indexOf(normalizedQuery) !== -1) {
			distance = (targets[i].index.length - normalizedQuery.length) * 0.01;
		} else {
			distance = levenshtein(normalizedQuery, targets[i].index, {
				maxCost: Math.min(Math.floor(targets[i].index.length / 2), 2),
				insertionCost: 0.1
			});
		}
		if (distance !== null) results.push([i, distance]);
	}
	return results.sort((a, b) => a[1] - b[1]).map((x) => x[0]);
};
