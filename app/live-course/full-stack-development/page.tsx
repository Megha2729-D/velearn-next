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

export default function FullStackDevelopment() {
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

    const skills = [
        {
            title: "Deployment & Hosting",
            icon: `${BASE_IMAGE_URL}details-page/skills/hosting.png`,
        },
        {
            title: "Database Management",
            icon: `${BASE_IMAGE_URL}details-page/skills/database.png`,
        },
        {
            title: "Front-End Development",
            icon: `${BASE_IMAGE_URL}details-page/skills/front-end.png`,
        },
        {
            title: "Back-End Development",
            icon: `${BASE_IMAGE_URL}details-page/skills/backend.png`,
        },
        {
            title: "Full Stack Project Building",
            icon: `${BASE_IMAGE_URL}details-page/skills/project-building.png`,
        },
    ];
    const repeatedSkills = [...skills, ...skills, ...skills]; // repeat for loop


    const tools = [
        {
            name: "React",
            logo: `${BASE_IMAGE_URL}details-page/tools/react.png`,
            shadow: "#61DAFB",
        },
        {
            name: "CSS",
            logo: `${BASE_IMAGE_URL}details-page/tools/css.png`,
            shadow: "#2965F1",
        },
        {
            name: "Express JS",
            logo: `${BASE_IMAGE_URL}details-page/tools/express-js.png`,
            shadow: "#F3DF1D",
        },
        {
            name: "Visual Studio",
            logo: `${BASE_IMAGE_URL}details-page/tools/vs-code.png`,
            shadow: "#0080CF",
        },
        {
            name: "SQL",
            logo: `${BASE_IMAGE_URL}details-page/tools/sql.png`,
            shadow: "#D08001",
        },
        {
            name: "Bootstrap",
            logo: `${BASE_IMAGE_URL}details-page/tools/bootstrap.png`,
            shadow: "#7952B3",
        },
        {
            name: "Mongo DB",
            logo: `${BASE_IMAGE_URL}details-page/tools/mongodb.png`,
            shadow: "#9EFF3E",
        },
        {
            name: "Tailwind",
            logo: `${BASE_IMAGE_URL}details-page/tools/tailwind.png`,
            shadow: "#38BDF8",
        },
        {
            name: "Python",
            logo: `${BASE_IMAGE_URL}details-page/tools/python.png`,
            shadow: "#DE6B00",
        },
        {
            name: "Spring Boot",
            logo: `${BASE_IMAGE_URL}details-page/tools/spring-boot.png`,
            shadow: "#6DB33F",
        },
        {
            name: "HTML",
            logo: `${BASE_IMAGE_URL}details-page/tools/html.png`,
            shadow: "#E44D26",
        },
        {
            name: "Django",
            logo: `${BASE_IMAGE_URL}details-page/tools/django.png`,
            shadow: "#304F44",
        },
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
            title: "All Modules",
            points: [
                "HTML, CSS & Dev Environment",
                "Advanced CSS & Tailwind CSS",
                "JavaScript Fundamentals",
                "Advanced JS + Git & Postman",
                "React Fundamentals",
                "React Hooks, Routing & TypeScript",
                "State Management with Redux",
                "React + API Integration & Testing",
                "Node.js Fundamentals",
                "Express JS & API Testing",
                "MySQL",
                "MongoDB & Mongoose",
                "Authentication & Authorization",
                "Full MERN Integration",
                "Docker, CI/CD, AWS & AI Integration",
                "Capstone Project",
            ],
        },
        2: {
            title: "Frontend",
            points: [
                "HTML, CSS & Dev Environment",
                "Advanced CSS & Tailwind CSS",
                "JavaScript Fundamentals",
                "Advanced JS + Git & Postman",
                "React Fundamentals",
                "React Hooks, Routing & TypeScript",
                "State Management with Redux",
                "React + API Integration & Testing",
            ],
        },
        3: {
            title: "Backend",
            points: [
                "Node.js Fundamentals",
                "Express JS & API Testing",
                "MySQL",
                "MongoDB & Mongoose",
                "Authentication & Authorization",
            ],
        },
        4: {
            title: "DevOps & AI",
            points: [
                "Git & GitHub Workflow",
                "Postman API Testing",
                "REST API Best Practices",
                "JWT Authentication",
                "Docker Fundamentals",
                "Docker Compose",
                "CI/CD Pipelines",
                "AWS Deployment",
                "Cloud Hosting",
                "Environment Variables",
                "AI Tools for Developers",
                "Docker, CI/CD, AWS & AI Integration",
            ],
        },
        5: {
            title: "Projects",
            points: ["Capstone Project"],
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

    const advantages = [
        {
            title: "Code with Clarity",
            text: "We break complex concepts into simple, practical steps you can actually apply.",
            color: "#FF0000",
        },
        {
            title: "Build Real Projects",
            text: "Work on real-world applications instead of toy examples.",
            color: "#00A2FF",
        },
        {
            title: "Structured Learning",
            text: "Step-by-step learning path designed for real developer jobs.",
            color: "#FF9500",
        },
        {
            title: "Live Mentorship",
            text: "Get support & answers from industry professionals in real-time.",
            color: "#36C66B",
        },
        {
            title: "Job Readiness",
            text: "Improve portfolio, resume & interview confidence.",
            color: "#7D33F0",
        },
        {
            title: "Community Support",
            text: "Learn with peers through groups, discussions & hackathons.",
            color: "#FF2EB2",
        },
    ];

    const testimonials = [
        {
            name: "Swetha",
            img: `${BASE_IMAGE_URL}details-page/testimonials/person-1.png`,
            text: "Industry-Focused and Practical The Full-Stack Live Course at Velearn gave me strong hands-on experience with real-world projects. The mentors explained concepts clearly and ensured we understood how to apply them in real scenarios.",
            color1: "#E0002A",
            color2: "#7A0017",
        },
        {
            name: "Riya",
            img: `${BASE_IMAGE_URL}details-page/testimonials/person-2.png`,
            text: "Industry-Focused and Practical The Full-Stack Live Course at Velearn gave me strong hands-on experience with real-world projects. The mentors explained concepts clearly and ensured we understood how to apply them in real scenarios.",
            color1: "#D9D9D9",
            color2: "#737373",
        },
        {
            name: "Anjali",
            img: `${BASE_IMAGE_URL}details-page/testimonials/person-3.png`,
            text: "Industry-Focused and Practical The Full-Stack Live Course at Velearn gave me strong hands-on experience with real-world projects. The mentors explained concepts clearly and ensured we understood how to apply them in real scenarios.",
            color1: "#0D301B",
            color2: "#299654",
        },
        {
            name: "Karan",
            img: `${BASE_IMAGE_URL}details-page/testimonials/person-4.png`,
            text: "Industry-Focused and Practical The Full-Stack Live Course at Velearn gave me strong hands-on experience with real-world projects. The mentors explained concepts clearly and ensured we understood how to apply them in real scenarios.",
            color1: "#D9D9D9",
            color2: "#737373",
        },
        {
            name: "Sahil",
            img: `${BASE_IMAGE_URL}details-page/testimonials/person-5.png`,
            text: "Industry-Focused and Practical The Full-Stack Live Course at Velearn gave me strong hands-on experience with real-world projects. The mentors explained concepts clearly and ensured we understood how to apply them in real scenarios.",
            color1: "#FEC530",
            color2: "#98761D",
        },
    ];
    const repeatedTestimonials = [
        ...testimonials,
        ...testimonials,
        ...testimonials,
    ]; // repeat for loop

    const faqData = [
        {
            question: "Who is this Live Full Stack course designed for?",
            answer: (
                <>
                    <p>
                        This course is designed for students, freshers, career
                        switchers, and working professionals who want to learn
                        full stack development through live training, gain
                        real-world project experience, become job-ready
                        developers with strong practical skills, and build a
                        professional portfolio for interviews and receive career
                        and placement guidance.
                    </p>
                </>
            ),
        },
        {
            question: "Do I need prior coding experience to join this course?",
            answer: (
                <>
                    <p>
                        No. You do not need any prior coding experience to join
                        this course.
                    </p>
                    <p>
                        Our training starts from the basics and gradually moves
                        toward advanced concepts. Beginners, students, and
                        non-IT professionals can easily learn.
                    </p>
                    <p>
                        For those who already have some coding knowledge, we
                        provide fast-track options, challenging tasks, and
                        advanced modules to match your skill level.
                    </p>
                </>
            ),
        },
        {
            question: "What kind of projects will I work on?",
            answer: (
                <>
                    <p>
                        You will work on real-time, industry-relevant projects
                        based on the specific course you choose. These projects
                        help you build strong practical skills and a job-ready
                        portfolio.
                    </p>
                    <p>Example project types include:</p>
                    <ul>
                        <li>Web and mobile application development</li>
                        <li>API & backend systems</li>
                        <li>Data visualization dashboards</li>
                        <li>Machine learning mini-projects</li>
                        <li>Cloud deployment & automation tasks</li>
                    </ul>
                    <p>
                        At the end of the course, you will also complete a
                        capstone project to showcase your skills.
                    </p>
                </>
            ),
        },
        {
            question: "Will this course help me get a job?",
            answer: (
                <>
                    <p>
                        Yes. This course is designed to make you job-ready
                        through:
                    </p>
                    <ul>
                        <li>Practical training & real-world projects</li>
                        <li>Portfolio and resume development</li>
                        <li>Interview preparation & mock interviews</li>
                        <li>Placement support & company referrals</li>
                    </ul>
                    <p>
                        Many students start as interns, junior developers,
                        analysts, or IT support roles depending on their course.
                        Our placement team helps you throughout the job
                        application process.
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
            <section className="banner_top_sec_parent" style={{ paddingBottom: "90px" }}>
                <div className="banner_top_sec">
                    <div className="details_banner">
                        <div className="details_banner_inner">
                            <div className="section_container">
                                <div className="row justify-content-between">
                                    <div className="col-lg-6">
                                        <div className="pe-lg-5">
                                            <h1 className="text-white">
                                                Launch Your Tech Career with Our MERN Stack Online Course
                                            </h1>
                                            <p className="text-white small mt-4">
                                                Master AI-powered MERN stack development across React JS, Node.js, Express and MongoDB with real-world AI integration, through our live instructor-led course. Build intelligent web apps, earn your certificate, and launch your dream developer career.
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
                                                    Full Stack Development
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="banner_details">
                        <div className="section_container">
                            <div className="col-12 d-flex justify-content-start">
                                <div className="col-lg-9">
                                    <div className="ms-lg-5 ms-2 py-3">
                                        <div className="row text-center justify-content-lg-evenly justify-content-center">
                                            <div className="col-6 col-lg-2 mb-3 banner_details_list d-flex justify-content-center">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="fw-bold mb-1">
                                                        Weeks
                                                    </p>
                                                    <p className="mb-0">
                                                        12
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 banner_details_list d-flex justify-content-center">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="fw-bold mb-1">
                                                        Total Hours
                                                    </p>
                                                    <p className="mb-0">
                                                        160 Hours
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 banner_details_list d-flex justify-content-center">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="fw-bold mb-1">
                                                        Taught In
                                                    </p>
                                                    <p className="mb-0">
                                                        தமிழ்
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 banner_details_list d-flex justify-content-center">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="fw-bold mb-1">
                                                        1:1
                                                    </p>
                                                    <p className="mb-0">
                                                        Doubt Sessions
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 banner_details_list d-flex justify-content-center">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="fw-bold mb-1">
                                                        Placement
                                                    </p>
                                                    <p className="mb-0">
                                                        Support
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <p className="fw-bold text-center batch_info">
                                    Next batch starts 15 June 2026 Only 5 seats remaining
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="details_desc_parent">
                    <div className="section_container">
                        <div className="why_choose_details pt-2 pb-lg-5">
                            <div className="row justify-content-center">
                                <div className="col-lg-7">
                                    <h3 className="text-center fw-bold px-3 lh-sm">
                                        Step Into a Booming Career with the Best MERN Stack Course Online
                                    </h3>
                                </div>
                                <div className="col-lg-10">
                                    <p className="text-center small lh-lg">
                                        The MERN stack is booming with AI, and it's one of the most in demand skills in full stack web development today. Companies everywhere are looking for developers who can turn ideas into modern, scalable products. Step into a future proof career with skills that stay in demand for years.
                                    </p>
                                </div>
                                {/* Cards */}
                                {/* Top Row - 3 Cards */}
                                <div className="col-lg-7 mt-4">
                                    <div className="d-flex mern_steps_parent">
                                        <div className="mern_step-1 w-100">
                                            <p className="mb-1 fw-bold text-center">AI-Ready</p>
                                            <p className="text-center text-black small mb-0">
                                                Build smart apps The MERN stack skill every company wants now
                                            </p>
                                        </div>
                                        <div className="mern_step-2 w-100">
                                            <p className="mb-1 fw-bold text-center">#1</p>
                                            <p className="text-center text-black small mb-0">
                                                Most in-demand stack Across startups, IT firms & MNCs
                                            </p>
                                        </div>
                                        <div className="mern_step-3 w-100">
                                            <p className="mb-1 fw-bold text-center">4-in-1</p>
                                            <p className="text-center text-black small mb-0">
                                                One complete stack React + Node + Express + MongoDB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-9 mt-5">
                                    <div className="row">
                                        <div className="col-lg-4 pe-lg-0">
                                            <div className="mern_keypoints_1 ms-lg-5">
                                                <p className="fw-bold">Build faster with AI</p>
                                                <p className="mb-0">
                                                    Write code and build projects quicker using AI coding assistants
                                                </p>
                                            </div>
                                            <div className="mern_keypoints_2 mt-4">
                                                <p className="fw-bold">Build responsive websites</p>
                                                <p className="mb-0">
                                                    Create sites that work smoothly on every device with CSS and Tailwind
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 px-lg-0 d-flex align-items-center justify-content-center">
                                            <Image src="/images/live-course/mern/key-points.svg"
                                                className="w-100 h-100 object-fit-contain mt-3"
                                                height={500} width={250} alt=""
                                            />
                                        </div>
                                        <div className="col-lg-4 ps-lg-0">
                                            <div className="mern_keypoints_3 me-lg-5">
                                                <p className="fw-bold">Find & fix errors easily</p>
                                                <p className="mb-0">
                                                    Spot and solve bugs the smart way with DevTools and AI
                                                </p>
                                            </div>
                                            <div className="mern_keypoints_4 mt-4">
                                                <p className="fw-bold">Build large-scale applications</p>
                                                <p className="mb-0">
                                                    Handle heavy traffic with caching, indexing and performance tuning
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
            <section className="mern_skills" style={{ marginTop: "-100px" }}>
                <div className="skills pt-lg-5 pt-4 pb-4 position-relative">
                    <div className="d-flex justify-content-center">
                        <div className="back_big_text">
                            Full Stack Developer
                        </div>
                    </div>
                    <div className="inner_skills_content">
                        <div className="section_container">
                            <div className="d-flex justify-content-center">
                                <div className="col-lg-10">
                                    <h2 className="text-white text-center fw-bold">
                                        Skills and Tools You'll Master in This Course
                                    </h2>
                                    <p className="text-white text-center mb-0 small mt-3">
                                        Become a complete developer, not just a coder. Through our React JS Online Course, Node.js Online Course, and MongoDB Online Course modules, master html css and javascript, a modern javascript library, and a flexible nosql database — with hands-on projects and real world tools.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-10">
                                <div className="skills-slider-wrapper">
                                    <Swiper
                                        className="skills-swiper py-5"
                                        modules={[
                                            Navigation,
                                            Autoplay,
                                        ]}
                                        autoplay={{
                                            delay: 2000,
                                            disableOnInteraction: false,
                                        }}
                                        loop={true}
                                        navigation={true}
                                        breakpoints={{
                                            0: {
                                                slidesPerView: 2,
                                                spaceBetween: 10,
                                            },
                                            576: {
                                                slidesPerView: 2,
                                                spaceBetween: 15,
                                            },
                                            768: {
                                                slidesPerView: 2,
                                                spaceBetween: 20,
                                            },
                                            1024: {
                                                slidesPerView: 5,
                                                centeredSlides: true,
                                                spaceBetween: 20,
                                            },
                                        }}
                                    >
                                        {repeatedSkills.map(
                                            (item, i) => (
                                                <SwiperSlide
                                                    key={i}
                                                >
                                                    <div className="skill-card">
                                                        <Image
                                                            src={item.icon}
                                                            alt={item.title}
                                                            width={240}
                                                            height={240}
                                                        />
                                                        <p className="text-white">
                                                            {
                                                                item.title
                                                            }
                                                        </p>
                                                    </div>
                                                </SwiperSlide>
                                            ),
                                        )}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tools_slider_section pt-lg-5">
                    {/* <div className="section_container text-center mb-4">
                        <h3 className="text-white fw-bold mb-2">
                            <span className="text-c2">
                                Future-Ready{" "}
                            </span>
                            Tools for Modern Software
                            <span className="text-c2">
                                {" "}
                                Careers
                            </span>
                        </h3>
                    </div> */}

                    <Swiper
                        modules={[EffectCoverflow, Autoplay]}
                        effect="coverflow"
                        loop={true}
                        slidesPerView={5}
                        spaceBetween={20}
                        centeredSlides={true}
                        allowTouchMove={false}
                        simulateTouch={false}
                        // slidesPerView={window.innerWidth < 600 ? 1.6 : 5}
                        coverflowEffect={{
                            rotate: 25,
                            stretch: 0,
                            depth: 200,
                            modifier: 1,
                            slideShadows: false,
                        }}
                        autoplay={{ delay: 2000 }}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        onSlideChange={(swiper) => {
                            setActiveIndex(swiper.realIndex);
                            setActiveToolName(
                                tools[swiper.realIndex].name
                            );
                            setActiveShadow(
                                tools[swiper.realIndex].shadow
                            );
                        }}
                        breakpoints={{
                            0: { slidesPerView: 1.6 }, // mobile screens
                            600: { slidesPerView: 3 }, // tablets
                            1024: { slidesPerView: 5 }, // desktop
                        }}
                        className="tools_swiper"
                    >
                        {tools.map((tool, index) => {
                            const isActive =
                                index === activeIndex;
                            return (
                                <SwiperSlide key={index}>
                                    <div
                                        className={`tool_card ${isActive ? "active" : ""}`}
                                        style={{
                                            boxShadow: isActive
                                                ? `0px 5.33px 32px 1.02px ${tool.shadow} inset`
                                                : `0px 3.67px 22.04px 2.14px ${tool.shadow} inset`,
                                        }}
                                    >
                                        <Image
                                            src={tool.logo}
                                            alt={tool.name}
                                            width={170}
                                            height={170}
                                        />
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* === CUSTOM NAVIGATION + TOOL NAME === */}
                    <div className="tool_name_parent d-flex justify-content-center align-items-center gap-3 mt-3">
                        <button
                            className="tool_nav_btn left"
                            onClick={() =>
                                swiperRef.current?.slidePrev()
                            }
                        >
                            ❮
                        </button>

                        <div className="position-relative d-flex justify-content-center">
                            <div className="curve"></div>
                            <div
                                className="tool-name-display text-center"
                                style={{
                                    backgroundColor:
                                        activeShadow,
                                }}
                            >
                                <h5 className="text-white fw-semibold mb-0">
                                    {activeToolName}
                                </h5>
                            </div>
                        </div>

                        <button
                            className="tool_nav_btn right"
                            onClick={() =>
                                swiperRef.current?.slideNext()
                            }
                        >
                            ❯
                        </button>
                    </div>
                </div>
            </section>
            <section className="modules-section" style={{ paddingTop: "40px", paddingBottom: "220px", marginTop: "-50px" }}>
                <div className="section_container pb-5">

                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <h3 className="text-black text-center fw-bold px-lg-5 lh-sm">
                                Explore the Complete Curriculum of Our MERN Stack Course Online
                            </h3>

                            <p className="text-black text-center px-lg-5">
                                Our MERN stack course online takes you across 16 carefully sequenced weekly modules, where each session moves from theory to hands-on projects and real-world assignments. By the end, you've built a portfolio of complete web applications, not just lecture notes.
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
                            // className="tab-content-box positioned"
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
            <section className="advantage-section">
                <div className="section_container pt-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <h3 className="text-black text-center fw-bold lh-sm">
                                Build AI Powered Web Apps in Our MERN Stack Course
                            </h3>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-10 position-relative">
                            <div className="row justify-content-center">
                                {advantages.map((item, index) => (
                                    <div
                                        className="col-lg-3 col-6 d-flex justify-content-center mb-4 ms-lg-1"
                                        key={index}
                                    >
                                        <div className="inner_adv">
                                            <div className="inner_adv_bg">
                                                <svg
                                                    viewBox="0 0 185 175"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <g filter="url(#filter0_g_652_2040)">
                                                        <rect
                                                            x="4.91113"
                                                            y="4.91138"
                                                            width="174.198"
                                                            height="164.989"
                                                            rx="13.813"
                                                            fill={
                                                                item.color
                                                            }
                                                            fillOpacity="0.19"
                                                        />
                                                    </g>
                                                    <defs>
                                                        <filter
                                                            id="filter0_g_652_2040"
                                                            x="-0.000171661"
                                                            y="7.24792e-05"
                                                            width="184.02"
                                                            height="174.812"
                                                            filterUnits="userSpaceOnUse"
                                                            colorInterpolationFilters="sRGB"
                                                        >
                                                            <feFlood
                                                                floodOpacity="0"
                                                                result="BackgroundImageFix"
                                                            />
                                                            <feBlend
                                                                mode="normal"
                                                                in="SourceGraphic"
                                                                in2="BackgroundImageFix"
                                                                result="shape"
                                                            />
                                                            <feTurbulence
                                                                type="fractalNoise"
                                                                baseFrequency="0.200479 0.200479"
                                                                numOctaves="3"
                                                                seed="1556"
                                                            />
                                                            <feDisplacementMap
                                                                in="shape"
                                                                scale="9.82"
                                                                xChannelSelector="R"
                                                                yChannelSelector="G"
                                                                result="displacedImage"
                                                                width="100%"
                                                                height="100%"
                                                            />
                                                            <feMerge result="effect1_texture_652_2040">
                                                                <feMergeNode in="displacedImage" />
                                                            </feMerge>
                                                        </filter>
                                                    </defs>
                                                </svg>
                                            </div>

                                            <div className="inner_adv_content">
                                                <h4 className="text-black fw-bold text-lg-start text-center">
                                                    {item.title}
                                                </h4>
                                                <p className="text-black text-lg-start text-center">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="puzzle_images">

                                <Image
                                    src={`/images/details-page/puzzle-1.png`}
                                    className="puzzle-1 w-auto"
                                    height={200}
                                    width={200}
                                    alt=""
                                />
                                <Image
                                    src={`/images/details-page/puzzle-2.png`}
                                    className="puzzle-2 w-auto"
                                    height={200}
                                    width={200}
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="from_start_sec pt-4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <h3 className="text-black text-center fw-bold px-3 lh-sm">
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
            </section>
            <section className="details_bottom_part">
                <div className="skill_parent">
                    <div className="section_container py-5">
                        <div className="row justify-content-center">
                            <div className="col-lg-7">
                                <h3 className="text-white text-center fw-bold px-3 lh-sm">
                                    Unlock High-Paying Tech Roles with{" "}
                                    <span className="text-c2">
                                        {" "}
                                        Full Stack Skills
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="row justify-content-center mt-4">
                                    <div className="col-lg-4 col-6 my-3">
                                        <div className="skill_inner_p">
                                            <p>
                                                Full stack Developer Avg ₹ 6
                                                LPA - 8 LPA
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-6 my-3">
                                        <div className="skill_inner_p">
                                            <p>
                                                Frontend Developer Avg ₹ 5
                                                LPA - 9 LPA
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-6 my-3">
                                        <div className="skill_inner_p">
                                            <p>
                                                Backend Developer Avg ₹ 5
                                                LPA - 10 LPA
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-6 my-3">
                                        <div className="skill_inner_p">
                                            <p>
                                                DevOps Engineer Avg ₹ 10 LPA
                                                - 20 LPA
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-6 my-3">
                                        <div className="skill_inner_p">
                                            <p>
                                                React/Node.js Developer Avg
                                                ₹ 6 LPA - 12 LPA
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-6 my-3">
                                        <div className="skill_inner_p">
                                            <p>
                                                Software Engineer Avg ₹ 5
                                                LPA - 10 LPA
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="testimonial_details_page">
                    <div className="section_container">
                        <div className="row justify-content-center">
                            <div className="col-lg-7">
                                <h3 className="text-white text-center fw-bold px-3 lh-sm">
                                    Real Learning Outcomes Shared by{" "}
                                    <span className="text-c2">
                                        Our Students
                                    </span>
                                </h3>
                            </div>
                        </div>

                        <div className="testimonial-slider-wrapper">
                            <Swiper
                                className="testimonial-swiper"
                                loop={true}
                                pagination={{ clickable: true }}
                                centeredSlides={true}
                                slidesPerGroup={3}
                                slidesPerView={5}
                                modules={[Pagination, Autoplay]}
                                autoplay={{
                                    delay: 2000,
                                    disableOnInteraction: false,
                                }}
                                onSwiper={(swiper) => {
                                    setActiveSlide(swiper.realIndex);
                                }}
                                onSlideChange={(swiper) => {
                                    setActiveSlide(swiper.realIndex);
                                }}
                                breakpoints={{
                                    0: { slidesPerView: 2.3 },
                                    576: { slidesPerView: 2.3 },
                                    768: { slidesPerView: 3.3 },
                                    991: { slidesPerView: 3.3 },
                                    1024: { slidesPerView: 3.3 },
                                    1200: { slidesPerView: 5 },
                                }}
                            >
                                {repeatedTestimonials.map((item, index) => {
                                    const isActive = index === activeSlide;

                                    return (
                                        <SwiperSlide key={index}>
                                            <div
                                                className={`testimonial-card ${isActive ? "active" : ""}`}
                                                style={{
                                                    background: `linear-gradient(180deg, ${item.color1} 0%, ${item.color2} 100%)`,
                                                }}
                                            >
                                                <div className="d-flex w-100 h-100 testimonial_inner_parent">
                                                    <div className="d-flex align-items-lg-center overflow-hidden">
                                                        {isActive && (
                                                            <div className="active-content overflow-hidden">
                                                                <p className="text text-white">
                                                                    {item.text}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="test_img_parent">
                                                        <Image
                                                            src={item.img}
                                                            alt={item.name}
                                                            height={270}
                                                            width={200}
                                                            className="student-img"
                                                        />

                                                        {isActive && (
                                                            <div className="active-content overflow-hidden">
                                                                <h5 className="name text-white">
                                                                    {item.name}
                                                                </h5>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        </div>
                    </div>
                </div>
                <div className="section_container">
                    <div className="py-5 price_section_parent_top">
                        <div className="text-center d-flex justify-content-center">
                            <div className="row w-100 justify-content-center">
                                <div className="col-lg-6  d-flex justify-content-center ">
                                    <div className="parent_price">
                                        <div className="price_section d-flex flex-column align-items-center justify-content-center px-2 px-lg-4 py-4">
                                            {/* PRICE TABS */}
                                            <h3 className="fw-bold mb-3 text-white px-3 px-lg-0">
                                                Full Stack Unlimited Access
                                                Plan
                                            </h3>

                                            <div className="d-flex justify-content-center align-items-center gap-3 mb-4 price_header">
                                                <div className="price_tab old_price_tab">
                                                    <div className="butt">
                                                        <s>₹50,000</s>
                                                    </div>
                                                </div>

                                                <div className="price_tab new_price_tab active">
                                                    <div className="butt">
                                                        ₹15,000/-
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CONTENT BOX */}
                                            <div className="price_card w-100 text-white">
                                                <div className="row w-100 m-auto text-start">
                                                    <div className="col-6">
                                                        <ul className="list-unstyled">
                                                            <li>
                                                                • Lifetime
                                                                Material
                                                                Access
                                                            </li>
                                                            <li>
                                                                •
                                                                Portfolio-Ready
                                                                Projects
                                                            </li>
                                                            <li>
                                                                • Mentor-Led
                                                                Support
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="col-6">
                                                        <ul className="list-unstyled">
                                                            <li>
                                                                • Structured
                                                                Full Stack
                                                                Roadmap
                                                            </li>
                                                            <li>
                                                                • Career &
                                                                Placement
                                                                Guidance
                                                            </li>
                                                            <li>
                                                                •
                                                                Certificate
                                                                Of
                                                                Completion
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <button
                                                    className="mt-3"
                                                    onClick={handleCourseAction}
                                                >
                                                    {isEnrolled
                                                        ? "Start Course"
                                                        : user
                                                            ? "Apply Now"
                                                            : "Login to Enroll"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <div
                    className="section_container pt-5"
                    style={{ marginTop: "200px" }}
                >
                    <h3 className="text-black text-center fw-bold px-3 lh-sm">
                        Earn Your Professional{" "}
                        <span className="text-c2"> Certification</span>
                    </h3>
                    <div className="row justify-content-center">
                        <div className="col-lg-10 mt-4">
                            <div className="row">
                                <div className="col-lg-6 d-flex flex-column justify-content-center">
                                    <div className="mb-4">
                                        <h5 className="text-c1 fw-bold mb-3">
                                            Validate Your Achievement
                                        </h5>
                                        <p className="text-black mb-4">
                                            {" "}
                                            A trusted certificate that
                                            reflects your successful Course
                                            completion
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <h5 className="text-c1 fw-bold mb-3">
                                            {" "}
                                            Build a Professional Skill
                                            Portfolio
                                        </h5>
                                        <p className="text-black mb-4">
                                            Build your professional profile
                                            with verified course
                                            credentials.
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <h5 className="text-c1 fw-bold mb-3">
                                            {" "}
                                            Share Your Success
                                        </h5>
                                        <p className="text-black mb-4">
                                            Highlight your certification on
                                            LinkedIn and Resumes
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-6 d-flex align-items-center justify-content-center p-lg-5">
                                    <div className=" d-flex align-items-center justify-content-center">
                                        <div className="col-lg-10">
                                            <Image
                                                src={`/images/details-page/certificate.jpg`}
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
            </section>
            <section className="faq_section py-5">
                <div className="section_container p-xl text-center mt-lg-5">
                    <h3 className="section_base_heading">
                        Frequently Asked{" "}
                        <span className="text-c2">Questions</span>
                    </h3>

                    <div className="row mt-5 justify-content-center align-items-center">
                        <div className="col-lg-9 text-start">
                            {faqData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`faq_item mb-3 ${activeFaqIndex === index
                                        ? "active"
                                        : ""
                                        }`}
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

                                    {activeFaqIndex === index && (
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