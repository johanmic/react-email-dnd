/**
 * Font Usage Examples for React Email DnD
 *
 * This file demonstrates different ways to use custom fonts in the email editor.
 */

import { EmailEditor, CanvasProvider } from '@react-email-dnd';
import type { CanvasDocument, FontDefinition } from '@react-email-dnd/shared';

// Example 1: Basic font configuration
const basicFonts: FontDefinition[] = [
  {
    id: 'inter',
    fontFamily: 'Inter',
    fallbackFontFamily: 'system-ui, sans-serif',
    webFont: {
      url: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff2',
      format: 'woff2',
    },
  },
];

// Example 2: Multiple fonts with different weights and styles
const advancedFonts: FontDefinition[] = [
  {
    id: 'inter',
    fontFamily: 'Inter',
    fallbackFontFamily: 'system-ui, sans-serif',
    webFont: {
      url: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff2',
      format: 'woff2',
    },
    fontWeight: 400,
    fontStyle: 'normal',
  },
  {
    id: 'poppins',
    fontFamily: 'Poppins',
    fallbackFontFamily: 'system-ui, sans-serif',
    webFont: {
      url: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',
      format: 'woff2',
    },
    fontWeight: 400,
    fontStyle: 'normal',
  },
  {
    id: 'playfair',
    fontFamily: 'Playfair Display',
    fallbackFontFamily: 'Georgia, serif',
    webFont: {
      url: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTXt_A-X-uE0qEE5Do.woff2',
      format: 'woff2',
    },
    fontWeight: 400,
    fontStyle: 'normal',
  },
  {
    id: 'geist',
    fontFamily: 'Geist',
    fallbackFontFamily: 'system-ui, sans-serif',
    webFont: {
      url: 'https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwYGFWNOITddY4.woff2',
      format: 'woff2',
    },
  },
];

// Example 3: Using fonts in EmailEditor
// function BasicUsage() {
//   return (
//     <CanvasProvider>
//       <EmailEditor
//         fonts={basicFonts}
//         daisyui={true}
//       />
//     </CanvasProvider>
//   );
// }

// Example 4: Programmatically adding fonts to document
function addFontsToDocument(document: CanvasDocument, fonts: FontDefinition[]): CanvasDocument {
  return {
    ...document,
    theme: {
      ...document.theme,
      fonts: fonts,
    },
  };
}

// Example 5: Single font becomes default
const singleFont: FontDefinition[] = [
  {
    id: 'brand-font',
    fontFamily: 'Brand Font',
    fallbackFontFamily: 'Arial, sans-serif',
    webFont: {
      url: 'https://example.com/fonts/brand-font.woff2',
      format: 'woff2',
    },
  },
];

// When only one font is provided, it becomes the default for all text elements
// and no dropdown is shown in the properties panel.

// Example 6: Custom font with local fallback
const customFont: FontDefinition[] = [
  {
    id: 'custom-brand',
    fontFamily: 'CustomBrand',
    fallbackFontFamily: 'Helvetica, Arial, sans-serif',
    webFont: {
      url: '/fonts/custom-brand.woff2',
      format: 'woff2',
    },
  },
];

export { basicFonts, advancedFonts, singleFont, customFont, addFontsToDocument };
