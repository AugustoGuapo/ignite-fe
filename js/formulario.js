import { fetchData } from "./restclient.js";
import { validateSession, addLogoutButton } from "./utils.js";

document.addEventListener("DOMContentLoaded", function() {

    validateSession();
    addLogoutButton();

    async function fillClientSelect() {
        const clients = await fetchData('https://ignite-be.onrender.com/clients')
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
    window.submitProject = submitProject;
    window.finalizeClientRegistration = finalizeClientRegistration;
});
