import { fetchData } from "./restclient.js";

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');

    // Ejemplo de cómo añadir el header desde aquí
    /*const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('userToken') // Suponiendo que el token esté en el localStorage
    };*/

    // Llamada a la función fetchData con los headers adicionales
    try {
        const result = await fetchData("https://ignite-be.onrender.com/login", "POST", {
            username: username,
            password: password
        }); // Aquí estamos pasando los headers adicionales

        if (result !== null) {
            console.log(result);
            // Guardar el token en el localStorage y redirigir a la página principal
            localStorage.setItem('user_token', result.token);
            localStorage.setItem('user_id', result.user_id);
            localStorage.setItem('user_role', result.role);
            window.location.href = 'main.html';
        }
    } catch (error) {
        errorDiv.textContent = 'Error de inicio de sesión. Intenta de nuevo.';
        console.error('Error en login:', error);
    }
});
