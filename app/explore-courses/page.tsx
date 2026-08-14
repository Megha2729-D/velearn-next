"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

const isProduction =
    typeof window !== "undefined" &&
    (window.location.hostname === "velearn.in" ||
        window.location.hostname === "www.velearn.in");

// const BASE_API_URL = isProduction
//     ? "https://crm.velearn.in/api/"
//     : `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/`;
const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_DYNAMIC_IMAGE_URL = "https://crm.velearn.in/public/";


// const BASE_DYNAMIC_IMAGE_URL = isProduction
//     ? "https://crm.velearn.in/public/"
//     : `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/`;

type Course = {
    id: number;
    title: string;
    slug: string;
    image: string;
    sub_description?: string;
    recorded_content?: number;
    course_type?: string;
    rating?: number;
    buy_price?: number;
    mrp_price?: number;
};

type EnrolledCourse = {
    id: number;
    enrollment?: {
        status?: string;
    };
};

type Notification = {
    message: string;
    time: string;
    color: string;
    unread: boolean;
};

const liveCourses = [
    {
        title: "Full Stack Development",
        img: "/images/live-course/full-stack-development.jpg",
        desc: "A live, mentor-led Full Stack Development program designed to take you from fundamentals to production-ready applications — with real projects, real tools, and real career support.",
        duration: "3 Months",
        link: "/live-course/full-stack-development",
    },
    {
        title: "UI/UX Design",
        img: "/images/live-course/ui-ux.webp",
        desc: "Learn UI/UX design through live classes, hands-on projects, and expert mentorship. Master user research, UX strategy, and modern UI design to become job-ready with a strong portfolio.",
        duration: "3 Months",
        link: "/live-course/ui-ux-design",
    },
    {
        title: "Digital Marketing",
        img: "/images/live-course/digital-marketing.webp",
        desc: "This live Digital Marketing training program is designed to build job-ready skills through hands-on campaign execution, real-time tools, and expert mentorship— preparing you for high-growth roles in today’s digital economy.",
        duration: "3 Months",
        link: "/live-course/digital-marketing",
    },
    {
        title: "Data Science & AI",
        img: "/images/live-course/data-science.webp",
        desc: "This live Data Science and AI/ML program helps you develop job-ready analytical and machine learning skills through hands-on projects, real datasets, and continuous mentor guidance—preparing you for high-impact roles in today’s data-driven world.",
        duration: "3 Months",
        link: "/live-course/data-science-and-machine-learning",
    },
    {
        title: "Data Analytics",
        img: "/images/live-course/data-analytics.webp",
        desc: "This live Data Analytics program helps you build practical skills in data analysis, visualization, SQL, Excel, Python, and real-world datasets through hands-on projects and expert mentor guidance—preparing you for job-ready roles in today’s data-driven industry.",
        duration: "3 Months",
        link: "/live-course/data-analytics",
    },
];

