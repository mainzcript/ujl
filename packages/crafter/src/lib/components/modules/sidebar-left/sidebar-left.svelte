<script lang="ts">
	import MessageCircleQuestionIcon from '@lucide/svelte/icons/message-circle-question';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import PencilRulerIcon from '@lucide/svelte/icons/pencil-ruler';
	import PaletteIcon from '@lucide/svelte/icons/palette';

	import Header from './header.svelte';
	import Editor from './editor/editor.svelte';
	import Designer from './designer/designer.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import { Sidebar, SidebarContent, SidebarRail } from '@ujl-framework/ui';
	import type { Component, ComponentProps } from 'svelte';

	// Import des UJLC Dokuments (oder als Prop übergeben)
	import showcaseDocumentJson from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import type { UJLCDocument } from '@ujl-framework/types';

	const showcaseDocument = showcaseDocumentJson as unknown as UJLCDocument;

	type Mode = {
		name: string;
		icon: Component;
		fileType: string;
	};

	const modes: Mode[] = [
		{
			name: 'Editor',
			icon: PencilRulerIcon,
			fileType: 'ujlc'
		},
		{
			name: 'Designer',
			icon: PaletteIcon,
			fileType: 'ujlt'
		}
	];

	const data = {
		navMain: [
			{
				title: 'Example Action',
				url: '#',
				icon: SparklesIcon
			}
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '#',
				icon: Settings2Icon
			},
			{
				title: 'Help',
				url: '#',
				icon: MessageCircleQuestionIcon
			}
		]
	};

	let activeMode = $state(modes[0]);

	function handleModeChange(mode: Mode) {
		activeMode = mode;
	}

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar> = $props();
</script>

<Sidebar class="border-r-0" bind:ref {...restProps}>
	<Header {activeMode} onModeChange={handleModeChange} navMainItems={data.navMain} />
	<SidebarContent>
		{#if activeMode.fileType === 'ujlc'}
			<Editor ujlcData={showcaseDocument.ujlc.root} />
		{:else}
			<Designer />
		{/if}
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</SidebarContent>
	<SidebarRail />
</Sidebar>
