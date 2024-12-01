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
        const listProjects = await fetchData("https://ignite-be.onrender.com/projects");
        const listTask = await fetchData("https://ignite-be.onrender.com/tasks");

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
    
            // Invertir los pagos solo una vez si aún no tienen un marcador de inversión
            if (proyecto.payments && !proyecto._paymentsReversed) {
                proyecto.payments.reverse(); // Invierte los pagos
                proyecto._paymentsReversed = true; // Marca como invertidos
            }
    
            setTimeout(() => {
                mainContent.classList.add("fade-in");
                mainContent.innerHTML = `
                    <h2>${proyecto.name}</h2>
                    <p><strong>Costo:</strong> ${proyecto.cost || "No disponible"} COP</p>
                    <p><strong>Restante:</strong> ${proyecto.debt || "No disponible"} COP</p>
                    <p><strong>Descripción:</strong> ${proyecto.description || "No disponible"}</p>
                    <div class="payments-container">
                        <h3>Pagos:</h3>
                        <div class="main-card">
                            ${
                                proyecto.payments?.map((pago) => `
                                <div class="payment-card">
                                    <p><strong>Método:</strong> ${pago.payment_method}</p>
                                    <p><strong>Monto:</strong> $${pago.amount}</p>
                                    <p><strong>Fecha:</strong> ${pago.payment_date}</p>
                                </div>`).join("") || "<p>No hay pagos registrados</p>"
                            }
                        </div>
                        <button class="btn btn-primary" onclick="dialogLoadPay(${proyecto.id})">Agregar Pago</button>
                    </div>
                    <div id="pay-dialog" class="dialog-overlay">
                        <div class="dialog-content">
                            <h4>Agregar Pago</h4>
                            <form id="pay-form">
                                <div class="form-group">
                                    <label for="amount">Monto:</label>
                                    <input type="number" id="amount" class="form-control" step="0.01" placeholder="Ingrese el monto" required />
                                </div>
                                <div class="form-group">
                                    <label for="paymentMethod">Método de Pago:</label>
                                    <select id="paymentMethod" class="form-control" required>
                                        <option value="BankTransfer">Transferencia Bancaria</option>
                                        <option value="Cash">Efectivo</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="paymentDate">Fecha:</label>
                                    <input type="date" id="paymentDate" class="form-control" value="${new Date().toISOString().split("T")[0]}" required />
                                </div>
                                <button type="button" class="btn btn-success" onclick="submitPayment()">Guardar</button>
                                <button type="button" class="btn btn-secondary" onclick="closePayDialog()">Cancelar</button>
                            </form>
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
        setTimeout(() => {
            mainContent.classList.add("fade-in");
            mainContent.innerHTML = `
                <button id="closeDetails" class="close-btn">X</button><br>
                <h4>${tarea.name}</h4>
                <p>${tarea.description}</p>
                <p><strong>Estado:</strong> ${obtenerEstadoTarea(tarea.status)}</p>
            `;

            document.getElementById("closeDetails").addEventListener("click", () => {
                mainContent.innerHTML = "";
            });
        }, 10);
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

    const result = fetchData("https://ignite-be.onrender.com/payments", "POST", {
        project_id: idCurrent,
        amount: amount,
        payment_date: paymentDate,
        payment_method: paymentMethod
    });

    console.log({ result });
    closePayDialog();
}
