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
    paid: "/courses?type=paid",
    combo: "/courses?type=combo",
    free: "/courses?type=free",
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

            <header className={`kmbf-header v-navbar ${scrolled ? "fixed-nav" : ""
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
                    className={`mobile-sidebar ${mobileOpen
                        ? "mobile-sidebar-open"
                        : ""
                        }`}
                >

                    {/* SIDEBAR HEADER */}

                    <div className="mobile-sidebar-header">

                        <button
                            type="button"
                            onClick={
                                closeAllMobile
                            }
                            className="mobile-close-button"
                            aria-label="Close menu"
                        >
                            <i className="bi bi-x-lg text-white"></i>
                        </button>

                        <Link
                            href="/"
                            className="mobile-sidebar-logo"
                            onClick={
                                closeAllMobile
                            }
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

                    </div>

                    {/* =================================================
                        MOBILE MAIN MENU
                    ================================================= */}

                    {mobileMenu === null && (
                        <ul className="mobile-main-menu">

                            {/* SELF PACED */}

                            <li>
                                <button
                                    type="button"
                                    onClick={() =>
                                        openMobileMenu(
                                            "self-paced-courses"
                                        )
                                    }
                                >
                                    Self-Paced
                                    Courses

                                    <span>
                                        ›
                                    </span>
                                </button>
                            </li>

                            {/* LIVE */}

                            <li>
                                <button
                                    type="button"
                                    onClick={() =>
                                        openMobileMenu(
                                            "live-courses"
                                        )
                                    }
                                >
                                    Live Courses

                                    <span>
                                        ›
                                    </span>
                                </button>
                            </li>

                            {/* RESOURCES */}

                            <li>
                                <button
                                    type="button"
                                    onClick={() =>
                                        openMobileMenu(
                                            "resources"
                                        )
                                    }
                                >
                                    Resources

                                    <span>
                                        ›
                                    </span>
                                </button>
                            </li>

                        </ul>
                    )}

                    {/* =================================================
                        SELF PACED COURSES
                    ================================================= */}

                    {mobileMenu ===
                        "self-paced-courses" && (
                            <MobileSubMenu
                                title="Self-Paced Courses"
                                onBack={
                                    closeMobileMenu
                                }
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

                    {mobileMenu ===
                        "paid-courses" && (
                            <MobileCourseMenu
                                title="Paid Courses"
                                courses={
                                    paidCourses
                                }
                                viewAllHref={
                                    COURSE_LIST_ROUTES.paid
                                }
                                viewAllText="View All Paid"
                                onBack={() =>
                                    openMobileMenu(
                                        "self-paced-courses"
                                    )
                                }
                                onClose={
                                    closeAllMobile
                                }
                            />
                        )}

                    {/* =================================================
                        PAID COMBO
                    ================================================= */}

                    {mobileMenu ===
                        "paid-combo" && (
                            <MobileCourseMenu
                                title="Paid Combo"
                                courses={
                                    comboCourses
                                }
                                viewAllHref={
                                    COURSE_LIST_ROUTES.combo
                                }
                                viewAllText="View All Combo"
                                onBack={() =>
                                    openMobileMenu(
                                        "self-paced-courses"
                                    )
                                }
                                onClose={
                                    closeAllMobile
                                }
                            />
                        )}

                    {/* =================================================
                        FREE COURSES
                    ================================================= */}

                    {mobileMenu ===
                        "free-courses" && (
                            <MobileCourseMenu
                                title="Free Courses"
                                courses={
                                    freeCourses
                                }
                                viewAllHref={
                                    COURSE_LIST_ROUTES.free
                                }
                                viewAllText="View All Free"
                                onBack={() =>
                                    openMobileMenu(
                                        "self-paced-courses"
                                    )
                                }
                                onClose={
                                    closeAllMobile
                                }
                            />
                        )}

                    {/* =================================================
                        LIVE COURSES
                    ================================================= */}

                    {mobileMenu ===
                        "live-courses" && (
                            <MobileSubMenu
                                title="Live Courses"
                                onBack={
                                    closeMobileMenu
                                }
                            >

                                {Object.entries(
                                    LIVE_COURSE_ROUTES
                                ).map(
                                    ([
                                        title,
                                        route,
                                    ]) => (
                                        <MobileLink
                                            key={
                                                title
                                            }
                                            href={
                                                route
                                            }
                                            text={
                                                title
                                            }
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

                    {mobileMenu ===
                        "resources" && (
                            <MobileSubMenu
                                title="Resources"
                                onBack={
                                    closeMobileMenu
                                }
                            >

                                <MobileLink
                                    href="/webinar"
                                    text="Webinars"
                                    onClick={
                                        closeAllMobile
                                    }
                                />

                                <MobileLink
                                    href="/refer-and-earn"
                                    text="Referral"
                                    onClick={
                                        closeAllMobile
                                    }
                                />

                                <MobileLink
                                    href="/blogs"
                                    text="Blog"
                                    onClick={
                                        closeAllMobile
                                    }
                                />

                                <MobileLink
                                    href="/faq"
                                    text="FAQ"
                                    onClick={
                                        closeAllMobile
                                    }
                                />

                            </MobileSubMenu>
                        )}

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