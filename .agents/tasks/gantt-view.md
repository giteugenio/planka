Actúa como un desarrollador Full-Stack Senior experto en React, Redux, Node.js y el framework Sails.js.

Necesito integrar una vista de diagrama Gantt interactivo dentro del proyecto Open Source Planka (un gestor de tableros Kanban). Para el renderizado del Gantt utilizaremos la librería `gantt-task-react` y modelaremos las dependencias entre tarjetas directamente en la base de datos (Enfoque 3: modificación del backend).

Por favor, genera el código y las instrucciones necesarias siguiendo este plan de implementación paso a paso:

### 1. Backend (Sails.js / PostgreSQL)
- Modifica el modelo de tarjeta (`server/api/models/Card.js`) para añadir una relación muchos a muchos autorreferenciada que represente dependencias (`dependencies` y `dependents`).
- Actualiza los controladores/servicios correspondientes para asegurar que al consultar las tarjetas de un tablero, el array `dependencies` se popule correctamente.
- Crea/actualiza los endpoints o acciones HTTP para permitir añadir o remover dependencias entre dos tarjetas (`cardId` y `dependencyCardId`).
- Asegúrate de incluir la emisión de eventos por WebSockets (Action Cable / Sails Sockets) para que los cambios en dependencias se sintonicen en tiempo real con otros usuarios.

### 2. Frontend (React / Redux)
- Añade las acciones, reducers y selectores necesarios en Redux para gestionar el estado de las dependencias de las tarjetas y la actualización de fechas (`startDate`, `dueDate`).
- Crea un componente `BoardGanttView.jsx` dentro del cliente React de Planka que:
  1. Obtenga las tarjetas del tablero activo desde Redux.
  2. Mapee los objetos de tarjeta de Planka a la interfaz `Task` que requiere `gantt-task-react`:
     - `id`: String(card.id)
     - `name`: card.name
     - `start`: new Date(card.startDate || card.createdAt)
     - `end`: new Date(card.dueDate || Date.now())
     - `progress`: porcentaje calculado a partir de los subitems de la tarjeta (checklist).
     - `dependencies`: array con los IDs de las tarjetas bloqueantes (`card.dependencies.map(d => String(d.id))`).
  3. Implemente la prevención de dependencias circulares antes de pasar los datos al componente `<Gantt />`.
  4. Maneje el evento `onDateChange` para que, cuando el usuario arrastre o cambie el tamaño de una barra en el Gantt, se dispare la acción de Redux que actualiza `startDate` y `dueDate` en el servidor.
  5. Maneje la edición o creación de dependencias de forma interactiva si la librería lo permite, o exponga el handler para actualizar el estado.

### 3. Interfaz de Usuario (UI Integration)
- Explica cómo integrar el botón de alternar vista (Kanban <-> Gantt) en la barra de herramientas del tablero (`BoardHeader` / `BoardViews`).

Entrégame el código estructurado por archivos, con explicaciones claras de las modificaciones en cada fichero y manejo de errores/validaciones de tipos con TypeScript/PropTypes donde corresponda.
