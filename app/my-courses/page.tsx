"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import "./style.css";
import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

interface Notification {
    message: string;
    time: string;
    color: string;
    unread: boolean;
}

interface Enrollment {
    status?: string;
    enrolled_at?: string;
    completed_quizzes?: number | string;
    total_quizzes?: number | string;
}

interface Course {
    id: number | string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    price?: number | string;
    enrollment?: Enrollment;
}

interface Courses {
    all: Course[];
    ongoing: Course[];
    completed: Course[];
    inactive: Course[];
}

interface ApiResponse {
    status: boolean;
    data?: {
        all?: Course[];
        ongoing?: Course[];
        completed?: Course[];
        inactive?: Course[];
    };
}

type FilterType =
    | "all"
    | "in-progress"
    | "completed"
    | "not-started";

const isProduction =
    typeof window !== "undefined" &&
    (window.location.hostname === "velearn.in" ||
        window.location.hostname === "www.velearn.in");

const getApiUrl = () => {
    if (typeof window === "undefined") {
        return "https://crm.velearn.in/api/";
    }

    return isProduction
        ? "https://crm.velearn.in/api/"
        : `http://${window.location.hostname}:8000/api/`;
};

const getDynamicImageUrl = () => {
    if (typeof window === "undefined") {
        return "https://crm.velearn.in/public/";
    }

    return isProduction
        ? "https://crm.velearn.in/public/"
        : `http://${window.location.hostname}:8000/`;
};

