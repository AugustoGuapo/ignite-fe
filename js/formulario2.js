import { fetchData } from "./restclient.js";
import { validateSession, addLogoutButton } from "./utils.js";

const fileUploadInput = document.getElementById("fileUpload");
const uploadedFilesList = document.getElementById("uploadedFilesList");

let files = [];

renderFilesList();

fileUploadInput.addEventListener("change", (event) => {
    const selectedFiles = Array.from(event.target.files);
    handleFiles(selectedFiles);
});

function handleFiles(selectedFiles) {
    selectedFiles.forEach((file) => {
        if (!files.some((f) => f.name === file.name)) {
            files.push(file); // Agregar a la lista
        }
    });
    renderFilesList();
}

// Renderiza la lista de archivos
function renderFilesList() {
    uploadedFilesList.innerHTML = "";

    if (files.length === 0) {
        uploadedFilesList.textContent = "No se han seleccionado archivos o plantillas";
        return;
    }

    files.forEach((file, index) => {
        const fileItem = document.createElement("div");
        fileItem.classList.add("file-item");
        fileItem.innerHTML = `
            <span title="${file.name}">${file.name}</span>
            <button type="button" data-index="${index}" class="delete-button">Eliminar</button>
        `;
        uploadedFilesList.appendChild(fileItem);
    });

    // Añadir funcionalidad a los botones eliminar
    document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", (event) => {
            const index = parseInt(event.target.dataset.index, 10);
            removeFile(index);
        });
    });
}

// Eliminar archivo de la lista
function removeFile(index) {
    files.splice(index, 1);
    renderFilesList();
}

document.addEventListener("DOMContentLoaded", function() {

    validateSession();
    addLogoutButton();

    const currentProjectId = localStorage.getItem('currentProjectId')

    async function fillEmployeeSelect() {
        const employees = await fetchData('https://ignite-be.onrender.com/employees')
        console.log(employees);
        const select = document.getElementById("employeeDropdown");
        employees.forEach(employee => {
            if (employee.role !== "EMP") {
                return;
            }
            const option = document.createElement("option");
            option.value = employee.id;
            option.textContent = employee.name;
            select.appendChild(option);
        });
    }

    fillEmployeeSelect();

    async function fillProjectsSelect() {
        const projects = await fetchData('https://ignite-be.onrender.com/projects')
        console.log(projects);
        const select = document.getElementById("projectDropdown");
        projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });

        
        console.log("project id : ", currentProjectId)
        if(currentProjectId) {
            select.value = currentProjectId
            select.disabled = true
        }
    }

    fillProjectsSelect();

    const taskPriceInput = document.getElementById("taskPriceInput");

    taskPriceInput.addEventListener("input", function() {
        if (taskPriceInput.value < 0) {
            taskPriceInput.value = 0;
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

    function sendImages(projectId) {
        if (files.length === 0) {
            alert("No se han seleccionado archivos para procesar.");
            return;
        }
    
        const formData = new FormData();
    
        files.forEach((file, index) => {
            formData.append(`files`, file); // Asignar un nombre único a cada archivo
        });
        
    
        // Realizar la solicitud
        fetch(`https://ignite-be.onrender.com/resources/projects/${projectId}/insert`, {
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

            if(files) {
                sendImages(projectId)
            }

            alert("Tarea asignada con éxito.");
            localStorage.removeItem('currentProjectId')
            localStorage.removeItem('currentProjectName')
            document.getElementById("taskForm").reset();
            window.location.href = "../elementsList.html";
        } else {
            alert("Por favor completa todos los campos.");
        }
    }

    window.toggleNewClientSection = toggleNewClientSection;
    window.submitTask = submitTask;
});
