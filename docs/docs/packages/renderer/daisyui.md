### DaisyUI Theme

in order to get emails to look like your daisyui themes, or any theme for that matter 
you can use the package [daisyui-theme-extractor](https://github.com/johanmic/daisyui-theme-extractor) to extract the theme colors from your daisyui theme.
this then needs to added to the renderer

```tsx
import themes from "../themes.json"
import email from "../../emails/daiyui.json"

const forest = themes.forest
const colors = [
  forest.primary,
  forest.secondary,
  forest.accent,
  forest.neutral,
  forest.info,
  forest.success,
  forest.warning,
  forest.error,
]   

...[render logic]


```