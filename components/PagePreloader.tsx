"use client";

import { useEffect, useState } from "react";
import Preloader from "@/components/Preloader";

const PagePreloader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoad = () => {
            setLoading(false);
        };

        // If the page is already completely loaded
        if (document.readyState === "complete") {
            setLoading(false);
        } else {
            window.addEventListener("load", handleLoad);
        }

        return () => {
            window.removeEventListener("load", handleLoad);
        };
    }, []);

    if (!loading) return null;

    return <Preloader />;
};

export default PagePreloader;