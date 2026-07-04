"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const BASE_IMAGE_URL = "https://velearn.in/assets/images/";

const Preloader = () => {
    return (
        <motion.div
            className="preloader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="loader">
                {/* Spinner */}
                <div className="spinner"></div>

                {/* Logo */}
                <div className="logo-bg">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1, 0.8] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Image
                            src={`${BASE_IMAGE_URL}logo-icon.png`}
                            alt="Logo"
                            width={60}
                            height={60}
                            priority
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Preloader;