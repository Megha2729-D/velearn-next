"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import {
    CircularProgressbar,
    buildStyles,
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";
import "./style.css";

interface AttendanceItem {
    day: number;
    status: "present" | "absent" | "none";
}

const LiveDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    const [isNotifOpen, setIsNotifOpen] =
        useState(false);

    // ==========================================
    // ATTENDANCE DATA
    // ==========================================

    const attendanceData: AttendanceItem[] = [
        { day: 1, status: "present" },
        { day: 2, status: "present" },
        { day: 3, status: "none" },
        { day: 4, status: "present" },
        { day: 5, status: "present" },
        { day: 6, status: "none" },
        { day: 7, status: "none" },

        { day: 8, status: "absent" },
        { day: 9, status: "present" },
        { day: 10, status: "present" },
        { day: 11, status: "absent" },
        { day: 12, status: "present" },
        { day: 13, status: "none" },
        { day: 14, status: "none" },

        { day: 15, status: "present" },
        { day: 16, status: "present" },
        { day: 17, status: "present" },
        { day: 18, status: "absent" },
        { day: 19, status: "present" },
        { day: 20, status: "none" },
        { day: 21, status: "none" },

        { day: 22, status: "none" },
        { day: 23, status: "none" },
        { day: 24, status: "none" },
        { day: 25, status: "none" },
        { day: 26, status: "none" },
        { day: 27, status: "none" },
        { day: 28, status: "none" },

        { day: 29, status: "none" },
        { day: 30, status: "none" },
    ];

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="dashboard_layout">

            {/* ======================================
                SIDEBAR
            ====================================== */}

            <Sidebar
                activePage="live-dash"
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* ======================================
                MOBILE SIDEBAR OVERLAY
            ====================================== */}

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* ======================================
                NOTIFICATIONS
            ====================================== */}

            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() =>
                    setIsNotifOpen(false)
                }
                notifications={[]}
            />

            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <div className="dashboard_main_content">

                {/* ==================================
                    TOP HEADER
                ================================== */}

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

                {/* ==================================
                    LIVE DASHBOARD CONTAINER
                ================================== */}

                <div className="live_dashboard_container">

                    {/* ==================================
                        WELCOME BANNER
                    ================================== */}

                    <div className="welcome_stats_banner">

                        <div className="welcome_text">

                            <h1>
                                Good morning, Arjun! 👋
                            </h1>

                            <p>
                                Full Stack Web Dev • Batch
                                FSW-2024-07
                            </p>

                        </div>

                    </div>

                    {/* ==================================
                        PROGRESS OVERVIEW
                    ================================== */}

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
                                            value={62}
                                            text="62%"
                                            styles={buildStyles(
                                                {
                                                    textColor:
                                                        "#0f172a",
                                                    pathColor:
                                                        "#3b82f6",
                                                    trailColor:
                                                        "#f1f5f9",
                                                }
                                            )}
                                        />
                                    </div>

                                    <div className="stat_info">

                                        <h4>
                                            Course Progress
                                        </h4>

                                        <p>
                                            8 of 13 modules
                                            complete
                                        </p>

                                        <div className="d-flex gap-3 small mt-2">

                                            <span className="text-primary">
                                                • Completed: 8
                                            </span>

                                            <span className="text-muted">
                                                • Remaining: 5
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
                                            value={67}
                                            text="67%"
                                            styles={buildStyles(
                                                {
                                                    textColor:
                                                        "#0f172a",
                                                    pathColor:
                                                        "#8b5cf6",
                                                    trailColor:
                                                        "#f1f5f9",
                                                }
                                            )}
                                        />
                                    </div>

                                    <div className="stat_info">

                                        <h4>
                                            Assignments
                                        </h4>

                                        <p>
                                            12 of 18 submitted
                                            • Avg 78%
                                        </p>

                                        <div className="d-flex gap-3 small mt-2">

                                            <span className="text-purple">
                                                • Submitted: 12
                                            </span>

                                            <span className="text-danger">
                                                • Pending: 6
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* ==================================
                        ATTENDANCE + MINI PROJECTS
                    ================================== */}

                    <div className="row mt-4">

                        {/* ATTENDANCE */}

                        <div className="col-lg-6">

                            <div className="attendance_card">

                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <h3 className="section_title_sm">

                                        <i className="bi bi-calendar-check me-2"></i>

                                        Attendance — April
                                        2025

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

                                {/* CALENDAR */}

                                <div className="calendar_grid">

                                    {[
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                        "Sun",
                                    ].map(
                                        (day) => (
                                            <div
                                                key={day}
                                                className="calendar_day_label"
                                            >
                                                {day}
                                            </div>
                                        )
                                    )}

                                    {attendanceData.map(
                                        (item) => (
                                            <div
                                                key={
                                                    item.day
                                                }
                                                className={`calendar_day ${item.status}`}
                                            >
                                                {
                                                    item.day
                                                }
                                            </div>
                                        )
                                    )}

                                </div>

                                {/* CALENDAR FOOTER */}

                                <div className="calendar_footer mt-4 d-flex justify-content-between">

                                    <div className="d-flex gap-3">

                                        <span className="text-success small fw-bold">
                                            ✓ Present: 11
                                        </span>

                                        <span className="text-danger small fw-bold">
                                            ✗ Absent: 3
                                        </span>

                                        <span className="text-muted small fw-bold">
                                            No Class: 16
                                        </span>

                                    </div>

                                    <div className="small fw-bold">

                                        Attendance:{" "}

                                        <span className="text-primary">
                                            79%
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

                                    {/* PROJECT 1 */}

                                    <div className="project_item">

                                        <div className="d-flex justify-content-between mb-2">

                                            <div className="p_info">

                                                <div className="p_name">
                                                    Mini Project 1 —
                                                    Todo App with
                                                    React
                                                </div>

                                                <div className="p_meta">
                                                    Module: React •
                                                    Submitted Apr 3
                                                </div>

                                            </div>

                                            <div className="p_score text-success">

                                                <span className="score_val">
                                                    90%
                                                </span>

                                                <span className="score_label">
                                                    SCORE
                                                </span>

                                                <div className="mt-1">
                                                    <i className="bi bi-check-circle-fill"></i>{" "}
                                                    Completed
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
                                                className="progress-bar bg-success"
                                                style={{
                                                    width:
                                                        "90%",
                                                }}
                                            ></div>
                                        </div>

                                    </div>

                                    {/* PROJECT 2 */}

                                    <div className="project_item mt-4">

                                        <div className="d-flex justify-content-between mb-2">

                                            <div className="p_info">

                                                <div className="p_name">
                                                    Mini Project 2 —
                                                    Weather Dashboard
                                                </div>

                                                <div className="p_meta">
                                                    Module: APIs •
                                                    Resubmission Pending
                                                </div>

                                            </div>

                                            <div className="p_score text-danger">

                                                <span className="score_val">
                                                    62%
                                                </span>

                                                <span className="score_label">
                                                    SCORE
                                                </span>

                                                <div className="mt-1">
                                                    <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                                                    Changes Needed
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
                                                className="progress-bar bg-danger"
                                                style={{
                                                    width:
                                                        "62%",
                                                }}
                                            ></div>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* ==================================
                        MAIN PROJECT
                    ================================== */}

                    <div className="main_project_card mt-4 mb-5">

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <h3 className="section_title_sm">

                                <i className="bi bi-rocket-takeoff me-2"></i>

                                Main Project — E-Commerce
                                Platform

                            </h3>

                            <span className="review_badge">
                                Review 2 / 3
                            </span>

                        </div>

                        {/* REVIEW 1 */}

                        <div className="milestone_item">

                            <div className="d-flex justify-content-between mb-2">

                                <div className="m_title">
                                    Review 1 • Apr 5 • ✓
                                    Completed
                                </div>

                                <div className="m_score text-success">
                                    85%
                                </div>

                            </div>

                            <div
                                className="progress mb-2"
                                style={{
                                    height: 10,
                                }}
                            >
                                <div
                                    className="progress-bar bg-success"
                                    style={{
                                        width: "85%",
                                    }}
                                ></div>
                            </div>

                            <p className="m_desc">
                                DB schema excellent • Auth
                                flow solid • No major issues
                            </p>

                        </div>

                        {/* REVIEW 2 */}

                        <div className="milestone_item mt-4">

                            <div className="d-flex justify-content-between mb-2">

                                <div className="m_title text-primary">
                                    Review 2 • Apr 20 • In
                                    Progress
                                </div>

                                <div className="m_score text-warning">
                                    42%
                                </div>

                            </div>

                            <div
                                className="progress mb-2"
                                style={{
                                    height: 10,
                                }}
                            >
                                <div
                                    className="progress-bar bg-warning"
                                    style={{
                                        width: "42%",
                                    }}
                                ></div>
                            </div>

                            <p className="m_desc">
                                API integration • Payment
                                module • Input validation
                                pending
                            </p>

                        </div>

                        {/* REVIEW 3 */}

                        <div className="milestone_item mt-4 locked">

                            <div className="d-flex justify-content-between mb-2 opacity-50">

                                <div className="m_title">
                                    Review 3 • May 10 •{" "}
                                    <i className="bi bi-lock-fill"></i>{" "}
                                    Locked
                                </div>

                                <div className="m_score">
                                    --
                                </div>

                            </div>

                            <div
                                className="progress mb-2"
                                style={{
                                    height: 10,
                                    opacity: 0.3,
                                }}
                            >
                                <div
                                    className="progress-bar bg-secondary"
                                    style={{
                                        width: "0%",
                                    }}
                                ></div>
                            </div>

                            <p className="m_desc opacity-50">
                                Final submission & complete
                                evaluation
                            </p>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default LiveDashboard;