"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

// ======================================================
// API
// ======================================================

const BASE_API_URL =
    "https://velearn.in/velearn-crm/api/";

const BASE_UPLOAD_URL =
    "https://velearn.in/velearn-crm/public/uploads/assignments/";

// ======================================================
// TYPES
// ======================================================

interface User {
    id?: number | string;
    auth_id?: number | string;
    name?: string;
}

interface ScoreBreakdown {
    criterion: string;
    obtained_score: number;
    max_score: number;
}

interface AttemptHistory {
    attempt: number;
    score: number;
    grade: string;
    feedback?: string;
    breakdowns?: ScoreBreakdown[];
}

interface Submission {
    status?: string;
    score?: number | null;
    grade?: string;
    feedback?: string;
    file_path?: string;
    attempts?: number;
    reupload_approved?: number;
    scoreBreakdowns?: ScoreBreakdown[];
    attempts_history?: AttemptHistory[];
}

interface Assignment {
    id: number | string;
    title: string;
    module?: string;
    due_date?: string | null;
    reveal_date?: string | null;
    submission?: Submission | null;
}

interface MappedAssignment
    extends Assignment {
    status: string;
    scoreText: string;
    detailText: string;
    isSubmitted: boolean;
    isOverdue: boolean;
    icon: string;
    deadline: string;
    revealDateFormatted: string;
}

// ======================================================
// HELPERS
// ======================================================

const getFileExtension = (
    filename?: string
) => {
    return filename
        ? filename
            .split(".")
            .pop()
            ?.toLowerCase() || ""
        : "";
};

const isImageFile = (
    filename?: string
) => {
    const ext =
        getFileExtension(filename);

    return [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "webp",
    ].includes(ext);
};

const getFileIconClass = (
    filename?: string
) => {
    const ext =
        getFileExtension(filename);

    switch (ext) {
        case "pdf":
            return "bi-file-earmark-pdf text-danger";

        case "doc":
        case "docx":
            return "bi-file-earmark-word text-primary";

        case "zip":
        case "rar":
            return "bi-file-earmark-zip text-warning";

        case "txt":
            return "bi-file-earmark-text text-secondary";

        default:
            return "bi-file-earmark-arrow-up text-info";
    }
};

const getDisplayFileName = (
    filename?: string
) => {
    if (!filename) return "";

    return (
        filename
            .split("_")
            .slice(1)
            .join("_") ||
        filename
    );
};

// ======================================================
// COMPONENT
// ======================================================

