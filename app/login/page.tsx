"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const BASE_API_URL = "https://crm.velearn.in/api/";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("All fields are required");
            setMessage("All fields are required");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const res = await axios.post(
                `${BASE_API_URL}login`,
                {
                    email,
                    password,
                }
            );

            localStorage.setItem(
                "user",
                JSON.stringify(res.data.user)
            );

            if (res.data.token) {
                localStorage.setItem(
                    "token",
                    res.data.token
                );
            }

            window.dispatchEvent(
                new Event("storage-update")
            );

            setLoading(false);
            setMessage("Login successful");

            toast.success("Login successful");

            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                "Login failed";

            setLoading(false);
            setMessage(errorMessage);

            toast.error(errorMessage);
        }
    };

    return (
        <div className="login-container py-3 px-lg-0 px-3">
            <div className="container p-lg-0">
                <div className="row">
                    {/* Left */}
                    <div className="col-lg-6">
                        <form
                            onSubmit={handleSubmit}
                            className="login-form"
                        >
                            <div className="login-form-inner">
                                <div className="text-center mb-4 pb-2">
                                    <h1>Login</h1>
                                    <p>
                                        See your growth and get
                                        consulting support!
                                    </p>
                                </div>

                                <div className="login-form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="email@website.com"
                                    />
                                </div>

                                <div className="login-form-group password-group">
                                    <label>Password *</label>

                                    <div className="password-input-wrapper position-relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Minimum 8 characters"
                                            className="w-100 pe-5"
                                        />

                                        <span
                                            className="pe-3 password-toggle position-absolute top-0 bottom-0 end-0 m-auto d-flex justify-content-center align-items-center"
                                            onClick={
                                                togglePassword
                                            }
                                        >
                                            <i
                                                className={`bi ${showPassword
                                                        ? "bi-eye-slash"
                                                        : "bi-eye"
                                                    }`}
                                            />
                                        </span>
                                    </div>
                                </div>

                                <div className="forgot-pwd-wrapper text-end">
                                    <Link
                                        href="/forgot-password"
                                        style={{
                                            color:
                                                "var(--c2)",
                                            fontSize:
                                                "14px",
                                            fontWeight:
                                                "500",
                                        }}
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-button login-cta mb-4"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </button>

                                <div className="register-div text-center pt-2">
                                    Not registered yet?{" "}
                                    <Link href="/signup">
                                        Create an account
                                    </Link>
                                </div>

                                {message && (
                                    <p className="mt-3 text-center">
                                        {message}
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right */}
                    <div className="col-lg-6">
                        <div className="onboarding h-100 d-flex align-items-center">
                            <Swiper
                                modules={[
                                    Autoplay,
                                    Pagination,
                                ]}
                                pagination={{
                                    clickable: true,
                                }}
                                autoplay={{
                                    delay: 3500,
                                }}
                                loop
                                speed={600}
                                grabCursor
                            >
                                <SwiperSlide>
                                    <div className="slide-image">
                                        <img
                                            src="https://ismailvtl-images-project.vercel.app/startup-launch.png"
                                            loading="lazy"
                                            alt="Interactive Courses"
                                        />
                                    </div>

                                    <div className="slide-content my-4">
                                        <h2>
                                            Interactive
                                            Courses
                                        </h2>
                                        <p>
                                            Learn from top
                                            instructors
                                            with hands-on
                                            lessons and
                                            exercises.
                                        </p>
                                    </div>
                                </SwiperSlide>

                                <SwiperSlide>
                                    <div className="slide-image">
                                        <img
                                            src="https://ismailvtl-images-project.vercel.app/cloud-storage.png"
                                            loading="lazy"
                                            alt="Track Progress"
                                        />
                                    </div>

                                    <div className="slide-content my-4">
                                        <h2>
                                            Track Your
                                            Progress
                                        </h2>
                                        <p>
                                            Monitor your
                                            learning
                                            journey and
                                            achieve your
                                            goals
                                            efficiently.
                                        </p>
                                    </div>
                                </SwiperSlide>

                                <SwiperSlide>
                                    <div className="slide-image">
                                        <img
                                            src="https://ismailvtl-images-project.vercel.app/cloud-storage.png"
                                            loading="lazy"
                                            alt="Collaborate"
                                        />
                                    </div>

                                    <div className="slide-content my-4">
                                        <h2>
                                            Collaborate &
                                            Discuss
                                        </h2>
                                        <p>
                                            Engage with
                                            peers and
                                            instructors to
                                            enhance your
                                            learning
                                            experience.
                                        </p>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}