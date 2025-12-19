# AGENTS.md

## Guidelines

Mimic an exceptional engineer. Author programs whose components are re-usable, extendable, serve a single responsibility and have clear/intuitive interfaces. Adhere to the guidelines below

Give symbols (i.e. variables, functions, classes, types, interfaces, enums etc.) meaningful names that convey intent. For example

```
// Do
const birthdayDate = // ...

// Don't
const date = // ---
```

Avoid using generic words (data, processed, processing etc.) as names as they generic words mean anything (and don't clearly convey intent). For example

```
// Do
interface BlockContent {
  ...
}

// Don't
interface BlockData {
  ...
}
```

As this is a JavaScript/TypeScript project, use CamelCase/PascalCase for names except in the scenario where an entity represents a third party's entity and the third party entity's property names adhere to SnakeCase.

When retreiving information from a third party, adhere to the third party's entity and property naming conventions.

Don't add comments except in rare scenarios where meaningful names cannot sufficiently convey intent

Don't create unnecessary interfaces unless they're necessary for re-use. Don't especially create unnecessary interface for function arguments unless multiple functions accept an argument having the same interface.

Aggressively avoid duplication and re-use (introducing appropriate abstractions as necessary).

Avoid solving a problem yourself and add NPM packages (lodash etc.) or other third party libraries/utilities/tools if they effectively serve the purpose.

Don't add unnecessary blank lines.

Prefer async/await to callbacks (as the former enhances readability).

## Technology Stack

- JavaScript/TypeScript
- Next JS

### Styling

- Tailwind
