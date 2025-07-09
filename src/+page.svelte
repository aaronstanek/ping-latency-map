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
	import LinkButton from '$lib/buttons/link-button.svelte';
	import Anchor from '$lib/links/anchor.svelte';
	import { scrollToId } from '$lib/links/scroll-to-id';
	import Link from '$lib/links/link.svelte';
	import Hidden from '$lib/hidden.svelte';
	import Card from '$lib/card.svelte';
	import InputField from '$lib/input/input-field.svelte';
	import { parseNonnegativeInteger } from '$lib/input/input-field-parser';

	let baseImage: HTMLImageElement | 'error' | undefined;
	let pingData: PingData | 'error' | undefined;
	let serverList: ServerListElement[] | 'error' | undefined = $state();
	let assetLoadState: 'loading' | 'done' | 'error' = $state('loading');

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

	const thresholdMsInitialValue = 50;
	let thresholdMs: number = $state(thresholdMsInitialValue);
	let sourceServers: number[] = $state([]);
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

	let canvas: HTMLCanvasElement | undefined = $state();

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

	let areAvailableCitiesShown = $state(false);
</script>

<Head
	canonicalUrl="https://aaronstanek.com/projects/ping-latency-map"
	title="Ping Latency Map"
	description="Visualize ping times around the world. Choose cities, set ping latency thresholds, and see which cities respond the fastest."
	image="https://aaronstanek.com/static-web-content/ping-latency-map/base-map-simplified.svg"
/>

<h1 class="text-center">Ping Latency Map</h1>

<Hidden><h2>The App</h2></Hidden>

<div class="flex justify-center mt-3"><Link href="#contents">Jump to Table of Contents</Link></div>

<Anchor name="how-to"
	><div class="mt-6 mb-6">
		The interactive map below shows ping latency between major cities worldwide. You can customize
		the map by selecting source cities and setting a ping latency threshold. If a city has a ping
		latency with any one of the source cities that is less than the ping latency threshold, then
		that city is marked in blue. Otherwise, if the ping latency between a city and all the source
		cities is greater than the threshold, the city is marked in red.
	</div></Anchor
>

<Anchor name="map"><canvas bind:this={canvas} width="800px" height="525px"> </canvas></Anchor>

{#if assetLoadState === 'done'}
	<br />
	<div class="flex flex-col items-center gap-2">
		<div>Ping latency threshold (in milliseconds)</div>
		<InputField
			ariaLabel="Set the ping latency threshold"
			width={75}
			parser={parseNonnegativeInteger((n: number) => {
				thresholdMs = n;
				draw();
			})}
			initialValue={thresholdMsInitialValue.toString()}
		/>
	</div>
	<br />
	<div class="flex flex-col items-center gap-2">
		<div>Add a source city by name</div>
		<ServerSelectionBox
			serverFilter={sourceServersFilter}
			selectCallback={addSourceServer}
			{serverList}
		/>
	</div>
	<br />
	<div class="pb-0.5">Source cities</div>
	<Card>
		<div class="flex flex-col serverlist">
			{#each sourceServers as source}
				<ServerRowElement
					server={serverList === undefined || serverList === 'error'
						? undefined
						: serverList[source]}
					removeThisServer={() => removeSourceServer(source)}
				/>
			{/each}
		</div>
	</Card>
{/if}

<br />

{#if !areAvailableCitiesShown}
	<LinkButton
		callback={() => {
			areAvailableCitiesShown = true;
		}}>See available cities</LinkButton
	>
{:else}
	<div class="flex flex-row">
		<div>Available cities</div>
		<div class="w-2"></div>
		<LinkButton
			callback={() => {
				areAvailableCitiesShown = false;
			}}>Hide</LinkButton
		>
	</div>
	<div class="serverlist">
		{#each serverList === undefined || serverList === 'error' ? [] : sortServers(serverList) as server}
			<div class="flex gap-3" style="padding: 3px">
				<div>{`${server.server.city}, ${server.server.country}`}</div>
				<LinkButton
					callback={() => {
						addSourceServer(server.id);
						scrollToId('map');
					}}>add</LinkButton
				>
			</div>
		{/each}
	</div>
{/if}

<BodyText />

<style>
	canvas {
		width: 100%;
	}
	.serverlist {
		border-width: 1px;
		border-color: var(--card-color);
		border-radius: 5px;
		padding: 5px;
	}
</style>
