<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Avatar, AvatarImage, AvatarFallback } from './index.ts';

	const { Story } = defineMeta({
		title: 'Components/Display/Avatar',
		component: Avatar,
		tags: ['autodocs'],
		argTypes: {
			class: {
				control: 'text',
				description: 'Additional CSS classes for sizing',
				table: {
					category: 'Appearance'
				}
			}
		},
		args: {}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template()}
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	{/snippet}
</Story>

<!-- With Fallback -->
<Story name="With Fallback">
	{#snippet template()}
		<Avatar>
			<AvatarImage src="/invalid-image.jpg" alt="User" />
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
	{/snippet}
</Story>

<!-- Size Variants -->
<Story name="Size Variants" asChild>
	<div class="flex items-center gap-4">
		<Avatar class="size-6">
			<AvatarImage src="https://github.com/shadcn.png" alt="User" />
			<AvatarFallback class="text-xs">XS</AvatarFallback>
		</Avatar>
		<Avatar class="size-8">
			<AvatarImage src="https://github.com/shadcn.png" alt="User" />
			<AvatarFallback class="text-xs">SM</AvatarFallback>
		</Avatar>
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="User" />
			<AvatarFallback>MD</AvatarFallback>
		</Avatar>
		<Avatar class="size-12">
			<AvatarImage src="https://github.com/shadcn.png" alt="User" />
			<AvatarFallback>LG</AvatarFallback>
		</Avatar>
		<Avatar class="size-16">
			<AvatarImage src="https://github.com/shadcn.png" alt="User" />
			<AvatarFallback class="text-lg">XL</AvatarFallback>
		</Avatar>
		<Avatar class="size-24">
			<AvatarImage src="https://github.com/shadcn.png" alt="User" />
			<AvatarFallback class="text-2xl">2XL</AvatarFallback>
		</Avatar>
	</div>
</Story>

<!-- Different Fallback Styles -->
<Story name="Different Fallback Styles" asChild>
	<div class="flex items-center gap-4">
		<Avatar>
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
		<Avatar>
			<AvatarFallback class="bg-blue-500 text-white">AB</AvatarFallback>
		</Avatar>
		<Avatar>
			<AvatarFallback class="bg-green-500 text-white">CD</AvatarFallback>
		</Avatar>
		<Avatar>
			<AvatarFallback class="bg-purple-500 text-white">EF</AvatarFallback>
		</Avatar>
		<Avatar>
			<AvatarFallback class="bg-orange-500 text-white">GH</AvatarFallback>
		</Avatar>
	</div>
</Story>

<!-- Avatar Group -->
<Story name="Avatar Group" asChild>
	<div class="flex -space-x-4">
		<Avatar class="border-2 border-background">
			<AvatarImage src="https://i.pravatar.cc/150?img=1" alt="User 1" />
			<AvatarFallback>U1</AvatarFallback>
		</Avatar>
		<Avatar class="border-2 border-background">
			<AvatarImage src="https://i.pravatar.cc/150?img=2" alt="User 2" />
			<AvatarFallback>U2</AvatarFallback>
		</Avatar>
		<Avatar class="border-2 border-background">
			<AvatarImage src="https://i.pravatar.cc/150?img=3" alt="User 3" />
			<AvatarFallback>U3</AvatarFallback>
		</Avatar>
		<Avatar class="border-2 border-background">
			<AvatarImage src="https://i.pravatar.cc/150?img=4" alt="User 4" />
			<AvatarFallback>U4</AvatarFallback>
		</Avatar>
		<Avatar class="border-2 border-background">
			<AvatarFallback class="bg-muted text-muted-foreground">+5</AvatarFallback>
		</Avatar>
	</div>
</Story>

<!-- With Status Indicator -->
<Story name="With Status Indicator" asChild>
	<div class="flex items-center gap-6">
		<div class="relative">
			<Avatar>
				<AvatarImage src="https://i.pravatar.cc/150?img=5" alt="Online user" />
				<AvatarFallback>ON</AvatarFallback>
			</Avatar>
			<span
				class="absolute right-0 bottom-0 size-3 rounded-full bg-green-500 ring-2 ring-background"
			></span>
		</div>
		<div class="relative">
			<Avatar>
				<AvatarImage src="https://i.pravatar.cc/150?img=6" alt="Away user" />
				<AvatarFallback>AW</AvatarFallback>
			</Avatar>
			<span
				class="absolute right-0 bottom-0 size-3 rounded-full bg-yellow-500 ring-2 ring-background"
			></span>
		</div>
		<div class="relative">
			<Avatar>
				<AvatarImage src="https://i.pravatar.cc/150?img=7" alt="Busy user" />
				<AvatarFallback>BU</AvatarFallback>
			</Avatar>
			<span class="absolute right-0 bottom-0 size-3 rounded-full bg-red-500 ring-2 ring-background"
			></span>
		</div>
		<div class="relative">
			<Avatar>
				<AvatarImage src="https://i.pravatar.cc/150?img=8" alt="Offline user" />
				<AvatarFallback>OF</AvatarFallback>
			</Avatar>
			<span class="absolute right-0 bottom-0 size-3 rounded-full bg-gray-500 ring-2 ring-background"
			></span>
		</div>
	</div>
</Story>

<!-- User Card Example -->
<Story name="User Card Example">
	{#snippet template()}
		<div class="flex w-full max-w-sm items-center gap-4 rounded-lg border p-4">
			<Avatar class="size-12">
				<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<div class="flex flex-col">
				<span class="font-semibold">Shadcn</span>
				<span class="text-sm text-muted-foreground">@shadcn</span>
			</div>
		</div>
	{/snippet}
</Story>

<!-- Comment Example -->
<Story name="Comment Example">
	{#snippet template()}
		<div class="flex w-full max-w-md gap-3">
			<Avatar class="size-10 shrink-0">
				<AvatarImage src="https://i.pravatar.cc/150?img=9" alt="Jane Doe" />
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="text-sm font-semibold">Jane Doe</span>
					<span class="text-xs text-muted-foreground">2 hours ago</span>
				</div>
				<p class="text-sm">
					This is a great example of how to use avatars in a comment section. The component is
					really flexible!
				</p>
			</div>
		</div>
	{/snippet}
</Story>

<!-- Team List -->
<Story name="Team List">
	{#snippet template()}
		<div class="w-full max-w-sm space-y-3">
			{#each [{ name: 'John Doe', role: 'Admin', img: 'https://i.pravatar.cc/150?img=11' }, { name: 'Jane Smith', role: 'Editor', img: 'https://i.pravatar.cc/150?img=12' }, { name: 'Bob Wilson', role: 'Viewer', img: 'https://i.pravatar.cc/150?img=13' }] as member}
				<div class="flex items-center justify-between rounded-lg border p-3">
					<div class="flex items-center gap-3">
						<Avatar class="size-10">
							<AvatarImage src={member.img} alt={member.name} />
							<AvatarFallback
								>{member.name
									.split(' ')
									.map((n) => n[0])
									.join('')}</AvatarFallback
							>
						</Avatar>
						<div class="flex flex-col">
							<span class="text-sm font-medium">{member.name}</span>
							<span class="text-xs text-muted-foreground">{member.role}</span>
						</div>
					</div>
					<button class="text-sm text-primary hover:underline">View</button>
				</div>
			{/each}
		</div>
	{/snippet}
</Story>

<!-- With Icons Fallback -->
<Story name="With Icon Fallback" asChild>
	<div class="flex items-center gap-4">
		<Avatar>
			<AvatarFallback>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
			</AvatarFallback>
		</Avatar>
		<Avatar class="size-12">
			<AvatarFallback>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
					<circle cx="9" cy="7" r="4" />
					<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
					<path d="M16 3.13a4 4 0 0 1 0 7.75" />
				</svg>
			</AvatarFallback>
		</Avatar>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template()}
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
			<AvatarFallback>SC</AvatarFallback>
		</Avatar>
	{/snippet}
</Story>
