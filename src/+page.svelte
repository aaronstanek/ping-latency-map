<script lang="ts">
	import { onMount } from 'svelte';
	import { findResults } from './search';
	import { browser } from '$app/environment';
	import { downloadBaseImage, downloadPingData, downloadServerList } from './asset-loaders';
	import type { PingData, ServerListElement } from './asset-loaders';
	import ServerRowElement from './server-row-element.svelte';
	import ServerSelectionBox from './server-selection-box.svelte';
	import { sortServers } from './sort-servers';
	import Head from '$lib/head.svelte';
	import BodyText from './body-text.svelte';
	import Footer from './footer.svelte';

	let baseImage: HTMLImageElement | 'error' | undefined;
	let pingData: PingData | 'error' | undefined;
	let serverList: ServerListElement[] | 'error' | undefined;
	let assetLoadState: 'loading' | 'done' | 'error' = 'loading';

	if (browser) {
		const countAssets = () => {
			if (baseImage === 'error' || pingData === 'error' || serverList === 'error') {
				assetLoadState = 'error';
			} else if (baseImage !== undefined && pingData !== undefined && serverList !== undefined) {
				assetLoadState = 'done';
			}
		};
		(async () => {
			baseImage = await downloadBaseImage();
			countAssets();
		})();
		(async () => {
			pingData = await downloadPingData();
			countAssets();
		})();
		(async () => {
			serverList = await downloadServerList();
			countAssets();
		})();
	}

	let thresholdMs: number = 50;
	let sourceServers: number[] = [];
	const sourceServersFilter = (x: number) => !sourceServers.includes(x);
	const addSourceServer = (x: number) => {
		if (!sourceServers.includes(x)) {
			sourceServers.push(x);
			sourceServers = sourceServers;
			draw();
		}
	};
	const removeSourceServer = (x: number) => {
		sourceServers = sourceServers.filter((server) => server !== x);
		draw();
	};

	let canvas: HTMLCanvasElement | undefined;

	const getPingTime = (pingData: (number | null)[][], a: number, b: number) => {
		if (a === b) return 0;
		const source = Math.min(a, b);
		const destination = Math.max(a, b);
		const firstLookup = pingData[destination];
		if (firstLookup === undefined) return null;
		const secondLookup = firstLookup[source];
		return secondLookup ?? null;
	};

	let spareCanvas: HTMLCanvasElement | undefined;

	const draw = () => {
		if (canvas === undefined) return;
		if (baseImage === undefined || baseImage === 'error') return;
		if (pingData === undefined || pingData === 'error') return;
		if (serverList === undefined || serverList === 'error') return;
		const ctx = canvas.getContext('2d');
		if (ctx === null) return;
		if (
			spareCanvas === undefined ||
			spareCanvas.width !== canvas.width ||
			spareCanvas.height !== canvas.height
		) {
			spareCanvas = document.createElement('canvas');
			spareCanvas.width = canvas.width;
			spareCanvas.height = canvas.height;
			const spareCtx = spareCanvas.getContext('2d');
			if (spareCtx === null) return;
			spareCtx.fillStyle = 'white';
			spareCtx.fillRect(0, 0, spareCanvas.width, spareCanvas.height);
			spareCtx.drawImage(baseImage, 0, 0, spareCanvas.width, spareCanvas.height * (611 / 525));
		}
		ctx.drawImage(spareCanvas, 0, 0);
		for (let i = 0; i < serverList.length; ++i) {
			const server = serverList[i];
			let smallestPingTime: number | null = null;
			for (const sourceServer of sourceServers) {
				const pingTime = getPingTime(pingData, i, sourceServer);
				if (smallestPingTime === null || (pingTime !== null && pingTime < smallestPingTime))
					smallestPingTime = pingTime;
			}
			if (smallestPingTime === null || smallestPingTime >= thresholdMs) {
				ctx.fillStyle = 'rgb(175 0 64)';
			} else {
				ctx.fillStyle = 'rgb(0 75 219)';
			}
			ctx.beginPath();
			ctx.arc(
				server.x * (canvas.width / 1652.47),
				server.y * ((canvas.height * (611 / 525)) / 1220.638),
				3 * (canvas.width / 800),
				0,
				2 * Math.PI
			);
			ctx.fill();
		}
	};

	onMount(async () => {
		const startTime = Date.now();
		while (assetLoadState !== 'done') {
			if (assetLoadState === 'error' || Date.now() - startTime >= 60 * 1000) {
				alert('An error occurred while loading the page. Please reload.');
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		const results = findResults('Washington', serverList as ServerListElement[]);
		if (results.length > 0) {
			sourceServers = [results[0]];
		}
		draw();
	});

	let areAvailableCitiesShown = false;
</script>

<Head
	canonicalUrl="https://aaronstanek.com/projects/ping-latency-map"
	title="Ping Latency Map"
	description="Discover how quickly digital messages travel around the world with WonderNetwork's interactive ping map. Choose cities, set time thresholds, and see which cities respond the fastest. Explore now!"
	image="https://upload.wikimedia.org/wikipedia/commons/1/14/Mercator_Projection.svg"
/>

<BodyText />

<canvas bind:this={canvas} width="800px" height="525px"> </canvas>

{#if assetLoadState === 'done'}
	<br />
	<div class="flex flex-row items-center">
		<div>Ping time threshold (in milliseconds)</div>
		<div class="w-2"></div>
		<input
			aria-label="Set the time threshold"
			type="number"
			bind:value={thresholdMs}
			on:input={draw}
		/>
	</div>
	<br />
	<div class="flex flex-row items-center">
		<div>Add a source city by name</div>
		<div class="w-2"></div>
		<ServerSelectionBox
			serverFilter={sourceServersFilter}
			selectCallback={addSourceServer}
			{serverList}
		/>
	</div>
	<br />
	<div class="pb-0.5">Source cities</div>
	<div class="flex flex-col serverlist">
		{#each sourceServers as source}
			<ServerRowElement
				server={serverList === undefined || serverList === 'error' ? undefined : serverList[source]}
				removeThisServer={() => removeSourceServer(source)}
			/>
		{/each}
	</div>
{/if}

<br />

{#if !areAvailableCitiesShown}
	<button
		class="falselink"
		on:click={() => {
			areAvailableCitiesShown = true;
		}}>See available cities</button
	>
{:else}
	<div class="flex flex-row">
		<div>Available cities</div>
		<div class="w-2"></div>
		<button
			class="falselink"
			on:click={() => {
				areAvailableCitiesShown = false;
			}}>Hide</button
		>
	</div>
	<div class="serverlist">
		{#each serverList === undefined || serverList === 'error' ? [] : sortServers(serverList) as server}
			<div style="padding:3px">{`${server?.city}, ${server?.country}`}</div>
		{/each}
	</div>
{/if}

<Footer />

<style>
	canvas {
		width: 100%;
	}
	.serverlist {
		border-width: 1px;
		border-color: var(--somewhat-white);
		border-radius: 5px;
		padding: 5px;
	}
</style>
