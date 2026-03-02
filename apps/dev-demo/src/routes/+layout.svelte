<script lang="ts">
	import "@fontsource-variable/inter";
	import "@fontsource-variable/jetbrains-mono";
	import "@fontsource-variable/merriweather";
	import "@fontsource-variable/montserrat";
	import "@fontsource-variable/noto-sans";
	import "@fontsource-variable/nunito-sans";
	import "@fontsource-variable/open-sans";
	import "@fontsource-variable/oswald";
	import "@fontsource-variable/raleway";
	import "@fontsource-variable/roboto";
</script>

<svelte:head>
	<style>
		:global(*) {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		:global(html),
		:global(body) {
			height: 100%;
			overflow: hidden;
		}
		:global(#app) {
			height: 100%;
			width: 100%;
		}
	</style>
</svelte:head>

<slot />
