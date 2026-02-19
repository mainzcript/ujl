<script setup lang="ts">
defineProps<{
	columns?: number;
}>();
</script>

<template>
	<div class="vp-doc-container feature-grid" :style="{ '--columns': columns || 3 }">
		<slot />
	</div>
</template>

<style scoped>
.feature-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 1rem;
	margin-top: 1.5rem;
	margin-bottom: 1.5rem;
}

@media (min-width: 960px) {
	.feature-grid {
		grid-template-columns: repeat(var(--columns), 1fr);
	}
}
</style>
