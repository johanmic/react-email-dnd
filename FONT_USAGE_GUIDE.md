# Custom Font Usage Guide for React Email DnD

This guide explains how to properly use custom fonts with React Email DnD according to the [React Email Font component documentation](https://react.email/docs/components/font).

## Key Requirements

1. **Font URLs must be direct font file URLs** (e.g., `.woff2`, `.woff`), not CSS URLs
2. **Font family names should not include fallbacks** in the `fontFamily` field
3. **Fallback fonts should be specified separately** in the `fallbackFontFamily` field

## Correct Font Configuration

### ✅ Correct Format

```typescript
const fonts: FontDefinition[] = [
  {
    id: "geist",
    fontFamily: "Geist", // Just the font name, no fallbacks
    fallbackFontFamily: "system-ui, sans-serif", // Fallbacks here
    webFont: {
      url: "https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwYGFWNOITddY4.woff2", // Direct font file URL
      format: "woff2",
    },
    fontWeight: 400,
    fontStyle: "normal",
  },
]
```

### ❌ Incorrect Format

```typescript
// WRONG: CSS URL instead of direct font file URL
webFont: {
  url: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap',
  format: 'woff2',
},

// WRONG: Font family with fallbacks
fontFamily: 'Geist, sans-serif', // Should be just 'Geist'
```

## How to Get Direct Font URLs

### Method 1: From Google Fonts

1. Go to [Google Fonts](https://fonts.google.com)
2. Select your font and click "Download family"
3. Extract the font files
4. Host them on your server or use a CDN
5. Use the direct `.woff2` or `.woff` URLs

### Method 2: Use Google Fonts Direct URLs

Google Fonts provides direct font file URLs. You can find them by:

1. Opening the CSS URL in your browser
2. Looking for the `src` URLs in the `@font-face` declarations
3. Using those direct URLs

Example:

```css
/* CSS URL: https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap */
/* Contains: */
@font-face {
  font-family: "Inter";
  src: url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff2)
    format("woff2");
}
```

Use the direct URL: `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff2`

## Usage Examples

### Example 1: Basic Usage

```tsx
import { EmailEditor, CanvasProvider } from "@react-email-dnd"

const fonts: FontDefinition[] = [
  {
    id: "inter",
    fontFamily: "Inter",
    fallbackFontFamily: "system-ui, sans-serif",
    webFont: {
      url: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff2",
      format: "woff2",
    },
  },
]

function MyEmailEditor() {
  return (
    <CanvasProvider>
      <EmailEditor fonts={fonts} />
    </CanvasProvider>
  )
}
```

### Example 2: Multiple Fonts

```tsx
const fonts: FontDefinition[] = [
  {
    id: "inter",
    fontFamily: "Inter",
    fallbackFontFamily: "system-ui, sans-serif",
    webFont: {
      url: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff2",
      format: "woff2",
    },
  },
  {
    id: "poppins",
    fontFamily: "Poppins",
    fallbackFontFamily: "system-ui, sans-serif",
    webFont: {
      url: "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2",
      format: "woff2",
    },
  },
]
```

### Example 3: Document with Fonts in Theme

```tsx
const document: CanvasDocument = {
  version: 1,
  meta: { title: "My Email" },
  variables: {},
  theme: {
    fonts: [
      {
        id: "geist",
        fontFamily: "Geist",
        fallbackFontFamily: "system-ui, sans-serif",
        webFont: {
          url: "https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwYGFWNOITddY4.woff2",
          format: "woff2",
        },
      },
    ],
  },
  sections: [
    {
      id: "section-1",
      type: "section",
      rows: [
        {
          id: "row-1",
          type: "row",
          columns: [
            {
              id: "column-1",
              type: "column",
              blocks: [
                {
                  id: "heading-1",
                  type: "heading",
                  props: {
                    content: "Custom Font Heading",
                    fontFamily: "Geist", // This will use the custom font
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

## Font Behavior

- **Single Font**: If only one font is provided, it becomes the default for all text elements
- **Multiple Fonts**: Font dropdowns appear in the properties panel for text, heading, and button blocks
- **Canvas Preview**: Fonts are dynamically loaded and displayed in the editor
- **Email Rendering**: Fonts are properly embedded using React Email's `<Font>` component

## Troubleshooting

### Font Not Loading

1. **Check URL Format**: Ensure you're using direct font file URLs, not CSS URLs
2. **Check Font Family**: Make sure `fontFamily` doesn't include fallbacks
3. **Check Format**: Ensure the `format` field matches the actual font file format
4. **Check CORS**: Ensure the font server allows cross-origin requests

### Font Not Applied

1. **Check Block Props**: Ensure `fontFamily` is set on the block props
2. **Check Document Theme**: Ensure fonts are defined in `document.theme.fonts`
3. **Check EmailEditor Props**: Ensure fonts are passed to the `EmailEditor` component

## Testing

You can test font loading by:

1. Opening the browser developer tools
2. Checking the Network tab for font file requests
3. Inspecting the rendered HTML to see if `<Font>` components are present
4. Checking if `@font-face` rules are generated in the email HTML
