// Menu components for navigation tree structure.
// Moved from @ujl-framework/ui to crafter package as they are only used here
// after the main Sidebar component was removed.
import MenuButton from "./sidebar-menu-button.svelte";
import MenuItem from "./sidebar-menu-item.svelte";
import MenuSubButton from "./sidebar-menu-sub-button.svelte";
import MenuSubItem from "./sidebar-menu-sub-item.svelte";
import MenuSub from "./sidebar-menu-sub.svelte";
import Menu from "./sidebar-menu.svelte";

export {
	Menu as SidebarMenu,
	MenuButton as SidebarMenuButton,
	MenuItem as SidebarMenuItem,
	MenuSub as SidebarMenuSub,
	MenuSubButton as SidebarMenuSubButton,
	MenuSubItem as SidebarMenuSubItem,
};
