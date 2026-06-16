"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const BASE_API_URL = "https://velearn.in/velearn-crm/api/";

export default function SignUpPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phonenumber, setPhonenumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (
            !name ||
            !email ||
            !phonenumber ||
            !password ||
            !confirmPassword
        ) {
            toast.error("All fields are required");
            setMessage("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            setMessage("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const res = await axios.post(
                `${BASE_API_URL}register`,
                {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phonenumber: phonenumber.trim(),
                    password,
                    confirmPassword,
                    lead_source: "Website",
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

            toast.success("Signup successful");

            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (err: any) {
            let errorMessage =
                err.response?.data?.message ||
                "Signup failed";

            if (err.response?.data?.errors) {
                const errors =
                    err.response.data.errors;
                const firstErrorKey =
                    Object.keys(errors)[0];

                errorMessage =
                    errors[firstErrorKey][0];
            }

            setLoading(false);
            setMessage(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="login-container py-3 px-lg-0 px-3">
            <div className="container p-lg-0">
                <div className="row flex-lg-row flex-column-reverse">
                    {/* LEFT SIDE */}
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
                                            alt="Learn at Your Pace"
                                            className="img-fluid"
                                        />
                                    </div>

                                    <div className="slide-content my-4">
                                        <h2>
                                            Learn at Your Own
                                            Pace
                                        </h2>

                                        <p>
                                            Join interactive
                                            courses and master
                                            skills anytime,
                                            anywhere.
                                        </p>
                                    </div>
                                </SwiperSlide>

                                <SwiperSlide>
                                    <div className="slide-image">
                                        <img
                                            src="https://ismailvtl-images-project.vercel.app/cloud-storage.png"
                                            alt="Personalized Learning"
                                            className="img-fluid"
                                        />
                                    </div>

                                    <div className="slide-content my-4">
                                        <h2>
                                            Personalized
                                            Learning
                                        </h2>

                                        <p>
                                            Get custom
                                            recommendations and
                                            track your
                                            improvement easily.
                                        </p>
                                    </div>
                                </SwiperSlide>

                                <SwiperSlide>
                                    <div className="slide-image">
                                        <img
                                            src="https://ismailvtl-images-project.vercel.app/cloud-storage.png"
                                            alt="Connect with Mentors"
                                            className="img-fluid"
                                        />
                                    </div>

                                    <div className="slide-content my-4">
                                        <h2>
                                            Connect with
                                            Mentors
                                        </h2>

                                        <p>
                                            Get guidance from
                                            experts and grow
                                            your career with
                                            Velearn.
                                        </p>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="col-lg-6">
                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="login-form-inner">
                                <h1 className="text-center mb-2">
                                    Sign Up
                                </h1>

                                <p className="text-center">
                                    Create your account
                                </p>

                                {message && (
                                    <p
                                        className="text-center"
                                        style={{
                                            color: "red",
                                        }}
                                    >
                                        {message}
                                    </p>
                                )}

                                <div className="login-form-group">
                                    <label>
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Your full name"
                                    />
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

                                <div className="login-form-group">
                                    <label>
                                        Phone Number *
                                    </label>

                                    <input
                                        type="tel"
                                        value={
                                            phonenumber
                                        }
                                        onChange={(e) =>
                                            setPhonenumber(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Your phone number"
                                    />
                                </div>

                                <div className="login-form-group password-group">
                                    <label>
                                        Password *
                                    </label>

                                    <div className="password-input-wrapper position-relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                password
                                            }
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Minimum 8 characters"
                                            className="w-100 pe-5"
                                        />

                                        <span
                                            className="password-toggle position-absolute top-0 bottom-0 end-0 m-auto d-flex justify-content-center align-items-center pe-3"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            style={{
                                                cursor:
                                                    "pointer",
                                            }}
                                        >
                                            <i
                                                className={`bi ${showPassword
                                                    ? "bi-eye-slash"
                                                    : "bi-eye"
                                                    }`}
                                            ></i>
                                        </span>
                                    </div>
                                </div>

                                <div className="login-form-group password-group">
                                    <label>
                                        Confirm Password *
                                    </label>

                                    <div className="password-input-wrapper position-relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                confirmPassword
                                            }
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Re-enter password"
                                            className="w-100 pe-5"
                                        />

                                        <span
                                            className="password-toggle position-absolute top-0 bottom-0 end-0 m-auto d-flex justify-content-center align-items-center pe-3"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            style={{
                                                cursor:
                                                    "pointer",
                                            }}
                                        >
                                            <i
                                                className={`bi ${showConfirmPassword
                                                    ? "bi-eye-slash"
                                                    : "bi-eye"
                                                    }`}
                                            ></i>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-button login-cta"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating..."
                                        : "Create Account"}
                                </button>

                                <div className="register-div text-center mt-3">
                                    Already have an account?{" "}
                                    <Link href="/login">
                                        Login here
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}