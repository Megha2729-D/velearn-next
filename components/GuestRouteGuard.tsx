
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function GuestRouteGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const isGuestPage =
        pathname === "/login" || pathname === "/signup";

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isGuestPage) {
            setIsChecking(false);
            return;
        }

        const token = localStorage.getItem("token");

        if (token) {
            router.replace("/");
            return;
        }

        setIsChecking(false);
    }, [pathname, isGuestPage, router]);

    if (isGuestPage && isChecking) {
        return null;
    }

    return <>{children}</>;
}
