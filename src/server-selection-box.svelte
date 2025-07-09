<script lang="ts">
	import ClickOutside from '$lib/click-outside.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { ServerListElement } from './asset-loaders';
	import { findResults } from './search';
	import InputField from '$lib/input/input-field.svelte';

	interface Props {
		serverFilter: (x: number) => boolean;
		selectCallback: (x: number) => void;
		serverList: ServerListElement[] | 'error' | undefined;
	}

	let { serverFilter, selectCallback, serverList }: Props = $props();

	let boxContent = $state('');

	let suggestions = $derived(
		serverList === undefined || serverList === 'error' || boxContent.length === 0
			? []
			: findResults(boxContent, serverList).filter(serverFilter).slice(0, 5)
	);

	const handleClickOutside = () => {
		inputBox?.writeValue('');
	};

	let inputBox: InputField | undefined = $state();
	let suggestionsBox: HTMLDivElement | undefined = $state();
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
			const activeNode = document.activeElement ?? inputBox.rawHtmlElement();
			if (activeNode.contains(inputBox.rawHtmlElement())) {
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
							inputBox.rawHtmlElement().focus();
						} else {
							suggestionNodes[suggestionIndex + 1].focus();
						}
					} else {
						if (suggestionIndex === 0) {
							inputBox.rawHtmlElement().focus();
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
		<InputField
			bind:this={inputBox}
			ariaLabel="Search for a city to add as a source city."
			width={290}
			parser={(s) => {
				boxContent = s;
			}}
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
					onclick={() => {
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
		background-color: var(--background-color);
		border-width: 2px;
		border-color: var(--card-color);
		border-radius: 5px;
		margin-top: 10px;
		padding: 5px;
	}
</style>
