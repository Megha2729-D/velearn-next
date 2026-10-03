"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_UPLOAD_URL = "https://crm.velearn.in/uploads/assignments/";

interface Submission {
    status?: string;
    score?: number | null;
    grade?: string | null;
    attempts?: number;
    file_path?: string | null;
    feedback?: string | null;
    reupload_approved?: number | boolean;
    scoreBreakdowns?: ScoreBreakdown[];
    attempts_history?: AttemptHistory[];
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
    file_path?: string;
    breakdowns?: ScoreBreakdown[];
}

interface Assignment {
    id: number | string;
    title: string;
    module?: string;
    due_date?: string | null;
    reveal_date?: string | null;
    description?: string | null;
    document?: string | null;
    submission?: Submission | null;
}

interface MappedAssignment extends Assignment {
    status: string;
    scoreText: string;
    detailText: string;
    isSubmitted: boolean;
    isOverdue: boolean;
    icon: string;
    deadline: string;
    revealDateFormatted: string;
}

interface StoredUser {
    id?: number | string;
    auth_id?: number | string;
}

const getFileExtension = (filename?: string | null) => {
    return filename
        ? filename.split(".").pop()?.toLowerCase() || ""
        : "";
};

const isImageFile = (filename?: string | null) => {
    const ext = getFileExtension(filename);

    return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
};

