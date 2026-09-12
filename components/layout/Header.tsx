"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Styles/Header.css";

// const BASE_API_URL = "http://localhost:5000/api/";
const BASE_API_URL = "https://crm.velearn.in/api/";

const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";

const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

interface User {
    id: number;
    name: string;
    email: string;
    image?: string;
}

interface Course {
    id: number;
    title: string;
    slug: string;
    course_type: string;
}

interface SearchResult {
    id: number | string;
    title: string;
    slug?: string;
    type: "recorded" | "live";
    route?: string;
    course_type?: string;
}

const LIVE_COURSE_ROUTES: Record<string, string> = {
    "Full Stack Web Development":
        "/live-course/full-stack-development",

    "UI UX Design":
        "/live-course/ui-ux-design",

    "Digital Marketing":
        "/live-course/digital-marketing",

    "Data Science":
        "/live-course/data-science-and-machine-learning",

    "Data Analytics":
        "/live-course/data-analytics",
};

const COURSE_LIST_ROUTES = {
    paid: "/recorded-course#paid",
    combo: "/recorded-course#combo",
    free: "/recorded-course#free",
};

type MenuKey =
    | "company"
    | "loans"
    | "investors"
    | "care"
    | "contact"
    | null;

type MobileMenu =
    | "self-paced-courses"
    | "paid-courses"
    | "paid-combo"
    | "free-courses"
    | "live-courses"
    | "resources"
    | null;

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    /* ================= USER ================= */

    const [userDropdownOpen, setUserDropdownOpen] =
        useState(false);

    const [user, setUser] =
        useState<User | null>(null);

    const [enrolledCourses, setEnrolledCourses] =
        useState<Course[]>([]);

    /* ================= DESKTOP MENU ================= */

    const [openMenu, setOpenMenu] =
        useState<MenuKey>(null);

    /* ================= MOBILE MENU ================= */

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const [mobileMenu, setMobileMenu] =
        useState<MobileMenu>(null);

    /* ================= OTHER STATES ================= */

    const [scrolled, setScrolled] =
        useState(false);

    const [paidCourses, setPaidCourses] =
        useState<Course[]>([]);

    const [comboCourses, setComboCourses] =
        useState<Course[]>([]);

    const [freeCourses, setFreeCourses] =
        useState<Course[]>([]);

    const [searchQuery, setSearchQuery] =
        useState("");

    const [searchResults, setSearchResults] =
        useState<SearchResult[]>([]);

    const [showResults, setShowResults] =
        useState(false);

    const dropdownRef =
        useRef<HTMLDivElement>(null);

    const searchRef =
        useRef<HTMLDivElement>(null);

    /* =========================================================
       LOAD USER
    ========================================================= */

    useEffect(() => {
        const loadUser = async () => {
            const storedUser =
                localStorage.getItem("user");

            if (!storedUser) {
                setUser(null);
                setEnrolledCourses([]);
                return;
            }

            try {
                const parsedUser: User =
                    JSON.parse(storedUser);

                setUser(parsedUser);

                const token =
                    localStorage.getItem("token");

                const res = await axios.get(
                    `https://crm.velearn.in/api/my-courses/${parsedUser.id}`,
                    {
                        headers: token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {},
                    }
                );

                if (res.data.status) {
                    setEnrolledCourses(
                        res.data.data.all || []
                    );
                }
            } catch (error) {
                console.log(
                    "User loading error:",
                    error
                );

                setUser(null);
                setEnrolledCourses([]);
            }
        };

        loadUser();

        window.addEventListener(
            "storage-update",
            loadUser
        );

        return () => {
            window.removeEventListener(
                "storage-update",
                loadUser
            );
        };
    }, []);

    /* =========================================================
       LOAD RECORDED COURSES
    ========================================================= */

    useEffect(() => {
        axios
            .get(`${BASE_API_URL}recorded-course`)
            .then((res) => {
                if (res.data.status) {
                    const courses: Course[] =
                        res.data.data || [];

                    setPaidCourses(
                        courses
                            .filter(
                                (course) =>
                                    course.course_type ===
                                    "paid"
                            )
                            .slice(0, 5)
                    );

                    setComboCourses(
                        courses
                            .filter(
                                (course) =>
                                    course.course_type ===
                                    "combo"
                            )
                            .slice(0, 5)
                    );

                    setFreeCourses(
                        courses
                            .filter(
                                (course) =>
                                    course.course_type ===
                                    "free"
                            )
                            .slice(0, 5)
                    );
                }
            })
            .catch((error) => {
                console.log(
                    "Course loading error:",
                    error
                );
            });
    }, []);

    /* =========================================================
       SCROLL
    ========================================================= */

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener(
            "scroll",
            onScroll
        );

        return () => {
            window.removeEventListener(
                "scroll",
                onScroll
            );
        };
    }, []);

    /* =========================================================
       DESKTOP MENU
    ========================================================= */

    const toggleMenu = (menu: MenuKey) => {
        setOpenMenu((prev) =>
            prev === menu ? null : menu
        );
    };

    const handleItemClick = () => {
        setOpenMenu(null);
    };

    /* =========================================================
       USER MENU
    ========================================================= */

    const handleUserMenuClick = () => {
        setUserDropdownOpen(false);
    };

    const getProfileImage = () => {
        if (!user?.image) {
            return "/images/icons/user.png";
        }

        if (user.image.startsWith("http")) {
            return user.image;
        }

        const imageName =
            user.image.split("/").pop();

        return `https://crm.velearn.in/public/uploads/students/${imageName}`;
    };

    /* =========================================================
       MOBILE MENU
    ========================================================= */

    const openMobileMenu = (
        menu: MobileMenu
    ) => {
        setMobileMenu(menu);
    };

    const closeMobileMenu = () => {
        setMobileMenu(null);
    };

    const closeAllMobile = () => {
        setMobileOpen(false);
        setMobileMenu(null);
    };

    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);
        setUserDropdownOpen(false);

        router.push("/login");
    };

    /* =========================================================
       SEARCH
    ========================================================= */

    const normalize = (str: string) =>
        str
            .toLowerCase()
            .replace(/\s+/g, "");

    const handleSearch = async (
        value: string
    ) => {
        setSearchQuery(value);

        if (!value.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const recordedRes =
                await axios.get(
                    `${BASE_API_URL}recorded-course`
                );

            const recordedCourses =
                recordedRes.data?.data || [];

            const recorded: SearchResult[] =
                recordedCourses.map(
                    (course: Course) => ({
                        id: course.id,
                        title: course.title,
                        slug: course.slug,
                        course_type:
                            course.course_type,
                        type: "recorded",
                    })
                );

            const live: SearchResult[] =
                Object.keys(
                    LIVE_COURSE_ROUTES
                ).map((title) => ({
                    id: title,
                    title,
                    type: "live",
                    route:
                        LIVE_COURSE_ROUTES[
                        title
                        ],
                }));

            const allCourses = [
                ...recorded,
                ...live,
            ];

            const filtered =
                allCourses.filter(
                    (course) =>
                        normalize(
                            course.title
                        ).includes(
                            normalize(value)
                        )
                );

            setSearchResults(
                filtered.slice(0, 8)
            );

            setShowResults(true);
        } catch (error) {
            console.log(
                "Search error:",
                error
            );
        }
    };

    /* =========================================================
       NAVBAR STYLE
    ========================================================= */

    const isNavbarTwo =
        pathname ===
        "/live-course/digital-marketing" ||
        pathname ===
        "/live-course/data-analytics" ||
        pathname ===
        "/live-course/data-science-and-machine-learning";

    /* =========================================================
       SEARCH RESULT LINK
    ========================================================= */

    const getSearchResultHref = (
        item: SearchResult
    ) => {
        if (item.type === "live") {
            return item.route || "/";
        }

        const isEnrolled =
            enrolledCourses.some(
                (course) =>
                    course.id === item.id
            );

        return isEnrolled
            ? `/learn/${item.slug}`
            : `/course-details/${item.slug}`;
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <>
            {/* =================================================
                TOP BANNER
            ================================================= */}

            <div className="top-banner">
                <p className="mb-0 py-1">
                    New batch offer live. Start
                    your IT journey now.
                </p>
            </div>

            <header className={`velearn-header v-navbar ${scrolled ? "fixed-nav" : ""
                } ${isNavbarTwo ? "navbar_two" : ""}`}>

                {/* =================================================
                    DESKTOP HEADER
                ================================================= */}

                <div className="desktop-header">
                    <div className="kmbf-container top-header">

                        {/* LOGO */}

                        <Link href="/">
                            <div className="logo-section">
                                <Image
                                    src={"/images/velearn-logo.png"}
                                    alt="Velearn Logo"
                                    height={100}
                                    width={220}
                                />
                            </div>
                        </Link>

                        {/* =================================================
                            DESKTOP NAVIGATION
                        ================================================= */}

                        <nav className="nav-links">
                            <ul className="kmbf-container main-menu">

                                {/* =================================================
                                    SELF PACED COURSES
                                ================================================= */}

                                <li
                                    className="desktop-dropdown"
                                    onMouseEnter={() =>
                                        setOpenMenu(
                                            "investors"
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setOpenMenu(
                                            null
                                        )
                                    }
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleMenu(
                                                "investors"
                                            )
                                        }
                                        className={`menu-button ${openMenu ===
                                            "investors"
                                            ? "active"
                                            : ""
                                            }`}
                                    >
                                        Self Paced
                                        Courses

                                        <i className="bi bi-chevron-down"></i>
                                    </button>

                                    <ul className="desktop-submenu investors-menu">

                                        {/* PAID */}

                                        <li className="nested-dropdown">
                                            <button type="button">
                                                Paid
                                                Courses

                                                <span>
                                                    ›
                                                </span>
                                            </button>

                                            <ul className="nested-submenu">

                                                {paidCourses.length >
                                                    0 ? (
                                                    paidCourses.map(
                                                        (
                                                            course
                                                        ) => (
                                                            <li
                                                                key={
                                                                    course.id
                                                                }
                                                            >
                                                                <Link
                                                                    href={`/course-details/${course.slug}`}
                                                                    onClick={
                                                                        handleItemClick
                                                                    }
                                                                >
                                                                    {
                                                                        course.title
                                                                    }
                                                                </Link>
                                                            </li>
                                                        )
                                                    )
                                                ) : (
                                                    <li>
                                                        <span className="course-loading">
                                                            No paid
                                                            courses
                                                            found
                                                        </span>
                                                    </li>
                                                )}

                                                <li className="view-all-course">
                                                    <Link
                                                        href={
                                                            COURSE_LIST_ROUTES.paid
                                                        }
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                    >
                                                        View All
                                                        Paid
                                                    </Link>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* COMBO */}

                                        <li className="nested-dropdown">
                                            <button type="button">
                                                Paid Combo

                                                <span>
                                                    ›
                                                </span>
                                            </button>

                                            <ul className="nested-submenu">

                                                {comboCourses.length >
                                                    0 ? (
                                                    comboCourses.map(
                                                        (
                                                            course
                                                        ) => (
                                                            <li
                                                                key={
                                                                    course.id
                                                                }
                                                            >
                                                                <Link
                                                                    href={`/course-details/${course.slug}`}
                                                                    onClick={
                                                                        handleItemClick
                                                                    }
                                                                >
                                                                    {
                                                                        course.title
                                                                    }
                                                                </Link>
                                                            </li>
                                                        )
                                                    )
                                                ) : (
                                                    <li>
                                                        <span className="course-loading">
                                                            No combo
                                                            courses
                                                            found
                                                        </span>
                                                    </li>
                                                )}

                                                <li className="view-all-course">
                                                    <Link
                                                        href={
                                                            COURSE_LIST_ROUTES.combo
                                                        }
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                    >
                                                        View All
                                                        Combo
                                                    </Link>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* FREE */}

                                        <li className="nested-dropdown">
                                            <button type="button">
                                                Free Courses

                                                <span>
                                                    ›
                                                </span>
                                            </button>

                                            <ul className="nested-submenu">

                                                {freeCourses.length >
                                                    0 ? (
                                                    freeCourses.map(
                                                        (
                                                            course
                                                        ) => (
                                                            <li
                                                                key={
                                                                    course.id
                                                                }
                                                            >
                                                                <Link
                                                                    href={`/course-details/${course.slug}`}
                                                                    onClick={
                                                                        handleItemClick
                                                                    }
                                                                >
                                                                    {
                                                                        course.title
                                                                    }
                                                                </Link>
                                                            </li>
                                                        )
                                                    )
                                                ) : (
                                                    <li>
                                                        <span className="course-loading">
                                                            No free
                                                            courses
                                                            found
                                                        </span>
                                                    </li>
                                                )}

                                                <li className="view-all-course">
                                                    <Link
                                                        href={
                                                            COURSE_LIST_ROUTES.free
                                                        }
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                    >
                                                        View All
                                                        Free
                                                    </Link>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>

                                {/* =================================================
                                    LIVE COURSES
                                ================================================= */}

                                <li
                                    className="desktop-dropdown"
                                    onMouseEnter={() =>
                                        setOpenMenu(
                                            "company"
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setOpenMenu(
                                            null
                                        )
                                    }
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleMenu(
                                                "company"
                                            )
                                        }
                                        className={`menu-button ${openMenu ===
                                            "company"
                                            ? "active"
                                            : ""
                                            }`}
                                    >
                                        Live Courses

                                        <i className="bi bi-chevron-down"></i>
                                    </button>

                                    <ul className="desktop-submenu">

                                        {Object.entries(
                                            LIVE_COURSE_ROUTES
                                        ).map(
                                            ([
                                                title,
                                                route,
                                            ]) => (
                                                <li
                                                    key={
                                                        title
                                                    }
                                                >
                                                    <Link
                                                        href={
                                                            route
                                                        }
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                    >
                                                        {
                                                            title
                                                        }
                                                    </Link>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </li>

                                {/* =================================================
                                    RESOURCES
                                ================================================= */}

                                <li
                                    className="desktop-dropdown"
                                    onMouseEnter={() =>
                                        setOpenMenu(
                                            "care"
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setOpenMenu(
                                            null
                                        )
                                    }
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleMenu(
                                                "care"
                                            )
                                        }
                                        className={`menu-button ${openMenu ===
                                            "care"
                                            ? "active"
                                            : ""
                                            }`}
                                    >
                                        Resources

                                        <i className="bi bi-chevron-down"></i>
                                    </button>

                                    <ul className="desktop-submenu">

                                        <li>
                                            <Link
                                                href="/webinar"
                                                onClick={
                                                    handleItemClick
                                                }
                                            >
                                                Webinars
                                            </Link>
                                        </li>

                                        <li>
                                            <Link
                                                href="/refer-and-earn"
                                                onClick={
                                                    handleItemClick
                                                }
                                            >
                                                Referral
                                            </Link>
                                        </li>

                                        <li>
                                            <Link
                                                href="/blogs"
                                                onClick={
                                                    handleItemClick
                                                }
                                            >
                                                Blog
                                            </Link>
                                        </li>

                                        <li>
                                            <Link
                                                href="/faq"
                                                onClick={
                                                    handleItemClick
                                                }
                                            >
                                                FAQ
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </nav>

                        {/* =================================================
                            DESKTOP RIGHT
                        ================================================= */}

                        <div className="nav-contact">

                            <div className="d-flex right_nav_icons">

                                {/* SEARCH */}

                                <div
                                    className="d-lg-flex d-none align-items-center me-3"
                                    ref={
                                        searchRef
                                    }
                                >
                                    <div className="search_parent position-relative">

                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-search"></i>

                                            <input
                                                type="search"
                                                placeholder="Search for course..."
                                                className="nav_search_input"
                                                value={
                                                    searchQuery
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleSearch(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                onFocus={() =>
                                                    searchResults.length &&
                                                    setShowResults(
                                                        true
                                                    )
                                                }
                                            />
                                        </div>

                                        {showResults && (
                                            <div className="position-relative">

                                                <div className="blog_search_results_box">

                                                    {searchResults.length >
                                                        0 ? (
                                                        searchResults.map(
                                                            (
                                                                item
                                                            ) => (
                                                                <Link
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    href={getSearchResultHref(
                                                                        item
                                                                    )}
                                                                    className="blog_search_result_item"
                                                                    onClick={() =>
                                                                        setShowResults(
                                                                            false
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        item.title
                                                                    }
                                                                </Link>
                                                            )
                                                        )
                                                    ) : (
                                                        <div className="blog_search_result_item">
                                                            No
                                                            courses
                                                            found
                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* USER */}

                                <div className="d-flex align-items-center gap-2">

                                    {!user ? (
                                        <>
                                            <Link
                                                href="/login"
                                                className="btn_login"
                                            >
                                                Login
                                            </Link>

                                            <Link
                                                href="/signup"
                                                className="btn_signup d-lg-flex d-none"
                                            >
                                                Sign Up
                                            </Link>
                                        </>
                                    ) : (
                                        <div
                                            className="user-dropdown h-100 d-flex position-relative"
                                            ref={
                                                dropdownRef
                                            }
                                            onMouseEnter={() =>
                                                window.innerWidth >
                                                500 &&
                                                setUserDropdownOpen(
                                                    true
                                                )
                                            }
                                            onMouseLeave={() =>
                                                window.innerWidth >
                                                500 &&
                                                setUserDropdownOpen(
                                                    false
                                                )
                                            }
                                        >

                                            <div
                                                className={`avatar-icon ${userDropdownOpen
                                                    ? "active"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    setUserDropdownOpen(
                                                        !userDropdownOpen
                                                    )
                                                }
                                            >
                                                <Image
                                                    src={getProfileImage()}
                                                    alt="User"
                                                    height={
                                                        100
                                                    }
                                                    width={
                                                        100
                                                    }
                                                />
                                            </div>

                                            {userDropdownOpen && (
                                                <div className="dropdown-menu-custom">

                                                    <div className="user-info">
                                                        <strong>
                                                            {
                                                                user.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                user.email
                                                            }
                                                        </small>
                                                    </div>

                                                    <ul>

                                                        <li>
                                                            <Link
                                                                href="/profile"
                                                                onClick={
                                                                    handleUserMenuClick
                                                                }
                                                            >
                                                                Dashboard
                                                            </Link>
                                                        </li>

                                                        <li>
                                                            <Link
                                                                href="/change-password"
                                                                onClick={
                                                                    handleUserMenuClick
                                                                }
                                                            >
                                                                Change
                                                                Password
                                                            </Link>
                                                        </li>

                                                        <li>
                                                            <Link
                                                                href="/faq"
                                                                onClick={
                                                                    handleUserMenuClick
                                                                }
                                                            >
                                                                FAQ
                                                            </Link>
                                                        </li>

                                                        <li
                                                            className="logout"
                                                            onClick={
                                                                handleLogout
                                                            }
                                                        >
                                                            Sign
                                                            Out
                                                        </li>

                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    MOBILE HEADER
                ================================================= */}

                <div className="mobile-nav-header">

                    <button
                        type="button"
                        className="mobile-menu-button"
                        onClick={() =>
                            setMobileOpen(true)
                        }
                        aria-label="Open menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <div className="logo d-flex align-items-center justify-content-center">
                        <Image
                            src={"/images/velearn-logo.png"}
                            alt="Velearn Logo"
                            height={100}
                            width={220}
                        />
                    </div>

                    <div className="d-flex right_nav_icons">

                        <div className="d-flex align-items-center gap-2">

                            {!user ? (
                                <Link
                                    href="/login"
                                    className="btn_login"
                                >
                                    Login
                                </Link>
                            ) : (
                                <div
                                    className="user-dropdown h-100 d-flex position-relative"
                                    ref={
                                        dropdownRef
                                    }
                                >

                                    <div
                                        className={`avatar-icon ${userDropdownOpen
                                            ? "active"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            setUserDropdownOpen(
                                                !userDropdownOpen
                                            )
                                        }
                                    >
                                        <Image
                                            src={getProfileImage()}
                                            alt="User"
                                            height={100}
                                            width={100}
                                        />
                                    </div>

                                    {userDropdownOpen && (
                                        <div className="dropdown-menu-custom">

                                            <div className="user-info">
                                                <strong>
                                                    {
                                                        user.name
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        user.email
                                                    }
                                                </small>
                                            </div>

                                            <ul>

                                                <li>
                                                    <Link
                                                        href="/profile"
                                                        onClick={
                                                            handleUserMenuClick
                                                        }
                                                    >
                                                        Dashboard
                                                    </Link>
                                                </li>

                                                <li>
                                                    <Link
                                                        href="/change-password"
                                                        onClick={
                                                            handleUserMenuClick
                                                        }
                                                    >
                                                        Change
                                                        Password
                                                    </Link>
                                                </li>

                                                <li>
                                                    <Link
                                                        href="/faq"
                                                        onClick={
                                                            handleUserMenuClick
                                                        }
                                                    >
                                                        FAQ
                                                    </Link>
                                                </li>

                                                <li
                                                    className="logout"
                                                    onClick={
                                                        handleLogout
                                                    }
                                                >
                                                    Sign
                                                    Out
                                                </li>

                                            </ul>
                                        </div>
                                    )}

                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* =================================================
                    MOBILE OVERLAY
                ================================================= */}

                {mobileOpen && (
                    <div
                        className="mobile-overlay"
                        onClick={
                            closeAllMobile
                        }
                    ></div>
                )}

                {/* =================================================
                    MOBILE SIDEBAR
                ================================================= */}
                <aside
                    className={`mobile-sidebar ${mobileOpen ? "mobile-sidebar-open" : ""
                        }`}
                >
                    {/* =================================================
                            SIDEBAR SCROLLABLE CONTENT
                        ================================================= */}
                    <div className="mobile-sidebar-content">

                        {/* =================================================
                                SIDEBAR HEADER
                            ================================================= */}
                        <div className="mobile-sidebar-header">

                            <Link
                                href="/"
                                className="mobile-sidebar-logo"
                                onClick={closeAllMobile}
                            >
                                <div className="logo-section mbl_inner_logo">
                                    <Image
                                        src={
                                            isNavbarTwo
                                                ? "/images/logo-white.png"
                                                : "/images/velearn-logo.png"
                                        }
                                        alt="Velearn Logo"
                                        height={100}
                                        width={220}
                                    />
                                </div>
                            </Link>

                            <button
                                type="button"
                                onClick={closeAllMobile}
                                className="mobile-close-button"
                                aria-label="Close menu"
                            >
                                <i className="bi bi-x-lg text-black"></i>
                            </button>

                        </div>

                        {/* =================================================
                                MOBILE MAIN MENU
                                DO NOT CHANGE
                            ================================================= */}
                        {mobileMenu === null && (
                            <>
                                <ul className="mobile-main-menu">

                                    {/* SELF PACED */}

                                    <li>
                                        <div className="mbl_nav_icon" style={{ backgroundColor: "#083ddb26" }}>
                                            <i className="bi bi-mortarboard-fill" style={{ color: "#083ddb" }}></i>
                                        </div>
                                        <button
                                            type="button"
                                            className="d-flex"
                                            onClick={() =>
                                                openMobileMenu(
                                                    "self-paced-courses"
                                                )
                                            }
                                        >
                                            <p className="mbl_inner_sub">
                                                Self-Paced Courses
                                                <span>Learn at your own pace, anytime</span>
                                            </p>
                                            <span>
                                                ›
                                            </span>
                                        </button>
                                    </li>

                                    {/* LIVE */}

                                    <li>
                                        <div className="mbl_nav_icon" style={{ backgroundColor: "#1c168f26" }}>
                                            <i className="bi bi-file-earmark-play-fill" style={{ color: "#1c168f" }}></i>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openMobileMenu(
                                                    "live-courses"
                                                )
                                            }
                                        >
                                            <p className="mbl_inner_sub">
                                                Live Courses
                                                <span>Join live sessions & interact</span>
                                            </p>
                                            <span>
                                                ›
                                            </span>
                                        </button>
                                    </li>

                                    {/* RESOURCES */}

                                    <li>
                                        <div className="mbl_nav_icon" style={{ backgroundColor: "#16602726" }}>
                                            <i className="bi bi-file-earmark-bar-graph-fill" style={{ color: "#166027" }}></i>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openMobileMenu(
                                                    "resources"
                                                )
                                            }
                                        >
                                            <p className="mbl_inner_sub">
                                                Resources
                                                <span>Tools, guides & learning materials</span>
                                            </p>
                                            <span>
                                                ›
                                            </span>
                                        </button>
                                    </li>

                                </ul>

                                {/* =================================================
                                        QUICK LINKS
                                    ================================================= */}
                                <div className="mobile-quick-links">

                                    <div className="mobile-section-title">
                                        Quick Links
                                        <div></div>
                                    </div>

                                    <Link
                                        href="/about-us"
                                        onClick={closeAllMobile}
                                        className="mobile-quick-link"
                                    >
                                        <span>
                                            <div className="mbl_nav_icon" style={{ backgroundColor: "#0663f026" }}>
                                                <i className="bi bi-info-circle-fill" style={{ color: "#0663f0" }}></i>
                                            </div>
                                            About Us
                                        </span>
                                    </Link>

                                    <Link
                                        href="/contact-us"
                                        onClick={closeAllMobile}
                                        className="mobile-quick-link"
                                    >
                                        <span>
                                            <div className="mbl_nav_icon" style={{ backgroundColor: "#1c168f26" }}>
                                                <i className="bi bi-envelope-fill" style={{ color: "#1c168f" }}></i>
                                            </div>
                                            Contact Us
                                        </span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>

                                    <Link
                                        href="/doubt-support"
                                        onClick={closeAllMobile}
                                        className="mobile-quick-link"
                                    >
                                        <span>
                                            <div className="mbl_nav_icon" style={{ backgroundColor: "#16602726" }}>
                                                <i className="bi bi-headset" style={{ color: "#166027" }}></i>
                                            </div>
                                            Doubt Support
                                        </span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>

                                    <Link
                                        href="/faq"
                                        onClick={closeAllMobile}
                                        className="mobile-quick-link"
                                    >
                                        <span>
                                            <div className="mbl_nav_icon" style={{ backgroundColor: "#fe9f0b3d" }}>
                                                <i className="bi bi-question-circle-fill" style={{ color: "#fe9f0b" }}></i>
                                            </div>
                                            FAQs
                                        </span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>

                                    <Link
                                        href="/refund-policy"
                                        onClick={closeAllMobile}
                                        className="mobile-quick-link"
                                    >
                                        <span>
                                            <div className="mbl_nav_icon" style={{ backgroundColor: "#ec172e26" }}>
                                                <i className="bi bi-shield-shaded" style={{ color: "#ec172e" }}></i>
                                            </div>
                                            Refund Policy
                                        </span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>

                                </div>

                                {/* =================================================
                                        LEARNING CTA
                                    ================================================= */}
                                <div className="mobile-learning-card">
                                    <div className="mobile-learning-content">
                                        <p className="text-uppercase fw-bold">
                                            Start Learning Today
                                        </p>
                                        <h4 className="mb-2">
                                            Build real skills and take the next step in your career.
                                        </h4>
                                        <Link
                                            href="/recorded-course"
                                            onClick={closeAllMobile}
                                            className="mobile-learning-btn"
                                        >
                                            Explore Courses
                                            <i className="bi bi-arrow-right"></i>
                                        </Link>
                                    </div>
                                    <div className="mobile-learning-icon">
                                        <Image src={"/images/mobile-explore-img.webp"} className="w-100 h-auto" height={200} width={200} alt="" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* =================================================
                                SELF PACED COURSES
                            ================================================= */}
                        {mobileMenu === "self-paced-courses" && (
                            <MobileSubMenu
                                title="Self-Paced Courses"
                                onBack={closeMobileMenu}
                            >

                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openMobileMenu(
                                                "paid-courses"
                                            )
                                        }
                                    >
                                        Paid Courses
                                        <span>
                                            ›
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openMobileMenu(
                                                "paid-combo"
                                            )
                                        }
                                    >
                                        Paid Combo
                                        <span>
                                            ›
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openMobileMenu(
                                                "free-courses"
                                            )
                                        }
                                    >
                                        Free Courses
                                        <span>
                                            ›
                                        </span>
                                    </button>
                                </li>

                            </MobileSubMenu>
                        )}

                        {/* =================================================
                                PAID COURSES
                            ================================================= */}
                        {mobileMenu === "paid-courses" && (
                            <MobileCourseMenu
                                title="Paid Courses"
                                courses={paidCourses}
                                viewAllHref={COURSE_LIST_ROUTES.paid}
                                viewAllText="View All Paid"
                                onBack={() =>
                                    openMobileMenu(
                                        "self-paced-courses"
                                    )
                                }
                                onClose={closeAllMobile}
                            />
                        )}

                        {/* =================================================
                                PAID COMBO
                            ================================================= */}
                        {mobileMenu === "paid-combo" && (
                            <MobileCourseMenu
                                title="Paid Combo"
                                courses={comboCourses}
                                viewAllHref={COURSE_LIST_ROUTES.combo}
                                viewAllText="View All Combo"
                                onBack={() =>
                                    openMobileMenu(
                                        "self-paced-courses"
                                    )
                                }
                                onClose={closeAllMobile}
                            />
                        )}

                        {/* =================================================
                                FREE COURSES
                            ================================================= */}
                        {mobileMenu === "free-courses" && (
                            <MobileCourseMenu
                                title="Free Courses"
                                courses={freeCourses}
                                viewAllHref={COURSE_LIST_ROUTES.free}
                                viewAllText="View All Free"
                                onBack={() =>
                                    openMobileMenu(
                                        "self-paced-courses"
                                    )
                                }
                                onClose={closeAllMobile}
                            />
                        )}

                        {/* =================================================
                                LIVE COURSES
                            ================================================= */}
                        {mobileMenu === "live-courses" && (
                            <MobileSubMenu
                                title="Live Courses"
                                onBack={closeMobileMenu}
                            >

                                {Object.entries(
                                    LIVE_COURSE_ROUTES
                                ).map(
                                    ([title, route]) => (
                                        <MobileLink
                                            key={title}
                                            href={route}
                                            text={title}
                                            onClick={
                                                closeAllMobile
                                            }
                                        />
                                    )
                                )}

                            </MobileSubMenu>
                        )}

                        {/* =================================================
                                RESOURCES
                            ================================================= */}
                        {mobileMenu === "resources" && (
                            <MobileSubMenu
                                title="Resources"
                                onBack={closeMobileMenu}
                            >

                                <MobileLink
                                    href="/webinar"
                                    text="Webinars"
                                    onClick={closeAllMobile}
                                />

                                <MobileLink
                                    href="/refer-and-earn"
                                    text="Referral"
                                    onClick={closeAllMobile}
                                />

                                <MobileLink
                                    href="/blogs"
                                    text="Blog"
                                    onClick={closeAllMobile}
                                />

                                <MobileLink
                                    href="/faq"
                                    text="FAQ"
                                    onClick={closeAllMobile}
                                />

                            </MobileSubMenu>
                        )}

                    </div>

                    {/* =================================================
                            SIDEBAR FOOTER
                        ================================================= */}
                    <div className="mobile-sidebar-footer">

                        {/* =================================================
                                CONTACT INFO
                            ================================================= */}
                        <div className="mobile-contact-info">

                            <a
                                href="mailto:info@velearn.com"
                                className="mobile-contact-item"
                            >
                                <div className="mbl_nav_icon" style={{ backgroundColor: "#0e9bf526" }}>
                                    <i className="bi bi-envelope-fill small" style={{ color: "#0e9bf5" }}></i>
                                </div>
                                <span className="mobile-contact-text">
                                    <small>Email</small>
                                    info@velearn.com
                                </span>
                            </a>
                            <a
                                href="tel:+919087551188"
                                className="mobile-contact-item"
                            >
                                <div className="mbl_nav_icon" style={{ backgroundColor: "#14882726" }}>
                                    <i className="bi bi-telephone-fill small" style={{ color: "#148827" }}></i>
                                </div>
                                <span className="mobile-contact-text">
                                    <small>Phone</small>
                                    +91 90875 51188
                                </span>
                            </a>
                        </div>

                        {/* =================================================
                                SOCIAL MEDIA
                            ================================================= */}
                        <div className="mobile-social-section mb-3">

                            <span className="mobile-footer-title">
                                Follow Us
                            </span>

                            <div className="mobile-social-links">

                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Facebook"
                                >
                                    <Image src={"/images/icons/facebook.png"} width={30} height={30} alt="" />
                                </a>

                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Instagram"
                                >
                                    <Image src={"/images/icons/instagram.png"} width={30} height={30} alt="" />
                                </a>

                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="YouTube"
                                >
                                    <Image src={"/images/icons/youtube.png"} width={30} height={30} alt="" />
                                </a>

                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="LinkedIn"
                                >
                                    <Image src={"/images/icons/linkedin.png"} width={30} height={30} alt="" />
                                </a>
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Twitter"
                                >
                                    <Image src={"/images/icons/twitter.png"} width={30} height={30} alt="" />
                                </a>

                            </div>

                        </div>

                        {/* =================================================
                                APP DOWNLOAD
                            ================================================= */}
                        <div className="mobile-app-section">
                            <div className="col-lg-12 d-flex justify-content-evenly align-items-center app_img">
                                <div className="one">
                                    <a
                                        href=""
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Image
                                            src={`${BASE_IMAGE_URL}icons/google-play.png`}
                                            alt="google-play"
                                            height={100}
                                            width={100}
                                        />
                                    </a>
                                </div>
                                <div className="one">
                                    <a
                                        href=""
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Image
                                            src={`${BASE_IMAGE_URL}icons/apple-store.png`}
                                            alt="apple-store"
                                            height={100}
                                            width={100}
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* =================================================
                                COPYRIGHT
                            ================================================= */}
                        <div className="mobile-sidebar-copy">
                            © 2026 VeLearn. All rights reserved.
                        </div>
                    </div>
                    <Image src={"/images/mobile-menu-bg.webp"} className="w-100 h-auto" width={500} height={200} alt="" style={{ marginTop: "-60px" }} />
                </aside>
            </header>
        </>
    );
}

/* =========================================================
   MOBILE SUB MENU
========================================================= */

function MobileSubMenu({
    title,
    onBack,
    children,
}: {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="mobile-submenu-page">

            <button
                type="button"
                className="mobile-back"
                onClick={onBack}
            >
                <span>‹</span>
                {title}
            </button>

            <ul>
                {children}
            </ul>

        </div>
    );
}

/* =========================================================
   MOBILE COURSE MENU
========================================================= */

function MobileCourseMenu({
    title,
    courses,
    viewAllHref,
    viewAllText,
    onBack,
    onClose,
}: {
    title: string;
    courses: Course[];
    viewAllHref: string;
    viewAllText: string;
    onBack: () => void;
    onClose: () => void;
}) {
    return (
        <div className="mobile-inner-page">

            <button
                type="button"
                className="mobile-back"
                onClick={onBack}
            >
                <span>‹</span>
                {title}
            </button>

            <ul>

                {courses.length > 0 ? (
                    courses.map(
                        (course) => (
                            <MobileLink
                                key={
                                    course.id
                                }
                                href={`/course-details/${course.slug}`}
                                text={
                                    course.title
                                }
                                onClick={
                                    onClose
                                }
                            />
                        )
                    )
                ) : (
                    <li>
                        <span className="course-loading">
                            No {title.toLowerCase()}{" "}
                            found
                        </span>
                    </li>
                )}

                <li className="view-all-course">
                    <Link
                        href={viewAllHref}
                        onClick={onClose}
                    >
                        {viewAllText}
                    </Link>
                </li>

            </ul>
        </div>
    );
}

/* =========================================================
   MOBILE LINK
========================================================= */

function MobileLink({
    href,
    text,
    onClick,
}: {
    href: string;
    text: string;
    onClick: () => void;
}) {
    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
            >
                {text}
            </Link>
        </li>
    );
}