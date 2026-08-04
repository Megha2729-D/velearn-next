"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
    Autoplay,
    Navigation,
    EffectCoverflow,
    Pagination,
} from "swiper/modules";
import "./style.css"
import "swiper/css";
import "swiper/css/effect-coverflow";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

export default function DataAnalytics() {
    const router = useRouter();

    const swiperRef = useRef<any>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTab, setActiveTab] = useState(1);
    const [activeToolName, setActiveToolName] = useState("");
    const [activeShadow, setActiveShadow] = useState("");
    const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
    const [user, setUser] = useState<any>(null);
    const [courseId] = useState(1);
    const [activeSlide, setActiveSlide] = useState<number>(0);
    const [cardOrder, setCardOrder] = useState([0, 1, 2, 3]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [errors, setErrors] = useState<any>({});

    const [isEnrolled, setIsEnrolled] = useState(false);

    const [showEnrollSuccessModal, setShowEnrollSuccessModal] =
        useState(false);

    const [showEnrollFormModal, setShowEnrollFormModal] =
        useState(false);

    const [showConfirmModal, setShowConfirmModal] =
        useState(false);

    const [contentLeft, setContentLeft] = useState<number>(0);

    const tabsWrapperRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    // const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(
                (user.phonenumber || user.phone || "")
                    .replace(/^\+?91/, "")
                    .trim()
            );

            checkEnrollment(user.id);
        }
    }, []);

    const checkEnrollment = async (userId: number) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${BASE_API_URL}live-course-history/${userId}`,
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                }
            );

            const data = await res.json();

            if (data.status) {
                const enrolled = data.data.some(
                    (c: any) => c.id === courseId
                );

                setIsEnrolled(enrolled);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!name.trim())
            newErrors.name = "Name is required";

        if (!phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^[0-9]{10}$/.test(phone)) {
            newErrors.phone =
                "Enter valid 10 digit phone number";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email =
                "Enter valid email address";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleEnroll = () => {
        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        if (!user) {
            router.push("/login");
            return;
        }

        if (!validateForm()) return;

        setShowConfirmModal(true);
    };

    const confirmEnroll = async () => {
        try {
            const user = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            const token = localStorage.getItem("token");

            const payload = {
                name,
                phone,
                email,
                lead_source: "Website",
                course_id: courseId,
                auth_id: user.id,
            };

            const response = await fetch(
                `${BASE_API_URL}enroll-now`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (data.status) {
                toast.success("Enrollment request sent!");

                setIsEnrolled(true);
                setShowEnrollSuccessModal(true);
                setShowEnrollFormModal(false);
            } else {
                toast.error(
                    data.message || "Enrollment failed"
                );
            }
        } catch (error) {
            toast.error("Enrollment failed");
        }
    };

    const handleCourseAction = () => {
        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        if (!user) {
            router.push("/login");
            return;
        }

        if (isEnrolled) {
            router.push("/live-course-history");
        } else {
            setShowEnrollFormModal(true);
        }
    };

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
            title: "All Modules",
            points: [
                "HTML, CSS & Dev Environment",
                "Advanced CSS & Tailwind CSS",
                "JavaScript Fundamentals",
                "Advanced JavaScript (ES6+)",
                "Git & GitHub",
                "React Fundamentals",
                "React Hooks & Routing",
                "TypeScript Basics",
                "Redux Toolkit",
                "REST API Integration",
                "Node.js Fundamentals",
                "Express.js",
                "MySQL",
                "MongoDB & Mongoose",
                "Authentication & Authorization (JWT)",
                "Docker & CI/CD",
                "AWS Deployment",
                "AI Integration",
                "Capstone Project",
            ],
        },

        2: {
            title: "UX Foundations",
            points: [
                "Introduction to UX Design",
                "Design Thinking Process",
                "User Research",
                "User Personas",
                "Empathy Mapping",
                "User Journey Mapping",
                "Information Architecture",
                "Wireframing",
                "Low-Fidelity Prototyping",
                "Usability Testing",
            ],
        },

        3: {
            title: "UI Design",
            points: [
                "Design Principles",
                "Color Theory",
                "Typography",
                "Layout & Grid Systems",
                "Figma Fundamentals",
                "Components & Auto Layout",
                "Design Systems",
                "Responsive UI Design",
                "High-Fidelity Mockups",
                "Interactive Prototyping",
            ],
        },

        4: {
            title: "AI Sessions",
            points: [
                "Introduction to AI",
                "Prompt Engineering",
                "ChatGPT for Developers",
                "GitHub Copilot",
                "AI-Powered Code Generation",
                "AI Debugging Techniques",
                "AI for UI/UX Design",
                "AI in Web Development",
                "AI Productivity Tools",
                "Building AI-Powered Applications",
            ],
        },

        5: {
            title: "Projects",
            points: [
                "Responsive Landing Page",
                "JavaScript Mini Projects",
                "React CRUD Application",
                "REST API Project",
                "Authentication System",
                "Full Stack MERN Application",
                "Deployment Project",
                "Capstone Project",
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

    const recruiters1 = [
        "accenture.png",
        "tech-mahindra.png",
        "wipro.png",
        "tcs.png",
        "ibm.png",
        "infosys.png",
    ];

    const faqData = [
        {
            question: "What is the purpose of a data analytics course?",
            answer: (
                <>
                    <p>
                        It teaches you to clean and analyze data to find insights that drive business decisions, using tools like Excel, SQL, Python, Power BI, and Tableau to start a career as a data analyst.
                    </p>
                </>
            ),
        },
        {
            question: " Is there a difference between data science and data analysis?",
            answer: (
                <>
                    <p>
                        Yes. Data analysis focuses on examining existing data to identify
                        trends, generate reports, and support business decisions. Data
                        science is a broader field that includes data analysis along with
                        machine learning, predictive modeling, programming, and building
                        data-driven solutions using large datasets.
                    </p>
                </>
            ),
        },
        {
            question: "Are the classes live or recorded?",
            answer: (
                <>
                    <p>
                        The course includes live instructor-led sessions for interactive
                        learning. Recordings of the classes are also provided, allowing
                        you to revisit lessons anytime and learn at your own pace if you
                        miss a session.
                    </p>
                </>
            ),
        },
        {
            question: "Will I get a certificate after completing the course?",
            answer: (
                <>
                    <p>
                        Yes. Upon successfully completing the course and meeting the
                        required assessment criteria, you will receive a course
                        completion certificate that you can showcase on your resume and
                        professional profiles.
                    </p>
                </>
            ),
        },
        {
            question: "Do you provide placement assistance?",
            answer: (
                <>
                    <p>
                        Yes. We provide placement assistance that includes resume
                        building, LinkedIn profile optimization, mock interviews,
                        portfolio guidance, and job referrals to help you prepare for
                        data science career opportunities.
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
            <section className="banner_top_sec_parent">
                <div className="banner_top_sec">
                    <div className="details_banner">
                        <div className="details_banner_inner" style={{ padding: "150px 0 20px" }}>
                            <div className="section_container">
                                <div className="row justify-content-between">
                                    <div className="col-lg-8">
                                        <div className="pe-lg-5">
                                            <h1 className="text-white">
                                                Kickstart Your Analytics Career with Data Analytics Courses Online
                                            </h1>
                                            <p className="text-white small mt-4">
                                                Step into the future of data analytics with the modern AI skills today's analysts need. This hands-on data analyst course takes you from Excel and SQL to Python, Microsoft Power BI, and Tableau, all through live interactive classes.
                                            </p>
                                            <div className="d-flex justify-content-start gap-2">
                                                <button
                                                    onClick={handleCourseAction}
                                                >
                                                    {isEnrolled
                                                        ? "Start Course"
                                                        : user
                                                            ? "Enroll Now"
                                                            : "Login to Enroll"}
                                                </button>
                                                <button className="demo_butt"
                                                    onClick={handleCourseAction}
                                                >
                                                    {
                                                        !user
                                                            ? "Login to Book Demo"
                                                            : isEnrolled
                                                                ? "Book Demo"
                                                                : "Enroll Now"
                                                    }
                                                </button>
                                            </div>
                                            {/* <button>Enroll Now</button> */}
                                            <div className="pagination_parent d-lg-flex d-none">
                                                <Link href={"/"}>Home</Link>
                                                <span className="px-2">
                                                    {" "}
                                                    /
                                                </span>
                                                <Link href={"/live-course"}>
                                                    {" "}
                                                    Live Courses{" "}
                                                </Link>
                                                <span className="px-2">
                                                    /
                                                </span>
                                                <span>
                                                    Data Analytics
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 mt-5 mt-lg-0 position-relative">
                                        <form onSubmit={handleEnroll}>
                                            <div className="d-flex flex-column w-100 my-3">
                                                <label htmlFor="name">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={name}
                                                    onChange={(e) =>
                                                        setName(e.target.value)
                                                    }
                                                    className={
                                                        errors
                                                            .name
                                                            ? "is-invalid"
                                                            : ""
                                                    }
                                                />
                                            </div>
                                            <div className="d-flex flex-column w-100 my-3">
                                                <label htmlFor="phone">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="number"
                                                    name="phone"
                                                    value={phone}
                                                    onChange={(e) =>
                                                        setPhone(e.target.value)
                                                    }
                                                    className={
                                                        errors
                                                            .phone
                                                            ? "is-invalid"
                                                            : ""
                                                    }
                                                />
                                            </div>
                                            <div className="d-flex flex-column w-100 my-3">
                                                <label htmlFor="email">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    className={
                                                        errors
                                                            .email
                                                            ? "is-invalid"
                                                            : ""
                                                    }
                                                />
                                            </div>
                                            <div className="d-flex justify-content-center mb-3">
                                                {isEnrolled ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push("/live-course-history")}
                                                        className="w-100"
                                                    >
                                                        Start Course
                                                    </button>
                                                ) : (
                                                    <button
                                                        type={
                                                            user
                                                                ? "submit"
                                                                : "button"
                                                        }
                                                        onClick={() => {
                                                            if (!user)
                                                                router.push("/login")
                                                        }}
                                                        className="w-100"
                                                    >
                                                        {user
                                                            ? "Enroll Now"
                                                            : "Login to Enroll"}
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                        <div className="pagination_parent mt-5 d-lg-none d-flex justify-content-center">
                                            <Link href={"/"}>Home</Link>
                                            <span className="px-2"> /</span>
                                            <Link href={"/live-course"}>
                                                {" "}
                                                Live courses{" "}
                                            </Link>
                                            <span className="px-2">/</span>
                                            <Link href={"/course-details"}>
                                                {" "}
                                                Data Science in English
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="banner_details pt-3">
                                        <div className="section_container">
                                            <div className="col-12 d-flex justify-content-center">
                                                <div className="col-lg-11">
                                                    <div className="ms-lg-5 ms-2 py-3">
                                                        <div className="row text-center justify-content-lg-evenly justify-content-center">
                                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                                    <p className="text-white mb-1 text-center">
                                                                        Weeks
                                                                    </p>
                                                                    <p className="text-white mb-0 text-center fw-bold">
                                                                        12
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                                    <p className="text-white mb-1 text-center">
                                                                        Total Hours
                                                                    </p>
                                                                    <p className="text-white mb-0 text-center fw-bold">
                                                                        120 hrs
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                                    <p className="text-white mb-1 text-center">
                                                                        Taught In
                                                                    </p>
                                                                    <p className="text-white mb-0 text-center fw-bold">
                                                                        தமிழ்
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                                    <p className="text-white mb-1 text-center">
                                                                        1:1
                                                                    </p>
                                                                    <p className="text-white mb-0 text-center fw-bold">
                                                                        Doubt Sessions
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                                    <p className="text-white mb-1 text-center">
                                                                        Placement
                                                                    </p>
                                                                    <p className="text-white mb-0 text-center fw-bold">
                                                                        Support
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
                    </div>
                </div>
            </section>
            <section className="batch_details_parent">
                <div className="section_container pb-5">
                    <div className="batch_details d-flex justify-content-center">
                        <div>
                            <p className="fw-bold text-white text-center">Next batch starts 15 June 2026 Only 5 seats remaining</p>
                        </div>
                    </div>
                    <div className="row mt-4 justify-content-center">
                        <h3 className="text-white text-center fw-bold px-3 lh-sm">
                            Step Into a
                            <span className="text-c2">
                                {" "}
                                High Demand Career
                                {" "}
                            </span>
                            and Learn Data Analytics Online
                        </h3>
                        <div className="col-lg-10">
                            <p className="text-white text-center mt-2">
                                Data analytics is one of the most in demand career paths today. Our best online data analytics training helps you grow step by step into a confident data analyst who works with real world datasets. Analyze data, master data cleaning, build business intelligence dashboards, and use AI tools to turn raw data into real world insights.
                            </p>
                        </div>
                        <div>
                            <div className="row justify-content-center position-relative">
                                <div className="col-lg-6">
                                    <Image src={"/images/live-course/data-analytics/career-center.png"}
                                        className="w-100 h-auto"
                                        width={700}
                                        height={700}
                                        alt="" />
                                </div>
                                <div className="da_career_card_parent">
                                    <div className="da_career_card one">
                                        <p className="fw-bold text-white mb-2">Work smarter with AI</p>
                                        <p className="small text-white">Use AI tools to analyze data and surface insights in less time</p>
                                    </div>
                                    <div className="da_career_card two">
                                        <p className="fw-bold text-white mb-2">Query data with SQL</p>
                                        <p className="small text-white">Pull, filter, and combine data from databases using SQL queries</p>
                                    </div>
                                    <div className="da_career_card three">
                                        <p className="fw-bold text-white mb-2">Build business intelligence dashboards</p>
                                        <p className="small text-white">Design interactive dashboards with filters and drill downs in Microsoft Power BI and Tableau</p>
                                    </div>
                                    <div className="da_career_card four">
                                        <p className="fw-bold text-white mb-2">Predict with machine learning</p>
                                        <p className="small text-white">Build regression and clustering models to find patterns and predict outcomes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="bg_bottom">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <h3 className="text-black text-center fw-bold px-3 lh-sm">
                            Master the Core Data Analyst
                            <span className="text-c2">
                                {" "}
                                Skills And Tools
                                {" "}
                            </span>
                        </h3>
                        <div className="col-lg-10">
                            <p className="text-black text-center mt-2">
                                Build the complete analyst toolkit, from Excel and SQL to Python. Go deeper into dashboards with a hands-on Power BI online course and drag and drop visuals in one of the best Tableau courses online, while mastering data cleaning, exploratory data analysis, statistics, and business intelligence.
                            </p>
                        </div>
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="tools_card">
                                    <p>Data Cleaning & Preparation</p>
                                    <p>SQL & Database Querying</p>
                                    <p>Data Storytelling & Reporting</p>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="tools_card">
                                    <p>Data Wrangling with Python</p>
                                    <p>Exploratory Data Analysis (EDA)</p>
                                    <p>Machine Learning Basics</p>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="tools_card">
                                    <p>Statistics & Hypothesis Testing</p>
                                    <p>Data Visualization</p>
                                    <p>Business Intelligence Dashboards</p>
                                </div>
                            </div>
                            <div className="col-12">
                                <Image src={"/images/live-course/data-analytics/da-tools.svg"} className="w-100 h-auto" width={500} height={500} alt="" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    What You Learn in Our
                                    <span className="text-c2">
                                        {" "}Data Analytics{" "}
                                    </span>
                                    Training Online
                                </h3>
                                <p className="text-center">
                                    This program takes you from data foundations and statistics to visualization, business intelligence, and machine learning. You also learn to use AI tools for analytics, which makes it the best AI data analytics course for anyone building a data career, ending with a real world capstone project.
                                </p>
                            </div>
                            <div
                                className="tabs-wrapper position-relative"
                                ref={tabsWrapperRef}
                            >
                                <div className="tabs">
                                    {Object.entries(content).map(([key, item], index) => (
                                        <button
                                            key={key}
                                            ref={(el) => {
                                                tabRefs.current[index] = el;
                                            }}
                                            className={`tab ${activeTab === Number(key) ? "active" : ""}`}
                                            onClick={() => setActiveTab(Number(key))}
                                        >
                                            {item.title} ({item.points.length})
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
                                    className="tab-content-parent"
                                    style={{
                                        position: "absolute",
                                        top: "70px",
                                        left: `${contentLeft}px`,
                                        transform: "translateX(-50%)",
                                        zIndex: '1',
                                    }}
                                >
                                    {/* <h6 className="mb-3">{currentContent.title}</h6> */}

                                    <div className="tab-content-box positioned">
                                        <ul>
                                            {currentContent.points.map((point, index) => (
                                                <li key={index}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="download_syll_butt mt-3">
                                        <div className="download_icon">
                                            <i className="bi bi-download text-black"></i>
                                        </div>
                                        <span>Download Full Syllabus</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    Learn Smarter with Online
                                    <span className="text-c2">
                                        {" "}Data Analytics & AI Courses{" "}
                                    </span>
                                </h3>
                                <p className="text-center">
                                    This program takes you from data foundations and statistics to visualization, business intelligence, and machine learning. You also learn to use AI tools for analytics, which makes it the best AI data analytics course for anyone building a data career, ending with a real world capstone project.
                                </p>
                            </div>
                            <div className="col-lg-4">
                                <div className="tools_card">
                                    <p className="mb-3 fw-bold">AI-Assisted SQL</p>
                                    <p>Learn to use AI tools to write, fix, and speed up your SQL queries, so you spend less time debugging and more time finding answers in your data.</p>
                                </div>
                            </div>
                            <div className="col-lg-4 ms-lg-2">
                                <div className="tools_card">
                                    <p className="mb-3 fw-bold">AI-Driven Insights</p>
                                    <p>Use generative AI to turn raw data into automatic insights, ask questions in plain language, and get to key findings without heavy manual analysis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="from_start_sec row justify-content-center">
                            <div className="col-lg-9 mb-4">
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    Your Step by
                                    <span className="text-c2">
                                        {" "}Step Learning Journey{" "}
                                    </span>
                                    to Becoming a Data Analyst with Velearn
                                </h3>
                            </div>
                            <div className="journey_wrap position-relative">
                                <div className="journey_bg_icon"></div>
                                <div className="dotted_lines">
                                    <div className="position-relative d-flex justify-content-center">
                                        <Image
                                            src={`/images/details-page/journey/dotted-lines.png`}
                                            className="dotted-line-img h-auto"
                                            width={1500}
                                            height={550}
                                            alt=""
                                        />
                                    </div>
                                </div>
                                <div className="rocket_wrap">
                                    <Image
                                        src={`/images/details-page/journey/rocket.png`}
                                        className="rocket_img h-auto"
                                        width={100}
                                        height={100}
                                        alt=""
                                    />
                                </div>
                                <div className="journey_item item_1">
                                    <div className="parent">
                                        <Image
                                            src={`/images/details-page/journey/step-1.png`}
                                            height={200}
                                            width={200}
                                            alt=""
                                        />
                                        <div>
                                            <h6>Free Career Discussion</h6>
                                            <p>
                                                Connect with experts to choose the
                                                right career and course.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="journey_item item_2">
                                    <div className="parent">
                                        <div>
                                            <h6>Live Trainer-Led Classes</h6>
                                            <p>
                                                Clear learning path from foundation
                                                to expertise.
                                            </p>
                                        </div>
                                        <Image
                                            src={`/images/details-page/journey/step-2.png`}
                                            height={200}
                                            width={200}
                                            alt=""
                                        />
                                    </div>
                                </div>

                                <div className="journey_item item_3">
                                    <div className="parent">
                                        <Image
                                            src={`/images/details-page/journey/step-3.png`}
                                            height={200}
                                            width={200}
                                            alt=""
                                        />
                                        <div>
                                            <h6>Hands-on Projects & Practice</h6>
                                            <p>
                                                Every topic includes assignments and
                                                real-world projects to build strong,
                                                job-ready skills.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="journey_item item_4">
                                    <div className="parent">
                                        <div>
                                            <h6>Resume & Portfolio Building</h6>
                                            <p>
                                                We shape your skills into resumes,
                                                portfolios, and interview success.
                                            </p>
                                        </div>
                                        <Image
                                            src={`/images/details-page/journey/step-4.png`}
                                            height={200}
                                            width={200}
                                            alt=""
                                        />
                                    </div>
                                </div>

                                <div className="journey_item item_5">
                                    <div className="parent">
                                        <Image
                                            src={`/images/details-page/journey/step-5.png`}
                                            height={200}
                                            width={200}
                                            alt=""
                                        />
                                        <div>
                                            <h6>End-to-End Placement Support</h6>
                                            <p>
                                                Train with mock interviews and learn
                                                to answer with confidence. Career
                                                support that stays until you get
                                                hired.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="row justify-content-center">
                            <div className="col-lg-10 position-relative z-1">
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    Projects That
                                    <span className="text-c2">
                                        {" "}Turn Learning{" "}
                                    </span>
                                    Into Experience
                                </h3>
                            </div>
                            <div className="position-relative">
                                <div className="row justify-content-center screen_parent">
                                    <div className="col-lg-6 col-8">
                                        <Swiper
                                            loop={true}
                                            pagination={false}
                                            slidesPerView={1}
                                            modules={[Autoplay, Navigation]}
                                            navigation={true}
                                        // autoplay={{
                                        //     delay: 2000,
                                        //     disableOnInteraction: false,
                                        // }}
                                        // breakpoints={{
                                        //     0: { slidesPerView: 2.3 },
                                        //     576: { slidesPerView: 2.3 },
                                        //     768: { slidesPerView: 3.3 },
                                        //     991: { slidesPerView: 3.3 },
                                        //     1024: { slidesPerView: 3.3 },
                                        //     1200: { slidesPerView: 5 },
                                        // }}
                                        >
                                            <SwiperSlide className="d-flex justify-content-center">
                                                <Image src={"/images/live-course/data-analytics/da-screen-swiper.png"}
                                                    className="w-100 h-auto"
                                                    height={500}
                                                    width={630}
                                                    alt="" />
                                            </SwiperSlide>
                                            <SwiperSlide className="d-flex justify-content-center">
                                                <Image src={"/images/live-course/data-analytics/da-screen-swiper.png"}
                                                    className="w-100 h-auto"
                                                    height={500}
                                                    width={630}
                                                    alt="" />
                                            </SwiperSlide>
                                        </Swiper>
                                    </div>
                                </div>
                                <Image src={"/images/live-course/data-analytics/da-circle.png"}
                                    className="exp_bg w-100 h-auto"
                                    height={600}
                                    width={1290}
                                    alt="" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="row justify-content-center my-5">
                            <div className="col-lg-9">
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    <span className="text-c2">
                                        {" "}Get Recognized{" "}
                                    </span>
                                    with Data Analytics Courses Online with
                                    <span className="text-c2">
                                        {" "}Certification
                                    </span>
                                </h3>
                            </div>
                            <div className="col-lg-10 mt-4">
                                <div className="row">
                                    <div className="col-lg-6 d-flex flex-column justify-content-center">
                                        <div className="mb-4">
                                            <h5 className="text-black fw-bold mb-3">
                                                Validate Your Achievement
                                            </h5>
                                            <p className="text-black mb-4">
                                                Complete the program and earn a Data Analytics Professional Certificate that proves your data analysis skills to hiring companies.
                                            </p>
                                        </div>
                                        <div className="mb-4">
                                            <h5 className="text-black fw-bold mb-3">
                                                Build a Professional Skill Portfolio
                                            </h5>
                                            <p className="text-black mb-4">
                                                Pair your certificate with real world projects, dashboards, and business intelligence reports that prove your readiness as a data analyst.
                                            </p>
                                        </div>
                                        <div className="mb-4">
                                            <h5 className="text-black fw-bold mb-3">
                                                Share Your Success
                                            </h5>
                                            <p className="text-black mb-4">
                                                Showcase your achievement on LinkedIn and job applications as a certified data analyst ready to turn data into insights.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 d-flex align-items-center justify-content-center p-lg-5">
                                        <div className=" d-flex align-items-center justify-content-center">
                                            <div className="col-lg-10">
                                                <Image
                                                    src={`/images/details-page/certificate.png`}
                                                    className="w-100 h-auto"
                                                    height={500}
                                                    width={500}
                                                    alt=""
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile_seciton py-3">
                    <div className="section_container">
                        <h3 className="text-white text-center fw-bold px-3 lh-sm">
                            Data Analytics Online Course with
                            <span className="text-c2">
                                {" "}Placement Assistance
                            </span>
                        </h3>
                        <div className="row mt-4 justify-content-center">
                            <div className="col-lg-6">
                                <div className="profile_content">
                                    <div className="my-4">
                                        <h5 className="text-white fw-bold">Resume & Portfolio Building</h5>
                                        <p className="text-white mb-0">
                                            Build a strong data analyst resume and showcase your capstone projects and dashboards to employers.
                                        </p>
                                    </div>
                                    <div className="my-4">
                                        <h5 className="text-white fw-bold">Interview Preparation</h5>
                                        <p className="text-white mb-0">
                                            Practice real data analytics interview questions with mock interviews and expert feedback.
                                        </p>
                                    </div>
                                    <div className="my-4">
                                        <h5 className="text-white fw-bold">Job Referrals & Openings</h5>
                                        <p className="text-white mb-0">
                                            Get connected to relevant data analyst jobs and referrals from our hiring network.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 d-flex justify-content-center align-items-center">
                                <Image src={"/images/live-course/data-analytics/profile.png"} className="h-auto" width={200} height={200} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="salary_seciton pt-3">
                    <div className="section_container">
                        <h3 className="text-white text-center fw-bold px-3 lh-sm">
                            Explore Career Roles and Salaries in Data Analytics
                        </h3>
                        <div className="row w-100 m-auto justify-content-center position-relative">
                            <div className="col-lg-7 d-flex justify-content-center align-items-center">
                                <div className="person_circle_img">
                                    <Image src={"/images/live-course/data-analytics/person-circle.svg"} className="w-100 h-auto" width={200} height={200} alt="" />
                                </div>
                            </div>
                            <div className="salary_content_parent">
                                <div className="one">
                                    <p className="fw-bold text-black mb-2">
                                        Mid-Level BI Analyst <br /> ₹6 – 12 LPA
                                    </p>
                                    <p className="small mb-0 text-black">
                                        Builds advanced dashboards, defines KPIs, and turns data into insights for decision making.
                                    </p>
                                </div>
                                <div className="two">
                                    <p className="fw-bold text-black mb-2">
                                        Junior Data Analyst<br />₹3.5 – 6 LPA
                                    </p>
                                    <p className="small mb-0 text-black">
                                        Cleans data, builds reports and dashboards, and tracks KPIs to support business teams.
                                    </p>
                                </div>
                                <div className="three">
                                    <p className="fw-bold text-black mb-2">
                                        Senior Data Scientist<br />₹15 – 25 LPA
                                    </p>
                                    <p className="small mb-0 text-black">
                                        Applies machine learning and predictive models to solve complex business problems.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="section_container p-xl text-center mt-lg-3 logo_swiper">
                        <h3 className="section_base_heading text-white text-center">
                            Trusted by Top Hiring Partners
                        </h3>
                        <div className="pb-5">
                            <Swiper
                                className="pt-3"
                                modules={[Autoplay]}
                                spaceBetween={30}
                                slidesPerView={5}
                                speed={3000}
                                autoplay={{
                                    delay: 0,
                                    disableOnInteraction: false,
                                    reverseDirection: true,
                                }}
                                loop={true}
                                grabCursor={false}
                                allowTouchMove={false}
                                breakpoints={{
                                    320: { slidesPerView: 2 },
                                    768: { slidesPerView: 3 },
                                    1024: { slidesPerView: 5 },
                                }}
                            >
                                {recruiters1.map((logo, index) => (
                                    <SwiperSlide key={index}>
                                        <Image
                                            src={`/images/prime-recruiters/${logo}`}
                                            alt={`Partner ${index + 1}`}
                                            className="partner-logo"
                                            height={50}
                                            width={150}

                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                    <div className="section_container mt-4 da_tesimonial_swiper_main">
                        <h3 className="section_base_heading text-white text-center">
                            Success Written by Our Students
                        </h3>
                        <div className="col-12">
                            <div className="position-relative">
                                <div className="da_tesimonial_swiper_students">
                                    <Image src={"/images/live-course/data-analytics/testimonial-persons.png"}
                                        className="w-100 h-auto"
                                        width={1300}
                                        height={700}
                                        alt="" />
                                </div>
                                <div className="da_tesimonial_swiper_parent row justify-content-center">
                                    <div className="col-lg-10">
                                        <Swiper
                                            loop={true}
                                            pagination={false}
                                            slidesPerView={4}
                                            modules={[Autoplay, Navigation]}
                                            navigation={true}
                                            autoplay={{
                                                delay: 2000,
                                                disableOnInteraction: false,
                                            }}
                                            spaceBetween={10}
                                            breakpoints={{
                                                0: { slidesPerView: 1, spaceBetween: 10 },
                                                576: { slidesPerView: 1, spaceBetween: 10 },
                                                768: { slidesPerView: 2, spaceBetween: 15 },
                                                991: { slidesPerView: 2, spaceBetween: 20 },
                                                1024: { slidesPerView: 4, spaceBetween: 20 },
                                                1200: { slidesPerView: 4, spaceBetween: 20 },
                                            }}
                                        >
                                            <SwiperSlide className="d-flex justify-content-center">
                                                <div className="da_testimonial_card">
                                                    <p className="fw-bold text-black">Ava Thompson</p>
                                                    <p>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                    </p>
                                                    <p className="small mb-0">
                                                        "This product has been a game changer for me! The ease of use and the attention to detail make it perfect for everyday tasks. Highly recommended!"
                                                    </p>
                                                </div>
                                            </SwiperSlide>
                                            <SwiperSlide className="d-flex justify-content-center">
                                                <div className="da_testimonial_card">
                                                    <p className="fw-bold text-black">James Collins</p>
                                                    <p>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                    </p>
                                                    <p className="small mb-0">
                                                        "Top-notch product with exceptional craftsmanship. It’s both functional and stylish, which is hard to find. I’m really satisfied with my experience!"
                                                    </p>
                                                </div>
                                            </SwiperSlide>
                                            <SwiperSlide className="d-flex justify-content-center">
                                                <div className="da_testimonial_card">
                                                    <p className="fw-bold text-black">Olivia Rodriguez</p>
                                                    <p>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                    </p>
                                                    <p className="small mb-0">
                                                        "I couldn’t be happier with my purchase. The quality is excellent, and it works flawlessly. It’s definitely worth every penny!"
                                                    </p>
                                                </div>
                                            </SwiperSlide>
                                            <SwiperSlide className="d-flex justify-content-center">
                                                <div className="da_testimonial_card">
                                                    <p className="fw-bold text-black">Michael Carter</p>
                                                    <p>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                    </p>
                                                    <p className="small mb-0">
                                                        "From the moment I received it, I knew this product was special. The performance is impressive, and the design is sleek and modern. I’ll definitely be recommending it to friends."
                                                    </p>
                                                </div>
                                            </SwiperSlide>
                                            <SwiperSlide className="d-flex justify-content-center">
                                                <div className="da_testimonial_card">
                                                    <p className="fw-bold text-black">Ava Thompson</p>
                                                    <p>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                        <i className="bi bi-star-fill"></i>
                                                    </p>
                                                    <p className="small mb-0">
                                                        "This product has been a game changer for me! The ease of use and the attention to detail make it perfect for everyday tasks. Highly recommended!"
                                                    </p>
                                                </div>
                                            </SwiperSlide>
                                        </Swiper>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section_container py-4">
                    <div className="row justify-content-center">
                        <h3 className="text-black text-center fw-bold px-3">
                            Pick Your Batch and Learn on Your Schedule
                        </h3>
                        <div className="col-lg-10 mt-4">
                            <div className="row justify-content-evenly">
                                <div className="col-lg-4 my-3">
                                    <div className="da_batch_inner">
                                        <h4 className="text-c2 fw-bold">Weekday Batch</h4>
                                        <p className="fw-bold">Monday - Friday</p>
                                        <p className="small">
                                            3 Month / 120 Hours<br />
                                            (include Doubt Clearing)
                                        </p>
                                        <p>Session Recordings Included</p>
                                        <button>Enroll In Weekday Batch</button>
                                    </div>
                                </div>
                                <div className="col-lg-4 my-3">
                                    <div className="da_batch_inner">
                                        <h4 className="text-c2 fw-bold">Weekday Batch</h4>
                                        <p className="fw-bold">Monday - Friday</p>
                                        <p className="small">
                                            3 Month / 120 Hours<br />
                                            (include Doubt Clearing)
                                        </p>
                                        <p>Session Recordings Included</p>
                                        <button>Enroll In Weekday Batch</button>
                                    </div>
                                </div>
                                <div className="col-lg-8 my-5 batch_parent">
                                    <div className="da_batch_inner">
                                        <div className="col-lg-12 ">
                                            <div className="row batch_child">
                                                <div className="col-lg-6 d-flex align-items-center">
                                                    <div>
                                                        <h5 className="text-black fw-bold">Self-Paced</h5>
                                                        <p className="text-black">Learn at your own schedule </p>
                                                        <p className="text-black small mb-0">Prefer to learn on your own time? Get the full recorded course with lifetime access.</p>

                                                        <div className="col-12 mt-4 d-flex justify-content-start">
                                                            <button>Explore self-paced course</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 d-flex align-items-center mt-lg-0 mt-4">
                                                    <ul className="p-0 m-0">
                                                        <li>All recordings + materials</li>
                                                        <li>Lifetime access</li>
                                                        <li>Certificate of completion</li>
                                                        <li>Learn at your own pace</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row justify-content-center mt-5">
                                        <div className="col-lg-12 da_pricing_plan">
                                            <div className="pricing_card">
                                                <h3 className="fw-bold text-black">
                                                    An Investment in Your Career That Pays You Back
                                                </h3>
                                                <div className="features mt-4 px-lg-4 px-0">
                                                    <ul>
                                                        <li>
                                                            ✓ One-Time Payment – No hidden
                                                            charges
                                                        </li>
                                                        <li>✓ Lifetime Course Access</li>
                                                        <li>✓ Live Interactive Classes</li>
                                                    </ul>

                                                    <ul>
                                                        <li>
                                                            ✓ Real-Time Hands-On Projects
                                                        </li>
                                                        <li>
                                                            ✓ Portfolio Building & Resume
                                                            Review
                                                        </li>
                                                        <li>
                                                            ✓ Mock Interviews + Placement
                                                            Support
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="price_box">
                                                    <div className="d-flex align-items-center justify-content-center gap-4">
                                                        <span className="old_price mb-0">
                                                            ₹50,000
                                                        </span>
                                                        <span className="h2 new_price mb-0">
                                                            ₹15,000/-
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    className="apply_btn"
                                                    onClick={handleCourseAction}
                                                >
                                                    {isEnrolled
                                                        ? "Start Course"
                                                        : "Apply Now"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-10">
                                    <div className="faq_section pt-2 pb-5">
                                        <div className="row justify-content-center">
                                            <div className="col-lg-9">
                                                <h3 className="section_base_heading text-center">
                                                    Frequently Asked{" "}
                                                    <span className="text-c2"> Questions</span>
                                                </h3>
                                                <p className="text-black text-center">
                                                    These quick answers cover what most learners want to know about the course, classes, and career support.
                                                </p>
                                            </div>
                                        </div>
                                        {faqData.map((item, index) => (
                                            <div
                                                className={`faq_item mb-3  ${activeFaqIndex === index
                                                    ? "active"
                                                    : ""
                                                    }`}
                                                key={index}
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
                                                        <div className="faq_answer">
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
                <div className="da_cta position-relative">
                    <Image src={"/images/live-course/data-analytics/da-cta-person.png"} className="da_cta_person" width={3000} height={500} alt="" />
                    <Image src={"/images/live-course/data-analytics/cta-banner.svg"} className="da_cta_lg w-100 h-auto" style={{ objectFit: 'cover' }} width={3000} height={500} alt="" />
                    <div className="section_container">
                        <div className="row justify-content-center align-items-center w-100 m-auto">
                            <div className="da_cta_inner mt-lg-5">
                                <h3 className="fw-bold text-white text-lg-start text-center">Join Our UI UX Online Course Today </h3>
                                <p className="small lh-lg text-white text-lg-start text-center">Take the next step in your UI UX career. Join our UI UX design course online and learn live with industry mentors, real projects, and AI integration, all in one program.</p>
                                <div className="col-12 d-flex justify-content-center justify-content-lg-start gap-3">
                                    <button>Enroll Now</button>
                                    <button>Talk to Counsellors</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}