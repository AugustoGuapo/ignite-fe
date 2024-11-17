document.addEventListener("DOMContentLoaded", function() {
    console.log("Initializing tool");

    validateSession();
    addLogoutButton(); // Llamar a la función para agregar el botón de cerrar sesión
    const bars = [
        { element: document.querySelectorAll('.bar')[0], width: '70%' },
        { element: document.querySelectorAll('.bar')[1], width: '50%' },
        { element: document.querySelectorAll('.bar')[2], width: '80%' },
        { element: document.querySelectorAll('.bar')[3], width: '60%' },
        { element: document.querySelectorAll('.bar')[4], width: '90%' },
    ];

    setTimeout(() => {
        bars.forEach(bar => {
            bar.element.style.width = bar.width;
        });
    }, 100);
    
});

function validateSession() {
    const user = localStorage.getItem('idUser');

    if (!user) {
        window.location.href = 'login.html';
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
            <a class="nav-link active" aria-current="page" href="elementsList.html">Proyectos</a>
        </li>
    `;
}

function viewEmployee() {
    console.log("Employee user detected");
    navItems.innerHTML += `
        <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="listTask/taskMenu.html">Lista de Tareas</a>
        </li>
    `;
}

function addLogoutButton() {
    navItems.innerHTML += `
        <li class="nav-item">
            <a class="btn btn-danger btn-custom" onClick="closeSession()">Cerrar sesión</a>
        </li>
    `;
}

function closeSession() {
    // Limpiar cualquier información de sesión almacenada en el localStorage
    localStorage.removeItem('idUser');
    localStorage.removeItem('userType');
    
    // Redirigir al usuario a la página de inicio de sesión
    window.location.href = 'login.html';
}

