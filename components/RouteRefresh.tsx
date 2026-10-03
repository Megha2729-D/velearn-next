"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteRefresh() {
    const pathname = usePathname();

    useEffect(() => {
        // Current page is ready
        sessionStorage.removeItem("route-changing");
    }, [pathname]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target = event.target as HTMLElement;
            const link = target.closest("a");

            if (!link) return;

            const href = link.getAttribute("href");

            if (!href) return;

            // Ignore external links
            if (
                href.startsWith("http://") ||
                href.startsWith("https://") ||
                href.startsWith("//")
            ) {
                return;
            }

            // Ignore special links
            if (
                href.startsWith("#") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:")
            ) {
                return;
            }

            if (link.hasAttribute("download")) {
                return;
            }

            if (link.target === "_blank") {
                return;
            }

            if (href === pathname) {
                return;
            }

            // Tell the next page to show the preloader
            sessionStorage.setItem("route-changing", "true");

            // Full browser redirect / page reload
            window.location.href = href;
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [pathname]);

    return null;
}