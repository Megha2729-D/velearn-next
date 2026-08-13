"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

const BASE_API_URL = "https://velearn.in/velearn-crm/api/";
const BASE_UPLOAD_URL_MAIN =
    "https://velearn.in/velearn-crm/uploads/main_projects/";
const BASE_UPLOAD_URL_MINI =
    "https://velearn.in/velearn-crm/public/uploads/mini_projects/";

type ProjectType = "mini" | "main";

interface Breakdown {
    criterion: string;
    obtained_score: number;
    max_score: number;
}

interface AttemptHistory {
    attempt: number;
    score?: number;
    grade?: string;
    feedback?: string;
    evaluated_at?: string;
    breakdowns?: Breakdown[];
}

interface Submission {
    status?: string;
    score: number | null;
    grade?: string;
    attempts: number;
    file_path?: string;
    feedback?: string;
    reupload_approved?: number;
    updated_at?: string;
    scoreBreakdowns?: Breakdown[];
    attempts_history?: AttemptHistory[];
}

interface Project {
    id: number | string;
    title: string;
    module?: string;
    description?: string;
    due_date?: string;
    reveal_date?: string;
    submission?: Submission | null;
}

interface ProcessedProject extends Project {
    isSubmitted: boolean;
    status: string;
    scoreText: string;
    detailText: string;
    deadline: string;
    revealDateFormatted: string;
    isOverdue: boolean;
}

const getFileExtension = (filename?: string) => {
    return filename
        ? filename.split(".").pop()?.toLowerCase() || ""
        : "";
};

const isImageFile = (filename?: string) => {
    const ext = getFileExtension(filename);

    return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
};

