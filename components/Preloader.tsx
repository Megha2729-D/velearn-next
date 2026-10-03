"use client";

import Image from "next/image";

const Preloader = () => {
    return (
        <div className="preloader">
            <div className="loader">
                <div className="spinner"></div>

                <div className="logo-bg">
                    <div className="logo-animation">
                        <Image
                            src="/images/logo-icon.png"
                            alt="VeLearn Logo"
                            width={60}
                            height={60}
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;