const Assignments = () => {
    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    const [isNotifOpen, setIsNotifOpen] =
        useState(false);

    const [activeTab, setActiveTab] =
        useState("all");

    const [assignments, setAssignments] =
        useState<Assignment[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [expandedBriefId, setExpandedBriefId] =
        useState<number | string | null>(null);

    const [userId, setUserId] =
        useState<number | string | null>(null);

    const [token, setToken] =
        useState<string | null>(null);

    // ==================================================
    // GET USER FROM LOCAL STORAGE
    // ==================================================

    useEffect(() => {
        if (typeof window === "undefined")
            return;

        try {
            const storedUserString =
                localStorage.getItem("user");

            const storedToken =
                localStorage.getItem("token");

            setToken(storedToken);

            if (!storedUserString) {
                setLoading(false);
                return;
            }

            const storedUser: User =
                JSON.parse(
                    storedUserString
                );

            const id =
                storedUser?.id ||
                storedUser?.auth_id;

            setUserId(id || null);
        } catch (error) {
            console.error(
                "Error reading user:",
                error
            );

            setLoading(false);
        }
    }, []);

    // ==================================================
    // FETCH ASSIGNMENTS
    // ==================================================

    const fetchAssignments = async () => {
        if (!userId) return;

        try {
            setLoading(true);

            const res =
                await axios.get(
                    `${BASE_API_URL}my-assignments/${userId}`,
                    {
                        headers: token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {},
                    }
                );

            if (
                res.data?.status ===
                "success"
            ) {
                setAssignments(
                    res.data.data || []
                );
            }
        } catch (error: any) {
            console.error(
                "Error fetching assignments:",
                error
            );

            const errorMsg =
                error?.response?.data
                    ?.message ||
                error?.message ||
                "Unknown error";

            toast.error(
                `Failed to load assignments: ${errorMsg}`
            );
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // FETCH WHEN USER ID IS AVAILABLE
    // ==================================================

    useEffect(() => {
        if (userId) {
            fetchAssignments();
        } else if (
            typeof window !== "undefined"
        ) {
            const user =
                localStorage.getItem(
                    "user"
                );

            if (!user) {
                setLoading(false);
            }
        }
    }, [userId]);

    // ==================================================
    // HANDLE FILE UPLOAD
    // ==================================================

    const handleUpload = async (
        id: number | string,
        file?: File
    ) => {
        if (!file || !userId) return;

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        const uploadPromise =
            axios.post(
                `${BASE_API_URL}assignments/${userId}/${id}/submit`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",

                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                }
            );

        toast.promise(
            uploadPromise,
            {
                loading:
                    "Uploading assignment...",

                success: (res) => {
                    fetchAssignments();

                    return (
                        res.data?.message ||
                        "Assignment submitted successfully!"
                    );
                },

                error: (err) => {
                    return (
                        err?.response?.data
                            ?.message ||
                        "Upload failed."
                    );
                },
            }
        );
    };

    // ==================================================
    // MAP API DATA
    // ==================================================

    const mappedAssignments: MappedAssignment[] =
        assignments.map((item) => {
            const sub =
                item.submission;

            let status = "pending";

            let scoreText =
                "Pending";

            let detailText = "";

            const isSubmitted =
                !!sub;

            const isOverdue =
                !sub &&
                !!item.due_date &&
                new Date(
                    item.due_date
                ) < new Date();

            if (sub) {
                status =
                    sub.status ||
                    "submitted";

                if (
                    status === "late"
                ) {
                    scoreText =
                        "Late";
                }

                if (
                    status ===
                    "evaluated" ||
                    status === "graded"
                ) {
                    scoreText =
                        sub.score !==
                            null &&
                            sub.score !==
                            undefined
                            ? `${sub.score}%`
                            : "Graded";

                    detailText =
                        sub.grade
                            ? `Grade: ${sub.grade}`
                            : sub.score !==
                                null &&
                                sub.score !==
                                undefined
                                ? `Scored ${sub.score}`
                                : "Evaluated";
                }
            }

            return {
                ...item,

                status,

                scoreText,

                detailText,

                isSubmitted,

                isOverdue,

                icon:
                    "bi-layout-text-window-reverse",

                deadline: item.due_date
                    ? new Date(
                        item.due_date
                    ).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                        }
                    )
                    : "No deadline",

                revealDateFormatted:
                    item.reveal_date
                        ? new Date(
                            item.reveal_date
                        ).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )
                        : "Immediate",
            };
        });

    // ==================================================
    // FILTER ASSIGNMENTS
    // ==================================================

    const filteredAssignments =
        activeTab === "all"
            ? mappedAssignments
            : mappedAssignments.filter(
                (item) => {
                    if (
                        activeTab ===
                        "pending"
                    ) {
                        return (
                            item.status ===
                            "pending" ||
                            item.status ===
                            "late" ||
                            ((item.status ===
                                "graded" ||
                                item.status ===
                                "evaluated") &&
                                item.submission
                                    ?.reupload_approved ===
                                1)
                        );
                    }

                    if (
                        activeTab ===
                        "completed"
                    ) {
                        return (
                            (item.status ===
                                "submitted" ||
                                item.status ===
                                "graded" ||
                                item.status ===
                                "evaluated") &&
                            item.submission
                                ?.reupload_approved !==
                            1
                        );
                    }

                    return (
                        item.status ===
                        activeTab
                    );
                }
            );

    // ==================================================
    // STATISTICS
    // ==================================================

    const totalTasks =
        mappedAssignments.length;

    const completedTasks =
        mappedAssignments.filter(
            (item) =>
                (item.status ===
                    "submitted" ||
                    item.status ===
                    "graded" ||
                    item.status ===
                    "evaluated") &&
                item.submission
                    ?.reupload_approved !==
                1
        ).length;

    const pendingTasks =
        mappedAssignments.filter(
            (item) =>
                item.status ===
                "pending" ||
                item.status === "late" ||
                ((item.status ===
                    "graded" ||
                    item.status ===
                    "evaluated") &&
                    item.submission
                        ?.reupload_approved ===
                    1)
        ).length;

    const gradedAssignments =
        mappedAssignments.filter(
            (item) =>
                item.submission &&
                item.submission.score !==
                null &&
                item.submission.score !==
                undefined
        );

    const avgScore =
        gradedAssignments.length >
            0
            ? `${Math.round(
                gradedAssignments.reduce(
                    (
                        acc,
                        curr
                    ) =>
                        acc +
                        (curr
                            .submission
                            ?.score ||
                            0),
                    0
                ) /
                gradedAssignments.length
            )}%`
            : "0%";

    // ==================================================
    // TOGGLE BRIEF
    // ==================================================

    const toggleBrief = (
        id: number | string
    ) => {
        setExpandedBriefId(
            expandedBriefId === id
                ? null
                : id
        );
    };

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="dashboard_layout">

            {/* ======================================
                SIDEBAR
            ====================================== */}

            <Sidebar
                activePage="assignments"
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(
                        false
                    )
                }
            />

            {/* ======================================
                SIDEBAR OVERLAY
            ====================================== */}

            <div
                className={`sidebar_overlay ${isSidebarOpen
                    ? "show"
                    : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(
                        false
                    )
                }
            ></div>

            {/* ======================================
                NOTIFICATIONS
            ====================================== */}

            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() =>
                    setIsNotifOpen(
                        false
                    )
                }
                notifications={[]}
            />

            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <div className="dashboard_main_content">

                {/* HEADER */}

                <header className="dashboard_top_header">

                    <div className="profile_breadcrumb">

                        <h2>
                            Live Courses{" "}
                            <span>
                                / Assignments
                            </span>
                        </h2>

                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() =>
                            setIsNotifOpen(
                                true
                            )
                        }
                    >
                        <i className="bi bi-bell"></i>
                    </div>

                </header>

                {/* ==================================
                    ASSIGNMENTS CONTAINER
                ================================== */}

                <div className="assignments_container">

                    {/* ==================================
                        HERO STATS
                    ================================== */}

                    <div className="assignments_hero_stats">

                        <div className="stat_item">

                            <div className="stat_val">
                                {loading
                                    ? "-"
                                    : totalTasks}
                            </div>

                            <div className="stat_lab">
                                Total Tasks
                            </div>

                        </div>

                        <div className="stat_divider"></div>

                        <div className="stat_item">

                            <div className="stat_val">
                                {loading
                                    ? "-"
                                    : completedTasks}
                            </div>

                            <div className="stat_lab">
                                Completed
                            </div>

                        </div>

                        <div className="stat_divider"></div>

                        <div className="stat_item">

                            <div className="stat_val">
                                {loading
                                    ? "-"
                                    : avgScore}
                            </div>

                            <div className="stat_lab">
                                Avg Score
                            </div>

                        </div>

                    </div>

                    {/* ==================================
                        TABS
                    ================================== */}

                    <div className="assignments_tabs">

                        <button
                            type="button"
                            className={`tab_btn text-center justify-content-center ${activeTab ===
                                "all"
                                ? "active"
                                : ""
                                }`}
                            onClick={() =>
                                setActiveTab(
                                    "all"
                                )
                            }
                        >
                            All ({totalTasks})
                        </button>

                        <button
                            type="button"
                            className={`tab_btn text-center justify-content-center ${activeTab ===
                                "pending"
                                ? "active"
                                : ""
                                }`}
                            onClick={() =>
                                setActiveTab(
                                    "pending"
                                )
                            }
                        >
                            Pending (
                            {
                                pendingTasks
                            }
                            )
                        </button>

                        <button
                            type="button"
                            className={`tab_btn text-center justify-content-center ${activeTab ===
                                "completed"
                                ? "active"
                                : ""
                                }`}
                            onClick={() =>
                                setActiveTab(
                                    "completed"
                                )
                            }
                        >
                            Completed (
                            {
                                completedTasks
                            }
                            )
                        </button>

                    </div>

                    {/* ==================================
                        ASSIGNMENT LIST
                    ================================== */}

                    <div className="assignment_list">

                        {filteredAssignments.length >
                            0 ? (
                            filteredAssignments.map(
                                (item) => (

                                    <div
                                        key={
                                            item.id
                                        }
                                        className={`assignment_card ${item.status} ${item.isSubmitted
                                            ? "submitted_card"
                                            : ""
                                            }`}
                                    >

                                        {/* ==================================
                                            ASSIGNMENT HEADER
                                        ================================== */}

                                        <div className="as_header">

                                            <div className="as_info">

                                                <h3 className="as_title">
                                                    {
                                                        item.title
                                                    }
                                                </h3>

                                                {/* META */}

                                                <div className="as_meta">

                                                    <span>
                                                        <i
                                                            className={`bi ${item.icon}`}
                                                        ></i>{" "}
                                                        {
                                                            item.module
                                                        }
                                                    </span>

                                                    <span>
                                                        <i className="bi bi-calendar3"></i>{" "}
                                                        Deadline:{" "}
                                                        {
                                                            item.deadline
                                                        }
                                                    </span>

                                                    <span>
                                                        <i className="bi bi-eye"></i>{" "}
                                                        Revealed:{" "}
                                                        {
                                                            item.revealDateFormatted
                                                        }
                                                    </span>

                                                </div>

                                                {/* ==================================
                                                    BADGES
                                                ================================== */}

                                                <div className="badge_group">

                                                    {/* GRADED FEEDBACK */}

                                                    {(item.status ===
                                                        "graded" ||
                                                        item.status ===
                                                        "evaluated") &&
                                                        item.detailText && (
                                                            <span className="graded_badge">

                                                                <i className="bi bi-patch-check-fill"></i>{" "}

                                                                {
                                                                    item.detailText
                                                                }

                                                            </span>
                                                        )}

                                                    {/* REUPLOAD */}

                                                    {(item.status ===
                                                        "graded" ||
                                                        item.status ===
                                                        "evaluated") &&
                                                        item
                                                            .submission
                                                            ?.reupload_approved ===
                                                        1 && (
                                                            <span
                                                                className="submission_status_badge pending-reupload"
                                                                style={{
                                                                    backgroundColor:
                                                                        "#fff7ed",
                                                                    color:
                                                                        "#c2410c",
                                                                    border:
                                                                        "1px solid #fed7aa",
                                                                }}
                                                            >

                                                                <i className="bi bi-hourglass-split"></i>{" "}

                                                                Reupload
                                                                Pending

                                                            </span>
                                                        )}

                                                    {/* SUBMITTED */}

                                                    {item.isSubmitted ? (
                                                        <span
                                                            className={`submission_status_badge submitted ${item.status}`}
                                                        >

                                                            <i className="bi bi-check-circle-fill"></i>{" "}

                                                            {item.status ===
                                                                "late"
                                                                ? "Submitted Late"
                                                                : "Submitted"}

                                                            {item
                                                                .submission
                                                                ?.attempts
                                                                ? ` (Attempt ${item.submission.attempts}/3)`
                                                                : ""}

                                                        </span>
                                                    ) : item.isOverdue ? (
                                                        <span className="submission_status_badge overdue">

                                                            <i className="bi bi-exclamation-circle-fill"></i>{" "}

                                                            Overdue

                                                        </span>
                                                    ) : (
                                                        <span className="submission_status_badge pending">

                                                            <i className="bi bi-clock-history"></i>{" "}

                                                            Pending
                                                            Submission

                                                        </span>
                                                    )}

                                                </div>

                                                {/* ==================================
                                                    SUBMITTED FILE
                                                ================================== */}

                                                {item.isSubmitted &&
                                                    item
                                                        .submission
                                                        ?.file_path && (

                                                        <div className="submitted_file_container">

                                                            {/* IMAGE */}

                                                            {isImageFile(
                                                                item
                                                                    .submission
                                                                    .file_path
                                                            ) ? (

                                                                <div className="assignment_image_preview_box">

                                                                    <div className="preview_image_wrapper">

                                                                        <img
                                                                            src={`${BASE_UPLOAD_URL}${item.submission.file_path}`}
                                                                            alt="Submitted assignment preview"
                                                                            className="assignment_preview_img"
                                                                        />

                                                                        <div className="preview_overlay">

                                                                            <a
                                                                                href={`${BASE_UPLOAD_URL}${item.submission.file_path}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="preview_action_btn"
                                                                                title="View Full Screen"
                                                                            >
                                                                                <i className="bi bi-eye-fill"></i>
                                                                            </a>

                                                                            <a
                                                                                href={`${BASE_UPLOAD_URL}${item.submission.file_path}`}
                                                                                download={
                                                                                    item
                                                                                        .submission
                                                                                        .file_path
                                                                                }
                                                                                className="preview_action_btn"
                                                                                title="Download Image"
                                                                            >
                                                                                <i className="bi bi-download"></i>
                                                                            </a>

                                                                        </div>

                                                                    </div>

                                                                    <div className="preview_file_details">

                                                                        <span className="file_name_text">
                                                                            {getDisplayFileName(
                                                                                item
                                                                                    .submission
                                                                                    .file_path
                                                                            )}
                                                                        </span>

                                                                        <span className="file_type_badge">
                                                                            IMAGE
                                                                        </span>

                                                                    </div>

                                                                </div>

                                                            ) : (

                                                                /* NON IMAGE FILE */

                                                                <div className="submitted_file_info">

                                                                    <i
                                                                        className={`bi ${getFileIconClass(
                                                                            item
                                                                                .submission
                                                                                .file_path
                                                                        )}`}
                                                                    ></i>

                                                                    <span className="file_label">
                                                                        Uploaded
                                                                        File:{" "}
                                                                    </span>

                                                                    <span className="file_name_text me-2">

                                                                        {getDisplayFileName(
                                                                            item
                                                                                .submission
                                                                                .file_path
                                                                        )}

                                                                    </span>

                                                                    <a
                                                                        href={`${BASE_UPLOAD_URL}${item.submission.file_path}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="submitted_file_link"
                                                                    >
                                                                        View
                                                                        File{" "}
                                                                        <i className="bi bi-box-arrow-up-right"></i>
                                                                    </a>

                                                                    <span className="mx-1 text-muted">
                                                                        |
                                                                    </span>

                                                                    <a
                                                                        href={`${BASE_UPLOAD_URL}${item.submission.file_path}`}
                                                                        download={
                                                                            item
                                                                                .submission
                                                                                .file_path
                                                                        }
                                                                        className="submitted_file_link"
                                                                    >
                                                                        Download{" "}
                                                                        <i className="bi bi-download"></i>
                                                                    </a>

                                                                </div>
                                                            )}

                                                        </div>
                                                    )}

                                                {/* ==================================
                                                    ACTIONS
                                                ================================== */}

                                                <div className="as_actions">

                                                    {/* UPLOAD */}

                                                    {(!item.isSubmitted ||
                                                        item
                                                            .submission
                                                            ?.reupload_approved ===
                                                        1) &&
                                                        (item
                                                            .submission
                                                            ?.attempts &&
                                                            item
                                                                .submission
                                                                .attempts >=
                                                            3 ? (

                                                            <span
                                                                className="btn_upload_disabled text-danger fw-bold d-inline-flex align-items-center gap-1 py-1"
                                                                style={{
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                <i className="bi bi-exclamation-triangle-fill"></i>

                                                                Attempt
                                                                Limit
                                                                Reached
                                                                (3/3)
                                                            </span>

                                                        ) : (

                                                            <label
                                                                className={`btn_upload ${item.status ===
                                                                    "late"
                                                                    ? "late"
                                                                    : "pending"
                                                                    }`}
                                                                style={{
                                                                    cursor:
                                                                        "pointer",
                                                                    margin: 0,
                                                                }}
                                                            >

                                                                <i
                                                                    className={`bi ${item.status ===
                                                                        "late"
                                                                        ? "bi-exclamation-triangle"
                                                                        : "bi-cloud-arrow-up"
                                                                        }`}
                                                                ></i>

                                                                {item.isSubmitted
                                                                    ? item.status ===
                                                                        "late"
                                                                        ? `Resubmit Late (Attempt ${(item
                                                                            .submission
                                                                            ?.attempts ||
                                                                            0) +
                                                                        1
                                                                        }/3)`
                                                                        : `Resubmit (Attempt ${(item
                                                                            .submission
                                                                            ?.attempts ||
                                                                            0) +
                                                                        1
                                                                        }/3)`
                                                                    : item.status ===
                                                                        "late"
                                                                        ? "Late Upload"
                                                                        : "Upload Submission"}

                                                                <input
                                                                    type="file"
                                                                    accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.webp"
                                                                    style={{
                                                                        display:
                                                                            "none",
                                                                    }}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const file =
                                                                            e
                                                                                .target
                                                                                .files?.[0];

                                                                        if (
                                                                            file
                                                                        ) {
                                                                            handleUpload(
                                                                                item.id,
                                                                                file
                                                                            );
                                                                        }

                                                                        e.target.value =
                                                                            "";
                                                                    }}
                                                                />

                                                            </label>
                                                        ))}

                                                    {/* VIEW BRIEF */}

                                                    <button
                                                        type="button"
                                                        className={`btn_brief ${expandedBriefId ===
                                                            item.id
                                                            ? "active"
                                                            : ""
                                                            }`}
                                                        onClick={() =>
                                                            toggleBrief(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        {expandedBriefId ===
                                                            item.id
                                                            ? "Hide Brief"
                                                            : "View Brief"}
                                                    </button>

                                                </div>

                                            </div>

                                            {/* STATUS */}

                                            <div
                                                className={`as_status_badge ${item.status}`}
                                            >
                                                {
                                                    item.scoreText
                                                }
                                            </div>

                                        </div>

                                        {/* ==================================
                                            EXPANDED BRIEF
                                        ================================== */}

                                        {expandedBriefId ===
                                            item.id && (

                                                <div className="assignment_brief_box">

                                                    {/* ==================================
                                                    EVALUATION
                                                ================================== */}

                                                    {item.submission &&
                                                        (item
                                                            .submission
                                                            .score !==
                                                            null ||
                                                            (item
                                                                .submission
                                                                .attempts_history &&
                                                                item
                                                                    .submission
                                                                    .attempts_history
                                                                    .length >
                                                                0)) && (

                                                            <div>

                                                                <div
                                                                    className="brief_header"
                                                                    style={{
                                                                        color:
                                                                            "#4f46e5",
                                                                    }}
                                                                >
                                                                    <i className="bi bi-clipboard2-check-fill"></i>{" "}

                                                                    Evaluation
                                                                    Feedback
                                                                    &
                                                                    History
                                                                </div>

                                                                <div className="brief_body mt-3">

                                                                    {/* CURRENT EVALUATION */}

                                                                    {item
                                                                        .submission
                                                                        .score !==
                                                                        null &&
                                                                        item
                                                                            .submission
                                                                            .score !==
                                                                        undefined && (

                                                                            <div className="bg-white p-3 rounded shadow-sm border mb-4">

                                                                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">

                                                                                    <i className="bi bi-star-fill text-warning"></i>

                                                                                    Latest
                                                                                    Evaluation
                                                                                    (
                                                                                    Attempt{" "}
                                                                                    {
                                                                                        item
                                                                                            .submission
                                                                                            .attempts
                                                                                    }
                                                                                    /3
                                                                                    )

                                                                                </h6>

                                                                                {/* SCORE BREAKDOWN */}

                                                                                {item
                                                                                    .submission
                                                                                    .scoreBreakdowns &&
                                                                                    item
                                                                                        .submission
                                                                                        .scoreBreakdowns
                                                                                        .length >
                                                                                    0 && (

                                                                                        <div className="mb-3">

                                                                                            <div className="fw-bold text-muted small mb-2 uppercase-tracking">
                                                                                                Score
                                                                                                Breakdown
                                                                                            </div>

                                                                                            <div className="d-flex flex-wrap gap-2">

                                                                                                {item
                                                                                                    .submission
                                                                                                    .scoreBreakdowns.map(
                                                                                                        (
                                                                                                            bd,
                                                                                                            i
                                                                                                        ) => (

                                                                                                            <div
                                                                                                                key={
                                                                                                                    i
                                                                                                                }
                                                                                                                className="bg-light px-3 py-1 rounded border small"
                                                                                                            >

                                                                                                                <span className="text-muted">
                                                                                                                    {
                                                                                                                        bd.criterion
                                                                                                                    }
                                                                                                                    :{" "}
                                                                                                                </span>

                                                                                                                <strong className="text-dark">
                                                                                                                    {
                                                                                                                        bd.obtained_score
                                                                                                                    }
                                                                                                                    /
                                                                                                                    {
                                                                                                                        bd.max_score
                                                                                                                    }
                                                                                                                </strong>

                                                                                                            </div>

                                                                                                        )
                                                                                                    )}

                                                                                            </div>

                                                                                        </div>
                                                                                    )}

                                                                                {/* FEEDBACK */}

                                                                                {item
                                                                                    .submission
                                                                                    .feedback && (

                                                                                        <div className="mt-2">

                                                                                            <div className="fw-bold text-muted small mb-1 uppercase-tracking">
                                                                                                Staff
                                                                                                Feedback
                                                                                            </div>

                                                                                            <div
                                                                                                className="p-3 bg-light rounded"
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "0.9rem",
                                                                                                    lineHeight:
                                                                                                        "1.5",
                                                                                                }}
                                                                                            >
                                                                                                {
                                                                                                    item
                                                                                                        .submission
                                                                                                        .feedback
                                                                                                }
                                                                                            </div>

                                                                                        </div>
                                                                                    )}

                                                                            </div>
                                                                        )}

                                                                    {/* ==================================
                                                                    PREVIOUS ATTEMPTS
                                                                ================================== */}

                                                                    {item
                                                                        .submission
                                                                        .attempts_history &&
                                                                        item
                                                                            .submission
                                                                            .attempts_history
                                                                            .length >
                                                                        0 && (

                                                                            <div className="mt-4">

                                                                                <h6 className="fw-bold text-muted small uppercase-tracking mb-3">

                                                                                    <i className="bi bi-clock-history"></i>{" "}
                                                                                    Previous
                                                                                    Attempts

                                                                                </h6>

                                                                                <div className="d-flex flex-column gap-3">

                                                                                    {item
                                                                                        .submission
                                                                                        .attempts_history.map(
                                                                                            (
                                                                                                hist,
                                                                                                i
                                                                                            ) => (

                                                                                                <div
                                                                                                    key={
                                                                                                        i
                                                                                                    }
                                                                                                    className="bg-white p-3 rounded border"
                                                                                                    style={{
                                                                                                        opacity:
                                                                                                            0.8,
                                                                                                    }}
                                                                                                >

                                                                                                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">

                                                                                                        <span className="fw-bold text-dark">
                                                                                                            Attempt{" "}
                                                                                                            {
                                                                                                                hist.attempt
                                                                                                            }
                                                                                                        </span>

                                                                                                        <div className="d-flex gap-2">

                                                                                                            <span className="badge bg-light text-dark border">
                                                                                                                Score:{" "}
                                                                                                                {
                                                                                                                    hist.score
                                                                                                                }
                                                                                                                %
                                                                                                            </span>

                                                                                                            <span className="badge bg-light text-dark border">
                                                                                                                Grade:{" "}
                                                                                                                {
                                                                                                                    hist.grade
                                                                                                                }
                                                                                                            </span>

                                                                                                        </div>

                                                                                                    </div>

                                                                                                    {/* BREAKDOWNS */}

                                                                                                    {hist.breakdowns &&
                                                                                                        hist
                                                                                                            .breakdowns
                                                                                                            .length >
                                                                                                        0 && (

                                                                                                            <div className="d-flex flex-wrap gap-2 mb-2">

                                                                                                                {hist.breakdowns.map(
                                                                                                                    (
                                                                                                                        bd,
                                                                                                                        j
                                                                                                                    ) => (

                                                                                                                        <div
                                                                                                                            key={
                                                                                                                                j
                                                                                                                            }
                                                                                                                            className="bg-light px-2 py-1 rounded small text-muted"
                                                                                                                            style={{
                                                                                                                                fontSize:
                                                                                                                                    "0.8rem",
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            {
                                                                                                                                bd.criterion
                                                                                                                            }

                                                                                                                            :{" "}

                                                                                                                            <strong className="text-dark">
                                                                                                                                {
                                                                                                                                    bd.obtained_score
                                                                                                                                }
                                                                                                                                /
                                                                                                                                {
                                                                                                                                    bd.max_score
                                                                                                                                }
                                                                                                                            </strong>

                                                                                                                        </div>

                                                                                                                    )
                                                                                                                )}

                                                                                                            </div>
                                                                                                        )}

                                                                                                    <div className="small text-muted mt-2">

                                                                                                        <strong>
                                                                                                            Feedback:
                                                                                                        </strong>{" "}

                                                                                                        {
                                                                                                            hist.feedback ||
                                                                                                            "None"
                                                                                                        }

                                                                                                    </div>

                                                                                                </div>

                                                                                            )
                                                                                        )}

                                                                                </div>

                                                                            </div>
                                                                        )}

                                                                </div>

                                                            </div>
                                                        )}

                                                </div>
                                            )}

                                    </div>
                                )
                            )
                        ) : (

                            /* EMPTY STATE */

                            <div className="text-center py-5">

                                <i className="bi bi-clipboard-x display-1 text-muted opacity-25"></i>

                                <p className="mt-3 text-muted">
                                    No assignments
                                    found for this
                                    category.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Assignments;