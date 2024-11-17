import { fetchData } from "./restclient.js";

document.addEventListener("DOMContentLoaded", function() {

    validateSession();
    addLogoutButton();

    async function fillClientSelect() {
        const clients = await fetchData('https://ignite-be.onrender.com/clients')
        console.log(clients);
        const select = document.getElementById("clientDropdown");
        clearSelect(select);
        clients.forEach(client => {
            const option = document.createElement("option");
            option.value = client.id;
            option.textContent = client.name;
            select.appendChild(option);
        });
    }

    function clearSelect(select) {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
    }
    const defaultOption = document.createElement("option");
    defaultOption.value = "nuevo";
    defaultOption.textContent = "Nuevo cliente";
    select.appendChild(defaultOption);
}
    fillClientSelect();

    const costInput = document.getElementById("costInput");

    costInput.addEventListener("input", function() {
        if (costInput.value < 0) {
            costInput.value = 0;
        }
    });

    function toggleNewClientSection() {
        const clientDropdown = document.getElementById("clientDropdown");
        const newClientSection = document.getElementById("newClientSection");
        if (clientDropdown.value === "nuevo") {
            newClientSection.style.display = "block";
        } else {
            newClientSection.style.display = "none";
        }
    }

    function submitTask() {
        const taskName = document.getElementById("taskName").value;
        const taskDescription = document.getElementById("taskDescription").value;
        const dueDate = document.getElementById("dueDate").value;
        const assignedTo = document.getElementById("employeeDropdown").value;
        const projectId = document.getElementById("projectDropdown").value;
        const taskPrice = document.getElementById("taskPriceInput").value;

        if (taskName && taskDescription && dueDate && assignedTo) {
            const res = fetchData('https://ignite-be.onrender.com/tasks', 'POST', {
                name: taskName,
                description: taskDescription,
                delivery_date: dueDate,
                employee_id: assignedTo,
                project_id: projectId,
                price: taskPrice
            });
            alert("Tarea asignada con éxito.");
            localStorage.removeItem('currentProjectId')
            localStorage.removeItem('currentProjectName')
            document.getElementById("taskForm").reset();
            window.location.href = "/elementsList.html";
        } else {
            alert("Por favor completa todos los campos.");
        }
    }

    function submitProject() {
        const projectName = document.getElementById("projectName").value;
        const projectDescription = document.getElementById("projectDescription").value;
        const projectDueDate = document.getElementById("projectDueDate").value;
        const clientDropdown = document.getElementById("clientDropdown").value;
        const projectCost = document.getElementById("costInput").value;
        
        if (projectName && projectDescription && projectDueDate && clientDropdown && projectCost) {
            const res = fetchData('https://ignite-be.onrender.com/projects', 'POST', {
                name: projectName,
                description: projectDescription,
                delivery_date: projectDueDate,
                client_id: clientDropdown,
                cost: projectCost
            });
            /*alert("Proyecto creado con éxito.");
            document.getElementById("projectForm").reset();*/
            window.location.href = "/elementsList.html";
        } else {
            alert("Por favor completa todos los campos.");
        }
    }

    function finalizeClientRegistration() {
        const newClientName = document.getElementById("newClientName").value;
        const newClientId = document.getElementById("newClientId").value;
        const newClientEmail = document.getElementById("newClientEmail").value;
        const newClientPhone = document.getElementById("newClientPhone").value;

        if (newClientName && newClientId && newClientEmail && newClientPhone) {

            const res = fetchData('https://ignite-be.onrender.com/clients', 'POST', {
                name: newClientName,
                identification_document: newClientId,
                email: newClientEmail,
                cellphone_number: newClientPhone
            });

            alert("Nuevo cliente registrado con éxito.");
            document.getElementById("newClientName").value = "";
            document.getElementById("newClientId").value = "";
            document.getElementById("newClientEmail").value = "";
            document.getElementById("newClientPhone").value = "";
            document.getElementById("newClientSection").style.display = "none";
            fillClientSelect();
        } else {
            alert("Por favor completa todos los campos del nuevo cliente.");
        }
    }

    window.toggleNewClientSection = toggleNewClientSection;
    window.submitTask = submitTask;
    window.submitProject = submitProject;
    window.finalizeClientRegistration = finalizeClientRegistration;
});

function validateSession() {
    const user = localStorage.getItem('idUser');

    console.log(user);

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
