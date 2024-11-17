// JSON con usuarios de ejemplo
const usuarios = [
    { "id":"1", "usuario": "oscar123", "pass": "12345", "type": "adm" },
    { "id":"2", "usuario": "guillermo123", "pass": "67890", "type": "emp" }
];

// Validación de login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');

    // Buscar el usuario en el JSON
    const user = usuarios.find(user => user.usuario === username && user.pass === password);

    if (user) {
        // Guardar el tipo de usuario en localStorage y redirigir a main.html
        localStorage.setItem('userType', user.type);
        localStorage.setItem('idUser', user.id);
        window.location.href = 'main.html';
    } else {
        // Muestra un mensaje de error si los datos no coinciden
        errorDiv.textContent = 'Usuario o contraseña incorrectos.';
    }
});