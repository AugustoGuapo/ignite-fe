import { fetchData } from "./restclient.js";
import { validateSession, addLogoutButton } from "./utils.js";

document.addEventListener("DOMContentLoaded", function() {

    validateSession();
    addLogoutButton();

    const currentProjectId = localStorage.getItem('currentProjectId')

    async function fillEmployeeSelect() {
        const employees = await fetchData('https://ignite-be.onrender.com/employees')
        console.log(employees);
        const select = document.getElementById("employeeDropdown");
        employees.forEach(employee => {
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
            window.location.href = "../elementsList.html";
        } else {
            alert("Por favor completa todos los campos.");
        }
    }

    window.toggleNewClientSection = toggleNewClientSection;
    window.submitTask = submitTask;
});
