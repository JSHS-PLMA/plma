import axios from 'axios';

function changeURL(url) {
    url = url.replace(/^\/api/, import.meta.env.VITE_API_BASE);

    return url;
}

async function getData(url, params = {}) {
    url = changeURL(url);

    const response = await axios.get(url, {
        params,
    });

    return response.data;
}

async function postData(url, body = {}) {
    url = changeURL(url);

    const response = await axios.post(url, body);
    return response.data;
}

async function deleteData(url, params = {}) {
    url = changeURL(url);

    const response = await axios.delete(url, {
        params,
    });

    return response.data;
}

async function putData(url, body = {}) {
    url = changeURL(url);

    const response = await axios.put(url, body);
    return response.data;
}

async function patchData(url, body = {}) {
    url = changeURL(url);

    const response = await axios.patch(url, body);
    return response.data;
}

export { getData, postData, deleteData, putData, patchData };
