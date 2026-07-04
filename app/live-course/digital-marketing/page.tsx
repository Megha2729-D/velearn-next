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

export default function DigitalMarketing() {
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
                <div className="dm_main pb-1">
                    <div className="bg-white dm_top_sec">
                        <div className="digital_marketing_banner pb-5">
                            <div className="section_container">
                                <div className="row justify-content-between">
                                    <div className="col-lg-7">
                                        <div className="banner_left_dm">
                                            <h1 className="fw-bold text-white">
                                                Future-Proof{" "}
                                                <span className="text-c2">
                                                    Your Career
                                                </span>{" "}
                                                with Live Digital Marketing
                                                Training
                                            </h1>
                                            <p className="text-white mt-4">
                                                This live Digital Marketing
                                                training program is designed to
                                                build job-ready skills through
                                                hands-on campaign execution,
                                                real-time tools, and expert
                                                mentorship— preparing you for
                                                high-growth roles in today’s
                                                digital economy.
                                            </p>
                                            <button
                                                onClick={
                                                    handleCourseAction
                                                }
                                            >
                                                {isEnrolled
                                                    ? "Start Course"
                                                    : "Enroll Now"}
                                            </button>
                                            <div className="pagination_parent d-lg-flex d-none">
                                                <Link href={"/"}>Home</Link>
                                                <span className="px-2"> /</span>
                                                <Link href={"/recorded-course"}>
                                                    {" "}
                                                    Live courses{" "}
                                                </Link>
                                                <span className="px-2">/</span>
                                                <Link href={"/course-details"}>
                                                    {" "}
                                                    Digital Marketing
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-5 mt-5 mt-lg-0 position-relative">
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
                                            <Link href={"/recorded-course"}>
                                                {" "}
                                                Recorded courses{" "}
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
                        <div className="banner_details">
                            <div className="section_container">
                                <div className="col-12 d-flex justify-content-start">
                                    <div className="col-lg-12">
                                        <div className="ms-lg-5 ms-2 py-3">
                                            <div className="row text-center">
                                                <div className="col-6 col-lg-3 my-3 my-lg-0 banner_details_list d-flex justify-content-center border border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            Expert
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            Mentorship
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-lg-3 my-3 my-lg-0 banner_details_list d-flex justify-content-center border border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            10+ Real Time
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            Projects
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-lg-3 my-3 my-lg-0 banner_details_list d-flex justify-content-center border border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            Placement
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            Assistance
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-lg-3 my-3 my-lg-0 banner_details_list d-flex justify-content-center border border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            Life Time
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            Community Access
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="why_dm_sec py-4">
                            <div className="section_container">
                                <h3 className="text-center fw-bold text-white">
                                    Why UI/UX Design Is a Beginner-Friendly
                                    Career
                                </h3>
                                <div className="row justify-content-center mt-4">
                                    <div className="col-lg-8">
                                        <div className="row">
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Businesses depend on
                                                        digital growth
                                                        strategies
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Practical skills with
                                                        real-world applications
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Careers driven by
                                                        results and performance
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Work with brands across
                                                        multiple industries
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Faster skill-to-income
                                                        conversion
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Evolving field with
                                                        constant opportunities
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dm_single_sec">
                        <div className="dm_overview">
                            <div className="section_container">
                                <div className="py-4">
                                    <h3 className="text-black fw-bold text-center">
                                        {" "}
                                        Course{" "}
                                        <span className="text-c2">
                                            Overview
                                        </span>
                                    </h3>
                                    <p className="text-center px-lg-4">
                                        This Digital Marketing course is
                                        designed to build a strong foundation
                                        with practical, job-ready skills needed
                                        in today’s digital-driven business
                                        world. The program covers key areas such
                                        as SEO, Social Media Marketing, Google
                                        Ads, Content Marketing, Email Marketing,
                                        and Analytics. Through live
                                        instructor-led classes and hands-on
                                        campaign practice, learners gain
                                        real-world experience using industry
                                        tools. The course focuses on
                                        performance, data-based decision-making,
                                        and practical application to help
                                        participants confidently manage digital
                                        campaigns and prepare for various
                                        digital marketing career roles.
                                    </p>
                                </div>
                                <div className="pb-5">
                                    <h3 className="text-black text-center fw-bold">
                                        Step Into a High-Growth
                                        <span className="text-c2">
                                            {" "}
                                            Digital Marketing Career
                                        </span>
                                    </h3>
                                    <div className="row justify-content-center">
                                        <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center">
                                            <div className="dm_steps">
                                                <div className="dm_steps_sub dm_step_one my-4">
                                                    <div></div>
                                                    <p>
                                                        Master in-demand digital
                                                        marketing channels and
                                                        tools
                                                    </p>
                                                </div>
                                                <div className="dm_steps_sub dm_step_two my-4">
                                                    <div></div>
                                                    <p>
                                                        Work on live campaigns
                                                        with expert-led guidance
                                                    </p>
                                                </div>
                                                <div className="dm_steps_sub dm_step_three my-4">
                                                    <div></div>
                                                    <p>
                                                        Gain hands-on experience
                                                        through real business
                                                        case studies
                                                    </p>
                                                </div>
                                                <div className="dm_steps_sub dm_step_four my-4">
                                                    <div></div>
                                                    <p>
                                                        Learn performance
                                                        tracking, optimization,
                                                        and ROI measurement
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCourseAction}
                                            >
                                                {isEnrolled
                                                    ? "Start Course"
                                                    : "Start Learning"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pb-5 dm_skills">
                                    <div className="row justify-content-center">
                                        <div className="col-lg-11">
                                            <h3 className="text-black text-center fw-bold">
                                                Build the Skills{" "}
                                                <span className="text-c2">
                                                    Behind Digital Success
                                                </span>
                                            </h3>
                                            <p className="text-center">
                                                Develop powerful digital skills
                                                through practical,
                                                performance-based learning.
                                            </p>
                                            <div className="row mt-4">
                                                <div className="col-lg-4 my-4 px-4">
                                                    <div className="dm_skils_sub rounded-4">
                                                        <p className="mb-0 p-3 text-center text-black">
                                                            Search Engine
                                                            Optimization (SEO)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-4 px-4">
                                                    <div className="dm_skils_sub rounded-4">
                                                        <p className="mb-0 p-3 text-center text-black">
                                                            Google Ads & Paid
                                                            Campaigns
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-4 px-4">
                                                    <div className="dm_skils_sub rounded-4">
                                                        <p className="mb-0 p-3 text-center text-black">
                                                            Content Marketing
                                                            Strategy
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-4 px-4">
                                                    <div className="dm_skils_sub rounded-4">
                                                        <p className="mb-0 p-3 text-center text-black">
                                                            Email & Marketing
                                                            Automation
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-4 px-4">
                                                    <div className="dm_skils_sub rounded-4">
                                                        <p className="mb-0 p-3 text-center text-black">
                                                            Analytics &
                                                            Performance Tracking
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 my-4 px-4">
                                                    <div className="dm_skils_sub rounded-4">
                                                        <p className="mb-0 p-3 text-center text-black">
                                                            Conversion
                                                            Optimization
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
            </section>
            <section>
                <div className="bg-white pt-0 dm_single_sec bg-white">
                    <div className="dm_tools py-5">
                        <div className="section_container">
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-12">
                                    <h3 className="text-white text-center fw-bold">
                                        Tools That
                                        <span className="text-c2">
                                            {" "}
                                            Power Digital Marketing
                                        </span>
                                    </h3>
                                    <p className="text-center text-white">
                                        Gain practical experience using
                                        professional marketing tools.
                                    </p>
                                </div>
                                <div className="row justify-content-center">
                                    <div className="col-lg-10">
                                        <div className="col-12 position-relative">
                                            <Image
                                                src={`${BASE_IMAGE_URL}live-course/digital-marketing/dm-logo.png`}
                                                className="w-100 h-auto"
                                                width={1100}
                                                height={1100}
                                                alt=""
                                            />
                                            <div className="dm_tools_center">
                                                <h5 className="text-black mb-0 text-center text-uppercase">
                                                    Digital Marketing
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dm_path mt-2">
                        <div className="section_container py-5">
                            <div className="pb-5">
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    A Structured Path to Master{" "}
                                    <span className="text-c2">
                                        {" "}
                                        Digital Marketing
                                    </span>
                                </h3>
                                <div className="row justify-content-center">
                                    <div className="col-lg-5">
                                        <p className="text-black text-center px-lg-5">
                                            Each module at Velearn focuses on
                                            practical skills to prepare you for
                                            real jobs.
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
                            <div className="my-5 dm_ways_main">
                                <div className="row w-100 m-auto justify-content-center">
                                    <div className="col-lg-7">
                                        <h3 className="text-black text-center fw-bold">
                                            A Smarter Way to
                                            <span className="text-c2">
                                                {" "}
                                                Master Digital Marketing
                                            </span>{" "}
                                            At
                                            <span className="text-c2">
                                                {" "}
                                                Velearn
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="col-12 ">
                                        <div className="col-lg-10">
                                            <div className="d-flex dm_way_points_card_parent justify-content-between">
                                                <div className="dm_way_points_parent my-3 d-flex justify-content-lg-start justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6>
                                                            Hands-On Learning
                                                            That Builds Real
                                                            Skills
                                                        </h6>
                                                        <p className="mb-0">
                                                            Every topic is
                                                            delivered through
                                                            practical exercises,
                                                            live demos, and real
                                                            campaign-style
                                                            execution
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex justify-content-lg-start justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6>
                                                            Real-World Campaign
                                                            Exposure
                                                        </h6>
                                                        <p className="mb-0">
                                                            Work on practical
                                                            assignments that
                                                            reflect how brands
                                                            generate traffic,
                                                            leads, and
                                                            conversions in the
                                                            real market.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex justify-content-lg-start justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6>
                                                            Job-Ready Resume
                                                            Development
                                                        </h6>
                                                        <p className="mb-0">
                                                            Build a resume that
                                                            highlights campaign
                                                            results, tools
                                                            handled, and
                                                            practical marketing
                                                            experience, not just
                                                            course names.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 d-flex justify-content-end">
                                        <div className="col-lg-10">
                                            <div className="d-flex dm_way_points_card_parent justify-content-between">
                                                <div className="dm_way_points_parent my-3 d-flex flex-column justify-content-lg-end justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6>
                                                            Hands-On Learning
                                                            That Builds Real
                                                            Skills
                                                        </h6>
                                                        <p className="mb-0">
                                                            Every topic is
                                                            delivered through
                                                            practical exercises,
                                                            live demos, and real
                                                            campaign-style
                                                            execution
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex flex-column justify-content-lg-end justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6>
                                                            Real-World Campaign
                                                            Exposure
                                                        </h6>
                                                        <p className="mb-0">
                                                            Work on practical
                                                            assignments that
                                                            reflect how brands
                                                            generate traffic,
                                                            leads, and
                                                            conversions in the
                                                            real market.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex flex-column justify-content-lg-end justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6>
                                                            Job-Ready Resume
                                                            Development
                                                        </h6>
                                                        <p className="mb-0">
                                                            Build a resume that
                                                            highlights campaign
                                                            results, tools
                                                            handled, and
                                                            practical marketing
                                                            experience, not just
                                                            course names.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCourseAction}
                                    >
                                        {isEnrolled
                                            ? "Start Course"
                                            : "Start Learning"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dm_skills_main py-5">
                        <div className="section_container pb-5">
                            <div className="row justify-content-center">
                                <h3 className="text-center fw-bold text-white">
                                    Turn
                                    <span className="text-c2">
                                        {" "}
                                        Digital Skills
                                    </span>{" "}
                                    into In-Demand
                                    <span className="text-c2"> Job Roles</span>
                                </h3>
                                <div className="col-lg-7">
                                    <p className="text-center text-white">
                                        Explore multiple career paths where
                                        businesses actively hire digital
                                        marketers with practical, job-ready
                                        skills.
                                    </p>
                                </div>
                                <div className="col-12" ref={containerRef}>
                                    <div className="row justify-content-center">
                                        <div className="col-lg-4">
                                            <div className="d-flex dm_skill_path">
                                                <div className="row justify-content-center w-100 m-auto">
                                                    <div className="cards-box">
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹8
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    Full-Time
                                                                    Roles
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹7
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    Digital
                                                                    Marketing
                                                                    Executive
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹7
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    SEO
                                                                    Executive /
                                                                    SEO Analyst
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹7
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    Social Media
                                                                    Marketing
                                                                    Specialist
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹7
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    Performance
                                                                    Marketing
                                                                    Executive
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹7
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    Content
                                                                    Marketing
                                                                    Specialist
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹7
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    Email
                                                                    Marketing
                                                                    Specialist
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="card">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="h4">
                                                                    ₹3 LPA – ₹7
                                                                    LPA
                                                                </div>
                                                                <p className="h4">
                                                                    Overall
                                                                    Average
                                                                    Salary Range
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

                        <div className="row pt-5 w-100 m-auto">
                            <h3 className="text-center fw-bold text-white">
                                <span className="text-c2"> Learning</span>{" "}
                                Experiences Shared by
                                <span className="text-c2"> Our Students</span>
                            </h3>
                            <div className="testimonial_section pb-0">
                                <Swiper
                                    modules={[Autoplay]}
                                    loop={true}
                                    centeredSlides={true}
                                    slidesPerView={3.5}
                                    autoplay={{
                                        delay: 2000,
                                        disableOnInteraction: false,
                                    }}
                                    breakpoints={{
                                        320: { slidesPerView: 1 },
                                        576: { slidesPerView: 2 },
                                        992: { slidesPerView: 3.5 },
                                        1200: { slidesPerView: 3.5 },
                                    }}
                                >
                                    {sliderTestimonalData.map((item, index) => (
                                        <SwiperSlide key={index}>
                                            <div
                                                className="dm_testimonial_card position-relative"
                                                style={{
                                                    background: `linear-gradient(90deg, ${item.colorOne} 0%, ${item.colorTwo} 100%)`,
                                                }}
                                            >
                                                <Image
                                                    src={`${BASE_IMAGE_URL}live-course/digital-marketing/testimonial/${item.image}`}
                                                    alt={item.name}
                                                    width={200}
                                                    height={250}
                                                />
                                                <div>
                                                    <p className="testimonial_text text-center">
                                                        {item.text}
                                                    </p>
                                                    <h4>{item.name}</h4>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                    <div className="dm_from_start_sec">
                        <div className="from_start_sec py-5">
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
                                                src={`${BASE_IMAGE_URL}details-page/journey/step-2.png`}
                                                alt=""
                                                height={200}
                                                width={200}
                                            />
                                        </div>
                                    </div>

                                    <div className="journey_item item_3">
                                        <div className="parent">
                                            <Image
                                                src={`${BASE_IMAGE_URL}details-page/journey/step-3.png`}
                                                alt=""
                                                height={200}
                                                width={200}
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
                                                src={`${BASE_IMAGE_URL}details-page/journey/step-4.png`}
                                                alt=""
                                                height={200}
                                                width={200}
                                            />
                                        </div>
                                    </div>

                                    <div className="journey_item item_5">
                                        <div className="parent">
                                            <Image
                                                src={`${BASE_IMAGE_URL}details-page/journey/step-5.png`}
                                                alt=""
                                                height={200}
                                                width={200}
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
                        <div className="section_container">
                            <div className="row justify-content-center">
                                <div className="col-lg-6">
                                    <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                        A{" "}
                                        <span className="text-c2">
                                            {" "}
                                            Certification
                                        </span>{" "}
                                        That Reflects What You Can Do
                                    </h3>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-lg-10 mt-4">
                                    <div className="row">
                                        <div className="col-lg-6 d-flex flex-column justify-content-center">
                                            <div className="mb-2">
                                                <h5 className="text-black fw-bold mb-3">
                                                    Design Skill–Verified
                                                    Certification
                                                </h5>
                                                <p className="text-black mb-4">
                                                    {" "}
                                                    This certification validates
                                                    your UI thinking, user
                                                    research, wireframing, and
                                                    visual design skills —
                                                    proven through real design
                                                    tasks and projects.
                                                </p>
                                            </div>
                                            <div className="mb-2">
                                                <h5 className="text-black fw-bold mb-3">
                                                    Globally Relevant Design
                                                    Credential
                                                </h5>
                                                <p className="text-black mb-4">
                                                    Showcase your UI/UX
                                                    expertise with a certificate
                                                    aligned to modern design
                                                    standards, valued by
                                                    startups and product teams
                                                    worldwide.
                                                </p>
                                            </div>
                                            <div className="mb-2">
                                                <h5 className="text-black fw-bold mb-3">
                                                    Portfolio & Career Booster
                                                </h5>
                                                <p className="text-black mb-4">
                                                    More than a certificate —
                                                    this strengthens your
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
                        <div className="py-5 price_section_parent_top position-relative top-0">
                            <div className="text-center d-flex justify-content-center">
                                <div className="row w-100 justify-content-center">
                                    <div className="col-lg-6 mt-4 d-flex justify-content-center ">
                                        <div className="parent_price">
                                            <div className="price_section d-flex flex-column align-items-center justify-content-center px-2 px-lg-4 py-4">
                                                {/* PRICE TABS */}
                                                <h3 className="fw-bold mb-3 text-white px-3 px-lg-2">
                                                    Digital Marketing Unlimited
                                                    Access Plan
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
                        <section className="faq_section pb-5">
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
                        </section>
                    </div>
                </div>
            </section>
        </>
    );
}