# TroncoSport Inventory UI

Proyecto de aula para la marca deportiva **TroncoSport**, enfocado en la creacion de las interfaces `index.html` y `dashboard.html` para un sistema de gestion de inventario con enfoque UI/UX.

## Objetivo

Desarrollar un prototipo funcional de interfaz para un almacen deportivo que permita:

- Gestionar el acceso de usuarios al sistema.
- Registrar, consultar, editar y eliminar productos del inventario.
- Registrar, consultar, editar y eliminar usuarios conectados al backend.
- Mostrar el flujo de procesos del almacén.
- Presentar una propuesta visual coherente con la marca TroncoSport.

## Módulos incluidos

### 1. `index.html`

Pantalla de acceso al sistema con:

- Presentación del proyecto.
- Beneficios del sistema.
- Vista de la línea gráfica de la marca.
- Formulario de inicio de sesión.
- Acceso demo para ingresar al dashboard.

### 2. `dashboard.html`

Panel principal con:

- Métricas de inventario.
- Formulario CRUD de productos.
- Tabla de consulta con búsqueda y filtro.
- Acciones de editar y eliminar.
- CRUD de usuarios conectado a `http://localhost:8080/api/usuarios`.
- Gestion visual de procesos del almacen.
- Actividad reciente del sistema.

### 3. `usuarios.html`

Modulo frontend dedicado a usuarios con:

- Formulario para crear y editar usuarios.
- Tabla con busqueda por nombre o correo.
- Botones para editar y eliminar registros.
- Conexion al backend Spring Boot en `/api/usuarios`.

### 4. `app.js`

Lógica del prototipo en frontend:

- Inicio de sesión demo.
- Persistencia en `localStorage`.
- CRUD completo para productos.
- CRUD completo para usuarios.
- Búsqueda y filtrado.
- Actualización automática de indicadores.

### 5. `styles.css`

Hoja de estilos compartida con:

- Paleta alineada al logo de TroncoSport.
- Diseño responsivo.
- Jerarquia visual para mejorar la experiencia de uso.
- Componentes reutilizables para botones, tarjetas, tablas y formularios.

## Principios UI/UX aplicados

- **Jerarquia visual:** los indicadores mas importantes aparecen primero.
- **Consistencia:** colores, botones y componentes mantienen un mismo lenguaje visual.
- **Accesibilidad basica:** etiquetas visibles, contraste alto y estructura clara.
- **Retroalimentacion inmediata:** el sistema muestra mensajes al guardar, editar o eliminar.
- **Diseño responsivo:** la interfaz se adapta a portátiles y equipos de escritorio con Windows.

## Identidad visual

La propuesta gráfica toma como base el logo suministrado en el proyecto:

- **Negro / gris oscuro:** sensacion de control y solidez.
- **Naranja intenso:** energia deportiva y llamadas a la accion.
- **Verde brillante:** confirmación, estabilidad y estados positivos.
- **Blanco tecnico:** lectura clara y alto contraste.

## Credenciales demo

Para ingresar al prototipo:

- **Usuario:** `admin.tronco`
- **Contrasena:** `Tronco2026`

## Estructura del proyecto

```text
Proyecto aula/
├── app.js
├── dashboard.html
├── index.html
├── logo.png
├── README.md
├── usuarios.html
└── styles.css
```

## Instalación y ejecución en Windows

1. Descarga o clona el repositorio en tu equipo.
2. Abre la carpeta del proyecto en **Explorador de archivos**, **Visual Studio Code** o cualquier editor.
3. Haz doble clic sobre `index.html` para abrirlo en tu navegador.

Tambien puedes abrirlo desde Visual Studio Code con una extension como Live Server, aunque no es obligatorio porque el proyecto funciona como prototipo estatico.

## Uso del sistema

1. Abre `index.html`.
2. Inicia sesion con las credenciales demo.
3. Accede a `dashboard.html`.
4. Registra nuevos productos en el formulario.
5. Consulta la tabla de inventario.
6. Usa los botones **Editar** y **Eliminar** para completar el CRUD.
7. En el modulo de usuarios, crea, busca, edita y elimina usuarios conectados al backend.
8. Tambien puedes abrir directamente `usuarios.html` para usar el modulo frontend de usuarios.

## Recomendación para entrega

Para cumplir completamente con la entrega del profesor:

1. Sube esta carpeta a un repositorio en GitHub.
2. Verifica que el `README.md` se vea correctamente en GitHub.
3. Copia el enlace del repositorio.
4. Comparte el enlace en Q10.

## Posibles mejoras futuras

- Conectar el CRUD a una base de datos real.
- Agregar módulo de ventas y proveedores.
- Crear autenticación con diferentes roles.
- Exportar reportes en PDF o Excel.
- Implementar backend con PHP, Node.js o Django.
