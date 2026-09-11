# Backend Experience Camp - Color Theme Guide

## Color Palette Overview

This project uses a custom Tailwind CSS v4 color theme designed specifically for backend development camp aesthetics.

## Available Colors

### 1. Backend Blue (主色調)
**Purpose**: Primary brand color, technical depth, stability
**Use cases**: Headers, primary buttons, links, brand elements

```html
<!-- Examples -->
<div class="bg-backend-500 text-white">Primary Button</div>
<h1 class="text-backend-700">Main Heading</h1>
<div class="border-backend-300">Card Border</div>
```

**Shades**: `backend-50` to `backend-950`
- Light: `backend-50`, `backend-100`, `backend-200`
- Medium: `backend-300`, `backend-400`, `backend-500`
- Dark: `backend-600`, `backend-700`, `backend-800`, `backend-900`, `backend-950`

---

### 2. Code Green (終端機成功綠)
**Purpose**: Success states, terminal outputs, positive feedback
**Use cases**: Success messages, active states, code execution indicators

```html
<!-- Examples -->
<div class="bg-code-500 text-white">Success Message</div>
<span class="text-code-600">✓ Test Passed</span>
<div class="border-l-4 border-code-500">Success Alert</div>
```

**Shades**: `code-50` to `code-950`

---

### 3. Server Gray (基礎設施灰)
**Purpose**: Neutral backgrounds, text, infrastructure elements
**Use cases**: Text content, card backgrounds, dividers, secondary elements

```html
<!-- Examples -->
<div class="bg-server-100">Card Background</div>
<p class="text-server-700">Body Text</p>
<div class="border-server-300">Subtle Border</div>
```

**Shades**: `server-50` to `server-950`

---

### 4. Data Orange (資料流動橙)
**Purpose**: Data highlights, API interactions, attention grabbers
**Use cases**: Call-to-action, data badges, API status indicators

```html
<!-- Examples -->
<button class="bg-data-500 hover:bg-data-600 text-white">CTA Button</button>
<span class="text-data-600">API Active</span>
<div class="bg-data-100 border-data-400">Data Highlight</div>
```

**Shades**: `data-50` to `data-950`

---

### 5. Alert Red (錯誤警示紅)
**Purpose**: Error states, warnings, critical alerts
**Use cases**: Error messages, validation errors, delete actions

```html
<!-- Examples -->
<div class="bg-alert-500 text-white">Error Message</div>
<span class="text-alert-600">✗ Test Failed</span>
<button class="bg-alert-600 hover:bg-alert-700 text-white">Delete</button>
```

**Shades**: `alert-50` to `alert-950`

---

## Usage Examples

### Navigation Bar
```html
<nav class="bg-backend-800 text-white">
  <a href="#" class="hover:text-backend-300">Home</a>
  <a href="#" class="hover:text-backend-300">Courses</a>
</nav>
```

### Success Card
```html
<div class="bg-code-50 border-l-4 border-code-500 p-4">
  <h3 class="text-code-800 font-bold">Deployment Successful</h3>
  <p class="text-code-700">Your API is now live!</p>
</div>
```

### Error Alert
```html
<div class="bg-alert-50 border border-alert-300 rounded-lg p-4">
  <h4 class="text-alert-800 font-semibold">Connection Failed</h4>
  <p class="text-alert-600">Unable to reach the database server.</p>
</div>
```

### Data Dashboard Card
```html
<div class="bg-white rounded-lg shadow-lg p-6 border-t-4 border-data-500">
  <h3 class="text-server-800 font-bold mb-2">API Requests</h3>
  <p class="text-data-600 text-3xl font-bold">1,234</p>
  <p class="text-server-500 text-sm">requests today</p>
</div>
```

### Button Variants
```html
<!-- Primary -->
<button class="bg-backend-600 hover:bg-backend-700 text-white px-4 py-2 rounded">
  Primary Action
</button>

<!-- Success -->
<button class="bg-code-600 hover:bg-code-700 text-white px-4 py-2 rounded">
  Confirm
</button>

<!-- Warning -->
<button class="bg-data-500 hover:bg-data-600 text-white px-4 py-2 rounded">
  Review
</button>

<!-- Danger -->
<button class="bg-alert-600 hover:bg-alert-700 text-white px-4 py-2 rounded">
  Delete
</button>

<!-- Secondary -->
<button class="bg-server-200 hover:bg-server-300 text-server-800 px-4 py-2 rounded">
  Cancel
</button>
```

---

## Color Combinations

### High Contrast (Accessibility)
- `bg-backend-900` + `text-white`
- `bg-white` + `text-server-900`
- `bg-code-700` + `text-white`

### Soft Backgrounds
- `bg-backend-50` + `text-backend-900`
- `bg-code-50` + `text-code-800`
- `bg-server-50` + `text-server-800`

### Accent Highlights
- `bg-white` + `border-l-4 border-data-500` + `text-server-800`
- `bg-backend-50` + `text-backend-700` + `border-backend-300`

---

## Technical Implementation

Colors are defined in [src/style.css](src/style.css) using Tailwind CSS v4's `@theme` directive:

```css
@theme {
  --color-backend-500: #3b82f6;
  --color-code-500: #22c55e;
  /* ... etc */
}
```

## Notes

- The `@theme` syntax is Tailwind CSS v4 specific
- IDE warnings about unknown `@theme` rule can be safely ignored
- All colors support full Tailwind utility classes (bg-, text-, border-, etc.)
- Each color has 11 shades (50, 100, 200...950) for maximum flexibility
