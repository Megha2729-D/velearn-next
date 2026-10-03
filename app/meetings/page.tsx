"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api";

interface Meeting {
    id: number | string;
    type: string;
    title: string;
    course?: string;
    instructor?: string;
    date?: string;
    date_formatted?: string;
    time?: string;
    link?: string | null;
}

interface StoredUser {
    id?: number | string;
    auth_id?: number | string;
    user_id?: number | string;
}

export default function Meetings() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const [todayMeetings, setTodayMeetings] = useState < Meeting[] > ([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState < Meeting[] > ([]);
    const [pastMeetings, setPastMeetings] = useState < Meeting[] > ([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const userStr = localStorage.getItem("user");

                if (!userStr) {
                    setLoading(false);
                    return;
                }

                const user: StoredUser = JSON.parse(userStr);

                const userId =
                    user?.id ||
                    user?.auth_id ||
                    user?.user_id ||
                    null;

                if (!userId) {
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `${BASE_API_URL}/student-meetings/${userId}`,
                    {
                        headers: token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {},
                    }
                );

                if (res.data?.status) {
                    const allMeetings: Meeting[] = res.data?.data || [];

                    const today: Date = new Date();

                    today.setHours(0, 0, 0, 0);

                    const todayM: Meeting[] = [];
                    const upcomingM: Meeting[] = [];
                    const pastM: Meeting[] = [];

                    allMeetings.forEach((meeting) => {
                        /*
                         * Live classes are always shown under Today,
                         * matching the original React implementation.
                         */
                        if (meeting.type === "Live Class") {
                            todayM.push(meeting);
                            return;
                        }

                        if (!meeting.date) {
                            upcomingM.push(meeting);
                            return;
                        }

                        const meetingDate = new Date(meeting.date);

                        meetingDate.setHours(0, 0, 0, 0);

                        if (
                            meetingDate.getTime() ===
                            today.getTime()
                        ) {
                            todayM.push(meeting);
                        } else if (
                            meetingDate.getTime() >
                            today.getTime()
                        ) {
                            upcomingM.push(meeting);
                        } else {
                            pastM.push(meeting);
                        }
                    });

                    setTodayMeetings(todayM);
                    setUpcomingMeetings(upcomingM);
                    setPastMeetings(pastM);
                } else {
                    setTodayMeetings([]);
                    setUpcomingMeetings([]);
                    setPastMeetings([]);
                }
            } catch (error) {
                console.error(
                    "Error fetching meetings:",
                    error
                );

                setTodayMeetings([]);
                setUpcomingMeetings([]);
                setPastMeetings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    const copyMeetingLink = async (link: string) => {
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copied!");
        } catch (error) {
            console.error(
                "Failed to copy meeting link:",
                error
            );
        }
    };

    const getMeetingIcon = (type: string) => {
        if (type === "Live Class") {
            return "🎓";
        }

        if (type === "Doubt Session") {
            return "❓";
        }

        return "🗣️";
    };

    const renderMeetingCard = (meeting: Meeting) => {
        const isLiveClass =
            meeting.type === "Live Class";

        return (
            <div
                className="current_meeting_card mb-4"
                key={meeting.id}
            >
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
                                flexShrink: 0,
                            }}
                        >
                            {getMeetingIcon(meeting.type)}
                        </div>

                        <div className="meeting_info">
                            <h3>
                                {meeting.title}
                            </h3>

                            <p>
                                {meeting.course ||
                                    "Course"}{" "}
                                • Mentor:{" "}
                                {meeting.instructor ||
                                    "TBA"}{" "}
                                •{" "}
                                {meeting.date_formatted ||
                                    meeting.date ||
                                    "Date TBA"}{" "}
                                at{" "}
                                {meeting.time ||
                                    "Time TBA"}
                            </p>
                        </div>
                    </div>

                    <div
                        className={`live_tag_sm ${isLiveClass
                                ? ""
                                : "bg-secondary text-white"
                            }`}
                        style={
                            !isLiveClass
                                ? {
                                    border: "none",
                                    color: "#fff",
                                }
                                : {}
                        }
                    >
                        {isLiveClass ? (
                            <span className="pulse_dot_sm"></span>
                        ) : null}

                        {meeting.type}
                    </div>
                </div>

                <div className="d-flex gap-3">
                    {meeting.link ? (
                        <a
                            href={meeting.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn_join_now text-decoration-none"
                        >
                            <i className="bi bi-play-fill"></i>{" "}
                            Join Now
                        </a>
                    ) : (
                        <button
                            className="btn_join_now"
                            disabled
                            style={{
                                opacity: 0.5,
                            }}
                        >
                            <i className="bi bi-play-fill"></i>{" "}
                            Link TBA
                        </button>
                    )}

                    {meeting.link && (
                        <button
                            className="btn_copy_link"
                            onClick={() =>
                                copyMeetingLink(
                                    meeting.link as string
                                )
                            }
                        >
                            Copy Link
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard_layout">
            <Sidebar
                activePage="live"
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* Mobile Overlay */}
            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(false)
                }
            ></div>

            {/* Notifications */}
            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() =>
                    setIsNotifOpen(false)
                }
                notifications={[]}
            />

            <div className="dashboard_main_content">
                {/* Top Header */}
                <header className="dashboard_top_header">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                            aria-label="Open menu"
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="profile_breadcrumb">
                            <h2>
                                Meetings{" "}
                                <span>/ Sessions</span>
                            </h2>
                        </div>
                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() =>
                            setIsNotifOpen(true)
                        }
                        style={{
                            cursor: "pointer",
                        }}
                    >
                        <i className="bi bi-bell"></i>
                    </div>
                </header>

                <div className="meetings_container">
                    {/* Hero Banner */}
                    <div className="meetings_hero_banner">
                        <div className="hero_icon">
                            <i className="bi bi-calendar3"></i>
                        </div>

                        <div className="hero_text">
                            <h1>Meetings</h1>

                            <p>
                                Your scheduled sessions,
                                live classes and recordings
                            </p>
                        </div>
                    </div>

                    {/* Loading */}
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

                            <p className="mt-3 text-muted">
                                Loading meetings...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* TODAY */}
                            {todayMeetings.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="section_title_serif mb-3 text-primary">
                                        <i className="bi bi-calendar-event me-2"></i>
                                        Today
                                    </h4>

                                    {todayMeetings.map(
                                        renderMeetingCard
                                    )}
                                </div>
                            )}

                            {/* UPCOMING */}
                            {upcomingMeetings.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="section_title_serif mb-3">
                                        <i className="bi bi-calendar-plus me-2"></i>
                                        Upcoming
                                    </h4>

                                    {upcomingMeetings.map(
                                        renderMeetingCard
                                    )}
                                </div>
                            )}

                            {/* PAST */}
                            {pastMeetings.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="section_title_serif mb-3 text-muted">
                                        <i className="bi bi-calendar-check me-2"></i>
                                        Past Meetings
                                    </h4>

                                    <div className="opacity-75">
                                        {pastMeetings.map(
                                            renderMeetingCard
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* EMPTY STATE */}
                            {todayMeetings.length ===
                                0 &&
                                upcomingMeetings.length ===
                                0 &&
                                pastMeetings.length ===
                                0 && (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>

                                        <p>
                                            No meetings
                                            scheduled at
                                            the moment.
                                        </p>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}