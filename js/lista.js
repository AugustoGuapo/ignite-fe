import { fetchData } from "./restclient.js";
import { obtenerEstadoTarea, validateSession, addLogoutButton } from "./utils.js";

let showDetailProyect = false;
let idCurrent = 0;
let proyectoAbierto = null;

document.addEventListener("DOMContentLoaded", function () {
    const projectList = document.getElementById("projectList");
    const mainContent = document.querySelector(".main-content");

    validateSession();
    addLogoutButton();

    async function mostrarProyectos() {
        projectList.innerHTML = "";
        const listProjects = await fetchData("https://ignite-be.onrender.com/projects", localStorage.getItem("user_token"));
        const listTask = await fetchData("https://ignite-be.onrender.com/tasks",  localStorage.getItem("user_token"));

        listProjects.forEach((proyecto) => {
            const nuevoProyecto = document.createElement("li");
            nuevoProyecto.classList.add(
                "list-group-item",
                "list-group-item-action",
                "project-item",
                "d-flex",
                "align-items-center"
            );

            const caretIcon = document.createElement("span");
            caretIcon.classList.add("caret-icon", "me-2", "bi", "bi-caret-right-fill");

            const closeIcon = document.createElement("span");
            closeIcon.classList.add("close-icon");

            nuevoProyecto.appendChild(caretIcon);
            nuevoProyecto.appendChild(document.createTextNode(proyecto.name));
            nuevoProyecto.appendChild(closeIcon);

            const taskList = document.createElement("ul");
            taskList.classList.add("list-group", "task-list");

            // Crear y agregar la tarea "Nueva tarea"
            const nuevaTareaElemento = document.createElement("li");
            nuevaTareaElemento.classList.add("list-group-item", "task-item");
            nuevaTareaElemento.textContent = "Nueva tarea";

            nuevaTareaElemento.addEventListener("click", function () {
                localStorage.setItem("currentProjectId", proyecto.id);
                localStorage.setItem("currentProjectName", proyecto.name);
                window.location.href = "../addTaskForm/formularioAgregarTarea.html";
            });

            taskList.appendChild(nuevaTareaElemento);

            const tareasDelProyecto = listTask.filter((task) => task.project === proyecto.id);
            tareasDelProyecto.forEach((tarea) => {
                const nuevoElemento = document.createElement("li");
                nuevoElemento.classList.add("list-group-item", "task-item");
                nuevoElemento.textContent = tarea.name;

                nuevoElemento.addEventListener("click", function () {
                    mostrarDetallesTarea(tarea);
                });

                taskList.appendChild(nuevoElemento);
            });

            nuevoProyecto.addEventListener("click", function () {
                if (proyectoAbierto && proyectoAbierto !== taskList) {
                    proyectoAbierto.classList.remove("open");
                    proyectoAbierto.previousSibling.querySelector(".caret-icon").classList.remove("rotated");
                }

                const isOpen = taskList.classList.toggle("open");
                caretIcon.classList.toggle("rotated", isOpen);
                proyectoAbierto = isOpen ? taskList : null;

                mostrarDetallesProyecto(proyecto);
            });

            closeIcon.addEventListener("click", function (event) {
                taskList.classList.remove("open");
                caretIcon.classList.remove("rotated");
                event.stopPropagation();
            });

            projectList.appendChild(nuevoProyecto);
            projectList.appendChild(taskList);
        });
    }

    function mostrarDetallesProyecto(proyecto) {
        if (!showDetailProyect || idCurrent !== proyecto.id) {
            mainContent.classList.remove("fade-in");

            if (proyecto.payments && !proyecto._paymentsReversed) {
                proyecto.payments.reverse(); // Invierte los pagos
                proyecto._paymentsReversed = true; // Marca como invertidos
            }
    
            setTimeout(() => {
                mainContent.classList.add("fade-in");
                mainContent.innerHTML = `
                    <div class="project-details">
                        <h2>${proyecto.name}</h2>
                        <p><strong>Costo:</strong> ${proyecto.cost || "No disponible"} COP</p>
                        <p><strong>Restante:</strong> ${proyecto.debt || "No disponible"} COP</p>
                        <p><strong>Descripción:</strong> ${proyecto.description || "No disponible"}</p>
                        <div class="payments-container">
                            <h3>Pagos:</h3>
                            <div class="main-card">
                                ${
                                    proyecto.payments?.map(
                                        (pago) => `
                                        <div class="payment-card">
                                            <p><strong>Método:</strong> ${pago.payment_method}</p>
                                            <p><strong>Monto:</strong> $${pago.amount}</p>
                                            <p><strong>Fecha:</strong> ${pago.payment_date}</p>
                                        </div>
                                    `
                                    ).join("") || "<p>No hay pagos registrados</p>"
                                }
                            </div>
                            <button class="btn btn-primary" onclick="dialogLoadPay(${proyecto.id})">Agregar Pago</button>
                        </div>
                    </div>
                `;
            }, 10);
    
            showDetailProyect = true;
            idCurrent = proyecto.id;
        } else {
            mainContent.classList.remove("fade-in");
            mainContent.innerHTML = "";
            idCurrent = -1;
            showDetailProyect = false;
        }
    }
    
    

    function mostrarDetallesTarea(tarea) {
        mainContent.classList.add("fade-in");
        mainContent.innerHTML = `
            <div class="task-details">
                <button id="closeDetails" class="close-btn">X</button><br>
                <h2>${tarea.name}</h2>
                <p><strong>Descripción:</strong> ${tarea.description}</p>
                <p><strong>Estado:</strong> ${obtenerEstadoTarea(tarea.status)}</p>
                <button id="editTaskBtn" class="btn btn-primary mt-3">Editar</button>
            </div>
        `;
    
        document.getElementById("closeDetails").addEventListener("click", () => {
            mainContent.innerHTML = "";
        });
    
        document.getElementById("editTaskBtn").addEventListener("click", () => {
            habilitarEdicionTarea(tarea);
        });
    }

    function habilitarEdicionTarea(tarea) {
        mainContent.innerHTML = `
            <div class="task-edit-form">
                <h2>Editar Tarea</h2>
                <label for="taskName">Nombre:</label>
                <input type="text" id="taskName" class="form-control mb-3" value="${tarea.name}">
                
                <label for="taskDescription">Descripción:</label>
                <textarea id="taskDescription" class="form-control mb-3">${tarea.description}</textarea>
                
                <label for="taskStatus">Estado:</label>
                <select id="taskStatus" class="form-select mb-3">
                    <option value="1" ${tarea.status === 1 ? "selected" : ""}>Pendiente</option>
                    <option value="2" ${tarea.status === 2 ? "selected" : ""}>En Proceso</option>
                    <option value="3" ${tarea.status === 3 ? "selected" : ""}>Completada</option>
                </select>
                
                <button id="saveTaskBtn" class="btn btn-success">Guardar Cambios</button>
                <button id="cancelEditBtn" class="btn btn-secondary">Cancelar</button>
            </div>
        `;
    
        document.getElementById("cancelEditBtn").addEventListener("click", () => {
            mostrarDetallesTarea(tarea);
        });
    
        document.getElementById("saveTaskBtn").addEventListener("click", () => {
            guardarCambiosTarea(tarea.id);
        });
    }

    async function guardarCambiosTarea(taskId) {
        try {
            await fetchData('https://ignite-be.onrender.com/tasks', localStorage.getItem("userToken"), 'POST', {
                task_id: taskId,
                name: document.getElementById("taskName").value,
                description: document.getElementById("taskDescription").value,
            });
            setTimeout(() => {
                location.reload();
            }, 1500);
        } catch (error) {
            console.error("Error al actualizar la tarea:", error);
            alert("No se pudo actualizar la tarea. Inténtalo de nuevo.");
        }
    }
    
    
    

    mostrarProyectos();
    window.dialogLoadPay = dialogLoadPay;
    window.closePayDialog = closePayDialog;
    window.submitPayment = submitPayment;
});

// Funciones del diálogo de pago
function dialogLoadPay() {
    const dialog = document.getElementById("pay-dialog");
    dialog.dataset.projectId = idCurrent;
    dialog.style.display = "flex";
}

function closePayDialog() {
    const dialog = document.getElementById("pay-dialog");
    dialog.style.display = "none";
    setTimeout(() => {
        location.reload();
    }, 1500);
}

function submitPayment() {
    const dialog = document.getElementById("pay-dialog");
    const idProyect = dialog.dataset.projectId;
    const amount = parseFloat(document.getElementById("amount").value);
    const paymentMethod = document.getElementById("paymentMethod").value;
    const paymentDate = document.getElementById("paymentDate").value;

    if (!amount || !paymentMethod || !paymentDate) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const result = fetchData("https://ignite-be.onrender.com/payments", localStorage.getItem("userToken"), "POST", {
        project_id: idCurrent,
        amount: amount,
        payment_date: paymentDate,
        payment_method: paymentMethod
    }, localStorage.getItem('user_token') );

    console.log({ result });
    closePayDialog();
}
