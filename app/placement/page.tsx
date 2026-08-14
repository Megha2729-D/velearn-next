"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";
import "./style.css";

const Placement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
    const [activeMainTab, setActiveMainTab] = useState<string>("evaluation");

    return (
        <div className="dashboard_layout">
            <Sidebar
                activePage="placement"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={[]}
            />

            <div className="dashboard_main_content">
                {/* Header */}
                <header className="dashboard_top_header">
                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses <span>/ Placement</span>
                        </h2>
                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>
                    </div>
                </header>

                <div className="placement_container">
                    {/* Main Tabs */}
                    <div className="placement_main_tabs">
                        <button
                            type="button"
                            className={`p_tab ${activeMainTab === "evaluation"
                                ? "active"
                                : ""
                                }`}
                            onClick={() =>
                                setActiveMainTab("evaluation")
                            }
                        >
                            📋 Evaluation
                        </button>

                        <button
                            type="button"
                            className="p_tab locked"
                            disabled
                        >
                            🎯 Placement{" "}
                            <span className="lock_badge">
                                <i className="bi bi-lock-fill"></i>{" "}
                                Locked
                            </span>
                        </button>
                    </div>

                    {/* Steps Navigation */}
                    <div className="placement_steps_nav mt-4">
                        <button
                            type="button"
                            className="step_btn active"
                        >
                            ⚡ Step 1 • Eligibility
                        </button>

                        <button
                            type="button"
                            className="step_btn locked"
                            disabled
                        >
                            🔒 Step 2 • Evaluation Test
                        </button>

                        <button
                            type="button"
                            className="step_btn locked"
                            disabled
                        >
                            🔒 Step 3 • Cumulative Result
                        </button>
                    </div>

                    {/* Step Content */}
                    <div className="step_content_card mt-4">
                        {/* Step Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="step_header">
                                <h3>
                                    📋 Step 1 — Placement Eligibility
                                </h3>

                                <p>
                                    Assignment + Mini Project + Main
                                    Project • Need ≥ 80% overall to
                                    proceed
                                </p>
                            </div>

                            <span className="eligible_pill">
                                <i className="bi bi-check-circle-fill"></i>{" "}
                                ELIGIBLE
                            </span>
                        </div>

                        {/* Score Grid */}
                        <div className="row g-4">
                            {/* Assignment */}
                            <div className="col-lg-4">
                                <div className="score_card_pl blue">
                                    <span className="graded_tag">
                                        GRADED
                                    </span>

                                    <div className="score_icon">
                                        📝
                                    </div>

                                    <div className="score_label">
                                        Assignment
                                    </div>

                                    <div className="score_value">
                                        85<span>/100</span>
                                    </div>

                                    <div className="score_progress">
                                        <div
                                            className="bar"
                                            style={{
                                                width: "85%",
                                            }}
                                        ></div>
                                    </div>

                                    <div className="score_meta">
                                        HTML • CSS • JS • React
                                    </div>
                                </div>
                            </div>

                            {/* Mini Project */}
                            <div className="col-lg-4">
                                <div className="score_card_pl green">
                                    <span className="graded_tag">
                                        GRADED
                                    </span>

                                    <div className="score_icon">
                                        🔧
                                    </div>

                                    <div className="score_label">
                                        Mini Project
                                    </div>

                                    <div className="score_value">
                                        78<span>/100</span>
                                    </div>

                                    <div className="score_progress">
                                        <div
                                            className="bar"
                                            style={{
                                                width: "78%",
                                            }}
                                        ></div>
                                    </div>

                                    <div className="score_meta">
                                        Todo App • Node.js API
                                    </div>
                                </div>
                            </div>

                            {/* Main Project */}
                            <div className="col-lg-4">
                                <div className="score_card_pl purple">
                                    <span className="graded_tag">
                                        GRADED
                                    </span>

                                    <div className="score_icon">
                                        💼
                                    </div>

                                    <div className="score_label">
                                        Main Project
                                    </div>

                                    <div className="score_value">
                                        90<span>/100</span>
                                    </div>

                                    <div className="score_progress">
                                        <div
                                            className="bar"
                                            style={{
                                                width: "90%",
                                            }}
                                        ></div>
                                    </div>

                                    <div className="score_meta">
                                        E-Commerce MERN
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overall Performance */}
                        <div className="overall_stats_box mt-5">
                            <h4 className="section_title_sm mb-4">
                                <i className="bi bi-bar-chart-fill me-2"></i>
                                Overall Performance
                            </h4>

                            {/* Attendance */}
                            <div className="perf_row">
                                <div className="perf_label">
                                    Class Attendance
                                </div>

                                <div className="perf_bar_wrap">
                                    <div
                                        className="perf_bar green"
                                        style={{
                                            width: "92%",
                                        }}
                                    ></div>
                                </div>

                                <div className="perf_val">
                                    92%
                                </div>
                            </div>

                            {/* Assignment Submission */}
                            <div className="perf_row">
                                <div className="perf_label">
                                    Assignment Submission Rate
                                </div>

                                <div className="perf_bar_wrap">
                                    <div
                                        className="perf_bar blue"
                                        style={{
                                            width: "100%",
                                        }}
                                    ></div>
                                </div>

                                <div className="perf_val">
                                    100%
                                </div>
                            </div>

                            {/* Doubt Sessions */}
                            <div className="perf_row">
                                <div className="perf_label">
                                    Doubt Sessions Attended
                                </div>

                                <div className="perf_bar_wrap">
                                    <div
                                        className="perf_bar purple"
                                        style={{
                                            width: "80%",
                                        }}
                                    ></div>
                                </div>

                                <div className="perf_val">
                                    8/10
                                </div>
                            </div>

                            {/* Live Participation */}
                            <div className="perf_row">
                                <div className="perf_label">
                                    Live Class Participation
                                </div>

                                <div className="perf_bar_wrap">
                                    <div
                                        className="perf_bar cyan"
                                        style={{
                                            width: "87%",
                                        }}
                                    ></div>
                                </div>

                                <div className="perf_val">
                                    87%
                                </div>
                            </div>
                        </div>

                        {/* Final Score */}
                        <div className="final_score_banner mt-5">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="score_details_pl">
                                    <h5>
                                        📊 Overall Score
                                        (Assignment + Mini + Main + 3)
                                    </h5>

                                    <p>
                                        85 + 78 + 90 = 253 ÷ 3 ={" "}
                                        <b>84.3%</b> • Minimum required:
                                        80%
                                    </p>

                                    <div className="overall_progress_line mt-3">
                                        <div className="line_bg"></div>

                                        <div
                                            className="line_fill"
                                            style={{
                                                width: "84.3%",
                                            }}
                                        ></div>
                                    </div>

                                    <p className="status_msg mt-2">
                                        You have cleared eligibility
                                        with 84.3% ✅
                                    </p>
                                </div>

                                <div className="score_badge_pl">
                                    <div className="val">
                                        84.3%
                                    </div>

                                    <div className="lab">
                                        ELIGIBLE ✅
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Proceed Button */}
                        <button
                            type="button"
                            className="btn_proceed_test mt-4"
                        >
                            <i className="bi bi-check-lg"></i>{" "}
                            Eligible • Proceed to Evaluation Test{" "}
                            <i className="bi bi-chevron-right ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Placement;