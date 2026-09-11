"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "./style.css";

const BASE_IMAGE_URL = "https://velearn.in/assets/images/";

const CoursesCertificates = () => {
const [loading, setLoading] = useState(true);
const [completedCourses, setCompletedCourses] = useState([]);
const [user, setUser] = useState(null);
const [selectedCourse, setSelectedCourse] = useState(null);
const [downloading, setDownloading] = useState(false);

const certificateRef = useRef(null);

const getBaseApiUrl = () => {
    if (typeof window === "undefined") {
        return "https://crm.velearn.in/api/";
    }

    const isProduction =
        window.location.hostname === "velearn.in" ||
        window.location.hostname === "www.velearn.in";

    return isProduction
        ? "https://crm.velearn.in/api/"
        : `http://${window.location.hostname}:8000/api/`;
};

const fetchCourses = async (userId) => {
    const BASE_API_URL = getBaseApiUrl();

    try {
        // Fetch recorded courses
        const recordedRes = await axios.get(
            `${BASE_API_URL}my-courses/${userId}`
        );

        let recordedCompleted = [];

        if (recordedRes.data.status) {
            recordedCompleted =
                recordedRes.data.data?.completed || [];
        }

        // Fetch live courses
        const token = localStorage.getItem("token");

        const headers = token
            ? {
                  Authorization: `Bearer ${token}`,
              }
            : {};

        const liveRes = await axios.get(
            `${BASE_API_URL}live-course-history/${userId}`,
            {
                headers,
            }
        );

        let liveCompleted = [];

        if (liveRes.data.status) {
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            liveCompleted = (liveRes.data.data || []).filter(
                (course) =>
                    course.batch &&
                    course.batch.end_date &&
                    new Date(course.batch.end_date) < today
            );
        }

        // Combine recorded and live courses
        const combined = [
            ...recordedCompleted.map((course) => ({
                ...course,
                type: "recorded",
            })),

            ...liveCompleted.map((course) => ({
                ...course,
                type: "live",
            })),
        ];

        // Remove duplicate courses by title
        const unique = [];
        const seen = new Set();

        for (const course of combined) {
            if (!seen.has(course.title)) {
                unique.push(course);
                seen.add(course.title);
            }
        }

        setCompletedCourses(unique);
    } catch (error) {
        console.error("Error fetching courses:", error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

            if (parsedUser?.id) {
                fetchCourses(parsedUser.id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error parsing stored user:", error);
            setLoading(false);
        }
    } else {
        setLoading(false);
    }
}, []);

useEffect(() => {
    if (selectedCourse && !downloading) {
        setDownloading(true);

        // Wait for certificate template and images to render
        const timer = setTimeout(() => {
            handleDownloadPDF(selectedCourse);
        }, 800);

        return () => clearTimeout(timer);
    }
}, [selectedCourse]);

const handleDownloadPDF = (course) => {
    if (!certificateRef.current) {
        setDownloading(false);
        setSelectedCourse(null);
        return;
    }

    try {
        const element = certificateRef.current;

        const opt = {
            margin: 10,

            filename: `${course.title.replace(
                /\s+/g,
                "_"
            )}_Certificate.pdf`,

            image: {
                type: "jpeg",
                quality: 1,
            },

            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                backgroundColor: "#ffffff",
            },

            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "landscape",
            },

            pagebreak: {
                mode: "avoid-all",
            },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                setDownloading(false);
                setSelectedCourse(null);
            })
            .catch((error) => {
                console.error(
                    "PDF generation failed:",
                    error
                );

                setDownloading(false);
                setSelectedCourse(null);
            });
    } catch (error) {
        console.error(
            "PDF generation failed:",
            error
        );

        setDownloading(false);
        setSelectedCourse(null);
    }
};

if (loading) {
    return (
        <div className="p-5 text-center">
            Loading certificates...
        </div>
    );
}

