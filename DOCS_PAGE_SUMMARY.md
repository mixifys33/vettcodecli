# VettCode CLI Documentation Page

## Overview

Added a comprehensive documentation/help page to the VettCode CLI landing site at `/docs`.

## What Was Added

### New Page: `/app/docs/page.tsx`

A complete documentation page with:

1. **Installation Section** 📦
   - Prerequisites (Node.js 16+, npm/yarn)
   - Installation via npm
   - Verification steps
   - Update instructions

2. **Quick Start Section** ⚡
   - Your first scan walkthrough
   - 5-step process explanation:
     - File Collection
     - Static Analysis
     - Deep Analysis
     - Validation
     - Report Generation

3. **Commands Section** ⌨️
   - `vettcode [directory]` - Basic scan command
   - `vettcode --help` - Help information
   - `vettcode --version` - Version check
   - `vettcode` (no args) - Interactive UI

4. **Scan Modes Section** 🔍
   - **Quick Mode** (default) - 30 seconds, balanced coverage
   - **Deep Mode** (`--mode deep`) - 2-3 minutes, comprehensive
   - **Static-Only Mode** (`--no-ai`) - 30 seconds, offline capable

5. **Output Options Section** 📊
   - `-o, --output <file>` - Save JSON results
   - `--json` - Print JSON to stdout
   - `--no-upload` - Skip web upload (local only)
   - `-i, --ignore <patterns>` - Ignore patterns
   - `--verbose` - Show debug logs

6. **Interactive UI Section** 🖥️
   - How to launch interactive mode
   - Complete keyboard shortcuts guide:
     - S - Start scan
     - Shift+S - Settings
     - ↑↓ - Navigate
     - Enter - Select
     - B - Back
     - H - Help
     - Q - Quit
     - Esc - Cancel
   - Features list (visual progress, menu navigation, etc.)

7. **Usage Examples Section** 💡
   - Basic usage examples
   - Scan mode examples
   - Output option combinations
   - Filtering examples
   - Combined examples for real-world scenarios

8. **Troubleshooting Section** 🔧
   - Command not found fixes
   - Upload/network error solutions
   - No files found debugging
   - AI analysis fallback info
   - Interactive UI issues
   - Getting help resources

## Features

### Navigation

- **Sidebar Navigation**: Sticky sidebar with 8 sections
- **Scroll-to-Section**: Smooth scroll on click
- **Active Section Tracking**: Highlights current section
- **Mobile Responsive**: Collapsible on mobile devices

### Design

- Consistent with landing page theme (dark mode, blue/purple gradient)
- Code blocks with syntax highlighting
- Keyboard shortcut display (kbd elements)
- Color-coded sections (info boxes with different colors)
- Icons for each section
- Back to Home link

### Content Structure

- Clear hierarchical headings
- Code examples in every section
- Explanatory text for each command/option
- Visual indicators (checkmarks, icons, colored boxes)
- Links to GitHub repo and issues

## Updated Files

### 1. `app/docs/page.tsx` (NEW)

Complete documentation page component with:

- Sidebar navigation
- 8 comprehensive sections
- Responsive design
- Styled code blocks
- Custom CSS for doc styling

### 2. `components/Navbar.tsx` (UPDATED)

- Changed `#docs` to `/docs` for proper page navigation
- Updated both desktop and mobile menu links
- Changed `#features` to `/#features` for proper home page anchors
- Changed `#reports` to `/#reports` for proper home page anchors

## How to Access

### Development

```bash
cd C:\Users\USER\Desktop\VETTCODE\vettcode-cli-landing
npm run dev
```

Visit: `http://localhost:3000/docs`

### Production

Once deployed to Vercel, accessible at:
`https://vettcodecli.vercel.app/docs`

## Navigation

### From Landing Page

- Click "Docs" in navbar (desktop or mobile)

### From Docs Page

- Click "Back to Home" link at top
- Click logo in navbar
- Click any home page anchor link

## Mobile Responsive

The docs page is fully responsive:

- Desktop: Sidebar + main content side-by-side
- Mobile: Sidebar becomes collapsible/stackable
- Touch-friendly buttons and links
- Optimized font sizes for mobile

## Styling

Uses Tailwind CSS with custom styles:

- `.doc-section` class for scroll margin
- Grid background pattern
- Code block styling
- Keyboard shortcut badges
- Gradient info boxes
- Smooth transitions

## Content Coverage

✅ Complete installation guide
✅ Quick start tutorial
✅ All CLI commands documented
✅ All scan modes explained
✅ All output options covered
✅ Interactive UI keyboard shortcuts
✅ Real-world usage examples
✅ Common troubleshooting scenarios
✅ Links to GitHub and support

## Next Steps

1. **Test locally**: Run `npm run dev` and visit `/docs`
2. **Deploy to Vercel**: Push changes and Vercel will auto-deploy
3. **Optional enhancements**:
   - Add video tutorials
   - Add animated GIFs showing CLI in action
   - Add FAQs section
   - Add API reference (if applicable)
   - Add changelog/release notes

## Summary

Created a comprehensive, professional documentation page that covers:

- Installation and setup
- All commands and options
- Usage examples
- Troubleshooting

The page matches the landing site's design, is fully responsive, and provides everything a user needs to successfully install, configure, and use VettCode CLI.
