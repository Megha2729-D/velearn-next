"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RouteRefresh() {
    const pathname = usePathname();
    const previousPathname = useRef(pathname);

    useEffect(() => {
        if (previousPathname.current !== pathname) {
            previousPathname.current = pathname;

            window.location.reload();
        }
    }, [pathname]);

    return null;
}