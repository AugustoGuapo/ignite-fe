export async function fetchData(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    let token = localStorage.getItem('user_token');

    if(token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error;
    }
}
