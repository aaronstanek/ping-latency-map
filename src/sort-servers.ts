import type { ServerListElement } from './asset-loaders';

type ServerPointer = {
	id: number;
	server: ServerListElement;
};

const sortServersCompare = (a: ServerPointer, b: ServerPointer) => {
	if (a.server.country !== b.server.country) return a.server.country < b.server.country ? -1 : 1;
	if (a.server.city !== b.server.city) return a.server.city < b.server.city ? -1 : 1;
	return a.id - b.id;
};

export const sortServers = (serverList: ServerListElement[]) => {
	let serverPointers = [];
	for (let id = 0; id < serverList.length; id++) {
		serverPointers.push({
			id,
			server: serverList[id]
		});
	}
	serverPointers.sort(sortServersCompare);
	return serverPointers;
};
