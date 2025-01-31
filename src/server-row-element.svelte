<script lang="ts">
	import type { ServerListElement } from './asset-loaders';

	interface Props {
		server: ServerListElement | undefined;
		removeThisServer: () => void;
	}

	let { server, removeThisServer }: Props = $props();
</script>

<div class="flex flex-row">
	<div class="flex flex-row items-center">
		<button
			aria-label={`Remove Source City: ${server?.city}, ${server?.country}`}
			class="highlightonhover"
			onclick={removeThisServer}
			><div style="padding: 4px">
				<img
					src="https://aaronstanek.com/static-web-content/x.svg"
					width="12px"
					height="12px"
					alt="Remove source city"
				/>
			</div></button
		>
		<div class="w-2"></div>
		<div class="flex-10" style="padding:3px">{`${server?.city}, ${server?.country}`}</div>
	</div>
</div>
