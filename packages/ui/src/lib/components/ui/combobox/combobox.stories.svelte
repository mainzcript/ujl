<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Combobox,
		ComboboxTrigger,
		ComboboxContent,
		ComboboxInput,
		ComboboxList,
		ComboboxEmpty,
		ComboboxGroup,
		ComboboxItem,
		ComboboxSeparator
	} from './index.ts';
	import { Label } from '../label/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Forms/Combobox',
		component: Combobox,
		tags: ['autodocs'],
		argTypes: {
			open: {
				control: 'boolean',
				description: 'Whether the combobox dropdown is open',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			}
		},
		args: {
			open: true
		}
	});

	const frameworks = [
		{ value: 'svelte', label: 'Svelte' },
		{ value: 'react', label: 'React' },
		{ value: 'vue', label: 'Vue' },
		{ value: 'angular', label: 'Angular' },
		{ value: 'solid', label: 'Solid' },
		{ value: 'qwik', label: 'Qwik' }
	];

	const countries = [
		{ value: 'us', label: 'United States', flag: '🇺🇸' },
		{ value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
		{ value: 'de', label: 'Germany', flag: '🇩🇪' },
		{ value: 'fr', label: 'France', flag: '🇫🇷' },
		{ value: 'jp', label: 'Japan', flag: '🇯🇵' },
		{ value: 'au', label: 'Australia', flag: '🇦🇺' }
	];
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Combobox {...args} open={true}>
			<ComboboxTrigger
				onclick={() => (args.open = true)}
				class="w-[200px]"
				placeholder="Select framework..."
			/>
			<ComboboxContent>
				<ComboboxInput placeholder="Search framework..." />
				<ComboboxList>
					<ComboboxEmpty>No framework found.</ComboboxEmpty>
					{#each frameworks as framework}
						<ComboboxItem value={framework.value} label={framework.label} />
					{/each}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	{/snippet}
</Story>

<!-- With Label -->
<Story name="With Label">
	{#snippet template()}
		<div class="grid w-full max-w-sm gap-1.5">
			<Label for="framework">Framework</Label>
			<Combobox>
				<ComboboxTrigger id="framework" class="w-full" placeholder="Select framework..." />
				<ComboboxContent>
					<ComboboxInput placeholder="Search framework..." />
					<ComboboxList>
						<ComboboxEmpty>No framework found.</ComboboxEmpty>
						{#each frameworks as framework}
							<ComboboxItem value={framework.value} label={framework.label} />
						{/each}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</div>
	{/snippet}
</Story>

<!-- With Groups -->
<Story name="With Groups">
	{#snippet template()}
		<Combobox>
			<ComboboxTrigger class="w-[250px]" placeholder="Select a language..." />
			<ComboboxContent>
				<ComboboxInput placeholder="Search languages..." />
				<ComboboxList>
					<ComboboxEmpty>No language found.</ComboboxEmpty>
					<ComboboxGroup heading="Popular">
						<ComboboxItem value="javascript" label="JavaScript" />
						<ComboboxItem value="typescript" label="TypeScript" />
						<ComboboxItem value="python" label="Python" />
					</ComboboxGroup>
					<ComboboxSeparator />
					<ComboboxGroup heading="Compiled">
						<ComboboxItem value="rust" label="Rust" />
						<ComboboxItem value="go" label="Go" />
						<ComboboxItem value="cpp" label="C++" />
					</ComboboxGroup>
					<ComboboxSeparator />
					<ComboboxGroup heading="Functional">
						<ComboboxItem value="haskell" label="Haskell" />
						<ComboboxItem value="elixir" label="Elixir" />
						<ComboboxItem value="ocaml" label="OCaml" />
					</ComboboxGroup>
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	{/snippet}
</Story>

<!-- With Custom Content -->
<Story name="With Custom Content">
	{#snippet template()}
		<Combobox>
			<ComboboxTrigger class="w-[220px]" placeholder="Select country..." />
			<ComboboxContent>
				<ComboboxInput placeholder="Search country..." />
				<ComboboxList>
					<ComboboxEmpty>No country found.</ComboboxEmpty>
					{#each countries as country}
						<ComboboxItem value={country.value} label={country.label}>
							<span class="flex items-center gap-2">
								<span>{country.flag}</span>
								<span>{country.label}</span>
							</span>
						</ComboboxItem>
					{/each}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	{/snippet}
</Story>

<!-- With Status Indicators -->
<Story name="With Status Indicators">
	{#snippet template()}
		<Combobox>
			<ComboboxTrigger class="w-[200px]" placeholder="Select status..." />
			<ComboboxContent>
				<ComboboxInput placeholder="Search status..." />
				<ComboboxList>
					<ComboboxEmpty>No status found.</ComboboxEmpty>
					<ComboboxItem value="active" label="Active">
						<span class="flex items-center gap-2">
							<span class="size-2 rounded-full bg-green-500"></span>
							<span>Active</span>
						</span>
					</ComboboxItem>
					<ComboboxItem value="pending" label="Pending">
						<span class="flex items-center gap-2">
							<span class="size-2 rounded-full bg-yellow-500"></span>
							<span>Pending</span>
						</span>
					</ComboboxItem>
					<ComboboxItem value="inactive" label="Inactive">
						<span class="flex items-center gap-2">
							<span class="size-2 rounded-full bg-red-500"></span>
							<span>Inactive</span>
						</span>
					</ComboboxItem>
					<ComboboxItem value="archived" label="Archived">
						<span class="flex items-center gap-2">
							<span class="size-2 rounded-full bg-gray-500"></span>
							<span>Archived</span>
						</span>
					</ComboboxItem>
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	{/snippet}
</Story>

<!-- Size Variants -->
<Story name="Size Variants" asChild>
	<div class="flex items-center gap-4">
		<div class="space-y-1">
			<Label class="text-xs text-muted-foreground">Small</Label>
			<Combobox>
				<ComboboxTrigger class="w-[150px]" size="sm" placeholder="Small..." />
				<ComboboxContent>
					<ComboboxInput placeholder="Search..." />
					<ComboboxList>
						<ComboboxEmpty>No results.</ComboboxEmpty>
						<ComboboxItem value="option1" label="Option 1" />
						<ComboboxItem value="option2" label="Option 2" />
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</div>
		<div class="space-y-1">
			<Label class="text-xs text-muted-foreground">Default</Label>
			<Combobox>
				<ComboboxTrigger class="w-[150px]" placeholder="Default..." />
				<ComboboxContent>
					<ComboboxInput placeholder="Search..." />
					<ComboboxList>
						<ComboboxEmpty>No results.</ComboboxEmpty>
						<ComboboxItem value="option1" label="Option 1" />
						<ComboboxItem value="option2" label="Option 2" />
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</div>
	</div>
</Story>

<!-- Form Example -->
<Story name="Form Example">
	{#snippet template()}
		<form class="w-full max-w-sm space-y-4">
			<div class="space-y-2">
				<Label for="tech-stack">Tech Stack</Label>
				<Combobox>
					<ComboboxTrigger id="tech-stack" class="w-full" placeholder="Select technologies..." />
					<ComboboxContent>
						<ComboboxInput placeholder="Search technologies..." />
						<ComboboxList>
							<ComboboxEmpty>No technology found.</ComboboxEmpty>
							<ComboboxGroup heading="Frontend">
								<ComboboxItem value="react" label="React" />
								<ComboboxItem value="vue" label="Vue" />
								<ComboboxItem value="svelte" label="Svelte" />
							</ComboboxGroup>
							<ComboboxSeparator />
							<ComboboxGroup heading="Backend">
								<ComboboxItem value="node" label="Node.js" />
								<ComboboxItem value="python" label="Python" />
								<ComboboxItem value="go" label="Go" />
							</ComboboxGroup>
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</div>
			<div class="space-y-2">
				<Label for="experience">Experience Level</Label>
				<Combobox>
					<ComboboxTrigger id="experience" class="w-full" placeholder="Select level..." />
					<ComboboxContent>
						<ComboboxInput placeholder="Search..." />
						<ComboboxList>
							<ComboboxEmpty>No level found.</ComboboxEmpty>
							<ComboboxItem value="junior" label="Junior (0-2 years)" />
							<ComboboxItem value="mid" label="Mid-Level (2-5 years)" />
							<ComboboxItem value="senior" label="Senior (5+ years)" />
							<ComboboxItem value="lead" label="Tech Lead" />
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</div>
		</form>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Combobox open={args.open}>
			<ComboboxTrigger class="w-[200px]" placeholder="Select framework..." />
			<ComboboxContent>
				<ComboboxInput placeholder="Search framework..." />
				<ComboboxList>
					<ComboboxEmpty>No framework found.</ComboboxEmpty>
					{#each frameworks as framework}
						<ComboboxItem value={framework.value} label={framework.label} />
					{/each}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	{/snippet}
</Story>
