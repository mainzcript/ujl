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

	// Import des UJLC Dokuments TODO: (oder als Prop übergeben)
	// import showcaseDocumentJson from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import type { UJLCDocument } from '@ujl-framework/types';

	// const showcaseDocument = showcaseDocumentJson as unknown as UJLCDocument;
	const showcaseDocument: UJLCDocument = {
		ujlc: {
			meta: {
				title: 'UJL Framework Example Document',
				description: 'A comprehensive example showcasing UJL framework capabilities',
				tags: ['example', 'demo', 'ujl', 'framework'],
				updated_at: '2024-01-15T10:30:00Z',
				_version: '0.0.1',
				_instance: 'example-001',
				_embedding_model_hash: 'sha256:abc123def456'
			},
			root: [
				{
					type: 'container',
					meta: {
						id: 'main-container-001',
						updated_at: '2024-01-15T10:30:00Z',
						_embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
					},
					fields: {},
					slots: {
						body: [
							{
								type: 'text',
								meta: {
									id: 'hero-001',
									updated_at: '2024-01-15T10:30:00Z',
									_embedding: [0.6, 0.7, 0.8, 0.9, 1.0]
								},
								fields: {
									content: 'Welcome to UJL Framework - Build amazing web layouts with ease'
								},
								slots: {}
							},
							{
								type: 'grid',
								meta: {
									id: 'grid-001',
									updated_at: '2024-01-15T10:30:00Z',
									_embedding: [1.1, 1.2, 1.3, 1.4, 1.5]
								},
								fields: {},
								slots: {
									items: [
										{
											type: 'card',
											meta: {
												id: 'feature-001',
												updated_at: '2024-01-15T10:30:00Z',
												_embedding: [1.6, 1.7, 1.8, 1.9, 2.0]
											},
											fields: {
												title: 'Type-Safe Fields',
												description:
													'Built with TypeScript for maximum type safety and developer experience'
											},
											slots: {
												content: [
													{
														type: 'button',
														meta: {
															id: 'button-005',
															updated_at: '2024-01-15T10:30:00Z',
															_embedding: [3.6, 3.7, 3.8, 3.9, 4.0]
														},
														fields: {
															label: 'Try UJL Framework',
															href: 'https://ujl-framework.org'
														},
														slots: {}
													}
												]
											}
										},
										{
											type: 'card',
											meta: {
												id: 'feature-002',
												updated_at: '2024-01-15T10:30:00Z',
												_embedding: [2.1, 2.2, 2.3, 2.4, 2.5]
											},
											fields: {
												title: 'Modular Architecture',
												description: 'Compose complex layouts from simple, reusable modules'
											},
											slots: {
												content: []
											}
										},
										{
											type: 'card',
											meta: {
												id: 'feature-003',
												updated_at: '2024-01-15T10:30:00Z',
												_embedding: [2.6, 2.7, 2.8, 2.9, 3.0]
											},
											fields: {
												title: 'Flexible Rendering',
												description: 'Render to any output format with customizable renderers'
											},
											slots: {
												content: []
											}
										}
									]
								}
							},
							{
								type: 'text',
								meta: {
									id: 'text-001',
									updated_at: '2024-01-15T10:30:00Z',
									_embedding: [3.1, 3.2, 3.3, 3.4, 3.5]
								},
								fields: {
									content:
										'UJL Framework provides a powerful, type-safe way to build dynamic web layouts. With its modular architecture and flexible rendering system, you can create anything from simple content pages to complex interactive applications.'
								},
								slots: {}
							},
							{
								type: 'button',
								meta: {
									id: 'button-001',
									updated_at: '2024-01-15T10:30:00Z',
									_embedding: [3.6, 3.7, 3.8, 3.9, 4.0]
								},
								fields: {
									label: 'Try UJL Framework',
									href: 'https://ujl-framework.org'
								},
								slots: {}
							},
							{
								type: 'container',
								meta: {
									id: 'nested-container-001',
									updated_at: '2024-01-15T10:30:00Z',
									_embedding: [3.6, 3.7, 3.8, 3.9, 4.0]
								},
								fields: {},
								slots: {
									body: [
										{
											type: 'call-to-action',
											meta: {
												id: 'cta-001',
												updated_at: '2024-01-15T10:30:00Z',
												_embedding: [4.1, 4.2, 4.3, 4.4, 4.5]
											},
											fields: {
												headline: 'Ready to get started?',
												description:
													'Join thousands of developers building amazing web experiences with UJL Framework',
												actionButtonPrimaryLabel: 'Start Building',
												actionButtonPrimaryUrl: 'https://ujl-framework.org',
												actionButtonSecondaryLabel: 'View Documentation',
												actionButtonSecondaryUrl: 'https://ujl-framework.org'
											},
											slots: {}
										}
									]
								}
							}
						]
					}
				}
			]
		}
	};

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
