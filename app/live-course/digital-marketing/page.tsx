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
    const [courseId] = useState(3);
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
                "Digital Marketing Foundations",
                "Website & WordPress",
                "SEO On - Page & Keyword Research",
                "SEO Off - Page & Technical SEO ",
                "Google Ads: Search & Display",
                "Google Ads: Advanced & Automation",
                "Social Media Marketing",
                "Content, Copywriting & Email Marketing",
                "Google Analytics 4 & Looker Studio",
                "E - Commerce & Affiliate Marketing",
                "AI Strategy, CRO & Omnichannel",
                "Freelancing, Portfolio & Capstone",
            ],
        },
        2: {
            title: "Marketing Foundations",
            points: [
                "Introduction to Digital Marketing",
                "Marketing Funnel & Customer Journey",
                "Brand Positioning & Target Audience",
                "Content Marketing Fundamentals",
                "Social Media Marketing Basics",
                "SEO & Keyword Research",
                "Email Marketing Essentials",
                "Marketing Analytics & KPIs",
            ],
        },
        3: {
            title: "Channels & Career",
            points: [
                "Google Search & Display Ads",
                "Meta (Facebook & Instagram) Marketing",
                "LinkedIn & YouTube Marketing",
                "WhatsApp & Email Campaigns",
                "Freelancing & Personal Branding",
                "Resume & Portfolio Building",
                "Interview Preparation",
                "Career Opportunities in Digital Marketing",
            ],
        },
        4: {
            title: "AI Sessions",
            points: [
                "Introduction to AI in Marketing",
                "Using ChatGPT for Content Creation",
                "AI for SEO & Keyword Research",
                "AI-Powered Social Media Strategies",
                "AI Image & Video Generation",
                "AI Tools for Email Marketing",
                "Marketing Automation with AI",
                "Prompt Engineering for Marketers",
                "AI Analytics & Performance Insights",
                "Ethical Use of AI in Marketing",
                "Hands-on AI Marketing Projects",
                "Latest AI Tools & Trends",
            ],
        },
        5: {
            title: "Projects",
            points: [
                "Live Marketing Campaign",
                "SEO Audit Project",
                "Social Media Content Calendar",
                "Google Ads Campaign",
                "Meta Ads Campaign",
                "Capstone Marketing Project",
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
            question: "Is digital marketing a good career? ",
            answer: (
                <>
                    <p>
                        Yes, it's one of the fastest-growing careers today. With AI changing every channel, AI-skilled marketers are in even higher demand. Velearn prepares you for this future-proof career.
                    </p>
                </>
            ),
        },
        {
            question: "What is the difference between SEO and paid ads?",
            answer: (
                <>
                    <p>
                        SEO (Search Engine Optimization) focuses on improving your
                        website's organic ranking on search engines like Google. It
                        takes time to build results but provides long-term, sustainable
                        traffic without paying for every click. Paid ads, on the other
                        hand, deliver immediate visibility by placing your business at
                        the top of search results or social media platforms through
                        advertising budgets. Both strategies are important and are
                        covered in this course.
                    </p>
                </>
            ),
        },
        {
            question: "Which platform is best for running ads?",
            answer: (
                <>
                    <p>
                        The best advertising platform depends on your business goals
                        and target audience. Google Ads is ideal for capturing users
                        actively searching for products or services, while Meta Ads
                        (Facebook & Instagram) are excellent for brand awareness,
                        engagement, and lead generation. During the course, you'll
                        learn how to choose the right platform and create effective ad
                        campaigns for different business needs.
                    </p>
                </>
            ),
        },
        {
            question: "Do you provide placement support after the course?",
            answer: (
                <>
                    <p>
                        Yes. We provide placement assistance to eligible students after
                        course completion. This includes resume building, portfolio
                        guidance, mock interviews, career mentoring, and job referral
                        support to help you prepare for digital marketing roles.
                    </p>
                </>
            ),
        },
        {
            question: "Will I get a certificate after completing the course?",
            answer: (
                <>
                    <p>
                        Yes. Upon successfully completing the Digital Marketing course,
                        you will receive a course completion certificate that validates
                        your skills and can be added to your resume, LinkedIn profile,
                        and professional portfolio.
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
            image: "student-1.png",
            name: "Vijay",
            text: "The live sessions were practical and easy to follow. I can confidently plan and run real digital marketing campaigns now.",
            colorOne: "#FFA700",
            colorTwo: "#73737300",
        },
        {
            image: "student-2.png",
            name: "Shalini",
            text: "I joined with zero marketing knowledge. The trainer explained everything clearly and helped me apply it in real projects.",
            colorOne: "#FF974B",
            colorTwo: "#73737300",
        },
        {
            image: "student-3.png",
            name: "Surya",
            text: "I joined with zero marketing knowledge. The trainer explained everything clearly and helped me apply it in real projects.",
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
                <div className="dm_main pb-1">
                    <div className="bg-white dm_top_sec">
                        <div className="digital_marketing_banner pb-3">
                            <div className="section_container">
                                <div className="row justify-content-lg-between justify-content-center   ">
                                    <div className="col-lg-7">
                                        <div className="banner_left_dm">
                                            <h1 className="fw-bold text-white">
                                                Live
                                                <span className="text-c2">
                                                    {" "}Digital Marketing{" "}
                                                </span>
                                                Online Course with AI Integration
                                            </h1>
                                            <p className="text-white mt-4">
                                                Learn Digital Marketing through live online sessions with AI-powered tools, real projects, and mentor guidance. The course covers SEO, Social Media Marketing, Google Ads, Content Marketing, and Analytics.
                                            </p>
                                            <div className="d-flex gap-2 justify-content-lg-start justify-content-center">
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
                                            <div className="pagination_parent d-lg-flex d-none">
                                                <Link href={"/"}>Home</Link>
                                                <span className="px-2"> /</span>
                                                <Link href={"/live-course"}>
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
                                    <div className="col-lg-12 mt-5">
                                        <p className="text-center text-white mb-0">
                                            Next Batch starts 15 June 2026 only 5 seats Remaining
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="banner_details">
                            <div className="section_container">
                                <div className="col-12 d-flex justify-content-lg-start justify-content-center">
                                    <div className="col-lg-12">
                                        <div className="ms-lg-5 ms-2 py-3">
                                            <div className="row text-center justify-content-lg-evenly justify-content-center">
                                                <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            Weeks
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            12
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            Total Hours
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            120 hrs
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            Taught In
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            தமிழ்
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            1:1
                                                        </p>
                                                        <p className="mb-0 text-center">
                                                            Doubt Sessions
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-lg-2 mb-3 mb-lg-0 banner_details_list d-flex justify-content-center border-0">
                                                    <div className="d-flex justify-content-center align-items-center flex-column">
                                                        <p className="fw-bold mb-1 text-center">
                                                            Placement
                                                        </p>
                                                        <p className="mb-0 text-center">
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
                        <div className="why_dm_sec py-5">
                            <div className="section_container">
                                <h3 className="text-center fw-bold text-white">
                                    Why Digital Marketing With AI Is the New Career Standard
                                </h3>
                                <p className="text-center mb-0 lh-lg small mt-3 text-white">
                                    Digital marketing is going through its biggest shift since the rise of social media. Generative AI tools like ChatGPT, Gemini, and Perplexity are now part of every marketer's day, from keyword research and content creation to digital advertising and email campaigns. Our live online training reaches learners across Tamil Nadu, helping them combine modern digital marketing tools with AI to run real-world marketing campaigns that deliver results.
                                </p>
                                <div className="row justify-content-lg-start justify-content-center mt-5">
                                    <div className="col-lg-9">
                                        <div className="row">
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        One of the fastest-growing career fields today
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Every business needs digital marketers to grow online
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Hiring booming across SEO, ads, social, and email
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        Companies prefer marketers with AI tools experience
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 my-3">
                                                <div className="why_dm_sub">
                                                    <p>
                                                        AI is rewriting how marketing strategies are built
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
                        <div className="dm_tools_sec">
                            <div className="section_container">
                                <h2 className="fw-bold text-white text-center py-5">
                                    Skills & AI Tools You Need for Digital Marketing
                                </h2>
                                <div className="position-relative">
                                    <div className="tools_top_parent">
                                        <div className="row justify-content-center">
                                            <div className="col-lg-12 px-lg-5">
                                                <div className="row justify-content-center text-white">
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner one">
                                                            <p>SEO (Search Engine Optimization)</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner two">
                                                            <p>Google Ads and paid campaigns</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner three">
                                                            <p>Meta Ads (Facebook & Instagram)</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner four">
                                                            <p>Social media growth and content</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row justify-content-center text-white">
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner five">
                                                            <p>Copywriting and content marketing</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner six">
                                                            <p>Email marketing and automation</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner seven">
                                                            <p>WordPress website building</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row justify-content-center text-white">
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner eight">
                                                            <p>Google Analytics and CRO</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="tools_points_inner nine">
                                                            <p>AI-powered marketing workflows</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="image_parent">
                                        <Image src={"/images/live-course/digital-marketing/dm-tools.svg"} height={400} width={1500} className="w-100 h-auto" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >
            <section>
                <div className="bg-white pt-0 dm_single_sec bg-white">
                    <div className="dm_path mt-2">
                        <div className="section_container pt-3 pb-lg-5">
                            <div className="dm_modules_parent">
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    Full Curriculum of Our
                                    <span className="text-c2">
                                        {" "}
                                        Digital Marketing
                                        {" "}
                                    </span>
                                    Online Training
                                </h3>
                                <div className="row justify-content-center">
                                    <div className="col-lg-11">
                                        <p className="text-black text-center px-lg-5">
                                            Our 90-day curriculum covers every essential channel of modern digital marketing, from our WordPress online course and SEO course online modules to Google Ads, social media, and AI-integrated workflows. Every module is hands-on, project-based, and built on real-world case studies so you build practical skills you can use from day one.
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
                            <div className="my-5 dm_ways_main">
                                <div className="row w-100 m-auto justify-content-center">
                                    <div className="col-lg-8">
                                        <h3 className="text-black text-center fw-bold">
                                            Dedicated Sessions in Our Digital Marketing With AI Course
                                        </h3>
                                    </div>
                                    <div className="col-12 ">
                                        <div className="col-lg-10">
                                            <div className="d-flex dm_way_points_card_parent justify-content-between">
                                                <div className="dm_way_points_parent my-3 d-flex justify-content-lg-start justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6 className="fw-bold">
                                                            AI Foundations
                                                        </h6>
                                                        <p className="mb-0">
                                                            Get hands-on with ChatGPT, Gemini, and Copilot, the foundational AI tools for digital marketing research, strategy, and competitor analysis.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex justify-content-lg-start justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6 className="fw-bold">
                                                            AI SEO Tools
                                                        </h6>
                                                        <p className="mb-0">
                                                            Speed up content creation with SurferSEO, Frase, NeuronWriter, and ChatGPT.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex justify-content-lg-start justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6 className="fw-bold">
                                                            AI Google Ads
                                                        </h6>
                                                        <p className="mb-0">
                                                            Build Performance Max creatives, use Smart Bidding, and reach the right target audience with AI.
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
                                                        <h6 className="fw-bold">
                                                            AI for Websites
                                                        </h6>
                                                        <p className="mb-0">
                                                            Use AI to write landing page copy, build pages with Divi AI, and analyze user behaviour.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex flex-column justify-content-lg-end justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6 className="fw-bold">
                                                            AI Technical SEO
                                                        </h6>
                                                        <p className="mb-0">
                                                            Generate structured data code and interpret site audits using ChatGPT and AI workflows.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dm_way_points_parent my-3 d-flex flex-column justify-content-lg-end justify-content-center">
                                                    <div className="dm_way_points">
                                                        <h6 className="fw-bold">
                                                            AI Ads Automation
                                                        </h6>
                                                        <p className="mb-0">
                                                            Automate Google Ads scripts and run AI-powered data analysis on search terms and bids.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <button
                                        type="button"
                                        onClick={handleCourseAction}
                                    >
                                        {isEnrolled
                                            ? "Start Course"
                                            : "Start Learning"}
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dm_career_path_parent">
                        <div className="section_container pt-5">
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-lg-8">
                                    <h3 className="text-center fw-bold text-white">
                                        Top Career Paths Through Our Online
                                        <span className="text-c2">{" "}Digital Marketing Courses</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-5 d-flex align-items-center justify-content-center">
                                    <Image src={"/images/live-course/digital-marketing/career-path-element.svg"}
                                        className="w-100 h-auto ms-lg-0 ms-5" height={400} width={400} alt="" />
                                </div>
                                <div className="col-lg-7 py-lg-5 d-flex align-item-center">
                                    <div className="row py-lg-5 py-3 text-white">
                                        <div className="col-lg-4 d-flex align-items-end my-3 my-lg-0">
                                            <div>
                                                <p className="fw-bold">Junior Digital Marketing Executive</p>
                                                <div className="career_package_child one">
                                                    <div>
                                                        <p className="text-white">₹3 – 15 LPA</p>
                                                        <p className="small mb-0">
                                                            Starts building practical experience by supporting campaigns, learning Search Engine Optimization, and using essential AI Tools.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 d-flex align-items-end my-3 my-lg-0">
                                            <div>
                                                <p className="fw-bold">Junior Digital Marketing Executive</p>
                                                <div className="career_package_child two">
                                                    <div>
                                                        <p className="text-white">₹3 – 15 LPA</p>
                                                        <p className="small mb-0">
                                                            Starts building practical experience by supporting campaigns, learning Search Engine Optimization, and using essential AI Tools.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 d-flex align-items-end my-3 my-lg-0">
                                            <div>
                                                <p className="fw-bold">Junior Digital Marketing Executive</p>
                                                <div className="career_package_child three">
                                                    <div>
                                                        <p className="text-white">₹3 – 15 LPA</p>
                                                        <p className="small mb-0">
                                                            Starts building practical experience by supporting campaigns, learning Search Engine Optimization, and using essential AI Tools.
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
                    <div className="dm_from_start_sec">
                        <div className="from_start_sec py-5">
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-lg-7">
                                        <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                            Transform
                                            <span className="text-c2">
                                                {" "}
                                                Your Career{" "}
                                            </span>
                                            With Velearn's Digital Marketing Online Courses
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
                    </div>

                    <div className="dm_project_parent">
                        <div className="section_container px-0 py-5">
                            <div className="row w-100 m-auto justify-content-center">
                                <h3 className="text-white text-center fw-bold text-white">
                                    Real-Time Projects You'll Build in This Course
                                </h3>
                            </div>
                            <div className="row w-100 m-auto justify-content-center">
                                <div className="col-lg-6 mt-3">
                                    <Image src={"/images/live-course/digital-marketing/project-snap-dm.svg"}
                                        className="w-100 h-auto"
                                        height={400}
                                        width={700}
                                        alt="" />
                                </div>
                            </div>
                            <div className="pt-5 w-100 m-auto">
                                <div className="row justify-content-center">
                                    <div className="col-lg-7">
                                        <h3 className="text-center fw-bold text-white">
                                            Rated Among the Best Online Digital Marketing Courses
                                        </h3>
                                    </div>
                                </div>
                                <div className="testimonial_section mt-4 pb-0">
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
                            <div>
                                <div className="row justify-content-center">
                                    <div className="col-lg-7">
                                        <h3 className="text-center fw-bold text-white mb-3">
                                            Get Hired With Our Digital Marketing
                                            <span className="text-c2">
                                                {" "}
                                                Course Online With Placement
                                            </span>{" "}
                                        </h3>
                                    </div>
                                </div>
                                <div className="col-12" ref={containerRef}>
                                    <div className="row justify-content-center">
                                        <div className="col-lg-5">
                                            <div className="d-flex dm_skill_path">
                                                <div className="row justify-content-center w-100 m-auto">
                                                    <div className="cards-box">
                                                        <div className="card one">
                                                            <div className="row align-items-center">
                                                                <div className="col-2">
                                                                    <Image src={"/images/live-course/digital-marketing/process-1.png"}
                                                                        className="w-100 h-auto"
                                                                        height={100}
                                                                        width={100}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="col-10">
                                                                    <div>
                                                                        <p className="fw-bold">
                                                                            Resume & Portfolio Review
                                                                        </p>
                                                                    </div>
                                                                    <p className="small">
                                                                        Placement support starts with personalized resume and case study portfolio feedback.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card two">
                                                            <div className="row align-items-center">
                                                                <div className="col-2">
                                                                    <Image src={"/images/live-course/digital-marketing/process-2.png"}
                                                                        className="w-100 h-auto"
                                                                        height={100}
                                                                        width={100}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="col-10">
                                                                    <div>
                                                                        <p className="fw-bold">
                                                                            LinkedIn Profile Optimization
                                                                        </p>
                                                                    </div>
                                                                    <p className="small">
                                                                        Build a recruiter-ready LinkedIn profile that powers your career in digital marketing.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card three">
                                                            <div className="row align-items-center">
                                                                <div className="col-2">
                                                                    <Image src={"/images/live-course/digital-marketing/process-3.png"}
                                                                        className="w-100 h-auto"
                                                                        height={100}
                                                                        width={100}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="col-10">
                                                                    <div>
                                                                        <p className="fw-bold">
                                                                            Mock Interviews & Mentorship
                                                                        </p>
                                                                    </div>
                                                                    <p className="small">
                                                                        One-on-one mock interviews with mentors sharing real-world tools and techniques.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card four">
                                                            <div className="row align-items-center">
                                                                <div className="col-2">
                                                                    <Image src={"/images/live-course/digital-marketing/process-4.png"}
                                                                        className="w-100 h-auto"
                                                                        height={100}
                                                                        width={100}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="col-10">
                                                                    <div>
                                                                        <p className="fw-bold">
                                                                            Hiring Partner Network
                                                                        </p>
                                                                    </div>
                                                                    <p className="small">
                                                                        Direct introductions to marketing teams hiring our online digital marketing courses graduates.
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

                    <div className="dm_from_start_sec logo_swiper py-3">
                        <div className="section_container">
                            <div>
                                <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                    Trusted by
                                    <span className="text-c2">
                                        {" "}Top Hiring{" "}
                                    </span>
                                    Partners
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
                            <div className="row justify-content-center">
                                <div className="col-lg-9">
                                    <h3 className="text-black text-center fw-bold px-3 lh-sm">
                                        Boost Your Resume With a Digital Marketing Online Course With Certificate
                                    </h3>
                                </div>
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-lg-10 mt-4">
                                    <div className="row">
                                        <div className="col-lg-6 d-flex flex-column justify-content-center">
                                            <div className="mb-2">
                                                <h5 className="text-black fw-bold mb-3">
                                                    Validate Your Achievement
                                                </h5>
                                                <p className="text-black mb-4">
                                                    Earn an industry-recognized professional certificate that proves your hands-on skills in SEO, ads, social, content, and AI marketing, trusted across our online digital marketing courses.
                                                </p>
                                            </div>
                                            <div className="mb-2">
                                                <h5 className="text-black fw-bold mb-3">
                                                    Build a Professional Skill Portfolio
                                                </h5>
                                                <p className="text-black mb-4">
                                                    Pair your certificate with real-world case studies and AI-powered workflows, a portfolio that wins interviews and freelance projects.
                                                </p>
                                            </div>
                                            <div className="mb-2">
                                                <h5 className="text-black fw-bold mb-3">
                                                    Share Your Success
                                                </h5>
                                                <p className="text-black mb-4">
                                                    Add your certificate to LinkedIn, resume, and freelance profiles, and boost your career in digital marketing instantly.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 d-flex align-items-center justify-content-center">
                                            <div className=" d-flex align-items-center justify-content-center">
                                                <div className="col-lg-10">
                                                    <Image
                                                        src={`/images/details-page/certificate.png`}
                                                        className="w-100 h-auto="
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
                            <div className="py-5">
                                <div className="section_container px-0">
                                    <div className="row justify-content-center">
                                        <div className="col-lg-12">
                                            <h3 className="fw-bold text-center text-black">
                                                Live Batches for
                                                <span className="text-c2">{" "}Our Digital Marketing{" "}</span>
                                                Classes Online
                                            </h3>
                                        </div>
                                        <div className="col-lg-11 mt-4">
                                            <div className="row justify-content-evenly">
                                                <div className="col-lg-4 col-md-6 my-lg-3 my-2">
                                                    <div className="dm_batch_inner">
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
                                                <div className="col-lg-4 col-md-6 my-lg-3 my-2">
                                                    <div className="dm_batch_inner">
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
                                                <div className="col-lg-8 col-md-12 my-lg-5 my-2 batch_parent">
                                                    <div className="dm_batch_inner">
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
                            <div className="pt-4 pb-2 dm_pricing_plan">
                                <div className="section_container">
                                    <div className="row justify-content-center">
                                        <div className="col-lg-7">
                                            <div className="pricing_card">
                                                <h3 className="fw-bold">
                                                    Check Our
                                                    <span className="text-c2">
                                                        {" "}Digital Marketing{" "}
                                                    </span>
                                                    Online Course Fees
                                                </h3>
                                                <div className="features mt-4 px-lg-3 px-0">
                                                    <ul>
                                                        <li>
                                                            <p className="small fw-medium">✓ One-Time Payment – No hidden charges</p>
                                                        </li>
                                                        <li>
                                                            <p className="small fw-medium">✓ Lifetime Course Access</p>
                                                        </li>
                                                        <li>
                                                            <p className="small fw-medium">✓ Live Interactive Classes</p>
                                                        </li>
                                                    </ul>

                                                    <ul>
                                                        <li>
                                                            <p className="small fw-medium">✓ Real-Time Hands-On Projects</p>
                                                        </li>
                                                        <li>
                                                            <p className="small fw-medium">✓ Portfolio Building & Resume Review</p>
                                                        </li>
                                                        <li>
                                                            <p className="small fw-medium">✓ Mock Interviews + Placement Support</p>
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
                            <div className="faq_section pb-5">
                                <div className="section_container p-xl text-center mt-lg-5">
                                    <h3 className="section_base_heading">
                                        Frequently Asked{" "}
                                        <span className="text-c2"> Questions</span>
                                    </h3>
                                    <p className="text-center">Everything you need to know before you enroll</p>
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

                        </div>
                        <section className="dm_cta position-relative">
                            <Image src={"/images/live-course/digital-marketing/cta-person.svg"} className="dm_cta_person" width={3000} height={500} alt="" />
                            <Image src={"/images/live-course/digital-marketing/cta-banner.svg"} className="dm_cta_lg w-100 h-auto" style={{ objectFit: 'cover' }} width={3000} height={500} alt="" />
                            <div className="section_container">
                                <div className="row justify-content-center align-items-center w-100 m-auto">
                                    <div className="dm_cta_inner mt-lg-5">
                                        <h3 className="fw-bold text-black text-lg-start text-center">Enroll Now and Become an AI-Powered Digital Marketer </h3>
                                        <p className="small lh-lg text-black text-lg-start text-center">Take the next step in your career in digital marketing. Learn live, build real campaigns with AI, and walk away ready to get hired or freelance from day one. </p>
                                        <div className="dm_cta_button col-12 d-flex justify-content-center gap-3">
                                            <button>Enroll Now</button>
                                            <button>Talk to Counsellors</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* <div className="py-5 price_section_parent_top position-relative top-0">
                            <div className="text-center d-flex justify-content-center">
                                <div className="row w-100 justify-content-center">
                                    <div className="col-lg-6 mt-4 d-flex justify-content-center ">
                                        <div className="parent_price">
                                            <div className="price_section d-flex flex-column align-items-center justify-content-center px-2 px-lg-4 py-4">
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
                        </section> */}
                    </div>
                </div>
            </section>
        </>
    );
}