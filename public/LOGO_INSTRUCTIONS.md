# ATAI Logo Setup Instructions

## Where to Place Your Logo

To add the ATAI Enterprises logo to the website:

1. **Save your logo file** as `atai-logo.png` (or `.svg`, `.jpg`, `.webp`)
2. **Place it in this folder**: `public/`
   - Full path: `vettcode-cli-landing/public/atai-logo.png`

## Logo Requirements

- **Format**: PNG, SVG, JPG, or WebP
- **Recommended size**: 512x512px or larger (square format works best)
- **Background**: Transparent background preferred (for PNG/SVG)
- **File name**: `atai-logo.png` (or appropriate extension)

## After Adding the Logo

Once you've placed your logo in the `public/` folder, you need to uncomment the logo code:

1. Open: `app/atai/page.tsx`
2. Find the logo section (around line 30-40)
3. **Remove** or **comment out** this placeholder:

   ```tsx
   <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm">
     <span className="text-6xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text">
       A
     </span>
   </div>
   ```

4. **Uncomment** this code:
   ```tsx
   <Image
     src="/atai-logo.png"
     alt="ATAI Enterprises Logo"
     fill
     className="object-contain"
     priority
   />
   ```

## Different File Format?

If your logo is not PNG, update the `src` in the Image component:

- SVG: `src="/atai-logo.svg"`
- JPG: `src="/atai-logo.jpg"`
- WebP: `src="/atai-logo.webp"`

## Current Status

- ✅ Logo placeholder is active (showing "A" letter)
- ⏳ Waiting for actual logo file to be added to `public/` folder
- ⏳ Code needs to be uncommented after logo is added

## Need Help?

If you have issues with the logo display, check:

1. File is in the correct location (`public/atai-logo.png`)
2. File name matches exactly (case-sensitive)
3. Image component code is uncommented
4. Next.js dev server has been restarted
