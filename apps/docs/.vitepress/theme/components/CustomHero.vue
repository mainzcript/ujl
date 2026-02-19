<script setup lang="ts">
import { ref } from "vue";
import { Copy, Check } from "lucide-vue-next";

const props = defineProps<{
	name: string;
	text: string;
	tagline: string;
	image: { src: string; alt: string };
	installCommand?: string;
	installTitle?: string;
	actions: Array<{ theme: string; text: string; link: string }>;
}>();

const copied = ref(false);

const copyToClipboard = async () => {
	if (!props.installCommand) return;

	try {
		await navigator.clipboard.writeText(props.installCommand);
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
	<div class="custom-hero">
		<div class="vp-doc-container hero-grid">
			<div class="hero-content">
				<h1 class="name">{{ name }}</h1>
				<p class="text">{{ text }}</p>
				<p class="tagline">{{ tagline }}</p>

				<div v-if="installCommand" class="install-section">
					<h2 v-if="installTitle" class="install-title">{{ installTitle }}</h2>
					<div class="install-command">
						<code class="command-text">{{ installCommand }}</code>
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

				<div class="actions">
					<a
						v-for="action in actions"
						:key="action.text"
						:href="action.link"
						:class="['action-button', `action-${action.theme}`]"
					>
						{{ action.text }}
					</a>
				</div>
			</div>

			<div class="hero-image">
				<img :src="image.src" :alt="image.alt" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.custom-hero {
	position: relative;
	padding: 32px 0;
	background: var(--vp-c-bg);
}

@media (min-width: 768px) {
	.custom-hero {
		padding: 64px 0;
	}
}

.hero-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 2rem;
	align-items: center;
}

@media (min-width: 768px) {
	.hero-grid {
		grid-template-columns: 1fr 1fr;
	}
}

.hero-content {
	text-align: center;
}

@media (min-width: 768px) {
	.hero-content {
		text-align: left;
	}
}

.name {
	font-size: 2rem;
	font-weight: 700;
	line-height: 1.2;
	margin: 0 0 0.375rem;
	background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, var(--vp-c-brand-2) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

@media (min-width: 768px) {
	.name {
		font-size: 3rem;
	}
}

.text {
	font-size: 1.5rem;
	font-weight: 600;
	line-height: 1.3;
	margin: 0 0 0.75rem;
	color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
	.text {
		font-size: 2rem;
	}
}

.tagline {
	font-size: 1rem;
	line-height: 1.6;
	margin: 0 0 1.5rem;
	color: var(--vp-c-text-2);
	max-width: 600px;
}

@media (min-width: 768px) {
	.tagline {
		font-size: 1.125rem;
	}
}

@media (min-width: 768px) {
	.hero-content .tagline {
		margin-left: 0;
	}
}

.install-section {
	margin: 1.5rem 0;
}

.install-title {
	font-size: 1.125rem;
	font-weight: 600;
	margin-bottom: 0.75rem;
	color: var(--vp-c-text-1);
}

.install-command {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.875rem 1.25rem;
	background: var(--vp-c-bg-soft);
	border: 1px solid var(--vp-c-divider);
	border-radius: var(--vp-doc-border-radius);
	transition: all 0.3s;
}

.install-command:hover {
	border-color: var(--vp-c-brand-1);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.command-text {
	flex: 1;
	font-family: var(--vp-font-family-mono);
	font-size: 0.875rem;
	color: var(--vp-c-brand-1);
	text-align: left;
	background: transparent;
	padding: 0;
}

@media (min-width: 768px) {
	.command-text {
		font-size: 1rem;
	}
}

.copy-button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	background: transparent;
	border: none;
	border-radius: 0.5rem;
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

.actions {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
	justify-content: center;
	margin-top: 1.5rem;
}

@media (min-width: 768px) {
	.actions {
		justify-content: flex-start;
	}
}

.action-button {
	display: inline-block;
	padding: 0.625rem 1.5rem;
	font-size: 1rem;
	font-weight: 600;
	text-decoration: none;
	border-radius: var(--vp-doc-border-radius);
	transition: all 0.3s;
}

.action-brand {
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}

.action-brand:hover {
	background: var(--vp-c-brand-2);
}

.action-alt {
	background: var(--vp-c-bg-soft);
	color: var(--vp-c-text-1);
	border: 1px solid var(--vp-c-divider);
}

.action-alt:hover {
	border-color: var(--vp-c-brand-1);
	color: var(--vp-c-brand-1);
}

.hero-image {
	display: flex;
	align-items: center;
	justify-content: center;
}

.hero-image img {
	width: 100%;
	max-width: 400px;
	height: auto;
}
</style>
