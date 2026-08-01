"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
// import "../globals.css"

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

const bannerSlides = [
    {
        title: "Master in Full Stack Development",
        desc: "Learn HTML, CSS, JavaScript, React, Node.js, MongoDB and build real-world projects with live mentoring.",
        link: "/live-course/full-stack-development",
        alt: "Full Stack Course",
    },
    {
        title: "UI/UX Design Course",
        desc: "Master Figma, wireframing, prototyping and design thinking to build industry-level user experiences.",
        link: "/live-course/ui-ux-design",
        alt: "UI UX Course",
    },
    {
        title: "Digital Marketing",
        desc: "Learn SEO, Social Media Marketing, Google Ads, Meta Ads and grow brands with real campaign projects.",
        link: "/live-course/digital-marketing",
        alt: "Digital Marketing Course",
    },
    {
        title: "Data Science & AI",
        desc: "Learn Python, Pandas, Machine Learning, AI models and work on real datasets with industry mentors.",
        link: "/live-course/data-science-and-machine-learning",
        alt: "Data Science Course",
    },
];

export default function LiveCourse() {

    return (
        <>
            <section className="v-banner">
                <div className="section_container h-100">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        autoplay={{ delay: 5000 }}
                        loop={true}
                        navigation={true}
                        slidesPerView={1}
                        style={{ width: "100%", height: "100%" }}
                        className="v-banner-swiper"
                    >
                        {bannerSlides.map((slide, index) => (
                            <SwiperSlide key={index}>
                                <div className="row align-items-center justify-content-between py-4">
                                    <div className="col-lg-7 d-flex flex-column align-items-center align-items-lg-start">
                                        <h5 className="text-white">
                                            {slide.title}
                                        </h5>
                                        <p className="text-white">
                                            {slide.desc}
                                        </p>
                                        <p className="text-white">
                                            Live Classes available in
                                            English, தமிழ், हिंदी, తెలుగు...
                                        </p>
                                        <div className="col-12">
                                            <Link href={slide.link}>
                                                <button>
                                                    Explore Programs
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <Image
                                            src={`${BASE_IMAGE_URL}live-course-banner-card.png`}
                                            className="w-100"
                                            alt={slide.alt}
                                            width={420}
                                            height={320}
                                        />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            <section className="py-5">
                <div className="section_container live_courses_sec">
                    <h3 className="section_base_heading text-black text-center">
                        Start Your Career With
                        <span className="text-c2"> Live Classes</span>
                    </h3>
                    <div className="row">
                        {[
                            {
                                title: "Full Stack Development",
                                img: `${BASE_IMAGE_URL}live-course/full-stack-development.jpg`,
                                desc: "A live, mentor-led Full Stack Development program designed to take you from fundamentals to production-ready applications — with real projects, real tools, and real career support.",
                                duration: "3 Months",
                                link: "/live-course/full-stack-development",
                            },
                            {
                                title: "UI/UX Design",
                                img: `${BASE_IMAGE_URL}live-course/ui-ux.webp`,
                                desc: "Learn UI/UX design through live classes, hands-on projects, and expert mentorship. Master user research, UX strategy, and modern UI design to become job-ready with a strong portfolio.",
                                duration: "3 Months",
                                link: "/live-course/ui-ux-design",
                            },
                            {
                                title: "Digital Marketing",
                                img: `${BASE_IMAGE_URL}live-course/digital-marketing.webp`,
                                desc: "This live Digital Marketing training program is designed to build job-ready skills through hands-on campaign execution, real-time tools, and expert mentorship— preparing you for high-growth roles in today’s digital economy.",
                                duration: "3 Months",
                                link: "/live-course/digital-marketing",
                            },
                            {
                                title: "Data Science & AI",
                                img: `${BASE_IMAGE_URL}live-course/data-science.webp`,
                                desc: "This live Data Science and AI/ML program helps you develop job-ready analytical and machine learning skills through hands-on projects, real datasets, and continuous mentor guidance—preparing you for high-impact roles in today’s data-driven world.",
                                duration: "3 Months",
                                link: "/live-course/data-science-and-machine-learning",
                            },
                        ].map((course, index) => (
                            <div
                                key={index}
                                className="col-xl-3 col-lg-3 col-md-6 col-12 mb-5 mb-lg-0"
                            >
                                <div
                                    className={`card_parent h-100 d-flex flex-column ${index % 2 === 0 ? "one" : "two"}`}
                                >
                                    <div className="card_img_parent overflow-hidden position-relative">
                                        <Image
                                            src={course.img}
                                            className="card_img w-100"
                                            alt={course.title}
                                            width={270}
                                            height={200}
                                        />
                                        <div className="live_parent d-flex gap-2 align-items-center justify-content-center">
                                            <div className="live_icon"></div>
                                            <span className="live_word">
                                                Live
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-3 d-flex flex-column align-items-start flex-grow-1">
                                        <h4>{course.title}</h4>

                                        <p className="mb-0">
                                            {course.desc}
                                        </p>

                                        <div className="duration_txt d-flex justify-content-end gap-3 w-100 mt-auto">
                                            <div>
                                                <i className="bi bi-clock pe-1"></i>
                                                {course.duration}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 card_abs_butt">
                                        <div className="col-12 d-flex justify-content-between">
                                            <div className="syllabus_butt">
                                                <button>Syllabus</button>
                                            </div>
                                            <div className="view_more_butt">
                                                <Link href={course.link}>
                                                    <button>
                                                        View more
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* <div className="col-12 d-flex justify-content-center more_butt_parent">
                                <NavLink to="/">
                                    <div className="d-flex more_butt">
                                        <div className="butt">Show More</div>
                                        <div className="icon_redirect">
                                            <i className="bi bi-arrow-right-short"></i>
                                        </div>
                                    </div>
                                </NavLink>
                            </div> */}
                    </div>
                </div>
            </section>
            <section className="py-5 benefits_sec">
                <div className="section_container">
                    <h3 className="section_base_heading text-center">
                        Benefits of{" "}
                        <span className="text-c2">Live Classes</span>
                    </h3>
                    <div className="live_benefits_parent justify-content-center mt-4">
                        <div className="benefit_card b1 small">
                            <div className="flex-column">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-1.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Career Focused Guidance</h4>
                            </div>
                        </div>
                        <div className="benefit_card b2 big">
                            <div className="flex-column flex-md-row flex-lg-row">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-2.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Industry Tools & Technologies</h4>
                            </div>
                        </div>
                        <div className="benefit_card b3 small">
                            <div className="flex-column">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-3.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Live Industry Examples</h4>
                            </div>
                        </div>
                        <div className="benefit_card b4 small">
                            <div className="flex-column">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-4.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Hands-On Live Projects</h4>
                            </div>
                        </div>
                        <div className="benefit_card b5 big">
                            <div className="flex-column flex-md-row flex-lg-row">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-5.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Doubt Solving Sessions</h4>
                            </div>
                        </div>
                        <div className="benefit_card b6 small">
                            <div className="flex-column">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-6.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Mock Test & Practice Questions</h4>
                            </div>
                        </div>

                        <div className="benefit_card b7 small">
                            <div className="flex-column">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-7.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Placement Assistance</h4>
                            </div>
                        </div>
                        <div className="benefit_card b8 big">
                            <div className="flex-column flex-md-row flex-lg-row">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-8.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Weekdays / Weekend Live Classes</h4>
                            </div>
                        </div>
                        <div className="benefit_card b9 small">
                            <div className="flex-column">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-9.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Quick Tech Support</h4>
                            </div>
                        </div>
                        <div className="benefit_card b10 big">
                            <div className="flex-column flex-md-row flex-lg-row">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-10.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4>Industry Recognized Certificates</h4>
                            </div>
                        </div>
                        <div className="benefit_card b11 big">
                            <div className="position-relative flex-column flex-md-row flex-lg-row">
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-vector-11-1.png`}
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <h4 className="mb-5 mb-lg-0">
                                    Invite Friends & Get Benefits
                                </h4>
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-coin-full.png`}
                                    className="lc_coin lc_coin_1"
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-coin-full.png`}
                                    className="lc_coin lc_coin_2"
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                                <Image
                                    src={`${BASE_IMAGE_URL}live-course-vector/lc-coin-half.png`}
                                    className="lc_coin lc_coin_3"
                                    alt=""
                                    width={100}
                                    height={90}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section_container">
                <div className="pb-5">
                    <div className="queries_sec">
                        <div>
                            <h3 className="text-white fw-bold text-center">
                                Still have queries? Contact Us
                            </h3>
                            <p className="text-white text-center">
                                Request a Callback. An expert from the
                                admissions office will call you in the next
                                24 working hours. You can also reach out to
                                us at @@@@@ or +91xxxxxxxx
                            </p>
                            <Link href={"/contact-us"}>
                                <button>Contact Us</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-5 live_course_review">
                <div className="section_container">
                    <h3 className="section_base_heading text-center">
                        Student{" "}
                        <span className="text-c2">
                            Outcomes & Testimonials
                        </span>
                    </h3>

                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={70}
                        slidesPerView={4}
                        loop={true}
                        autoplay={{ delay: 3000 }}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            0: { slidesPerView: 1 },
                            576: { slidesPerView: 2 },
                            992: { slidesPerView: 4 },
                        }}
                        className="mt-lg-5 mt-3 testimonials_swiper"
                    >
                        {[
                            {
                                img: "testimonial/live-course/person-1.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                            {
                                img: "testimonial/live-course/person-2.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                            {
                                img: "testimonial/live-course/person-3.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                            {
                                img: "testimonial/live-course/person-4.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                            {
                                img: "testimonial/live-course/person-1.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                            {
                                img: "testimonial/live-course/person-2.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                            {
                                img: "testimonial/live-course/person-3.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                            {
                                img: "testimonial/live-course/person-4.png",
                                text: "Live classes were very interactive and easy to understand. Doubts were cleared instantly, which really helped my learning.",
                            },
                        ].map((item, index) => (
                            <SwiperSlide key={index}>
                                <div className="testimonial_card text-center">
                                    <Image
                                        src={`${BASE_IMAGE_URL}${item.img}`}
                                        width={230}
                                        height={310}
                                        alt=""
                                    />
                                    <p>{item.text}</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </>
    );
}