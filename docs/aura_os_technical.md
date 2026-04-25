# Content for the detailed Markdown file
aura_spec_content = """# Aura OS: Especificación Técnica y Sistema de Diseño (v1.0)

## 1. Introducción y Visión General
**Aura OS** es el núcleo operativo y centro de gravedad del ecosistema **Fortex**. Este sistema ha sido diseñado para actuar como el "Sistema Operativo" de la empresa, facilitando la colaboración entre la dirección técnica (Fabrizio) y la dirección administrativa (Esteban).

Su arquitectura binaria permite gestionar eficientemente dos modelos de negocio distintos bajo un mismo techo tecnológico:
1. **Fortex Digital Solutions:** El motor de servicios B2B (Agencia).
2. **Fortex Business Solutions:** El laboratorio de innovación y productos SaaS.

---

## 2. Sistema de Diseño: Tokyo Night
Inspirado en el tema de VS Code, el diseño de Aura OS busca reducir la fatiga visual del desarrollador mientras mantiene una estética profesional y moderna.

### 2.1. Paleta de Colores
| Elemento | Hex | Aplicación |
| :--- | :--- | :--- |
| **Background (Night)** | `#1a1b26` | Fondo principal de la App y contenedores. |
| **Foreground** | `#a9b1d6` | Texto principal, párrafos y etiquetas. |
| **Accent (Cyan)** | `#7dcfff` | Botones primarios, enlaces y estados activos. |
| **Magenta** | `#bb9af7` | Identificador de área: *Business Solutions* (SaaS). |
| **Orange** | `#ff9e64` | Identificador de área: *Digital Solutions* (Agencia). |
| **Gray (Muted)** | `#414868` | Bordes, divisores y estados inactivos. |

### 2.2. Tipografía
Se utiliza la fuente **Montserrat** por su versatilidad y carácter corporativo-moderno.
- **Títulos:** Montserrat Bold (700).
- **Cuerpo:** Montserrat Regular (400).
- **Interlineado:** 1.5 para máxima legibilidad.

---

## 3. Stack Tecnológico
La infraestructura de Aura OS está diseñada para ser escalable, segura y "agent-first".

- **Frontend:** Next.js + React.js (App Router).
- **Estilos:** Tailwind CSS (Configuración personalizada con paleta Tokyo Night).
- **Backend/Base de Datos:** Supabase (PostgreSQL).
- **Seguridad:** Supabase Vault para encriptación de secretos y tokens de clientes.
- **Despliegue:** Cloudflare Pages / Vercel.

---


## 4. Estándares de Arquitectura y Código (Clean Code)

Para garantizar la mantenibilidad y agilidad de Aura OS, el desarrollo se regirá por una selección pragmática de principios y patrones de diseño, adaptados al ecosistema de Next.js (App Router) y Supabase. Se prioriza la legibilidad y la simplicidad (KISS) sobre la abstracción prematura.

### 4.1. Principios de Desarrollo Core
La base de nuestro código se rige por los siguientes paradigmas:

* **SOLID:** Especial énfasis en el Principio de Responsabilidad Única (SRP). Un componente de UI no debe saber cómo conectarse a la base de datos; por ejemplo una función de cálculo de precios no debe saber cómo renderizar un PDF.
* **KISS (Keep It Simple, Stupid) & YAGNI (You Aren't Gonna Need It):** No construiremos abstracciones "por si acaso". Implementamos solo lo que la funcionalidad actual requiere.
* **DRY (Don't Repeat Yourself):** Centralización de lógica de negocio (como las fórmulas de cotización) para evitar inconsistencias si los precios cambian.
* **Clean Code & Autodocumentación:** * El código debe leerse como prosa. Usaremos nombres de variables y funciones explícitos (ej. `calculateMarketingQuoteTotal()` en lugar de `calcTotal()`).
    * **Política de Comentarios:** Evitaremos los comentarios que explican *qué* hace el código (eso debe indicarlo el nombre de la función). Los comentarios se reservarán estrictamente para explicar *por qué* se tomó una decisión técnica inusual o compleja (ej. "Usamos esta fórmula de encriptación porque la pasarela X lo requiere en este formato").

### 4.2. Patrones de Diseño Aplicados

No forzaremos patrones donde el framework ya provee soluciones nativas. Los patrones permitidos y su caso de uso en Aura OS son:

#### 1. Repository Pattern (Capa de Acceso a Datos)
Nunca llamaremos a la API de Supabase directamente desde los componentes de React o las vistas.
* **Uso:** Crearemos un directorio `/repositories` (ej. `ClientRepository.ts`). Si el componente necesita la lista de clientes, llama a `ClientRepository.getAll()`. Si en el futuro cambiamos Supabase por otra cosa, solo modificamos el repositorio, no los cientos de componentes visuales.

#### 2. Strategy Pattern (Motor de Calculadoras)
Ideal para manejar las diferentes formas de cotizar servicios.
* **Uso:** En lugar de tener sentencias `if/else` gigantes para saber si estamos cotizando una Web o una App, tendremos una interfaz `IQuoteCalculator`. Luego tendremos `MarketingCalculatorStrategy` y `SoftwareCalculatorStrategy`. El sistema usará la estrategia adecuada según el servicio seleccionado por el usuario (Esteban).

#### 3. Factory Method (Generación de Documentos)
Para estandarizar la creación de entidades complejas.
* **Uso:** Para el módulo de documentos. Un `DocumentFactory` recibirá el JSONB de la calculadora y devolverá el objeto formateado listo para ser convertido en PDF, sin importar si es un contrato, una cotización o un reporte.

#### 4. MVC Adaptado (Model-View-Controller)
La arquitectura natural de Next.js con App Router.
* **Model:** Supabase y nuestros Repositories.
* **View:** Los React Server Components (RSC) y Client Components (`page.tsx`, componentes de UI).
* **Controller:** Los Server Actions y Route Handlers (`actions.ts`, `route.ts`) que procesan los formularios y llaman a los Repositorios.

### 4.3. Patrones Excluidos (Prevención de Sobreingeniería)
Para mantener la velocidad de iteración, **no** implementaremos arquitecturas complejas como CQRS, Saga Pattern o Bulkhead. El manejo de transacciones complejas se delegará a las funciones nativas (RPC) y *Edge Functions* de Supabase.