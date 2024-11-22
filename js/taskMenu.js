import { fetchData } from "./restclient.js";
import { obtenerEstadoTarea, addLogoutButton, validateSession } from "./utils.js";

// Simulación de datos JSON recibidos
const VALUE_UNASSIGNED = 0;
const VALUE_ASSIGNED = 1;
const VALUE_IN_PROCESS = 2;
const VALUE_COMPLETE = 3;


const cardClassTypeByStatus = ["alert-danger", "alert-primary", "alert-warning", "alert-success"];

function mostrarDetalles(tarea) {
    const taskDetailContainer = document.getElementById("taskDetailContainer");
    const taskDetail = document.getElementById("taskDetail");

    // Mostrar la tarea seleccionada
    taskDetail.innerHTML = `<h5>${tarea.name}</h5>
                            <p>${tarea.description}</p>
                            <p><strong>Estado:</strong> ${obtenerEstadoTarea(tarea.status)}</p>`;
    
    // Añadir opciones según el estado de la tarea
    if (tarea.status === VALUE_ASSIGNED) {
        taskDetail.innerHTML += '<button id="startButton" class="btn btn-primary">Iniciar</button>';
    } else if (tarea.status === VALUE_IN_PROCESS) {
        taskDetail.innerHTML += `
            <div>
                <textarea id="commentText" placeholder="Comentarios" class="form-control mb-2"></textarea>
                <input type="file" id="fileInput" class="form-control mb-2" multiple />
                <button id="finishButton" class="btn btn-success" disabled>Terminar</button>
            </div>`;
        
        const commentText = document.getElementById("commentText");
        const fileInput = document.getElementById("fileInput");
        const finishButton = document.getElementById("finishButton");
    
        commentText.addEventListener("input", function() {
            finishButton.disabled = commentText.value.trim() === "" || fileInput.files.length === 0;
        });
    
        fileInput.addEventListener("change", function() {
            finishButton.disabled = commentText.value.trim() === "" || fileInput.files.length === 0;
        });
    }

    // Añadir evento para el botón "Terminar"
    const finishButton = document.getElementById("finishButton");
    if (finishButton) {
        finishButton.addEventListener("click", async function() {
            const formData = new FormData();
            formData.append("task_id", tarea.id);
            formData.append("status", VALUE_COMPLETE);
            formData.append("employee_id", tarea.assignee);
            formData.append("comment", commentText.value);

            // Adjuntar todos los archivos seleccionados
            Array.from(fileInput.files).forEach((file, index) => {
                formData.append(`file${index}`, file);
            });
            console.log(formData)

            try {
                const response = await fetch('https://ignite-be.onrender.com/tasks', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert("La tarea ha sido terminada.");
                    window.location.href = "/listTask/taskMenu.html";
                } else {
                    alert("Error al terminar la tarea. Por favor, inténtelo de nuevo.");
                }
            } catch (error) {
                console.error("Error al enviar los datos:", error);
                alert("Hubo un error al conectar con el servidor.");
            }
        });
    }

    // Cambiar a display block antes de añadir la clase show para permitir la animación
    taskDetailContainer.style.display = 'block'; // Asegurarse de que se muestre

    // Esperar un momento para permitir que el contenedor se muestre antes de agregar la clase
    setTimeout(() => {
        taskDetailContainer.classList.add("show"); // Añadir la clase que inicia la animación
    }, 10); // Un pequeño retraso para permitir que el display cambie antes de aplicar la animación

    // Añadir evento para el botón "Iniciar"
    const startButton = document.getElementById("startButton");
    if (startButton) {
        
        startButton.addEventListener("click", function() {
            console.log(tarea)
            const res = fetchData('https://ignite-be.onrender.com/tasks', 'POST', {
                task_id: tarea.id,
                status: VALUE_IN_PROCESS,
                employee_id: tarea.assignee
            })
            alert("La tarea ha sido iniciada.");
            window.location.href = "/listTask/taskMenu.html"
        });
    }

    // Añadir evento para el botón "Terminar"
    if (finishButton) {
        finishButton.addEventListener("click", function() {
            const res = fetchData('https://ignite-be.onrender.com/tasks', 'POST', {
                task_id: tarea.id,
                status: VALUE_COMPLETE,
                employee_id: tarea.assignee
            })
            alert("La tarea ha sido terminada.");
            window.location.href = "/listTask/taskMenu.html"
        });
    }
}

function agruparTareasPorProyecto(tareas) {
    return tareas.reduce((agrupadas, tarea) => {
        const proyectoId = tarea.project;
        if (!agrupadas[proyectoId]) {
            agrupadas[proyectoId] = [];
        }
        agrupadas[proyectoId].push(tarea);
        return agrupadas;
    }, {});
}

// Función para mostrar la lista de tareas agrupadas
function mostrarLista(tareasAgrupadas) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = ''; 

    for (const proyectoId in tareasAgrupadas) {
        const tareasDelProyecto = tareasAgrupadas[proyectoId];

        const proyectoContainer = document.createElement("div");
        proyectoContainer.classList.add("project-container");

        const proyectoHeader = document.createElement("h5");
        proyectoHeader.innerText = `Proyecto ID: ${proyectoId}`;
        proyectoContainer.appendChild(proyectoHeader);

        const tareasList = document.createElement("ul");
        tareasDelProyecto.forEach(tarea => {
            const tareaItem = document.createElement("li");
            tareaItem.classList.add("alert");
            tareaItem.classList.add(tarea.status === VALUE_UNASSIGNED ? "alert-danger" :cardClassTypeByStatus[tarea.status]);
            tareaItem.innerHTML = `
                <strong>${tarea.name}</strong><br>
                ${tarea.description}<br>
                <small>Fecha de entrega: ${new Date(tarea.delivery_date).toLocaleDateString()}</small>
            `;
            tareaItem.addEventListener("click", () => mostrarDetalles(tarea));
            tareasList.appendChild(tareaItem);
        });

        proyectoContainer.appendChild(tareasList);
        taskList.appendChild(proyectoContainer);
    }
}

// Cerrar detalles de la tarea con animación
document.getElementById("closeBtn").addEventListener("click", function() {
    const taskDetailContainer = document.getElementById("taskDetailContainer");
    
    taskDetailContainer.classList.remove("show"); // Inicia el proceso de ocultar

    // Esperar a que termine la animación y luego ocultar el panel
    taskDetailContainer.addEventListener('transitionend', function() {
        if (!taskDetailContainer.classList.contains('show')) {
            taskDetailContainer.style.display = 'none'; // Ocultar el contenedor después de la animación
        }
    }, { once: true }); // Usar { once: true } para que el evento se ejecute solo una vez
});

function ordenarTareasAgrupadas(tareasAgrupadas) {
    for (const proyectoId in tareasAgrupadas) {
        tareasAgrupadas[proyectoId].sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));
    }
}


// Mostrar la lista al cargar la página
document.addEventListener("DOMContentLoaded", async function() {
    
    validateSession();
    addLogoutButton();

    const tareas = await fetchData('https://ignite-be.onrender.com/tasks').then(data => { return data; });
    const tareasPorProyecto = agruparTareasPorProyecto(tareas);
    ordenarTareasAgrupadas(tareasPorProyecto);
    mostrarLista(tareasPorProyecto);});
