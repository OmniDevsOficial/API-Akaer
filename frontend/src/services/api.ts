import axios, { AxiosHeaders } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
        return config;
    }

    const authValue = `Bearer ${token}`;

    if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", authValue);
    } else {
        const headers = AxiosHeaders.from(config.headers);
        headers.set("Authorization", authValue);
        config.headers = headers;
    }

    return config;
});

export default api;