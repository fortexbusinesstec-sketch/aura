/**
 * Definición de temas disponibles en Aura OS.
 * Este archivo NO tiene 'use client' — puede importarse desde
 * Server Components (layout.tsx) y Client Components por igual.
 */

export const THEMES = [
    {
        id: 'warm',
        label: 'Aura Warm',
        description: 'Paleta cálida crema y dorada — el tema original.',
        className: null as string | null, // :root, no necesita clase extra
        preview: ['#F6F4E8', '#FFE8BE', '#2C261A'],
    },
    {
        id: 'midnight',
        label: 'Midnight',
        description: 'Modo oscuro azul profundo. Ideal para sesiones nocturnas.',
        className: 'midnight-theme' as string | null,
        preview: ['#141B27', '#3B82F6', '#EAF0FA'],
    },
    {
        id: 'ocean',
        label: 'Ocean',
        description: 'Azul océano fresco y limpio.',
        className: 'ocean-theme' as string | null,
        preview: ['#EBF6FB', '#0EA5E9', '#0D2030'],
    },
    {
        id: 'forest',
        label: 'Forest',
        description: 'Verde bosque natural y relajante.',
        className: 'forest-theme' as string | null,
        preview: ['#EDF3ED', '#2D9148', '#0E1F0E'],
    },
    {
        id: 'custom',
        label: 'Personalizado',
        description: 'Crea tu propia combinación de colores desde el editor.',
        className: 'aura-custom-theme' as string | null,
        preview: ['#ffffff', '#000000', '#6366f1'],
    },
]

export type ThemeId = 'warm' | 'midnight' | 'ocean' | 'forest' | 'custom'
