import { normalizeSearchString } from './search';

export const downloadBaseImage = async () => {
	let resolver: ((x: HTMLImageElement | 'error') => void) | undefined;
	const returnValue: Promise<HTMLImageElement | 'error'> = new Promise((resolve) => {
		resolver = resolve;
	});
	const img = new Image();
	img.onload = () => {
		if (resolver !== undefined) resolver(img);
	};
	img.onerror = () => {
		if (resolver !== undefined) resolver('error');
	};
	img.src = 'https://aaronstanek.com/static-web-content/ping-latency-map/base-map-simplified.svg';
	return returnValue;
};

export type PingDataElement = number | null;

export type PingData = PingDataElement[][];

export const downloadPingData = async () => {
	const response = await fetch(
		'https://aaronstanek.com/static-web-content/ping-latency-map/pings.data'
	);
	if (response.status < 200 || response.status > 299) return 'error';
	const body = new Uint8Array(await (await response.blob()).arrayBuffer());
	const destinations: (number | null)[][] = [[]];
	let readIndex = 0;
	// eslint-disable-next-line no-constant-condition
	for (let destination = 1; true; ++destination) {
		if (readIndex >= body.length) return destinations;
		const sources: (number | null)[] = [];
		destinations.push(sources);
		for (let source = 0; source < destination; ++source) {
			if (readIndex >= body.length) return destinations;
			const byte = body[readIndex++];
			if (byte === 255) {
				sources.push(null);
			} else {
				sources.push(((byte & 31) << (byte >> 5)) / 2);
			}
		}
	}
};

export type ServerListElement = {
	city: string;
	country: string;
	index: string;
	x: number;
	y: number;
};

export const downloadServerList = async () => {
	const response = await fetch(
		'https://aaronstanek.com/static-web-content/ping-latency-map/servers.json'
	);
	if (response.status < 200 || response.status > 299) return 'error';
	const body = await response.json();
	if (!Array.isArray(body)) return 'error';
	const servers: ServerListElement[] = [];
	for (const server of body) {
		if (!Array.isArray(server)) return 'error';
		const city = server[0];
		const country = server[1];
		const x = server[2];
		const y = server[3];
		if (
			typeof city !== 'string' ||
			typeof country !== 'string' ||
			typeof x !== 'number' ||
			typeof y !== 'number'
		)
			return 'error';
		servers.push({
			city,
			country,
			index: normalizeSearchString(`${city}${country}`),
			x,
			y
		});
	}
	return servers;
};
