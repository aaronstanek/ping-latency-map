export type LevenshteinOptions = {
	maxCost: number;
	allowInsertion?: boolean;
	insertionCost?: number;
	allowDeletion?: boolean;
	deletionCost?: number;
	allowReplacement?: boolean;
	replacementCost?: number;
};

type LevenshteinImplConfig = {
	a: string;
	b: string;
	maxCost: number;
	reducedMaxCost: number;
	allowInsertion: boolean;
	insertionCost: number;
	allowDeletion: boolean;
	deletionCost: number;
	allowReplacement: boolean;
	replacementCost: number;
};

const levenshteinImpl = (
	config: LevenshteinImplConfig,
	aIndex: number,
	bIndex: number,
	cost: number
): number | null => {
	while (aIndex < config.a.length && bIndex < config.b.length) {
		const aChar = config.a.codePointAt(aIndex) as number;
		const bChar = config.b.codePointAt(bIndex) as number;
		if (aChar !== bChar) break;
		const increment = 1 + +(aChar > 0xffff);
		aIndex += increment;
		bIndex += increment;
	}
	if (aIndex >= config.a.length && bIndex >= config.b.length) {
		config.reducedMaxCost = cost;
		return cost;
	}
	let bestResult: number | null = null;
	if (config.allowReplacement && aIndex < config.a.length && bIndex < config.b.length) {
		const newCost = cost + config.replacementCost;
		if (newCost < config.reducedMaxCost && newCost <= config.maxCost) {
			bestResult = levenshteinImpl(
				config,
				aIndex + 1 + +((config.a.codePointAt(aIndex) as number) > 0xffff),
				bIndex + 1 + +((config.b.codePointAt(bIndex) as number) > 0xffff),
				newCost
			);
		}
	}
	if (config.allowInsertion && bIndex < config.b.length) {
		const newCost = cost + config.insertionCost;
		if (newCost < config.reducedMaxCost && newCost <= config.maxCost) {
			const result = levenshteinImpl(
				config,
				aIndex,
				bIndex + 1 + +((config.b.codePointAt(bIndex) as number) > 0xffff),
				newCost
			);
			if (bestResult === null || (result !== null && result < bestResult)) bestResult = result;
		}
	}
	if (config.allowDeletion && aIndex < config.a.length) {
		const newCost = cost + config.deletionCost;
		if (newCost < config.reducedMaxCost && newCost <= config.maxCost) {
			const result = levenshteinImpl(
				config,
				aIndex + 1 + +((config.a.codePointAt(aIndex) as number) > 0xffff),
				bIndex,
				newCost
			);
			if (bestResult === null || (result !== null && result < bestResult)) bestResult = result;
		}
	}
	return bestResult;
};

const isUndefinedOrPositive = (x: number | undefined): boolean => {
	if (x === undefined) return true;
	if (!isFinite(x)) return false;
	return x >= 0;
};

export const levenshtein = (a: string, b: string, options: LevenshteinOptions) => {
	if (!isUndefinedOrPositive(options?.maxCost))
		throw new Error(`Invalid value for maxCost: ${options.maxCost}`);
	if (!isUndefinedOrPositive(options?.insertionCost))
		throw new Error(`Invalid value for insertionCost: ${options.insertionCost}`);
	if (!isUndefinedOrPositive(options?.deletionCost))
		throw new Error(`Invalid value for deletionCost: ${options.deletionCost}`);
	if (!isUndefinedOrPositive(options?.replacementCost))
		throw new Error(`Invalid value for replacementCost: ${options.replacementCost}`);
	return levenshteinImpl(
		{
			a,
			b,
			maxCost: options.maxCost,
			reducedMaxCost: Infinity,
			allowInsertion: options.allowInsertion ?? true,
			insertionCost: options.insertionCost ?? 1,
			allowDeletion: options.allowDeletion ?? true,
			deletionCost: options.deletionCost ?? 1,
			allowReplacement: options.allowReplacement ?? true,
			replacementCost: options.replacementCost ?? 1
		},
		0,
		0,
		0
	);
};
