"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";
import "./style.css";

const recordings = [
    {
        id: 1,
        title: "Onboarding — Day 1 • Orientation & Platform",
        date: "Feb 10, 2025",
        duration: "2 hrs",
    },
    {
        id: 2,
        title: "Onboarding — Day 2 • Dev Environment Setup",
        date: "Feb 11, 2025",
        duration: "2 hrs",
    },
    {
        id: 3,
        title: "Onboarding — Day 3 • HTML5 & CSS3 Fundamentals",
        date: "Feb 12, 2025",
        duration: "2 hrs",
    },
    {
        id: 4,
        title: "Onboarding — Day 4 • Flexbox & Grid Layouts",
        date: "Feb 13, 2025",
        duration: "2 hrs",
    },
];

export default function Meetings() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    return (
        <div className="dashboard_layout">

            {/* Sidebar */}
            <Sidebar
                activePage="live"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Overlay */}
            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Notifications */}
            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={[]}
            />

            {/* Main Content */}
            <div className="dashboard_main_content">

                {/* Top Header */}
                <header className="dashboard_top_header">

                    <div className="d-flex align-items-center gap-3">

                        {/* Mobile Menu */}
                        <button
                            type="button"
                            className="btn_mobile_menu d-lg-none"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="profile_breadcrumb">
                            <h2>
                                Meetings <span>/ Sessions</span>
                            </h2>
                        </div>

                    </div>

                    {/* Notification */}
                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>
                    </div>

                </header>

                {/* Meetings */}
                <div className="meetings_container">

                    {/* Hero Banner */}
                    <div className="meetings_hero_banner">

                        <div className="hero_icon">
                            <i className="bi bi-calendar3"></i>
                        </div>

                        <div className="hero_text">
                            <h1>Meetings</h1>

                            <p>
                                Your scheduled sessions, live classes and recordings
                            </p>
                        </div>

                    </div>

                    {/* Current Meeting */}
                    <div className="current_meeting_card">

                        <div className="d-flex justify-content-between align-items-start mb-4">

                            <div className="d-flex gap-3 align-items-center">

                                <div
                                    className="meeting_avatar_box"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        background: "#e0f2fe",
                                        borderRadius: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 24,
                                    }}
                                >
                                    🎓
                                </div>

                                <div className="meeting_info">

                                    <h3>Onboarding Class</h3>

                                    <p>
                                        Batch FSW-2024-07 • Mentor Priya • Every Monday
                                        9:00 AM
                                    </p>

                                </div>

                            </div>

                            {/* Live Tag */}
                            <div className="live_tag_sm">
                                <span className="pulse_dot_sm"></span>
                                LIVE NOW
                            </div>

                        </div>

                        {/* Buttons */}
                        <div className="d-flex gap-3 mb-4">

                            <button
                                type="button"
                                className="btn_join_now"
                            >
                                <i className="bi bi-play-fill"></i>
                                Join Now
                            </button>

                            <button
                                type="button"
                                className="btn_copy_link"
                            >
                                Copy Link
                            </button>

                        </div>

                        <div className="card_divider mb-4"></div>

                        {/* Recordings */}
                        <h4 className="section_title_serif mb-3">
                            <i className="bi bi-film"></i>
                            Class Recordings
                        </h4>

                        <div className="recordings_list">

                            {recordings.map((rec) => (

                                <div
                                    key={rec.id}
                                    className="recording_item"
                                >

                                    <div className="rec_info">

                                        <div className="rec_title">
                                            {rec.title}
                                        </div>

                                        <div className="rec_meta">
                                            {rec.date} • {rec.duration}
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        className="btn_watch"
                                    >
                                        <i className="bi bi-play-fill"></i>
                                        Watch
                                    </button>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}