"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";

interface Errors {
    email?: string[];
}

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your registered email");
            return;
        }

        setLoading(true);
        setMessage("");
        setErrors({});

        try {
            const response = await axios.post(
                `${BASE_API_URL}forgot-password`,
                { email }
            );

            if (response.data.status) {
                toast.success(response.data.message);

                setMessage(
                    response.data.message ||
                    "Please check your email for the password reset instructions."
                );

                setEmail("");
            } else {
                toast.error(
                    response.data.message || "Failed to send reset link"
                );
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});

                toast.error(
                    error.response.data.message || "Validation failed"
                );
            } else {
                const errorMessage =
                    error.response?.data?.message ||
                    "Something went wrong. Please try again later.";

                toast.error(errorMessage);
            }

            console.error("Forgot password error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">
                <div className="forgot-header">
                    <i className="bi bi-shield-lock-fill"></i>

                    <h2>Forgot Password?</h2>

                    <p>
                        Enter your registered email to receive reset
                        instructions
                    </p>
                </div>

                <div className="forgot-body">
                    {message ? (
                        <div className="text-center py-4">
                            <i
                                className="bi bi-envelope-check-fill text-success"
                                style={{ fontSize: "3.5rem" }}
                            ></i>

                            <h4 className="mt-4 fw-bold">
                                Email Sent!
                            </h4>

                            <p className="text-muted mt-2">
                                {message}
                            </p>

                            <div className="back-to-login pt-4">
                                <Link
                                    href="/login"
                                    className="forgot-submit-btn d-inline-block w-auto px-5 text-white"
                                >
                                    <i className="bi bi-arrow-left"></i>{" "}
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="forgot-form-group">
                                <label htmlFor="email">
                                    Registered Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    className="forgot-input"
                                    placeholder="e.g. yourname@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                                {errors.email && (
                                    <div className="text-danger small mt-1">
                                        {errors.email[0]}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="forgot-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Sending Instructions...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>

                            <div className="back-to-login">
                                <Link href="/login">
                                    <i className="bi bi-arrow-left-circle-fill"></i>{" "}
                                    Back to Login Page
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
