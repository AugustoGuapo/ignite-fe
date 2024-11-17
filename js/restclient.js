export async function fetchData(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('${response.status} ${response.statusText}');
        }
        console.log('Solicitud exitosa:', response);
        return await response.json();
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error;
    }
};

export default fetchData

