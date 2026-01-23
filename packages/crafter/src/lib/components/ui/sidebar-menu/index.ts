// Menu components for navigation tree structure.
// Moved from @ujl-framework/ui to crafter package as they are only used here
// after the main Sidebar component was removed.
import Menu from './sidebar-menu.svelte';
import MenuItem from './sidebar-menu-item.svelte';
import MenuButton from './sidebar-menu-button.svelte';
import MenuSub from './sidebar-menu-sub.svelte';
import MenuSubItem from './sidebar-menu-sub-item.svelte';
import MenuSubButton from './sidebar-menu-sub-button.svelte';

export {
	Menu as SidebarMenu,
	MenuItem as SidebarMenuItem,
	MenuButton as SidebarMenuButton,
	MenuSub as SidebarMenuSub,
	MenuSubItem as SidebarMenuSubItem,
	MenuSubButton as SidebarMenuSubButton
};
