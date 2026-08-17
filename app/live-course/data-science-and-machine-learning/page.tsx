"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
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
    const [courseId] = useState(4);
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
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            setUser(null);
            setIsEnrolled(false);
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

            setName(parsedUser.name || "");
            setEmail(parsedUser.email || "");

            setPhone(
                (
                    parsedUser.phonenumber ||
                    parsedUser.phone ||
                    ""
                )
                    .replace(/^\+?91/, "")
                    .trim()
            );

            if (parsedUser.id) {
                checkEnrollment(Number(parsedUser.id));
            }
        } catch (error) {
            console.error("Invalid user data:", error);

            localStorage.removeItem("user");
            setUser(null);
            setIsEnrolled(false);
        }
    }, []);

    const checkEnrollment = async (userId: number) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${BASE_API_URL}my-courses/${userId}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                }
            );

            const responseText = await response.text();

            if (!response.ok) {
                console.error(
                    "My courses API error:",
                    response.status,
                    responseText
                );

                setIsEnrolled(false);
                return;
            }

            const data = JSON.parse(responseText);

            console.log("My courses:", data);

            if (data.status && data.data) {
                const allCourses = Array.isArray(data.data.all)
                    ? data.data.all
                    : [];

                const enrolled = allCourses.some(
                    (course: any) =>
                        Number(course.id) === Number(courseId)
                );

                console.log("Course ID:", courseId);
                console.log("Is enrolled:", enrolled);

                setIsEnrolled(enrolled);
            } else {
                setIsEnrolled(false);
            }
        } catch (error) {
            console.error("Check enrollment error:", error);
            setIsEnrolled(false);
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        const cleanName = name.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim();

        if (!cleanName) {
            newErrors.name = "Name is required";
        }

        if (!cleanPhone) {
            newErrors.phone = "Phone is required";
        } else if (!/^[0-9]{10}$/.test(cleanPhone)) {
            newErrors.phone =
                "Enter valid 10 digit phone number";
        }

        if (!cleanEmail) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                cleanEmail
            )
        ) {
            newErrors.email =
                "Enter valid email address";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleEnroll = (
        e?: React.FormEvent<HTMLFormElement>
    ) => {
        e?.preventDefault();

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            router.push("/login");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmEnroll = async () => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                router.push("/login");
                return;
            }

            const loggedUser = JSON.parse(storedUser);

            const token = localStorage.getItem("token");

            const payload = {
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                lead_source: "Website",
                course_id: Number(courseId),
                auth_id: Number(loggedUser.id),
            };

            console.log(
                "Sending enrollment payload:",
                payload
            );

            const response = await fetch(
                `${BASE_API_URL}enroll-now`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: JSON.stringify(payload),
                }
            );

            const responseText = await response.text();

            console.log(
                "Enrollment status:",
                response.status
            );

            console.log(
                "Enrollment response:",
                responseText
            );

            let data: any = {};

            try {
                data = JSON.parse(responseText);
            } catch {
                console.error(
                    "Invalid JSON response:",
                    responseText
                );
            }

            if (!response.ok) {
                console.error(
                    "Enrollment API error:",
                    response.status,
                    data
                );

                toast.error(
                    data?.message ||
                    "Enrollment failed"
                );

                return;
            }

            /*
             * SUCCESS
             */
            if (data.status === true) {
                toast.success(
                    data.message ||
                    "Enrollment request sent!"
                );

                setIsEnrolled(true);

                setShowConfirmModal(false);
                setShowEnrollFormModal(false);
                setShowEnrollSuccessModal(true);

                return;
            }

            /*
             * ALREADY ENROLLED
             */
            if (
                typeof data.message === "string" &&
                data.message
                    .toLowerCase()
                    .includes("already")
            ) {
                toast.success(data.message);

                setIsEnrolled(true);

                setShowConfirmModal(false);
                setShowEnrollFormModal(false);
                setShowEnrollSuccessModal(true);

                return;
            }

            /*
             * API returned 200 but status false
             */
            toast.error(
                data.message ||
                "Enrollment failed"
            );
        } catch (error) {
            console.error(
                "Enrollment error:",
                error
            );

            toast.error(
                "Something went wrong while enrolling"
            );
        }
    };

    const handleCourseAction = () => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

            // Populate form with logged-in user
            setName(parsedUser.name || "");

            setEmail(parsedUser.email || "");

            setPhone(
                (
                    parsedUser.phonenumber ||
                    parsedUser.phone ||
                    ""
                )
                    .replace(/^\+?91/, "")
                    .trim()
            );

            if (isEnrolled) {
                router.push("/live-course-history");
                return;
            }

            setErrors({});
            setShowEnrollFormModal(true);
        } catch (error) {
            console.error(
                "User parse error:",
                error
            );

            router.push("/login");
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
                "Python for Data Science Foundations",
                "SQL for Data Science",
                "Statistics & Probability for Data Science",
                "NumPy & Pandas Essentials",
                "Exploratory Data Analysis & Visualization",
                "Feature Engineering & Data Preprocessing",
                "Introduction to Machine Learning",
                "Supervised Learning Algorithms",
                "Unsupervised Learning & Model Tuning",
                "Time Series Analysis",
                "Deep Learning Foundations",
                "Computer Vision & CNNs",
                "NLP & Sequence Models",
                "Generative AI & Large Language Models",
                "MLOps & Model Deployment",
                "Capstone Project",
            ],
        },
        2: {
            title: "Data Science",
            points: [
                "Introduction to Data Science",
                "Python for Data Science",
                "NumPy & Pandas",
                "Data Cleaning & Preprocessing",
                "Exploratory Data Analysis (EDA)",
                "Data Visualization with Matplotlib & Seaborn",
                "SQL for Data Analysis",
                "Statistics for Data Science",
            ],
        },
        3: {
            title: "Machine Learning",
            points: [
                "Introduction to Machine Learning",
                "Supervised Learning",
                "Unsupervised Learning",
                "Regression Algorithms",
                "Classification Algorithms",
                "Clustering Techniques",
                "Model Evaluation & Validation",
                "Feature Engineering",
            ],
        },
        4: {
            title: "AI & Deep Learning",
            points: [
                "Introduction to Deep Learning",
                "Artificial Neural Networks (ANN)",
                "Convolutional Neural Networks (CNN)",
                "Recurrent Neural Networks (RNN)",
                "Natural Language Processing (NLP)",
                "Generative AI & Large Language Models (LLMs)",
                "Model Deployment with Flask/FastAPI",
                "MLOps Basics",
                "Prompt Engineering",
                "AI Ethics & Responsible AI",
                "Real-world AI Applications",
                "Latest AI Tools & Trends",
            ],
        },
        5: {
            title: "Projects",
            points: [
                "Data Analysis Project",
                "Machine Learning Project",
                "Deep Learning Project",
                "End-to-End Data Science Capstone",
                "Resume & Portfolio Building",
                "Mock Interviews & Career Guidance",
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

    // const projects = [
    //     "/images/live-course/data-science/project-screen-1.svg",
    //     "/images/live-course/data-science/project-screen-2.svg",
    //     "/images/live-course/data-science/project-screen-3.svg",
    //     "/images/live-course/data-science/project-screen-1.svg",
    //     "/images/live-course/data-science/project-screen-2.svg",
    //     "/images/live-course/data-science/project-screen-3.svg",
    // ];
    const projects = [
        {
            screen: "/images/live-course/data-science/project-screen-1.svg",
            person: "/images/live-course/data-science/project-person-1.png",
            name: "Devi",
        },
        {
            screen: "/images/live-course/data-science/project-screen-2.svg",
            person: "/images/live-course/data-science/project-person-2.png",
            name: "Rahul",
        },
        {
            screen: "/images/live-course/data-science/project-screen-3.svg",
            person: "/images/live-course/data-science/project-person-3.png",
            name: "Priya",
        },
        {
            screen: "/images/live-course/data-science/project-screen-1.svg",
            person: "/images/live-course/data-science/project-person-1.png",
            name: "Devi",
        },
        {
            screen: "/images/live-course/data-science/project-screen-2.svg",
            person: "/images/live-course/data-science/project-person-2.png",
            name: "Rahul",
        },
        {
            screen: "/images/live-course/data-science/project-screen-3.svg",
            person: "/images/live-course/data-science/project-person-3.png",
            name: "Priya",
        },
    ];
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

    const partners = [
        "accenture.png",
        "tech-mahindra.png",
        "wipro.png",
        "tcs.png",
        "ibm.png",
        "infosys.png",
    ];

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
            {/* ================= CONFIRM ENROLLMENT MODAL ================= */}
            {showConfirmModal && (
                <div
                    className="modal fade show d-block"
                    style={{
                        background: "rgba(0,0,0,0.7)",
                        zIndex: 10002,
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div
                            className="modal-content border-0 shadow-lg"
                            style={{
                                borderRadius: "15px",
                            }}
                        >
                            <div className="modal-body text-center p-5">
                                <div className="mb-4">
                                    <i
                                        className="bi bi-question-circle-fill text-warning"
                                        style={{
                                            fontSize: "70px",
                                        }}
                                    ></i>
                                </div>

                                <h3 className="fw-bold mb-3">
                                    Confirm Enrollment
                                </h3>

                                <p className="text-muted mb-4">
                                    Are you sure you want to enroll in the{" "}
                                    <strong>
                                        Full Stack Web Development
                                    </strong>{" "}
                                    live program?
                                </p>

                                <div className="d-flex gap-3 justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 py-2"
                                        onClick={() =>
                                            setShowConfirmModal(false)
                                        }
                                        style={{
                                            borderRadius: "10px",
                                        }}
                                    >
                                        No, Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary px-4 py-2"
                                        onClick={confirmEnroll}
                                        style={{
                                            borderRadius: "10px",
                                            backgroundColor: "#22346b",
                                            border: "none",
                                        }}
                                    >
                                        Yes, Enroll Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ENROLLMENT SUCCESS MODAL ================= */}
            {showEnrollSuccessModal && (
                <div
                    className="modal fade show d-block"
                    style={{
                        background: "rgba(0,0,0,0.7)",
                        zIndex: 10001,
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div
                            className="modal-content border-0 shadow-lg"
                            style={{
                                borderRadius: "15px",
                            }}
                        >
                            <div className="modal-body text-center p-5">
                                <div className="mb-4">
                                    <i
                                        className="bi bi-check-circle-fill text-success"
                                        style={{
                                            fontSize: "70px",
                                        }}
                                    ></i>
                                </div>

                                <h3 className="fw-bold mb-3">
                                    Enrollment Successful!
                                </h3>

                                <p className="text-muted mb-4">
                                    Your request has been received. Would
                                    you like to view your live course
                                    history now?
                                </p>

                                <div className="d-flex gap-3 justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 py-2"
                                        onClick={() =>
                                            setShowEnrollSuccessModal(false)
                                        }
                                        style={{
                                            borderRadius: "10px",
                                        }}
                                    >
                                        Stay Here
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary px-4 py-2"
                                        onClick={() =>
                                            router.push(
                                                "/live-course-history"
                                            )
                                        }
                                        style={{
                                            borderRadius: "10px",
                                            backgroundColor: "#22346b",
                                            border: "none",
                                        }}
                                    >
                                        Go to History
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ENROLL FORM MODAL ================= */}
            {showEnrollFormModal && (
                <div
                    className="success_modal_overlay"
                    onClick={() => setShowEnrollFormModal(false)}
                >
                    <div
                        className="modalbox animate"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form
                            className="position-relative shadow-0"
                            onSubmit={handleEnroll}
                        >
                            <div className="d-flex position-relative justify-content-between align-items-center">
                                <h4 className="fw-bold mb-0">
                                    Enroll Now - Full Stack Web Development
                                </h4>

                                <button
                                    type="button"
                                    className="modal_close_icon border-0 bg-transparent"
                                    onClick={() =>
                                        setShowEnrollFormModal(false)
                                    }
                                    style={{
                                        cursor: "pointer",
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            {/* NAME */}
                            <div className="d-flex align-items-start flex-column w-100 my-3">
                                <label htmlFor="modal-name">
                                    Name
                                </label>

                                <input
                                    id="modal-name"
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    className={`form-control ${errors.name
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                />

                                {errors.name && (
                                    <span className="error-msg">
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            {/* PHONE */}
                            <div className="d-flex align-items-start flex-column w-100 my-3">
                                <label htmlFor="modal-phone">
                                    Phone Number
                                </label>

                                <input
                                    id="modal-phone"
                                    type="tel"
                                    name="phone"
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        )
                                    }
                                    className={`form-control ${errors.phone
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                />

                                {errors.phone && (
                                    <span className="error-msg">
                                        {errors.phone}
                                    </span>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div className="d-flex align-items-start flex-column w-100 my-3">
                                <label htmlFor="modal-email">
                                    Email
                                </label>

                                <input
                                    id="modal-email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    className={`form-control ${errors.email
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                />

                                <input
                                    type="hidden"
                                    name="lead_source"
                                    value="Website"
                                />

                                {errors.email && (
                                    <span className="error-msg">
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            {/* BUTTON */}
                            <div className="col-12 d-flex justify-content-center">
                                {isEnrolled ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                "/live-course-history"
                                            )
                                        }
                                    >
                                        Start Course
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                    >
                                        Enroll Now
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <section>
                <div className="inner_page_top_padd bg-black">
                    <div className="ds_top_sec">
                        <Image
                            src={`${BASE_IMAGE_URL}/live-course/data-science/banner-inner.png`}
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
                                            Launch Your Tech Career with Our AI and Machine Learning Course Online
                                        </h1>
                                        <p className="text-center text-white px-lg-4">
                                            Become a job-ready Data Scientist through live online training with AI-powered learning. Master Python, SQL, Statistics, Machine Learning, Deep Learning, and Generative AI with hands-on projects, model deployment, certification, and placement support.
                                        </p>
                                        <div className="d-flex gap-3 my-5 justify-content-center">
                                            <button
                                                onClick={
                                                    handleCourseAction
                                                }
                                            >
                                                {isEnrolled
                                                    ? "Start Course"
                                                    : "Enroll Now"}
                                            </button>
                                            <button>Book a free Demo Class</button>
                                        </div>
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
                                        <div className="row text-center justify-content-lg-evenly justify-content-center">
                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="mb-1 text-center text-white">
                                                        Weeks
                                                    </p>
                                                    <p className="fw-bold text-white mb-0 text-center">
                                                        12
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="mb-1 text-center text-white">
                                                        Total Hours
                                                    </p>
                                                    <p className="fw-bold text-white mb-0 text-center">
                                                        120 hrs
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="mb-1 text-center text-white">
                                                        Taught In
                                                    </p>
                                                    <p className="fw-bold text-white mb-0 text-center">
                                                        தமிழ்
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="mb-1 text-center text-white">
                                                        1:1
                                                    </p>
                                                    <p className="fw-bold text-white mb-0 text-center">
                                                        Doubt Sessions
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                <div className="d-flex justify-content-center align-items-center flex-column">
                                                    <p className="mb-1 text-center text-white">
                                                        Placement
                                                    </p>
                                                    <p className="fw-bold text-white mb-0 text-center">
                                                        Support
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-12 batch_info d-flex justify-content-center">
                                            <p className="mb-0 text-white">Next batch starts 15 June 2026 Only 5 seats remaining</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ds_carrer">
                            <div className="section_container">
                                <div className="row justify-content-center">
                                    <div className="col-lg-11 d-flex flex-column justify-content-center align-items-center">
                                        <div className="col-12 py-4 ">
                                            <div className="row w-100 m-auto justify-content-center">
                                                <div className="col-lg-8">
                                                    <h3 className="text-white fw-bold text-center">
                                                        Build a Booming Career with
                                                        <span className="text-c2">
                                                            {" "}Data Science and Machine Learning{" "}
                                                        </span>
                                                        Online Course
                                                    </h3>
                                                </div>
                                            </div>
                                            <p className="text-center small text-white">
                                                AI is making data science faster and smarter, and it's now one of the fastest-growing career fields in India. Salaries keep climbing, and hiring keeps growing. Available across Tamil Nadu, our program is one of the best online data science courses around, covering Python, SQL, statistics, machine learning, deep learning, NLP, MLOps, and modern AI tools like LLMs and RAG.. It's one of the most complete machine learning online courses you can take.
                                            </p>
                                            <div className="row w-100 m-auto justify-content-center">
                                                <div className="col-lg-10">
                                                    <div className="row w-100 m-auto">
                                                        <div className="col-lg-3 col-md-6 my-3">
                                                            <div className="h-100 ds_carrer_inner">
                                                                <p className="text-white mb-0 text-center">
                                                                    Data Powers Every Business
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-6 my-3">
                                                            <div className="h-100 ds_carrer_inner">
                                                                <p className="text-white mb-0 text-center">
                                                                    Powering the Future with AI
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-6 my-3">
                                                            <div className="h-100 ds_carrer_inner">
                                                                <p className="text-white mb-0 text-center">
                                                                    Demand Across Every Industry
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-6 my-3">
                                                            <div className="h-100 ds_carrer_inner">
                                                                <p className="text-white mb-0 text-center">
                                                                    Fast-Growing Salaries
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
                <div className="ds_course_overview">
                    <div className="section_container">
                        <div className="row w-100 m-auto justify-content-center">
                            <div className="col-lg-10">
                                <h3 className="text-white fw-bold text-center">
                                    Core Data Science
                                    <span className="text-c2"> Skills &amp; Tools </span>
                                    You’ll Master
                                </h3>
                            </div>

                            <div className="col-12">
                                <div className="skills-wrapper">
                                    {/* Left Skills */}
                                    <div className="skill-item l1">
                                        <p className="px-2 text-white mb-0">
                                            <span>Deep Learning (CNNs/RNNs)</span>
                                        </p>
                                    </div>

                                    <div className="skill-item l2">
                                        <p className="px-2 text-white mb-0">
                                            <span>LLMs &amp; Generative AI</span>
                                        </p>
                                    </div>

                                    <div className="skill-item l3">
                                        <p className="px-2 text-white mb-0">
                                            <span>Data Wrangling</span>
                                        </p>
                                    </div>

                                    <div className="skill-item l4">
                                        <p className="px-2 text-white mb-0">
                                            <span>SQL Querying</span>
                                        </p>
                                    </div>

                                    <div className="skill-item l5">
                                        <p className="px-2 text-white mb-0">
                                            <span>Data Visualization</span>
                                        </p>
                                    </div>

                                    {/* Center Image */}
                                    <div className="chair-wrapper">
                                        <Image
                                            src="/images/live-course/data-science/skill-chair.svg"
                                            className="chair-img"
                                            width={450}
                                            height={450}
                                            alt="Skills"
                                        />
                                    </div>

                                    {/* Right Skills */}
                                    <div className="skill-item r1">
                                        <p className="px-2 text-white mb-0">
                                            <span>Data Analytics</span>
                                        </p>
                                    </div>

                                    <div className="skill-item r2">
                                        <p className="px-2 text-white mb-0">
                                            <span>NumPy &amp; Pandas</span>
                                        </p>
                                    </div>

                                    <div className="skill-item r3">
                                        <p className="px-2 text-white mb-0">
                                            <span>Learning Algorithms</span>
                                        </p>
                                    </div>

                                    <div className="skill-item r4">
                                        <p className="px-2 text-white mb-0">
                                            <span>AI Model Deployment</span>
                                        </p>
                                    </div>

                                    <div className="skill-item r5">
                                        <p className="px-2 text-white mb-0">
                                            <span>Time Series Forecasting</span>
                                        </p>
                                    </div>

                                </div>
                            </div>
                            <div className="col-lg-8">
                                <Image src={"/images/live-course/data-science/ds-tools.svg"}
                                    className="w-100 h-auto"
                                    width={500}
                                    height={500}
                                    alt="" />
                            </div>

                        </div>
                    </div>
                </div>
                {/* <div className="ds_career_outcome">
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
                                                src={`${BASE_IMAGE_URL}/live-course/data-science/ds-career-roles.png`}
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
                                            src={`${BASE_IMAGE_URL}/live-course/data-science/salary-insight-globe.png`}
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
                </div> */}
                <div className="modules_sec">
                    <div className="section_container py-5">
                        <div className="row w-100 m-auto justify-content-center">
                            <div className="col-lg-8">
                                <h3 className="text-black fw-bold text-center">
                                    Complete Machine Learning &
                                    <span className="text-c2">{" "}Data Science Course{" "}</span>
                                    Curriculum
                                </h3>
                            </div>
                            <div className="col-lg-10">
                                <p className="text-center">
                                    Our AI and Data Science Course is built around 16 progressive modules where every week stacks on the last. You move from Statistical Analysis foundations to Artificial Intelligence systems without gaps, with hands-on projects along the way and a final Capstone Project that becomes part of your portfolio.
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
                    <div className="genai_section pt-5">
                        <div className="section_container">
                            <div className="row justify-content-center">
                                <div className="col-lg-8">
                                    <h3 className="text-center text-black fw-bold mt-md-5 mb-lg-5">
                                        GenAI Modules in Our
                                        <span className="text-c2">
                                            {" "}Data Science and AI Course Online{" "}
                                        </span>
                                        with Certificate
                                    </h3>
                                </div>
                            </div>

                            <div className="row g-5 justify-content-center w-100 m-auto">
                                {/* Left */}
                                <div className="col-lg-5">

                                    <div className="timeline-item">
                                        <div className="timeline-icon">
                                            <Image src={"/images/live-course/data-science/deep-learning.png"} className="w-auto h-auto" width={40} height={40} alt="" />
                                        </div>
                                        <div className="timeline-content">
                                            <h5>Deep Learning Foundations</h5>
                                            <p>
                                                Build neural networks with TensorFlow/Keras and PyTorch , covering perceptrons , activations, and backpropagation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="timeline-item">
                                        <div className="timeline-icon">
                                            <Image src={"/images/live-course/data-science/nlp.png"} width={40} height={40} alt="" />
                                        </div>
                                        <div className="timeline-content">
                                            <h5>NLP & Sequence Models</h5>
                                            <p>
                                                Understand text with RNNs, LSTMs, and word embeddings, the base for chatbots and search.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                                {/* Right */}
                                <div className="col-lg-5">

                                    <div className="timeline-item">
                                        <div className="timeline-icon">
                                            <Image src={"/images/live-course/data-science/computer-vision.png"} className="w-auto h-auto" width={40} height={40} alt="" />
                                        </div>
                                        <div className="timeline-content">
                                            <h5>Computer Vision & CNNs</h5>
                                            <p>
                                                Master Online Teach machines to see using CNNs, image preprocessing, and Transfer Learning..
                                            </p>
                                        </div>
                                    </div>

                                    <div className="timeline-item">
                                        <div className="timeline-icon">
                                            <Image src={"/images/live-course/data-science/generative-ai.png"} className="w-auto h-auto" width={40} height={40} alt="" />
                                        </div>
                                        <div className="timeline-content">
                                            <h5>Generative AI & LLMs</h5>
                                            <p>
                                                Explore transformers, prompt engineering, LLM fine-tuning, and RAG with vector databases.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="career_path_parent">
                        <div className="section_container py-5">
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-lg-8">
                                    <h2 className="text-white fw-bold text-center">
                                        Job
                                        <span className="text-c2">{" "}Roles and Salary{" "}</span>
                                        After Our Best Online Data Science Course
                                    </h2>
                                </div>
                                <div className="row mt-4">
                                    <div className="col-md-4 d-flex flex-column justify-content-end  align-items-center my-3 my-lg-0">
                                        <div className="d-flex align-items-end justify-content-center align-items-center">
                                            <Image src={"/images/live-course/data-science/person-1.svg"} className="w-100 h-auto" width={400} height={400} alt="" />
                                        </div>
                                        <div className="career_path_inner">
                                            <p className="mb-2 text-white text-center fw-bold">Junior Data Analyst</p>
                                            <p className="mb-0 text-center text-white small">
                                                ₹4 – 10 LPA <br />
                                                Start with entry-level careers, turning data into dashboards and reports using SQL, Matplotlib, Seaborn, and Plotly.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-4 d-flex flex-column justify-content-end  align-items-center my-3 my-lg-0">
                                        <div className="d-flex align-items-end justify-content-center align-items-center">
                                            <Image src={"/images/live-course/data-science/person-2.svg"} className="w-100 h-auto" width={400} height={400} alt="" />
                                        </div>
                                        <div className="career_path_inner">
                                            <p className="mb-2 text-white text-center fw-bold">Junior Data Analyst</p>
                                            <p className="mb-0 text-center text-white small">
                                                ₹4 – 10 LPA <br />
                                                Start with entry-level careers, turning data into dashboards and reports using SQL, Matplotlib, Seaborn, and Plotly.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-4 d-flex flex-column justify-content-end  align-items-center my-3 my-lg-0">
                                        <div className="d-flex align-items-end justify-content-center align-items-center">
                                            <Image src={"/images/live-course/data-science/person-3.svg"} className="w-100 h-auto" width={400} height={400} alt="" />
                                        </div>
                                        <div className="career_path_inner">
                                            <p className="mb-2 text-white text-center fw-bold">Junior Data Analyst</p>
                                            <p className="mb-0 text-center text-white small">
                                                ₹4 – 10 LPA <br />
                                                Start with entry-level careers, turning data into dashboards and reports using SQL, Matplotlib, Seaborn, and Plotly.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="ds_journey mb-md-5">
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
                            <div className="pb-lg-5 pt-md-5">
                                <div className="section_container">
                                    <div className="row justify-content-center mb-lg-5 mb-3">
                                        <div className="col-lg-7">
                                            <h3 className="text-white text-center fw-bold">
                                                Live Industry Projects in Our
                                                <span className="text-c2">
                                                    {" "}AI and Data Science Course
                                                </span>
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="project-showcase overflow-hidden">
                                        <div className="row">
                                            <div className="col-lg-4 d-flex justify-content-center align-items-center">
                                                {/* Left Person */}
                                                <div className="mentor-wrapper">
                                                    <div className="mentor-card">
                                                        <img
                                                            src={projects[activeIndex].person}
                                                            className="mentor-img"
                                                            alt=""
                                                        />
                                                        <div className="mentor-name">
                                                            {projects[activeIndex].name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-8">
                                                {/* Right Swiper */}
                                                <div className="project-slider">
                                                    <Swiper
                                                        modules={[Pagination, Autoplay]}
                                                        centeredSlides
                                                        loop
                                                        slidesPerView={1.3}
                                                        spaceBetween={-120}
                                                        pagination={{ clickable: true }}
                                                        autoplay={{
                                                            delay: 2500,
                                                            disableOnInteraction: false,
                                                        }}
                                                        onSlideChange={(swiper) => {
                                                            setActiveIndex(swiper.realIndex);
                                                        }}
                                                        breakpoints={{
                                                            768: {
                                                                slidesPerView: 1,
                                                            },
                                                            992: {
                                                                slidesPerView: 2.1,
                                                            },
                                                        }}
                                                        className="projectSwiper py-3"
                                                    >
                                                        {projects.map((item, index) => (
                                                            <SwiperSlide key={index}>
                                                                <div className="project-card">
                                                                    <img src={item.screen} className="w-100 h-auto" alt="" />
                                                                </div>
                                                            </SwiperSlide>
                                                        ))}
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
                <div className="placement_sec">
                    <div className="pb-lg-5 pt-5">
                        <div className="section_container">
                            <div className="row justify-content-center mb-lg-5">
                                <div className="col-lg-7">
                                    <h3 className="text-black text-center fw-bold">
                                        <span className="text-c2">
                                            {" "}Get Hired{" "}
                                        </span>
                                        with Our
                                        <span className="text-c2">
                                            {" "}AI and Data Science{" "}
                                        </span>
                                        Course with Placement
                                    </h3>
                                </div>
                                <div className="placement_sec_image d-flex justify-content-center align-items-center mt-5 position-relative">
                                    <Image src={"/images/live-course/data-science/placement-puzzle.svg"}
                                        width={500}
                                        height={500}
                                        alt="" />
                                    <div className="placement_sec_content">
                                        <div className="placement_sec_cont_child one">
                                            <p className="fw-bold mb-2">Resume Building</p>
                                            <p className="small mb-0">
                                                Build a recruiter-ready Data Scientist resume in the Best Data Science Course Online, with Python, ML, and AI portfolio.
                                            </p>
                                        </div>
                                        <div className="placement_sec_cont_child two">
                                            <p className="fw-bold mb-2">Mock Assessments</p>
                                            <p className="small mb-0">
                                                Practice Python, SQL, ML coding, and system design rounds with mentors from real Data Scientist interviews.
                                            </p>
                                        </div>
                                        <div className="placement_sec_cont_child three">
                                            <p className="fw-bold mb-2">Hiring Partner Network</p>
                                            <p className="small mb-0">
                                                Never job-hunt alone. Direct referrals for Data Analyst, Data Scientist, ML Engineer, and AI Engineer roles.
                                            </p>
                                        </div>
                                        <div className="placement_sec_cont_child four">
                                            <p className="fw-bold mb-2">Interview Preparation</p>
                                            <p className="small mb-0">
                                                Master statistics, ML algorithms, ML system design, and Python through prep packs and Doubt Resolution support.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="details_bottom_part">
                    <div className="skill_parent">
                        <div className="section_container py-5">
                            <div>
                                <div className="pb-5 logo_swiper mern_partner">
                                    <div className="text-center">
                                        <h2 className="text-white fw-bold text-center">
                                            Trusted by
                                            <span className="text-c2">{" "}Top Hiring{" "}</span>
                                            Partners
                                        </h2>
                                        <Swiper
                                            className="pt-3"
                                            modules={[Autoplay]}
                                            spaceBetween={30}
                                            slidesPerView={5}
                                            speed={3000}
                                            autoplay={{
                                                delay: 0,
                                                disableOnInteraction: false,
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
                                            {partners.map((logo, index) => (
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
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-lg-9 mt-3">
                                    <h2 className="text-white fw-bold text-center">
                                        Real Stories from the
                                        <span className="text-c2">{" "}Best Online Classes for Data Science{" "}</span>
                                    </h2>
                                </div>
                                <div className="ds_stories">
                                    <div className="row w-100 m-auto justify-content-center">
                                        <div className="col-lg-6 position-relative ds_stories_parent_main">
                                            <Image
                                                src={`${BASE_IMAGE_URL}/live-course/data-science/skill-stories-1.png`}
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
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ds_certification pt-5">
                                <div className="section_container">
                                    <div className="row w-100 m-auto justify-content-center">
                                        <div className="col-lg-8">
                                            <h3 className="text-white text-center fw-bold pb-4">
                                                Earn a Recognized Online
                                                <span className="text-c2">
                                                    {" "}Data Science and AI{" "}
                                                </span>
                                                Course with Certificate
                                            </h3>
                                        </div>

                                        <div className="col-lg-10">
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
                                                                src={`${BASE_IMAGE_URL}/live-course/data-science/ds-certificate.png`}
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
                        </div>
                    </div>
                    <div className="section_container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <h3 className="text-white text-center fw-bold pb-4">
                                    <span className="text-c2">
                                        Upcoming{" "}
                                    </span>
                                    Data Science and Machine Learning
                                    <span className="text-c2">
                                        {" "}Online Training{" "}
                                    </span>
                                    Batches
                                </h3>
                            </div>
                        </div>
                        <div className="row justify-content-center w-100 m-auto">
                            <div className="col-lg-9">
                                <div className="row justify-content-center batch_parent">
                                    <div className="col-md-6 my-4">
                                        <div className="batch_child">
                                            <h4 className="text-white fw-bold text-center">Weekday Batch</h4>
                                            <div>
                                                <p className="text-white small">Monday - Friday</p>
                                                <p className="text-white small">4 Month / 160 Hours <br /> (include Doubt Clearing)</p>
                                                <p className="text-white small">Session Recordings Included</p>
                                            </div>
                                            <div className="col-12 d-flex justify-content-center">
                                                <button>Enroll In Weekday Batch</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 my-4">
                                        <div className="batch_child">
                                            <h4 className="text-white fw-bold text-center">Weekend Batch</h4>
                                            <div>
                                                <p className="text-white small">Saturday – Sunday</p>
                                                <p className="text-white small">5 Months / 160 Hours <br /> (include Doubt Clearing)</p>
                                                <p className="text-white small">Session Recordings Included</p>
                                            </div>
                                            <div className="col-12 d-flex justify-content-center">
                                                <button>Enroll In Weekend Batch</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 ">
                                        <div className="row batch_child mt-lg-5 mt-4 mb-4">
                                            <div className="col-lg-6 d-flex align-items-center">
                                                <div>
                                                    <h5 className="text-white fw-bold">Self-Paced</h5>
                                                    <p className="text-white">Learn at your own schedule </p>
                                                    <p className="text-white small mb-0">Prefer to learn on your own time? Get the full recorded course with lifetime access.</p>

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
                    <div className="section_container">
                        <div className="py-5 price_section_parent_top">
                            <div className="text-center d-flex justify-content-center pb-5 pb-lg-0">
                                <div className="row w-100 justify-content-center">
                                    <div className="col-lg-6  d-flex justify-content-center ">
                                        <div className="parent_price">
                                            <div className="price_section d-flex flex-column align-items-center justify-content-center px-2 px-lg-4 py-4">
                                                {/* PRICE TABS */}
                                                <h3 className="fw-bold mb-3 text-white px-3 px-lg-0">
                                                    Affordable Pricing for Our Data Science Online Course
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
                                                                    • Lifetime Material Access
                                                                </li>
                                                                <li>
                                                                    • Portfolio-Ready Projects
                                                                </li>
                                                                <li>
                                                                    • Mentor-Led Support
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="col-6">
                                                            <ul className="list-unstyled">
                                                                <li>
                                                                    • Structured Full Stack Roadmap
                                                                </li>
                                                                <li>
                                                                    • Career & Placement Guidance
                                                                </li>
                                                                <li>
                                                                    • Certificate Of Completion
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
                <section className="faq_section pt-5 pt-lg-0 pb-5">
                    <div className="section_container p-xl text-center mt-lg-5">
                        <h3 className="section_base_heading text-black pt-5">
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
                                                <div className="faq_answer text-black">
                                                    {item.answer}
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <section className="ds_cta position-relative">
                        <Image src={"/images/live-course/data-science/cta-person.png"} className="ds_cta_person" width={3000} height={500} alt="" />
                        <Image src={"/images/live-course/data-science/cta-banner.svg"} className="ds_cta_lg w-100 h-auto" style={{ objectFit: 'cover' }} width={3000} height={500} alt="" />
                        <div className="section_container">
                            <div className="row justify-content-center align-items-center w-100 m-auto">
                                <div className="ds_cta_inner mt-lg-5">
                                    <h3 className="fw-bold text-black text-lg-start text-center">Start Your Online AI Machine Learning Course Today</h3>
                                    <p className="small lh-lg text-black text-lg-start text-center">Stop researching. Start enrolling. Join the Best Data Science Program Online Live, kick off with Introduction to Python, and graduate as a Data Scientist or AI Engineer.</p>
                                    <div className="ds_cta_button col-12 d-flex justify-content-center gap-3">
                                        <button>Enroll Now</button>
                                        <button>Talk to Counsellors</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>
            </section>
        </>
    );
}