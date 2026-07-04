"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyClass() {
    const pathname = usePathname();

    useEffect(() => {
        document.body.classList.remove("inner_page_ds");

        if (pathname === "/live-course/data-science") {
            document.body.classList.add("inner_page_ds");
        }

        return () => {
            document.body.classList.remove("inner_page_ds");
        };
    }, [pathname]);

    return null;
}