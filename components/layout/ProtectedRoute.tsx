"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const protectedRoutes = [
    "/profile",
    "/dashboard",
    "/my-courses",
    "/live-dashboard",
    "/live-course-history",
    "/meetings",
    "/assignments",
    "/placement",
    "/courses-certificates",
    "/explore-courses",
    "/webinars",
    "/doubt-support",
    "/projects",
];

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("user");

        const isProtectedRoute = protectedRoutes.includes(pathname);

        if (isProtectedRoute && !user) {
            router.replace("/login");
            return;
        }

        setChecking(false);
    }, [pathname, router]);

    if (checking) {
        return null;
    }

    return <>{children}</>;
}