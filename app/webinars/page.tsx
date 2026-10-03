"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Sidebar from "@/components/layout/Sidebar";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";

interface User {
    id?: number | string;
    auth_id?: number | string;
    name?: string;
    email?: string;
    phonenumber?: string;
    phone?: string;
}

interface Webinar {
    id: number | string;
    title: string;
    date: string;
    from_time?: string | null;
    to_time?: string | null;
    instructor_name?: string | null;
    category?: string | null;
    description?: string | null;
    meeting_link?: string | null;
    zoom_link?: string | null;
    join_link?: string | null;
}

type WebinarStatus = "Live Now" | "Completed" | "Upcoming";

const WebinarDashboard = () => {
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [registeredWebinars, setRegisteredWebinars] = useState<
        (number | string)[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [selectedWebinar, setSelectedWebinar] =
        useState<Webinar | null>(null);

    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [recordedCount, setRecordedCount] = useState(0);
    const [liveCount, setLiveCount] = useState(0);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserId] = useState<number | string | null>(null);

    /* --------------------------------
       Get Logged In User
    -------------------------------- */

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                return;
            }

            const parsedUser: User = JSON.parse(storedUser);

            setUser(parsedUser);
            setUserId(parsedUser.id || parsedUser.auth_id || null);
        } catch (error) {
            console.error("Error reading user:", error);
        }
    }, []);

    /* --------------------------------
       Initial Fetch
    -------------------------------- */

    useEffect(() => {
        fetchWebinars();

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    /* --------------------------------
       User-dependent Fetch
    -------------------------------- */

    useEffect(() => {
        if (!userId) {
            return;
        }

        fetchMyWebinars();
        fetchCounts();
    }, [userId]);

    /* --------------------------------
       Fetch Counts
    -------------------------------- */

    const fetchCounts = async () => {
        if (!userId) return;

        try {
            const resRecorded = await axios.get(
                `${BASE_API_URL}my-courses/${userId}`,
            );

            if (resRecorded.data.status) {
                setRecordedCount(
                    resRecorded.data.data?.all?.length || 0,
                );
            }

            const resLive = await axios.get(
                `${BASE_API_URL}live-course-history/${userId}`,
            );

            if (resLive.data.status) {
                setLiveCount(
                    resLive.data.data?.length || 0,
                );
            }
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    };

    /* --------------------------------
       Fetch Webinars
    -------------------------------- */

    const fetchWebinars = async () => {
        try {
            const response = await axios.get(
                `${BASE_API_URL}webinars`,
            );

            if (response.data.status) {
                setWebinars(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching webinars:", error);
        } finally {
            setLoading(false);
        }
    };

    /* --------------------------------
       Fetch Registered Webinars
    -------------------------------- */

    const fetchMyWebinars = async () => {
        if (!userId) return;

        try {
            const response = await axios.get(
                `${BASE_API_URL}my-webinars/${userId}`,
            );

            if (response.data.status) {
                setRegisteredWebinars(
                    (response.data.data || []).map(
                        (webinar: Webinar) => webinar.id,
                    ),
                );
            }
        } catch (error) {
            console.error(
                "Error fetching my webinars:",
                error,
            );
        }
    };

    /* --------------------------------
       Register Webinar
    -------------------------------- */

    const handleRegister = async (webinar: Webinar) => {
        if (!userId || !user) {
            toast.error("Please login to register");
            return;
        }

        const loadingToast = toast.loading("Registering...");

        try {
            const response = await axios.post(
                `${BASE_API_URL}webinar-register`,
                {
                    webinar_id: webinar.id,
                    auth_id: userId,
                    name: user.name || "",
                    email: user.email || "",
                    phone:
                        user.phonenumber ||
                        user.phone ||
                        "",
                },
            );

            if (response.data.status) {
                toast.success(
                    "Successfully registered!",
                    {
                        id: loadingToast,
                    },
                );

                setRegisteredWebinars((prev) => [
                    ...prev,
                    webinar.id,
                ]);
            } else {
                toast.error(
                    response.data.message ||
                    "Registration failed",
                    {
                        id: loadingToast,
                    },
                );
            }
        } catch (error) {
            console.error(
                "Webinar registration error:",
                error,
            );

            toast.error("Something went wrong", {
                id: loadingToast,
            });
        }
    };

    /* --------------------------------
       Format Date
    -------------------------------- */

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
            },
        );
    };

    /* --------------------------------
       Format Time
    -------------------------------- */

    const formatTime = (
        time?: string | null,
    ) => {
        if (!time) return "";

        const [h, m] = time.split(":");

        const date = new Date();

        date.setHours(
            Number(h),
            Number(m),
            0,
            0,
        );

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /* --------------------------------
       Join Webinar
    -------------------------------- */

    const handleJoin = (webinar: Webinar) => {
        const link =
            webinar.meeting_link ||
            webinar.zoom_link ||
            webinar.join_link;

        if (link) {
            window.open(
                link,
                "_blank",
                "noopener,noreferrer",
            );
        } else {
            toast.error(
                "Meeting link is not available yet.",
            );
        }
    };

    /* --------------------------------
       View Details
    -------------------------------- */

    const handleViewDetails = (
        webinar: Webinar,
    ) => {
        setSelectedWebinar(webinar);
        setShowDetailsModal(true);
    };

    /* --------------------------------
       Get Webinar Status
    -------------------------------- */

    const getStatus = (
        webinar: Webinar,
    ): WebinarStatus => {
        const now = new Date();

        const startDate = new Date(
            webinar.date,
        );

        if (webinar.from_time) {
            const [startH, startM] =
                webinar.from_time.split(":");

            startDate.setHours(
                Number(startH),
                Number(startM),
                0,
                0,
            );
        }

        const endDate = new Date(
            webinar.date,
        );

        if (webinar.to_time) {
            const [endH, endM] =
                webinar.to_time.split(":");

            endDate.setHours(
                Number(endH),
                Number(endM),
                0,
                0,
            );
        } else {
            endDate.setHours(
                startDate.getHours() + 2,
                startDate.getMinutes(),
                0,
                0,
            );
        }

        if (
            now >= startDate &&
            now <= endDate
        ) {
            return "Live Now";
        }

        if (now > endDate) {
            return "Completed";
        }

        return "Upcoming";
    };

    /* --------------------------------
       Check Joinable
    -------------------------------- */

    const isJoinable = (
        webinar: Webinar,
    ) => {
        const startDate = new Date(
            webinar.date,
        );

        if (webinar.from_time) {
            const [startH, startM] =
                webinar.from_time.split(":");

            startDate.setHours(
                Number(startH),
                Number(startM),
                0,
                0,
            );
        }

        const earlyJoinTime = new Date(
            startDate.getTime() -
            5 * 60 * 1000,
        );

        return currentTime >= earlyJoinTime;
    };

    /* --------------------------------
       Filter Webinars
    -------------------------------- */

    const filteredWebinars =
        webinars.filter((webinar) => {
            const today = new Date();

            today.setHours(
                0,
                0,
                0,
                0,
            );

            const webinarDate =
                new Date(webinar.date);

            webinarDate.setHours(
                0,
                0,
                0,
                0,
            );

            if (webinarDate >= today) {
                return true;
            }

            return registeredWebinars.includes(
                webinar.id,
            );
        });

    const upcomingCount =
        filteredWebinars.filter(
            (webinar) => {
                const today = new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0,
                );

                const webinarDate =
                    new Date(webinar.date);

                webinarDate.setHours(
                    0,
                    0,
                    0,
                    0,
                );

                return webinarDate >= today;
            },
        ).length;

    return (
        <div className="dashboard_layout">
            <Sidebar
                recordedCoursesCount={
                    recordedCount
                }
                liveCoursesCount={
                    liveCount
                }
                activePage="webinar"
                isOpen={
                    isSidebarOpen
                }
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            <div
                className={`sidebar_overlay ${isSidebarOpen
                        ? "show"
                        : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(false)
                }
            />

            <div className="dashboard_main_content">
                <div className="webinar_dashboard_container">

                    {/* Top Header */}
                    <div className="webinar_top_title_row">
                        <h1>
                            Webinar & Seminar
                        </h1>

                        <div className="notification_btn">
                            <i className="bi bi-bell"></i>

                            <div
                                className="dot"
                                style={{
                                    position:
                                        "absolute",
                                    top: "10px",
                                    right: "10px",
                                    width: "6px",
                                    height: "6px",
                                    background:
                                        "#e74c3c",
                                    borderRadius:
                                        "50%",
                                }}
                            />
                        </div>
                    </div>

                    {/* Hero */}
                    <div className="webinar_hero_card">
                        <div className="hero_content_left">
                            <h2>
                                <i className="bi bi-broadcast"></i>{" "}
                                Webinar & Seminar
                            </h2>

                            <p>
                                Industry talks,
                                guest lectures &
                                career sessions
                            </p>
                        </div>

                        <div className="upcoming_badge">
                            {upcomingCount} upcoming
                        </div>
                    </div>

                    {/* Webinar List */}
                    <div className="webinar_list">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : filteredWebinars.length ===
                            0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>

                                <p>
                                    No webinars available at the moment.
                                </p>
                            </div>
                        ) : (
                            filteredWebinars.map(
                                (webinar) => {
                                    const status =
                                        getStatus(
                                            webinar,
                                        );

                                    return (
                                        <div
                                            className={`webinar_item_row ${status ===
                                                    "Live Now"
                                                    ? "live_now"
                                                    : ""
                                                }`}
                                            key={
                                                webinar.id
                                            }
                                        >
                                            {/* Type */}
                                            <div className="item_badge_type">
                                                <i className="bi bi-globe"></i>{" "}
                                                Webinar
                                            </div>

                                            {/* Status */}
                                            {status ===
                                                "Live Now" && (
                                                    <span className="status_label_fixed status_live">
                                                        Live Now
                                                    </span>
                                                )}

                                            {status ===
                                                "Completed" && (
                                                    <span className="status_label_fixed status_completed">
                                                        Completed
                                                    </span>
                                                )}

                                            {/* Title */}
                                            <h3>
                                                {
                                                    webinar.title
                                                }
                                            </h3>

                                            {/* Details */}
                                            <div className="webinar_details_info">

                                                <div className="detail_line">
                                                    <i className="bi bi-calendar3"></i>

                                                    <span>
                                                        {formatDate(
                                                            webinar.date,
                                                        )}{" "}
                                                        ·{" "}
                                                        {formatTime(
                                                            webinar.from_time,
                                                        )}{" "}
                                                        · Duration:
                                                        2 hrs
                                                    </span>
                                                </div>

                                                <div className="detail_line">
                                                    <i className="bi bi-mic"></i>

                                                    <span>
                                                        Guest:{" "}
                                                        {webinar.instructor_name ||
                                                            "Industry Expert"}
                                                    </span>
                                                </div>

                                                <div className="detail_line">
                                                    <i className="bi bi-people"></i>

                                                    <span>
                                                        {status ===
                                                            "Completed"
                                                            ? "210 attended"
                                                            : registeredWebinars.includes(
                                                                webinar.id,
                                                            )
                                                                ? "Registered"
                                                                : "84 registered so far"}
                                                    </span>
                                                </div>

                                            </div>

                                            {/* Actions */}
                                            <div className="webinar_actions_row">

                                                {status ===
                                                    "Live Now" ? (
                                                    <>
                                                        <button
                                                            className="btn_wbr_primary"
                                                            onClick={() =>
                                                                handleJoin(
                                                                    webinar,
                                                                )
                                                            }
                                                        >
                                                            Join Webinar →
                                                        </button>

                                                        <button
                                                            className="btn_wbr_outline"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    webinar,
                                                                )
                                                            }
                                                        >
                                                            View Details
                                                        </button>
                                                    </>
                                                ) : status ===
                                                    "Completed" ? (
                                                    <>
                                                        <button
                                                            className="btn_wbr_outline"
                                                            onClick={() =>
                                                                handleJoin(
                                                                    webinar,
                                                                )
                                                            }
                                                        >
                                                            Watch Recording
                                                        </button>

                                                        <button
                                                            className="btn_wbr_dark"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    webinar,
                                                                )
                                                            }
                                                        >
                                                            Notes
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {registeredWebinars.includes(
                                                            webinar.id,
                                                        ) ? (
                                                            <button
                                                                className={
                                                                    isJoinable(
                                                                        webinar,
                                                                    )
                                                                        ? "btn_wbr_primary"
                                                                        : "btn_wbr_grey"
                                                                }
                                                                disabled={
                                                                    !isJoinable(
                                                                        webinar,
                                                                    )
                                                                }
                                                                onClick={() =>
                                                                    handleJoin(
                                                                        webinar,
                                                                    )
                                                                }
                                                            >
                                                                Join Webinar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn_wbr_dark"
                                                                onClick={() =>
                                                                    handleRegister(
                                                                        webinar,
                                                                    )
                                                                }
                                                            >
                                                                Register
                                                            </button>
                                                        )}

                                                        <button
                                                            className="btn_wbr_outline"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    webinar,
                                                                )
                                                            }
                                                        >
                                                            View Details
                                                        </button>
                                                    </>
                                                )}

                                            </div>
                                        </div>
                                    );
                                },
                            )
                        )}
                    </div>

                    {/* Details Modal */}
                    {showDetailsModal &&
                        selectedWebinar && (
                            <div
                                className="wbr_modal_overlay"
                                onClick={() =>
                                    setShowDetailsModal(
                                        false,
                                    )
                                }
                            >
                                <div
                                    className="wbr_details_modal animate__animated animate__fadeInUp"
                                    onClick={(event) =>
                                        event.stopPropagation()
                                    }
                                >
                                    {/* Modal Header */}
                                    <div className="modal_header_custom">
                                        <h3>
                                            {
                                                selectedWebinar.title
                                            }
                                        </h3>

                                        <button
                                            className="btn_close_wbr"
                                            onClick={() =>
                                                setShowDetailsModal(
                                                    false,
                                                )
                                            }
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="modal_body_custom">

                                        <div className="wbr_detail_meta_grid">

                                            <div className="meta_block">
                                                <i className="bi bi-calendar3"></i>

                                                <div>
                                                    <label>
                                                        Date
                                                    </label>

                                                    <span>
                                                        {formatDate(
                                                            selectedWebinar.date,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="meta_block">
                                                <i className="bi bi-clock"></i>

                                                <div>
                                                    <label>
                                                        Time
                                                    </label>

                                                    <span>
                                                        {formatTime(
                                                            selectedWebinar.from_time,
                                                        )}{" "}
                                                        -{" "}
                                                        {formatTime(
                                                            selectedWebinar.to_time,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="meta_block">
                                                <i className="bi bi-mic"></i>

                                                <div>
                                                    <label>
                                                        Speaker
                                                    </label>

                                                    <span>
                                                        {selectedWebinar.instructor_name ||
                                                            "Industry Expert"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="meta_block">
                                                <i className="bi bi-tag"></i>

                                                <div>
                                                    <label>
                                                        Category
                                                    </label>

                                                    <span>
                                                        {selectedWebinar.category ||
                                                            "Webinar"}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="wbr_description_sec mt-4">
                                            <h4>
                                                About this Session
                                            </h4>

                                            <p>
                                                {selectedWebinar.description ||
                                                    "In this session, you will gain practical insights into industry trends, tools, and techniques. Perfect for beginners and professionals looking to stay ahead in their careers."}
                                            </p>
                                        </div>

                                    </div>

                                    {/* Modal Footer */}
                                    <div className="modal_footer_custom">
                                        {(() => {
                                            const status =
                                                getStatus(
                                                    selectedWebinar,
                                                );

                                            if (
                                                status ===
                                                "Live Now"
                                            ) {
                                                return (
                                                    <button
                                                        className="btn_wbr_primary w-100"
                                                        style={{
                                                            border:
                                                                "none",
                                                            padding:
                                                                "12px",
                                                            borderRadius:
                                                                "8px",
                                                        }}
                                                        onClick={() =>
                                                            handleJoin(
                                                                selectedWebinar,
                                                            )
                                                        }
                                                    >
                                                        Join Now
                                                    </button>
                                                );
                                            }

                                            if (
                                                status ===
                                                "Completed"
                                            ) {
                                                return (
                                                    <button
                                                        className="btn_wbr_outline w-100"
                                                        style={{
                                                            border:
                                                                "1px solid #dee2e6",
                                                            padding:
                                                                "12px",
                                                            borderRadius:
                                                                "8px",
                                                        }}
                                                        onClick={() =>
                                                            handleJoin(
                                                                selectedWebinar,
                                                            )
                                                        }
                                                    >
                                                        Watch Recording
                                                    </button>
                                                );
                                            }

                                            if (
                                                registeredWebinars.includes(
                                                    selectedWebinar.id,
                                                )
                                            ) {
                                                const joinable =
                                                    isJoinable(
                                                        selectedWebinar,
                                                    );

                                                return (
                                                    <button
                                                        className={
                                                            joinable
                                                                ? "btn_wbr_primary w-100"
                                                                : "btn_wbr_grey w-100"
                                                        }
                                                        style={{
                                                            border:
                                                                "none",
                                                            padding:
                                                                "12px",
                                                            borderRadius:
                                                                "8px",
                                                            ...(joinable
                                                                ? {}
                                                                : {
                                                                    background:
                                                                        "#e9ecef",
                                                                    color:
                                                                        "#6c757d",
                                                                }),
                                                        }}
                                                        disabled={
                                                            !joinable
                                                        }
                                                        onClick={() =>
                                                            handleJoin(
                                                                selectedWebinar,
                                                            )
                                                        }
                                                    >
                                                        Join Webinar
                                                    </button>
                                                );
                                            }

                                            return (
                                                <button
                                                    className="btn_wbr_dark w-100"
                                                    style={{
                                                        border:
                                                            "none",
                                                        padding:
                                                            "12px",
                                                        borderRadius:
                                                            "8px",
                                                    }}
                                                    onClick={() => {
                                                        handleRegister(
                                                            selectedWebinar,
                                                        );

                                                        setShowDetailsModal(
                                                            false,
                                                        );
                                                    }}
                                                >
                                                    Register for Session
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default WebinarDashboard;