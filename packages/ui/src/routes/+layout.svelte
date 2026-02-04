<script lang="ts">
	import "$lib/styles/index.css";
	import type { UJLTDocument } from "@ujl-framework/types";
	import defaultTheme from "@ujl-framework/examples/themes/default" with { type: "json" };
	import {
		Container,
		Label,
		Select,
		SelectTrigger,
		SelectContent,
		SelectItem,
		SelectLabel,
		SelectGroup,
		UJLTheme,
	} from "$lib/index.js";
	import { flavors } from "@ujl-framework/types";
	import { setContext } from "svelte";
	import { page } from "$app/stores";

	let { children } = $props();

	// Theme for testing UJLTheme
	const themeDocument = defaultTheme as unknown as UJLTDocument;
	const themeTokens = themeDocument.ujlt.tokens;

	// Flavor state management
	let selectedFlavor = $state<string>(flavors[0]);
	const flavorSelectOptions = flavors.map((flavor) => ({
		value: flavor,
		label: flavor.charAt(0).toUpperCase() + flavor.slice(1),
	}));
	const flavorSelectTriggerContent = $derived(
		flavorSelectOptions.find((opt) => opt.value === selectedFlavor)?.label ?? "Select a flavor",
	);

	// Share selectedFlavor via context - using a reactive store-like object
	const flavorStore = {
		get value() {
			return selectedFlavor;
		},
	};
	setContext("selectedFlavor", flavorStore);

	// Navigation items
	const navItems = [
		{ href: "/", label: "Overview" },
		{ href: "/forms", label: "Forms" },
		{ href: "/overlays", label: "Overlays" },
		{ href: "/data", label: "Data" },
		{ href: "/feedback", label: "Feedback" },
		{ href: "/media", label: "Media" },
		{ href: "/layout", label: "Layout" },
	];
</script>

<UJLTheme tokens={themeTokens}>
	<!-- Sticky Header -->
	<header
		class="sticky top-0 z-50 border-b bg-background backdrop-blur supports-backdrop-filter:bg-background/90"
	>
		<Container>
			<div class="flex h-16 items-center justify-between gap-4">
				<nav class="hidden items-center gap-1 md:flex">
					{#each navItems as item (item.href)}
						<a
							href={item.href}
							class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground {$page
								.url.pathname === item.href
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground'}"
						>
							{item.label}
						</a>
					{/each}
				</nav>
				<div class="flex items-center gap-2">
					<Label for="flavor-select">Flavor:</Label>
					<Select type="single" bind:value={selectedFlavor}>
						<SelectTrigger id="flavor-select" class="w-[180px]">
							{flavorSelectTriggerContent}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Flavors</SelectLabel>
								{#each flavorSelectOptions as option (option.value)}
									<SelectItem value={option.value} label={option.label}>
										{option.label}
									</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
		</Container>
	</header>

	<!-- Content Section -->
	<section class="flavor-{selectedFlavor} relative bg-flavor py-20">
		<Container>
			{@render children()}
		</Container>
	</section>
</UJLTheme>
