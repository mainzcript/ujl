import Canvas from "./app-canvas.svelte";
import Header from "./app-header.svelte";
import Logo from "./app-logo.svelte";
import Panel from "./app-panel.svelte";
import Provider from "./app-provider.svelte";
import SidebarTrigger from "./app-sidebar-trigger.svelte";
import Sidebar from "./app-sidebar.svelte";
import { setApp, setAppRegistry, useApp } from "./context.svelte.js";

export {
	Provider as App,
	Canvas as AppCanvas,
	Header as AppHeader,
	Logo as AppLogo,
	Panel as AppPanel,
	Sidebar as AppSidebar,
	SidebarTrigger as AppSidebarTrigger,
	setApp,
	setAppRegistry,
	useApp,
};
