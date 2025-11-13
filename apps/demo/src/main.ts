import { webAdapter } from '@ujl-framework/adapter-web';
import { Composer } from '@ujl-framework/core';
import type { UJLTDocument, UJLCDocument } from '@ujl-framework/types';
import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

// Get container element
const container = document.getElementById('ujl-container');
if (!container) throw new Error('Container element #ujl-container not found');

// Extract token set from theme document
const themeDocument = defaultTheme as unknown as UJLTDocument;
const tokenSet = themeDocument.ujlt.tokens;

// Compose UJL document into AST
const composer = new Composer();
const ujlDocument = showcaseDocument as unknown as UJLCDocument;
const ast = composer.compose(ujlDocument);

// Render AST using web adapter (creates <ujl-content> Custom Element)
webAdapter(ast, tokenSet, { target: container });
