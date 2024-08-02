import type { ServerListElement } from './asset-loaders';

const sortServersCompare = (a: ServerListElement, b: ServerListElement) => {
	if (a.country !== b.country) return a.country < b.country ? -1 : 1;
	if (a.city !== b.city) return a.city < b.city ? -1 : 1;
	return 0;
};

export const sortServers = (serverList: ServerListElement[]) =>
	serverList.slice(0).sort(sortServersCompare);