return (
    <div className="certificates_page">
        <div className="section_container py-5">

            {/* Breadcrumb */}
            <nav className="mb-4 d-flex align-items-center gap-2 small">
                <Link
                    href="/"
                    className="text-muted text-decoration-none"
                >
                    Home
                </Link>

                <i
                    className="bi bi-chevron-right text-muted"
                    style={{
                        fontSize: "10px",
                    }}
                ></i>

                <span className="text-dark fw-bold">
                    My Certificates
                </span>
            </nav>

            {/* Page Title */}
            <h2 className="mb-4">
                Your{" "}
                <span className="text-c2">
                    Certificates
                </span>
            </h2>

            {/* No Certificates */}
            {completedCourses.length === 0 ? (
                <div className="text-center py-5">
                    <i
                        className="bi bi-patch-exclamation text-muted"
                        style={{
                            fontSize: "3rem",
                        }}
                    ></i>

                    <p className="mt-3">
                        No completed courses found yet.
                        Complete a course to earn your
                        certificate!
                    </p>

                    <Link
                        href="/recorded-course"
                        className="btn_signup mt-2"
                        style={{
                            display: "inline-block",
                            textDecoration: "none",
                        }}
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                /* Certificate Cards */
                <div className="row g-4">
                    {completedCourses.map(
                        (course, idx) => (
                            <div
                                key={
                                    course.id ||
                                    course.title ||
                                    idx
                                }
                                className="col-lg-4 col-md-6"
                            >
                                <div className="certificate_card">
                                    <div className="cert_card_icon">
                                        <i className="bi bi-patch-check-fill"></i>
                                    </div>

                                    <div className="cert_card_content">
                                        <h5>
                                            {course.title}
                                        </h5>

                                        <p className="small text-muted mb-3">
                                            Successfully
                                            Completed
                                        </p>

                                        <button
                                            type="button"
                                            className="view_cert_btn"
                                            onClick={() =>
                                                !downloading &&
                                                setSelectedCourse(
                                                    course
                                                )
                                            }
                                            disabled={
                                                downloading
                                            }
                                        >
                                            {downloading &&
                                            selectedCourse?.title ===
                                                course.title ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>

                                                    Downloading...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-file-earmark-pdf-fill me-2"></i>

                                                    Download PDF
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>

        {/* Hidden Certificate Template */}
        <div
            style={{
                position: "absolute",
                left: "-9999px",
                top: 0,
                opacity: 0,
                pointerEvents: "none",
            }}
        >
            {selectedCourse && (
                <div
                    className="certificate_template_wrapper"
                    ref={certificateRef}
                >
                    <div className="certificate_main">
                        <div className="cert_outer_frame">
                            <div className="cert_academic_border">
                                <div className="cert_inner_border">

                                    <div className="cert_watermark_svg"></div>

                                    {/* Verified Ribbon */}
                                    <div className="verified_ribbon">
                                        VERIFIED{" "}
                                        <i className="bi bi-patch-check-fill ms-1"></i>
                                    </div>

                                    {/* Header */}
                                    <div className="cert_header_row">
                                        <img
                                            src={`${BASE_IMAGE_URL}velearn-logo.png`}
                                            alt="Velearn"
                                            className="cert_logo_img"
                                        />
                                    </div>

                                    {/* Certificate Content */}
                                    <div className="cert_content_body">
                                        <h1 className="cert_main_title">
                                            CERTIFICATE
                                        </h1>

                                        <div className="cert_divider_ornate"></div>

                                        <p className="cert_intro_text">
                                            This is to certify that
                                        </p>

                                        <h2 className="cert_user_name">
                                            {user?.name}
                                        </h2>

                                        <p className="cert_completion_text">
                                            has successfully completed
                                            all academic requirements
                                            for
                                        </p>

                                        <h4 className="cert_course_title">
                                            {
                                                selectedCourse.title
                                            }
                                        </h4>
                                    </div>

                                    {/* Gold Seal */}
                                    <div className="cert_gold_seal">
                                        <div className="seal_inner">
                                            <i
                                                className="bi bi-award-fill"
                                                style={{
                                                    fontSize:
                                                        "2rem",
                                                }}
                                            ></i>

                                            <span
                                                style={{
                                                    fontSize:
                                                        "0.6rem",
                                                    fontWeight:
                                                        "800",
                                                    textTransform:
                                                        "uppercase",
                                                    letterSpacing:
                                                        "1px",
                                                }}
                                            >
                                                Official Academy
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="cert_footer_row">

                                        <div className="cert_footer_left">
                                            <div className="cert_meta_info">

                                                <p className="mb-0">
                                                    <strong>
                                                        Certificate ID:
                                                    </strong>{" "}
                                                    VL-
                                                    {Math.floor(
                                                        100000 +
                                                            Math.random() *
                                                                900000
                                                    )}
                                                </p>

                                                <p className="mb-0">
                                                    <strong>
                                                        Issue Date:
                                                    </strong>{" "}
                                                    {new Date().toLocaleDateString(
                                                        "en-GB"
                                                    )}
                                                </p>

                                                <p className="cert_footer_note">
                                                    *Digital Verification:
                                                    velearn.in/verify
                                                </p>

                                            </div>
                                        </div>

                                        <div className="cert_footer_right">
                                            <div className="cert_signature_area">

                                                <img
                                                    src="/assets/images/icons/signature.png"
                                                    alt="Signature"
                                                    className="cert_signature_img"
                                                    onError={(
                                                        e
                                                    ) => {
                                                        e.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />

                                                <div className="cert_signature_line">
                                                    Velearn Academy
                                                </div>

                                                <div className="cert_signature_role">
                                                    Managing Director
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

};

export default CoursesCertificates;
