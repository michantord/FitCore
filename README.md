# FitCore

FitCore es una **Single Page Application (SPA)** desarrollada como proyecto semestral para la materia de Ingeniería Web. Está construida con **React** y **TypeScript** siguiendo la arquitectura **MVC** (Modelo-Vista-Controlador).

## Descripción del Proyecto

FitCore permite la gestión integral de usuarios, rutinas de entrenamiento y ejercicios. La plataforma está diseñada para ofrecer una experiencia dinámica e intuitiva, asegurando el cumplimiento de diversas reglas de negocio establecidas para el sistema.

### Roles de Usuario

El sistema diferencia dos tipos de roles:

- **Admin**: Tiene control total sobre el catálogo general de ejercicios y la gestión de los usuarios registrados en la plataforma.
- **Usuario**: Puede crear y gestionar sus propias rutinas de entrenamiento, marcar su completitud y hacer un seguimiento detallado de su progreso físico.

## Funcionalidades y Reglas de Negocio

El sistema incorpora las siguientes reglas de negocio y validaciones de forma natural a lo largo de su uso:
- **Asignación de nivel de dificultad** para los ejercicios y rutinas.
- **Bloqueo de rutinas incompletas** para incentivar el entrenamiento progresivo.
- **Alertas de inactividad** para motivar a los usuarios.
- **Desbloqueo de contenido** adicional o avanzado según el progreso del usuario.
- **Validaciones exhaustivas** en todos los formularios para mantener la integridad de la información.

## Tecnologías Utilizadas

- **Frontend:** React, TypeScript, Vite
- **Arquitectura:** MVC (Model-View-Controller)
- **Estilos:** CSS (Vanilla / Módulos)

## Instalación y Uso Local

Sigue estos pasos para levantar el proyecto en tu entorno local:

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre tu navegador en la URL indicada por Vite (por defecto suele ser `http://localhost:5173`).
