<script lang="ts">
	import ModuleActionBar from "./ModuleActionBar.svelte";
	import { setApp, setAppRegistry, useApp } from "$lib/components/ui/app/context.svelte.js";
	import {
		createCanvasDragContext,
		createScrollContext,
		setCanvasDragContext,
		setScrollContext,
		type CanvasDragContext,
	} from "$lib/stores/index.js";

	let {
		onReady,
		onDragDrop,
	}: {
		onReady?: (helpers: {
			app: ReturnType<typeof useApp>;
			canvasDrag: CanvasDragContext;
			container: HTMLDivElement | null;
		}) => void;
		onDragDrop?: () => void;
	} = $props();

	const app = setApp({
		initialSidebarOpen: true,
		initialPanelOpen: false,
	});
	setAppRegistry();

	const canvasDrag = createCanvasDragContext();
	setCanvasDragContext(canvasDrag);

	const scrollContext = createScrollContext();
	setScrollContext(scrollContext);

	let container: HTMLDivElement | null = $state(null);

	$effect(() => {
		onReady?.({
			app,
			canvasDrag,
			container,
		});
	});
</script>

<div bind:this={container}>
	<div data-ujl-module-id="module-a"></div>

	{#if container}
		<ModuleActionBar
			moduleId="module-a"
			containerElement={container}
			dragDisplayName="Hero: Module A"
			dragIconSvg="<svg>hero</svg>"
			dragHomePosition={{
				ownerModuleId: null,
				slotName: "root",
				previousSiblingId: null,
				nextSiblingId: null,
			}}
			canMoveUp={true}
			canMoveDown={true}
			onSelect={() => {}}
			onMoveUp={() => {}}
			onMoveDown={() => {}}
			onCopy={() => {}}
			onCut={() => {}}
			onPaste={() => {}}
			onDelete={() => {}}
			onInsert={() => {}}
			onDragDrop={() => onDragDrop?.()}
		/>
	{/if}
</div>
