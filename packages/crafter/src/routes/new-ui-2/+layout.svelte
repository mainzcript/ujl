<script lang="ts">
	import { App } from '$lib/components/ui/app';

	let { children } = $props();
</script>

<App>
	{@render children()}
</App>
