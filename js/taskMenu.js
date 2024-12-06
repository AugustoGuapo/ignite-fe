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
                <input type="file" id="fileInput" class="form-control mb-2" multiple />
                <div id="fileCardsContainer" class="d-flex flex-nowrap gap-2 overflow-auto mb-3" style="white-space: nowrap; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <!-- Contenedor horizontal para tarjetas -->
                </div>
                <button id="finishButton" class="btn btn-success" disabled>Terminar</button>
            </div>
        `;
    
        const fileInput = document.getElementById("fileInput");
        const fileCardsContainer = document.getElementById("fileCardsContainer");
        const finishButton = document.getElementById("finishButton");
    
        // Objeto auxiliar para almacenar los archivos seleccionados
        const dataTransfer = new DataTransfer();
    
        // Actualizar las tarjetas con los archivos seleccionados
        function updateFileCards() {
            fileCardsContainer.innerHTML = ""; // Limpiar el contenedor
            Array.from(dataTransfer.files).forEach((file, index) => {
                const card = document.createElement("div");
                card.className = "card";
                card.style.minWidth = "200px"; // Ancho fijo para las tarjetas
                card.style.flexShrink = "0"; // Evitar que se reduzca en flexbox
                card.style.height = "120px"; // Altura fija para las tarjetas
                card.innerHTML = `
                    <div class="card-body d-flex flex-column justify-content-between">
                        <span class="file-name text-truncate" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</span>
                        <button type="button" class="btn btn-danger btn-sm delete-file-btn mt-2" data-index="${index}">Eliminar</button>
                    </div>
                `;
                fileCardsContainer.insertBefore(card, fileCardsContainer.firstChild); // Insertar al principio (más reciente)
            });
            updateFinishButtonState();
        }
    
        // Agregar archivos al dataTransfer sin reemplazar los existentes
        fileInput.addEventListener("change", function () {
            Array.from(fileInput.files).forEach(file => {
                dataTransfer.items.add(file); // Añadir cada archivo nuevo al objeto DataTransfer
            });
            fileInput.files = dataTransfer.files; // Actualizar el input con los archivos combinados
            updateFileCards(); // Actualizar las tarjetas
        });
    
        // Eliminar un archivo seleccionado
        fileCardsContainer.addEventListener("click", function (event) {
            if (event.target.classList.contains("delete-file-btn")) {
                const fileIndex = event.target.getAttribute("data-index");
                dataTransfer.items.remove(fileIndex); // Eliminar el archivo del DataTransfer
                fileInput.files = dataTransfer.files; // Actualizar el input
                updateFileCards(); // Actualizar las tarjetas
            }
        });
    
        // Habilitar el botón "Terminar" solo si hay archivos y un comentario
        function updateFinishButtonState() {
            finishButton.disabled = dataTransfer.files.length === 0;
        }
    
    }        

    // Mostrar el contenedor de detalles con animación
    taskDetailContainer.style.display = 'block';
    setTimeout(() => {
        taskDetailContainer.classList.add("show");
    }, 10);

    // Botón "Iniciar" para cambiar estado
    const startButton = document.getElementById("startButton");
    if (startButton) {
        startButton.addEventListener("click", async function () {
            await fetchData('https://ignite-be.onrender.com/tasks', 'POST', {
                task_id: tarea.id,
                status: VALUE_IN_PROCESS,
                employee_id: tarea.assignee,
            });
            alert("La tarea ha sido iniciada");
            window.location.href = "/listTask/taskMenu.html";
        });
    }
    const finishButton = document.getElementById("finishButton");
    if(finishButton) {
        finishButton.addEventListener("click", async function () {
            await fetchData('https://ignite-be.onrender.com/tasks', 'POST', {
                task_id: tarea.id,
                status: VALUE_COMPLETE,
            });
            alert("Tarea finalizada");

            fetch(`https://ignite-be.onrender.com/resources/tasks/${tarea.id}/insert`, {
            method: "POST",
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    alert(`Se han enviado ${files.length} archivo(s) correctamente.`);
                    files = [];
                    renderFilesList();
                } else {
                    alert("Error al enviar las imágenes. Inténtalo nuevamente.");
                }
            })
            .catch((error) => {
                console.error("Error al enviar imágenes:", error);
                alert("Ocurrió un error durante la solicitud.");
            });
        });
        window.location.href = "/listTask/taskMenu.html";
    }
}

function agruparTareasPorProyecto(tareas) {
    return tareas.reduce((agrupadas, tarea) => {
        
        const proyectoId = tarea.project;
        const userId = localStorage.getItem('user_id');
        console.log(tarea)
        if (tarea.assignee !== Number(userId)) {
            return agrupadas;
        }
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
            tareaItem.classList.add(tarea.status === VALUE_UNASSIGNED ? "alert-danger" : cardClassTypeByStatus[tarea.status]);
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
document.getElementById("closeBtn").addEventListener("click", function () {
    const taskDetailContainer = document.getElementById("taskDetailContainer");

    taskDetailContainer.classList.remove("show"); // Inicia el proceso de ocultar

    // Esperar a que termine la animación y luego ocultar el panel
    taskDetailContainer.addEventListener('transitionend', function () {
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
document.addEventListener("DOMContentLoaded", async function () {
    validateSession();
    addLogoutButton();

    const tareas = await fetchData('https://ignite-be.onrender.com/tasks').then(data => { return data; });
    const tareasPorProyecto = agruparTareasPorProyecto(tareas);
    ordenarTareasAgrupadas(tareasPorProyecto);
    mostrarLista(tareasPorProyecto);
});
