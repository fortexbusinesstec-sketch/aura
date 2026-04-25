/**
 * Aura OS — Tailwind CSS v4 Configuration
 *
 * En Tailwind v4 los colores se definen con @theme inline en globals.css,
 * NO aquí. Este archivo solo registra: content, fuentes, radios y animaciones.
 */
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/styles/**/*.css',
    ],
    // darkMode deshabilitado — sistema de un único tema gestionado por CSS
    theme: {
        extend: {
            fontFamily: {
                montserrat: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            animation: {
                'fade-in': 'fade-in 0.2s ease-out forwards',
                'slide-in-right': 'slide-in-right 0.2s ease-out forwards',
            },
        },
    },
    plugins: [],
}

export default config
