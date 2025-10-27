<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div style="padding: 1rem;">
	{@render children()}
</div>
