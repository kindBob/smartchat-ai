import { authClient } from "../auth";

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const result = await authClient.getSession();

    const token = result.data?.session?.token;

    if (!token) {
        throw new Error("User is not authenticated");
    }

    return fetch(input, {
        ...init,
        headers: {
            ...init.headers,
            Authorization: `Bearer ${token}`,
        },
    });
}
