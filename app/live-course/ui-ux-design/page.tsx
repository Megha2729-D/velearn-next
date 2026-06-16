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

const BASE_API_URL = "https://velearn.in/velearn-crm/api/";
const BASE_IMAGE_URL = "https://velearn.in/assets/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://velearn.in/velearn-crm/public/uploads/";

export default function UIUX() {
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


    /* Stack click */
    const stackRef = useRef<HTMLDivElement | null>(null);

    const swapTopCard = () => {
        const stack = stackRef.current;

        if (!stack) return;

        const card = stack.lastElementChild as HTMLElement;

        if (!card) return;

        card.classList.add("swap");

        setTimeout(() => {
            card.classList.remove("swap");

            stack.insertBefore(
                card,
                stack.firstElementChild
            );
        }, 1200);
    };

    const handleStackClick = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        const stack = stackRef.current;

        if (!stack) return;

        const card = (e.target as HTMLElement).closest(
            ".demand_card"
        );

        if (card && card === stack.lastElementChild) {
            swapTopCard();
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            swapTopCard();
        }, 4000); // auto swap every 4 sec

        return () => clearInterval(interval);
    }, []);

    const rotateCards = () => {
        setCardOrder((prev) => {
            const updated = [...prev];
            const last = updated.pop();

            if (last !== undefined) {
                updated.unshift(last);
            }

            return updated;
        });
    };

    // autoplay
    useEffect(() => {
        const interval = setInterval(() => {
            rotateCards();
        }, 4000);

        return () => clearInterval(interval);
    }, []);
    const testimonials = [
        {
            img: `${BASE_IMAGE_URL}live-course/ui-ux/testimonial/person-1.png`,
            text: "I was confused about UI and UX before joining this course. The way concepts were explained with real examples made everything clear. I now understand user flow, wireframes, and design decisions — not just tools."
        },
        {
            img: `${BASE_IMAGE_URL}live-course/ui-ux/testimonial/person-2.png`,
            text: "I was confused about UI and UX before joining this course. The way concepts were explained with real examples made everything clear. I now understand user flow, wireframes, and design decisions — not just tools."
        },
        {
            img: `${BASE_IMAGE_URL}live-course/ui-ux/testimonial/person-3.png`,
            text: "I was confused about UI and UX before joining this course. The way concepts were explained with real examples made everything clear. I now understand user flow, wireframes, and design decisions — not just tools."
        },
        {
            img: `${BASE_IMAGE_URL}live-course/ui-ux/testimonial/person-4.png`,
            text: "I was confused about UI and UX before joining this course. The way concepts were explained with real examples made everything clear. I now understand user flow, wireframes, and design decisions — not just tools."
        }
    ];

    const faqData = [
        {
            question: "Who should enroll in this UI/UX Design course?",
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
            question: "Will I get hands-on experience during the course?",
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
                "What career support do you offer after the UI/UX course?",
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
                "Is this UI/UX course suitable for non-design backgrounds?",
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
    ];

    const toggleFaq = (index: number) => {
        setActiveFaqIndex((prev) =>
            prev === index ? null : index
        );
    };

    return (
        <>
            {/* HERO SECTION */}
            <section className="uiux-hero">
                <div className="section_container">
                    <div className="row w-100  m-auto">
                        <div className="col-lg-8">
                            <div className="uiux-left">
                                <div className="small-heading">
                                    <div className="d-flex flex-wrap">
                                        <h1 className="h1">Professional</h1>
                                        <span className="box_parent">
                                            <span className="small_box box-1"></span>
                                            <span className="small_box box-2"></span>
                                            <span className="small_box box-3"></span>
                                            <span className="small_box box-4"></span>
                                            UI/UX Design
                                        </span>
                                        <h2 className="h1">
                                            {" "}
                                            Program with Live Mentorship
                                        </h2>
                                    </div>
                                </div>
                                <div className="lg-heading">
                                    <div className="d-flex flex-wrap">
                                        <div className="h1">
                                            Professional
                                            <span className="box_parent mx-lg-3 mx-0">
                                                <span className="small_box box-1"></span>
                                                <span className="small_box box-2"></span>
                                                <span className="small_box box-3"></span>
                                                <span className="small_box box-4"></span>
                                                UI/UX Design
                                            </span>
                                            Program with Live Mentorship
                                        </div>
                                    </div>
                                </div>
                                <p className="uiux-desc">
                                    Learn UI/UX design through live classes,
                                    hands-on projects, and expert
                                    mentorship. Master user research, UX
                                    strategy, and modern UI design to become
                                    job-ready with a strong portfolio.
                                </p>

                                <button
                                    className="uiux-btn"
                                    onClick={handleCourseAction}
                                >
                                    {isEnrolled
                                        ? "Start Course"
                                        : "Enroll Now"}
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-4 d-flex justify-content-lg-end justify-content-center">
                            <div className="uiux-right mt-5 mt-lg-0">
                                <form className="uiux-form" onSubmit={handleEnroll}>
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
                            </div>
                        </div>

                        {/* LEFT CONTENT */}

                        <div className="col-12 d-flex justify-content-center banner_center_piece">
                            <div className="col-lg-7 mt-4 mt-lg-0">
                                <img
                                    src={`${BASE_IMAGE_URL}live-course/ui-ux/ux.png`}
                                    className="w-100"
                                    alt=""
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <p className="my-4">
                                <span>Home</span>
                                <span className="px-2">/</span>{" "}
                                <span>Live courses</span>
                                <span className="px-2">/</span>
                                <span>UI UX</span>
                            </p>
                        </div>
                        <div className="col-12">
                            <div className="row w-100 m-auto modules_sec py-3 bg-black">
                                <div className="col-lg-3 col-6 my-3 my-lg-0">
                                    <p className="fw-bold mb-1 text-center">
                                        Expert
                                    </p>
                                    <p className="mb-0 text-center">
                                        Mentorship
                                    </p>
                                </div>
                                <div className="col-lg-3 col-6 my-3 my-lg-0">
                                    <p className="fw-bold mb-1 text-center">
                                        10+ Real Time
                                    </p>
                                    <p className="mb-0 text-center">
                                        Projects
                                    </p>
                                </div>
                                <div className="col-lg-3 col-6 my-3 my-lg-0">
                                    <p className="fw-bold mb-1 text-center">
                                        Placement
                                    </p>
                                    <p className="mb-0 text-center">
                                        Assistance
                                    </p>
                                </div>
                                <div className="col-lg-3 col-6 my-3 my-lg-0">
                                    <p className="fw-bold mb-1 text-center">
                                        Life Time
                                    </p>
                                    <p className="mb-0 text-center">
                                        Community Access
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 pt-5 uiux__why">
                            <h2 className="fw-bold text-center">
                                Why{" "}
                                <span className="text-c2">
                                    UI/UX Design
                                </span>{" "}
                                Is a Beginner-Friendly Career
                            </h2>
                            <div className="why-wrapper">
                                {/* CARDS */}
                                <div className="why-cards justify-content-center">
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card red">
                                            Creative career with <br />{" "}
                                            practical skills
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card yellow">
                                            Make apps and websites <br />{" "}
                                            user-friendly
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card green">
                                            Aligns user needs with <br />{" "}
                                            business goals
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card cyan">
                                            Design-focused learning
                                            <br />
                                            approach
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card blue">
                                            Enhances customer <br />{" "}
                                            satisfaction
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card purple">
                                            In-demand UI/UX skills
                                            <br />
                                            across industries
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* RIGHT FORM */}
                    </div>
                </div>
            </section>

            <section className="tools_sec">
                <div className="section_container">
                    <div className="row justify-content-center mb-4 overview_content_uiux">
                        <div className="col-lg-10">
                            <div className="course-overview">
                                <h3 className="fw-bold">
                                    Course <span>Overview</span>
                                </h3>
                                <p>
                                    Our UI/UX Design course is a live,
                                    industry-focused training program
                                    designed to help students understand
                                    user experience principles, interface
                                    design, usability, and design thinking
                                    in a structured and practical way. This
                                    course focuses on creating user-centered
                                    digital experiences through research,
                                    wireframing, prototyping, and visual
                                    design using modern tools and
                                    methodologies. Learners work on
                                    real-world design projects, ensuring
                                    they develop the practical skills and
                                    design mindset companies seek when
                                    hiring UI/UX designers.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row launch_sec">
                        <h3 className="fw-bold text-center">
                            Launch your iT Career As a{" "}
                            <span className="text-c2">
                                UI - UX Designer
                            </span>
                        </h3>
                        <div className="col-12 position-relative text-center rocket-wrapper">
                            {/* LEFT ITEMS */}
                            <div className="ui-item left top">
                                User Research <br /> & Analysis
                            </div>

                            <div className="ui-item left middle">
                                UX flows
                            </div>

                            <div className="ui-item left bottom">
                                Real-world <br /> design projects
                            </div>

                            {/* ROCKET */}
                            <img
                                src={`${BASE_IMAGE_URL}live-course/ui-ux/rocket-2.png`}
                                alt="Rocket"
                                className="rocket-img"
                            />

                            {/* RIGHT ITEMS */}
                            <div className="ui-item right top">
                                Usability Testing
                            </div>

                            <div className="ui-item right middle">
                                UI Design Principles
                            </div>

                            <div className="ui-item right bottom">
                                Wireframe And <br /> Prototyping
                            </div>

                            {/* BUTTON */}
                            <div>
                                <button
                                    className="get_start_butt"
                                    onClick={handleCourseAction}
                                >
                                    {isEnrolled
                                        ? "Start Course"
                                        : "Get Started"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="bg-white tools_sec_uiux">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h3 className="fw-bold text-center">
                                Industry-Standard UI/UX Tools{" "}
                                <span className="text-c2">
                                    You’ll Master
                                </span>
                            </h3>
                            <img
                                src={`${BASE_IMAGE_URL}live-course/ui-ux/tools.png`}
                                className="w-100"
                                alt=""
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className="modules-section pt-0 pb-4 bg-white">
                <div className="section_container pt-0 pb-5">
                    <h3 className="text-black text-center fw-bold px-3 lh-sm">
                        A Structured Path to Master{" "}
                        <span className="text-c2"> UI UX</span>
                    </h3>
                    <div className="row justify-content-center">
                        <div className="col-lg-5">
                            <p className="text-black text-center px-lg-5">
                                Each module at Velearn focuses on practical
                                skills to prepare you for real jobs.
                            </p>
                        </div>
                    </div>
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
                            <div className="col-12 d-flex justify-content-end">
                                <div className="download_icon">
                                    <i className="bi bi-download text-white"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="uiux_whylearn">
                <div className="section_container py-5">
                    <h3 className="fw-bold text-center">
                        Why <span className="text-c2">Velearn’s UI/UX</span>{" "}
                        Approach Stands Out
                    </h3>
                    <div className="col-12 py-5 d-flex justify-content-center">
                        <span className="bg-c1 text-white px-4 py-2 rounded-4">
                            Start Your UI/UX Journey
                        </span>
                    </div>
                    <div className="col-12">
                        <div className="why_points_uiux">
                            <div>
                                <p className="fw-bold">
                                    Design Like a Real Product Designer
                                </p>
                                <p>
                                    Learn how users think, not just how
                                    screens look. We focus on UX logic, user
                                    flow, and problem-solving before
                                    visuals.
                                </p>
                            </div>
                            <div>
                                <p className="fw-bold">
                                    Strong UX Foundations
                                </p>
                                <p>
                                    Understand user psychology and usability
                                    principles to create intuitive,
                                    user-friendly designs.
                                </p>
                            </div>
                            <div>
                                <p className="fw-bold">
                                    Practice on Real Design Tasks
                                </p>
                                <p>
                                    Design apps and websites used in the
                                    real world — from wireframes to final UI
                                    and clickable prototypes.
                                </p>
                            </div>
                            <div>
                                <p className="fw-bold">
                                    Build a Portfolio That Wins
                                </p>
                                <p>
                                    By the end of the course, you’ll have a
                                    job-ready UI/UX portfolio, not just a
                                    completion certificate.
                                </p>
                            </div>
                            <div>
                                <p className="fw-bold">
                                    Learn the Complete UI/UX Journey
                                </p>
                                <p>
                                    From research and wireframing to
                                    prototyping and usability testing —
                                    master the full design process used by
                                    industry professionals.
                                </p>
                            </div>
                            <div>
                                <p className="fw-bold">
                                    We Help You Get Hired
                                </p>
                                <p>
                                    Resume, portfolio review, interview
                                    support — we help you move from learning
                                    to hiring.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section_container">
                <div className="demand_stack_uiux">
                    <div className="demand_inner d-flex align-items-center justify-content-center">
                        <div className="col-lg-10">
                            <div className="row">
                                <div className="col-lg-6 d-flex align-items-center">
                                    <div>
                                        <h3 className="text-black fw-bold pt-5 pt-lg-0 px-lg-0 px-3">
                                            The Rising Demand for <br />
                                            <span className="text-white">
                                                UI/UX Designers
                                            </span>
                                        </h3>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div
                                        className="stack"
                                        ref={stackRef}
                                        onClick={handleStackClick}
                                    >
                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-one">
                                                <p>
                                                    Every Digital Product
                                                    Needs Great Design.
                                                    <br />
                                                    <br />
                                                    From mobile apps to
                                                    websites, UI/UX
                                                    designers shape how
                                                    users feel, click, and
                                                    convert.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-two">
                                                <p>
                                                    High Demand. Real
                                                    Careers.
                                                    <br />
                                                    <br />
                                                    Startups, IT companies &
                                                    global brands actively
                                                    hire UI/UX designers
                                                </p>
                                            </div>
                                        </div>

                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-three">
                                                <p>
                                                    Design That Drives
                                                    Business
                                                    <br />
                                                    <br />
                                                    Companies pay higher
                                                    packages for designers
                                                    who solve real problems
                                                </p>
                                            </div>
                                        </div>

                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-four">
                                                <p>
                                                    Creative Skill + Tech
                                                    Growth
                                                    <br />
                                                    <br />
                                                    Perfect mix of
                                                    creativity and
                                                    technology
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="bg-black p-0 m-0">
                <div className="scale_uiux_chart pb-3">
                    <div className="section_container pb-5">
                        <div className="scale_chart_parent">
                            <h3 className="text-center text-white fw-bold pb-4">
                                <span className="text-c2"> Skills </span> in
                                Demand.
                                <span className="text-c2">
                                    {" "}
                                    Salaries{" "}
                                </span>{" "}
                                That Scale
                            </h3>
                            <div className="chart-wrapper image-chart mt-5">
                                {/* BASE IMAGE */}
                                <img
                                    src={`${BASE_IMAGE_URL}live-course/ui-ux/skills.png`}
                                    alt="UI UX Salary Growth"
                                    className="chart-base-img"
                                />

                                {/* OVERLAY */}
                                <div className="chart-overlay">
                                    {/* salary pills */}
                                    <div className="salary-pill pill-1">
                                        ₹3 – 5 LPA
                                    </div>
                                    <div className="salary-pill pill-2">
                                        ₹6 – 9 LPA
                                    </div>
                                    <div className="salary-pill pill-3">
                                        ₹10 – 15 LPA
                                    </div>
                                    <div className="salary-pill pill-4">
                                        ₹18 – 30+ LPA
                                    </div>
                                </div>

                                {/* labels */}
                                <div className="chart-labels">
                                    <p>Junior UI/UX Designer</p>
                                    <p>Mid-Level UI/UX Designer</p>
                                    <p>Senior / Lead UI/UX Designer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="from_start_sec pt-lg-5 pt-3 ui_ux_journey">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-7">
                                    <h3 className="text-white text-center fw-bold px-3 lh-sm">
                                        A Smart{" "}
                                        <span className="text-c2">
                                            {" "}
                                            Learning Journey{" "}
                                        </span>
                                        That Leads to{" "}
                                        <span className="text-c2">
                                            {" "}
                                            Real Careers
                                        </span>
                                    </h3>
                                </div>
                            </div>

                            <div className="journey_wrap position-relative">
                                <div className="journey_bg_icon"></div>
                                <div className="dotted_lines">
                                    <div className="position-relative d-flex justify-content-center">
                                        <img
                                            src={`${BASE_IMAGE_URL}live-course/ui-ux/journey/dotted-lines.png`}
                                            className="dotted-line-img"
                                            alt=""
                                        />
                                    </div>
                                </div>
                                <div className="rocket_wrap">
                                    <img
                                        src={`${BASE_IMAGE_URL}live-course/ui-ux/journey/rocket.png`}
                                        className="rocket_img"
                                        alt=""
                                    />
                                </div>
                                <div className="journey_item item_1">
                                    <div className="parent">
                                        <img
                                            src={`${BASE_IMAGE_URL}live-course/ui-ux/journey/step-1.png`}
                                            alt=""
                                        />
                                        <div>
                                            <h6>Free Career Discussion</h6>
                                            <p>
                                                Connect with experts to
                                                choose the right career and
                                                course.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="journey_item item_2">
                                    <div className="parent">
                                        <div>
                                            <h6>
                                                Live Trainer-Led Classes
                                            </h6>
                                            <p>
                                                Clear learning path from
                                                foundation to expertise.
                                            </p>
                                        </div>
                                        <img
                                            src={`${BASE_IMAGE_URL}live-course/ui-ux/journey/step-2.png`}
                                            alt=""
                                        />
                                    </div>
                                </div>

                                <div className="journey_item item_3">
                                    <div className="parent">
                                        <img
                                            src={`${BASE_IMAGE_URL}live-course/ui-ux/journey/step-3.png`}
                                            alt=""
                                        />
                                        <div>
                                            <h6>
                                                Hands-on Projects & Practice
                                            </h6>
                                            <p>
                                                Every topic includes
                                                assignments and real-world
                                                projects to build strong,
                                                job-ready skills.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="journey_item item_4">
                                    <div className="parent">
                                        <div>
                                            <h6>
                                                Resume & Portfolio Building
                                            </h6>
                                            <p>
                                                We shape your skills into
                                                resumes, portfolios, and
                                                interview success.
                                            </p>
                                        </div>
                                        <img
                                            src={`${BASE_IMAGE_URL}live-course/ui-ux/journey/step-4.png`}
                                            alt=""
                                        />
                                    </div>
                                </div>

                                <div className="journey_item item_5">
                                    <div className="parent">
                                        <img
                                            src={`${BASE_IMAGE_URL}live-course/ui-ux/journey/step-5.png`}
                                            alt=""
                                        />
                                        <div>
                                            <h6>
                                                End-to-End Placement Support
                                            </h6>
                                            <p>
                                                Train with mock interviews
                                                and learn to answer with
                                                confidence. Career support
                                                that stays until you get
                                                hired.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex uiux_testimonial">
                        <div className="row justify-content-center w-100 m-auto">
                            <div className="col-lg-6">
                                <h3 className="fw-bold text-center text-white px-4">
                                    From Students Who Learned
                                    <span className="text-c2">
                                        {" "}
                                        UI/UX the Right Way
                                    </span>
                                </h3>
                                <div className="cards-box" onClick={rotateCards}>
                                    {cardOrder.map((cardIndex, position) => (
                                        <div
                                            key={cardIndex}
                                            className="card"
                                            data-slide={position}
                                        >
                                            <div className="d-flex gap-4 align-items-center">
                                                <img
                                                    src={testimonials[cardIndex].img}
                                                    alt=""
                                                />

                                                <p>
                                                    {testimonials[cardIndex].text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <div className="col-lg-12 d-flex justify-content-center">
                            <div>
                                <div className="d-flex justify-content-center">
                                    <div className="col-lg-7">
                                        <h3 className="text-white text-center fw-bold px-5 lh-sm">
                                            A{" "}
                                            <span className="text-c2">
                                                Certification
                                            </span>{" "}
                                            That Reflects What You Can Do
                                        </h3>
                                    </div>
                                </div>
                                <div className="row justify-content-center w-100 m-auto">
                                    <div className="col-lg-10 mt-4">
                                        <div className="row">
                                            <div className="col-lg-6 d-flex flex-column justify-content-center">
                                                <div className="mb-4">
                                                    <h5 className="text-white fw-bold mb-3">
                                                        Design
                                                        Skill–Verified
                                                        Certification
                                                    </h5>
                                                    <p className="text-white mb-4">
                                                        This certification
                                                        validates your UI
                                                        thinking, user
                                                        research,
                                                        wireframing, and
                                                        visual design skills
                                                        — proven through
                                                        real design tasks
                                                        and projects.
                                                    </p>
                                                </div>
                                                <div className="mb-4">
                                                    <h5 className="text-white fw-bold mb-3">
                                                        Globally Relevant
                                                        Design Credential
                                                    </h5>
                                                    <p className="text-white mb-4">
                                                        Showcase your UI/UX
                                                        expertise with a
                                                        certificate aligned
                                                        to modern design
                                                        standards, valued by
                                                        startups and product
                                                        teams worldwide.
                                                    </p>
                                                </div>
                                                <div className="mb-4">
                                                    <h5 className="text-white fw-bold mb-3">
                                                        Portfolio & Career
                                                        Booster
                                                    </h5>
                                                    <p className="text-white mb-4">
                                                        More than a
                                                        certificate — this
                                                        strengthens your
                                                        portfolio, resume,
                                                        and interviews,
                                                        helping you stand
                                                        out as a job-ready
                                                        UI/UX designer.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 d-flex align-items-center justify-content-center p-lg-5">
                                                <div className=" d-flex align-items-center justify-content-center">
                                                    <div className="col-lg-10">
                                                        <img
                                                            src={`${BASE_IMAGE_URL}details-page/certificate.jpg`}
                                                            className="w-100 rounded-5"
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
                    </div>
                </div>
            </section>
            <section className="pt-4 pb-5 uiux_pricing_plan">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <div className="pricing_card">
                                <h3 className="fw-bold">
                                    <span className="text-c2">
                                        UI/UX Design
                                    </span>{" "}
                                    specific version
                                </h3>
                                <h4 className="my-3">
                                    Velearn Career Access Plan
                                </h4>
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
            </section>
            <section className="faq_section pt-2 pb-5 bg-white">
                <div className="section_container p-xl text-center mt-lg-5">
                    <h3 className="section_base_heading">
                        Frequently Asked{" "}
                        <span className="text-c2"> Questions</span>
                    </h3>

                    <div className="row mt-5 justify-content-center align-items-center">
                        {/* FAQ Accordion */}
                        <div className="col-lg-9 text-start">
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
                                                <img
                                                    src={`${BASE_IMAGE_URL}icons/faq-icon.png`}
                                                    alt="toggle"
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
            </section>
        </>
    );
}