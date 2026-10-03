"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

interface Session {
    title: string;
    date: string;
    type: "watch" | "live" | "upcoming";
}

interface Module {
    id: string;
    title: string;
    status: "Done" | "Active" | "Upcoming";
    sessions: number;
    content: Session[];
}

const LiveCourseHistory = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const modules: Module[] = [
        {
            id: "M1",
            title: "HTML & CSS Fundamentals",
            status: "Done",
            sessions: 4,
            content: [
                {
                    title: "Introduction to Web",
                    date: "Feb 10",
                    type: "watch",
                },
                {
                    title: "HTML Tags & Semantics",
                    date: "Feb 12",
                    type: "watch",
                },
            ],
        },
        {
            id: "M2",
            title: "JavaScript Basics",
            status: "Done",
            sessions: 4,
            content: [
                {
                    title: "Variables & Data Types",
                    date: "Feb 20",
                    type: "watch",
                },
                {
                    title: "Functions & Scope",
                    date: "Feb 22",
                    type: "watch",
                },
            ],
        },
        {
            id: "M3",
            title: "React Fundamentals",
            status: "Active",
            sessions: 4,
            content: [
                {
                    title: "Components & props",
                    date: "Mar 25",
                    type: "watch",
                },
                {
                    title: "State & lifecycle",
                    date: "Mar 28",
                    type: "watch",
                },
                {
                    title: "React Hooks deep dive",
                    date: "Apr 10",
                    type: "live",
                },
                {
                    title: "Context API",
                    date: "Apr 12",
                    type: "upcoming",
                },
            ],
        },
        {
            id: "M4",
            title: "Node.js & Express",
            status: "Upcoming",
            sessions: 2,
            content: [],
        },
    ];

    return (
        <div className="dashboard_layout">
            <Sidebar
                activePage="live-course-history"
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
                <header className="dashboard_top_header">
                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses{" "}
                            <span>/ Live Classes</span>
                        </h2>
                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>
                    </div>
                </header>

                <div className="live_classes_container">
                    {/* Live Now Highlight */}
                    <div className="live_now_hero_card">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="hero_live_info">
                                <div className="live_indicator_pill mb-3">
                                    <span className="pulse_dot"></span>
                                    LIVE NOW
                                </div>

                                <h1>React Hooks Deep Dive</h1>

                                <p>
                                    Module 3 • Mentor Priya • Started 10
                                    min ago
                                </p>
                            </div>

                            <button className="btn_join_now_large">
                                Join Now{" "}
                                <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Module-wise Content */}
                    <div className="module_section mt-5">
                        <div className="section_header_with_icon mb-4">
                            <i className="bi bi-collection-play"></i>

                            <h3>
                                Module-wise Classes & Recordings
                            </h3>
                        </div>

                        <div className="module_list">
                            {modules.map((mod) => (
                                <div
                                    key={mod.id}
                                    className={`module_item_wrap ${mod.status.toLowerCase()}`}
                                >
                                    {/* Module Header */}
                                    <div className="module_header_dh">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="module_badge">
                                                {mod.id}
                                            </div>

                                            <div className="module_info">
                                                <h4>{mod.title}</h4>

                                                <p>
                                                    {mod.status ===
                                                        "Done"
                                                        ? `Completed • ${mod.sessions} sessions`
                                                        : `${mod.status} • ${mod.sessions} sessions`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="module_status_dh">
                                            <span
                                                className={`status_pill ${mod.status.toLowerCase()}`}
                                            >
                                                {mod.status}
                                            </span>

                                            <i className="bi bi-chevron-down ms-2"></i>
                                        </div>
                                    </div>

                                    {/* Module Sessions */}
                                    {mod.content.length > 0 && (
                                        <div className="module_content_dh">
                                            {mod.content.map(
                                                (item, idx) => (
                                                    <div
                                                        key={`${mod.id}-${idx}`}
                                                        className="session_row_dh"
                                                    >
                                                        <div className="session_main">
                                                            <div className="session_title">
                                                                {
                                                                    item.title
                                                                }
                                                            </div>

                                                            <div className="session_date">
                                                                {
                                                                    item.date
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className="session_actions">
                                                            {/* Watch */}
                                                            {item.type ===
                                                                "watch" && (
                                                                    <>
                                                                        <button className="btn_action_dh watch">
                                                                            <i className="bi bi-play-fill"></i>{" "}
                                                                            Watch
                                                                        </button>

                                                                        <button className="btn_action_dh notes">
                                                                            Notes
                                                                        </button>
                                                                    </>
                                                                )}

                                                            {/* Live */}
                                                            {item.type ===
                                                                "live" && (
                                                                    <>
                                                                        <span className="live_tag_sm">
                                                                            <span className="pulse_dot_sm"></span>
                                                                            LIVE
                                                                        </span>

                                                                        <button className="btn_action_dh join">
                                                                            Join
                                                                        </button>
                                                                    </>
                                                                )}

                                                            {/* Upcoming */}
                                                            {item.type ===
                                                                "upcoming" && (
                                                                    <>
                                                                        <button className="btn_action_dh watch disabled">
                                                                            <i className="bi bi-play-fill"></i>{" "}
                                                                            Watch
                                                                        </button>

                                                                        <button className="btn_action_dh notes disabled">
                                                                            Notes
                                                                        </button>
                                                                    </>
                                                                )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveCourseHistory;