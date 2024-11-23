import { fetchData } from "./restclient.js";
import { obtenerEstadoTarea, validateSession, addLogoutButton } from "./utils.js";

document.addEventListener("DOMContentLoaded", function() {

    validateSession();
    addLogoutButton();

    const projectList = document.getElementById("projectList");
    const mainContent = document.querySelector(".main-content");

    async function mostrarProyectos() {
        projectList.innerHTML = "";
        const listProjects = await fetchData('https://ignite-be.onrender.com/projects').then(data => { return data; });
        const listTask = await fetchData('https://ignite-be.onrender.com/tasks').then(data => { return data; });
    
        listProjects.forEach(proyecto => {
            const nuevoProyecto = document.createElement("li");
            nuevoProyecto.classList.add("list-group-item", "list-group-item-action", "project-item", "d-flex", "align-items-center");
    
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
    
            nuevaTareaElemento.addEventListener("click", function() {
                localStorage.setItem('currentProjectId', proyecto.id);
                localStorage.setItem('currentProjectName', proyecto.name);
                
                window.location.href = '../addTaskForm/formularioAgregarTarea.html';
            });
            
            taskList.appendChild(nuevaTareaElemento);
    
            const tareasDelProyecto = listTask.filter(task => task.project === proyecto.id);
            tareasDelProyecto.forEach(tarea => {
                const nuevoElemento = document.createElement("li");
                nuevoElemento.classList.add("list-group-item", "task-item");
                nuevoElemento.textContent = tarea.name;
    
                nuevoElemento.addEventListener("click", function() {
                    mostrarDetallesTarea(tarea);
                });
    
                taskList.appendChild(nuevoElemento);
            });
    
            nuevoProyecto.addEventListener("click", function() {
                taskList.classList.toggle("open");
                caretIcon.classList.toggle("rotated");
            });
    
            closeIcon.addEventListener("click", function(event) {
                taskList.classList.remove("open");
                caretIcon.classList.remove("rotated");
                event.stopPropagation();
            });
    
            projectList.appendChild(nuevoProyecto);
            projectList.appendChild(taskList);
        });
    }
    
    
    

    function mostrarDetallesTarea(tarea) {
        // Elimina cualquier animación activa
        mainContent.classList.remove("fade-in");
    
        setTimeout(() => {
            // Añade la clase de animación y muestra los detalles de la tarea
            mainContent.classList.add("fade-in");
            mainContent.innerHTML = `
                <button id="closeDetails" class="close-btn">X</button><br>
                <div class="task-details-header d-flex align-items-center">
                    <h4 class="me-2 mb-0">${tarea.name}</h4> <!-- Nombre de la tarea -->
                    <button id="editTask" class="btn btn-primary">
                        <i class="bi bi-pencil"></i> Editar
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"/></svg>
                    </button> <!-- Botón editar -->
                </div>
                <br>
                <p>${tarea.description}</p>
                <p><strong>Estado:</strong> ${obtenerEstadoTarea(tarea.status)}</p>
            `;
    
            // Agrega el evento de clic al botón de cerrar
            document.getElementById("closeDetails").addEventListener("click", () => {
                mainContent.innerHTML = ""; // Limpia la sección de detalles al cerrar
            });
        }, 10);
    }
    
    // Llama a la función para mostrar proyectos al cargar la página
    mostrarProyectos();
});
