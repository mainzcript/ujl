<script setup lang="ts">
import { computed, type Component } from "vue";
import * as icons from "lucide-vue-next";

const props = defineProps<{
	icon: string;
	title: string;
	description: string;
}>();

const IconComponent = computed(() => {
	return (icons[props.icon as keyof typeof icons] || icons.HelpCircle) as Component;
});
</script>

<template>
	<div class="feature-card">
		<component :is="IconComponent" class="feature-icon" :size="32" />
		<h3>{{ title }}</h3>
		<p>{{ description }}</p>
	</div>
</template>

<style scoped>
.feature-card {
	padding: 1.25rem;
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--vp-doc-border-radius);
	transition: all 0.3s;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.feature-card:hover {
	border-color: var(--vp-c-brand-1);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transform: translateY(-2px);
}

.feature-icon {
	color: var(--vp-c-brand-1);
	margin-bottom: 0.75rem;
	flex-shrink: 0;
}

.feature-card h3 {
	margin: 0.375rem 0;
	font-size: 1.25rem;
	font-weight: 600;
}

.feature-card p {
	margin: 0;
	color: var(--vp-c-text-2);
	line-height: 1.6;
}
</style>
