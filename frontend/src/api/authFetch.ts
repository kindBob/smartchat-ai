import { authClient } from "../auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function authFetch(endpoint: string, init: RequestInit = {}): Promise<Response> {
    const result = await authClient.getSession();

    const token = result.data?.session?.token;

    if (!token) {
        throw new Error("User is not authenticated");
    }

    const request = await fetch(`${API_URL}${endpoint}`, {
        ...init,
        headers: {
            ...init.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    return request;
}
