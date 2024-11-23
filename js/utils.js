const VALUE_UNASSIGNED = 0;
const VALUE_ASSIGNED = 1;
const VALUE_IN_PROCESS = 2;
const VALUE_COMPLETE = 3;

// Función para obtener el estado de la tarea como texto
export function obtenerEstadoTarea(status) {
    switch (status) {
        case VALUE_UNASSIGNED: return "Sin Asignar";
        case VALUE_ASSIGNED: return "Asignada";
        case VALUE_IN_PROCESS: return "En Proceso";
        case VALUE_COMPLETE: return "Completada";
        default: return "Estado Desconocido";
    }
}

export function addLogoutButton() {
    let navItems = document.getElementById("navItems");
    let btn = document.createElement('li');
    btn.className = 'nav-item';
    let anchor = document.createElement('a');
    anchor.className = 'btn btn-danger btn-custom';
    anchor.textContent = 'Cerrar sesión';
    anchor.addEventListener('click', closeSession);
    btn.appendChild(anchor);
    navItems.appendChild(btn);
}

function closeSession() {
    localStorage.removeItem('idUser');
    localStorage.removeItem('userType');
    

    window.location.href = '../login.html';
}

export function validateSession() {
    const user = localStorage.getItem('idUser');

    if (!user) {
        window.location.href = '../login.html';
    } else {
        const userType = localStorage.getItem("userType");
        chargeByType(userType);
    }
}

function chargeByType(userType) {
    if (userType === "adm") {
        viewAdmin();
    } else if (userType === "emp") {
        viewEmployee();
    }
}

function viewAdmin() {
    console.log("Admin user detected");
    navItems.innerHTML += `
        <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="../elementsList.html">Proyectos</a>
        </li>
    `;
}

function viewEmployee() {
    console.log("Employee user detected");
    navItems.innerHTML += `
        <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="../listTask/taskMenu.html">Lista de Tareas</a>
        </li>
    `;
}

export default obtenerEstadoTarea;