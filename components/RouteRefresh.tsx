"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteRefresh() {
    const pathname = usePathname();

    useEffect(() => {
        // Tell the preloader that the current route has loaded
        sessionStorage.removeItem("route-changing");
    }, [pathname]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const link = target.closest("a");

            if (!link) return;

            const href = link.getAttribute("href");

            // Ignore external links, anchors, downloads, etc.
            if (
                !href ||
                href.startsWith("http") ||
                href.startsWith("#") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                link.hasAttribute("download")
            ) {
                return;
            }

            // Same page
            if (href === pathname) return;

            // Tell preloader to show
            sessionStorage.setItem("route-changing", "true");

            // Wait briefly so preloader becomes visible
            setTimeout(() => {
                window.location.href = href;
            }, 100);
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [pathname]);

    return null;
}