export default function ExploreCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>(
        []
    );

    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [search, setSearch] = useState("");

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

    // Fetch courses + enrolled courses
    useEffect(() => {
        fetchCourses();
        fetchEnrolled();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(
                `${BASE_API_URL}recorded-course`
            );

            const data = await response.json();

            if (data.status && data.data) {
                setCourses(data.data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolled = async () => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) return;

            const user = JSON.parse(storedUser);

            if (!user?.id) return;

            const response = await fetch(
                `${BASE_API_URL}my-courses/${user.id}`
            );

            const data = await response.json();

            if (data.status) {
                setEnrolledCourses(data.data?.all || []);
            }
        } catch (error) {
            console.error(
                "Error fetching enrolled courses:",
                error
            );
        }
    };

    const filteredCourses = courses.filter((course) => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) return true;

        return (
            course.title?.toLowerCase().includes(keyword) ||
            course.sub_description
                ?.toLowerCase()
                .includes(keyword)
        );
    });

    return (
        <div className="dashboard_layout">

            {/* Sidebar */}
            <Sidebar
                activePage="explore"
                recordedCoursesCount={enrolledCourses.length}
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

                {/* Top Header */}
                <div className="dashboard_top_header">

                    <div className="d-flex align-items-center gap-3">

                        <button
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="profile_breadcrumb mb-0">
                            <h2>Explore Courses</h2>
                        </div>

                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>

                        {notifications.some(
                            (notification) => notification.unread
                        ) && <span className="notif_ping"></span>}
                    </div>

                </div>

                {/* LIVE COURSES */}
                <section className="live_courses_sec my_course_parent pt-4">

                    <div className="container-fluid px-0 px-lg-3">

                        <div className="mb-5">

                            <h3 className="fw-bold text-dark mb-4 px-2">
                                Top Trending{" "}
                                <span className="text-c2">
                                    Live Courses
                                </span>
                            </h3>

                            <div className="row g-4">

                                {liveCourses.map((course, index) => (

                                    <div
                                        key={course.title}
                                        className="col-xl-4 col-lg-6 col-md-6 mb-5"
                                    >

                                        <div
                                            className={`card_parent h-100 d-flex flex-column ${index % 2 === 0
                                                ? "one"
                                                : "two"
                                                }`}
                                        >

                                            <div className="card_img_parent overflow-hidden position-relative">

                                                <img
                                                    src={course.img}
                                                    className="card_img w-100"
                                                    alt={course.title}
                                                />

                                                <div className="live_parent d-flex gap-2 align-items-center justify-content-center">

                                                    <div className="live_icon"></div>

                                                    <span className="live_word">
                                                        Live
                                                    </span>

                                                </div>

                                            </div>

                                            <div className="pt-3 d-flex flex-column align-items-start flex-grow-1">

                                                <h4>{course.title}</h4>

                                                <p className="mb-0">
                                                    {course.desc}
                                                </p>

                                                <div className="duration_txt d-flex justify-content-end gap-3 w-100">

                                                    <div>
                                                        <i className="bi bi-clock pe-1"></i>
                                                        {course.duration}
                                                    </div>

                                                </div>

                                            </div>

                                            <div className="col-12 card_abs_butt">

                                                <div className="col-12 d-flex justify-content-between">

                                                    <div className="syllabus_butt">
                                                        <button>
                                                            Syllabus
                                                        </button>
                                                    </div>

                                                    <div className="view_more_butt">

                                                        <Link href={course.link}>
                                                            <button>
                                                                View more
                                                            </button>
                                                        </Link>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                        <hr className="my-5 opacity-10" />

                        {/* RECORDED COURSES HEADER */}

                        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">

                            <h3 className="fw-bold text-dark px-2 mb-0">
                                Premium Recorded{" "}
                                <span className="text-c2">
                                    Courses
                                </span>
                            </h3>

                            <div className="search_box_dash">

                                <input
                                    type="text"
                                    placeholder="Search recorded..."
                                    className="form-control"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    style={{
                                        maxWidth: "200px",
                                    }}
                                />

                            </div>

                        </div>

                        {/* LOADING */}

                        {loading ? (

                            <div className="text-center py-5">

                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                ></div>

                                <h5 className="mt-3">
                                    Loading Courses...
                                </h5>

                            </div>

                        ) : (

                            <div className="row g-4">

                                {filteredCourses.length > 0 ? (

                                    filteredCourses.map((course, index) => {

                                        const isEnrolled =
                                            enrolledCourses.some(
                                                (ec) =>
                                                    ec.id === course.id &&
                                                    ec.enrollment?.status !==
                                                    "inactive"
                                            );

                                        const targetUrl = isEnrolled
                                            ? `/learn/${course.slug}`
                                            : `/course-details/${course.slug}`;

                                        const img = `${BASE_DYNAMIC_IMAGE_URL}uploads/courses/${course.image}`;

                                        return (

                                            <div
                                                key={course.id}
                                                className="col-xl-4 col-lg-6 col-md-6 mb-4"
                                            >

                                                <Link
                                                    href={`${targetUrl}?courseId=${course.id}&courseType=${course.course_type || ""}`}
                                                    className="text-decoration-none"
                                                >

                                                    <div
                                                        className={`card_parent h-100 d-flex flex-column ${index % 2 === 0
                                                            ? "one"
                                                            : "two"
                                                            }`}
                                                    >

                                                        <div className="card_img_parent overflow-hidden">

                                                            <img
                                                                src={img}
                                                                className="card_img w-100"
                                                                alt={course.title}
                                                            />

                                                        </div>

                                                        <div className="pt-3 d-flex flex-column align-items-start flex-grow-1">

                                                            <h4 className="fw-bold text-dark">
                                                                {course.title}
                                                            </h4>

                                                            <p className="mb-2 text-muted small">
                                                                {course.sub_description}
                                                            </p>

                                                            <div className="d-flex justify-content-between align-items-center gap-3 w-100 mt-auto overflow-hidden">

                                                                <div className="recorded_course_duration">

                                                                    <div className="my-2 text-dark small">

                                                                        <i className="bi bi-clock pe-1 my-2"></i>

                                                                        {course.recorded_content}{" "}
                                                                        hours

                                                                    </div>

                                                                    {(course.course_type ===
                                                                        "paid" ||
                                                                        course.course_type ===
                                                                        "combo") && (

                                                                            <div className="d-flex align-items-center mt-2 text-warning small">

                                                                                {[1, 2, 3, 4, 5].map(
                                                                                    (star) => (
                                                                                        <i
                                                                                            key={star}
                                                                                            className="bi bi-star-fill pe-1"
                                                                                        ></i>
                                                                                    )
                                                                                )}

                                                                                <span className="text-muted small ps-1">
                                                                                    (
                                                                                    {course.rating ||
                                                                                        "4.6"}
                                                                                    )
                                                                                </span>

                                                                            </div>

                                                                        )}

                                                                </div>

                                                                <div className="d-flex align-items-center gap-2">

                                                                    {course.course_type ===
                                                                        "paid" ||
                                                                        course.course_type ===
                                                                        "combo" ? (

                                                                        <>

                                                                            <span className="new_price text-primary fw-bold">
                                                                                ₹{" "}
                                                                                {course.buy_price}
                                                                            </span>

                                                                            <span className="old_price text-muted small">

                                                                                <s>
                                                                                    ₹{" "}
                                                                                    {course.mrp_price}
                                                                                </s>

                                                                            </span>

                                                                        </>

                                                                    ) : (

                                                                        course.course_type ===
                                                                        "free" && (

                                                                            <div className="recorded_course_duration text-warning small">

                                                                                {[1, 2, 3, 4, 5].map(
                                                                                    (star) => (
                                                                                        <i
                                                                                            key={star}
                                                                                            className="bi bi-star-fill pe-1"
                                                                                        ></i>
                                                                                    )
                                                                                )}

                                                                                <span className="text-muted small ps-1">
                                                                                    (4.6)
                                                                                </span>

                                                                            </div>

                                                                        )

                                                                    )}

                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* Badge */}

                                                        <div
                                                            className={
                                                                course.course_type ===
                                                                    "paid"
                                                                    ? "paid_butt"
                                                                    : course.course_type ===
                                                                        "free"
                                                                        ? "free_butt"
                                                                        : "paid_butt"
                                                            }
                                                        >

                                                            {course.course_type ===
                                                                "paid"
                                                                ? "Paid"
                                                                : course.course_type ===
                                                                    "free"
                                                                    ? "Free"
                                                                    : "Combo"}

                                                        </div>

                                                    </div>

                                                </Link>

                                            </div>

                                        );
                                    })

                                ) : (

                                    <div className="col-12 text-center py-5">

                                        <div className="prof_empty_card">

                                            <div className="empty_illustration_wrap">
                                                <i className="bi bi-search"></i>
                                            </div>

                                            <h3>
                                                No recorded courses found
                                            </h3>

                                            <p>
                                                Try searching for a different
                                                keyword.
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}