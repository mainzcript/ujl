// packages/crafter/src/tests/mockData.ts
import type { UJLCModuleObject, UJLCSlotObject, UJLTTokenSet } from '@ujl-framework/types';

/**
 * Mock node factory
 */
export function createMockNode(
	id: string,
	type: string = 'container',
	fields: Record<string, unknown> = {},
	slots: Record<string, UJLCModuleObject[]> = {}
): UJLCModuleObject {
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
			footer: [footerItem] // ← Stelle sicher, dass footer einen Item hat
		}
	);

	return [root];
}

/**
 * Mock token set
 */
export function createMockTokenSet(): UJLTTokenSet {
	return {
		color: {
			ambient: {
				light: '50',
				lightForeground: {
					ambient: '950',
					primary: '600',
					secondary: '700',
					accent: '600',
					success: '700',
					warning: '700',
					destructive: '600',
					info: '600'
				},
				dark: '950',
				darkForeground: {
					ambient: '50',
					primary: '300',
					secondary: '300',
					accent: '300',
					success: '400',
					warning: '300',
					destructive: '300',
					info: '300'
				},
				shades: {
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
				},
				_original: { lightHex: '#f4f4f5', darkHex: '#334155' }
			},
			primary: {
				light: '600',
				lightForeground: {
					ambient: '200',
					primary: '100',
					secondary: '200',
					accent: '100',
					success: '200',
					warning: '200',
					destructive: '100',
					info: '100'
				},
				dark: '600',
				darkForeground: {
					ambient: '50',
					primary: '100',
					secondary: '200',
					accent: '100',
					success: '200',
					warning: '200',
					destructive: '100',
					info: '100'
				},
				shades: {
					'50': { l: 0.9636, c: 0.0172, h: 268.754 },
					'100': { l: 0.9304, c: 0.0336, h: 269.33 },
					'200': { l: 0.8723, c: 0.0778, h: 270.018 },
					'300': { l: 0.7896, c: 0.1476, h: 267.963 },
					'400': { l: 0.6798, c: 0.2019, h: 266.027 },
					'500': { l: 0.5926, c: 0.2162, h: 263.952 },
					'600': { l: 0.5461, c: 0.2152, h: 262.881 },
					'700': { l: 0.4632, c: 0.2172, h: 264.089 },
					'800': { l: 0.4033, c: 0.2074, h: 267.047 },
					'900': { l: 0.3628, c: 0.1682, h: 272.267 },
					'950': { l: 0.2612, c: 0.1034, h: 279.79 }
				},
				_original: { hex: '#2563eb' }
			}
			// ... weitere Flavors (verkürzt für Beispiel)
		} as UJLTTokenSet['color'],
		radius: '0.75rem',
		typography: {
			base: {
				font: 'Inter',
				size: 1,
				lineHeight: '1.5',
				letterSpacing: '0',
				weight: '400',
				italic: false,
				underline: false,
				textTransform: 'none',
				flavor: 'ambient'
			},
			heading: {
				font: 'Inter',
				size: 1,
				lineHeight: '1.2',
				letterSpacing: '0',
				weight: '700',
				italic: false,
				underline: false,
				textTransform: 'none',
				flavor: 'ambient'
			},
			highlight: {
				flavor: 'accent',
				weight: '700',
				italic: false,
				underline: false
			},
			link: {
				weight: '400',
				underline: false
			},
			mono: {
				font: 'JetBrains Mono',
				size: 0.95,
				lineHeight: '1.5',
				letterSpacing: '0',
				weight: '400',
				italic: false,
				underline: false,
				textTransform: 'none',
				flavor: 'ambient'
			}
		}
	};
}
