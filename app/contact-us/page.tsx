"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

interface FormData {
    userName: string;
    phone: string;
    email: string;
    course: string;
    message: string;
}

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (
                siteKey: string,
                options: { action: string }
            ) => Promise<string>;
        };
    }
}

export default function ContactUs() {
    const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        userName: "",
        phone: "",
        email: "",
        course: "",
        message: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const { userName, phone, email, course, message } = formData;

        if (!userName || !phone || !email || !course || !message) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);

        try {
            let recaptcha_token = "";

            if (typeof window !== "undefined" && window.grecaptcha) {
                recaptcha_token = await new Promise<string>((resolve) => {
                    window.grecaptcha.ready(() => {
                        window.grecaptcha
                            .execute(
                                "6LcbtYYsAAAAAJW-RyO1ZLIWHZ-RyWS6H3gAGgCj",
                                {
                                    action: "contact_us",
                                }
                            )
                            .then((token: string) => resolve(token));
                    });
                });
            }

            const response = await axios.post(
                `${BASE_API_URL}contacts/send-mail`,
                {
                    name: userName,
                    phone_number: phone,
                    email_id: email,
                    course,
                    message,
                    country_code: "+91",
                    recaptcha_token,
                }
            );

            if (response.data?.status || response.data?.id) {
                toast.success(
                    "Message sent successfully! We will contact you soon."
                );

                setFormData({
                    userName: "",
                    phone: "",
                    email: "",
                    course: "",
                    message: "",
                });
            } else {
                toast.error(
                    response.data?.message || "Failed to send message"
                );
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                "Something went wrong. Please try again later.";

            toast.error(errorMessage);
            console.error("Contact form error:", error);
        } finally {
            setLoading(false);
        }
    };

    const faqData = [
        {
            question: "Who is this Live Full Stack course designed for?",
            answer: (
                <p>
                    This course is designed for students, freshers, career
                    switchers, and working professionals who want to learn full
                    stack development through live training, gain real-world
                    project experience, become job-ready developers with strong
                    practical skills, and build a professional portfolio for
                    interviews and receive career and placement guidance.
                </p>
            ),
        },
        {
            question: "Do I need prior coding experience to join this course?",
            answer: (
                <>
                    <p>
                        Velearn offers future-ready IT training programs
                        designed to build strong careers in today’s tech
                        industry. Our live courses cover key areas like software
                        development, data-driven technologies, AI skills, and
                        digital tools, helping students stay job-ready.
                    </p>
                    <p>
                        We also provide recorded IT programs in programming
                        basics, web technologies, IT infrastructure, and other
                        upskilling modules. Every course includes practical
                        training, updated content, and job-focused learning to
                        support your overall IT career growth.
                    </p>
                </>
            ),
        },
        {
            question: "What kind of projects will I work on?",
            answer: (
                <p>
                    You can easily attend a free demo class for any course at
                    Velearn. Just submit the demo request form or click the
                    Contact Us button on the website. In the free demo, you will
                    get a complete understanding of the course syllabus, trainer
                    experience, placement process, project training, and
                    learning style. This helps you choose the right IT course
                    before enrolling.
                </p>
            ),
        },
        {
            question: "Will this course help me get a job?",
            answer: (
                <>
                    <p>
                        Velearn provides full student support throughout the
                        training. You will get access to a personal support
                        executive who helps you with:
                    </p>
                    <ul>
                        <li>Technical doubts</li>
                        <li>Class issues</li>
                        <li>Batch allocation</li>
                        <li>Rescheduling or shifting batches</li>
                        <li>Assignment guidance</li>
                    </ul>
                    <p>
                        Along with this, you get mentor support, WhatsApp help,
                        and doubt-clearing assistance, making the learning
                        experience smooth and stress-free.
                    </p>
                </>
            ),
        },
        {
            question: "How can I interact with mentors?",
            answer: (
                <p>
                    You can interact with Velearn mentors anytime through live
                    doubt-clearing sessions, chat support, and WhatsApp
                    guidance. Students can ask questions directly during class
                    or through the support chat whenever needed. Mentors ensure
                    every doubt is solved quickly so your IT learning journey
                    stays smooth and clear.
                </p>
            ),
        },
    ];

    const toggleFaq = (index: number) => {
        setActiveFaqIndex(activeFaqIndex === index ? null : index);
    };

    return (
        <>
            <section className="contact_banner">
                <div className="section_container py-5">
                    <div className="row">
                        <div className="col-lg-7">
                            <h1 className="fw-bold text-white">
                                Get in touch with us
                            </h1>
                            <p className="text-white mb-1">
                                Find answers to questions we always receive.
                            </p>
                            <p className="text-white mb-2">
                                If your query is not there, send us a message!
                            </p>
                            <p className="text-white mb-0">
                                We’re here to help.
                            </p>
                        </div>
                        <div className="col-lg-5 contact_banner_side_parent">
                            <div className="contact_banner_side"></div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="contact_form">
                <div className="section_container">
                    <div className="py-5">
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <h2 className="fw-bold text-c1">
                                    Get in touch with{" "}
                                    <span className="text-c2">sales</span>
                                </h2>
                                <p>
                                    Get guidance on learning plans and
                                    pricing—our team will contact you shortly.
                                </p>
                            </div>
                        </div>
                        <div className="py-2">
                            <div className="row justify-content-center">
                                <div className="col-lg-10">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-lg-6 d-flex flex-column py-2">
                                                <label
                                                    htmlFor="userName"
                                                    className="mb-2"
                                                >
                                                    Name{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="userName"
                                                    name="userName"
                                                    placeholder="Enter your name"
                                                    value={formData.userName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-lg-6 d-flex flex-column py-2">
                                                <label
                                                    htmlFor="phone"
                                                    className="mb-2"
                                                >
                                                    Phone{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="phone"
                                                    id="phone"
                                                    placeholder="Enter your phone number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-lg-6 d-flex flex-column py-2">
                                                <label
                                                    htmlFor="email"
                                                    className="mb-2"
                                                >
                                                    Email{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    placeholder="Enter your email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-lg-6 d-flex flex-column py-2">
                                                <label
                                                    htmlFor="course"
                                                    className="mb-2"
                                                >
                                                    Course{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="course"
                                                    id="course"
                                                    placeholder="Enter your course name"
                                                    value={formData.course}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-lg-12 d-flex flex-column py-2">
                                                <label
                                                    htmlFor="message"
                                                    className="mb-2"
                                                >
                                                    Message{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <textarea
                                                    name="message"
                                                    id="message"
                                                    placeholder="Write your message here"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="col-12 d-flex justify-content-center mt-4">
                                            <button
                                                type="submit"
                                                className="contact_submit_btn"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>{" "}
                                                        Sending...
                                                    </>
                                                ) : (
                                                    "Send a message"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="contact_details bg-c1 py-4">
                <div className="section_container">
                    <h3 className="text-white text-center fw-bold mb-4">
                        Contact Us
                    </h3>
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="d-flex flex-wrap gap-5 justify-content-center mt-5">
                                <div className="contact_details_sub">
                                    <div className="contact_details_sub_icon">
                                        <i className="bi bi-headset"></i>
                                    </div>
                                    <div>
                                        <h5 className="text-white fw-bold text-center">
                                            Help & Support
                                        </h5>
                                        <p className="mb-0 text-white text-center">
                                            <a href="tel:919087551188">
                                                +91 90875 51188
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <div className="contact_details_sub">
                                    <div className="contact_details_sub_icon">
                                        <i className="bi bi-chat-left-dots"></i>
                                    </div>
                                    <div>
                                        <h5 className="text-white fw-bold text-center">
                                            Sms / Whatsapp
                                        </h5>
                                        <p className="mb-0 text-white text-center">
                                            <a href="tel:919988776655">
                                                +91 99887 76655
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <div className="contact_details_sub">
                                    <div className="contact_details_sub_icon">
                                        <i className="bi bi-envelope-paper"></i>
                                    </div>
                                    <div>
                                        <h5 className="text-white fw-bold text-center">
                                            E-mail
                                        </h5>
                                        <p className="mb-0 text-white text-center">
                                            <a href="mailto:info@velearn.in">
                                                info@velearn.in
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center my-5">
                                <button className="contact_submit_btn btn_light">
                                    Reach Out Us
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="faq_section py-5">
                <div className="section_container p-xl text-center">
                    <h3 className="section_base_heading">
                        Frequently Asked{" "}
                        <span className="text-c2"> Questions</span>
                    </h3>

                    <div className="row mt-5 align-items-center">
                        <div className="col-lg-12 text-start">
                            {faqData.map((item, index) => (
                                <div
                                    className={`faq_item mb-3  ${activeFaqIndex === index ? "active" : ""
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