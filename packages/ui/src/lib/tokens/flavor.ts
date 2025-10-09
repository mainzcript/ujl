export const themeFlavors = ['primary', 'secondary', 'accent'] as const;
export type ThemeFlavor = (typeof themeFlavors)[number];

export const notificationFlavors = ['success', 'warning', 'destructive', 'info'] as const;
export type NotificationFlavor = (typeof notificationFlavors)[number];

export const flavors = ['ambient', ...themeFlavors, ...notificationFlavors] as const;
export type Flavor = (typeof flavors)[number];
