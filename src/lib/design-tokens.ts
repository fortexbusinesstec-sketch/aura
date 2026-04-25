/**
 * ══════════════════════════════════════════════════════
 *  AURA OS — Design Token Reference
 *  Archivo de referencia para el sistema de tematización
 * ══════════════════════════════════════════════════════
 *
 * CÓMO USAR LOS TOKENS EN COMPONENTES:
 *
 *  ✅ CORRECTO (semántico, adaptativo al tema):
 *    className="bg-background text-foreground"
 *    className="bg-card border border-border"
 *    className="bg-primary text-primary-foreground"
 *    className="text-muted-foreground"
 *    className="bg-danger text-danger-foreground"
 *
 *  ❌ INCORRECTO (hardcodeado, no respeta el tema):
 *    className="bg-gray-100 text-gray-800"
 *    className="bg-[#1a1b26]"
 *    className="text-white"  // usar text-foreground o text-primary-foreground
 *
 * ══════════════════════════════════════════════════════
 *  MAPA DE TOKENS
 * ══════════════════════════════════════════════════════
 *
 *  TOKEN                    │ DARK MODE          │ LIGHT MODE (Warm Alabaster)
 *  ─────────────────────────┼────────────────────┼─────────────────────────────
 *  bg-background            │ #1a1b26 (Tokyo)    │ #F6F4E8 (Alabastro)
 *  bg-background-subtle     │ #1f2335            │ tono ligeramente más oscuro
 *  bg-card                  │ #1f2335            │ #FFFFFF (blanco puro)
 *  text-card-foreground     │ #c0caf5            │ #1F2937
 *  text-foreground          │ #c0caf5            │ #1F2937
 *  text-foreground-muted    │ #a9b1d6            │ #6B7280
 *  bg-primary               │ Cyan #7dcfff       │ Dorado #FFE8BE
 *  text-primary-foreground  │ Dark               │ #473E28 (oscuro legible)
 *  text-muted-foreground    │ #8892b0            │ #6B7280
 *  bg-muted                 │ background sutil   │ gris muy claro
 *  bg-accent                │ Purple #bb9af7     │ Azul #2f65ca
 *  text-accent-foreground   │ Dark               │ Blanco
 *  border-border            │ #414868            │ #E5E7EB
 *  ring-ring                │ Cyan               │ Ámbar
 *  bg-danger                │ #f7768e            │ #c64343
 *  bg-warning               │ #ff9e64            │ #b05a10
 *  bg-success               │ #9ece6a            │ #2b7a40
 *
 * ══════════════════════════════════════════════════════
 *  PATRONES DE COMPONENTES RECOMENDADOS
 * ══════════════════════════════════════════════════════
 *
 *  Tarjeta estándar:
 *    <div className="bg-card border border-border rounded-xl p-6 text-card-foreground">
 *
 *  Botón primario:
 *    <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg">
 *
 *  Texto secundario / descripción:
 *    <p className="text-muted-foreground text-sm">
 *
 *  Badge / pill de estado:
 *    <span className="bg-accent/15 text-accent-foreground px-2 py-0.5 rounded-full text-xs">
 *
 *  Alert de error:
 *    <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-3">
 *
 *  Separador/divider:
 *    <div className="border-t border-border" />
 *
 *  Glassmorphism (usar clase utilitaria):
 *    <div className="glass rounded-xl p-4">
 *
 * ══════════════════════════════════════════════════════
 */

export const DESIGN_TOKENS = {
    // Fondos
    background: 'bg-background',
    backgroundSubtle: 'bg-background-subtle',
    card: 'bg-card',

    // Texto
    foreground: 'text-foreground',
    foregroundMuted: 'text-foreground-muted',
    cardForeground: 'text-card-foreground',
    mutedForeground: 'text-muted-foreground',

    // Acciones primarias
    primary: 'bg-primary',
    primaryForeground: 'text-primary-foreground',

    // Bordes
    border: 'border-border',
    ring: 'ring-ring',

    // Feedback
    danger: 'bg-danger',
    dangerForeground: 'text-danger-foreground',
    warning: 'bg-warning',
    warningForeground: 'text-warning-foreground',
    success: 'bg-success',
    successForeground: 'text-success-foreground',
} as const

export type DesignToken = keyof typeof DESIGN_TOKENS