const getFileIconClass = (filename?: string | null) => {
    const ext = getFileExtension(filename);

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

const Assignments = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const [activeTab, setActiveTab] = useState("all");

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const [expandedBriefId, setExpandedBriefId] = useState<
        number | string | null
    >(null);

    const [userId, setUserId] = useState<number | string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUserString = localStorage.getItem("user");

        setToken(storedToken);

        if (storedUserString) {
            try {
                const storedUser: StoredUser = JSON.parse(storedUserString);

                const id = storedUser?.id || storedUser?.auth_id;

                setUserId(id || null);
            } catch (error) {
                console.error("Invalid user data:", error);
                setUserId(null);
            }
        }
    }, []);

    const fetchAssignments = async () => {
        if (!userId) return;

        try {
            setLoading(true);

            const res = await axios.get(
                `${BASE_API_URL}my-assignments/${userId}`,
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                },
            );

            if (res.data?.status === "success") {
                setAssignments(res.data.data || []);
            } else {
                setAssignments([]);
            }
        } catch (error: any) {
            console.error("Error fetching assignments:", error);

            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "Unknown error";

            toast.error(`Failed to load assignments: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchAssignments();
        } else if (userId === null) {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                setLoading(false);
            }
        }
    }, [userId, token]);

    const handleUpload = async (
        id: number | string,
        file?: File,
    ) => {
        if (!file || !userId) return;

        const formData = new FormData();

        formData.append("file", file);

        const uploadPromise = axios.post(
            `${BASE_API_URL}assignments/${userId}/${id}/submit`,
            formData,
            {
                headers: {
                    ...(token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {}),
                },
            },
        );

        toast.promise(uploadPromise, {
            loading: "Uploading assignment...",

            success: (res) => {
                fetchAssignments();

                return (
                    res.data.message ||
                    "Assignment submitted successfully!"
                );
            },

            error: (err) => {
                return (
                    err.response?.data?.message ||
                    "Upload failed."
                );
            },
        });
    };

    const mappedAssignments: MappedAssignment[] = assignments.map(
        (item) => {
            const sub = item.submission;

            let status = "pending";
            let scoreText = "Pending";
            let detailText = "";

            const isSubmitted = !!sub;

            const isOverdue =
                !sub &&
                !!item.due_date &&
                new Date(item.due_date) < new Date();

            if (sub) {
                status = sub.status || "submitted";

                if (status === "late") {
                    scoreText = "Late";
                }

                if (
                    status === "evaluated" ||
                    status === "graded"
                ) {
                    scoreText =
                        sub.score !== null &&
                            sub.score !== undefined
                            ? `${sub.score}%`
                            : "Graded";

                    detailText = sub.grade
                        ? `Grade: ${sub.grade}`
                        : sub.score !== null &&
                            sub.score !== undefined
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

                icon: "bi-layout-text-window-reverse",

                deadline: item.due_date
                    ? new Date(
                        item.due_date,
                    ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                    })
                    : "No deadline",

                revealDateFormatted: item.reveal_date
                    ? new Date(
                        item.reveal_date,
                    ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "Immediate",
            };
        },
    );

    const filteredAssignments =
        activeTab === "all"
            ? mappedAssignments
            : mappedAssignments.filter((item) => {
                if (activeTab === "pending") {
                    return (
                        item.status === "pending" ||
                        item.status === "late" ||
                        ((item.status === "graded" ||
                            item.status === "evaluated") &&
                            (item.submission
                                ?.reupload_approved === 1 ||
                                item.submission
                                    ?.reupload_approved === true))
                    );
                }

                if (activeTab === "completed") {
                    return (
                        (item.status === "submitted" ||
                            item.status === "graded" ||
                            item.status === "evaluated") &&
                        item.submission
                            ?.reupload_approved !== 1 &&
                        item.submission
                            ?.reupload_approved !== true
                    );
                }

                return item.status === activeTab;
            });

    const totalTasks = mappedAssignments.length;

    const completedTasks = mappedAssignments.filter(
        (item) =>
            (item.status === "submitted" ||
                item.status === "graded" ||
                item.status === "evaluated") &&
            item.submission?.reupload_approved !== 1 &&
            item.submission?.reupload_approved !== true,
    ).length;

    const pendingTasks = mappedAssignments.filter(
        (item) =>
            item.status === "pending" ||
            item.status === "late" ||
            ((item.status === "graded" ||
                item.status === "evaluated") &&
                (item.submission?.reupload_approved === 1 ||
                    item.submission?.reupload_approved === true)),
    ).length;

    const gradedAssignments = mappedAssignments.filter(
        (item) =>
            item.submission &&
            item.submission.score !== null &&
            item.submission.score !== undefined,
    );

    const avgScore =
        gradedAssignments.length > 0
            ? `${Math.round(
                gradedAssignments.reduce(
                    (acc, curr) =>
                        acc + (curr.submission?.score || 0),
                    0,
                ) / gradedAssignments.length,
            )}%`
            : "0%";

    return (
        <div className="dashboard_layout">
            <Sidebar
                activePage="assignments"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={[]}
            />

            <div className="dashboard_main_content">
                <header className="dashboard_top_header">
                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses{" "}
                            <span>/ Assignments</span>
                        </h2>
                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>
                    </div>
                </header>

                <div className="assignments_container">
                    {/* Hero Stats */}
                    <div className="assignments_hero_stats">
                        <div className="stat_item">
                            <div className="stat_val">
                                {loading ? "-" : totalTasks}
                            </div>

                            <div className="stat_lab">
                                Total Tasks
                            </div>
                        </div>

                        <div className="stat_divider"></div>

                        <div className="stat_item">
                            <div className="stat_val">
                                {loading ? "-" : completedTasks}
                            </div>

                            <div className="stat_lab">
                                Completed
                            </div>
                        </div>

                        <div className="stat_divider"></div>

                        <div className="stat_item">
                            <div className="stat_val">
                                {loading ? "-" : avgScore}
                            </div>

                            <div className="stat_lab">
                                Avg Score
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="assignments_tabs">
                        <button
                            className={`tab_btn text-center justify-content-center ${activeTab === "all"
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() => setActiveTab("all")}
                        >
                            All ({totalTasks})
                        </button>

                        <button
                            className={`tab_btn text-center justify-content-center ${activeTab === "pending"
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() =>
                                setActiveTab("pending")
                            }
                        >
                            Pending ({pendingTasks})
                        </button>

                        <button
                            className={`tab_btn text-center justify-content-center ${activeTab === "completed"
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() =>
                                setActiveTab("completed")
                            }
                        >
                            Completed ({completedTasks})
                        </button>
                    </div>

                    {/* Assignment List */}
                    <div className="assignment_list">
                        {filteredAssignments.length > 0 ? (
                            filteredAssignments.map((item) => (
                                <div
                                    key={item.id}
                                    className={`assignment_card ${item.status
                                        } ${item.isSubmitted
                                            ? "submitted_card"
                                            : ""
                                        }`}
                                >
                                    <div className="as_header">
                                        <div className="as_info">
                                            <h3 className="as_title">
                                                {item.title}
                                            </h3>

                                            <div className="as_meta">
                                                <span>
                                                    <i
                                                        className={`bi ${item.icon}`}
                                                    ></i>{" "}
                                                    {item.module}
                                                </span>

                                                <span>
                                                    <i className="bi bi-calendar3"></i>{" "}
                                                    Deadline:{" "}
                                                    {item.deadline}
                                                </span>

                                                <span>
                                                    <i className="bi bi-eye"></i>{" "}
                                                    Revealed:{" "}
                                                    {
                                                        item.revealDateFormatted
                                                    }
                                                </span>
                                            </div>

                                            <div className="badge_group">
                                                {/* Graded Feedback */}
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

                                                {/* Reupload Status */}
                                                {(item.status ===
                                                    "graded" ||
                                                    item.status ===
                                                    "evaluated") &&
                                                    (item.submission
                                                        ?.reupload_approved ===
                                                        1 ||
                                                        item.submission
                                                            ?.reupload_approved ===
                                                        true) && (
                                                        <span
                                                            className="submission_status_badge pending-reupload"
                                                            style={{
                                                                backgroundColor:
                                                                    "#fff7ed",
                                                                color: "#c2410c",
                                                                border: "1px solid #fed7aa",
                                                            }}
                                                        >
                                                            <i className="bi bi-hourglass-split"></i>{" "}
                                                            Reupload
                                                            Pending
                                                        </span>
                                                    )}

                                                {/* Submission Status */}
                                                {item.isSubmitted ? (
                                                    <span
                                                        className={`submission_status_badge submitted ${item.status}`}
                                                    >
                                                        <i className="bi bi-check-circle-fill"></i>{" "}
                                                        {item.status ===
                                                            "late"
                                                            ? "Submitted Late"
                                                            : "Submitted"}{" "}
                                                        {item
                                                            .submission
                                                            ?.attempts
                                                            ? `(Attempt ${item
                                                                .submission
                                                                .attempts
                                                            }/3)`
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

                                            {/* Submitted File */}
                                            {item.isSubmitted &&
                                                item.submission &&
                                                item.submission
                                                    .file_path && (
                                                    <div className="submitted_file_container">
                                                        {isImageFile(
                                                            item
                                                                .submission
                                                                .file_path,
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
                                                                        {item.submission.file_path
                                                                            .split(
                                                                                "_",
                                                                            )
                                                                            .slice(
                                                                                1,
                                                                            )
                                                                            .join(
                                                                                "_",
                                                                            ) ||
                                                                            item
                                                                                .submission
                                                                                .file_path}
                                                                    </span>

                                                                    <span className="file_type_badge">
                                                                        IMAGE
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="submitted_file_info">
                                                                <i
                                                                    className={`bi ${getFileIconClass(
                                                                        item
                                                                            .submission
                                                                            .file_path,
                                                                    )}`}
                                                                ></i>

                                                                <span className="file_label">
                                                                    Uploaded
                                                                    File:{" "}
                                                                </span>

                                                                <span className="file_name_text me-2">
                                                                    {item.submission.file_path
                                                                        .split(
                                                                            "_",
                                                                        )
                                                                        .slice(
                                                                            1,
                                                                        )
                                                                        .join(
                                                                            "_",
                                                                        ) ||
                                                                        item
                                                                            .submission
                                                                            .file_path}
                                                                </span>

                                                                <a
                                                                    href={`${BASE_UPLOAD_URL}${item.submission.file_path}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="submitted_file_link"
                                                                >
                                                                    View File{" "}
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

                                            {/* Actions */}
                                            <div className="as_actions">
                                                {(!item.isSubmitted ||
                                                    item.submission
                                                        ?.reupload_approved ===
                                                    1 ||
                                                    item.submission
                                                        ?.reupload_approved ===
                                                    true) &&
                                                    (item.submission &&
                                                        (item.submission
                                                            .attempts || 0) >=
                                                        3 ? (
                                                        <span
                                                            className="btn_upload_disabled text-danger fw-bold d-inline-flex align-items-center gap-1 py-1"
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                                                            Attempt Limit
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
                                                                cursor: "pointer",
                                                                margin: 0,
                                                            }}
                                                        >
                                                            <i
                                                                className={`bi ${item.status ===
                                                                        "late"
                                                                        ? "bi-exclamation-triangle"
                                                                        : "bi-cloud-arrow-up"
                                                                    }`}
                                                            ></i>{" "}
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
                                                                    e,
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
                                                                            file,
                                                                        );
                                                                    }

                                                                    e.target.value =
                                                                        "";
                                                                }}
                                                            />
                                                        </label>
                                                    ))}

                                                <button
                                                    className={`btn_brief ${expandedBriefId ===
                                                            item.id
                                                            ? "active"
                                                            : ""
                                                        }`}
                                                    onClick={() =>
                                                        setExpandedBriefId(
                                                            expandedBriefId ===
                                                                item.id
                                                                ? null
                                                                : item.id,
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

                                        <div
                                            className={`as_status_badge ${item.status}`}
                                        >
                                            {item.scoreText}
                                        </div>
                                    </div>

                                    {/* Expanded Brief */}
                                    {expandedBriefId === item.id && (
                                        <div className="assignment_brief_box">
                                            {/* Assignment Details */}
                                            <div className="mb-4">
                                                <div
                                                    className="brief_header"
                                                    style={{
                                                        color: "#4f46e5",
                                                    }}
                                                >
                                                    <i className="bi bi-info-circle-fill"></i>{" "}
                                                    Assignment Details
                                                </div>

                                                <div className="brief_body mt-3">
                                                    <div className="bg-white p-3 rounded shadow-sm border mb-3">
                                                        {item.description ? (
                                                            <div
                                                                className="text-dark"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: item.description,
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="text-muted fst-italic">
                                                                No description
                                                                provided.
                                                            </div>
                                                        )}

                                                        {item.document && (
                                                            <div className="mt-3 pt-3 border-top">
                                                                <a
                                                                    href={`${BASE_UPLOAD_URL}${item.document}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
                                                                >
                                                                    <i className="bi bi-file-earmark-pdf-fill"></i>{" "}
                                                                    View
                                                                    Assignment
                                                                    Attachment
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Evaluation */}
                                            {item.submission &&
                                                (item.submission.score !==
                                                    null ||
                                                    (item.submission
                                                        .attempts_history &&
                                                        item.submission
                                                            .attempts_history
                                                            .length > 0)) && (
                                                    <div>
                                                        <div
                                                            className="brief_header"
                                                            style={{
                                                                color: "#4f46e5",
                                                            }}
                                                        >
                                                            <i className="bi bi-clipboard2-check-fill"></i>{" "}
                                                            Evaluation
                                                            Feedback &
                                                            History
                                                        </div>

                                                        <div className="brief_body mt-3">
                                                            {/* Latest Evaluation */}
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
                                                                            <i className="bi bi-star-fill text-warning"></i>{" "}
                                                                            Latest
                                                                            Evaluation
                                                                            (
                                                                            Attempt{" "}
                                                                            {
                                                                                item
                                                                                    .submission
                                                                                    .attempts
                                                                            }
                                                                            /3)
                                                                        </h6>

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
                                                                                        {item.submission.scoreBreakdowns.map(
                                                                                            (
                                                                                                bd,
                                                                                                i,
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
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}

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

                                                            {/* Previous Attempts */}
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
                                                                            {item.submission.attempts_history.map(
                                                                                (
                                                                                    hist,
                                                                                    i,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        className="bg-white p-3 rounded border"
                                                                                        style={{
                                                                                            opacity: 0.8,
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

                                                                                        {hist.breakdowns &&
                                                                                            hist
                                                                                                .breakdowns
                                                                                                .length >
                                                                                            0 && (
                                                                                                <div className="d-flex flex-wrap gap-2 mb-2">
                                                                                                    {hist.breakdowns.map(
                                                                                                        (
                                                                                                            bd,
                                                                                                            j,
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
                                                                                                        ),
                                                                                                    )}
                                                                                                </div>
                                                                                            )}

                                                                                        <div className="small text-muted mt-2 d-flex justify-content-between align-items-center">
                                                                                            <div>
                                                                                                <strong>
                                                                                                    Feedback:
                                                                                                </strong>{" "}
                                                                                                {hist.feedback ||
                                                                                                    "None"}
                                                                                            </div>

                                                                                            {hist.file_path && (
                                                                                                <a
                                                                                                    href={`${BASE_UPLOAD_URL}${hist.file_path}`}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="btn btn-sm btn-link text-decoration-none p-0 fw-bold d-flex align-items-center gap-1"
                                                                                                >
                                                                                                    <i className="bi bi-file-earmark-text"></i>{" "}
                                                                                                    View
                                                                                                    File
                                                                                                </a>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ),
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
                            ))
                        ) : (
                            <div className="text-center py-5">
                                <i className="bi bi-clipboard-x display-1 text-muted opacity-25"></i>

                                <p className="mt-3 text-muted">
                                    No assignments found for this
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