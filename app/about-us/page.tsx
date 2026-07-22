"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./style.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";


interface CounterProps {
    end: number;
    startCount: boolean;
    duration?: number;
}

export default function AboutUs() {
    // const counterRef = useRef(null);
    // const [startCount, setStartCount] = useState(false);
    const [activeTab, setActiveTab] = useState("mission");

    // const data = {
    //     mission: {
    //         title: "Mission",
    //         content: (
    //             <>
    //                 <p>
    //                     We Provide Quality, Accessible Learning Entirely In Tamil Across
    //                     Tamil Nadu, Empowering Professionals and Learners to Understand
    //                     Complex Concepts Easily, Acquire Industry-Relevant Skills, And
    //                     Achieve Career Growth.
    //                 </p>
    //                 <p className="mb-0">
    //                     Language Should Never Be A Barrier To Success.
    //                 </p>
    //             </>
    //         ),
    //     },
    //     vision: {
    //         title: "Vision",
    //         content: (
    //             <>
    //                 <p>
    //                     To Expand Our Platform Across India In Multiple Languages, Making
    //                     Affordable, Accessible Education Available To Every Region.
    //                 </p>
    //                 <p className="mb-0">
    //                     Empowering Millions Of Professionals To Upskill And Transform Their
    //                     Careers.
    //                 </p>
    //             </>
    //         ),
    //     },
    // };
    const partners = [
        "certiport.webp",
        "aws.png",
        "microsoft.png",
        "meta.png",
        "accenture.png",
        "capgemini.png",
    ];

    // useEffect(() => {
    //     const observer = new IntersectionObserver(
    //         (entries) => {
    //             if (entries[0].isIntersecting) {
    //                 setStartCount(true);
    //             }
    //         },
    //         {
    //             threshold: 0.4,
    //         }
    //     );

    //     if (counterRef.current) {
    //         observer.observe(counterRef.current);
    //     }

    //     return () => {
    //         if (counterRef.current) {
    //             observer.unobserve(counterRef.current);
    //         }
    //     };
    // }, []);

    return (
        <>
            <section className="about_page_banner">
                <div className="section_container pe-lg-0">
                    <div className="row justify-content-between align-items-center w-100 m-auto">
                        <div className="col-lg-5 py-3 pe-lg-5 d-flex align-items-center">
                            <div>
                                <h1 className="h2 text-black text-start fw-bold text-uppercase">
                                    Leading EdTech Platform for All Professional Skills
                                </h1>

                                <p className="text-black text-start mb-0 small">
                                    We deliver industry-relevant skills across Tamil Nadu through
                                    AI-powered learning, expert mentors, live classes, and self-paced courses.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-6 abt_right_main">
                            <Image src={"/images/about/about-banner-right.png"}
                                className="w-100 h-100 object-fit-cover"
                                width={400}
                                height={400}
                                alt="" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mission-section py-5">
                <div className="section_container">

                    <div className="mission-box">

                        <div className="tab-header">
                            <button
                                className={activeTab === "mission" ? "active mission_btn" : "mission_btn"}
                                onClick={() => setActiveTab("mission")}
                            >
                                Mission
                            </button>

                            <button
                                className={activeTab === "vision" ? "active vision_btn" : "vision_btn"}
                                onClick={() => setActiveTab("vision")}
                            >
                                Vision
                            </button>
                        </div>

                        <div className="mission-content">
                            <div
                                className={`indicator ${activeTab === "vision" ? "right" : ""
                                    }`}
                            ></div>

                            <div className={`content-box ${activeTab === "mission" ? "active" : ""}`}>
                                <p className="mb-0">
                                    We Provide Quality, Accessible Learning Entirely in Tamil Across Tamil Nadu. Empowering Professionals and Learners to Understand Complex Concepts Easily, Acquire Industry-Relevant Skills, and Achieve Career Growth. Language Should Never Be a Barrier to Success.
                                </p>
                            </div>

                            <div className={`content-box ${activeTab === "vision" ? "active" : ""}`}>
                                <p className="mb-0">
                                    To Expand Our Platform Across India in Multiple Languages. Making Affordable, Accessible Education Available to Every Region. Empowering Millions of Professionals to Upskill and Transform Their Careers.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <section className="py-4">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div>
                                <h3 className="section_base_heading text-center">
                                    Our{" "}
                                    <span className="text-c2">Journey</span>
                                </h3>
                                <p className="mb-0 lh-lg">
                                    With over 10 years of experience in delivering quality offline training across IT, CAD, and Design, we have empowered 5,000+ learners with industry-relevant skills and practical learning. Throughout our journey, we understood the challenges students face, the need to stay updated with evolving technologies, gain hands-on experience, build job-ready skills, and learn from industry experts. This inspired us to take our proven quality training beyond the classroom. To make career-focused education accessible to every aspiring learner, we launched Velearn, bringing our trusted offline learning experience to an online platform and reaching learners across Tamil Nadu.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Authorised partners - Start */}
            <section>
                <div className="pb-5 logo_swiper">
                    <div className="section_container p-xl text-center mt-5">
                        <h3 className="section_base_heading text-center">
                            Partnering{" "}
                            <span className="text-c2">With Excellence</span>
                        </h3>
                        <Swiper
                            className="pt-5"
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
                                        src={`/images/partners/${logo}`}
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
            </section>
            {/* Authorised partners - End */}

            <section className="about_values_bg pt-5">
                <div className="section_container">
                    <div className="row">
                        <h2 className="text-center fw-bold text-black">Values for Growth</h2>
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-lg-10">
                            <div className="row">
                                <div className="col-lg-3 my-lg-0 my-3">
                                    <div className="about_values_parent">
                                        <h5>Purpose</h5>
                                        <p className="mb-0">
                                            We exist to transform careers and change lives through education. Every course, every instructor, every feature is designed with one purpose, empowering professionals to achieve their dreams and succeed in their careers.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-3 my-lg-0 my-3">
                                    <div className="about_values_parent">
                                        <h5>Purpose</h5>
                                        <p className="mb-0">
                                            We exist to transform careers and change lives through education. Every course, every instructor, every feature is designed with one purpose, empowering professionals to achieve their dreams and succeed in their careers.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-3 my-lg-0 my-3">
                                    <div className="about_values_parent">
                                        <h5>Purpose</h5>
                                        <p className="mb-0">
                                            We exist to transform careers and change lives through education. Every course, every instructor, every feature is designed with one purpose, empowering professionals to achieve their dreams and succeed in their careers.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-3 my-lg-0 my-3">
                                    <div className="about_values_parent">
                                        <h5>Purpose</h5>
                                        <p className="mb-0">
                                            We exist to transform careers and change lives through education. Every course, every instructor, every feature is designed with one purpose, empowering professionals to achieve their dreams and succeed in their careers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* <section className="about_section">
                <div className="section_container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="about_content">
                                <h2 className="text-black fw-bold">
                                    Our Dream is Global{" "}
                                    <span className="text-c2">
                                        Learning Transformation
                                    </span>
                                </h2>

                                <p>
                                    Velearn was founded with the vision of making
                                    modern technology education accessible to everyone.
                                </p>

                                <ul className="about_points list-unstyled mt-3">
                                    <li className="pt-1">
                                        <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                        Industry-relevant live and recorded courses
                                    </li>

                                    <li className="pt-1">
                                        <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                        Hands-on projects to build practical skills
                                    </li>

                                    <li className="pt-1">
                                        <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                        Expert instructors with real-world experience
                                    </li>

                                    <li className="pt-1">
                                        <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                        Flexible learning with self-paced options
                                    </li>

                                    <li className="pt-1">
                                        <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                        Career guidance and placement support
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="about_image">
                                <Image
                                    src={`${BASE_IMAGE_URL}contact-banner.jpg`}
                                    className="phone-img h-auto"
                                    width={620}
                                    height={620}
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="abt_counter py-5" ref={counterRef}>
                <div className="section_container">
                    <div className="row w-100 m-auto justify-content-center">
                        <div className="col-lg-10">
                            <div className="about_stats">
                                <div className="row">
                                    <div className="col-lg-3 col-6 my-3 my-lg-0">
                                        <div className="stat_card">
                                            <h3 className="fw-bold">
                                                <Counter
                                                    end={3}
                                                    startCount={startCount}
                                                />
                                                .5
                                            </h3>
                                            <p>Years Experience</p>
                                        </div>
                                    </div>

                                    <div className="col-lg-3 col-6 my-3 my-lg-0">
                                        <div className="stat_card">
                                            <h3 className="fw-bold">
                                                <Counter
                                                    end={23}
                                                    startCount={startCount}
                                                />
                                            </h3>
                                            <p>Projects & Courses</p>
                                        </div>
                                    </div>

                                    <div className="col-lg-3 col-6 my-3 my-lg-0">
                                        <div className="stat_card">
                                            <h3 className="fw-bold">
                                                <Counter
                                                    end={830}
                                                    startCount={startCount}
                                                />
                                                +
                                            </h3>
                                            <p>Positive Reviews</p>
                                        </div>
                                    </div>

                                    <div className="col-lg-3 col-6 my-3 my-lg-0">
                                        <div className="stat_card">
                                            <h3 className="fw-bold">
                                                <Counter
                                                    end={100}
                                                    startCount={startCount}
                                                />
                                                K
                                            </h3>
                                            <p>Trusted Students</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="mission-vision py-5">
                <div className="section_container">
                    <div className="row align-items-center">
                        <div className="col-lg-5 about_right mb-4 mb-lg-0">
                            <div className="mission-vision__images position-relative h-100">
                                <div className="d-flex h-100">
                                    <div className="img-abt-1">
                                        <Image
                                            src={`${BASE_IMAGE_URL}about-2.webp`}
                                            alt="Velearn Mission Focus"
                                            height={400}
                                            width={400}
                                        />
                                    </div>
                                    <div className="img-abt-2">
                                        <Image
                                            src={`${BASE_IMAGE_URL}about-1.jpg`}
                                            alt="Velearn Vision"
                                            height={400}
                                            width={400}
                                        />
                                    </div>
                                </div>
                                <div className="abt_right_content position-absolute">
                                    <div>
                                        <h2 className="text-center text-white">
                                            100+
                                        </h2>
                                    </div>
                                    <div>
                                        <h6 className="text-center text-white">
                                            Expert <br /> Courses
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="sec-title text-start mb-4">
                                <h3 className="text-black fw-bold text-start">
                                    Our{" "}
                                    <span className="text-c2">
                                        Purpose & Vision
                                    </span>
                                </h3>
                            </div>

                            <div className="mission-vision__content">
                                <div className="mission mb-4">
                                    <h6 className="fw-bold mb-1">
                                        Our Mission
                                    </h6>
                                    <p>
                                        To empower learners worldwide with
                                        accessible, high-quality online
                                        education, fostering skill development,
                                        career growth, and lifelong learning
                                        opportunities.
                                    </p>
                                </div>

                                <div className="vision mb-4">
                                    <h6 className="fw-bold mb-1">Our Vision</h6>
                                    <p>
                                        To become a global leader in online
                                        learning, creating an inclusive
                                        ecosystem where knowledge, innovation,
                                        and practical skills drive personal and
                                        professional success.
                                    </p>
                                </div>

                                <div className="mission-vision__points mt-3">
                                    <h5 className="fw-bold mb-3 text-black">
                                        What We Offer
                                    </h5>
                                    <ul className="list-unstyled">
                                        <li className="d-flex align-items-start mb-2">
                                            <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                            Industry-relevant live courses and
                                            workshops
                                        </li>
                                        <li className="d-flex align-items-start mb-2">
                                            <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                            Self-paced recorded programs for
                                            flexible learning
                                        </li>
                                        <li className="d-flex align-items-start mb-2">
                                            <i className="bi bi-check-circle-fill text-c1 me-2"></i>
                                            Career guidance & mentorship for
                                            professional growth
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
        </>
    );
}