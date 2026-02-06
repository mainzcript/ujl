<script lang="ts">
	import "$lib/styles/index.css";

	let { children } = $props();
</script>

<div style="padding: 1rem;">
	{@render children()}
</div>
