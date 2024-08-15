<script lang="ts">
	import ClickOutside from '$lib/click-outside.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { ServerListElement } from './asset-loaders';
	import { findResults } from './search';

	export let serverFilter: (x: number) => boolean;
	export let selectCallback: (x: number) => void;
	export let serverList: ServerListElement[] | 'error' | undefined;

	let boxContent = '';

	$: suggestions =
		serverList === undefined || serverList === 'error' || boxContent.length === 0
			? []
			: findResults(boxContent, serverList).filter(serverFilter).slice(0, 5);

	const handleClickOutside = () => {
		boxContent = '';
	};

	let inputBox: HTMLInputElement | undefined;
	let suggestionsBox: HTMLDivElement | undefined;
	let keypressHandler: ((event: KeyboardEvent) => void) | undefined;

	onMount(() => {
		keypressHandler = (event: KeyboardEvent) => {
			if (boxContent.length === 0 || inputBox === undefined || suggestionsBox === undefined) return;
			const direction =
				event.key === 'ArrowUp' ? 'up' : event.key === 'ArrowDown' ? 'down' : 'none';
			if (direction === 'none') return;
			const suggestionNodes = Array.from(suggestionsBox.children).filter(
				(x) => x instanceof HTMLElement
			) as HTMLElement[];
			if (suggestionNodes.length === 0) return;
			const activeNode = document.activeElement ?? inputBox;
			if (activeNode.contains(inputBox)) {
				event.preventDefault();
				if (direction === 'down') {
					suggestionNodes[0].focus();
				} else {
					suggestionNodes[suggestionNodes.length - 1].focus();
				}
				return;
			}
			for (let suggestionIndex = 0; suggestionIndex < suggestionNodes.length; ++suggestionIndex) {
				if (activeNode.contains(suggestionNodes[suggestionIndex])) {
					event.preventDefault();
					if (direction === 'down') {
						if (suggestionIndex === suggestionNodes.length - 1) {
							inputBox.focus();
						} else {
							suggestionNodes[suggestionIndex + 1].focus();
						}
					} else {
						if (suggestionIndex === 0) {
							inputBox.focus();
						} else {
							suggestionNodes[suggestionIndex - 1].focus();
						}
					}
					return;
				}
			}
		};
		addEventListener('keydown', keypressHandler);
	});

	onDestroy(() => {
		if (keypressHandler) removeEventListener('keydown', keypressHandler);
	});
</script>

<ClickOutside callback={handleClickOutside}>
	<div style="position:relative">
		<input
			style="width: 290px"
			aria-label="Search for a city to add as a source city."
			bind:this={inputBox}
			type="text"
			bind:value={boxContent}
		/>
		<div
			bind:this={suggestionsBox}
			style={suggestions.length > 0 ? '' : 'display: none'}
			class="flex flex-col floaty"
		>
			{#each suggestions as suggestion}
				<button
					aria-label="Accept new source city suggestion"
					class="highlightonhover"
					on:click={() => {
						handleClickOutside();
						selectCallback(suggestion);
					}}
				>
					{serverList === undefined || serverList === 'error'
						? 'undefined'
						: `${serverList[suggestion].city}, ${serverList[suggestion].country}`}
				</button>
			{/each}
		</div>
	</div>
</ClickOutside>

<style>
	.floaty {
		position: absolute;
		background-color: var(--somewhat-black);
		border-width: 2px;
		border-color: var(--somewhat-white);
		border-radius: 5px;
		margin-top: 10px;
		padding: 5px;
	}
</style>
