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

    const recruiters1 = [
        "accenture.png",
        "tech-mahindra.png",
        "wipro.png",
        "tcs.png",
        "ibm.png",
        "infosys.png",
    ];

    const testimonials = [
        {
            img: `/images/live-course/ui-ux/testimonial/person-1.png`,
            text: "I was confused about UI and UX before joining this course. The way concepts were explained with real examples made everything clear. I now understand user flow, wireframes, and design decisions — not just tools."
        },
        {
            img: `/images/live-course/ui-ux/testimonial/person-2.png`,
            text: "I was confused about UI and UX before joining this course. The way concepts were explained with real examples made everything clear. I now understand user flow, wireframes, and design decisions — not just tools."
        },
        {
            img: `/images/live-course/ui-ux/testimonial/person-3.png`,
            text: "I was confused about UI and UX before joining this course. The way concepts were explained with real examples made everything clear. I now understand user flow, wireframes, and design decisions — not just tools."
        },
        {
            img: `/images/live-course/ui-ux/testimonial/person-4.png`,
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
                                        <h1 className="h1">UI UX Design</h1>
                                        <span className="box_parent">
                                            <span className="small_box box-1"></span>
                                            <span className="small_box box-2"></span>
                                            <span className="small_box box-3"></span>
                                            <span className="small_box box-4"></span>
                                            Course Online
                                        </span>
                                        <h2 className="h1">
                                            {" "}
                                            with Live Training and AI Integration
                                        </h2>
                                    </div>
                                </div>
                                <div className="lg-heading">
                                    <div className="d-flex flex-wrap">
                                        <div className="h1">
                                            UI UX Design
                                            <span className="box_parent mx-lg-3 mx-0">
                                                <span className="small_box box-1"></span>
                                                <span className="small_box box-2"></span>
                                                <span className="small_box box-3"></span>
                                                <span className="small_box box-4"></span>
                                                Course Online
                                            </span>
                                            with Live Training and AI Integration
                                        </div>
                                    </div>
                                </div>
                                <p className="uiux-desc small">
                                    Launch your design career with the Best UI UX course with AI online, built for beginners and career switchers. Learn UI UX design skills, AI design tools, and Figma through live trainer-led classes, with full placement support.
                                </p>

                                <div className="d-flex gap-2">
                                    <button
                                        className="uiux-btn"
                                        onClick={handleCourseAction}
                                    >
                                        {isEnrolled
                                            ? "Start Course"
                                            : "Enroll Now"}
                                    </button>
                                    <button className="book_but">Book a free Demo Class</button>
                                </div>
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
                            <div className="col-lg-7 mt-4">
                                <Image
                                    src={`/images/live-course/ui-ux/ux.png`}
                                    className="w-100 h-auto"
                                    height={300}
                                    width={800}
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
                            <div className="row text-center justify-content-lg-evenly justify-content-center m-auto modules_sec py-3 bg-black justify-content-">
                                <div className="col-6 col-lg-2 banner_details_list d-flex justify-content-center">
                                    <div className="my-lg-0 my-2 d-flex justify-content-center align-items-center flex-column">
                                        <p className="mb-1 text-center">
                                            Weeks
                                        </p>
                                        <p className="fw-bold mb-0 text-center">
                                            12
                                        </p>
                                    </div>
                                </div>
                                <div className="col-6 col-lg-2 banner_details_list d-flex justify-content-center">
                                    <div className="my-lg-0 my-2 d-flex justify-content-center align-items-center flex-column">
                                        <p className="mb-1 text-center">
                                            Total Hours
                                        </p>
                                        <p className="fw-bold mb-0 text-center">
                                            120 hrs
                                        </p>
                                    </div>
                                </div>
                                <div className="col-6 col-lg-2 banner_details_list d-flex justify-content-center">
                                    <div className="my-lg-0 my-2 d-flex justify-content-center align-items-center flex-column">
                                        <p className="mb-1 text-center">
                                            Taught In
                                        </p>
                                        <p className="fw-bold mb-0 text-center">
                                            தமிழ்
                                        </p>
                                    </div>
                                </div>
                                <div className="col-6 col-lg-2 banner_details_list d-flex justify-content-center">
                                    <div className="my-lg-0 my-2 d-flex justify-content-center align-items-center flex-column">
                                        <p className="mb-1 text-center">
                                            1:1
                                        </p>
                                        <p className="fw-bold mb-0 text-center">
                                            Doubt Sessions
                                        </p>
                                    </div>
                                </div>
                                <div className="col-6 col-lg-2 banner_details_list d-flex justify-content-center">
                                    <div className="my-lg-0 my-2 d-flex justify-content-center align-items-center flex-column">
                                        <p className="mb-1 text-center">
                                            Placement
                                        </p>
                                        <p className="fw-bold mb-0 text-center">
                                            Support
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="batch_details">
                                <p className="text-center text-white mb-0">Next batch starts 15 June 2026 Only 5 seats remaining</p>
                            </div>
                        </div>
                        <div className="col-12 pt-5 uiux__why">
                            <div className="row w-100 justify-content-center m-auto">
                                <div className="col-lg-11 px-0">
                                    <h2 className="fw-bold text-center">
                                        Why a UI UX Course Is a Smart Career Move in 2026
                                    </h2>
                                    <p className="text-center text-white mb-0 lh-lg mt-3">
                                        UI UX design has become one of the most rewarding tech careers, blending creativity with technology and business impact. Every digital product, from apps to AI tools, needs designers who can shape meaningful user experiences. Learners across Tamil Nadu can join our live online program, the best UI UX design course online for anyone ready to build a future-proof career in this fast-growing field.
                                    </p>
                                </div>
                            </div>
                            <div className="why-wrapper">
                                {/* CARDS */}
                                <div className="why-cards justify-content-center">
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card red text-center">
                                            Creative career with <br />{" "}
                                            practical skills
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card yellow text-center">
                                            Build user-friendly <br />{" "}
                                            designs using AI tools
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card green text-center">
                                            Aligns user needs with <br />{" "}
                                            business goals
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card cyan text-center">
                                            Beginner-friendly path into
                                            <br />
                                            tech
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card blue text-center">
                                            AI-powered tools <br />{" "}
                                            simplify design work
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="why-card purple text-center">
                                            Hired across every digital
                                            <br />
                                            industry
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* RIGHT FORM */}
                    </div>
                </div>
            </section>

            <section className="tools_sec launch_sec">
                <div className="section_container">
                    <div className="row justify-content-center mb-4 overview_content_uiux">
                        <div className="col-lg-12">
                            <div className="course-overview">
                                <h3 className="fw-bold">
                                    UI UX Design Skills and  <span>Tools You'll Master</span>
                                </h3>
                                <div className="col-12 position-relative text-center rocket-wrapper">
                                    {/* LEFT ITEMS */}
                                    <div className="ui-item left top">
                                        Think like a <br /> designer
                                    </div>

                                    <div className="ui-item left middle">
                                        Sketch and build app <br /> screens
                                    </div>

                                    <div className="ui-item left bottom">
                                        Understand what  <br /> users really need
                                    </div>

                                    {/* ROCKET */}
                                    <Image
                                        src={`/images/live-course/ui-ux/rocket-2.png`}
                                        alt="Rocket"
                                        className="rocket-img"
                                        width={1260}
                                        height={630}
                                    />

                                    {/* RIGHT ITEMS */}
                                    <div className="ui-item right top">
                                        Build reusable design <br /> components
                                    </div>

                                    <div className="ui-item right middle">
                                        Speed up design work <br /> with AI
                                    </div>

                                    <div className="ui-item right bottom">
                                        Test designs with real <br /> users
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="bg-white tools_sec_uiux">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">

                            <Image
                                src={`/images/live-course/ui-ux/tools.svg`}
                                className="w-100 h-auto"
                                style={{ marginTop: '-200px' }}
                                alt=""
                                width={840}
                                height={410}
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className="modules-section pt-0 bg-white">
                <div className="section_container pt-0 pb-5">
                    <h3 className="text-black text-center fw-bold px-3 lh-sm">
                        Explore the Curriculum of Our UI UX Classes Online
                    </h3>
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <p className="text-black text-center px-lg-5">
                                Our UI UX online course for beginners takes you step by step from design thinking foundations to advanced prototyping, design systems, and a final capstone project. Each module includes practical assignments and industry case studies, with AI integration across the journey to prepare you for modern designer roles.
                            </p>
                        </div>
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
            </section>
            <section className="bottom_parent">
                <div className="best_course_parent pt-3">
                    <div className="section_container">
                        <h3 className="fw-bold text-center text-white">
                            <span className="text-c2">Best AI</span>{" "}
                            Courses For{" "}
                            <span className="text-c2">Best AI  UI And UX</span>{" "}
                            Designers
                        </h3>
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="row">
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI Design Thinking</p>
                                            <p className="mb-0 small">
                                                Use ChatGPT as a UX design partner and Figma AI to speed up the design process, ideation, and design foundations.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI Wireframing</p>
                                            <p className="mb-0 small">
                                                Create wireframes from text prompts using Uizard, Galileo AI, and Visily to speed up the UI design process for modern UI UX designers.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI Prototyping</p>
                                            <p className="mb-0 small">
                                                Master prototyping in Figma with Framer AI, Rive AI animations, and AI-powered interactions to design faster and at scale.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI User Research</p>
                                            <p className="mb-0 small">
                                                Apply AI tools to user research, synthesize interviews, and build user personas with ChatGPT and Dovetail AI, modern research methods for UX designers.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI Design Systems</p>
                                            <p className="mb-0 small">
                                                Build scalable design systems with AI, generate tokens and component variants using Figma AI and ChatGPT for consistent UI design.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI Moodboards & Assets</p>
                                            <p className="mb-0 small">
                                                Create user interface moodboards with Midjourney and generate generative AI design assets using Adobe Firefly.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI Sitemaps & Flows</p>
                                            <p className="mb-0 small">
                                                Build user flows and sitemaps faster with ChatGPT and Whimsical AI for cleaner information architecture and user experience.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 my-3">
                                        <div className="adv_child">
                                            <p className="fw-bold">AI Usability Testing</p>
                                            <p className="mb-0 small">
                                                Run AI-powered usability testing and analyze real-world user behavior with Attention Insight and Maze AI.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 d-flex justify-content-center">
                                    <button className="mt-4">View All</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="salary_insight pt-4">
                    <div className="section_container">
                        <div className="row justify-content-center">
                            <div className="col-lg-7">
                                <h3 className="fw-bold text-center text-white">High-Paying Roles and Salary from Online UI UX Design Classes </h3>
                            </div>
                        </div>
                    </div>
                    <div className="scale_uiux_chart">
                        <div className="section_container px-0">
                            <div className="scale_chart_parent">
                                <div className="chart-wrapper image-chart">
                                    {/* BASE IMAGE */}
                                    <Image
                                        src={`/images/live-course/ui-ux/skills.svg`}
                                        alt="UI UX Salary Growth"
                                        className="chart-base-img w-100 h-auto"
                                        width={1000}
                                        height={400}
                                    />

                                    {/* OVERLAY */}
                                    <div className="chart-overlay">
                                        {/* salary pills */}
                                        <div className="salary-pill pill-1">
                                            <p className="fw-bold mb-1">Junior UI UX Designer </p>
                                            <p className="fw-bold mb-1">₹3 – 6 LPA </p>
                                            <p className="mb-0">Launch your career at startups after our online UI UX design classes, with strong hiring demand across the industry.</p>
                                        </div>
                                        <div className="salary-pill pill-2">
                                            <p className="fw-bold mb-1">Mid-Level UI UX Designer</p>
                                            <p className="fw-bold mb-1">₹6 – 12 LPA</p>
                                            <p className="mb-0">Design real-world digital products for growing companies where portfolio strength drives salary growth.</p>
                                        </div>
                                        <div className="salary-pill pill-3">
                                            <p className="fw-bold mb-1">Senior UI UX Designer</p>
                                            <p className="fw-bold mb-1">₹12 – 25 LPA</p>
                                            <p className="mb-0">Lead design projects across the digital industry, working on high-impact products at top product companies.</p>
                                        </div>
                                    </div>

                                    {/* labels */}
                                    <div className="chart-labels">
                                        <p>Junior UI/UX <br /> Designer</p>
                                        <p>Mid-Level UI/UX <br /> Designer</p>
                                        <p>Senior / Lead UI/UX <br /> Designer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="from_start_sec ui_ux_journey pt-0">
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-lg-7">
                                        <h3 className="text-white text-center fw-bold px-3 lh-sm">
                                            Career Path with Velearn's Best UI UX Design Course Online
                                        </h3>
                                    </div>
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
                                            src={`/images/live-course/ui-ux/journey/rocket.png`}
                                            className="rocket_img h-auto"
                                            width={120}
                                            height={120}
                                            alt=""
                                        />
                                    </div>
                                    <div className="journey_item item_1">
                                        <div className="parent">
                                            <Image
                                                src={`/images/live-course/ui-ux/journey/step-1.png`}
                                                height={110}
                                                width={110}
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
                                            <Image
                                                src={`/images/live-course/ui-ux/journey/step-2.png`}
                                                height={110}
                                                width={110}
                                                alt=""
                                            />
                                        </div>
                                    </div>

                                    <div className="journey_item item_3">
                                        <div className="parent">
                                            <Image
                                                src={`/images/live-course/ui-ux/journey/step-3.png`}
                                                height={110}
                                                width={110}
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
                                            <Image
                                                src={`/images/live-course/ui-ux/journey/step-4.png`}
                                                height={110}
                                                width={110}
                                                alt=""
                                            />
                                        </div>
                                    </div>

                                    <div className="journey_item item_5">
                                        <div className="parent">
                                            <Image
                                                src={`/images/live-course/ui-ux/journey/step-5.png`}
                                                height={110}
                                                width={110}
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

                        <div className="section_container pt-4 mb-5">
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-lg-10">
                                    <h3 className="text-white text-center fw-bold px-3 lh-sm mb-5">
                                        UI UX Live Course With Real Time Projects
                                    </h3>
                                    <Swiper
                                        loop={true}
                                        pagination={{ clickable: true }}
                                        centeredSlides={true}
                                        slidesPerView={3}
                                        modules={[Autoplay, Navigation]}
                                        navigation={true}
                                        autoplay={{
                                            delay: 2000,
                                            disableOnInteraction: false,
                                        }}
                                        breakpoints={{
                                            0: { slidesPerView: 1 },
                                            576: { slidesPerView: 1 },
                                            768: { slidesPerView: 1 },
                                            991: { slidesPerView: 2 },
                                            1024: { slidesPerView: 3 },
                                            1200: { slidesPerView: 3 },
                                        }}
                                    >
                                        <SwiperSlide className="d-flex justify-content-center">
                                            <Image src={"/images/live-course/ui-ux/mobile-screen-1.svg"}
                                                className="w-100 h-auto"
                                                height={500}
                                                width={500}
                                                alt="" />
                                        </SwiperSlide>
                                        <SwiperSlide className="d-flex justify-content-center">
                                            <Image src={"/images/live-course/ui-ux/mobile-screen-2.svg"}
                                                className="w-100 h-auto"
                                                height={500}
                                                width={500}
                                                alt="" />
                                        </SwiperSlide>
                                        <SwiperSlide className="d-flex justify-content-center">
                                            <Image src={"/images/live-course/ui-ux/mobile-screen-3.svg"}
                                                className="w-100 h-auto"
                                                height={500}
                                                width={500}
                                                alt="" />
                                        </SwiperSlide>
                                        <SwiperSlide className="d-flex justify-content-center">
                                            <Image src={"/images/live-course/ui-ux/mobile-screen-1.svg"}
                                                className="w-100 h-auto"
                                                height={500}
                                                width={500}
                                                alt="" />
                                        </SwiperSlide>
                                        <SwiperSlide className="d-flex justify-content-center">
                                            <Image src={"/images/live-course/ui-ux/mobile-screen-2.svg"}
                                                className="w-100 h-auto"
                                                height={500}
                                                width={500}
                                                alt="" />
                                        </SwiperSlide>
                                        <SwiperSlide className="d-flex justify-content-center">
                                            <Image src={"/images/live-course/ui-ux/mobile-screen-3.svg"}
                                                className="w-100 h-auto"
                                                height={500}
                                                width={500}
                                                alt="" />
                                        </SwiperSlide>
                                    </Swiper>

                                    <div className="row w-100 m-auto justify-content-center">
                                        <div className="col-lg-8 mt-3">
                                            <div className="row">
                                                <div className="col-lg-5">
                                                    <p className="mb-0 text-white w-100 small text-center">Where Ideas Become Interfaces</p>
                                                </div>
                                                <div className="col-lg-7">
                                                    <Image src="/images/live-course/ui-ux/peoples.png" className="w-100 h-auto" height={100} width={400} alt="" />
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
            <section className="section_container">
                <div className="demand_stack_uiux">
                    <div className="demand_inner d-flex align-items-center justify-content-center">
                        <div className="col-lg-10">
                            <div className="row">
                                <div className="col-lg-6 d-flex align-items-center">
                                    <div>
                                        <h3 className="text-white fw-bold pt-5 pt-lg-0 px-lg-0 px-3">
                                            UI UX Design Course  <br />
                                            <span className="text-white">
                                                Online With Placement Support
                                            </span>
                                        </h3>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div
                                        className="stack text-center"
                                        ref={stackRef}
                                        onClick={handleStackClick}
                                    >
                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-one">
                                                <p>
                                                    Hiring Partner Network
                                                </p>
                                                <p className="small">Connect with UI UX hiring companies through our placement partner network to land your first UI UX designer role.</p>
                                            </div>
                                        </div>

                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-two">
                                                <p>
                                                    Resume & LinkedIn Polish
                                                </p>
                                                <p className="small">Get recruiter-ready with personalized resume and LinkedIn reviews from our placement assistance team.</p>
                                            </div>
                                        </div>

                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-three">
                                                <p>
                                                    Mock UX Interviews
                                                </p>
                                                <p className="small">Practice real interview questions with personalized feedback from industry mentors for UI UX designer interviews.</p>
                                            </div>
                                        </div>

                                        <div className="demand_card">
                                            <div className="uiux-glass-card uiux-glass-card-four">
                                                <p>
                                                    Career-Ready Portfolio
                                                </p>
                                                <p className="small">Build your UI UX portfolio in UXFolio or Behance with mentor-reviewed case studies from our UI UX design course online.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="end_parent">
                {/* Prime Recruiters - Start */}
                <div>
                    <div className="pb-2">
                        <div className="section_container p-xl text-center mt-lg-3 logo_swiper">
                            <h3 className="section_base_heading text-center">
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
                    </div>
                </div>
                {/* Prime Recruiters - End */}

                <div className="testimonial_bg pb-lg-0 pb-5">
                    <div className="d-flex uiux_testimonial py-5">
                        <div className="row justify-content-center w-100 m-auto">
                            <div className="col-lg-6">
                                <div className="row justify-content-center">
                                    <div className="col-lg-10">
                                        <h3 className="fw-bold text-center text-white px-4">
                                            Reviews From Our
                                            <span className="text-c2">
                                                {" "}
                                                UI UX Online Course  {" "}
                                            </span>
                                            Students
                                        </h3>
                                    </div>
                                </div>
                                <div className="cards-box" onClick={rotateCards}>
                                    {cardOrder.map((cardIndex, position) => (
                                        <div
                                            key={cardIndex}
                                            className="card"
                                            data-slide={position}
                                        >
                                            <div className="d-flex gap-4 align-items-center">
                                                <Image
                                                    src={testimonials[cardIndex].img}
                                                    height={100}
                                                    width={100}
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
                                    <div className="col-lg-6">
                                        <h3 className="text-white text-center fw-bold px-5 lh-sm">
                                            Earn Your UI UX Online Course With Certificate
                                        </h3>
                                    </div>
                                </div>
                                <div className="row justify-content-center w-100 m-auto">
                                    <div className="col-lg-9 mt-4">
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
                    </div>
                </div>
                <div className="py-5">
                    <div className="section_container">
                        <div className="row justify-content-center">
                            <div className="col-lg-7">
                                <h3 className="fw-bold text-center text-black">
                                    Pick Your
                                    <span className="text-c2">{" "}UI UX Live Course Batch</span>{" "}
                                    That Fits Your Scheduler
                                </h3>
                            </div>
                            <div className="col-lg-10 mt-4">
                                <div className="row justify-content-evenly">
                                    <div className="col-lg-4 my-3">
                                        <div className="uiux_batch_inner">
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
                                        <div className="uiux_batch_inner">
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
                                        <div className="uiux_batch_inner">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-4 pb-5 uiux_pricing_plan">
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
                </div>
                <div className="faq_section pt-2 pb-5">
                    <div className="section_container p-xl text-center mt-lg-5">
                        <h3 className="section_base_heading">
                            Frequently Asked{" "}
                            <span className="text-c2"> Questions</span>
                        </h3>

                        <div className="row mt-5 justify-content-center align-items-center">
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
            </section>
            <section className="uiux_cta position-relative">
                <Image src={"/images/live-course/ui-ux/uiux-cta-person.svg"} className="uiux_cta_person" width={3000} height={500} alt="" />
                <Image src={"/images/live-course/ui-ux/cta-bg.svg"} className="uiux_cta_lg w-100 h-auto" style={{ objectFit: 'cover' }} width={3000} height={500} alt="" />
                <div className="section_container">
                    <div className="row justify-content-center align-items-center w-100 m-auto">
                        <div className="uiux_cta_inner mt-lg-5">
                            <h3 className="fw-bold text-white text-lg-start text-center">Join Our UI UX Online Course Today </h3>
                            <p className="small lh-lg text-white text-lg-start text-center">Take the next step in your UI UX career. Join our UI UX design course online and learn live with industry mentors, real projects, and AI integration, all in one program.</p>
                            <div className="col-12 d-flex justify-content-center justify-content-lg-start gap-3">
                                <button>Enroll Now</button>
                                <button>Talk to Counsellors</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}