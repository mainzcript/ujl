// packages/crafter/src/tests/mockData.ts
import type {
	UJLCModuleObject,
	UJLCSlotObject,
	UJLTTokenSet,
	ProseMirrorDocument
} from '@ujl-framework/types';

/**
 * Helper function to convert a string to a ProseMirror Document
 */
function textToProseMirror(text: string): ProseMirrorDocument {
	return {
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: text
					}
				]
			}
		]
	};
}

/**
 * Mock node factory
 */
export function createMockNode(
	id: string,
	type: string = 'container',
	fields: Record<string, unknown> = {},
	slots: Record<string, UJLCModuleObject[]> = {}
): UJLCModuleObject {
	// Convert string content fields to ProseMirror Documents for text modules
	if (type === 'text' && 'content' in fields && typeof fields.content === 'string') {
		fields = { ...fields, content: textToProseMirror(fields.content as string) };
	}

	return {
		type,
		meta: {
			id,
			updated_at: '2024-01-01T00:00:00Z',
			_embedding: [0.1, 0.2, 0.3]
		},
		fields,
		slots
	};
}

/**
 * Mock tree with nested structure
 */
export function createMockTree(): UJLCSlotObject {
	const leaf1 = createMockNode('leaf-1', 'text', { content: 'Leaf 1' });
	const leaf2 = createMockNode('leaf-2', 'text', { content: 'Leaf 2' });
	const leaf3 = createMockNode('leaf-3', 'button', { label: 'Click me' });

	const nested1 = createMockNode('nested-1', 'card', { title: 'Card 1' }, { content: [leaf1] });
	const nested2 = createMockNode(
		'nested-2',
		'card',
		{ title: 'Card 2' },
		{ content: [leaf2, leaf3] }
	);

	const root = createMockNode('root-1', 'container', {}, { body: [nested1, nested2] });

	return [root];
}

/**
 * Mock tree with multiple slots
 */
export function createMockMultiSlotTree(): UJLCSlotObject {
	const headerItem = createMockNode('header-item', 'text', { content: 'Header' });
	const bodyItem1 = createMockNode('body-item-1', 'text', { content: 'Body 1' });
	const bodyItem2 = createMockNode('body-item-2', 'text', { content: 'Body 2' });
	const footerItem = createMockNode('footer-item', 'text', { content: 'Footer' });

	const root = createMockNode(
		'multi-slot-root',
		'layout',
		{},
		{
			header: [headerItem],
			body: [bodyItem1, bodyItem2],
			footer: [footerItem]
		}
	);

	return [root];
}

/**
 * Mock token set matching the current typography schema
 */
export function createMockTokenSet(): UJLTTokenSet {
	// Shared mock shades for all flavors
	const mockShades = {
		'50': { l: 0.985, c: 0.0012, h: 286.38 },
		'100': { l: 0.9674, c: 0.0013, h: 286.375 },
		'200': { l: 0.9225, c: 0.0021, h: 274.715 },
		'300': { l: 0.8703, c: 0.005, h: 264.09 },
		'400': { l: 0.7067, c: 0.0126, h: 265.776 },
		'500': { l: 0.5537, c: 0.0188, h: 264.576 },
		'600': { l: 0.4435, c: 0.024, h: 261.841 },
		'700': { l: 0.3714, c: 0.029, h: 259.939 },
		'800': { l: 0.2774, c: 0.0338, h: 258.624 },
		'900': { l: 0.2091, c: 0.0385, h: 259.93 },
		'950': { l: 0.1296, c: 0.0359, h: 260.946 }
	};

	const mockForegroundMap = {
		ambient: '950' as const,
		primary: '600' as const,
		secondary: '700' as const,
		accent: '600' as const,
		success: '700' as const,
		warning: '700' as const,
		destructive: '600' as const,
		info: '600' as const
	};

	const mockDarkForegroundMap = {
		ambient: '50' as const,
		primary: '300' as const,
		secondary: '300' as const,
		accent: '300' as const,
		success: '400' as const,
		warning: '300' as const,
		destructive: '300' as const,
		info: '300' as const
	};

	const createStandardColorSet = (hex: string) => ({
		light: '600' as const,
		lightForeground: mockForegroundMap,
		dark: '600' as const,
		darkForeground: mockDarkForegroundMap,
		shades: mockShades,
		_original: { hex }
	});

	return {
		color: {
			ambient: {
				light: '50',
				lightForeground: mockForegroundMap,
				dark: '950',
				darkForeground: mockDarkForegroundMap,
				shades: mockShades,
				_original: { lightHex: '#f4f4f5', darkHex: '#334155' }
			},
			primary: createStandardColorSet('#2563eb'),
			secondary: createStandardColorSet('#64748b'),
			accent: createStandardColorSet('#8b5cf6'),
			success: createStandardColorSet('#22c55e'),
			warning: createStandardColorSet('#f59e0b'),
			destructive: createStandardColorSet('#ef4444'),
			info: createStandardColorSet('#3b82f6')
		},
		radius: 0.75,
		spacing: 0.25,
		typography: {
			base: {
				font: 'Inter Variable',
				size: 1,
				lineHeight: 1.5,
				letterSpacing: 0,
				weight: 400,
				italic: false,
				underline: false,
				textTransform: 'none'
			},
			heading: {
				font: 'Inter Variable',
				size: 1,
				lineHeight: 1.2,
				letterSpacing: 0,
				weight: 700,
				italic: false,
				underline: false,
				textTransform: 'none',
				flavor: 'ambient'
			},
			highlight: {
				flavor: 'accent',
				bold: true,
				italic: false,
				underline: false
			},
			link: {
				bold: false,
				underline: false
			},
			code: {
				font: 'JetBrains Mono Variable',
				size: 0.95,
				lineHeight: 1.5,
				letterSpacing: 0,
				weight: 400
			}
		}
	};
}
