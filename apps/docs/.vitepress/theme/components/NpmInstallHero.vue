<template>
	<div class="npm-install-hero">
		<div class="npm-install-hero-inner">
			<pre class="npm-code"><code>npm install @ujl-framework/crafter</code></pre>
		</div>
	</div>
</template>

<style scoped>
.npm-install-hero {
	display: flex;
	justify-content: center;
	padding: 2rem 24px 0;
}

.npm-install-hero-inner {
	max-width: 560px;
	width: 100%;
}

.npm-code {
	margin: 0;
	padding: 14px 20px;
	background: var(--vp-code-block-bg);
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	font-family: var(--vp-font-family-mono);
	font-size: 15px;
	color: var(--vp-c-text-1);
	text-align: center;
	overflow-x: auto;
}
</style>