const getFileIconClass = (filename?: string) => {
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

const Projects = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const [activeTab, setActiveTab] =
        useState<ProjectType>("mini");

    const [mainProjects, setMainProjects] = useState<Project[]>([]);
    const [miniProjects, setMiniProjects] = useState<Project[]>([]);

    const [loading, setLoading] = useState(true);

    const [expandedBriefId, setExpandedBriefId] =
        useState<number | string | null>(null);

    const [userId, setUserId] = useState<string | number | null>(null);
    const [token, setToken] = useState<string | null>(null);

    /*
     * Get user/token from localStorage
     * Only runs in browser.
     */
    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        const storedUser = JSON.parse(
            localStorage.getItem("user") || "{}"
        );

        const currentUserId =
            storedUser?.id || storedUser?.auth_id || null;

        setToken(storedToken);
        setUserId(currentUserId);
    }, []);

    /*
     * Fetch projects after userId is available.
     */
    useEffect(() => {
        if (userId) {
            fetchProjects();
        } else if (userId === null) {
            // Wait until localStorage has been checked.
        }
    }, [userId]);

    const fetchProjects = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const headers = token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {};

            const [mainRes, miniRes] = await Promise.all([
                axios.get(
                    `${BASE_API_URL}my-main-projects/${userId}`,
                    { headers }
                ),

                axios.get(
                    `${BASE_API_URL}my-mini-projects/${userId}`,
                    { headers }
                ),
            ]);

            if (mainRes.data?.status === "success") {
                setMainProjects(mainRes.data.data || []);
            }

            if (miniRes.data?.status === "success") {
                setMiniProjects(miniRes.data.data || []);
            }
        } catch (error: any) {
            console.error("Error fetching projects:", error);

            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                "Unknown error";

            toast.error(`Failed to load projects: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    /*
     * Upload project submission.
     */
    const handleUpload = async (
        projectId: number | string,
        file: File | undefined,
        type: ProjectType
    ) => {
        if (!file || !userId) return;

        const formData = new FormData();

        formData.append("file", file);

        const uploadPromise = axios.post(
            `${BASE_API_URL}${type}-projects/${userId}/${projectId}/submit`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",

                    ...(token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {}),
                },
            }
        );

        toast
            .promise(uploadPromise, {
                loading: "Uploading submission...",

                success: (res) =>
                    res.data?.message ||
                    "Submission uploaded successfully!",

                error: (err) =>
                    err?.response?.data?.message ||
                    "Upload failed.",
            })
            .then(() => {
                fetchProjects();
            })
            .catch((err) => {
                console.error("Upload error:", err);
            });
    };

    /*
     * Convert API project data into UI-friendly data.
     */
    const processProject = (
        project: Project
    ): ProcessedProject => {
        const isSubmitted = !!project.submission;

        let projectStatus = "pending";
        let projectScoreText = "Pending";
        let detailText = "";

        if (isSubmitted && project.submission) {
            projectStatus =
                project.submission.status || "pending";

            if (
                projectStatus === "graded" ||
                projectStatus === "evaluated"
            ) {
                projectScoreText =
                    project.submission.score !== null &&
                        project.submission.score !== undefined
                        ? `Score: ${project.submission.score}%`
                        : "Evaluated";

                detailText = project.submission.grade
                    ? `Grade: ${project.submission.grade}`
                    : "";
            } else if (projectStatus === "late") {
                projectScoreText = "Late Submission";
            } else {
                projectScoreText = "Submitted";
            }
        } else {
            if (
                project.due_date &&
                new Date(project.due_date).setHours(
                    23,
                    59,
                    59,
                    999
                ) < new Date().getTime()
            ) {
                projectStatus = "late";
                projectScoreText = "Overdue";
            }
        }

        return {
            ...project,

            isSubmitted,

            status: projectStatus,

            scoreText: projectScoreText,

            detailText,

            deadline: project.due_date
                ? new Date(project.due_date).toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }
                )
                : "No Deadline",

            revealDateFormatted: project.reveal_date
                ? new Date(
                    project.reveal_date
                ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                : "Immediate",

            isOverdue:
                projectStatus === "late" && !isSubmitted,
        };
    };

    const displayedProjects: ProcessedProject[] = (
        activeTab === "main"
            ? mainProjects
            : miniProjects
    ).map(processProject);

    const getUploadUrl = (
        filename: string
    ) => {
        return `${activeTab === "main"
            ? BASE_UPLOAD_URL_MAIN
            : BASE_UPLOAD_URL_MINI
            }${filename}`;
    };

    /*
     * Render upload button for main project reviews.
     */
    const renderUploadBtn = (
        item: ProcessedProject,
        currentAttempt: number,
        attemptNumber: number
    ) => {
        return (
            <label
                className="btn_submit_review"
                style={{
                    cursor: "pointer",
                    margin: 0,
                }}
            >
                {item.isSubmitted &&
                    currentAttempt === attemptNumber
                    ? `Resubmit Review ${attemptNumber}`
                    : `Submit for Review ${attemptNumber}`}

                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.webp"
                    style={{ display: "none" }}
                    onChange={(e) =>
                        handleUpload(
                            item.id,
                            e.target.files?.[0],
                            activeTab
                        )
                    }
                />
            </label>
        );
    };

    return (
        <div className="dashboard_layout">
            {/* Sidebar */}
            <Sidebar
                activePage="projects"
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* Mobile sidebar overlay */}
            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* Notifications */}
            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() =>
                    setIsNotifOpen(false)
                }
                notifications={[]}
            />

            {/* Main content */}
            <div className="dashboard_main_content">
                {/* Header */}
                <header className="dashboard_top_header">
                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses{" "}
                            <span>/ Projects</span>
                        </h2>
                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() =>
                            setIsNotifOpen(true)
                        }
                    >
                        <i className="bi bi-bell"></i>
                    </div>
                </header>

                <div className="assignments_container">
                    {/* Tabs */}
                    <div
                        className="assignments_tabs"
                        style={{
                            marginBottom: "20px",
                        }}
                    >
                        <button
                            className={`tab_btn text-center justify-content-center ${activeTab === "mini"
                                ? "active"
                                : ""
                                }`}
                            onClick={() =>
                                setActiveTab("mini")
                            }
                        >
                            Mini Projects
                        </button>

                        <button
                            className={`tab_btn text-center justify-content-center ${activeTab === "main"
                                ? "active"
                                : ""
                                }`}
                            onClick={() =>
                                setActiveTab("main")
                            }
                        >
                            Main Projects
                        </button>
                    </div>

                    {/* Project list */}
                    <div className="assignment_list">
                        {loading ? (
                            <div className="text-center py-5">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                            </div>
                        ) : displayedProjects.length > 0 ? (
                            displayedProjects.map((item) => {
                                /*
                                 * ============================
                                 * MINI PROJECTS
                                 * ============================
                                 */
                                if (activeTab === "mini") {
                                    return (
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
                                                            <i className="bi bi-layers"></i>{" "}
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

                                                    {/* Badges */}
                                                    <div className="badge_group">
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

                                                        {(item.status ===
                                                            "graded" ||
                                                            item.status ===
                                                            "evaluated") &&
                                                            item.submission
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
                                                                    Reupload Pending
                                                                </span>
                                                            )}

                                                        {item.isSubmitted ? (
                                                            <span
                                                                className={`submission_status_badge submitted ${item.status}`}
                                                            >
                                                                <i className="bi bi-check-circle-fill"></i>{" "}
                                                                {item.status ===
                                                                    "late"
                                                                    ? "Submitted Late"
                                                                    : "Submitted"}

                                                                {item.submission
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
                                                                Pending Submission
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Description */}
                                                    <p
                                                        className="mt-3 mb-1 text-secondary"
                                                        style={{
                                                            fontSize:
                                                                "13.5px",
                                                            lineHeight: "1.6",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {item.description}
                                                    </p>

                                                    {/* Submitted file */}
                                                    {item.isSubmitted &&
                                                        item.submission
                                                            ?.file_path && (
                                                            <div className="submitted_file_container mt-3">
                                                                {isImageFile(
                                                                    item.submission
                                                                        .file_path
                                                                ) ? (
                                                                    <div
                                                                        className="assignment_image_preview_box border rounded p-2"
                                                                        style={{
                                                                            width:
                                                                                "fit-content",
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="position-relative preview_image_wrapper"
                                                                            style={{
                                                                                borderRadius:
                                                                                    "6px",
                                                                                overflow:
                                                                                    "hidden",
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={getUploadUrl(
                                                                                    item
                                                                                        .submission
                                                                                        .file_path
                                                                                )}
                                                                                alt="Submission Preview"
                                                                                style={{
                                                                                    height:
                                                                                        "100px",
                                                                                    width:
                                                                                        "auto",
                                                                                    objectFit:
                                                                                        "cover",
                                                                                }}
                                                                            />

                                                                            <div
                                                                                className="preview_overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
                                                                                style={{
                                                                                    opacity: 0,
                                                                                    transition:
                                                                                        "opacity 0.2s",
                                                                                    cursor:
                                                                                        "pointer",
                                                                                }}
                                                                                onClick={() =>
                                                                                    window.open(
                                                                                        getUploadUrl(
                                                                                            item
                                                                                                .submission!
                                                                                                .file_path!
                                                                                        ),
                                                                                        "_blank"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <i className="bi bi-eye text-white fs-4"></i>
                                                                            </div>
                                                                        </div>

                                                                        <div className="small text-muted mt-2 d-flex justify-content-between align-items-center">
                                                                            <span
                                                                                className="text-truncate"
                                                                                style={{
                                                                                    maxWidth:
                                                                                        "150px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item
                                                                                        .submission
                                                                                        .file_path
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <a
                                                                        href={getUploadUrl(
                                                                            item
                                                                                .submission
                                                                                .file_path
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn_download_file d-inline-flex align-items-center gap-2 p-2 border rounded text-decoration-none"
                                                                    >
                                                                        <div className="file_icon_large">
                                                                            <i
                                                                                className={`bi ${getFileIconClass(
                                                                                    item
                                                                                        .submission
                                                                                        .file_path
                                                                                )} fs-3`}
                                                                            ></i>
                                                                        </div>

                                                                        <div className="file_details">
                                                                            <span
                                                                                className="d-block text-dark fw-bold text-truncate"
                                                                                style={{
                                                                                    maxWidth:
                                                                                        "200px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item
                                                                                        .submission
                                                                                        .file_path
                                                                                }
                                                                            </span>

                                                                            <span className="d-block text-muted small text-uppercase">
                                                                                {
                                                                                    getFileExtension(
                                                                                        item
                                                                                            .submission
                                                                                            .file_path
                                                                                    )
                                                                                }{" "}
                                                                                File
                                                                            </span>
                                                                        </div>

                                                                        <div className="ms-2">
                                                                            <i className="bi bi-download text-primary"></i>
                                                                        </div>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}

                                                    {/* Actions */}
                                                    <div className="as_actions mt-4">
                                                        {(!item.isSubmitted ||
                                                            item.submission
                                                                ?.reupload_approved ===
                                                            1) &&
                                                            (item.submission &&
                                                                item.submission
                                                                    .attempts >=
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
                                                                            } me-1`}
                                                                    ></i>

                                                                    {item.isSubmitted
                                                                        ? item.status ===
                                                                            "late"
                                                                            ? `Resubmit Late (Attempt ${(item
                                                                                .submission
                                                                                ?.attempts ||
                                                                                0) + 1
                                                                            }/3)`
                                                                            : `Resubmit (Attempt ${(item
                                                                                .submission
                                                                                ?.attempts ||
                                                                                0) + 1
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
                                                                        ) =>
                                                                            handleUpload(
                                                                                item.id,
                                                                                e.target
                                                                                    .files?.[0],
                                                                                activeTab
                                                                            )
                                                                        }
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
                                                                        : item.id
                                                                )
                                                            }
                                                        >
                                                            {expandedBriefId ===
                                                                item.id
                                                                ? "Hide Feedback"
                                                                : "View Details & History"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div
                                                    className={`as_status_badge ${item.status}`}
                                                >
                                                    {item.scoreText}
                                                </div>
                                            </div>

                                            {/* Feedback/history */}
                                            {expandedBriefId ===
                                                item.id && (
                                                    <div className="assignment_brief_box mt-3 p-3 border-top bg-light rounded-bottom">
                                                        {item.submission &&
                                                            (item.submission
                                                                .score !== null ||
                                                                (item.submission
                                                                    .attempts_history &&
                                                                    item.submission
                                                                        .attempts_history
                                                                        .length >
                                                                    0)) ? (
                                                            <div>
                                                                <div className="brief_header fw-bold text-primary">
                                                                    <i className="bi bi-clipboard2-check-fill"></i>{" "}
                                                                    Evaluation
                                                                    Feedback &
                                                                    History
                                                                </div>

                                                                <div className="brief_body mt-3">
                                                                    {/* Latest evaluation */}
                                                                    {item.submission
                                                                        .score !==
                                                                        null && (
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
                                                                                            <div className="fw-bold text-muted small mb-2 text-uppercase">
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

                                                                                {item
                                                                                    .submission
                                                                                    .feedback && (
                                                                                        <div className="mt-2">
                                                                                            <div className="fw-bold text-muted small mb-1 text-uppercase">
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

                                                                    {/* Previous attempts */}
                                                                    {item.submission
                                                                        .attempts_history &&
                                                                        item.submission
                                                                            .attempts_history
                                                                            .length >
                                                                        0 && (
                                                                            <div className="mt-4">
                                                                                <h6 className="fw-bold text-muted small text-uppercase mb-3">
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
                                                                                                        {hist.feedback ||
                                                                                                            "None"}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )
                                                                                        )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted text-center py-3">
                                                                No feedback or
                                                                evaluation
                                                                history available
                                                                yet.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    );
                                }

                                /*
                                 * ============================
                                 * MAIN PROJECTS
                                 * ============================
                                 */

                                const history =
                                    item.submission
                                        ?.attempts_history || [];

                                const attempt1: AttemptHistory | null =
                                    history.find((h) => h.attempt === 1) ||
                                    (item.submission?.attempts === 1 &&
                                        item.submission.score !== null &&
                                        item.submission.score !== undefined
                                        ? {
                                            attempt: 1,
                                            score: item.submission.score,
                                            grade: item.submission.grade,
                                            feedback: item.submission.feedback,
                                            evaluated_at: item.submission.updated_at,
                                            breakdowns: item.submission.scoreBreakdowns,
                                        }
                                        : null);

                                const attempt2: AttemptHistory | null =
                                    history.find((h) => h.attempt === 2) ||
                                    (item.submission?.attempts === 2 &&
                                        item.submission.score !== null &&
                                        item.submission.score !== undefined
                                        ? {
                                            attempt: 2,
                                            score: item.submission.score,
                                            grade: item.submission.grade,
                                            feedback: item.submission.feedback,
                                            evaluated_at: item.submission.updated_at,
                                            breakdowns: item.submission.scoreBreakdowns,
                                        }
                                        : null);

                                const attempt3: AttemptHistory | null =
                                    history.find((h) => h.attempt === 3) ||
                                    (item.submission?.attempts === 3 &&
                                        item.submission.score !== null &&
                                        item.submission.score !== undefined
                                        ? {
                                            attempt: 3,
                                            score: item.submission.score,
                                            grade: item.submission.grade,
                                            feedback: item.submission.feedback,
                                            evaluated_at: item.submission.updated_at,
                                            breakdowns: item.submission.scoreBreakdowns,
                                        }
                                        : null);
                                        
                                const currentAttempt =
                                    item.submission
                                        ? item.submission.attempts
                                        : 1;

                                const isCurrentEvaluated =
                                    item.submission?.score !==
                                    null &&
                                    item.submission?.score !==
                                    undefined;

                                let step1State =
                                    "locked";

                                if (attempt1) {
                                    step1State = "completed";
                                } else if (
                                    currentAttempt === 1 &&
                                    !isCurrentEvaluated
                                ) {
                                    step1State = "active";
                                } else if (!item.isSubmitted) {
                                    step1State = "active";
                                }

                                let step2State =
                                    "locked";

                                if (attempt2) {
                                    step2State = "completed";
                                } else if (
                                    currentAttempt === 2 &&
                                    !isCurrentEvaluated
                                ) {
                                    step2State = "active";
                                } else if (
                                    attempt1 &&
                                    currentAttempt === 1 &&
                                    isCurrentEvaluated
                                ) {
                                    step2State = "active";
                                }

                                let step3State =
                                    "locked";

                                if (attempt3) {
                                    step3State = "completed";
                                } else if (
                                    currentAttempt === 3 &&
                                    !isCurrentEvaluated
                                ) {
                                    step3State = "active";
                                } else if (
                                    attempt2 &&
                                    currentAttempt === 2 &&
                                    isCurrentEvaluated
                                ) {
                                    step3State = "active";
                                }

                                const evaluatedDate = (
                                    attempt?: AttemptHistory | null
                                ) => {
                                    if (!attempt?.evaluated_at) {
                                        return "";
                                    }

                                    return new Date(
                                        attempt.evaluated_at
                                    ).toLocaleDateString(
                                        "en-GB",
                                        {
                                            month: "short",
                                            day: "numeric",
                                        }
                                    );
                                };

                                return (
                                    <div
                                        key={item.id}
                                        className="main_project_card mb-4"
                                    >
                                        {/* Main project header */}
                                        <div className="mp_header">
                                            <div>
                                                <h3 className="mp_title">
                                                    {item.title}
                                                </h3>

                                                <p className="mp_subtitle">
                                                    {item.module} •
                                                    3-review cycle
                                                </p>
                                            </div>

                                            <div className="mp_status">
                                                <span className="status_badge bg_light_blue text_primary">
                                                    Review{" "}
                                                    {currentAttempt}/3 -{" "}
                                                    {item.isSubmitted
                                                        ? isCurrentEvaluated
                                                            ? "Evaluated"
                                                            : "In Progress"
                                                        : "Not Started"}
                                                </span>

                                                <span className="deadline_badge text_warning mt-2">
                                                    <i className="bi bi-alarm"></i>{" "}
                                                    Deadline:{" "}
                                                    {item.deadline}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stepper */}
                                        <div className="stepper_container">
                                            <div
                                                className={`step ${step1State}`}
                                            >
                                                <div className="step_icon">
                                                    {step1State ===
                                                        "completed" ? (
                                                        <i className="bi bi-check"></i>
                                                    ) : (
                                                        "1"
                                                    )}
                                                </div>

                                                <div className="step_label">
                                                    Review 1
                                                </div>

                                                <div className="step_date">
                                                    {attempt1
                                                        ? evaluatedDate(
                                                            attempt1
                                                        )
                                                        : step1State ===
                                                            "active"
                                                            ? "Active"
                                                            : ""}
                                                </div>
                                            </div>

                                            <div
                                                className={`step_line ${step1State ===
                                                    "completed"
                                                    ? "completed_line"
                                                    : ""
                                                    }`}
                                            />

                                            <div
                                                className={`step ${step2State}`}
                                            >
                                                <div className="step_icon">
                                                    {step2State ===
                                                        "completed" ? (
                                                        <i className="bi bi-check"></i>
                                                    ) : (
                                                        "2"
                                                    )}
                                                </div>

                                                <div className="step_label">
                                                    Review 2
                                                </div>

                                                <div className="step_date">
                                                    {attempt2
                                                        ? evaluatedDate(
                                                            attempt2
                                                        )
                                                        : step2State ===
                                                            "active"
                                                            ? "Upcoming"
                                                            : ""}
                                                </div>
                                            </div>

                                            <div
                                                className={`step_line ${step2State ===
                                                    "completed"
                                                    ? "completed_line"
                                                    : ""
                                                    }`}
                                            />

                                            <div
                                                className={`step ${step3State}`}
                                            >
                                                <div className="step_icon">
                                                    {step3State ===
                                                        "completed" ? (
                                                        <i className="bi bi-check"></i>
                                                    ) : (
                                                        "3"
                                                    )}
                                                </div>

                                                <div className="step_label">
                                                    Review 3
                                                </div>

                                                <div className="step_date">
                                                    {attempt3
                                                        ? evaluatedDate(
                                                            attempt3
                                                        )
                                                        : step3State ===
                                                            "active"
                                                            ? "Upcoming"
                                                            : ""}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reviews */}
                                        <div className="reviews_list">
                                            {/* Review 1 */}
                                            {step1State ===
                                                "completed" ? (
                                                <div className="review_card review_completed">
                                                    <h4 className="rc_title mb-2">
                                                        Review 1 —{" "}
                                                        <span className="text_success_dark">
                                                            <i className="bi bi-check-circle-fill"></i>{" "}
                                                            Completed •{" "}
                                                            {evaluatedDate(
                                                                attempt1
                                                            )}
                                                        </span>
                                                    </h4>

                                                    <p className="rc_desc">
                                                        {attempt1?.feedback ||
                                                            "Good job. Proceed to Review 2."}
                                                    </p>
                                                </div>
                                            ) : step1State ===
                                                "active" ? (
                                                <div className="review_card review_active">
                                                    <h4 className="rc_title mb-2">
                                                        Review 1 —
                                                        Upcoming •{" "}
                                                        {item.deadline}
                                                    </h4>

                                                    <p className="rc_desc">
                                                        {item.description ||
                                                            "Focus: Initial structure and core components."}
                                                    </p>

                                                    <div className="rc_actions">
                                                        {renderUploadBtn(
                                                            item,
                                                            currentAttempt,
                                                            1
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="review_card review_locked">
                                                    <h4 className="text_muted m-0">
                                                        Review 1 —
                                                        Locked
                                                    </h4>
                                                </div>
                                            )}

                                            {/* Review 2 */}
                                            {step2State ===
                                                "completed" ? (
                                                <div className="review_card review_completed">
                                                    <h4 className="rc_title mb-2">
                                                        Review 2 —{" "}
                                                        <span className="text_success_dark">
                                                            <i className="bi bi-check-circle-fill"></i>{" "}
                                                            Completed •{" "}
                                                            {evaluatedDate(
                                                                attempt2
                                                            )}
                                                        </span>
                                                    </h4>

                                                    <p className="rc_desc">
                                                        {attempt2?.feedback ||
                                                            "Good progress. Proceed to Review 3."}
                                                    </p>
                                                </div>
                                            ) : step2State ===
                                                "active" ? (
                                                <div className="review_card review_active">
                                                    <h4 className="rc_title mb-2">
                                                        Review 2 —
                                                        Upcoming
                                                    </h4>

                                                    <p className="rc_desc">
                                                        Please address
                                                        the feedback
                                                        from Review 1.
                                                    </p>

                                                    <div className="rc_actions">
                                                        {renderUploadBtn(
                                                            item,
                                                            currentAttempt,
                                                            2
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="review_card review_locked">
                                                    <h4 className="text_muted m-0">
                                                        Review 2 —
                                                        Locked
                                                    </h4>
                                                </div>
                                            )}

                                            {/* Review 3 */}
                                            {step3State ===
                                                "completed" ? (
                                                <div className="review_card review_completed">
                                                    <h4 className="rc_title mb-2">
                                                        Review 3 —{" "}
                                                        <span className="text_success_dark">
                                                            <i className="bi bi-check-circle-fill"></i>{" "}
                                                            Completed •{" "}
                                                            {evaluatedDate(
                                                                attempt3
                                                            )}
                                                        </span>
                                                    </h4>

                                                    <p className="rc_desc">
                                                        {attempt3?.feedback ||
                                                            "Final evaluation complete."}
                                                    </p>
                                                </div>
                                            ) : step3State ===
                                                "active" ? (
                                                <div className="review_card review_active">
                                                    <h4 className="rc_title mb-2">
                                                        Review 3 —
                                                        Upcoming
                                                    </h4>

                                                    <p className="rc_desc">
                                                        Final submission
                                                        & complete
                                                        evaluation.
                                                    </p>

                                                    <div className="rc_actions">
                                                        {renderUploadBtn(
                                                            item,
                                                            currentAttempt,
                                                            3
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="review_card review_locked">
                                                    <h4 className="text_muted m-0">
                                                        Review 3 —
                                                        Locked
                                                    </h4>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-5">
                                <i className="bi bi-clipboard-x display-1 text-muted opacity-25"></i>

                                <p className="mt-3 text-muted">
                                    No {activeTab} projects
                                    found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image preview hover */}
            <style jsx>{`
        .preview_image_wrapper:hover
          .preview_overlay {
          opacity: 1 !important;
        }
      `}</style>
        </div>
    );
};

export default Projects;