const Placement = () => {
    const [filter, setFilter] = useState<FilterType>("all");
    const [search, setSearch] = useState("");

    const [courses, setCourses] = useState<Courses>({
        all: [],
        ongoing: [],
        completed: [],
        inactive: [],
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [isSidebarOpen, setIsSidebarOpen] =
        useState<boolean>(false);
    const [isNotifOpen, setIsNotifOpen] =
        useState<boolean>(false);

    const [notifications] = useState<Notification[]>([
        {
            message:
                "New registration confirmed for <b>Full Stack Development</b>! 🎉",
            time: "2 hours ago",
            color: "#3b82f6",
            unread: true,
        },
        {
            message:
                "Payment of <b>₹8,500</b> confirmed — <b>UI/UX Design</b> is now active!",
            time: "Yesterday, 4:30 PM",
            color: "#10b981",
            unread: false,
        },
        {
            message:
                "New lesson added to <b>React Mastery</b> — 'Server Actions Deep Dive'",
            time: "Mar 1, 2025",
            color: "#f59e0b",
            unread: false,
        },
        {
            message:
                "Your <b>Python for Data Science</b> certificate is ready to download! 🎓",
            time: "Mar 2, 2025",
            color: "#10b981",
            unread: false,
        },
    ]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const storedUser = localStorage.getItem("user");

                if (!storedUser) {
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(storedUser);

                if (!user?.id) {
                    setLoading(false);
                    return;
                }

                const response = await fetch(
                    `${getApiUrl()}my-courses/${user.id}`
                );

                const data: ApiResponse = await response.json();

                if (data.status) {
                    const sortLatest = (arr: Course[] = []) => {
                        return [...arr].sort((a, b) => {
                            const dateA = new Date(
                                a.enrollment?.enrolled_at || 0
                            ).getTime();

                            const dateB = new Date(
                                b.enrollment?.enrolled_at || 0
                            ).getTime();

                            return dateB - dateA;
                        });
                    };

                    setCourses({
                        all: sortLatest(data.data?.all || []),
                        ongoing: sortLatest(
                            data.data?.ongoing || []
                        ),
                        completed: sortLatest(
                            data.data?.completed || []
                        ),
                        inactive: sortLatest(
                            data.data?.inactive || []
                        ),
                    });
                }
            } catch (error) {
                console.error(
                    "Error fetching courses:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        let list: Course[] = [];

        if (filter === "all") {
            list = courses.all;
        }

        if (filter === "in-progress") {
            list = courses.ongoing;
        }

        if (filter === "completed") {
            list = courses.completed;
        }

        if (filter === "not-started") {
            list = courses.inactive;
        }

        if (search.trim() !== "") {
            list = list.filter((course) =>
                course.title
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        return list;
    }, [filter, courses, search]);

    return (
        <div className="dashboard_layout">
            {/* Sidebar */}
            <Sidebar
                recordedCoursesCount={courses.all.length}
                liveCoursesCount={0}
                activePage="my-courses"
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
                notifications={notifications}
            />

            <div className="dashboard_main_content">
                {/* Header */}
                <div className="dashboard_top_header">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="profile_breadcrumb mb-0">
                            <h2>Recorded Courses</h2>
                        </div>
                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() =>
                            setIsNotifOpen(true)
                        }
                    >
                        <i className="bi bi-bell"></i>

                        {notifications.some(
                            (notification) =>
                                notification.unread
                        ) && (
                                <span className="notif_ping"></span>
                            )}
                    </div>
                </div>

                {/* Courses */}
                <section className="live_courses_sec my_course_parent">
                    <div className="container-fluid px-0 px-lg-3">
                        <h3 className="section_base_heading text-black mb-4">
                            My{" "}
                            <span className="text-c2">
                                Courses
                            </span>
                        </h3>

                        {/* Filters */}
                        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className={
                                        filter === "all"
                                            ? "filter_active_butt"
                                            : "filter_butt"
                                    }
                                    onClick={() =>
                                        setFilter("all")
                                    }
                                >
                                    All Courses
                                </button>

                                <button
                                    type="button"
                                    className={
                                        filter ===
                                            "in-progress"
                                            ? "filter_active_butt"
                                            : "filter_butt"
                                    }
                                    onClick={() =>
                                        setFilter(
                                            "in-progress"
                                        )
                                    }
                                >
                                    In Progress
                                </button>

                                <button
                                    type="button"
                                    className={
                                        filter ===
                                            "completed"
                                            ? "filter_active_butt"
                                            : "filter_butt"
                                    }
                                    onClick={() =>
                                        setFilter("completed")
                                    }
                                >
                                    Completed
                                </button>

                                <button
                                    type="button"
                                    className={
                                        filter ===
                                            "not-started"
                                            ? "filter_active_butt"
                                            : "filter_butt"
                                    }
                                    onClick={() =>
                                        setFilter(
                                            "not-started"
                                        )
                                    }
                                >
                                    Not Started
                                </button>
                            </div>

                            {/* Search */}
                            <input
                                type="text"
                                value={search}
                                placeholder="Search course..."
                                className="form-control form-control-sm"
                                style={{ width: "220px" }}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="text-center py-5">
                                <h5>Loading Courses...</h5>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading &&
                            filteredCourses.length === 0 && (
                                <div className="prof_empty_card mb-5">
                                    <div className="empty_illustration_wrap">
                                        <i className="bi bi-collection-play"></i>
                                    </div>

                                    <h3>
                                        No courses found
                                    </h3>

                                    <p>
                                        You haven't enrolled in
                                        any recorded courses yet,
                                        or no courses match your
                                        current filter.
                                    </p>

                                    <Link
                                        href="/courses"
                                        className="browse_courses_btn"
                                    >
                                        Browse Courses{" "}
                                        <i className="bi bi-arrow-right-short ms-2"></i>
                                    </Link>
                                </div>
                            )}

                        {/* Courses Grid */}
                        {!loading && (
                            <div className="row g-4">
                                {filteredCourses.map(
                                    (course, index) => {
                                        const status =
                                            course.enrollment
                                                ?.status;

                                        const isInactive =
                                            status ===
                                            "inactive";

                                        const completedQuizzes =
                                            parseInt(
                                                String(
                                                    course
                                                        .enrollment
                                                        ?.completed_quizzes ||
                                                    0
                                                ),
                                                10
                                            );

                                        const totalQuizzes =
                                            parseInt(
                                                String(
                                                    course
                                                        .enrollment
                                                        ?.total_quizzes ||
                                                    0
                                                ),
                                                10
                                            );

                                        const progress =
                                            totalQuizzes > 0
                                                ? Math.round(
                                                    (completedQuizzes /
                                                        totalQuizzes) *
                                                    100
                                                )
                                                : status ===
                                                    "completed"
                                                    ? 100
                                                    : status ===
                                                        "ongoing"
                                                        ? 40
                                                        : 0;

                                        const imageBaseUrl =
                                            getDynamicImageUrl();

                                        const img =
                                            course.thumbnail
                                                ? `${imageBaseUrl}uploads/courses/${course.thumbnail}`
                                                : `${imageBaseUrl}uploads/courses/default-course.jpg`;

                                        return (
                                            <div
                                                key={
                                                    course.id
                                                }
                                                className="col-lg-4 col-md-4 col-sm-6"
                                            >
                                                <div
                                                    className={`card_parent h-100 d-flex flex-column position-relative ${index %
                                                            2 ===
                                                            0
                                                            ? "one"
                                                            : "two"
                                                        } ${isInactive
                                                            ? "locked_card"
                                                            : ""
                                                        }`}
                                                >
                                                    {/* Locked Overlay */}
                                                    {isInactive && (
                                                        <Link
                                                            href="/contact-us"
                                                            className="locked_overlay"
                                                        >
                                                            <div className="locked_box d-flex flex-column align-items-center">
                                                                <div className="lock_icon_circle">
                                                                    <i className="bi bi-lock-fill"></i>
                                                                </div>

                                                                <span className="locked_text">
                                                                    Course
                                                                    Locked
                                                                </span>

                                                                <div className="locked_price mt-1">
                                                                    ₹
                                                                    {
                                                                        course.price
                                                                    }
                                                                </div>

                                                                <div className="unlock_hint mt-2">
                                                                    Unlock
                                                                    Course{" "}
                                                                    <i className="bi bi-chevron-right"></i>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )}

                                                    {/* Image */}
                                                    <div className="card_img_parent overflow-hidden">
                                                        <img
                                                            src={
                                                                img
                                                            }
                                                            className="card_img w-100"
                                                            alt={
                                                                course.title
                                                            }
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="pt-3 d-flex flex-column flex-grow-1">
                                                        <h5 className="fw-bold">
                                                            {
                                                                course.title
                                                            }
                                                        </h5>

                                                        <p className="enroll_on_date mb-2">
                                                            Enrolled
                                                            on{" "}
                                                            {
                                                                course
                                                                    .enrollment
                                                                    ?.enrolled_at
                                                            }
                                                        </p>

                                                        <div className="mt-auto">
                                                            <div className="d-flex justify-content-between small">
                                                                <span>
                                                                    {totalQuizzes >
                                                                        0
                                                                        ? "Quizzes Done"
                                                                        : "Progress"}
                                                                </span>

                                                                <span className="fw-bold">
                                                                    {totalQuizzes >
                                                                        0
                                                                        ? `${completedQuizzes}/${totalQuizzes}`
                                                                        : `${progress}%`}
                                                                </span>
                                                            </div>

                                                            <div
                                                                className="progress mt-1"
                                                                style={{
                                                                    height:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <div
                                                                    className="progress-bar bg-success"
                                                                    style={{
                                                                        width: `${progress}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Button */}
                                                        {isInactive ? (
                                                            <Link
                                                                href="/contact-us"
                                                            >
                                                                <div className="paid_butt mt-3">
                                                                    Unlock
                                                                    Course
                                                                </div>
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={`/learn/${course.slug}`}
                                                            >
                                                                <div
                                                                    className={`mt-3 paid_butt ${progress ===
                                                                            100
                                                                            ? "certificate_butt"
                                                                            : progress ===
                                                                                0
                                                                                ? "start_course_butt"
                                                                                : "continue_course_butt"
                                                                        }`}
                                                                >
                                                                    {progress ===
                                                                        100 ? (
                                                                        <>
                                                                            <i className="bi bi-patch-check-fill me-2"></i>
                                                                            View
                                                                            Certificate
                                                                        </>
                                                                    ) : progress ===
                                                                        0 ? (
                                                                        <>
                                                                            <i className="bi bi-play-fill me-2"></i>
                                                                            Start
                                                                            Course
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="bi bi-play-circle-fill me-2"></i>
                                                                            Continue
                                                                            Watching
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Placement;