"use client";

export default function SessionGuard() {
    /*
     * SessionGuard intentionally does nothing for now.
     *
     * Login/signup sessions are controlled by:
     *
     * localStorage.user
     * localStorage.token
     *
     * The previous implementation was calling:
     *
     * /api/user/{id}
     *
     * but that Laravel route does not exist and returns 404.
     *
     * Therefore it was incorrectly treating a missing
     * verification route as an expired user session.
     */

    return null;
}
