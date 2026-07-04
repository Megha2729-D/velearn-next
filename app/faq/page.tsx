"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./style.css";

const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";

export default function FAQ() {
    const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
    const [searchTerm, setSearchTerm] = useState("");

    const faqData = [
        {
            question: "What is VeLearn?",
            answer:
                "VeLearn is a premier e-learning platform dedicated to providing high-quality, industry-relevant training in software development, UI/UX design, digital marketing, and data science.",
        },
        {
            question: "Are the courses self-paced or live?",
            answer:
                "We offer both! Our self-paced courses consist of pre-recorded videos, while live courses are mentor-led interactive sessions.",
        },
        {
            question: "Do I get a certificate upon completion?",
            answer:
                "Yes, every course at VeLearn comes with a professional Certificate of Completion.",
        },
        {
            question: "How long do I have access to the courses?",
            answer:
                "For self-paced courses, you get lifetime access. Live programs provide access according to the course details.",
        },
        {
            question: "Do you provide placement assistance?",
            answer:
                "Yes, we provide placement support including resume building, interview preparation, and mock interviews.",
        },
        {
            question:
                "Is there any prerequisite for joining the courses?",
            answer:
                "Most foundation courses are beginner-friendly and require no prior experience.",
        },
        {
            question: "Can I access the courses on mobile?",
            answer:
                "Yes, our platform is fully responsive and works on mobile, tablet, and desktop devices.",
        },
        {
            question:
                "What should I do if I have doubts during my learning?",
            answer:
                "You can use community forums, support groups, and live Q&A sessions to get your doubts clarified.",
        },
        {
            question: "What payment methods do you accept?",
            answer:
                "We accept Credit/Debit Cards, UPI, Net Banking, and digital wallets.",
        },
        {
            question: "Is there a refund policy?",
            answer:
                "Yes, please refer to our Refund Policy page for complete details.",
        },
    ];

    const filteredFaq = faqData.filter(
        (item) =>
            item.question
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            item.answer
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const toggleFaq = (index: number) => {
        setActiveFaqIndex(
            activeFaqIndex === index ? null : index
        );
    };

    return (
        <div className="faq_page">
            {/* Header Section */}
            <section className="faq_header">
                <div className="section_container text-center">
                    <h1 className="faq_title">
                        Have <span className="text-c2">Questions</span>?
                        We've Got <span className="text-c2">Answers</span>
                    </h1>

                    <p className="faq_subtitle">
                        Everything you need to know about VeLearn
                        platform and our programs.
                    </p>

                    <div className="faq_search_wrapper mt-4">
                        <div className="faq_search_box">
                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="faq_content py-5">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="faq_list">
                                {filteredFaq.length > 0 ? (
                                    filteredFaq.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`faq_item mb-3 ${activeFaqIndex === index
                                                ? "active"
                                                : ""
                                                }`}
                                        >
                                            <button
                                                className={`faq_question text-start justify-content-between ${activeFaqIndex === index
                                                    ? "active"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    toggleFaq(index)
                                                }
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
                                    ))
                                ) : (
                                    <div className="text-center py-5">
                                        <h4>
                                            No questions matched your search.
                                        </h4>
                                        <p>
                                            Try searching for something else
                                            or contact us below.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="row mt-5">
                        <div className="col-12 text-center">
                            <div className="contact_cta_box p-5">
                                <h3>Still have more questions?</h3>

                                <p className="mb-4">
                                    Can't find the answer you're looking
                                    for? Please chat to our friendly
                                    team.
                                </p>

                                <Link
                                    href="/contact-us"
                                    className="btn_contact_faq"
                                >
                                    Contact Support
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}