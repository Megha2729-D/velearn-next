"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./style.css"
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
interface CourseDetailsPageProps {
    slugId: string;
}
interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    phonenumber?: string;
}
// const BASE_API_URL = "http://localhost:5000/api/";
const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

export default function CourseDetailsPage({
    slugId,
}: CourseDetailsPageProps) {
    const [showModal, setShowModal] = useState(false);
    const [course, setCourse] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [contentLeft, setContentLeft] = useState<number>(0);
    const tabsWrapperRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const listRef = useRef<HTMLUListElement | null>(null);
    const [isScrollEnd, setIsScrollEnd] = useState(false);

    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
    const [activeTabMain, setActiveTabMain] = useState("overview");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const router = useRouter();

    const goToLearnPage = () => {
        if (course) {
            router.push(`/learn/${course.slug}?courseId=${course.id}`);
        } else {
            router.push("/my-courses");
        }
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // Logged in user
                const storedUser = localStorage.getItem("user");

                let currentUser: User | null = null;

                if (storedUser) {
                    currentUser = JSON.parse(storedUser);

                    setUser(currentUser);

                    setFormData({
                        name: currentUser?.name || "",
                        email: currentUser?.email || "",
                        phone:
                            (currentUser?.phonenumber ||
                                currentUser?.phone ||
                                "")
                                .replace(/^\+?91/, "")
                                .trim(),
                    });
                }

                // Get all recorded courses to find courseId & courseType
                const courseRes = await fetch(`${BASE_API_URL}recorded-course`);
                const courseResult = await courseRes.json();

                if (!courseResult.status) return;

                const matchedCourse = courseResult.data.find(
                    (item: any) => item.slug === slugId
                );

                if (!matchedCourse) return;

                const courseId = matchedCourse.id;
                const courseType = matchedCourse.course_type;

                // Build API endpoint
                const endpoint =
                    courseType === "combo"
                        ? `combo-course-detail/${courseId}`
                        : `course-detail/${courseId}`;

                const url = `https://crm.velearn.in/api/${endpoint}`;

                const res = await fetch(url);
                // Fetch course details
                const detailRes = await fetch(`https://crm.velearn.in/api/${endpoint}`);
                const detailResult = await detailRes.json();

                if (detailResult.status) {
                    setCourse(detailResult.data);

                    if (currentUser) {
                        checkEnrollment(currentUser.id, detailResult.data.id);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchCourse();
    }, [slugId]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        setErrors({
            ...errors,
            [name]: "",
        });
    };

    const validate = () => {
        const newErrors = {
            name: "",
            email: "",
            phone: "",
        };

        let valid = true;

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            valid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            valid = false;
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            newErrors.email = "Invalid email";
            valid = false;
        }

        if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = "Enter a valid 10-digit phone number";
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const checkEnrollment = async (userId: number, courseId: number) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://crm.velearn.in/api/my-courses/${userId}`,
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                }
            );

            const result = await response.json();
            console.log(result);

            if (result.status) {
                const enrolled = (result.data.all || []).some(
                    (item: any) => item.id === Number(courseId)
                );

                setIsEnrolled(enrolled);
            }
        } catch (err) {
            console.error("Enrollment check failed:", err);
        }
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        if (!validate()) return;

        console.log(formData);

        // Call your API here

        // Example:
        // await fetch(...)

        alert("Enrolled Successfully");
    };

    const tabs = [
        { id: "overview", label: "Course Overview" },
        { id: "outcomes", label: "Learning Outcomes" },
        { id: "modules", label: "Modules" },
        { id: "process", label: "Learning Process" },
        { id: "reviews", label: "Reviews" },
        { id: "certificate", label: "Certificate" },
        { id: "fee", label: "Duration & Fee" },
        { id: "faq", label: "FAQ" },
    ];

    useEffect(() => {
        const sections = document.querySelectorAll("section[id]");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveTabMain(entry.target.id);
                    }
                });
            },
            {
                root: null,
                rootMargin: "-100px 0px -60% 0px",
                threshold: 0,
            }
        );

        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    useEffect(() => {
        const slider = listRef.current;

        if (!slider) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        const mouseDown = (e: MouseEvent) => {
            isDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const mouseLeave = () => {
            isDown = false;
        };

        const mouseUp = () => {
            isDown = false;
        };

        const mouseMove = (e: MouseEvent) => {
            if (!isDown) return;

            e.preventDefault();

            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;

            slider.scrollLeft = scrollLeft - walk;
        };

        slider.addEventListener("mousedown", mouseDown);
        slider.addEventListener("mouseleave", mouseLeave);
        slider.addEventListener("mouseup", mouseUp);
        slider.addEventListener("mousemove", mouseMove);

        return () => {
            slider.removeEventListener("mousedown", mouseDown);
            slider.removeEventListener("mouseleave", mouseLeave);
            slider.removeEventListener("mouseup", mouseUp);
            slider.removeEventListener("mousemove", mouseMove);
        };
    }, []);
    useEffect(() => {
        const slider = listRef.current;
        if (!slider) return;

        const handleScroll = () => {
            const atEnd =
                slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 2;

            setIsScrollEnd(atEnd);
        };

        handleScroll(); // Check on load

        slider.addEventListener("scroll", handleScroll);

        return () => {
            slider.removeEventListener("scroll", handleScroll);
        };
    }, []);
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);

        if (!element) return;

        const y =
            element.getBoundingClientRect().top +
            window.pageYOffset -
            180; // Sticky header height

        window.scrollTo({
            top: y,
            behavior: "smooth",
        });
    };

    const modules = [
        "Core Java Programming",
        "Object Oriented Programming",
        "Data Types, Variables and Operators",
        "Control Structures and Loops",
        "Java Code Writing and Debugging",
        "Data Structures Basics",
        "Real World Java Application Practice",
        "Clean and Reusable Code Writing",
    ];
    const colClasses = [
        "col-lg-4",
        "col-lg-4",
        "col-lg-4",
        "col-lg-4",
        "col-lg-3",
        "col-lg-5",
        "col-lg-6",
        "col-lg-6",
    ];

    useEffect(() => {
        const index = activeTab - 1;

        setTimeout(() => {
            const tabEl = tabRefs.current[index];
            const wrapperEl = tabsWrapperRef.current;

            if (!tabEl || !wrapperEl) return;

            const tabRect = tabEl.getBoundingClientRect();
            const wrapperRect = wrapperEl.getBoundingClientRect();

            const centerX = tabRect.left + tabRect.width / 2;
            const relativeLeft = centerX - wrapperRect.left;

            setContentLeft(relativeLeft);
        }, 0);
    }, [activeTab]);

    const content = {
        1: {
            title: "Foundations of Full Stack Development",
            points: [
                "How the web works (Client–Server architecture)",
                "Frontend vs Backend vs Database",
                "Developer tools & workflow",
                "Introduction to Git & GitHub",
            ],
        },
        2: {
            title: "Frontend Development",
            points: [
                "HTML, CSS, JavaScript",
                "Responsive UI & Grid Systems",
                "React.js Fundamentals",
                "State Management",
            ],
        },
        3: {
            title: "Backend Development",
            points: [
                "Node.js & Express.js",
                "REST APIs",
                "Authentication & Authorization",
                "Error Handling & Middleware",
            ],
        },
        4: {
            title: "Database & Deployment",
            points: [
                "MongoDB / SQL Basics",
                "Data Modeling & Queries",
                "Cloud Deployment",
                "CI/CD & Environment Variables",
            ],
        },
        5: {
            title: "Capstone & Job Preparation",
            points: [
                "Real-World Project",
                "Version Control",
                "Resume & Portfolio",
                "Mock Interviews",
            ],
        },
    };

    const currentContent = content[activeTab as keyof typeof content];

    const updatePosition = (index: number) => {
        const tabEl = tabRefs.current[index];
        const wrapperEl = tabsWrapperRef.current;

        if (!tabEl || !wrapperEl) return;

        const tabRect = tabEl.getBoundingClientRect();
        const wrapperRect = wrapperEl.getBoundingClientRect();

        const centerX = tabRect.left + tabRect.width / 2;
        const relativeLeft = centerX - wrapperRect.left;

        setContentLeft(relativeLeft);
    };

    useEffect(() => {
        // updatePosition(0);

        const handleResize = () => {
            updatePosition(activeTab - 1);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [activeTab]);

    const faqData = [
        {
            question: "Why learn Java?",
            answer: (
                <>
                    <p>
                        Java is one of the most popular programming languages used in software development and web development. Learning Java opens doors to careers as a Java developer or software engineer.
                    </p>
                </>
            ),
        },
        {
            question: "How to learn Java programming online?",
            answer: (
                <>
                    <p>
                        This UI/UX Design course is ideal for students, fresh
                        graduates, working professionals, developers, graphic
                        designers, and career switchers who want to build a
                        strong foundation in user interface (UI) and user
                        experience (UX) design. No prior design experience is
                        required, making it beginner-friendly and
                        career-oriented.
                    </p>
                </>
            ),
        },
        {
            question:
                "Is this Java course suitable for complete beginners?",
            answer: (
                <>
                    <p>
                        This UI/UX Design course is ideal for students, fresh
                        graduates, working professionals, developers, graphic
                        designers, and career switchers who want to build a
                        strong foundation in user interface (UI) and user
                        experience (UX) design. No prior design experience is
                        required, making it beginner-friendly and
                        career-oriented.
                    </p>
                </>
            ),
        },
        {
            question:
                "Will I receive a certificate after completing the course?",
            answer: (
                <>
                    <p>
                        This UI/UX Design course is ideal for students, fresh
                        graduates, working professionals, developers, graphic
                        designers, and career switchers who want to build a
                        strong foundation in user interface (UI) and user
                        experience (UX) design. No prior design experience is
                        required, making it beginner-friendly and
                        career-oriented.
                    </p>
                </>
            ),
        },
        {
            question:
                " How long can I access the course?",
            answer: (
                <>
                    <p>
                        This UI/UX Design course is ideal for students
                    </p>
                </>
            ),
        },
        {
            question:
                " Why choose Velearn for a Java Programming Course?",
            answer: (
                <>
                    <p>
                        This UI/UX Design course is ideal for students
                    </p>
                </>
            ),
        },
    ];

    const toggleFaq = (index: number) => {
        setActiveFaqIndex((prev) =>
            prev === index ? null : index
        );
    };
    return (
        <>
            <div className="rc_body">
                {/* Hero Section */}
                <section className="course-hero rc_banner">
                    <div className="section_container">
                        <div className="row align-items-center justify-content-lg-between">

                            {/* Left Content */}
                            <div className="col-lg-8 pe-lg-5 text-white">
                                <h1 className="course-title">{course?.title}</h1>
                                <p className="course-description">
                                    {course?.sub_description}
                                </p>
                                <div className="d-flex justify-content-lg-start justify-content-center mb-3">
                                    {isEnrolled ? (
                                        <button
                                            type="button"
                                            onClick={goToLearnPage}
                                            className="btn_theme_primary mt-2 mb-3"
                                        >
                                            Start Course
                                        </button>
                                    ) : (
                                        <button
                                            type={user ? "submit" : "button"}
                                            onClick={() => {
                                                if (!user) {
                                                    router.push("/login");
                                                }
                                            }}
                                            className="btn_theme_primary mt-2 mb-3"
                                        >
                                            {user ? "Enroll Now" : "Login to Enroll"}
                                        </button>
                                    )}
                                </div>
                                <div className="col-12">
                                    <div className="row rc_description mt-4 w-100 m-auto">
                                        <div className="col-lg-3 col-6 my-3 my-lg-0">
                                            <div>
                                                <p className="text-center text-white">
                                                    {
                                                        course?.with_certificate != null
                                                            ? String(course.with_certificate).match(/\d+/)?.[0]
                                                            : null
                                                    }{" "}
                                                    Core <br /> Modules
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-6 my-3 my-lg-0">
                                            <div>
                                                <p className="text-center text-white">
                                                    {course?.recorded_content} Hrs+ of  <br />
                                                    In-depth Content
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-6 my-3 my-lg-0">
                                            <div>
                                                <p className="text-center text-white">
                                                    Free Certificate <br />
                                                    Included
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-6 my-3 my-lg-0">
                                            <div>
                                                <p className="text-center text-white">
                                                    Taught by<br />
                                                    industry exports
                                                    {/* 4.8 Ratings <br />
                                                <i className="bi bi-star-fill ps-1"></i>
                                                <i className="bi bi-star-fill ps-1"></i>
                                                <i className="bi bi-star-fill ps-1"></i>
                                                <i className="bi bi-star-fill ps-1"></i>
                                                <i className="bi bi-star-fill ps-1"></i> */}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Form */}
                            <div className="col-lg-3 position-relative">
                                <form onSubmit={handleSubmit}>
                                    <h5 className="text-c2 fw-bold text-center mb-2">
                                        Get this course @{" "}
                                        {course?.course_type === "free" ? (
                                            "Free"
                                        ) : course?.combo_price ? (
                                            <>₹ {course.combo_price}</>
                                        ) : (
                                            <>₹ {course?.buy_price}</>
                                        )}
                                    </h5>

                                    {/* Name */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Name
                                        </label>

                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />

                                        {errors.name && (
                                            <div className="invalid-feedback">
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="mb-4">
                                        <label className="form-label">
                                            Phone Number
                                        </label>

                                        <input
                                            type="tel"
                                            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength={10}
                                        />

                                        {errors.phone && (
                                            <div className="invalid-feedback">
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />

                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12 d-flex justify-content-center">
                                        {isEnrolled ? (
                                            <button
                                                type="button"
                                                onClick={goToLearnPage}
                                                className="btn btn-primary w-auto"
                                            >
                                                Start Course
                                            </button>
                                        ) : (
                                            <button
                                                type={user ? "submit" : "button"}
                                                onClick={() => {
                                                    if (!user) {
                                                        router.push("/login");
                                                    }
                                                }}
                                                className="btn btn-primary w-auto"
                                            >
                                                {user ? "Enroll Now" : "Login to Enroll"}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rc_sec_2 rounded-bottom-5 position-relative">
                    <div className="section_container">
                        <div className="row">
                            <div className="col-lg-9">
                                <div className={`course_tabs_sticky pe-lg-3 ${isScrollEnd ? "scroll-end" : ""}`}>
                                    <ul ref={listRef}>
                                        {tabs.map((tab) => (
                                            <li key={tab.id}>
                                                <button
                                                    className={activeTabMain === tab.id ? "active" : ""}
                                                    onClick={() => scrollToSection(tab.id)}
                                                >
                                                    {tab.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div id="overview" className="mt-4">
                                    <div className="rc_overview_box">
                                        <div>
                                            <h2 className="rc_heading text-c1 fw-bold">
                                                What You'll Learn In This Java Online Course
                                            </h2>

                                            <p className="rc_text">
                                                This free Java course helps beginners build strong fundamentals in Java programming from the ground up. By the end of this course, you will write real-world Java code with confidence. You will apply core language concepts in practical projects.
                                            </p>

                                            <ul className="rc_points ps-0">

                                                <li>
                                                    <span className="icon">
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </span>
                                                    Learn Java from scratch with easy hands-on practice
                                                </li>

                                                <li>
                                                    <span className="icon">
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </span>
                                                    Master data types, variables, and control structures step by step
                                                </li>

                                                <li>
                                                    <span className="icon">
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </span>
                                                    Understand object oriented programming the simple way
                                                </li>

                                                <li>
                                                    <span className="icon">
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </span>
                                                    Build a strong foundation in data structures for software development
                                                </li>

                                                <li>
                                                    <span className="icon">
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </span>
                                                    Write basic Java programs for beginners with real
                                                    examples
                                                </li>

                                                <li>
                                                    <span className="icon">
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </span>
                                                    Write basic Java programs for beginners with real examples
                                                </li>
                                                <li>
                                                    <span className="icon">
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </span>
                                                    Get career-ready as a Java developer or software engineer
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div id="outcomes" className="pt-1 px-1">
                        <div className="rc_sec_3 rounded-5">
                            <div className="section_container">
                                <div className="rc_outcomes_box py-4">
                                    <div className="row align-items-center">
                                        {/* Left Content */}
                                        <div className="col-lg-8">
                                            <h2 className="fw-bold text-white text-center mb-3">
                                                Why Our{" "}
                                                <span className="text-c2">
                                                    Java Online Course
                                                </span>{" "}
                                                Stands Out For Beginners
                                            </h2>
                                            <p className="rc_sec_desc text-center text-white">
                                                Built by experts and designed for beginners. Here's why our free Java programming course is the perfect way to learn Java and kickstart your career in software development.
                                            </p>

                                            <div className="row g-4 mt-2">
                                                <div className="col-md-6">
                                                    <div className="rc_feature_card_parent">
                                                        <div className="rc_feature_card">
                                                            <div>
                                                                <h5 className="fw-bold text-black"> Zero To Java <span className="text-c2"> Hero Path</span></h5>
                                                                <p className="text-black">
                                                                    Start with basic Java programs for beginners and move step by step into object oriented programming with zero coding background needed.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="rc_feature_card_parent">
                                                        <div className="rc_feature_card">
                                                            <div>
                                                                <h5 className="fw-bold text-black">Learn From <span className="text-c2"> Industry Experts</span></h5>
                                                                <p className="text-black">
                                                                    Learn from real Java developers who write Java code every day. They share real world examples from actual software development projects, so you learn what truly works.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="rc_feature_card_parent">
                                                        <div className="rc_feature_card">
                                                            <div>
                                                                <h5 className="fw-bold text-black">Industry-Recognized Java <span className="text-c2">Certificate</span></h5>
                                                                <p className="text-black">
                                                                    Complete the course and earn a  free Java course with a certificate that adds real value to your resume and LinkedIn profile.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="rc_feature_card_parent">
                                                        <div className="rc_feature_card">
                                                            <div>
                                                                <h5 className="fw-bold text-black">Watch, Pause, <span className="text-c2">Replay Anytime</span></h5>
                                                                <p className="text-black">
                                                                    Enjoy lifetime free access to recorded Java tutorial videos so you can learn Java at your own speed without any pressure.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modules */}
                    <div id="keypoints" className="py-4 px-1 bg-white">
                        <div className="rc_sec_4">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">
                                        <div className="row justify-content-center">
                                            <div className="col-lg-9">
                                                <h2 className="fw-bold text-black text-center mb-3">
                                                    Designed for Effective {" "}
                                                    <span className="text-c2">
                                                        Self-Paced Java
                                                    </span>{" "}
                                                    Learning
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="position-relative">
                                            <div className="d-flex justify-content-center align-items-center">
                                                <Image
                                                    src={`/images/recorded-course/circle-icons.png`}
                                                    className="h-auto"
                                                    width={610}
                                                    height={600}
                                                    alt=""
                                                />
                                            </div>
                                            <div className="points_circle">
                                                <div>
                                                    <p className="mb-0">Lifetime Access to Recorded Videos</p>
                                                </div>
                                                <div>
                                                    <p className="mb-0">Practice-Oriented Learning</p>
                                                </div>
                                                <div>
                                                    <p className="mb-0">Certificate of Completion</p>
                                                </div>
                                                <div>
                                                    <p className="mb-0">Concept-wise Structured Modules</p>
                                                </div>
                                                <div>
                                                    <p className="mb-0">Module-wise Practice Questions</p>
                                                </div>
                                                <div>
                                                    <p className="mb-0">Interactive & Engaging Video Lessons</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Process */}
                    <div id="process" className="pt-1 px-1">
                        <div className="rc_sec_5 rounded-5 py-4">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">
                                        <div className="px-lg-4">
                                            <div>
                                                <h2 className="fw-bold text-white text-center mb-3">
                                                    Skills You Will Gain From Our Java Programming{" "}
                                                    <span className="text-c2">
                                                        Classes Online
                                                    </span>{" "}
                                                </h2>
                                                <p className="text-center text-white">
                                                    Here are the Java skills you will pick up in this course to start your journey as a Java developer
                                                </p>
                                            </div>
                                            <div className="rc_modules">
                                                <div className="row g-3">
                                                    {modules.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className={`${colClasses[index % colClasses.length]} col-md-6`}
                                                        >
                                                            <div className="module_box">
                                                                <p>{item}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* modules */}
                    <div id="modules">
                        <div className="rc_sec_6 pt-5 pb-3">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">
                                        <div className="pb-5">
                                            <h2 className="text-black text-center fw-bold px-3 lh-sm">
                                                Java Programming For  {" "}
                                                <span className="text-c2">
                                                    {" "}
                                                    Beginners
                                                </span>
                                                – Course Modules
                                            </h2>
                                            <p className="text-black text-center px-lg-5 mb-5">
                                                Start your Java journey with a clear roadmap built just for beginners. These 5 modules walk you through Java programming step by step, from basic concepts to object oriented programming. No prior coding experience needed, just curiosity and a little practice.
                                            </p>
                                            <div
                                                className="tabs-wrapper position-relative"
                                                ref={tabsWrapperRef}
                                            >
                                                <div className="tabs">
                                                    {[1, 2, 3, 4, 5].map((num, index) => (
                                                        <button
                                                            key={num}
                                                            ref={(el) => {
                                                                tabRefs.current[index] = el;
                                                            }}
                                                            className={`tab ${activeTab === num ? "active" : ""
                                                                }`}
                                                            onClick={() => setActiveTab(num)}
                                                        >
                                                            Module {num}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div
                                                    className="tab-indicator"
                                                    style={{
                                                        position: "absolute",
                                                        top: "45px",
                                                        left: `${contentLeft}px`,
                                                        transform: "translateX(-50%)",
                                                    }}
                                                />

                                                <div
                                                    className="tab-content-box positioned"
                                                    style={{
                                                        position: "absolute",
                                                        top: "70px",
                                                        left: `${contentLeft}px`,
                                                        transform: "translateX(-50%)",
                                                    }}
                                                >
                                                    <h6 className="mb-3">{currentContent.title}</h6>

                                                    <ul>
                                                        {currentContent.points.map((point, index) => (
                                                            <li key={index}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div id="benefits" className="pt-1 px-1">
                        <div className="rc_sec_7 rounded-5 py-4">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">
                                        <div>
                                            <h2 className="fw-bold text-white text-center mb-3">
                                                Who Can  {" "}
                                                <span className="text-c2">
                                                    Benefit
                                                </span>{" "}
                                                from This {" "}
                                                <span className="text-c2">
                                                    Course
                                                </span>
                                            </h2>
                                        </div>
                                        <div className="row justify-content-center">
                                            <div className="col-lg-10">
                                                <div className="benefits_card_parent">
                                                    <div className="row">
                                                        <div className="col-lg-6">
                                                            <div>
                                                                <p className="text-white text-center mb-0">Complete Beginners</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <div>
                                                                <p className="text-white text-center mb-0">Students & Working Professionals</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <div>
                                                                <p className="text-white text-center mb-0">Aspiring Java Developers</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <div>
                                                                <p className="text-white text-center mb-0">Career Switchers to IT</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div id="reviews" className="bg-white">
                        <div className="rc_sec_8">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">
                                        <div className="py-5">
                                            <h3 className="text-black fw-bold text-center">
                                                Success Stories from{" "}
                                                <span className="text-c2"> Java Learners</span>{" "}
                                            </h3>
                                            <div className="row justify-content-center">
                                                <div className="col-lg-10">
                                                    <div className="rc_testimonial">
                                                        <h5 className="fw-bold text-black text-center">
                                                            Our Student Review
                                                        </h5>

                                                        <Swiper
                                                            modules={[
                                                                Autoplay,
                                                                Pagination,
                                                            ]}
                                                            autoplay={{
                                                                delay: 3500,
                                                                disableOnInteraction: false,
                                                            }}
                                                            loop={true}
                                                            spaceBetween={30}
                                                            slidesPerView={1}
                                                            className="testimonial_swiper mt-4"
                                                        >
                                                            {/* Slide 1 */}
                                                            <SwiperSlide>
                                                                <div className="rc_testimonial_card">
                                                                    <div className="testimonial_content">
                                                                        <p>
                                                                            I started this Java recorded course with no coding experience at all. The concepts were
                                                                            explained in a very clear and simple way.Learning at my own pace helped me
                                                                            understand Python without pressure.Now I feel confident writing basic programs on my own.
                                                                        </p>

                                                                        <div className="student_info">
                                                                            <Image
                                                                                src={`${BASE_IMAGE_URL}recorded-course/student.png`}
                                                                                alt=""
                                                                                height={300}
                                                                                width={300}
                                                                            />
                                                                            <h6>
                                                                                Jennifer Lopez
                                                                            </h6>
                                                                            <div className="stars">
                                                                                ★★★★★
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </SwiperSlide>

                                                            {/* Slide 2 */}
                                                            <SwiperSlide>
                                                                <div className="rc_testimonial_card">
                                                                    <div className="testimonial_content">
                                                                        <p>
                                                                            I started this Java recorded course with no coding experience at all. The concepts were
                                                                            explained in a very clear and simple way.Learning at my own pace helped me
                                                                            understand Python without pressure.Now I feel confident writing basic programs on my own.
                                                                        </p>

                                                                        <div className="student_info">
                                                                            <Image
                                                                                src={`${BASE_IMAGE_URL}recorded-course/student.png`}
                                                                                alt=""
                                                                                width={300}
                                                                                height={300}
                                                                            />
                                                                            <h6>
                                                                                Arun Kumar
                                                                            </h6>
                                                                            <div className="stars">
                                                                                ★★★★★
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </SwiperSlide>
                                                        </Swiper>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* certificate */}
                    <div id="certificate">
                        <div className="rc_sec_9 pb-lg-2 pb-5">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">
                                        <div className="pt-5 ">
                                            <h3 className="text-white fw-bold text-center">
                                                Get Your  {" "}
                                                <span className="text-c2">
                                                    Free Java Online Course
                                                    {" "}
                                                </span>
                                                With Certificate
                                            </h3>
                                            <p className="text-center text-white">
                                                Get recognized for your skills with a certificate that proves your expertise in java programming
                                            </p>
                                            <div className="row justify-content-center">
                                                <div className="row">
                                                    <div className="col-lg-5 d-flex flex-column justify-content-center pt-4">
                                                        <div className="mb-2">
                                                            <h5 className="text-c2 fw-bold mb-3">
                                                                Industry-Recognized
                                                            </h5>
                                                            <p className="fw-bold text-white mb-1">
                                                                Validate Your Achievement
                                                            </p>
                                                            <p className="text-white mb-4">
                                                                A trusted certificate from one of the best Java programming for beginners courses with full recognition.
                                                            </p>
                                                        </div>
                                                        <div className="mb-2">
                                                            <h5 className="text-c2 fw-bold mb-3">
                                                                Verified Credentials
                                                            </h5>
                                                            <p className="fw-bold text-white mb-1">
                                                                Build a Professional Portfolio
                                                            </p>
                                                            <p className="text-white mb-4">
                                                                Showcase your verified Java certification to stand out as a skilled Java developer in software development.
                                                            </p>
                                                        </div>
                                                        <div className="mb-2">
                                                            <h5 className="text-c2 fw-bold mb-3">
                                                                Shareable Online
                                                            </h5>
                                                            <p className="fw-bold text-white mb-1">
                                                                Share Your Success
                                                            </p>
                                                            <p className="text-white mb-4">
                                                                Highlight your certificate on LinkedIn and resumes to unlock new career opportunities.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-7 d-flex align-items-start justify-content-center pt-4 px-lg-5 pb-lg-5">
                                                        <div className=" d-flex align-items-center justify-content-center">
                                                            <div className="col-lg-10">
                                                                <Image
                                                                    src={`/images/recorded-course/certificate.png`}
                                                                    className="w-100 rounded-4"
                                                                    alt=""
                                                                    width={340}
                                                                    height={340}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Duration & Fee */}
                    <div id="fees" className="course_fee_section py-5">
                        <div className="section_container">
                            <div className="row">
                                <div className="col-lg-8">

                                    {/* Heading */}
                                    <div className="row justify-content-center">
                                        <div className="col-lg-10 text-center mb-5">
                                            <h3 className="text-black fw-bold text-center">
                                                Java Course {" "}
                                                <span className="text-c2">
                                                    Duration & Fee
                                                    {" "}
                                                </span>
                                            </h3>
                                            <p className="text-muted">
                                                Learn Java at your own pace with lifetime free access to all
                                                recorded lessons and beginner friendly tutorials. Get complete
                                                value with an affordable fee and a clear learning path designed
                                                to make you job-ready.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row g-4 align-items-stretch">

                                        {/* Left Card */}
                                        <div className="col-lg-7">
                                            <div className="details_card h-100">
                                                <h4 className="fw-bold mb-4">Course Details</h4>
                                                <div className="row gy-4">
                                                    <div className="col-6">
                                                        <div className="course_item">
                                                            <i className="bi bi-play-circle"></i>
                                                            <div>
                                                                <h6>Format</h6>
                                                                <span>Self-Paced Recorded</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="course_item">
                                                            <i className="bi bi-clock"></i>
                                                            <div>
                                                                <h6>Duration</h6>
                                                                <span>Lifetime</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="course_item">
                                                            <i className="bi bi-box"></i>
                                                            <div>
                                                                <h6>Modules</h6>
                                                                <span>5 Modules</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="course_item">
                                                            <i className="bi bi-calendar-check"></i>
                                                            <div>
                                                                <h6>Time Commitments</h6>
                                                                <span>Flexible</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="course_item">
                                                            <i className="bi bi-award"></i>
                                                            <div>
                                                                <h6>Certificate</h6>
                                                                <span>Included</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="course_item">
                                                            <i className="bi bi-laptop"></i>
                                                            <div>
                                                                <h6>Device Support</h6>
                                                                <span>All Devices</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Right Card */}
                                        <div className="col-lg-5 ps-lg-0">
                                            <div className="price_card h-100">
                                                <span className="offer_badge">
                                                    Launch Offer
                                                </span>
                                                <h5 className="mt-4">Pricing</h5>
                                                <div className="price_box">
                                                    <h2>₹7,500</h2>
                                                    <del>₹15,000</del>
                                                </div>
                                                <span className="discount">Save 50%</span>
                                                <span className="text-muted small">
                                                    Limited time offer!
                                                </span>
                                                <div className="price_info">
                                                    <div className="row">
                                                        <div className="col-5">
                                                            <span>EMI Starts at</span>
                                                        </div>
                                                        <div className="col-7">
                                                            <strong>₹2,025/mo</strong>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-5">
                                                            <span>Access</span>
                                                        </div>
                                                        <div className="col-7">
                                                            <strong>Lifetime</strong>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-5">
                                                            <span>Payment</span>
                                                        </div>
                                                        <div className="col-7">
                                                            <strong>UPI, Cards, Net Banking</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="btn enroll_btn w-100 mt-4">
                                                    Enroll Now →
                                                </button>
                                                <p className="secure_text mt-3">
                                                    <i className="bi bi-lock-fill text-muted pe-2"></i>
                                                    Secure & Safe Payments
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* faq */}
                    <div id="faq" className="faq_section py-5">
                        <div className="section_container">
                            <div className="row">
                                <div className="col-lg-8">
                                    <h3 className="section_base_heading text-black text-center">
                                        Frequently Asked{" "}
                                        <span className="text-c2"> Questions</span>
                                    </h3>

                                    <div className="row mt-2 justify-content-center align-items-center">
                                        {/* FAQ Accordion */}
                                        <div className="col-lg-9 text-start">
                                            {faqData.map((item, index) => (
                                                <div
                                                    className={`faq_item rounded-3 mb-3 ${activeFaqIndex === index
                                                        ? "active"
                                                        : ""
                                                        }`}
                                                    key={index}
                                                    style={{ borderRadius: '26px !important' }}
                                                >
                                                    <button
                                                        className={`faq_question justify-content-between ${activeFaqIndex === index
                                                            ? "active"
                                                            : ""
                                                            }`}
                                                        onClick={() => toggleFaq(index)}
                                                    >
                                                        {item.question}

                                                        <span className="icon">
                                                            {activeFaqIndex !== index && (
                                                                <Image
                                                                    src="/images/icons/faq-icon.png"
                                                                    alt="toggle"
                                                                    height={35}
                                                                    width={35}
                                                                    className="faq_toggle_icon"
                                                                />
                                                            )}
                                                        </span>
                                                    </button>

                                                    {activeFaqIndex ===
                                                        index && (
                                                            <div className="faq_answer text-black">
                                                                {item.answer}
                                                            </div>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="rc-cta" className="rc_cta py-5">
                        <div className="section_container">
                            <div className="row justify-content-center">
                                <h3 className="text-white text-center">Learn Java and Start Your Journey Today</h3>
                                <p className="text-white text-center mt-2">
                                    Enroll in our  free Java online course today and step confidently into your career as a Java developer.
                                </p>
                                <div className="d-flex justify-content-center gap-3 mt-4">
                                    <button className="rc-cta-1">Enroll Now</button>
                                    <button className="rc-cta-2">Download Syllabus</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}