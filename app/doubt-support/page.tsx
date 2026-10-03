"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import Sidebar from "@/components/layout/Sidebar";
import "./style.css";
// import NotificationsModal from "@/components/layout/NotificationsModal";

const BASE_API_URL = "https://crm.velearn.in/api/";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

type TechnicalData = {
    title: string;
    description: string;
    date: string;
    slot: string;
};

type NonTechnicalData = {
    category: string;
    subject: string;
    description: string;
    attachment: File | null;
};

type SupportRequest = {
    id: number | string;
    type: "technical" | "non-technical" | string;
    title?: string;
    subject?: string;
    category?: string;
    description?: string;
    preferred_date?: string;
    preferred_slot?: string;
    created_at?: string;
    status?: string;
    reference_id?: string;
    attachment_url?: string;
};

type AxiosErrorResponse = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

const statusClass = (status = ""): string =>
    status.toLowerCase().replace(/\s+/g, "_");

const formatDate = (dateStr?: string): string | null => {
    if (!dateStr) return null;

    const d = new Date(`${dateStr}T00:00:00`);

    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatCreated = (isoStr?: string): string => {
    if (!isoStr) return "";

    return new Date(isoStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

const CATEGORY_LABELS: Record<string, string> = {
    Billing: "Billing & Payments",
    Certificate: "Course Certificates",
    Schedule: "Schedule Changes",
    Access: "Course Access Issues",
    Other: "Other Query",
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */

const HelpCenterPage = () => {
    const [activeTab, setActiveTab] = useState<
        "technical" | "non-technical"
    >("technical");

    const [loading, setLoading] = useState(false);
    const [recentRequests, setRecentRequests] = useState<SupportRequest[]>([]);
    const [recentLoading, setRecentLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /* ─────────────────────────────────────────
       Technical Support State
    ───────────────────────────────────────── */

    const [techData, setTechData] = useState<TechnicalData>({
        title: "",
        description: "",
        date: "",
        slot: "Morning Slot",
    });

    const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    /* ─────────────────────────────────────────
       Non-Technical Support State
    ───────────────────────────────────────── */

    const [nonTechData, setNonTechData] = useState<NonTechnicalData>({
        category: "",
        subject: "",
        description: "",
        attachment: null,
    });

    /* ─────────────────────────────────────────
       Fetch Recent Requests
    ───────────────────────────────────────── */

    useEffect(() => {
        fetchRecentRequests();
    }, []);

    /* ─────────────────────────────────────────
       Fetch Booked Slots
    ───────────────────────────────────────── */

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
                `${BASE_API_URL}support/booked-slots?date=${encodeURIComponent(
                    selectedDate
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.status) {
                setBookedSlots(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching booked slots:", error);
        }
    };

    /* ─────────────────────────────────────────
       Fetch Recent Requests
    ───────────────────────────────────────── */

    const fetchRecentRequests = async () => {
        setRecentLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setRecentRequests([]);
                return;
            }

            const response = await axios.get(
                `${BASE_API_URL}support/recent`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.status) {
                setRecentRequests(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching recent requests:", error);
        } finally {
            setRecentLoading(false);
        }
    };

    /* ─────────────────────────────────────────
       Form Changes
    ───────────────────────────────────────── */

    const handleTechChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
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

        if (name === "attachment") {
            const input = e.target as HTMLInputElement;

            setNonTechData((prev) => ({
                ...prev,
                attachment: input.files?.[0] || null,
            }));

            return;
        }

        setNonTechData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ─────────────────────────────────────────
       Technical Submit
    ───────────────────────────────────────── */

    const handleTechSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Please login to continue.");
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

            if (response.data?.status) {
                toast.success(
                    "Support session booked successfully!"
                );

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
                    response.data?.message ||
                    "Failed to book session"
                );
            }
        } catch (error) {
            const err = error as AxiosErrorResponse;

            toast.error(
                err.response?.data?.message ||
                "Failed to book session"
            );

            console.error(
                "Booking error:",
                err.response?.data
            );
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────────────────────────────────
       Non-Technical Submit
    ───────────────────────────────────────── */

    const handleNonTechSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Please login to continue.");
                return;
            }

            const formData = new FormData();

            formData.append(
                "category",
                nonTechData.category
            );

            formData.append(
                "subject",
                nonTechData.subject
            );

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

            if (response.data?.status) {
                toast.success(
                    "Request submitted successfully!"
                );

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
                    response.data?.message ||
                    "Failed to submit request"
                );
            }
        } catch (error) {
            const err = error as AxiosErrorResponse;

            toast.error(
                err.response?.data?.message ||
                "Failed to submit request"
            );

            console.error(
                "Submission error:",
                err.response?.data
            );
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────────────────────────────────
       Clear Forms
    ───────────────────────────────────────── */

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

    /* ─────────────────────────────────────────
       Request Card
    ───────────────────────────────────────── */

    const RequestCard = ({
        req,
    }: {
        req: SupportRequest;
    }) => {
        const isTechnical = req.type === "technical";

        return (
            <div className="request_item">
                {/* Left */}
                <div className="request_left">
                    <div
                        className={`request_type_icon ${isTechnical
                            ? "tech_icon"
                            : "nontech_icon"
                            }`}
                    >
                        <i
                            className={`bi ${isTechnical
                                ? "bi-laptop"
                                : "bi-envelope-paper"
                                }`}
                        ></i>
                    </div>

                    <div className="request_info">
                        <div className="request_title">
                            {req.title ||
                                req.subject ||
                                "—"}
                        </div>

                        <div className="request_meta_row">
                            {/* Type */}
                            <span
                                className={`type_pill ${isTechnical
                                    ? "tech_pill"
                                    : "nontech_pill"
                                    }`}
                            >
                                {isTechnical
                                    ? "Technical"
                                    : "Non-Technical"}
                            </span>

                            {/* Category */}
                            {!isTechnical &&
                                req.category && (
                                    <span className="meta_chip">
                                        <i className="bi bi-tag me-1"></i>

                                        {CATEGORY_LABELS[
                                            req.category
                                        ] ||
                                            req.category}
                                    </span>
                                )}

                            {/* Preferred Date */}
                            {isTechnical &&
                                req.preferred_date && (
                                    <span className="meta_chip">
                                        <i className="bi bi-calendar3 me-1"></i>

                                        {formatDate(
                                            req.preferred_date
                                        )}
                                    </span>
                                )}

                            {/* Slot */}
                            {req.preferred_slot && (
                                <span className="meta_chip">
                                    <i className="bi bi-clock me-1"></i>

                                    {req.preferred_slot}
                                </span>
                            )}

                            {/* Submitted */}
                            <span className="meta_chip muted_chip">
                                <i className="bi bi-send me-1"></i>

                                Submitted{" "}
                                {formatCreated(
                                    req.created_at
                                )}
                            </span>
                        </div>

                        {/* Description */}
                        {req.description && (
                            <div className="request_description">
                                {req.description}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right */}
                <div className="request_right">
                    <span
                        className={`status_badge ${statusClass(
                            req.status
                        )}`}
                    >
                        {req.status || "Pending"}
                    </span>

                    <div className="request_ref">
                        Ref: {req.reference_id || "—"}
                    </div>

                    {req.attachment_url && (
                        <a
                            href={req.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="attachment_link"
                        >
                            <i className="bi bi-paperclip me-1"></i>
                            Attachment
                        </a>
                    )}
                </div>
            </div>
        );
    };

    /* ─────────────────────────────────────────
       JSX
    ───────────────────────────────────────── */

    return (
        <div className="dashboard_layout">
            {/* Sidebar */}
            <Sidebar
                activePage="support"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Overlay */}
            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Main Content */}
            <div className="dashboard_main_content">
                {/* Header */}
                <div className="dashboard_top_header">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
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
                                    setActiveTab(
                                        "technical"
                                    )
                                }
                            >
                                <i className="bi bi-pc-display me-2"></i>
                                Technical Support
                            </button>

                            <button
                                type="button"
                                className={`support_tab ${activeTab ===
                                    "non-technical"
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setActiveTab(
                                        "non-technical"
                                    )
                                }
                            >
                                <i className="bi bi-headset me-2"></i>
                                Non-Technical Support
                            </button>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="support_content_card">
                        {activeTab === "technical" ? (
                            /* ───────────────────────
                               Technical Support
                            ─────────────────────── */
                            <div className="support_form_section">
                                <div className="support_banner tech_banner mb-4">
                                    <div className="banner_content">
                                        <h3>
                                            <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
                                            Book a Technical
                                            Support Session
                                        </h3>

                                        <p>
                                            Get one-on-one
                                            help from a
                                            mentor. Max 3
                                            sessions per
                                            week.
                                        </p>
                                    </div>

                                    <div className="banner_icon">
                                        <i className="bi bi-laptop"></i>
                                    </div>
                                </div>

                                <form
                                    onSubmit={
                                        handleTechSubmit
                                    }
                                >
                                    <div className="form_section_title">
                                        Session Details
                                    </div>

                                    {/* Title */}
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
                                            value={
                                                techData.title
                                            }
                                            onChange={
                                                handleTechChange
                                            }
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
                                        ></textarea>
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
                                                value={
                                                    techData.date
                                                }
                                                onChange={
                                                    handleTechChange
                                                }
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split(
                                                            "T"
                                                        )[0]
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

                                                    <option
                                                        value="Morning Slot"
                                                        disabled={bookedSlots.includes(
                                                            "Morning Slot"
                                                        )}
                                                    >
                                                        🌅 Morning
                                                        Slot
                                                        {bookedSlots.includes(
                                                            "Morning Slot"
                                                        )
                                                            ? " (Booked)"
                                                            : ""}
                                                    </option>

                                                    <option
                                                        value="Evening Slot"
                                                        disabled={bookedSlots.includes(
                                                            "Evening Slot"
                                                        )}
                                                    >
                                                        🌆 Evening
                                                        Slot
                                                        {bookedSlots.includes(
                                                            "Evening Slot"
                                                        )
                                                            ? " (Booked)"
                                                            : ""}
                                                    </option>
                                                </select>
                                            </div>

                                            <small className="text-muted mt-2 d-block">
                                                ⏱ Session
                                                duration:{" "}
                                                <b>
                                                    30 mins
                                                </b>
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
                            /* ───────────────────────
                               Non-Technical Support
                            ─────────────────────── */
                            <div className="support_form_section">
                                <div className="support_banner non_tech_banner mb-4">
                                    <div className="banner_content">
                                        <h3>
                                            <i className="bi bi-envelope-paper-fill me-2 text-info"></i>
                                            Non-Technical
                                            Support Request
                                        </h3>

                                        <p>
                                            For billing,
                                            certificates,
                                            schedule
                                            changes, and
                                            administrative
                                            queries.
                                        </p>
                                    </div>

                                    <div className="banner_icon">
                                        <i className="bi bi-chat-square-text"></i>
                                    </div>
                                </div>

                                <form
                                    onSubmit={
                                        handleNonTechSubmit
                                    }
                                >
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
                                                    Select
                                                    category
                                                </option>

                                                <option value="Billing">
                                                    Billing &
                                                    Payments
                                                </option>

                                                <option value="Certificate">
                                                    Course
                                                    Certificates
                                                </option>

                                                <option value="Schedule">
                                                    Schedule
                                                    Changes
                                                </option>

                                                <option value="Access">
                                                    Course
                                                    Access
                                                    Issues
                                                </option>

                                                <option value="Other">
                                                    Other
                                                    Administrative
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
                                        ></textarea>
                                    </div>

                                    {/* Attachment */}
                                    <div className="mb-4">
                                        <label className="form-label">
                                            ATTACH SUPPORTING
                                            DOCUMENT
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
                                                ref={
                                                    fileInputRef
                                                }
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

                        {/* ─────────────────────────
                            Recent Requests
                        ───────────────────────── */}

                        <div className="recent_requests_card mt-5">
                            <div className="section_header">
                                <i className="bi bi-clock-history me-2 text-primary"></i>

                                Recent Requests

                                <button
                                    type="button"
                                    className="refresh_btn ms-auto"
                                    onClick={
                                        fetchRecentRequests
                                    }
                                    title="Refresh"
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>

                            <div className="requests_list">
                                {recentLoading ? (
                                    <div className="requests_empty">
                                        <div
                                            className="spinner-border spinner-border-sm text-primary me-2"
                                            role="status"
                                        ></div>

                                        Loading requests...
                                    </div>
                                ) : recentRequests.length >
                                    0 ? (
                                    recentRequests.map(
                                        (req) => (
                                            <RequestCard
                                                key={req.id}
                                                req={req}
                                            />
                                        )
                                    )
                                ) : (
                                    <div className="requests_empty">
                                        <i className="bi bi-inbox fs-2 mb-2 d-block text-muted"></i>

                                        <span>
                                            No support
                                            requests yet.
                                        </span>

                                        <small className="d-block mt-1 text-muted">
                                            Submit a
                                            technical or
                                            non-technical
                                            request above
                                            and it will
                                            appear here.
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;