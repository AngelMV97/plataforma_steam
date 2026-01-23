# Logo and Icon Structure for Gomot Science Academy

## Logo File Locations

According to the Gomot visual identity guidelines, you should place the following logo files in your project:

### Directory Structure
```
frontend/
└── public/
    └── logos/
        ├── gomot-wordmark.svg          # Full logo with text
        ├── gomot-wordmark.png          # PNG version (recommended: 300x80px)
        ├── gomot-symbol.svg            # Circular symbol only
        ├── gomot-symbol.png            # PNG version (recommended: 120x120px)
        ├── gomot-seal.svg              # Academic seal version
        ├── gomot-seal.png              # PNG version (recommended: 200x200px)
        └── gomot-monogram.svg          # "G" letter mark
            gomot-monogram.png          # PNG version (recommended: 80x80px)
```

## Current Usage

### Dashboard Layout (Navbar)
**Location:** `frontend/src/app/(dashboard)/layout.tsx`
**Current:** Temporary circular badge with "G" letter
**Replace with:** Gomot Symbol or Monogram

```tsx
{/* Current placeholder - Line 51 */}
<div className="w-8 h-8 rounded-full bg-[#1F3A5F] flex items-center justify-center mr-3">
  <span className="text-white font-serif font-bold text-sm">G</span>
</div>

{/* Replace with actual logo: */}
<Image 
  src="/logos/gomot-symbol.svg" 
  alt="Gomot" 
  width={32} 
  height={32}
  className="mr-3"
/>
```

### Public-Facing Pages
**Location:** Homepage, Login, Signup headers
**Current:** Text-only "Gomot Science Academy"
**Recommended:** Add Wordmark or Symbol + Text combination

Example for homepage header:
```tsx
<div className="flex items-center">
  <Image 
    src="/logos/gomot-symbol.svg" 
    alt="Gomot" 
    width={32} 
    height={32}
    className="mr-3"
  />
  <span className="font-serif text-2xl font-semibold text-[#1F3A5F]">
    Gomot Science Academy
  </span>
</div>
```

## Logo Specifications

### Colors
- **Primary:** #1F3A5F (Deep blue)
- **Secondary:** #2F6F6D (Teal accent)
- **Monochrome versions:** For small sizes or low contrast situations

### Size Guidelines
- **Navbar:** 32x32px (Symbol/Monogram)
- **Homepage Hero:** 48x48px or larger (Symbol)
- **Footer:** 24x24px (Symbol) or full Wordmark
- **Favicon:** Use Monogram at 32x32px and 16x16px

## Next Steps

1. **Export logos** from your design files in SVG and PNG formats
2. **Create the `/public/logos/` directory**
3. **Place all logo files** in that directory
4. **Update the code** in:
   - `frontend/src/app/(dashboard)/layout.tsx` (dashboard navbar)
   - `frontend/src/app/page.tsx` (homepage header)
   - `frontend/src/app/enfoque/page.tsx` (enfoque page header)
   - `frontend/src/app/postulacion/page.tsx` (postulacion page header)
   - `frontend/src/components/auth/LoginForm.tsx` (login page)
   - `frontend/src/components/auth/SignupForm.tsx` (signup page)

5. **Update favicon**:
   - Export Monogram as `favicon.ico` (16x16, 32x32, 48x48)
   - Place in `/public/` directory
   - Update `frontend/src/app/layout.tsx` metadata

## Design System Integration

All logo usage should follow these principles:
- **Consistent sizing** across similar contexts
- **Proper spacing** (minimum clearance = logo height/2)
- **Contrast compliance** (WCAG AA minimum)
- **Semantic alt text** for accessibility

## Alternative: Using Logo Component

You can create a reusable component:

```tsx
// frontend/src/components/Logo.tsx
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'symbol' | 'wordmark' | 'seal' | 'monogram';
  size?: number;
  href?: string;
  className?: string;
}

export function Logo({ 
  variant = 'symbol', 
  size = 32, 
  href = '/',
  className = ''
}: LogoProps) {
  const logoSrc = `/logos/gomot-${variant}.svg`;
  
  const content = (
    <Image 
      src={logoSrc}
      alt="Gomot Science Academy" 
      width={size} 
      height={size}
      className={className}
    />
  );
  
  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }
  
  return content;
}
```

Usage:
```tsx
<Logo variant="symbol" size={32} href="/" />
```
