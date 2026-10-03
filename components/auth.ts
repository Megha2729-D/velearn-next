import axios from "axios";

const BASE_API_URL = "https://crm.velearn.in/api/";

/*
 * This function should only be used when you have
 * a valid backend authentication endpoint.
 *
 * IMPORTANT:
 * Your current /api/user/{id} endpoint does NOT exist,
 * so we are not calling it here.
 */
export const verifyLoggedInUser = async () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    /*
     * No login session.
     *
     * This is normal.
     */
    if (!storedUser || !token) {
        return {
            authenticated: false,
            user: null,
            reason: "NO_SESSION",
        };
    }

    let user;

    try {
        user = JSON.parse(storedUser);
    } catch {
        return {
            authenticated: false,
            user: null,
            reason: "INVALID_LOCAL_USER",
        };
    }

    if (!user?.id) {
        return {
            authenticated: false,
            user: null,
            reason: "INVALID_LOCAL_USER",
        };
    }

    /*
     * At the moment we don't have a working backend
     * verification endpoint.
     *
     * Therefore DO NOT make this request:
     *
     * GET /api/user/{id}
     *
     * because it currently returns 404.
     *
     * Keep the existing login session.
     */
    return {
        authenticated: true,
        user,
        reason: "LOCAL_SESSION",
    };
};

export const clearUserSession = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    Object.keys(localStorage).forEach((key) => {
        if (
            key.startsWith("my-courses-") ||
            key.startsWith("user-")
        ) {
            localStorage.removeItem(key);
        }
    });
};