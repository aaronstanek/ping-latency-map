<script lang="ts">
	import type { ServerListElement } from './asset-loaders';

	export let server: ServerListElement | undefined;
	export let removeThisServer: () => void;
</script>

<div class="flex flex-row">
	<div class="flex flex-row items-center">
		<button
			aria-label={`Remove Source City: ${server?.city}, ${server?.country}`}
			class="highlightonhover"
			on:click={removeThisServer}
			><img
				src="https://aaronstanek.com/static-web-content/x.svg"
				width="20px"
				height="20px"
				alt="Remove source city"
			/></button
		>
		<div class="w-2"></div>
		<div class="flex-10" style="padding:3px">{`${server?.city}, ${server?.country}`}</div>
	</div>
</div>
