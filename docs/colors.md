# Aura OS - Sistema de Colores (Tokyo Night)

Este documento define la paleta de colores oficial utilizada en el sistema, basada en el ecosistema **Tokyo Night**.

## 🌙 Tema Oscuro (Principal)
Basado en *Tokyo Night Storm/Night*.

| Variable | Hex | Uso |
| :--- | :--- | :--- |
| `--background` | `#1a1b26` | Fondo general de la aplicación |
| `--foreground` | `#a9b1d6` | Texto general y párrafos |
| `--card` | `#1f2335` | Fondo de tarjetas y contenedores |
| `--border` | `#414868` | Bordes y divisores |
| `--accent` | `#7dcfff` | Color cian para acciones primarias y estados |
| `--secondary` | `#bb9af7` | Púrpura para elementos de énfasis secundarios |
| `--muted` | `#565f89` | Texto desactivado o de menor importancia |

## ☀️ Tema Claro (Día)
Basado en *Tokyo Night Day*.

| Variable | Hex | Uso |
| :--- | :--- | :--- |
| `--background` | `#d5d6db` | Fondo general de la aplicación |
| `--foreground` | `#343b58` | Texto general y párrafos |
| `--card` | `#e1e2e7` | Fondo de tarjetas y contenedores |
| `--border` | `#acaeb3` | Bordes y divisores |
| `--accent` | `#34548a` | Azul oscuro para acciones primarias |
| `--secondary` | `#5a4a78` | Púrpura oscuro para énfasis |
| `--muted` | `#8b8e98` | Texto desactivado o sutil |

## Implementación Técnica
Los colores están definidos como variables CSS en `src/app/globals.css` y se sincronizan con la configuración de Tailwind CSS.

El sistema utiliza la clase `.light` en el elemento `<html>` para alternar entre temas. Por defecto, el sistema asume el tema oscuro.
