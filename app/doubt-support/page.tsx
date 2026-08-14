"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";

interface TechData {
    title: string;
    description: string;
    date: string;
    slot: string;
}

interface NonTechData {
    category: string;
    subject: string;
    description: string;
    attachment: File | null;
}

interface RecentRequest {
    id: number | string;
    title?: string;
    subject?: string;
    created_at: string;
    preferred_slot?: string;
    reference_id?: string | number;
    status: string;
}

const HelpCenter = () => {
    const [activeTab, setActiveTab] = useState<"technical" | "non-technical">(
        "technical"
    );

    const [loading, setLoading] = useState(false);
    const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Technical Support
    const [techData, setTechData] = useState<TechData>({
        title: "",
        description: "",
        date: "",
        slot: "Morning Slot",
    });

    // Non-Technical Support
    const [nonTechData, setNonTechData] = useState<NonTechData>({
        category: "",
        subject: "",
        description: "",
        attachment: null,
    });

    useEffect(() => {
        fetchRecentRequests();
    }, []);

    useEffect(() => {
        if (techData.date) {
            fetchBookedSlots(techData.date);
        } else {
            setBookedSlots([]);
        }
    }, [techData.date]);

    const fetchBookedSlots = async (selectedDate: string) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) return;

            const response = await axios.get(
                `${BASE_API_URL}support/booked-slots?date=${selectedDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status) {
                setBookedSlots(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching booked slots:", error);
        }
    };

    const fetchRecentRequests = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) return;

            const response = await axios.get(
                `${BASE_API_URL}support/recent`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status) {
                setRecentRequests(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching recent requests:", error);
        }
    };

    const handleTechChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setTechData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleNonTechChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        if (name === "attachment" && e.target instanceof HTMLInputElement) {
            const file = e.target.files?.[0] ?? null;

            setNonTechData((prev) => ({
                ...prev,
                attachment: file,
            }));

            return;
        }

        setNonTechData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTechSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Please login again.");
                return;
            }

            const response = await axios.post(
                `${BASE_API_URL}support/technical`,
                techData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status) {
                toast.success("Support session booked successfully!");

                const selectedDate = techData.date;

                setTechData({
                    title: "",
                    description: "",
                    date: "",
                    slot: "Morning Slot",
                });

                await fetchRecentRequests();

                if (selectedDate) {
                    await fetchBookedSlots(selectedDate);
                }
            } else {
                toast.error(
                    response.data.message || "Failed to book session"
                );
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message ||
                "Failed to book session";

            toast.error(errorMsg);

            console.error(
                "Booking error:",
                error.response?.data
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNonTechSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Please login again.");
                return;
            }

            const formData = new FormData();

            formData.append("category", nonTechData.category);
            formData.append("subject", nonTechData.subject);
            formData.append(
                "description",
                nonTechData.description
            );

            if (nonTechData.attachment) {
                formData.append(
                    "attachment",
                    nonTechData.attachment
                );
            }

            const response = await axios.post(
                `${BASE_API_URL}support/non-technical`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.status) {
                toast.success("Request submitted successfully!");

                setNonTechData({
                    category: "",
                    subject: "",
                    description: "",
                    attachment: null,
                });

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                await fetchRecentRequests();
            } else {
                toast.error(
                    response.data.message ||
                    "Failed to submit request"
                );
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message ||
                "Failed to submit request";

            toast.error(errorMsg);

            console.error(
                "Submission error:",
                error.response?.data
            );
        } finally {
            setLoading(false);
        }
    };

    const clearTechForm = () => {
        setTechData({
            title: "",
            description: "",
            date: "",
            slot: "Morning Slot",
        });
    };

    const clearNonTechForm = () => {
        setNonTechData({
            category: "",
            subject: "",
            description: "",
            attachment: null,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatRequestDate = (date: string) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const formatSlot = (slot?: string) => {
        if (!slot) return "";

        if (
            slot !== "Morning Slot" &&
            slot !== "Evening Slot"
        ) {
            return ` · ${slot.includes("AM") ? "Morning" : "Evening"
                } · ${slot}`;
        }

        return ` · ${slot}`;
    };

    const getStatusClass = (status: string) => {
        return status
            .toLowerCase()
            .replace(/\s+/g, "_");
    };

    return (
        <div className="dashboard_layout">
            <Sidebar
                activePage="support"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div className="dashboard_main_content">
                {/* Top Header */}
                <div className="dashboard_top_header">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                            type="button"
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="profile_breadcrumb mb-0">
                            <h2>
                                Live Courses{" "}
                                <span
                                    className="text-muted"
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: 400,
                                    }}
                                >
                                    / Doubt Support
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="notification_bell_top">
                        <i className="bi bi-bell"></i>
                    </div>
                </div>

                {/* Body */}
                <div className="dashboard_body_padding">
                    {/* Tabs */}
                    <div className="support_tabs_container mb-4">
                        <div className="support_tabs">
                            <button
                                type="button"
                                className={`support_tab ${activeTab === "technical"
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setActiveTab("technical")
                                }
                            >
                                Technical Support
                            </button>

                            <button
                                type="button"
                                className={`support_tab ${activeTab === "non-technical"
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setActiveTab("non-technical")
                                }
                            >
                                Non-Technical Support
                            </button>
                        </div>
                    </div>

                    <div className="support_content_card">
                        {/* =====================================================
                            TECHNICAL SUPPORT
                        ====================================================== */}
                        {activeTab === "technical" ? (
                            <div className="support_form_section">
                                <div className="support_banner tech_banner mb-4">
                                    <h3>
                                        Book a Technical Support Session
                                    </h3>

                                    <p>
                                        Get one-on-one help from a mentor.
                                        Max 3 sessions per week.
                                    </p>
                                </div>

                                <form onSubmit={handleTechSubmit}>
                                    <div className="form_section_title">
                                        Session Details
                                    </div>

                                    {/* Doubt Title */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            DOUBT TITLE{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control support_input"
                                            name="title"
                                            value={techData.title}
                                            onChange={handleTechChange}
                                            placeholder="e.g. React useEffect not triggering on state change"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            DOUBT DESCRIPTION{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <textarea
                                            className="form-control support_input"
                                            name="description"
                                            value={
                                                techData.description
                                            }
                                            onChange={
                                                handleTechChange
                                            }
                                            rows={4}
                                            placeholder="Describe what you're stuck on, what you've already tried, and what error or behaviour you're seeing..."
                                            required
                                        />
                                    </div>

                                    <div className="row">
                                        {/* Date */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                PREFERRED DATE{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="date"
                                                className="form-control support_input"
                                                name="date"
                                                value={techData.date}
                                                onChange={
                                                    handleTechChange
                                                }
                                                required
                                            />
                                        </div>

                                        {/* Slot */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                TIME SLOT{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>

                                            <div className="position-relative">
                                                <div
                                                    className="position-absolute"
                                                    style={{
                                                        left: "10px",
                                                        top: "10px",
                                                        zIndex: 1,
                                                    }}
                                                >
                                                    ⏰
                                                </div>

                                                <select
                                                    className="form-select support_input w-100"
                                                    style={{
                                                        paddingLeft:
                                                            "35px",
                                                    }}
                                                    name="slot"
                                                    value={
                                                        techData.slot
                                                    }
                                                    onChange={
                                                        handleTechChange
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select Slot
                                                    </option>

                                                    <option value="Morning Slot">
                                                        🌅 Morning Slot
                                                    </option>

                                                    <option value="Evening Slot">
                                                        🌆 Evening Slot
                                                    </option>
                                                </select>
                                            </div>

                                            <small className="text-muted mt-2 d-block">
                                                ⏱ Session duration:{" "}
                                                <b>30 mins</b>
                                            </small>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="form_actions mt-4">
                                        <button
                                            type="button"
                                            className="btn btn_clear"
                                            onClick={
                                                clearTechForm
                                            }
                                        >
                                            Clear
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn_submit"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Booking..."
                                                : "Book Session →"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            /* =====================================================
                               NON-TECHNICAL SUPPORT
                            ====================================================== */
                            <div className="support_form_section">
                                <div className="support_banner non_tech_banner mb-4">
                                    <h3>
                                        Non-Technical Support Request
                                    </h3>

                                    <p>
                                        For billing, certificates,
                                        schedule changes, and
                                        administrative queries.
                                    </p>
                                </div>

                                <form onSubmit={handleNonTechSubmit}>
                                    <div className="form_section_title">
                                        Request Details
                                    </div>

                                    <div className="row">
                                        {/* Category */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                REQUEST CATEGORY{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                className="form-select support_input"
                                                name="category"
                                                value={
                                                    nonTechData.category
                                                }
                                                onChange={
                                                    handleNonTechChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select category
                                                </option>

                                                <option value="Billing">
                                                    Billing & Payments
                                                </option>

                                                <option value="Certificate">
                                                    Course Certificates
                                                </option>

                                                <option value="Schedule">
                                                    Schedule Changes
                                                </option>

                                                <option value="Access">
                                                    Course Access Issues
                                                </option>

                                                <option value="Other">
                                                    Other Administrative
                                                    Query
                                                </option>
                                            </select>
                                        </div>

                                        {/* Subject */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                SUBJECT{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control support_input"
                                                name="subject"
                                                value={
                                                    nonTechData.subject
                                                }
                                                onChange={
                                                    handleNonTechChange
                                                }
                                                placeholder="e.g. Certificate for Node.js course"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            DESCRIPTION{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <textarea
                                            className="form-control support_input"
                                            name="description"
                                            value={
                                                nonTechData.description
                                            }
                                            onChange={
                                                handleNonTechChange
                                            }
                                            rows={4}
                                            placeholder="Provide details about your request..."
                                            required
                                        />
                                    </div>

                                    {/* Attachment */}
                                    <div className="mb-4">
                                        <label className="form-label">
                                            ATTACH SUPPORTING DOCUMENT
                                            (OPTIONAL)
                                        </label>

                                        <div className="file_upload_wrapper">
                                            <input
                                                type="file"
                                                className="file_input"
                                                name="attachment"
                                                onChange={
                                                    handleNonTechChange
                                                }
                                                id="attachment"
                                                ref={fileInputRef}
                                                accept="image/*,.pdf"
                                            />

                                            <label
                                                htmlFor="attachment"
                                                className="file_upload_label"
                                            >
                                                <i className="bi bi-cloud-upload"></i>

                                                <span>
                                                    {nonTechData.attachment
                                                        ? nonTechData
                                                            .attachment
                                                            .name
                                                        : "Click to attach a file (PDF, image, screenshot)"}
                                                </span>

                                                <small>
                                                    {nonTechData.attachment
                                                        ? `${(
                                                            nonTechData
                                                                .attachment
                                                                .size /
                                                            1024
                                                        ).toFixed(
                                                            1
                                                        )} KB`
                                                        : "Max 5MB"}
                                                </small>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="form_actions">
                                        <button
                                            type="button"
                                            className="btn btn_clear"
                                            onClick={
                                                clearNonTechForm
                                            }
                                        >
                                            Clear
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn_submit"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Submitting..."
                                                : "Submit Request →"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* =====================================================
                            RECENT REQUESTS
                        ====================================================== */}
                        <div className="recent_requests_card mt-4">
                            <div className="section_header">
                                <span className="me-2">
                                    📋
                                </span>
                                Recent Requests
                            </div>

                            <div className="requests_list">
                                {recentRequests.length > 0 ? (
                                    recentRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="request_item"
                                        >
                                            <div className="request_info">
                                                <div className="request_title">
                                                    {req.title ||
                                                        req.subject}
                                                </div>

                                                <div className="request_meta">
                                                    {formatRequestDate(
                                                        req.created_at
                                                    )}

                                                    {req.preferred_slot
                                                        ? formatSlot(
                                                            req.preferred_slot
                                                        )
                                                        : ` · Ref #${req.reference_id}`}
                                                </div>
                                            </div>

                                            <div className="request_status_actions">
                                                <span
                                                    className={`status_badge ${getStatusClass(
                                                        req.status
                                                    )}`}
                                                >
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="request_item">
                                            <div className="request_info">
                                                <div className="request_title">
                                                    React useEffect
                                                    infinite loop issue
                                                </div>

                                                <div className="request_meta">
                                                    Apr 14 · Morning ·
                                                    9:00 AM
                                                </div>
                                            </div>

                                            <div className="request_status_actions">
                                                <span className="status_badge resolved">
                                                    Resolved
                                                </span>
                                            </div>
                                        </div>

                                        <div className="request_item">
                                            <div className="request_info">
                                                <div className="request_title">
                                                    JWT token expiry
                                                    handling in Express
                                                </div>

                                                <div className="request_meta">
                                                    Apr 10 · Evening ·
                                                    6:00 PM
                                                </div>
                                            </div>

                                            <div className="request_status_actions">
                                                <span className="status_badge in_review">
                                                    In Review
                                                </span>
                                            </div>
                                        </div>

                                        <div className="request_item">
                                            <div className="request_info">
                                                <div className="request_title">
                                                    MongoDB aggregation
                                                    pipeline confusion
                                                </div>

                                                <div className="request_meta">
                                                    Apr 7 · Morning ·
                                                    10:30 AM
                                                </div>
                                            </div>

                                            <div className="request_status_actions">
                                                <span className="status_badge pending">
                                                    Pending
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;