<script setup lang="ts">
import { ref } from "vue";
import { Copy, Check } from "lucide-vue-next";

const props = defineProps<{
	command: string;
	title?: string;
}>();

const copied = ref(false);

const copyToClipboard = async () => {
	try {
		await navigator.clipboard.writeText(props.command);
		copied.value = true;
		setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch (err) {
		console.error("Failed to copy:", err);
	}
};
</script>

<template>
	<div class="install-command-wrapper">
		<h2 v-if="title" class="install-title">{{ title }}</h2>
		<div class="install-command">
			<code class="command-text">{{ command }}</code>
			<button
				class="copy-button"
				@click="copyToClipboard"
				:aria-label="copied ? 'Copied!' : 'Copy to clipboard'"
			>
				<Check v-if="copied" :size="20" />
				<Copy v-else :size="20" />
			</button>
		</div>
	</div>
</template>

<style scoped>
.install-command-wrapper {
	margin: 3rem auto;
	max-width: 600px;
	text-align: center;
}

.install-title {
	font-size: 1.5rem;
	font-weight: 600;
	margin-bottom: 1.5rem;
	color: var(--vp-c-text-1);
}

.install-command {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.5rem;
	background: var(--vp-c-bg-soft);
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	transition: all 0.3s;
}

.install-command:hover {
	border-color: var(--vp-c-brand-1);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.command-text {
	flex: 1;
	font-family: var(--vp-font-family-mono);
	font-size: 1rem;
	color: var(--vp-c-brand-1);
	text-align: left;
	background: transparent;
	padding: 0;
}

.copy-button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	background: transparent;
	border: none;
	border-radius: 4px;
	color: var(--vp-c-text-2);
	cursor: pointer;
	transition: all 0.2s;
	flex-shrink: 0;
}

.copy-button:hover {
	background: var(--vp-c-bg-alt);
	color: var(--vp-c-brand-1);
}

.copy-button:active {
	transform: scale(0.95);
}
</style>
