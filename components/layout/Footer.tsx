"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";

const BASE_API_URL =
    "https://velearn.in/velearn-crm/api/";
const BASE_IMAGE_URL =
    "https://velearn.in/assets/images/";

export default function Footer() {
    const [trendingCourses, setTrendingCourses] =
        useState<any[]>([]);

    const [enrolledCourses, setEnrolledCourses] =
        useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const courseRes = await axios.get(
                    `${BASE_API_URL}recorded-course`
                );

                if (courseRes.data.status) {
                    const latestCourses =
                        courseRes.data.data
                            .sort(
                                (a: any, b: any) =>
                                    new Date(
                                        b.created_at
                                    ).getTime() -
                                    new Date(
                                        a.created_at
                                    ).getTime()
                            )
                            .slice(0, 3);

                    setTrendingCourses(latestCourses);
                }

                const user =
                    typeof window !== "undefined"
                        ? JSON.parse(
                            localStorage.getItem("user") ||
                            "null"
                        )
                        : null;

                if (user) {
                    const enrollRes = await axios.get(
                        `${BASE_API_URL}my-courses/${user.id}`
                    );

                    if (enrollRes.data.status) {
                        setEnrolledCourses(
                            enrollRes.data.data.all || []
                        );
                    }
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <div className="footer_sec position-relative">
                <div className="footer_blur_text">
                    <h5>Velearn</h5>
                </div>
                <div className="section_container p-xl">
                    <div className="row page_links">
                        {/* Desktop View */}
                        <div className="d-none d-lg-block">
                            <div className="d-flex justify-content-center">
                                <div className="col-lg-11 px-lg-0">
                                    <div className="row justify-content-between">
                                        <div className="col-lg-3 mb-3">
                                            <div>
                                                <h3>Live Classes</h3>
                                                <ul className="p-0">
                                                    <li>
                                                        <Link href="/live-course/full-stack-development">
                                                            Full Stack
                                                            Development
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/live-course/ui-ux-design">
                                                            UI/UX Design
                                                            Course
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/live-course/digital-marketing">
                                                            Digital
                                                            Marketing
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/live-course/data-science">
                                                            Data Science
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 mb-3">
                                            <div>
                                                <h3>Trending Courses</h3>
                                                <ul className="p-0">
                                                    {trendingCourses.map(
                                                        (course) => {
                                                            const isEnrolled =
                                                                enrolledCourses.some(
                                                                    (c) =>
                                                                        c.id ===
                                                                        course.id,
                                                                );
                                                            return (
                                                                <li
                                                                    key={
                                                                        course.id
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={
                                                                            isEnrolled
                                                                                ? `/learn/${course.slug}`
                                                                                : `/course-details/${course.slug}`
                                                                        }
                                                                    >
                                                                        {
                                                                            course.title
                                                                        }
                                                                    </Link>
                                                                </li>
                                                            );
                                                        },
                                                    )}

                                                    <li>
                                                        <Link href="/recorded-course">
                                                            All Courses
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 mb-3">
                                            <div>
                                                <h3>Self Paced Courses</h3>
                                                <ul className="p-0">
                                                    <li>
                                                        <Link href="/recorded-course/paid">
                                                            Paid Courses
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/recorded-course/combo">
                                                            Combo Courses
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/recorded-course/free">
                                                            Free Courses
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row justify-content-between">
                                        <div className="col-lg-3 mb-3">
                                            <div>
                                                <h3>Resources</h3>
                                                <ul className="p-0">
                                                    <li>
                                                        <Link href="/webinar">
                                                            Webinars
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blogs">
                                                            Blogs
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/refer-and-earn">
                                                            Rewards &
                                                            Referrals
                                                        </Link>
                                                    </li>
                                                    {/* <li><Link href="">Become An Affilliate</Link></li> */}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 mb-3">
                                            <div>
                                                <h3>Practice</h3>
                                                <ul className="p-0">
                                                    <li>
                                                        <Link href="/ide">
                                                            IDE
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/debugging">
                                                            Debugging
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 mb-3">
                                            <div>
                                                <h3>Company</h3>
                                                <ul className="p-0">
                                                    <li>
                                                        <Link href="/refund-policy">
                                                            Refund Policy
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/faq">
                                                            FAQs
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/about-us">
                                                            About Us
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/doubt-support">
                                                            Doubt Support
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/contact-us">
                                                            Contact Us
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Mobile Accordion */}
                        <div
                            className="accordion d-lg-none"
                            id="footerAccordion"
                        >
                            {/* LiveCourses */}
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="headingLiveCourses"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseLiveCourses"
                                    >
                                        Live Classes
                                    </button>
                                </h2>
                                <div
                                    id="collapseLiveCourses"
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#footerAccordion"
                                >
                                    <div className="accordion-body px-0">
                                        <ul className="p-0">
                                            <li>
                                                <Link href="/live-course/full-stack-development">
                                                    Full Stack Development
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/live-course/ui-ux-design">
                                                    UI/UX Design Course
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/live-course/digital-marketing">
                                                    Digital Marketing
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/live-course/data-science">
                                                    Data Science
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Trending */}
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="headingTrending"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseTrending"
                                    >
                                        Trending Courses
                                    </button>
                                </h2>
                                <div
                                    id="collapseTrending"
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#footerAccordion"
                                >
                                    <div className="accordion-body px-0">
                                        <ul className="p-0">
                                            {trendingCourses.map(
                                                (course) => {
                                                    const isEnrolled =
                                                        enrolledCourses.some(
                                                            (c) =>
                                                                c.id ===
                                                                course.id,
                                                        );
                                                    return (
                                                        <li key={course.id}>
                                                            <Link
                                                                href={
                                                                    isEnrolled
                                                                        ? `/learn/${course.slug}`
                                                                        : `/course-details/${course.slug}`
                                                                }
                                                            >
                                                                {
                                                                    course.title
                                                                }
                                                            </Link>
                                                        </li>
                                                    );
                                                },
                                            )}

                                            <li>
                                                <Link href="/recorded-course">
                                                    All Courses
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* SelfPaced */}
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="headingSelfPaced"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseSelfPaced"
                                    >
                                        Self Paced Courses
                                    </button>
                                </h2>
                                <div
                                    id="collapseSelfPaced"
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#footerAccordion"
                                >
                                    <div className="accordion-body px-0">
                                        <ul className="p-0">
                                            <li>
                                                <Link href="/recorded-course/paid">
                                                    Paid Courses
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/recorded-course/combo">
                                                    Combo Courses
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/recorded-course/free">
                                                    Free Courses
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Resources */}
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="headingResources"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseResources"
                                    >
                                        Resources
                                    </button>
                                </h2>
                                <div
                                    id="collapseResources"
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#footerAccordion"
                                >
                                    <div className="accordion-body px-0">
                                        <ul className="p-0">
                                            <li>
                                                <Link href="/webinar">
                                                    Webinars
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/blogs">
                                                    Blogs
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/refer-and-earn">
                                                    Rewards & Referrals
                                                </Link>
                                            </li>
                                            {/* <li><Link href="">Become An Affilliate</Link></li> */}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="headingPractice"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapsePractice"
                                    >
                                        Practice
                                    </button>
                                </h2>
                                <div
                                    id="collapsePractice"
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#footerAccordion"
                                >
                                    <div className="accordion-body px-0">
                                        <ul className="p-0">
                                            <li>
                                                <Link href="/ide">IDE</Link>
                                            </li>
                                            <li>
                                                <Link href="/debugging">
                                                    Debugging
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2
                                    className="accordion-header"
                                    id="headingCompany"
                                >
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseCompany"
                                    >
                                        Company
                                    </button>
                                </h2>
                                <div
                                    id="collapseCompany"
                                    className="accordion-collapse collapse"
                                    data-bs-parent="#footerAccordion"
                                >
                                    <div className="accordion-body px-0">
                                        <ul className="p-0">
                                            <li>
                                                <Link href="/refund-policy">
                                                    Refund Policy
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/faq">FAQs</Link>
                                            </li>
                                            <li>
                                                <Link href="/about-us">
                                                    About Us
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/doubt-support">
                                                    Support Center
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/contact-us">
                                                    Contact Us
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="col-12 d-flex justify-content-center">
                        <div className="col-lg-11">
                            {/* About & Social */}
                            <div className="row bottom_social_media">
                                <div className="col-lg-7">
                                    <Link href="/">
                                        <span className="h1 footerLogo fw-bolder text-white">
                                            Velearn
                                        </span>
                                    </Link>
                                    <p className="mt-3 lh-lg">
                                        Velearn, a trusted online IT
                                        education provider, specializes in
                                        delivering industry-aligned courses
                                        designed by experienced trainers.
                                        Since its inception, Veleam has
                                        focused on practical learning
                                        job-oriented skills, and accessible
                                        training for all aspiring tech
                                        professionals. With a growing leamer
                                        community, Veleom continues to
                                        support career transformation
                                        through quality leaming.
                                    </p>
                                </div>

                                <div className="col-lg-2 col-6">
                                    <h3 className="mt-3">Follow Us</h3>
                                    <div className="col-12 mb-3 mt-4">
                                        <div className="d-flex gap-3">
                                            <div className="footer_icons">
                                                <a
                                                    href="https://facebook.com/velearn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Image
                                                        src={`${BASE_IMAGE_URL}icons/facebook.png`}
                                                        alt="Facebook"
                                                        height={100}
                                                        width={100}
                                                        unoptimized
                                                    />
                                                </a>
                                            </div>
                                            <div className="footer_icons">
                                                <a
                                                    href="https://twitter.com/velearn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Image
                                                        src={`${BASE_IMAGE_URL}icons/twitter.png`}
                                                        alt="Twitter"
                                                        height={100}
                                                        width={100}
                                                        unoptimized
                                                    />
                                                </a>
                                            </div>
                                            <div className="footer_icons">
                                                <a
                                                    href="https://instagram.com/velearn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Image
                                                        src={`${BASE_IMAGE_URL}icons/instagram.png`}
                                                        alt="Instagram"
                                                        height={100}
                                                        width={100}
                                                        unoptimized
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <div className="d-flex gap-3">
                                            <div className="footer_icons">
                                                <a
                                                    href="https://linkedin.com/company/velearn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Image
                                                        src={`${BASE_IMAGE_URL}icons/linkedin.png`}
                                                        alt="LinkedIn"
                                                        height={100}
                                                        width={100}
                                                        unoptimized
                                                    />
                                                </a>
                                            </div>
                                            <div className="footer_icons">
                                                <a
                                                    href="https://youtube.com/@velearn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Image
                                                        src={`${BASE_IMAGE_URL}icons/youtube.png`}
                                                        alt="YouTube"
                                                        height={100}
                                                        width={100}
                                                        unoptimized
                                                    />
                                                </a>
                                            </div>
                                            <div className="footer_icons">
                                                <a
                                                    href="https://t.me/velearn"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Image
                                                        src={`${BASE_IMAGE_URL}icons/telegram.png`}
                                                        alt="Telegram"
                                                        height={100}
                                                        width={100}
                                                        unoptimized
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-6 d-flex flex-column align-items-center app_img">
                                    <div className="one mt-3">
                                        <a
                                            href=""
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Image
                                                src={`${BASE_IMAGE_URL}icons/google-play.png`}
                                                alt="google-play"
                                                height={100}
                                                width={100}
                                                unoptimized
                                            />
                                        </a>
                                    </div>
                                    <div className="one">
                                        <a
                                            href=""
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Image
                                                src={`${BASE_IMAGE_URL}icons/apple-store.png`}
                                                alt="apple-store"
                                                height={100}
                                                width={100}
                                                unoptimized
                                            />
                                        </a>
                                    </div>
                                    <div className="one">
                                        <a
                                            href=""
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <p className="mb-0">
                                                {" "}
                                                Refer & Earn
                                            </p>
                                        </a>
                                    </div>
                                    <div className="two">
                                        <a
                                            href=""
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <p className="mb-0">
                                                Became an affilate
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            {/* Bottom Bar */}
                            <div className="row d-flex flex-lg-row flex-column-reverse">
                                <div className="col-lg-4">
                                    <div className="col-12 pt-2 d-flex justify-content-lg-start justify-content-center gap-1">
                                        <span>
                                            © {new Date().getFullYear()} All
                                            Rights Reserved by{" "}
                                        </span>
                                        <Link href="/"> Velearn</Link>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="col-12 pt-2 d-flex justify-content-center">
                                        <Link href="/terms-and-conditions">
                                            Terms & Conditions
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="col-12 pt-2 d-flex justify-content-lg-end justify-content-center">
                                        <Link href="/privacy-policy">
                                            Privacy Policy
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}