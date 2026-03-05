import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/merriweather";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/nunito-sans";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/oswald";
import "@fontsource-variable/raleway";
import "@fontsource-variable/roboto";
import { UJLCrafter } from "@ujl-framework/crafter";
import { defaultTheme, showcaseDocument } from "@ujl-framework/examples";
import type { UJLCDocument, UJLTDocument } from "@ujl-framework/types";

import "./style.css";

declare global {
	interface Window {
		crafter?: UJLCrafter;
	}
}

const crafter = new UJLCrafter({
	target: "#app",
	document: showcaseDocument as UJLCDocument,
	theme: defaultTheme as UJLTDocument,
});

window.crafter = crafter;
console.info("[demo] UJLCrafter initialized. Debug with window.crafter");

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		crafter.destroy();
		if (window.crafter === crafter) {
			delete window.crafter;
		}
	});
}
