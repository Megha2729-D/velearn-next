"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import "./layout.css"

const BASE_API_URL = "https://velearn.in/velearn-crm/api/";
const BASE_IMAGE_URL = "https://velearn.in/assets/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://velearn.in/velearn-crm/public/uploads/";

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
    "Full Stack Web Development": "/live-course/full-stack-development",
    "UI UX Design": "/live-course/ui-ux-design",
    "Digital Marketing": "/live-course/digital-marketing",
    "Data Science": "/live-course/data-science",
};

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const [showNavbar, setShowNavbar] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
    const [subDropdownOpen, setSubDropdownOpen] = useState<
        Record<string, boolean>
    >({});
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const [user, setUser] = useState<User | null>(null);

    const [paidCourses, setPaidCourses] = useState<Course[]>([]);
    const [comboCourses, setComboCourses] = useState<Course[]>([]);
    const [freeCourses, setFreeCourses] = useState<Course[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                setUser(null);
                setEnrolledCourses([]);
                return;
            }

            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);

            try {
                const res = await axios.get(
                    `${BASE_API_URL}my-courses/${parsedUser.id}`
                );

                if (res.data.status) {
                    setEnrolledCourses(res.data.data.all || []);
                }
            } catch (err) {
                console.log(err);
            }
        };

        loadUser();

        window.addEventListener("storage", loadUser);

        return () => {
            window.removeEventListener("storage", loadUser);
        };
    }, []);

    useEffect(() => {
        axios
            .get(`${BASE_API_URL}recorded-course`)
            .then((res) => {
                if (res.data.status) {
                    const courses: Course[] = res.data.data;

                    setPaidCourses(
                        courses.filter((c) => c.course_type === "paid").slice(0, 5)
                    );

                    setComboCourses(
                        courses.filter((c) => c.course_type === "combo").slice(0, 5)
                    );

                    setFreeCourses(
                        courses.filter((c) => c.course_type === "free").slice(0, 5)
                    );
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    useEffect(() => {
        document.body.classList.toggle("menu-open", showNavbar);

        return () => {
            document.body.classList.remove("menu-open");
        };
    }, [showNavbar]);

    useEffect(() => {
        setShowNavbar(false);
        setDropdownOpen({});
        setSubDropdownOpen({});
        setUserDropdownOpen(false);
        setShowResults(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setUserDropdownOpen(false);
            }

            if (
                searchRef.current &&
                !searchRef.current.contains(target)
            ) {
                setShowResults(false);
            }

            if (!target.closest(".dropdown")) {
                setDropdownOpen({});
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const getProfileImage = () => {
        if (!user?.image) {
            return `${BASE_IMAGE_URL}icons/user.png`;
        }

        if (user.image.startsWith("http")) {
            return user.image;
        }

        const imageName = user.image.split("/").pop();

        return `https://velearn.in/velearn-crm/public/uploads/students/${imageName}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);
        setUserDropdownOpen(false);

        router.push("/login");
    };

    const normalize = (str: string) =>
        str.toLowerCase().replace(/\s+/g, "");

    const handleSearch = async (value: string) => {
        setSearchQuery(value);

        if (!value.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const recordedRes = await axios.get(
                `${BASE_API_URL}recorded-course`
            );

            const recordedCourses = recordedRes.data?.data || [];

            const recorded: SearchResult[] = recordedCourses.map(
                (c: Course) => ({
                    id: c.id,
                    title: c.title,
                    slug: c.slug,
                    course_type: c.course_type,
                    type: "recorded",
                })
            );

            const live: SearchResult[] = Object.keys(
                LIVE_COURSE_ROUTES
            ).map((key) => ({
                id: key,
                title: key,
                type: "live",
                route: LIVE_COURSE_ROUTES[key],
            }));

            const allCourses = [...recorded, ...live];

            const filtered = allCourses.filter((course) =>
                normalize(course.title).includes(normalize(value))
            );

            setSearchResults(filtered.slice(0, 8));
            setShowResults(true);
        } catch (error) {
            console.log(error);
        }
    };
    const toggleDropdown = (
        key: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();

        setDropdownOpen((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleSubDropdown = (
        key: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();

        setSubDropdownOpen((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleMouseEnter = (key: string) => {
        if (window.innerWidth > 991) {
            setDropdownOpen({ [key]: true });
        }
    };

    const handleMouseLeave = () => {
        if (window.innerWidth > 991) {
            setDropdownOpen({});
            setSubDropdownOpen({});
        }
    };

    const handleSubMouseEnter = (key: string) => {
        if (window.innerWidth > 991) {
            setSubDropdownOpen({ [key]: true });
        }
    };

    const handleItemClick = () => {
        setShowNavbar(false);
        setDropdownOpen({});
        setSubDropdownOpen({});
    };

    const handleUserMenuClick = () => {
        setUserDropdownOpen(false);
    };
    const isNavbarTwo =
        pathname === "/live-course/digital-marketing" ||
        pathname === "/live-course/data-science";

    const isNavbarRefer = pathname === "/refer-and-earn";

    return (
        <nav
            className={`v-navbar ${scrolled ? "scrolled" : ""
                } ${isNavbarTwo ? "navbar_two" : ""} ${isNavbarRefer ? "navbarRefer" : ""
                }`}
        >
            {/* TOP BANNER */}
            <div className="top-banner">
                <p className="mb-0 py-1">
                    New batch offer live. Start your IT journey now.
                </p>
            </div>

            {/* MAIN NAV */}
            <div className={`navbar_links ${scrolled ? "is-fixed" : ""}`}>
                <div className="section_container">
                    <div className="nav_parent">
                        {/* HAMBURGER */}
                        <div
                            className="menu-icon"
                            onClick={() => setShowNavbar(!showNavbar)}
                        >
                            <Hamburger isOpen={showNavbar} />
                        </div>

                        {/* LOGO */}
                        <Link href="/">
                            <div className="logo">
                                <Image
                                    src={
                                        isNavbarTwo
                                            ? `${BASE_IMAGE_URL}logo-white.png`
                                            : `${BASE_IMAGE_URL}velearn-logo.png`
                                    }
                                    alt="Velearn Logo"
                                    height={100}
                                    width={100}
                                />
                            </div>
                        </Link>

                        {/* NAV LINKS */}
                        <div
                            className={`nav-elements ${showNavbar ? "active" : ""}`}
                        >
                            <ul className="mb-0 p-lg-0">
                                {/* SELF-PACED */}
                                <li
                                    className={`dropdown ${dropdownOpen.selfPaced ? "open" : ""}`}
                                    onClick={(e) =>
                                        toggleDropdown("selfPaced", e)
                                    }
                                    onMouseEnter={() =>
                                        handleMouseEnter("selfPaced")
                                    }
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <span className="dropdown-toggle">
                                        Self-paced Courses{" "}
                                        <i className="bi bi-chevron-down"></i>
                                    </span>
                                    <ul
                                        className="dropdown-menu"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Paid Courses */}
                                        <li
                                            className="sub-dropdown"
                                            onMouseEnter={() =>
                                                handleSubMouseEnter("group1")
                                            }
                                            onMouseLeave={() =>
                                                setSubDropdownOpen({})
                                            }
                                        >
                                            <span
                                                className="sub-dropdown-toggle"
                                                onClick={(e) =>
                                                    toggleSubDropdown(
                                                        "group1",
                                                        e,
                                                    )
                                                }
                                            >
                                                Paid Courses{" "}
                                                <i className="bi bi-chevron-right"></i>
                                            </span>
                                            <ul
                                                className={`sub-dropdown-menu ${subDropdownOpen.group1 ? "open" : ""}`}
                                            >
                                                {paidCourses.map((course) => {
                                                    const isEnrolled =
                                                        enrolledCourses.some(
                                                            (c) =>
                                                                c.id ===
                                                                course.id,
                                                        );
                                                    return (
                                                        <li key={course.id}>
                                                            <Link
                                                                href={
                                                                    isEnrolled
                                                                        ? `/learn/${course.slug}`
                                                                        : `/course-details/${course.slug}`
                                                                }
                                                                // state={{
                                                                //     courseId:
                                                                //         course.id,
                                                                //     courseType:
                                                                //         course.course_type,
                                                                // }}
                                                                onClick={
                                                                    handleItemClick
                                                                }
                                                            >
                                                                {course.title}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                                <li>
                                                    <Link
                                                        href="/recorded-course/paid"
                                                        onClick={handleItemClick}
                                                    >
                                                        View All Paid
                                                    </Link>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Combo Courses */}
                                        <li
                                            className="sub-dropdown"
                                            onMouseEnter={() =>
                                                handleSubMouseEnter("group2")
                                            }
                                            onMouseLeave={() =>
                                                setSubDropdownOpen({})
                                            }
                                        >
                                            <span
                                                className="sub-dropdown-toggle"
                                                onClick={(e) =>
                                                    toggleSubDropdown(
                                                        "group2",
                                                        e,
                                                    )
                                                }
                                            >
                                                Paid Combo{" "}
                                                <i className="bi bi-chevron-right"></i>
                                            </span>
                                            <ul
                                                className={`sub-dropdown-menu ${subDropdownOpen.group2 ? "open" : ""}`}
                                            >
                                                {comboCourses.map((course) => {
                                                    const isEnrolled =
                                                        enrolledCourses.some(
                                                            (c) =>
                                                                c.id ===
                                                                course.id,
                                                        );
                                                    return (
                                                        <li key={course.id}>
                                                            <Link
                                                                href={
                                                                    isEnrolled
                                                                        ? `/learn/${course.slug}`
                                                                        : `/course-details/${course.slug}`
                                                                }
                                                                // state={{
                                                                //     courseId:
                                                                //         course.id,
                                                                //     courseType:
                                                                //         course.course_type,
                                                                // }}
                                                                onClick={
                                                                    handleItemClick
                                                                }
                                                            >
                                                                {course.title}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                                <li>
                                                    <Link
                                                        href="/recorded-course/combo"
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                    >
                                                        View All Combo
                                                    </Link>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Free Courses */}
                                        <li
                                            className="sub-dropdown"
                                            onMouseEnter={() =>
                                                handleSubMouseEnter("group3")
                                            }
                                            onMouseLeave={() =>
                                                setSubDropdownOpen({})
                                            }
                                        >
                                            <span
                                                className="sub-dropdown-toggle"
                                                onClick={(e) =>
                                                    toggleSubDropdown(
                                                        "group3",
                                                        e,
                                                    )
                                                }
                                            >
                                                Free Courses{" "}
                                                <i className="bi bi-chevron-right"></i>
                                            </span>
                                            <ul
                                                className={`sub-dropdown-menu ${subDropdownOpen.group3 ? "open" : ""}`}
                                            >
                                                {freeCourses.map((course) => {
                                                    const isEnrolled =
                                                        enrolledCourses.some(
                                                            (c) =>
                                                                c.id ===
                                                                course.id,
                                                        );
                                                    return (
                                                        <li key={course.id}>
                                                            <Link
                                                                href={
                                                                    isEnrolled
                                                                        ? `/learn/${course.slug}`
                                                                        : `/course-details/${course.slug}`
                                                                }
                                                                // state={{
                                                                //     courseId:
                                                                //         course.id,
                                                                //     courseType:
                                                                //         course.course_type,
                                                                // }}
                                                                onClick={
                                                                    handleItemClick
                                                                }
                                                            >
                                                                {course.title}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                                <li>
                                                    <Link
                                                        href="/recorded-course/free"
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                    >
                                                        View All Free
                                                    </Link>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>

                                {/* LIVE COURSES */}
                                <li
                                    className={`dropdown ${dropdownOpen.liveCourses ? "open" : ""}`}
                                    onClick={(e) =>
                                        toggleDropdown("liveCourses", e)
                                    }
                                    onMouseEnter={() =>
                                        handleMouseEnter("liveCourses")
                                    }
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <span className="dropdown-toggle">
                                        Live Courses{" "}
                                        <i className="bi bi-chevron-down"></i>
                                    </span>
                                    <ul
                                        className="dropdown-menu"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Object.entries(LIVE_COURSE_ROUTES).map(
                                            ([title, route]) => (
                                                <li key={title}>
                                                    <Link
                                                        href={route}
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                    >
                                                        {title}
                                                    </Link>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </li>

                                {/* PRACTICE */}
                                <li
                                    className={`dropdown ${dropdownOpen.practice ? "open" : ""}`}
                                    onClick={(e) =>
                                        toggleDropdown("practice", e)
                                    }
                                    onMouseEnter={() =>
                                        handleMouseEnter("practice")
                                    }
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <span className="dropdown-toggle">
                                        Practice{" "}
                                        <i className="bi bi-chevron-down"></i>
                                    </span>
                                    <ul
                                        className="dropdown-menu"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <li>
                                            <Link
                                                href="/ide"
                                                onClick={handleItemClick}
                                            >
                                                Online IDE
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/debugging"
                                                onClick={handleItemClick}
                                            >
                                                Debugging
                                            </Link>
                                        </li>
                                        {/* <li><Link href="/practice/challenges" onClick={handleItemClick}>Challenges</Link></li> */}
                                    </ul>
                                </li>

                                {/* RESOURCES */}
                                <li
                                    className={`dropdown ${dropdownOpen.resources ? "open" : ""}`}
                                    onClick={(e) =>
                                        toggleDropdown("resources", e)
                                    }
                                    onMouseEnter={() =>
                                        handleMouseEnter("resources")
                                    }
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <span className="dropdown-toggle">
                                        Resources{" "}
                                        <i className="bi bi-chevron-down"></i>
                                    </span>
                                    <ul
                                        className="dropdown-menu"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <li>
                                            <Link
                                                href="/webinar"
                                                onClick={handleItemClick}
                                            >
                                                Webinars
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/refer-and-earn"
                                                onClick={handleItemClick}
                                            >
                                                Referral
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/blogs"
                                                onClick={handleItemClick}
                                            >
                                                Blog
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/faq"
                                                onClick={handleItemClick}
                                            >
                                                FAQ
                                            </Link>
                                        </li>
                                        {/* <li><Link href="/" onClick={handleItemClick}>Become an affiliate</Link></li> */}
                                    </ul>
                                </li>
                            </ul>
                        </div>

                        {/* RIGHT */}
                        <div className="d-flex right_nav_icons">
                            {/* DESKTOP SEARCH */}
                            <div
                                className="d-lg-flex d-none align-items-center me-3"
                                ref={searchRef}
                            >
                                <div className="search_parent position-relative">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-search"></i>
                                        <input
                                            type="search"
                                            placeholder="Search for course..."
                                            className="nav_search_input"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                handleSearch(e.target.value)
                                            }
                                            onFocus={() =>
                                                searchResults.length &&
                                                setShowResults(true)
                                            }
                                        />
                                    </div>

                                    {showResults && (
                                        <div className="position-relative">
                                            <div className="blog_search_results_box">
                                                {searchResults.length > 0 ? (
                                                    searchResults.map(
                                                        (item) => {
                                                            const isEnrolled =
                                                                item.type ===
                                                                "recorded" &&
                                                                enrolledCourses.some(
                                                                    (c) =>
                                                                        c.id ===
                                                                        item.id,
                                                                );
                                                            return (
                                                                <Link
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    href={
                                                                        item.type === "recorded"
                                                                            ? isEnrolled
                                                                                ? `/learn/${item.slug}`
                                                                                : `/course-details/${item.slug}`
                                                                            : item.route || "/"
                                                                    }
                                                                    // state={
                                                                    //     item.type ===
                                                                    //         "recorded"
                                                                    //         ? {
                                                                    //             courseId:
                                                                    //                 item.id,
                                                                    //             courseType:
                                                                    //                 item.course_type ||
                                                                    //                 "recorded",
                                                                    //         }
                                                                    //         : null
                                                                    // }
                                                                    className="blog_search_result_item"
                                                                    onClick={() =>
                                                                        setShowResults(
                                                                            false,
                                                                        )
                                                                    }
                                                                >
                                                                    {item.title}
                                                                </Link>
                                                            );
                                                        },
                                                    )
                                                ) : (
                                                    <div className="blog_search_result_item">
                                                        No courses found
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
                                        <Link href="/login" className="btn_login">
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
                                        ref={dropdownRef}
                                        onMouseEnter={() =>
                                            window.innerWidth > 500 &&
                                            setUserDropdownOpen(true)
                                        }
                                        onMouseLeave={() =>
                                            window.innerWidth > 500 &&
                                            setUserDropdownOpen(false)
                                        }
                                    >
                                        <div
                                            className={`avatar-icon ${userDropdownOpen ? "active" : ""}`}
                                            onClick={() =>
                                                setUserDropdownOpen(
                                                    !userDropdownOpen,
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
                                                    <strong>{user.name}</strong>
                                                    <small>{user.email}</small>
                                                </div>
                                                <ul>
                                                    <li>
                                                        <Link
                                                            href="/profile"
                                                            onClick={handleUserMenuClick}
                                                        >
                                                            Dashboard
                                                        </Link>
                                                    </li>
                                                    {/* <li><Link href="/my-courses" onClick={() => handleUserMenuClick(false)}>My Courses</Link></li>
                                                    <li><Link href="/live-course-history" onClick={() => handleUserMenuClick(false)}>Live Course</Link></li>
                                                    <li><Link href="/courses-certificates" onClick={() => handleUserMenuClick(false)}>Course Certificates</Link></li> */}
                                                    <li>
                                                        <Link
                                                            href="/change-password"
                                                            onClick={() => handleUserMenuClick()}
                                                        >
                                                            Change Password
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/faq"
                                                            onClick={() => handleUserMenuClick()}
                                                        >
                                                            FAQ
                                                        </Link>
                                                    </li>
                                                    <li
                                                        className="logout"
                                                        onClick={handleLogout}
                                                    >
                                                        Sign Out
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
        </nav>
    );
}

function Hamburger({ isOpen }: { isOpen: boolean }) {
    return (
        <div className={`hamburger ${isOpen ? "open" : ""}`}>
            <span />
            <span />
            <span />
        </div>
    );
}