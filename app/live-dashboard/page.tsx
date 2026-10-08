"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    CircularProgressbar,
    buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";

type User = {
    id: number | string;
    name: string;
    course_title?: string;
    batch_string?: string;
};

type ProgressData = {
    course_progress: number;
    completed_modules: number;
    total_modules: number;
};

type AssignmentsData = {
    total: number;
    submitted: number;
    avg_score: number;
};

type AttendanceItem = {
    day: number;
    status: string;
};

type AttendanceSummary = {
    present: number;
    absent: number;
    no_class: number;
    percentage: number;
};

type MiniProject = {
    id: number | string;
    name: string;
    module?: string;
    submitted_date?: string;
    status: string;
    score: number;
    progress: number;
};

type Milestone = {
    title: string;
    date: string;
    status: string;
    score: number;
    desc: string;
};

type MainProject = {
    id: number | string;
    title: string;
    review: string;
    milestones: Milestone[];
};

type DashboardData = {
    user: User;
    progress: ProgressData;
    assignments: AssignmentsData;
    mini_projects: MiniProject[];
    main_projects: MainProject[];
    attendance: AttendanceItem[];
    attendance_summary: AttendanceSummary;
};

const LiveDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    const [isNotifOpen, setIsNotifOpen] =
        useState(false);

    const [dashboardData, setDashboardData] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] = useState(true);

    /*
     * ------------------------------------------------------
     * FETCH DASHBOARD DATA
     * ------------------------------------------------------
     */

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userString =
                    localStorage.getItem("user");

                if (!userString) {
                    setLoading(false);
                    return;
                }

                const userLocal: User =
                    JSON.parse(userString);

                if (!userLocal?.id) {
                    setLoading(false);
                    return;
                }

                const res = await axios.get(
                    `${BASE_API_URL}live-dashboard/${userLocal.id}`
                );

                if (res.data?.status) {
                    setDashboardData(res.data.data);
                }
            } catch (error) {
                console.error(
                    "Error fetching live dashboard data",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    /*
     * ------------------------------------------------------
     * LOADING
     * ------------------------------------------------------
     */

    if (loading) {
        return (
            <div className="dashboard_layout">
                <Sidebar
                    activePage="live-dash"
                    isOpen={isSidebarOpen}
                    onClose={() =>
                        setIsSidebarOpen(false)
                    }
                />

                <div
                    className="dashboard_main_content d-flex justify-content-center align-items-center"
                    style={{
                        minHeight: "100vh",
                    }}
                >
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * ------------------------------------------------------
     * NO DATA
     * ------------------------------------------------------
     */

    if (!dashboardData) {
        return (
            <div className="dashboard_layout">
                <Sidebar
                    activePage="live-dash"
                    isOpen={isSidebarOpen}
                    onClose={() =>
                        setIsSidebarOpen(false)
                    }
                />

                <div
                    className="sidebar_overlay"
                    onClick={() =>
                        setIsSidebarOpen(false)
                    }
                />

                <div className="dashboard_main_content d-flex justify-content-center align-items-center">
                    <div className="text-center">
                        <i className="bi bi-exclamation-circle display-4 text-muted"></i>

                        <h5 className="mt-3">
                            Unable to load dashboard
                        </h5>

                        <p className="text-muted">
                            Please try again later.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * ------------------------------------------------------
     * DATA
     * ------------------------------------------------------
     */

    const {
        user,
        progress,
        assignments,
        mini_projects,
        main_projects,
        attendance,
        attendance_summary,
    } = dashboardData;

    const assignmentPercentage =
        assignments.total > 0
            ? Math.round(
                (assignments.submitted /
                    assignments.total) *
                100
            )
            : 0;

    /*
     * ------------------------------------------------------
     * RENDER
     * ------------------------------------------------------
     */

    return (
        <div className="dashboard_layout">
            {/* SIDEBAR */}

            <Sidebar
                activePage="live-dash"
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* MOBILE SIDEBAR OVERLAY */}

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(false)
                }
            ></div>

            {/* NOTIFICATIONS */}

            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() =>
                    setIsNotifOpen(false)
                }
                notifications={[]}
            />

            {/* MAIN CONTENT */}

            <div className="dashboard_main_content">
                {/* HEADER */}

                <header className="dashboard_top_header">
                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses{" "}
                            <span>/ Dashboard</span>
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

                {/* DASHBOARD */}

                <div className="live_dashboard_container">
                    {/* ---------------------------------------- */}
                    {/* WELCOME BANNER */}
                    {/* ---------------------------------------- */}

                    <div className="welcome_stats_banner">
                        <div className="welcome_text">
                            <h1>
                                Good morning,{" "}
                                {user?.name
                                    ? user.name.split(" ")[0]
                                    : "Student"}{" "}
                                ! 👋
                            </h1>

                            <p>
                                {user?.course_title}

                                {user?.batch_string &&
                                    ` • ${user.batch_string}`}
                            </p>
                        </div>
                    </div>

                    {/* ---------------------------------------- */}
                    {/* PROGRESS OVERVIEW */}
                    {/* ---------------------------------------- */}

                    <div className="progress_grid_row row mt-4">
                        {/* COURSE PROGRESS */}

                        <div className="col-lg-6">
                            <div className="stat_card_new">
                                <div className="d-flex align-items-center gap-4">
                                    <div
                                        style={{
                                            width: 80,
                                            height: 80,
                                        }}
                                    >
                                        <CircularProgressbar
                                            value={
                                                progress.course_progress
                                            }
                                            text={`${progress.course_progress}%`}
                                            styles={buildStyles({
                                                textColor: "#0f172a",
                                                pathColor: "#3b82f6",
                                                trailColor: "#f1f5f9",
                                            })}
                                        />
                                    </div>

                                    <div className="stat_info">
                                        <h4>
                                            Course Progress
                                        </h4>

                                        <p>
                                            {
                                                progress.completed_modules
                                            }{" "}
                                            of{" "}
                                            {progress.total_modules}{" "}
                                            modules complete
                                        </p>

                                        <div className="d-flex gap-3 small mt-2">
                                            <span className="text-primary">
                                                • Completed:{" "}
                                                {
                                                    progress.completed_modules
                                                }
                                            </span>

                                            <span className="text-muted">
                                                • Remaining:{" "}
                                                {Math.max(
                                                    0,
                                                    progress.total_modules -
                                                    progress.completed_modules
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ASSIGNMENTS */}

                        <div className="col-lg-6">
                            <div className="stat_card_new">
                                <div className="d-flex align-items-center gap-4">
                                    <div
                                        style={{
                                            width: 80,
                                            height: 80,
                                        }}
                                    >
                                        <CircularProgressbar
                                            value={
                                                assignmentPercentage
                                            }
                                            text={`${assignmentPercentage}%`}
                                            styles={buildStyles({
                                                textColor: "#0f172a",
                                                pathColor: "#8b5cf6",
                                                trailColor: "#f1f5f9",
                                            })}
                                        />
                                    </div>

                                    <div className="stat_info">
                                        <h4>Assignments</h4>

                                        <p>
                                            {assignments.submitted}{" "}
                                            of {assignments.total}{" "}
                                            submitted • Avg{" "}
                                            {assignments.avg_score}%
                                        </p>

                                        <div className="d-flex gap-3 small mt-2">
                                            <span className="text-purple">
                                                • Submitted:{" "}
                                                {
                                                    assignments.submitted
                                                }
                                            </span>

                                            <span className="text-danger">
                                                • Pending:{" "}
                                                {Math.max(
                                                    0,
                                                    assignments.total -
                                                    assignments.submitted
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---------------------------------------- */}
                    {/* ATTENDANCE + MINI PROJECTS */}
                    {/* ---------------------------------------- */}

                    <div className="row mt-4">
                        {/* ATTENDANCE */}

                        <div className="col-lg-6">
                            <div className="attendance_card">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h3 className="section_title_sm">
                                        <i className="bi bi-calendar-check me-2"></i>

                                        Attendance —{" "}
                                        {new Date().toLocaleString(
                                            "default",
                                            {
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )}
                                    </h3>

                                    <div className="calendar_legend d-flex gap-3">
                                        <span>
                                            <span className="dot green"></span>{" "}
                                            Present
                                        </span>

                                        <span>
                                            <span className="dot red"></span>{" "}
                                            Absent
                                        </span>

                                        <span>
                                            <span className="dot gray"></span>{" "}
                                            No Class
                                        </span>
                                    </div>
                                </div>

                                <div className="calendar_grid">
                                    {[
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                        "Sun",
                                    ].map((day) => (
                                        <div
                                            key={day}
                                            className="calendar_day_label"
                                        >
                                            {day}
                                        </div>
                                    ))}

                                    {attendance?.map((item) => (
                                        <div
                                            key={item.day}
                                            className={`calendar_day ${item.status}`}
                                        >
                                            {item.day}
                                        </div>
                                    ))}
                                </div>

                                <div className="calendar_footer mt-4 d-flex justify-content-between">
                                    <div className="d-flex gap-3">
                                        <span className="text-success small fw-bold">
                                            ✓ Present:{" "}
                                            {
                                                attendance_summary.present
                                            }
                                        </span>

                                        <span className="text-danger small fw-bold">
                                            ✗ Absent:{" "}
                                            {
                                                attendance_summary.absent
                                            }
                                        </span>

                                        <span className="text-muted small fw-bold">
                                            No Class:{" "}
                                            {
                                                attendance_summary.no_class
                                            }
                                        </span>
                                    </div>

                                    <div className="small fw-bold">
                                        Attendance:{" "}
                                        <span className="text-primary">
                                            {
                                                attendance_summary.percentage
                                            }%
                                        </span>{" "}
                                        <span className="text-muted">
                                            (Min: 75%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MINI PROJECTS */}

                        <div className="col-lg-6">
                            <div className="mini_projects_card">
                                <h3 className="section_title_sm mb-4">
                                    <i className="bi bi-diamond me-2"></i>
                                    Mini Projects
                                </h3>

                                <div className="project_list">
                                    {mini_projects &&
                                        mini_projects.length > 0 ? (
                                        mini_projects.map(
                                            (proj, index) => {
                                                const isCompleted =
                                                    proj.status ===
                                                    "Completed";

                                                const isPending =
                                                    proj.status ===
                                                    "Pending";

                                                const isChangesNeeded =
                                                    !isCompleted &&
                                                    !isPending;

                                                return (
                                                    <div
                                                        key={proj.id}
                                                        className={`project_item ${index > 0
                                                            ? "mt-4"
                                                            : ""
                                                            }`}
                                                    >
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <div className="p_info">
                                                                <div className="p_name">
                                                                    {proj.name}
                                                                </div>

                                                                <div className="p_meta">
                                                                    Module:{" "}
                                                                    {proj.module}{" "}
                                                                    {proj.submitted_date
                                                                        ? `• Submitted ${proj.submitted_date}`
                                                                        : isPending
                                                                            ? "• Not Submitted Yet"
                                                                            : "• Resubmission Pending"}
                                                                </div>
                                                            </div>

                                                            <div
                                                                className={`p_score ${isCompleted
                                                                    ? "text-success"
                                                                    : isPending
                                                                        ? "text-secondary"
                                                                        : "text-danger"
                                                                    }`}
                                                            >
                                                                <span className="score_val">
                                                                    {isPending
                                                                        ? "--"
                                                                        : `${proj.score}%`}
                                                                </span>

                                                                <span className="score_label">
                                                                    SCORE
                                                                </span>

                                                                <div className="mt-1">
                                                                    {isCompleted ? (
                                                                        <>
                                                                            <i className="bi bi-check-circle-fill"></i>{" "}
                                                                            Completed
                                                                        </>
                                                                    ) : isPending ? (
                                                                        <>
                                                                            <i className="bi bi-clock-fill"></i>{" "}
                                                                            Pending
                                                                            Submission
                                                                        </>
                                                                    ) : isChangesNeeded ? (
                                                                        <>
                                                                            <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                                                                            Changes
                                                                            Needed
                                                                        </>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div
                                                            className="progress"
                                                            style={{
                                                                height: 6,
                                                            }}
                                                        >
                                                            <div
                                                                className={`progress-bar ${isCompleted
                                                                    ? "bg-success"
                                                                    : isPending
                                                                        ? "bg-secondary"
                                                                        : "bg-danger"
                                                                    }`}
                                                                style={{
                                                                    width: isPending
                                                                        ? "0%"
                                                                        : `${proj.progress}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )
                                    ) : (
                                        <p className="text-muted">
                                            No mini projects found.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---------------------------------------- */}
                    {/* MAIN PROJECTS */}
                    {/* ---------------------------------------- */}

                    {main_projects?.map((mp) => (
                        <div
                            key={mp.id}
                            className="main_project_card mt-4 mb-5"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="section_title_sm">
                                    <i className="bi bi-rocket-takeoff me-2"></i>

                                    Main Project — {mp.title}
                                </h3>

                                <span className="review_badge">
                                    {mp.review}
                                </span>
                            </div>

                            {/* MILESTONES */}

                            {mp.milestones?.map(
                                (milestone, index) => {
                                    const isCompleted =
                                        milestone.status ===
                                        "Completed";

                                    const isPending =
                                        milestone.status ===
                                        "Pending" &&
                                        milestone.score === 0 &&
                                        milestone.date ===
                                        "Pending";

                                    const isInProgress =
                                        milestone.status ===
                                        "Pending" &&
                                        !isPending;

                                    let barClass =
                                        "bg-success";

                                    let textClass =
                                        "text-success";

                                    let progressValue =
                                        milestone.score;

                                    if (isInProgress) {
                                        barClass = "bg-warning";
                                        textClass =
                                            "text-warning";
                                    } else if (isPending) {
                                        barClass =
                                            "bg-secondary";
                                        textClass = "";
                                        progressValue = 0;
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className={`milestone_item ${index > 0
                                                ? "mt-4"
                                                : ""
                                                } ${isPending
                                                    ? "locked"
                                                    : ""
                                                }`}
                                        >
                                            <div
                                                className={`d-flex justify-content-between mb-2 ${isPending
                                                    ? "opacity-50"
                                                    : ""
                                                    }`}
                                            >
                                                <div
                                                    className={`m_title ${isInProgress
                                                        ? "text-primary"
                                                        : ""
                                                        }`}
                                                >
                                                    {milestone.title} •{" "}
                                                    {milestone.date}

                                                    {isCompleted &&
                                                        " • ✓ Completed"}

                                                    {isInProgress &&
                                                        " • In Progress"}

                                                    {isPending && (
                                                        <>
                                                            <br />

                                                            <i className="bi bi-lock-fill"></i>{" "}
                                                            Locked
                                                        </>
                                                    )}
                                                </div>

                                                <div
                                                    className={`m_score ${textClass}`}
                                                >
                                                    {isPending
                                                        ? "--"
                                                        : `${milestone.score}%`}
                                                </div>
                                            </div>

                                            <div
                                                className="progress mb-2"
                                                style={{
                                                    height: 10,
                                                    opacity:
                                                        isPending
                                                            ? 0.3
                                                            : 1,
                                                }}
                                            >
                                                <div
                                                    className={`progress-bar ${barClass}`}
                                                    style={{
                                                        width: `${progressValue}%`,
                                                    }}
                                                ></div>
                                            </div>

                                            <p
                                                className={`m_desc ${isPending
                                                    ? "opacity-50"
                                                    : ""
                                                    }`}
                                            >
                                                {milestone.desc}
                                            </p>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveDashboard;