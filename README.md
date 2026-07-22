# VettCode CLI Landing Page

Production-grade landing page for VettCode CLI with backend capabilities.

## 🚀 Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **API Routes** - Backend capabilities built-in

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

This generates static files in the `out/` directory for GitHub Pages deployment.

## 🚀 Deploy to GitHub Pages

1. **Enable GitHub Pages:**
   - Go to repository settings
   - Under "Pages", set source to "Deploy from a branch"
   - Select branch: `main`
   - Folder: `/out` (after building)

2. **Automated deployment:**

   ```bash
   npm run build
   git add out/
   git commit -m "Deploy landing page"
   git push
   ```

3. **Site will be live at:**
   `https://mixifys33.github.io/vettcode-cli/`

## 📁 Project Structure

```
vettcode-cli-landing/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Navbar.tsx          # Navigation
│   ├── HeroSection.tsx     # Hero section
│   ├── InstallSection.tsx  # Installation instructions
│   ├── FeaturesGrid.tsx    # Features grid
│   ├── HowItWorks.tsx      # How it works section
│   ├── LiveReportPreview.tsx # Report preview
│   ├── WhyVettCode.tsx     # Why section
│   ├── CLIOutputPreview.tsx # CLI output demo
│   ├── ShareableReports.tsx # Shareable reports section
│   ├── ReportsList.tsx     # Dynamic reports list
│   └── Footer.tsx          # Footer
├── public/
│   └── reports/            # Uploaded reports (auto-populated)
│       └── index.json      # Reports manifest
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Dependencies

```

## 🎨 Features

- ✅ Fully responsive design
- ✅ Dark theme with green accents
- ✅ Terminal-style code blocks
- ✅ Animated components
- ✅ Dynamic reports listing
- ✅ Copy-to-clipboard functionality
- ✅ SEO optimized
- ✅ Backend API ready (Next.js API routes)

## 🔧 Adding Backend APIs

Create API routes in `app/api/`:

```typescript
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "Hello World" });
}
```

## 📊 Reports Integration

Reports from `vettcode scan --upload` are automatically listed on the homepage.

The CLI saves reports to:

- `../Vettcode-engine-cli/docs/reports/`

And they're displayed via the `ReportsList` component.

## 🎯 Customization

- **Colors**: Edit `tailwind.config.ts`
- **Content**: Edit components in `/components`
- **Sections**: Add/remove sections in `app/page.tsx`

## 🐛 Troubleshooting

**Issue**: `npm install` stuck
**Fix**: Use `npm install --legacy-peer-deps`

**Issue**: Build fails
**Fix**: Delete `.next/` and `node_modules/`, then reinstall

## 📝 License

MIT

## 🙏 Credits

- Powered by AD-Technologies and AI Enterprises
- Special thanks: Masereka Adorable, Hacker X
