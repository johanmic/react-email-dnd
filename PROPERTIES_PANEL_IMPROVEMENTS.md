# Properties Panel UI Improvements

## Summary
Cleaned up the Properties Panel UI to reduce confusion and clutter while maintaining full customization capabilities.

## Changes Made

### 1. **Removed Duplicate Margin Input Fields**
- **Before**: Margin had both preset buttons AND a text input field visible at the same time
- **After**: Margin shows only preset buttons, with custom input moved to Advanced section

### 2. **Consolidated Background Settings**
- **Before**: Had both "Background" (color picker + input) AND "Background Class" as separate visible fields
- **After**: "Background Class" moved to Advanced section, reducing confusion

### 3. **Smart Gutter Display**
- **Before**: "Gutter (px)" field shown for ALL rows, even single-column rows
- **After**: "Column Gap (px)" only shows when row has multiple columns (renamed for clarity)
- **Why**: Gutter only affects spacing between columns, so it's irrelevant for single-column layouts

### 4. **Smart Width Display**
- **Before**: "Width (flex basis)" shown for ALL columns
- **After**: Width only shows when there are multiple columns in the row
- **Why**: Width setting only matters when columns need to share space proportionally

### 5. **Added Advanced Settings Section**
- New collapsible "Advanced Settings" section contains:
  - Custom Margin (manual CSS/Tailwind input)
  - Background Class (Tailwind class overrides)
  - Class Name (custom CSS classes)
- **Benefit**: Power users can still access all features, but beginners aren't overwhelmed

## User Experience Improvements

### Simple Mode (Default)
Users see only the essential, commonly-used options:
- **Section**: Background (color), Alignment, Padding, Margin (presets)
- **Row**: Background, Alignment, Padding, Margin (presets), Column Gap (if multi-column)
- **Column**: Background, Alignment, Padding, Margin (presets), Width (if multi-column)

### Advanced Mode (Expandable)
Click "Advanced Settings" to reveal:
- Custom margin values (CSS or Tailwind tokens)
- Background class names (for theme integration)
- Custom class names (for advanced styling)

## Contextual UI

The panel now adapts to the context:
- **Column Gap**: Only shown for rows with 2+ columns
- **Width**: Only shown for columns in multi-column rows
- Clear help text explains what each field does

## Maintained Customization
All existing functionality is preserved:
- ✅ Preset padding/margin buttons
- ✅ Custom CSS values
- ✅ Tailwind class names
- ✅ Background color picker
- ✅ Alignment options
- ✅ Column gap control
- ✅ Column width ratios

Nothing was removed—just reorganized for better UX.

## Benefits

1. **Less Clutter**: Main panel shows 4-6 fields instead of 8-10
2. **Clearer Purpose**: Field names and help text explain what each does
3. **Contextual**: Only relevant fields appear (gutter for multi-column, etc.)
4. **Still Powerful**: Advanced users can expand to access all features
5. **Better Labels**: "Column Gap" is clearer than "Gutter (px)"
