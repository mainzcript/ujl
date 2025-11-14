<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarMenuSub,
		SidebarMenuSubItem,
		SidebarMenuSubButton
	} from '@ujl-framework/ui';

	import type { UJLCModuleObject } from '@ujl-framework/types';

	let { nodes }: { nodes: UJLCModuleObject[] } = $props();

	/**
	 * Erzeugt einen lesbaren Anzeigenamen aus einem UJLC-Node
	 */
	function getDisplayName(node: UJLCModuleObject): string {
		// Priorität 1: Explizite Titel/Labels
		if (node.fields.title) return node.fields.title as string;
		if (node.fields.label) return node.fields.label as string;
		if (node.fields.headline) return node.fields.headline as string;

		// Priorität 2: Content-Felder (gekürzt)
		if (node.fields.content && typeof node.fields.content === 'string') {
			const content = node.fields.content.trim();
			return content.length > 40 ? content.substring(0, 40) + '...' : content;
		}

		// Priorität 3: Type als Fallback (mit schöner Formatierung)
		return formatTypeName(node.type);
	}

	/**
	 * Formatiert den Type-Namen für bessere Lesbarkeit
	 */
	function formatTypeName(type: string): string {
		return type
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	/**
	 * Gibt alle Kinder eines Nodes zurück (aus allen Slots)
	 */
	function getChildren(node: UJLCModuleObject): UJLCModuleObject[] {
		if (!node.slots) return [];

		// Alle Slots durchgehen und Kinder sammeln
		return Object.values(node.slots).flat();
	}

	/**
	 * Prüft ob ein Node Kinder hat
	 */
	function hasChildren(node: UJLCModuleObject): boolean {
		if (!node.slots) return false;
		return Object.values(node.slots).some((slot) => slot.length > 0);
	}
</script>

{#snippet renderNode(node: UJLCModuleObject, level: number = 0)}
	{#if level === 0}
		{#if hasChildren(node)}
			<Collapsible>
				<SidebarMenuItem>
					<CollapsibleTrigger class="group">
						{#snippet child({ props })}
							<SidebarMenuButton {...props}>
								{#snippet child({ props: buttonProps })}
									<button type="button" {...buttonProps}>
										<ChevronRightIcon
											class="size-4 transition-transform group-data-[state=open]:rotate-90"
										/>
										<span>{getDisplayName(node)}</span>
									</button>
								{/snippet}
							</SidebarMenuButton>
						{/snippet}
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{#each getChildren(node) as childNode (childNode.meta.id)}
								<SidebarMenuSubItem>
									{@render renderNode(childNode, level + 1)}
								</SidebarMenuSubItem>
							{/each}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		{:else}
			<SidebarMenuItem>
				<SidebarMenuButton>
					{#snippet child({ props })}
						<button type="button" {...props}>
							<span>{getDisplayName(node)}</span>
						</button>
					{/snippet}
				</SidebarMenuButton>
			</SidebarMenuItem>
		{/if}
	{:else if hasChildren(node)}
		<Collapsible>
			<CollapsibleTrigger class="group">
				{#snippet child({ props })}
					<SidebarMenuSubButton {...props}>
						<ChevronRightIcon
							class="size-4 transition-transform group-data-[state=open]:rotate-90"
						/>
						<span>{getDisplayName(node)}</span>
					</SidebarMenuSubButton>
				{/snippet}
			</CollapsibleTrigger>
			<CollapsibleContent>
				<SidebarMenuSub>
					{#each getChildren(node) as childNode (childNode.meta.id)}
						<SidebarMenuSubItem>
							{@render renderNode(childNode, level + 1)}
						</SidebarMenuSubItem>
					{/each}
				</SidebarMenuSub>
			</CollapsibleContent>
		</Collapsible>
	{:else}
		<SidebarMenuSubButton>
			<span>{getDisplayName(node)}</span>
		</SidebarMenuSubButton>
	{/if}
{/snippet}

<SidebarGroup>
	<SidebarGroupLabel>Document</SidebarGroupLabel>
	<SidebarGroupContent>
		<SidebarMenu>
			{#each nodes as node (node.meta.id)}
				{@render renderNode(node)}
			{/each}
		</SidebarMenu>
	</SidebarGroupContent>
</SidebarGroup>
