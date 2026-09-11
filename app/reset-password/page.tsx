"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";

interface Errors {
    password?: string[];
    password_confirmation?: string[];
    [key: string]: string[] | undefined;
}

const ResetPassword = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        const emailParam = searchParams.get("email");
        const tokenParam = searchParams.get("token");

        if (emailParam && tokenParam) {
            setEmail(emailParam);
            setToken(tokenParam);
        } else {
            toast.error("Invalid reset link");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post(
                `${BASE_API_URL}reset-password`,
                {
                    email,
                    token,
                    password,
                    password_confirmation: passwordConfirmation,
                }
            );

            if (response.data.status) {
                toast.success(
                    response.data.message ||
                    "Password reset successful! Redirecting to login..."
                );

                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                toast.error(response.data.message || "Reset failed");
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});

                toast.error(
                    error.response.data.message || "Validation failed"
                );
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Something went wrong. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <div className="reset-password-card">
                <div className="reset-header">
                    <i className="bi bi-key-fill"></i>

                    <h2>New Password</h2>

                    <p>
                        Enter your new password to secure your account
                    </p>
                </div>

                <div className="reset-body">
                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="reset-form-group">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                className="reset-input"
                                value={email}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* New Password */}
                        <div className="reset-form-group">
                            <label htmlFor="password">
                                New Password
                            </label>

                            <div className="position-relative">
                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="reset-input w-100"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <span
                                    className="position-absolute end-0 top-50 translate-middle-y pe-3 pointer"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    role="button"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <i
                                        className={`bi ${showPassword
                                                ? "bi-eye-slash-fill"
                                                : "bi-eye-fill"
                                            }`}
                                    ></i>
                                </span>
                            </div>

                            {errors.password && (
                                <div className="text-danger small mt-1">
                                    {errors.password[0]}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="reset-form-group">
                            <label htmlFor="password_confirmation">
                                Confirm New Password
                            </label>

                            <input
                                id="password_confirmation"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                className="reset-input"
                                placeholder="Confirm new password"
                                value={passwordConfirmation}
                                onChange={(e) =>
                                    setPasswordConfirmation(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            {errors.password_confirmation && (
                                <div className="text-danger small mt-1">
                                    {
                                        errors.password_confirmation[0]
                                    }
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="reset-submit-btn"
                            disabled={loading || !token}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Updating Password...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center mt-4">
                            <Link
                                href="/login"
                                className="text-muted text-decoration-none"
                            >
                                <i className="bi bi-arrow-left"></i>{" "}
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;