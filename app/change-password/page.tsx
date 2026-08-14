"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
// Import your CSS according to your Next.js setup.
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";

interface User {
    id: number | string;
    [key: string]: unknown;
}

interface Message {
    type: "" | "success" | "error";
    text: string;
}

interface Errors {
    [key: string]: string[] | undefined;
}

const ChangePassword = () => {
    const [user, setUser] = useState<User | null>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState<Message>({
        type: "",
        text: "",
    });

    const [errors, setErrors] = useState<Errors>({});

    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Invalid user data:", error);
                localStorage.removeItem("user");
                router.push("/login");
            }
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleChangePassword = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!user) {
            setMessage({
                type: "error",
                text: "User information not found. Please login again.",
            });
            return;
        }

        setLoading(true);
        setMessage({
            type: "",
            text: "",
        });
        setErrors({});

        // Client-side password confirmation check
        if (newPassword !== confirmPassword) {
            setErrors({
                confirm_password: ["Passwords do not match"],
            });

            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${BASE_API_URL}change-password`,
                {
                    user_id: user.id,
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                }
            );

            if (response.data.status) {
                setMessage({
                    type: "success",
                    text:
                        response.data.message ||
                        "Password changed successfully!",
                });

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({
                    type: "error",
                    text:
                        response.data.message ||
                        "Something went wrong",
                });
            }
        } catch (error: any) {
            if (error.response?.data) {
                if (error.response.status === 422) {
                    setErrors(
                        error.response.data.errors || {}
                    );

                    setMessage({
                        type: "error",
                        text:
                            error.response.data.message ||
                            "Validation failed",
                    });
                } else {
                    setMessage({
                        type: "error",
                        text:
                            error.response.data.message ||
                            "An error occurred",
                    });
                }
            } else {
                setMessage({
                    type: "error",
                    text:
                        "Connection error. Please try again.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change_password_page">
            <div className="section_container py-5">
                <div className="row justify-content-center w-100 m-0">
                    <div className="col-lg-6 col-md-10">
                        <div className="password_card">
                            {/* Header */}
                            <div className="password_card_header">
                                <div className="header_icon_circle">
                                    <i className="bi bi-shield-lock-fill"></i>
                                </div>

                                <h3>Security Settings</h3>

                                <p>
                                    Update your password to keep your
                                    account secure
                                </p>
                            </div>

                            <form
                                onSubmit={handleChangePassword}
                                className="password_form"
                            >
                                {/* Message */}
                                {message.text && (
                                    <div
                                        className={`alert_box ${message.type}`}
                                    >
                                        <i
                                            className={`bi ${message.type ===
                                                    "success"
                                                    ? "bi-check-circle-fill"
                                                    : "bi-exclamation-triangle-fill"
                                                }`}
                                        ></i>

                                        {message.text}
                                    </div>
                                )}

                                {/* Current Password */}
                                <div className="form_group">
                                    <label>
                                        Current Password
                                    </label>

                                    <div className="input_wrapper">
                                        <i className="bi bi-lock input_icon"></i>

                                        <input
                                            type={
                                                showCurrent
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter current password"
                                            value={
                                                currentPassword
                                            }
                                            onChange={(e) =>
                                                setCurrentPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />

                                        <i
                                            className={`bi ${showCurrent
                                                    ? "bi-eye-slash"
                                                    : "bi-eye"
                                                } toggle_eye`}
                                            onClick={() =>
                                                setShowCurrent(
                                                    !showCurrent
                                                )
                                            }
                                        ></i>
                                    </div>

                                    {errors.current_password && (
                                        <span className="error_text">
                                            {
                                                errors
                                                    .current_password[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="form_group">
                                    <label>
                                        New Password
                                    </label>

                                    <div className="input_wrapper">
                                        <i className="bi bi-key input_icon"></i>

                                        <input
                                            type={
                                                showNew
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="At least 8 characters"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />

                                        <i
                                            className={`bi ${showNew
                                                    ? "bi-eye-slash"
                                                    : "bi-eye"
                                                } toggle_eye`}
                                            onClick={() =>
                                                setShowNew(
                                                    !showNew
                                                )
                                            }
                                        ></i>
                                    </div>

                                    {errors.new_password && (
                                        <span className="error_text">
                                            {
                                                errors
                                                    .new_password[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="form_group">
                                    <label>
                                        Confirm New Password
                                    </label>

                                    <div className="input_wrapper">
                                        <i className="bi bi-check2-circle input_icon"></i>

                                        <input
                                            type={
                                                showConfirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Repeat your new password"
                                            value={
                                                confirmPassword
                                            }
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />

                                        <i
                                            className={`bi ${showConfirm
                                                    ? "bi-eye-slash"
                                                    : "bi-eye"
                                                } toggle_eye`}
                                            onClick={() =>
                                                setShowConfirm(
                                                    !showConfirm
                                                )
                                            }
                                        ></i>
                                    </div>

                                    {errors.confirm_password && (
                                        <span className="error_text">
                                            {
                                                errors
                                                    .confirm_password[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="btn_change_password"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>Update Password</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;