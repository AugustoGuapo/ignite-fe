const VALUE_UNASSIGNED = 0;
const VALUE_ASSIGNED = 1;
const VALUE_IN_PROCESS = 2;
const VALUE_IN_REVIEW = 3;
const VALUE_COMPLETE = 4;

// Función para obtener el estado de la tarea como texto
export function obtenerEstadoTarea(status) {
    switch (status) {
        case VALUE_UNASSIGNED: return "Sin Asignar";
        case VALUE_ASSIGNED: return "Asignada";
        case VALUE_IN_PROCESS: return "En Proceso";
        case VALUE_IN_REVIEW: return "En Revision";
        case VALUE_COMPLETE: return "Completada";
        default: return "Estado Desconocido";
    }
}

export default obtenerEstadoTarea;