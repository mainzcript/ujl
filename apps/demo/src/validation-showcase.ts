import { validateUJLTDocumentSafe } from '@ujl-framework/types';
import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
import { readFileSync } from 'fs';

// Valid showcase document
let result = validateUJLTDocumentSafe(showcaseDocument);
if (result.success) {
  console.log('✅ Valid Content:', result.data);
} else {
  console.error('❌ Invalid Content:', result.error.issues);
}

// inalid theme
const themeJson = readFileSync('./src/invalid.ujlt.json', 'utf-8');
const docData = JSON.parse(themeJson);
result = validateUJLTDocumentSafe(docData);

if (result.success) {
  console.log('✅ Valid theme:', result.data);
} else {
  console.error('❌ Invalid theme:', result.error.issues);
}