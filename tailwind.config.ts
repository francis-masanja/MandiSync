import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * Tailwind configuration implementing a **Vibrant Glass Morphism** as the primary theme
 * and a **Clay Morphism** as the secondary theme.
 *
 * Primary (glass) – uses teal/emerald semi‑transparent colors with heavy backdrop blur.
 * Secondary (clay) – warm earth tones with subtle texture and a low‑opacity overlay.
 */
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary glass palette – teal / emerald with 20% opacity by default
        primaryGlass: '#10b98133', // emerald-500 @ 20% opacity
        primaryGlassHover: '#10b98155',
        // Secondary clay palette – warm brown / sand with 15% opacity
        secondaryClay: '#c19a6b33', // clay-ish tone @ 20% opacity
        secondaryClayHover: '#c19a6b55',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '20px',
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        // Soft glassy shadow used on primary cards
        glass: '0 4px 30px rgba(0,0,0,0.12)',
        // Subtle earth shadow for secondary cards
        clay: '0 2px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [
    // Forms for nice input styling – optional but helpful
    require('@tailwindcss/forms'),
    // Typography plugin for prose when needed
    require('@tailwindcss/typography'),
    // Glassy‑Clay custom utilities
    plugin(function({ addUtilities }) {
      const newUtilities = {
        '.backdrop-blur-16': {
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
        },
        '.bg-glass': {
          'background-color': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        },
        '.border-glass': {
          'border-width': '1.5px',
          'border-style': 'solid',
          'border-color': 'rgba(255, 255, 255, 0.30)',
        },
        '.rounded-glassy': {
          'border-radius': '24px',
        },
        '.shadow-glassy': {
          'box-shadow': '0 12px 28px -4px rgba(0,0,0,0.3), inset -3px -4px 8px rgba(0,0,0,0.2), inset 3px 4px 8px rgba(255,255,255,0.45)',
        },
        '.btn-glassy': {
          'background': 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(4, 120, 87, 0.95) 100%)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'border': '1.5px solid rgba(255, 255, 255, 0.45)',
          'border-radius': '18px',
          'color': '#ffffff',
          'font-weight': '700',
          'box-shadow': '0 8px 20px rgba(16, 185, 129, 0.35), inset -2px -3px 5px rgba(0, 0, 0, 0.25), inset 2px 3px 5px rgba(255, 255, 255, 0.5)',
          'transition': 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        '.btn-glassy:hover': {
          'filter': 'brightness(1.10)',
          'transform': 'translateY(-0.125rem)',
        },
        '.btn-glassy:active': {
          'transform': 'translateY(0.125rem) scale(0.98)',
          'box-shadow': '0 4px 10px rgba(16, 185, 129, 0.2), inset -1px -2px 3px rgba(0,0,0,0.3), inset 1px 2px 3px rgba(255,255,255,0.3)',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'focus']);
    }),
  ],
};

export default config;
