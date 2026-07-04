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
const BASE_IMAGE_URL = "https://velearn.in/assets/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

export default function DataScience() {
    const router = useRouter();

    const swiperRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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

    const testimonials = [
        {
            image: "student-1.png",
            name: "Vijay",
            text: "The live sessions were practical and easy to follow. I can confidently plan and run real digital marketing campaigns now.",
            colorOne: "#FFA700",
            colorTwo: "#73737300",
        },
        {
            image: "student-2.png",
            name: "Shalini",
            text: "The live sessions were practical and easy to follow. I can confidently plan and run real digital marketing campaigns now.",
            colorOne: "#FF974B",
            colorTwo: "#73737300",
        },
        {
            image: "student-3.png",
            name: "Surya",
            text: "The live sessions were practical and easy to follow. I can confidently plan and run real digital marketing campaigns now.",
            colorOne: "#354A63",
            colorTwo: "#73737300",
        },
        {
            image: "student-4.png",
            name: "Neha Singh",
            text: "The live sessions were practical and easy to follow. I can confidently plan and run real digital marketing campaigns now.",
            colorOne: "#FFFFFF",
            colorTwo: "#73737300",
        },
    ];
    const sliderTestimonalData = [...testimonials, ...testimonials];
    useEffect(() => {
        const stacks: (() => void)[] = [];

        const sliderImagesBox =
            containerRef.current?.querySelectorAll<HTMLElement>(".cards-box");

        sliderImagesBox?.forEach((el) => {
            const imageNodes = el.querySelectorAll<HTMLElement>(
                ".card:not(.hide)"
            );

            let arrIndexes = [...imageNodes].map((_, i) => i);

            const setIndex = () => {
                imageNodes.forEach((img, i) => {
                    img.dataset.slide = String(arrIndexes[i]);
                });
            };

            const rotate = () => {
                const last = arrIndexes.pop();
                if (last !== undefined) {
                    arrIndexes.unshift(last);
                    setIndex();
                }
            };

            el.addEventListener("click", rotate);

            stacks.push(rotate);
            setIndex();

            return () => {
                el.removeEventListener("click", rotate);
            };
        });

        const stackAutoPlay = setInterval(() => {
            stacks.forEach((rotate) => rotate());
        }, 4000);

        return () => {
            clearInterval(stackAutoPlay);

            sliderImagesBox?.forEach((el) => {
                const clone = el.cloneNode(true);
                el.parentNode?.replaceChild(clone, el);
            });
        };
    }, []);

    return (
        <>
            <section>
                <div className="inner_page_top_padd bg-black">
                    <div className="ds_top_sec">
                        <Image
                            src={`${BASE_IMAGE_URL}live-course/data-science/banner-inner.png`}
                            className="ds_banner_inner"
                            height={710}
                            width={710}
                            alt=""
                        />
                        <div className="section_container ds_banner">
                            <div className="row justify-content-center">
                                <div className="col-lg-10 d-flex flex-column justify-content-center align-items-center">
                                    <div className="col-lg-11">
                                        <h1 className="text-white text-center">
                                            Become a Data Scientist with AI &
                                            Machine Learning Skills
                                        </h1>
                                        <p className="text-center text-white px-lg-4">
                                            This live Data Science and AI/ML
                                            program helps you develop job-ready
                                            analytical and machine learning
                                            skills through hands-on projects,
                                            real datasets, and continuous mentor
                                            guidance—preparing you for
                                            high-impact roles in today’s
                                            data-driven world.
                                        </p>
                                    </div>

                                    <div className="col-12 d-flex justify-content-center">
                                        <div className="col-lg-6 col-10">
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
                                        </div>
                                    </div>

                                    <div className="col-lg-11 ds_overview mt-4">
                                        <div className="row">
                                            <div className="col-lg-3 col-6 my-3 my-lg-0">
                                                <div className="d-flex flex-column justify-content-center align-items-center">
                                                    <p className="mb-0 text-center text-white fw-bold">
                                                        Expert
                                                    </p>
                                                    <p className="mb-0 text-center text-white">
                                                        Mentorship
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-6 my-3 my-lg-0">
                                                <div className="d-flex flex-column justify-content-center align-items-center">
                                                    <p className="mb-0 text-center text-white fw-bold">
                                                        Placement
                                                    </p>
                                                    <p className="mb-0 text-center text-white">
                                                        Assistance
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-6 my-3 my-lg-0">
                                                <div className="d-flex flex-column justify-content-center align-items-center">
                                                    <p className="mb-0 text-center text-white fw-bold">
                                                        Life Time
                                                    </p>
                                                    <p className="mb-0 text-center text-white">
                                                        Community Access
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-6 my-3 my-lg-0">
                                                <div className="d-flex flex-column justify-content-center align-items-center">
                                                    <p className="mb-0 text-center text-white fw-bold">
                                                        10+ Real Time
                                                    </p>
                                                    <p className="mb-0 text-center text-white">
                                                        Projects
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ds_carrer">
                            <div className="section_container">
                                <div className="row justify-content-center">
                                    <div className="col-lg-9 d-flex flex-column justify-content-center align-items-center">
                                        <div className="col-12 py-4 ">
                                            <h3 className="text-white fw-bold text-center">
                                                Powering Modern Careers with{" "}
                                                <span className="text-c2">
                                                    Data Science AI & Machine
                                                    Learning
                                                </span>
                                            </h3>
                                            <div className="row w-100 m-auto">
                                                <div className="col-lg-4 my-3">
                                                    <div className="h-100 ds_carrer_inner">
                                                        <p className="text-white fw-bold text-center">
                                                            Data-Driven World
                                                        </p>
                                                        <p className="text-white mb-0 text-center">
                                                            Every business
                                                            depends on data
                                                            insights
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-3">
                                                    <div className="h-100 ds_carrer_inner">
                                                        <p className="text-white fw-bold text-center">
                                                            Applied AI Learning
                                                        </p>
                                                        <p className="text-white mb-0 text-center">
                                                            Train models using
                                                            real-world data &
                                                            tools
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-3">
                                                    <div className="h-100 ds_carrer_inner">
                                                        <p className="text-white fw-bold text-center">
                                                            Analytical Skills
                                                        </p>
                                                        <p className="text-white mb-0 text-center">
                                                            Learn to solve
                                                            real-world problems
                                                            using AI & ML logic.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-3">
                                                    <div className="h-100 ds_carrer_inner">
                                                        <p className="text-white fw-bold text-center">
                                                            {" "}
                                                            Powering the Future
                                                            with AI
                                                        </p>
                                                        <p className="text-white mb-0 text-center">
                                                            AI, ML & Data
                                                            Science drive the
                                                            future of automation
                                                            and decisions.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-3">
                                                    <div className="h-100 ds_carrer_inner">
                                                        <p className="text-white fw-bold text-center">
                                                            Demand Across Every
                                                            Industry
                                                        </p>
                                                        <p className="text-white mb-0 text-center">
                                                            From startups to
                                                            global enterprises
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-3">
                                                    <div className="h-100 ds_carrer_inner">
                                                        <p className="text-white fw-bold text-center">
                                                            Rapid Salary Growth
                                                            Careers
                                                        </p>
                                                        <p className="text-white mb-0 text-center">
                                                            High-value roles in
                                                            data, AI & machine
                                                            learning
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
                <div className="ds_course_overview">
                    <div className="section_container">
                        <div className="row w-100 m-auto justify-content-center">
                            <div className="col-lg-10 ">
                                <h3 className="fw-bold text-center text-white">
                                    Course Overview
                                </h3>
                                <p className="text-white text-lg-start text-center">
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
                            <div className="col-lg-8 mt-4">
                                <h3 className="fw-bold text-center text-white">
                                    {" "}
                                    Learn the Most In-Demand Skills to Build
                                    a Career{" "}
                                    <span className="text-c2">
                                        {" "}
                                        AI & Data Science, ML
                                    </span>
                                </h3>
                                <div className="col-12 d-flex justify-content-center my-5">
                                    <div className="col-lg-12 ds_skills d-flex justify-content-center">
                                        <Image
                                            src={`${BASE_IMAGE_URL}live-course/data-science/ds-skill-bg.png`}
                                            className="ds_skill_inner_body h-auto"
                                            height={600}
                                            width={600}
                                            alt=""
                                        />
                                        <div className="col-lg-8 position-relative">
                                            <div className="row w-100 m-auto">
                                                <div className="w-100">
                                                    <div className="ds_skills_parent ds_skills_parent_one">
                                                        <div className="ds_skills_inner">
                                                            <div className="h-100 w-100">
                                                                <ul className="p-0 m-0">
                                                                    <li>
                                                                        Python
                                                                        Programming
                                                                        for
                                                                        Data
                                                                        Science
                                                                    </li>
                                                                    <li>
                                                                        Data
                                                                        Analysis
                                                                        &
                                                                        EDA
                                                                    </li>
                                                                    <li>
                                                                        Data
                                                                        Visualization
                                                                        &
                                                                        Business
                                                                        Reporting
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ds_skills_parent ds_skills_parent_two">
                                                        <div className="ds_skills_inner">
                                                            <div className="h-100 w-100">
                                                                <ul className="p-0 m-0">
                                                                    <li>
                                                                        Machine
                                                                        Learning
                                                                        Model
                                                                        Development
                                                                    </li>
                                                                    <li>
                                                                        Artificial
                                                                        Intelligence
                                                                        &
                                                                        Deep
                                                                        Learning
                                                                    </li>
                                                                    <li>
                                                                        SQL
                                                                        &
                                                                        Data
                                                                        Management
                                                                    </li>
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
                            <div className="col-lg-7">
                                <h3 className="text-center text-white fw-bold">
                                    {" "}
                                    Take{" "}
                                    <span className="text-c2">
                                        {" "}
                                        Your Career
                                    </span>{" "}
                                    to the Next Level with AI, Data Science
                                    & ML
                                </h3>
                                <div className="row w-100 m-auto">
                                    <div className="ds_shape_parent">
                                        <div className="custom-shape">
                                            <p className="text-white mb-0">
                                                Analyze real-world data and
                                                gain insights
                                            </p>
                                        </div>
                                        <div className="custom-shape">
                                            <p className="text-white mb-0">
                                                Master AI & Machine Learning
                                                in demand by companies
                                            </p>
                                        </div>
                                        <div className="custom-shape">
                                            <p className="text-white mb-0">
                                                Apply skills across IT,
                                                healthcare, finance & more
                                            </p>
                                        </div>
                                        <div className="custom-shape">
                                            <p className="text-white mb-0">
                                                Build portfolio-ready
                                                projects
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7 py-5">
                                <h3 className="fw-bold text-center text-white">
                                    The
                                    <span className="text-c2"> Tools </span>
                                    Behind Real-World Data
                                    <span className="text-c2">
                                        {" "}
                                        Science & AI
                                    </span>
                                </h3>
                                <Image
                                    src="/images/live-course/data-science/ds-tools.png"
                                    className="mt-4 w-100"
                                    width={720}
                                    height={370}
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ds_career_outcome">
                    <div className="section_container">
                        <div className="row w-100 m-auto justify-content-center">
                            <div className="col-lg-8 pb-5 ds_modules">
                                <h3 className="fw-bold text-center text-white">
                                    Course Modules – Your Step-by-Step
                                    <span className="text-c2">
                                        {" "}
                                        AI, Data Science & Journey
                                    </span>
                                </h3>
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
                            <div className="col-lg-8 py-5">
                                <h3 className="fw-bold text-center text-white">
                                    Career Outcomes – What{" "}
                                    <span className="text-c2">
                                        {" "}
                                        This Course Prepares You For
                                    </span>
                                </h3>
                                <p className="text-center text-white px-lg-5">
                                    Explore multiple career paths where
                                    businesses actively hire digital
                                    marketers with practical, job-ready
                                    skills.
                                </p>
                                <div className="col-12">
                                    <div className="row w-100 m-auto flex-lg-row flex-column-reverse justify-content-between overflow-hidden ds_career_parent">
                                        <div className="col-lg-7 px-0">
                                            <Image
                                                src={`${BASE_IMAGE_URL}live-course/data-science/ds-career-roles.png`}
                                                className="mt-4 w-100 h-auto"
                                                width={500}
                                                height={500}
                                                alt=""
                                            />
                                        </div>
                                        <div className="col-lg-4 mt-4 mt-lg-0 px-0 d-flex align-items-center justify-content-center">
                                            <ul>
                                                <li>Data Analyst</li>
                                                <li>Data Scientist</li>
                                                <li>
                                                    Machine Learning
                                                    Engineer
                                                </li>
                                                <li>
                                                    AI Associate / AI
                                                    Engineer
                                                </li>
                                                <li>
                                                    Business Data Analyst
                                                </li>
                                                <li>
                                                    Computer Vision Engineer
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 py-5">
                                <h3 className="fw-bold text-center text-white">
                                    High-Growth Careers with{" "}
                                    <span className="text-c2">
                                        {" "}
                                        Strong Salary Potential
                                    </span>
                                </h3>
                                <p className="text-center text-white px-lg-5 small">
                                    Build future-ready skills in Data
                                    Science, Machine Learning, and AI that
                                    are valued across industries. These
                                    roles drive real business impact through
                                    data-driven decisions and intelligent
                                    systems.
                                </p>
                                <div className="col-12 ds_salary_insight position-relative">
                                    <div className="ds_salary_insight_left">
                                        <p className="text-white">
                                            Machine Learning / AI Engineer
                                        </p>
                                        <div className="ds_salary_insight_parent">
                                            <p className="">
                                                Entry-Level: ₹8 L – ₹12 L
                                            </p>
                                            <p className="">
                                                Mid-Level: ₹15 L – ₹25 L
                                            </p>
                                            <p className="">
                                                Senior: ₹30 L – ₹45 L+
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ds_salary_insight_right">
                                        <p className="text-white">
                                            Data Scientist
                                        </p>
                                        <div className="ds_salary_insight_parent">
                                            <p className="">
                                                Entry-Level: ₹6 L – ₹10 L
                                            </p>
                                            <p className="">
                                                Mid-Level: ₹12 L – ₹22 L
                                            </p>
                                            <p className="">
                                                Senior: ₹25 L – ₹40 L+
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-12 d-flex justify-content-center ds_salary_insight_globe">
                                        <Image
                                            src={`${BASE_IMAGE_URL}live-course/data-science/salary-insight-globe.png`}
                                            className="m-auto h-auto"
                                            height={500}
                                            width={500}
                                            alt=""
                                        />
                                        <p className="text-white mb-0">
                                            Average Annual Salary <br />{" "}
                                            ₹20.8 LPA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ds_bottom_end">
                    <div className="ds_journey mb-5">
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
                    </div>
                    <div className="ds_stories">
                        <div className="section_container">
                            <h3 className="text-white text-center fw-bold">
                                Students Share Their Journey into{" "}
                                <span className="text-c2">
                                    {" "}
                                    AI, Data Science & ML
                                </span>
                            </h3>
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-lg-6 position-relative ds_stories_parent_main">
                                    <Image
                                        src={`${BASE_IMAGE_URL}live-course/data-science/skill-stories-1.png`}
                                        className="w-100 h-auto"
                                        height={640}
                                        width={640}
                                        alt=""
                                    />
                                    <div className="ds_stories_parent">
                                        <Swiper
                                            modules={[Autoplay]}
                                            loop={true}
                                            centeredSlides={true}
                                            slidesPerView={1}
                                            autoplay={{
                                                delay: 2000,
                                                disableOnInteraction: false,
                                            }}
                                        >
                                            {sliderTestimonalData.map(
                                                (item, index) => (
                                                    <SwiperSlide
                                                        key={index}
                                                    >
                                                        <div className="ds_testimonial_card position-relative">
                                                            <p>
                                                                I joined
                                                                this course
                                                                with very
                                                                little
                                                                background
                                                                in Data
                                                                Science. The
                                                                step-by-step
                                                                structure
                                                                helped me
                                                                understand
                                                                Python, data
                                                                analysis,
                                                                and ML
                                                                clearly. Now
                                                                I feel
                                                                confident
                                                                working with
                                                                real
                                                                datasets and
                                                                explaining
                                                                my projects
                                                            </p>
                                                            <div className="col-12 d-flex justify-content-end">
                                                                <span>
                                                                    -Kavi
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </SwiperSlide>
                                                ),
                                            )}
                                        </Swiper>
                                    </div>
                                    {/* <div className="ds_stories_text_main">
                                            <div className="ds_stories_text d-block d-lg-none">Skill Stories</div>
                                            <div className="ds_stories_text d-block d-lg-none">Skill Stories</div>
                                            <div className="ds_stories_text">Skill Stories</div>
                                            <div className="ds_stories_text">Skill Stories</div>
                                            <div className="ds_stories_text">Skill Stories</div>
                                        </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ds_certification py-3">
                        <div className="section_container">
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-lg-10">
                                    <h3 className="text-white text-center fw-bold pb-4">
                                        A{" "}
                                        <span className="text-c2">
                                            {" "}
                                            Certification
                                        </span>{" "}
                                        That Reflects What You Can Do
                                    </h3>
                                    <div className="row">
                                        <div className="col-lg-6 d-flex flex-column justify-content-center">
                                            <div className="mb-2">
                                                <h5 className="text-white fw-bold mb-3">
                                                    Design Skill–Verified
                                                    Certification
                                                </h5>
                                                <p className="text-white mb-4">
                                                    {" "}
                                                    This certification
                                                    validates your UI
                                                    thinking, user research,
                                                    wireframing, and visual
                                                    design skills — proven
                                                    through real design
                                                    tasks and projects.
                                                </p>
                                            </div>
                                            <div className="mb-2">
                                                <h5 className="text-white fw-bold mb-3">
                                                    Globally Relevant Design
                                                    Credential
                                                </h5>
                                                <p className="text-white mb-4">
                                                    Showcase your UI/UX
                                                    expertise with a
                                                    certificate aligned to
                                                    modern design standards,
                                                    valued by startups and
                                                    product teams worldwide.
                                                </p>
                                            </div>
                                            <div className="mb-2">
                                                <h5 className="text-white fw-bold mb-3">
                                                    Portfolio & Career
                                                    Booster
                                                </h5>
                                                <p className="text-white mb-4">
                                                    More than a certificate
                                                    — this strengthens your
                                                    portfolio, resume, and
                                                    interviews, helping you
                                                    stand out as a job-ready
                                                    UI/UX designer.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 d-flex align-items-center justify-content-center">
                                            <div className=" d-flex align-items-center justify-content-center">
                                                <div className="col-lg-10">
                                                    <Image
                                                        src={`${BASE_IMAGE_URL}live-course/data-science/ds-certificate.png`}
                                                        className="w-100 rounded-5 h-auto"
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
                    <div className="price_section_parent_top position-relative top-0">
                        <div className="text-center d-flex justify-content-center">
                            <div className="row w-100 justify-content-center">
                                <div className="col-lg-6 d-flex justify-content-center ">
                                    <div className="parent_price">
                                        <div className="price_section d-flex flex-column align-items-center justify-content-center px-2 px-lg-4 py-4">
                                            {/* PRICE TABS */}
                                            <h3 className="fw-bold text-white px-3 px-lg-0 mb-1">
                                                <span className="text-c2">
                                                    Data Science{" "}
                                                </span>{" "}
                                                specific version
                                            </h3>
                                            <h4 className="text-white pb-4">
                                                Velearn Career Access Plan
                                            </h4>
                                            {/* CONTENT BOX */}
                                            <div className="price_card w-100 text-white">
                                                <div className="row w-100 m-auto text-start">
                                                    <div className="col-6">
                                                        <ul className="list-unstyled">
                                                            <li className="d-flex gap-1">
                                                                <span>
                                                                    ✔
                                                                </span>{" "}
                                                                One-Time
                                                                Payment – No
                                                                hidden
                                                                charges
                                                            </li>
                                                            <li className="d-flex gap-1">
                                                                <span>
                                                                    ✔
                                                                </span>{" "}
                                                                Lifetime
                                                                Course
                                                                Access
                                                            </li>
                                                            <li className="d-flex gap-1">
                                                                <span>
                                                                    ✔
                                                                </span>{" "}
                                                                Live
                                                                Interactive
                                                                Classes
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="col-6">
                                                        <ul className="list-unstyled">
                                                            <li className="d-flex gap-1">
                                                                <span>
                                                                    ✔
                                                                </span>{" "}
                                                                Real-Time
                                                                Hands-On
                                                                Projects
                                                            </li>
                                                            <li className="d-flex gap-1">
                                                                <span>
                                                                    ✔
                                                                </span>{" "}
                                                                Portfolio
                                                                Building &
                                                                Resume
                                                                Review
                                                            </li>
                                                            <li className="d-flex gap-1">
                                                                <span>
                                                                    ✔
                                                                </span>{" "}
                                                                Mock
                                                                Interviews +
                                                                Placement
                                                                Support
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
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
                                            <div className="price_card">
                                                <button
                                                    type="button"
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
                        </div>
                    </div>
                    <section className="faq_section pt-5 pt-lg-0 pb-5">
                        <div className="section_container p-xl text-center mt-lg-5">
                            <h3 className="section_base_heading text-white">
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
                                                    <div className="faq_answer text-white">
                                                        {item.answer}
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}