import { validateSession, addLogoutButton } from './utils.js';

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

