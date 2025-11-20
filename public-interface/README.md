# 💰 Gestor de Presupuestos Personal

Una interfaz web moderna, intuitiva y profesional para gestionar tus finanzas personales. Construida con HTML, CSS y JavaScript puro.

## ✨ Características

### 📊 Dashboard de Estadísticas
- **Ingresos Totales**: Visualiza todos tus ingresos acumulados
- **Gastos Totales**: Controla cuánto has gastado
- **Balance**: Calcula automáticamente tu balance disponible

### 💳 Gestión de Transacciones
- Agregar ingresos y gastos de forma sencilla
- Categorización automática con iconos intuitivos
- Fechas personalizables
- Descripciones detalladas

### 📈 Categorías Predefinidas

**Ingresos:**
- 💼 Salario
- 💻 Freelance
- 📊 Inversiones
- 🛒 Ventas
- 💰 Otros Ingresos

**Gastos:**
- 🍔 Alimentación
- 🚗 Transporte
- 🏠 Vivienda
- 💡 Servicios
- 🎮 Entretenimiento
- ⚕️ Salud
- 📚 Educación
- 📦 Otros Gastos

### 💡 Presupuesto por Categoría
- Límites de gasto configurables por categoría
- Barras de progreso visuales
- Alertas cuando excedes el presupuesto
- Seguimiento en tiempo real

### 🔍 Filtros y Búsqueda
- Ver todas las transacciones
- Filtrar solo ingresos
- Filtrar solo gastos

### 💾 Almacenamiento Local
- Todos los datos se guardan en tu navegador
- No requiere conexión a internet
- Privacidad total de tus datos

## 🚀 Cómo Usar

### Instalación
1. Simplemente abre el archivo `index.html` en tu navegador web favorito
2. No requiere instalación ni configuración adicional

### Agregar una Transacción
1. Selecciona el tipo de transacción (Ingreso o Gasto)
2. Completa el formulario:
   - Descripción (ej: "Salario mensual")
   - Monto (ej: 2500.00)
   - Categoría (selecciona de la lista)
   - Fecha (por defecto es hoy)
3. Haz clic en "Agregar Transacción"

### Ver Transacciones
- Todas las transacciones aparecen en el historial
- Los ingresos se muestran en verde (+)
- Los gastos se muestran en rojo (-)
- Usa los filtros para ver solo ingresos o gastos

### Eliminar Transacciones
- Haz clic en el icono de papelera 🗑️ en cualquier transacción
- Confirma la eliminación

### Monitorear Presupuesto
- La sección "Presupuesto por Categoría" muestra:
  - Cuánto has gastado en cada categoría
  - El límite establecido
  - Una barra de progreso visual
  - Advertencia en rojo si excedes el límite

## 🎨 Características de Diseño

### Interfaz Moderna
- Diseño limpio y profesional
- Gradientes suaves y sombras elegantes
- Transiciones fluidas
- Iconos intuitivos con emojis

### Responsive
- Adaptable a cualquier tamaño de pantalla
- Optimizado para móviles, tablets y escritorio
- Grids flexibles que se reorganizan automáticamente

### Experiencia de Usuario
- Feedback visual inmediato
- Notificaciones de éxito
- Estados hover interactivos
- Scrollbar personalizada

## ⚙️ Personalización

### Modificar Límites de Presupuesto
En el código JavaScript, busca el objeto `budgetLimits` y modifica los valores:

```javascript
const budgetLimits = {
    'Alimentación': 500,    // Cambia este valor
    'Transporte': 200,      // Cambia este valor
    'Vivienda': 800,        // etc.
    // ...
};
```

### Agregar Nuevas Categorías
Modifica el objeto `categories` en el código:

```javascript
const categories = {
    income: ['Salario', 'Tu Nueva Categoría'],
    expense: ['Alimentación', 'Tu Nueva Categoría']
};
```

Y agrega el ícono correspondiente en `getCategoryIcon()`.

### Cambiar Colores
Modifica las variables CSS en `:root`:

```css
:root {
    --primary-color: #6366f1;     /* Color principal */
    --secondary-color: #10b981;   /* Color de éxito */
    --danger-color: #ef4444;      /* Color de peligro */
    /* ... */
}
```

## 💾 Datos y Privacidad

- **Almacenamiento**: Todos los datos se guardan en `localStorage` de tu navegador
- **Privacidad**: Ningún dato sale de tu computadora
- **Respaldo**: Exporta/importa datos (próximamente)
- **Borrar datos**: Limpia el localStorage de tu navegador para resetear

## 🔒 Seguridad

- No hay comunicación con servidores externos
- No se recopila información personal
- Todos los cálculos se realizan localmente
- Código fuente abierto y auditable

## 🌟 Próximas Características (Sugerencias)

- [ ] Exportar datos a CSV/Excel
- [ ] Importar transacciones
- [ ] Gráficos más avanzados (Chart.js)
- [ ] Múltiples cuentas bancarias
- [ ] Presupuestos mensuales
- [ ] Recordatorios de pagos
- [ ] Modo oscuro
- [ ] Reportes mensuales/anuales

## 📱 Compatibilidad

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Navegadores móviles modernos

## 🤝 Soporte

Para reportar problemas o sugerir mejoras, por favor:
1. Abre un issue en el repositorio
2. Describe el problema o sugerencia
3. Incluye capturas de pantalla si es posible

## 📄 Licencia

Este proyecto está bajo la licencia especificada en el repositorio principal.

---

**¡Disfruta gestionando tus finanzas de manera inteligente! 💰📊**
