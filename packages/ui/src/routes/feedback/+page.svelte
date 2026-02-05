<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Text,
		Grid,
		GridItem,
		Alert,
		AlertTitle,
		AlertDescription,
		Badge,
		Progress,
		Skeleton,
		Button,
	} from "$lib/index.js";
	import { flavors } from "@ujl-framework/types";
	import { toast } from "svelte-sonner";
</script>

<Grid>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Feedback</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<!-- Alert Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Alerts:</Text>
					<div class="space-y-2">
						<Alert>
							<AlertTitle>Default Alert</AlertTitle>
							<AlertDescription>
								This is an default alert with title and description.
							</AlertDescription>
						</Alert>
						{#each flavors as alert_flavor (alert_flavor)}
							<Alert variant={alert_flavor}>
								<AlertTitle>{alert_flavor} Alert</AlertTitle>
								<AlertDescription>
									This is an {alert_flavor} alert with title and description.
								</AlertDescription>
							</Alert>
						{/each}
					</div>
				</div>

				<!-- Badge Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Badges:</Text>
					<div class="flex flex-wrap gap-2">
						<Badge>Default</Badge>
						{#each flavors as badge_flavor (badge_flavor)}
							<Badge variant={badge_flavor}>{badge_flavor}</Badge>
						{/each}
						<Badge variant="outline">Outline</Badge>
						<Badge class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">8</Badge>
						<Badge class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">99</Badge>
					</div>
				</div>

				<!-- Progress Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Progress:</Text>
					<div class="space-y-2">
						<Progress value={33} class="w-full" />
						<Progress value={66} class="w-full" />
						<Progress value={100} class="w-full" />
					</div>
				</div>

				<!-- Skeleton Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Skeleton:</Text>
					<div class="flex items-center space-x-4">
						<Skeleton class="size-12 rounded-full" />
						<div class="space-y-2">
							<Skeleton class="h-4 w-[250px]" />
							<Skeleton class="h-4 w-[200px]" />
						</div>
					</div>
				</div>

				<!-- Sonner/Toaster Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Sonner (Toaster):</Text>
					<div class="flex flex-wrap gap-2">
						<Button
							size="sm"
							onclick={() => toast.success("Success! Your changes have been saved.")}
						>
							Success Toast
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onclick={() => toast.error("Error! Something went wrong.")}
						>
							Error Toast
						</Button>
						<Button
							size="sm"
							variant="info"
							onclick={() => toast.info("Info: Here is some information.")}
						>
							Info Toast
						</Button>
						<Button
							size="sm"
							variant="warning"
							onclick={() => toast.warning("Warning: Please check your input.")}
						>
							Warning Toast
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	</GridItem>
</Grid>
