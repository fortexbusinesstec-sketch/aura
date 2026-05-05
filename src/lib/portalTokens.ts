/**
 * ═══════════════════════════════════════════════════════════════
 *  AURA OS — Portal Token & PIN Utilities
 *  Generación segura de tokens UUID y PINs numéricos para
 *  autenticación en portales de oportunidades y proyectos.
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Genera un PIN numérico aleatorio de 4 dígitos.
 * Rango: 1000 - 9999
 */
export function generatePinCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Genera un PIN numérico aleatorio de longitud configurable (por defecto 4 dígitos).
 * @param length Número de dígitos (default: 4)
 */
export function generatePinCodeOfLength(length: number = 4): string {
    const min = Math.pow(10, length - 1)
    const max = Math.pow(10, length) - 1
    return Math.floor(min + Math.random() * (max - min + 1)).toString()
}
