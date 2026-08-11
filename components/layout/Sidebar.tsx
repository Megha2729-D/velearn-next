"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import "./Styles/Sidebar.css"

interface SidebarProps {
    recordedCoursesCount?: number;
    liveCoursesCount?: number;
    activePage?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

interface StoredUser {
    id?: number | string;
    auth_id?: number | string;
    name?: string;
    email?: string;
    image?: string;
}

const BASE_API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://velearn.in/velearn-crm/api/";

export default function Sidebar({
    recordedCoursesCount = 0,
    liveCoursesCount = 0,
    activePage = "profile",
    isOpen = false,
    onClose,
}: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [isLiveOpen, setIsLiveOpen] = useState(false);

    const [storedUser, setStoredUser] =
        useState<StoredUser | null>(null);

    const [recordedCount, setRecordedCount] =
        useState(recordedCoursesCount || 0);

    const [liveCount, setLiveCount] =
        useState(liveCoursesCount || 0);

    const [userId, setUserId] =
        useState<number | string | null>(null);

    // --------------------------------------------------
    // GET USER FROM LOCAL STORAGE
    // --------------------------------------------------

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const userString =
                localStorage.getItem("user");

            if (!userString) {
                console.warn(
                    "Sidebar: No user found in localStorage"
                );
                return;
            }

            const user: StoredUser =
                JSON.parse(userString);

            setStoredUser(user);

            const id = user?.id || user?.auth_id;

            setUserId(id || null);
        } catch (error) {
            console.error(
                "Sidebar: Error reading user from localStorage:",
                error
            );
        }
    }, []);

    // --------------------------------------------------
    // SYNC RECORDED COURSE COUNT FROM PROPS
    // --------------------------------------------------

    useEffect(() => {
        if (
            recordedCoursesCount !== undefined &&
            recordedCoursesCount !== 0
        ) {
            console.log(
                "Sidebar: sync recordedCoursesCount from props:",
                recordedCoursesCount
            );

            setRecordedCount(
                recordedCoursesCount
            );
        }
    }, [recordedCoursesCount]);

    // --------------------------------------------------
    // SYNC LIVE COURSE COUNT FROM PROPS
    // --------------------------------------------------

    useEffect(() => {
        if (
            liveCoursesCount !== undefined &&
            liveCoursesCount !== 0
        ) {
            console.log(
                "Sidebar: sync liveCoursesCount from props:",
                liveCoursesCount
            );

            setLiveCount(liveCoursesCount);
        }
    }, [liveCoursesCount]);

    // --------------------------------------------------
    // FETCH COURSE COUNTS
    // --------------------------------------------------

    useEffect(() => {
        if (!userId) {
            console.warn(
                "Sidebar: No userId found in localStorage"
            );
            return;
        }

        const fetchCounts = async () => {
            console.log(
                "Sidebar useEffect mount.",
                "userId:",
                userId,
                "recordedCount:",
                recordedCount,
                "liveCount:",
                liveCount,
                "BASE_API_URL:",
                BASE_API_URL
            );

            // --------------------------------------------------
            // RECORDED COURSE COUNT
            // --------------------------------------------------

            if (recordedCount === 0) {
                try {
                    console.log(
                        "Sidebar: Fetching recorded courses for count..."
                    );

                    const response = await fetch(
                        `${BASE_API_URL}my-courses/${userId}`
                    );

                    console.log(
                        "Sidebar: Fetch courses response status:",
                        response.status
                    );

                    const data = await response.json();

                    console.log(
                        "Sidebar: Fetch courses response data:",
                        data
                    );

                    if (data.status) {
                        const count =
                            data.data?.all?.length || 0;

                        setRecordedCount(count);

                        console.log(
                            "Sidebar: Set recordedCount to:",
                            count
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching recorded courses count in Sidebar:",
                        error
                    );
                }
            }

            // --------------------------------------------------
            // LIVE COURSE COUNT
            // --------------------------------------------------

            if (liveCount === 0) {
                try {
                    console.log(
                        "Sidebar: Fetching live courses for count..."
                    );

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    const headers: HeadersInit =
                        token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {};

                    const response = await fetch(
                        `${BASE_API_URL}live-course-history/${userId}`,
                        {
                            headers,
                        }
                    );

                    console.log(
                        "Sidebar: Fetch live response status:",
                        response.status
                    );

                    const data = await response.json();

                    console.log(
                        "Sidebar: Fetch live response data:",
                        data
                    );

                    if (data.status) {
                        const count =
                            data.data?.length || 0;

                        setLiveCount(count);

                        console.log(
                            "Sidebar: Set liveCount to:",
                            count
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching live courses count in Sidebar:",
                        error
                    );
                }
            }
        };

        fetchCounts();
    }, [userId]);

    // --------------------------------------------------
    // OPEN LIVE DROPDOWN AUTOMATICALLY
    // --------------------------------------------------

    const liveSubPages = [
        "live-dash",
        "live-course-history",
        "assignments",
        "projects",
        "doubt-support",
        "support",
        "placement",
    ];

    const isLiveActive =
        liveSubPages.includes(activePage);

    useEffect(() => {
        if (isLiveActive) {
            setIsLiveOpen(true);
        }
    }, [isLiveActive]);

    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
        }

        router.push("/login");

        toast.success(
            "Logged out successfully"
        );
    };

    // --------------------------------------------------
    // USER NAME
    // --------------------------------------------------

    const userName =
        storedUser?.name || "Velearn";

    const firstLetter =
        userName.charAt(0).toUpperCase();

    // --------------------------------------------------
    // CLOSE SIDEBAR AFTER NAVIGATION
    // --------------------------------------------------

    const handleNavigation = () => {
        if (onClose) {
            onClose();
        }
    };

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <aside
            className={`dash_sidebar ${isOpen ? "open" : ""
                }`}
        >
            {/* ==========================================
                SIDEBAR LOGO / USER
            ========================================== */}

            <div className="sidebar_logo d-flex justify-content-between align-items-center">

                <div
                    className="d-flex align-items-center"
                    style={{
                        gap: "12px",
                    }}
                >
                    <div className="logo_icon">
                        {firstLetter}
                    </div>

                    <span className="logo_text">
                        {userName}
                    </span>
                </div>

                <button
                    type="button"
                    className="btn_close_sidebar d-lg-none"
                    onClick={onClose}
                >
                    <i className="bi bi-x-lg"></i>
                </button>

            </div>

            {/* ==========================================
                SIDEBAR MENU
            ========================================== */}

            <nav className="sidebar_menu">

                <div className="menu_group">

                    {/* ==================================
                        MAIN
                    ================================== */}

                    <span className="menu_label">
                        Main
                    </span>

                    <Link
                        href="/profile"
                        onClick={handleNavigation}
                        className={`menu_item ${activePage === "profile"
                            ? "active"
                            : ""
                            }`}
                    >
                        <i className="bi bi-person-fill"></i>

                        My Profile
                    </Link>

                    <Link
                        href="/explore-courses"
                        onClick={handleNavigation}
                        className={`menu_item ${activePage === "explore"
                            ? "active"
                            : ""
                            }`}
                    >
                        <i className="bi bi-search"></i>

                        Explore
                    </Link>

                    {/* ==================================
                        LEARNING
                    ================================== */}

                    <span className="menu_label">
                        Learning
                    </span>

                    <Link
                        href="/meetings"
                        onClick={handleNavigation}
                        className={`menu_item ${activePage === "live"
                            ? "active"
                            : ""
                            }`}
                    >
                        <i className="bi bi-camera-video"></i>

                        Meetings
                    </Link>

                    {/* ==================================
                        LIVE COURSES DROPDOWN
                    ================================== */}

                    <div
                        className={`menu_item dropdown_trigger ${isLiveOpen ? "open" : ""
                            } ${isLiveActive
                                ? "active"
                                : ""
                            }`}
                        onClick={() =>
                            setIsLiveOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        style={{
                            cursor: "pointer",
                            fontWeight: 700,
                        }}
                    >
                        <i
                            className="bi bi-mortarboard-fill"
                            style={{
                                fontSize: "1.2rem",
                            }}
                        ></i>

                        <span>
                            Live Courses
                        </span>

                        <div className="ms-auto d-flex align-items-center">

                            <span className="dot_red me-2"></span>

                            <i
                                className={`bi bi-chevron-${isLiveOpen
                                    ? "up"
                                    : "down"
                                    }`}
                                style={{
                                    fontSize:
                                        "0.8rem",
                                }}
                            ></i>

                        </div>
                    </div>

                    {/* ==================================
                        LIVE SUB MENU
                    ================================== */}

                    {(isLiveOpen ||
                        isLiveActive) && (
                            <div className="dropdown_content ps-3">

                                <Link
                                    href="/live-dashboard"
                                    onClick={
                                        handleNavigation
                                    }
                                    className={`menu_item submenu_item ${activePage ===
                                        "live-dash"
                                        ? "active"
                                        : ""
                                        }`}
                                >
                                    <i className="bi bi-grid-1x2"></i>

                                    Dashboard
                                </Link>

                                <Link
                                    href="/live-course-history"
                                    onClick={
                                        handleNavigation
                                    }
                                    className={`menu_item submenu_item ${activePage ===
                                        "live-course-history"
                                        ? "active"
                                        : ""
                                        }`}
                                >
                                    <i className="bi bi-play-circle"></i>

                                    Classes
                                </Link>

                                <Link
                                    href="/assignments"
                                    onClick={
                                        handleNavigation
                                    }
                                    className={`menu_item submenu_item ${activePage ===
                                        "assignments"
                                        ? "active"
                                        : ""
                                        }`}
                                >
                                    <i className="bi bi-pencil-square"></i>

                                    Assignments
                                </Link>

                                <Link
                                    href="/projects"
                                    onClick={
                                        handleNavigation
                                    }
                                    className={`menu_item submenu_item ${activePage ===
                                        "projects"
                                        ? "active"
                                        : ""
                                        }`}
                                >
                                    <i className="bi bi-diamond-half"></i>

                                    Projects
                                </Link>

                                <Link
                                    href="/doubt-support"
                                    onClick={
                                        handleNavigation
                                    }
                                    className={`menu_item submenu_item ${activePage ===
                                        "doubt-support" ||
                                        activePage ===
                                        "support"
                                        ? "active"
                                        : ""
                                        }`}
                                >
                                    <i className="bi bi-chat-left-dots"></i>

                                    Doubt Support
                                </Link>

                                <Link
                                    href="/placement"
                                    onClick={
                                        handleNavigation
                                    }
                                    className={`menu_item submenu_item ${activePage ===
                                        "placement"
                                        ? "active"
                                        : ""
                                        }`}
                                >
                                    <i className="bi bi-bullseye"></i>

                                    Placement
                                </Link>

                            </div>
                        )}

                    {/* ==================================
                        MY COURSES
                    ================================== */}

                    <Link
                        href="/my-courses"
                        onClick={handleNavigation}
                        className={`menu_item ${activePage ===
                            "my-courses"
                            ? "active"
                            : ""
                            }`}
                    >
                        <i className="bi bi-journal-bookmark-fill"></i>

                        My Courses

                        <span
                            className="badge bg-primary text-white ms-auto rounded-pill px-2"
                            style={{
                                fontSize: "10px",
                            }}
                        >
                            {recordedCount +
                                liveCount}
                        </span>
                    </Link>

                    {/* ==================================
                        EVENTS
                    ================================== */}

                    <span className="menu_label">
                        Events
                    </span>

                    <Link
                        href="/webinars"
                        onClick={handleNavigation}
                        className={`menu_item ${activePage === "webinar"
                            ? "active"
                            : ""
                            }`}
                    >
                        <i className="bi bi-broadcast"></i>

                        Webinars
                    </Link>

                </div>

            </nav>

            {/* ==========================================
                LOGOUT
            ========================================== */}

            <div className="logout_section">

                <div
                    className="menu_item btn_logout_dash"
                    onClick={handleLogout}
                    style={{
                        margin: "0 15px",
                        borderRadius: "12px",
                        cursor: "pointer",
                    }}
                >
                    <i className="bi bi-box-arrow-left"></i>

                    Logout
                </div>

            </div>

        </aside>
    );
}