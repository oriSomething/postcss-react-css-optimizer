# React CSS Optimizer (PostCSS plugin)

**It's still in experimental stage**

Remove unused CSS classes by analyzing `React.Component`s JavaScript files.
It's also support the use of the module `classnames`.


## But what about `CSS modules`?

`CSS modules` is super cool! But I disagree about the way is solves the problem.

1. `CSS modules` is more about preventing naming conflicts. While I prefer no uniqueness and more CSS classes shared between components (some references: [cssguidelines](http://cssguidelin.es/), ["The Top 5 Mistakes of Massive CSS"](https://www.youtube.com/watch?v=j6sAm7CLoCQ))
2. I don't like the idea of importing CSS in my JavaScript. And then find myself having more complexity in JavaScript and both CSS
3. it's difficult to set the order of the rules when you import both CSS both in CSS files and JavaScript files


## Usage

Installing from CLI:
```
 npm i --save-dev https://github.com/oriSomething/postcss-react-css-optimizer
```

Using it PostCSS:
```js
const postcss = require("postcss");
const postcssReactCSSOptimizer = require("postcss-react-css-optimizer");

postcss([postcssReactCSSOptimizer({
  files: "react-component-file.js"
})]).process(/* ··· */);
// ···
```

### Input:

`component.js`:

```js
import ReactDOM from "react-dom";

export default function SomeComponent() {
  return <div class="will-exist" />;
}
```

`component.css`:
```css
.will-exist { ··· }

.will-drop { ··· }
```

### Output:

`component.css`:
```css
.will-exist { ··· }
```


## Roadmap

- support pseudo and state selectors
- support parent child relation CSS classes (example: `.parent .child` / `.parent > .child`)
- show report of classes that have being dropped
- support for more complex ways to extract CSS classes (example `.selector-*`. `*` is for everythig)
- caching
- non JSX support
- maybe, changing the CSS tree and the JavaScript files, so many optimizations for CSS and CSS related in JavaScript files could be made
- support of CSS classes with special characters (example `.😁`)
