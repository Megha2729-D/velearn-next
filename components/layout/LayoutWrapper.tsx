"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const dashboardRoutes = [
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

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const hideHeaderFooter =
        pathname.startsWith("/live-assessment") ||
        dashboardRoutes.includes(pathname);

    return (
        <>
            {!hideHeaderFooter && <Navbar />}

            <main>{children}</main>

            {!hideHeaderFooter && <Footer />}
        </>
    );
}