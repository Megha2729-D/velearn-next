"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

interface WebinarType {
    id: number;
    title: string;
    image: string;
    category: string;
    date: string;
    from_time: string;
    to_time: string;
}

export default function Webinar() {
    const [activeCategory, setActiveCategory] = useState(
        "Full Stack Development"
    );
    const [visibleCount, setVisibleCount] = useState(8);
    const [selectedWebinar, setSelectedWebinar] =
        useState<WebinarType | null>(null);

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredWebinars, setRegisteredWebinars] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingSubscribe, setLoadingSubscribe] = useState(false);
    const [authId, setAuthId] = useState<number | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const [webinars, setWebinars] = useState<WebinarType[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [isSubscribed, setIsSubscribed] =
        useState(false);

    const [subscribeData, setSubscribeData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const categories = [
        "Full Stack Development",
        "Data Science",
        "UI/UX Design",
        "Digital Marketing",
        "AI/ML",
    ];

    useEffect(() => {
        fetchWebinars();

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("authToken");

            if (token && user) {
                const id = user.id || user.auth_id;

                setAuthId(id);

                setFormData({
                    name: user.name || user.user_name || "",
                    email: user.email || user.email_id || "",
                    phone:
                        user.phonenumber ||
                        user.phone ||
                        user.phone_number ||
                        "",
                });

                fetchMyWebinars(id);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);
    useEffect(() => {
        const anyModalOpen =
            showRegisterModal || showSuccessModal;

        if (anyModalOpen) {
            document.body.classList.add("modal-open-custom");
            document.documentElement.classList.add("modal-open-custom");
        } else {
            document.body.classList.remove("modal-open-custom");
            document.documentElement.classList.remove("modal-open-custom");
        }

        return () => {
            document.body.classList.remove("modal-open-custom");
            document.documentElement.classList.remove("modal-open-custom");
        };
    }, [showRegisterModal, showSuccessModal]);
    const fetchWebinars = async () => {
        try {
            const response = await fetch(
                `${BASE_API_URL}webinars`
            );

            const data = await response.json();

            if (data.status) {
                setWebinars(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const fetchMyWebinars = async (id: number) => {
        try {
            const response = await fetch(
                `${BASE_API_URL}my-webinars/${id}`
            );

            const data = await response.json();

            if (data.status) {
                setRegisteredWebinars(
                    data.data.map((w: any) => w.id)
                );
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const openRegisterModal = (webinar: WebinarType) => {
        setSelectedWebinar(webinar);
        setShowRegisterModal(true);
    };

    const closeRegisterModal = () => {
        setIsClosing(true);

        setTimeout(() => {
            setShowRegisterModal(false);
            setIsClosing(false);
        }, 400);
    };
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                month: "short",
                day: "numeric",
                weekday: "short",
            }
        );
    };

    const formatTime = (time: string) => {
        const [h, m] = time.split(":");

        const date = new Date();
        date.setHours(Number(h));
        date.setMinutes(Number(m));

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredWebinars = webinars.filter(
        (w) => w.category === activeCategory
    );

    const visibleWebinars = filteredWebinars.slice(
        0,
        visibleCount
    );

    const hasMore = visibleCount < filteredWebinars.length;

    const changeCategory = (cat: string) => {
        setActiveCategory(cat);
        setVisibleCount(12);
    };

    const loadMore = () => {
        setVisibleCount((prev) => prev + 4);
    };

    const handleBackdropClick = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        if (
            (e.target as HTMLElement).classList.contains(
                "register_webinar_modal"
            )
        ) {
            closeRegisterModal();
        }
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!selectedWebinar) return;

        setLoadingSubmit(true);

        try {
            const response = await fetch(
                `${BASE_API_URL}webinar-register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        webinar_id: selectedWebinar.id,
                        auth_id: authId,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                    }),
                }
            );

            const data = await response.json();

            if (data.status) {
                setShowRegisterModal(false);
                setShowSuccessModal(true);

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                });

                setRegisteredWebinars((prev) => [
                    ...prev,
                    selectedWebinar.id,
                ]);
            } else {
                alert(
                    data.message ||
                    "Registration failed. Please try again."
                );
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Something went wrong. Please try again later.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    const closeSuccessModal = () => {
        setIsClosing(true);

        setTimeout(() => {
            setShowSuccessModal(false);
            setIsClosing(false);
        }, 400);
    };

    const handleSubscribeSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const { name, email, phone } = subscribeData;

        if (!name || !email || !phone) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoadingSubscribe(true);

        try {
            let recaptcha_token = "";

            if (
                typeof window !== "undefined" &&
                (window as any).grecaptcha
            ) {
                recaptcha_token = await new Promise<string>(
                    (resolve) => {
                        (window as any).grecaptcha.ready(() => {
                            (window as any).grecaptcha
                                .execute(
                                    "6LcbtYYsAAAAAJW-RyO1ZLIWHZ-RyWS6H3gAGgCj",
                                    {
                                        action: "webinar_subscribe",
                                    }
                                )
                                .then(resolve);
                        });
                    }
                );
            }

            const response = await axios.post(
                `${BASE_API_URL}contacts/send-mail`,
                {
                    name,
                    phone_number: phone,
                    email_id: email,
                    course: "Webinar Subscription",
                    message:
                        "I want to subscribe for upcoming webinar updates.",
                    country_code: "+91",
                    recaptcha_token,
                }
            );

            if (
                response.data.status ||
                response.data.id
            ) {
                toast.success(
                    "Subscribed successfully! We will notify you about upcoming webinars."
                );

                setSubscribeData({
                    name: "",
                    email: "",
                    phone: "",
                });

                setIsSubscribed(true);
            } else {
                toast.error(
                    response.data.message ||
                    "Failed to subscribe"
                );
            }
        } catch (error) {
            console.error(
                "Webinar subscribe error:",
                error
            );

            toast.error(
                "Something went wrong. Please try again later."
            );
        } finally {
            setLoadingSubscribe(false);
        }
    };
    const handleSubscribeChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSubscribeData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    return (
        <>
            {/* Banner */}
            <section className="webinar_banner py-4 py-lg-0">
                <div className="section_container">
                    <div className="row">
                        <div className="col-lg-8 d-flex align-items-center">
                            <h1 className="text-white fw-bold lh-base">
                                Unlock your full potential! <br />
                                “Gain practical insights through this live
                                webinar.”
                            </h1>
                        </div>
                        <div className="col-lg-4">
                            <div className="px-lg-5 py-3">
                                <img
                                    src={`${BASE_IMAGE_URL}webinar/webinar-bannner-end.png`}
                                    className="w-100"
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Webinar Section */}
            <section>
                <div className="section_container">
                    <div className="webinar_main py-5">
                        <h3 className="fw-bold text-center text-black mb-4">
                            Upcoming{" "}
                            <span className="text-c2"> Webinars</span>
                        </h3>

                        <div className="row">
                            {/* LEFT TABS */}
                            <div className="col-lg-3">
                                <div className="webinar_category">
                                    <h5 className="text-black fw-bold text-center">
                                        Course Units
                                    </h5>
                                    <ul>
                                        {categories.map(
                                            (cat, index) => (
                                                <li
                                                    key={index}
                                                    className={activeCategory ===
                                                        cat
                                                        ? "active"
                                                        : ""
                                                    }
                                                    onClick={() =>
                                                        changeCategory(
                                                            cat,
                                                        )
                                                    }
                                                >
                                                    {cat}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* RIGHT CARDS */}
                            <div className="col-lg-9">
                                <div className="row g-4 mt-3">
                                    {visibleWebinars.map(
                                        (webinar, index) => {
                                            const isPreviewRow = index >= 8;
                                            return (
                                                <div
                                                    className="col-xl-3 col-lg-4 col-md-4 col-sm-6 d-flex"
                                                    key={webinar.id}
                                                >
                                                    <div className="webinar_card mt-3 mb-5 d-flex flex-column justify-content-center align-items-center">
                                                        <img
                                                            src={`${BASE_DYNAMIC_IMAGE_URL}webinars/${webinar.image}`}
                                                            alt={
                                                                webinar.title
                                                            }
                                                            className="webinar_img"
                                                        />
                                                        <div className="webinar_card_body d-flex flex-column">
                                                            <div className="px-3">
                                                                <h5 className="mt-3 mb-2 webinar_title_truncated">
                                                                    {
                                                                        webinar.title
                                                                    }
                                                                </h5>
                                                                <div className="d-flex flex-column align-items-start gap-1 pb-4 ps-1">
                                                                    <div className="webinar_info_row">
                                                                        <i className="bi bi-calendar-week-fill"></i>
                                                                        <span>
                                                                            {formatDate(
                                                                                webinar.date,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="webinar_info_row">
                                                                        <i className="bi bi-clock-fill"></i>
                                                                        <span>
                                                                            {formatTime(
                                                                                webinar.from_time,
                                                                            )}{" "}
                                                                            -{" "}
                                                                            {formatTime(
                                                                                webinar.to_time,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-auto">
                                                                {registeredWebinars.includes(
                                                                    webinar.id,
                                                                ) ? (
                                                                    <button
                                                                        className="register_btn registered_btn w-100"
                                                                        disabled
                                                                    >
                                                                        Already
                                                                        Registered
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="register_btn w-100"
                                                                        onClick={() =>
                                                                            openRegisterModal(
                                                                                webinar,
                                                                            )
                                                                        }
                                                                    >
                                                                        Register
                                                                        now
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                    {/* ================= REGISTER MODAL ================= */}
                                    {showRegisterModal && (
                                        <div
                                            className="modal fade m-0 show d-block register_webinar_modal"
                                            onClick={
                                                handleBackdropClick
                                            }
                                        >
                                            <div className="modal-dialog modal-dialog-centered">
                                                <div
                                                    className={`modal-content ${isClosing ? "modal-slide-up" : "modal-slide-down"}`}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    {/* Premium gradient header strip */}
                                                    <div className="wbr_modal_header">
                                                        <div className="wbr_header_left">
                                                            <div className="wbr_modal_icon">
                                                                <i className="bi bi-camera-video-fill"></i>
                                                            </div>
                                                            <div className="wbr_header_text">
                                                                <span className="wbr_header_label">
                                                                    Register
                                                                    for
                                                                </span>
                                                                <span className="wbr_header_title">
                                                                    {
                                                                        selectedWebinar?.title
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="wbr_close_btn"
                                                            type="button"
                                                            onClick={closeRegisterModal}
                                                        >
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    </div>

                                                    {/* Modal Body */}
                                                    <div className="wbr_modal_body">
                                                        <form
                                                            onSubmit={handleSubmit}
                                                        >
                                                            <div className="wbr_input_group">
                                                                <span className="wbr_input_icon">
                                                                    <i className="bi bi-person"></i>
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    className="wbr_input"
                                                                    placeholder="Full Name"
                                                                    value={
                                                                        formData.name
                                                                    }
                                                                    onChange={handleChange}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="wbr_input_group">
                                                                <span className="wbr_input_icon">
                                                                    <i className="bi bi-envelope"></i>
                                                                </span>
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    className="wbr_input"
                                                                    placeholder="Email Address"
                                                                    value={
                                                                        formData.email
                                                                    }
                                                                    onChange={
                                                                        handleChange
                                                                    }
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="wbr_input_group">
                                                                <span className="wbr_input_icon">
                                                                    <i className="bi bi-telephone"></i>
                                                                </span>
                                                                <input
                                                                    type="tel"
                                                                    name="phone"
                                                                    className="wbr_input"
                                                                    placeholder="Phone Number"
                                                                    value={
                                                                        formData.phone
                                                                    }
                                                                    onChange={
                                                                        handleChange
                                                                    }
                                                                    required
                                                                />
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                className="wbr_submit_btn"
                                                                disabled={loadingSubmit}
                                                            >
                                                                {loadingSubmit ? (
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                ) : (
                                                                    <i className="bi bi-check2-circle me-2"></i>
                                                                )}
                                                                {loadingSubmit
                                                                    ? "Processing..."
                                                                    : "Confirm Registration"}
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ================= SUCCESS MODAL ================= */}
                                    {showSuccessModal && (
                                        <div
                                            className="success_modal_overlay"
                                            onClick={closeSuccessModal}
                                        >
                                            <div
                                                className="modalbox success animate"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div className="icon">
                                                    <span>✓</span>
                                                </div>

                                                <h1>Success!</h1>

                                                <p>
                                                    You've successfully
                                                    registered for <br />
                                                    <strong>
                                                        {
                                                            selectedWebinar?.title
                                                        }
                                                    </strong>
                                                </p>

                                                <button
                                                    type="button"
                                                    className="redo btn"
                                                    onClick={closeSuccessModal}
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay Background */}
                                    {/* {(showRegisterModal || showSuccessModal) && (
                                            <div
                                                className="modal-backdrop fade show"
                                                onClick={closeRegisterModal}
                                            ></div>
                                        )} */}
                                    {filteredWebinars.length === 0 && (
                                        <div className="text-center py-5">
                                            <h5>No webinars available</h5>
                                        </div>
                                    )}
                                    {hasMore && (
                                        <div className="text-center mt-2 mb-5">
                                            <button
                                                className="load_more_arrow"
                                                onClick={loadMore}
                                            >
                                                <i className="bi bi-chevron-down"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section_container">
                <div className="row justify-content-center webinar_subscribe_box">
                    <div className="col-lg-10">
                        <div className="py-5">
                            <h3 className="text-black text-center fw-bold">
                                Subscribe now!
                            </h3>
                            <div className="row justify-content-center">
                                <div className="col-lg-6">
                                    <form onSubmit={handleSubscribeSubmit}>
                                        <div className="my-4">
                                            <input
                                                type="text"
                                                name="subscribeName"
                                                id="subscribeName"
                                                placeholder="Your Name"
                                                value={subscribeData.name}
                                                onChange={handleSubscribeChange}
                                                required
                                            />
                                        </div>
                                        <div className="my-4">
                                            <input
                                                type="email"
                                                name="subscribeEmail"
                                                id="subscribeEmail"
                                                placeholder="E-mail ID"
                                                value={subscribeData.email}
                                                onChange={handleSubscribeChange}
                                                required
                                            />
                                        </div>
                                        <div className="my-4">
                                            <input
                                                type="number"
                                                name="subscribePhone"
                                                id="subscribePhone"
                                                placeholder="Phone no"
                                                value={subscribeData.phone}
                                                onChange={handleSubscribeChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 d-flex justify-content-center">
                                            <button
                                                type="submit"
                                                disabled={loadingSubscribe}
                                            >
                                                {loadingSubscribe
                                                    ? "Subscribing..."
                                                    : "Submit"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section_container py-5">
                <div>
                    <h3 className="text-black text-center fw-bold">
                        Key Highlights for a{" "}
                        <span className="text-c2">
                            {" "}
                            Productivity Webinar
                        </span>
                    </h3>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-11">
                        <div className="row webinar_highlights_parent mt-4">
                            <div className="col-xl-2 col-lg-4 col-md-4 col-6 my-2  webinar_highlights_inner">
                                <div className="webinar_highlights_sub">
                                    <div className="px-3 d-flex justify-content-center align-items-center">
                                        <img
                                            src={`${BASE_IMAGE_URL}webinar/key-highlights/highlights-1.png`}
                                            alt=""
                                        />
                                    </div>
                                    <p className="mb-0 text-black">
                                        Learn proven techniques to manage
                                        your time effectively
                                    </p>
                                </div>
                            </div>
                            <div className="col-xl-2 col-lg-4 col-md-4 col-6 my-2  webinar_highlights_inner">
                                <div className="webinar_highlights_sub">
                                    <div className="px-3 d-flex justify-content-center align-items-center">
                                        <img
                                            src={`${BASE_IMAGE_URL}webinar/key-highlights/highlights-2.png`}
                                            alt=""
                                        />
                                    </div>
                                    <p className="mb-0 text-black">
                                        Discover tools to boost focus and
                                        efficiency
                                    </p>
                                </div>
                            </div>
                            <div className="col-xl-2 col-lg-4 col-md-4 col-6 my-2  webinar_highlights_inner">
                                <div className="webinar_highlights_sub">
                                    <div className="px-3 d-flex justify-content-center align-items-center">
                                        <img
                                            src={`${BASE_IMAGE_URL}webinar/key-highlights/highlights-3.png`}
                                            alt=""
                                        />
                                    </div>
                                    <p className="mb-0 text-black">
                                        Strategies to overcome common
                                        productivity challenges
                                    </p>
                                </div>
                            </div>
                            <div className="col-xl-2 col-lg-4 col-md-4 col-6 my-2  webinar_highlights_inner">
                                <div className="webinar_highlights_sub">
                                    <div className="px-3 d-flex justify-content-center align-items-center">
                                        <img
                                            src={`${BASE_IMAGE_URL}webinar/key-highlights/highlights-4.png`}
                                            alt=""
                                        />
                                    </div>
                                    <p className="mb-0 text-black">
                                        Live Q&A with productivity experts
                                    </p>
                                </div>
                            </div>
                            <div className="col-xl-2 col-lg-4 col-md-4 col-6 my-2  webinar_highlights_inner">
                                <div className="webinar_highlights_sub">
                                    <div className="px-3 d-flex justify-content-center align-items-center">
                                        <img
                                            src={`${BASE_IMAGE_URL}webinar/key-highlights/highlights-5.png`}
                                            alt=""
                                        />
                                    </div>
                                    <p className="mb-0 text-black">
                                        Practical techniques you can start
                                        using right away
                                    </p>
                                </div>
                            </div>
                            <div className="col-xl-2 col-lg-4 col-md-4 col-6 my-2  webinar_highlights_inner">
                                <div className="webinar_highlights_sub">
                                    <div className="px-3 d-flex justify-content-center align-items-center">
                                        <img
                                            src={`${BASE_IMAGE_URL}webinar/key-highlights/highlights-6.png`}
                                            alt=""
                                        />
                                    </div>
                                    <p className="mb-0 text-black">
                                        Learn through real-world case
                                        studies in the webinar
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-4 webinar_cta mb-4">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <div className="d-flex justify-content-center align-items-center flex-column">
                                <p className="text-white text-center">
                                    Sign up to transform the way you
                                    organize, prioritize, and execute tasks.
                                </p>
                                <Link href="/contact-us">
                                    {" "}
                                    <button>
                                        Register now{" "}
                                        <i className="bi bi-arrow-right ps-2"></i>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
};