"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./style.css"
interface CourseDetailsPageProps {
    slugId: string;
}

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
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
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


    return (
        <>
            <div className="rc_body">
                {/* Hero Section */}
                <section className="course-hero rc_banner">
                    <div className="container">
                        <div className="row align-items-center justify-content-lg-between">

                            {/* Left Content */}
                            <div className="col-lg-8 pe-lg-5 text-white">
                                <h1 className="course-title">
                                    Free Java Online Course For Beginners
                                </h1>

                                <p className="course-description">
                                    Learn Java from scratch with our free beginner-friendly tutorials covering data types, control structures, and object oriented programming to build real world Java code and become a confident Java developer in software development.
                                </p>
                                <div className="d-flex justify-content-start mb-3">
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
                                                    5 Core <br /> Modules
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-6 my-3 my-lg-0">
                                            <div>
                                                <p className="text-center text-white">
                                                    5+ Hrs of  <br />
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
                                        Get this course @ ₹500
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
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-auto"
                                        >
                                            Enroll Now
                                        </button>
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
                                <div className="course_tabs_sticky">
                                    <ul>
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
                    <div id="modules" className="py-4 px-1 bg-white">
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

                    {/* Reviews */}
                    <div id="reviews">
                        <div className="rc_sec_6 py-5">
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

                    {/* Certificate */}
                    <div id="certificate">
                        <div className="rc_sec_7">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Duration & Fee */}
                    <div id="fee">
                        <div className="rc_sec_8">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div id="faq">
                        <div className="rc_sec_9">
                            <div className="section_container">
                                <div className="row">
                                    <div className="col-lg-8">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}