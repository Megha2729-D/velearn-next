"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import html2pdf from "html2pdf.js";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";
import "./style.css"

// IMPORTANT:
// In Next.js App Router, global CSS should normally be imported
// from app/layout.tsx, not directly from page.tsx.
//
// Make sure these are imported in your app/layout.tsx:
// import "@/styles/CoursesCertificates.css";
// import "@/styles/ProfileDashboard.css";

const BASE_IMAGE_URL = "https://velearn.in/assets/images/";
const BASE_API_URL = "https://crm.velearn.in/api/";

interface User {
    id: number | string;
    name?: string | null;
}

interface Course {
    id?: number | string;
    title: string;
    type?: "recorded" | "live";
    [key: string]: any;
}

interface LiveCourse {
    id?: number | string;
    title: string;
    batch?: {
        end_date?: string | null;
        [key: string]: any;
    } | null;
    [key: string]: any;
}

interface RecordedCourseResponse {
    status?: boolean;
    data?: {
        completed?: Course[];
        [key: string]: any;
    };
}

interface LiveCourseResponse {
    status?: boolean;
    data?: LiveCourse[];
}

const CoursesCertificates = () => {
    const [loading, setLoading] = useState(true);

    const [completedCourses, setCompletedCourses] = useState<Course[]>([]);

    const [user, setUser] = useState<User | null>(null);

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const [downloading, setDownloading] = useState(false);

    const certificateRef = useRef<HTMLDivElement | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // =========================================================
    // FETCH COURSES
    // =========================================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);

                setUser(parsedUser);

                if (parsedUser.id) {
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

    const fetchCourses = async (userId: number | string) => {
        try {
            // =====================================================
            // FETCH RECORDED COURSES
            // =====================================================

            const recordedRes =
                await axios.get<RecordedCourseResponse>(
                    `${BASE_API_URL}my-courses/${userId}`
                );

            let recordedCompleted: Course[] = [];

            if (recordedRes.data?.status) {
                recordedCompleted =
                    recordedRes.data?.data?.completed || [];
            }

            // =====================================================
            // FETCH LIVE COURSES
            // =====================================================

            const token = localStorage.getItem("token");

            const headers = token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {};

            const liveRes =
                await axios.get<LiveCourseResponse>(
                    `${BASE_API_URL}live-course-history/${userId}`,
                    {
                        headers,
                    }
                );

            let liveCompleted: LiveCourse[] = [];

            if (liveRes.data?.status) {
                const today = new Date();

                today.setHours(0, 0, 0, 0);

                liveCompleted = (liveRes.data?.data || []).filter(
                    (course) => {
                        if (
                            !course.batch ||
                            !course.batch.end_date
                        ) {
                            return false;
                        }

                        const endDate = new Date(
                            course.batch.end_date
                        );

                        return endDate < today;
                    }
                );
            }

            // =====================================================
            // COMBINE RECORDED + LIVE COURSES
            // =====================================================

            const combined: Course[] = [
                ...recordedCompleted.map((course) => ({
                    ...course,
                    type: "recorded" as const,
                })),

                ...liveCompleted.map((course) => ({
                    ...course,
                    type: "live" as const,
                })),
            ];

            // =====================================================
            // REMOVE DUPLICATE COURSES BY TITLE
            // =====================================================

            const unique: Course[] = [];

            const seen = new Set<string>();

            for (const course of combined) {
                if (!seen.has(course.title)) {
                    unique.push(course);
                    seen.add(course.title);
                }
            }

            setCompletedCourses(unique);
        } catch (error) {
            console.error(
                "Error fetching courses:",
                error
            );

            setCompletedCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // AUTOMATIC PDF DOWNLOAD
    // =========================================================

    useEffect(() => {
        if (selectedCourse && !downloading) {
            setDownloading(true);

            // Small delay so hidden certificate template
            // and images can render properly.
            const timer = setTimeout(() => {
                handleDownloadPDF(selectedCourse);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [selectedCourse]);

    // =========================================================
    // DOWNLOAD CERTIFICATE PDF
    // =========================================================

    const handleDownloadPDF = async (course: Course) => {
        if (!certificateRef.current) {
            setDownloading(false);
            setSelectedCourse(null);
            return;
        }

        try {
            const element = certificateRef.current;

            const safeTitle = course.title
                .replace(/\s+/g, "_")
                .replace(/[\\/:*?"<>|]/g, "");
            const options = {
                margin: 10,

                filename: `${safeTitle}_Certificate.pdf`,

                image: {
                    type: "jpeg" as const,
                    quality: 1,
                },

                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    backgroundColor: "#ffffff",
                },

                jsPDF: {
                    unit: "mm" as const,
                    format: "a4" as const,
                    orientation: "landscape" as const,
                },

                pagebreak: {
                    mode: "avoid-all" as const,
                },
            };

            await html2pdf()
                .set(options)
                .from(element)
                .save();

            setDownloading(false);
            setSelectedCourse(null);
        } catch (error) {
            console.error(
                "PDF generation failed:",
                error
            );

            setDownloading(false);
            setSelectedCourse(null);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="p-5 text-center">
                Loading certificates...
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="dashboard_layout">

            {/* =====================================================
          SIDEBAR
      ===================================================== */}

            <Sidebar
                recordedCoursesCount={
                    completedCourses.filter(
                        (course) =>
                            course.type === "recorded"
                    ).length
                }

                liveCoursesCount={
                    completedCourses.filter(
                        (course) =>
                            course.type === "live"
                    ).length
                }

                activePage=""

                isOpen={isSidebarOpen}

                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ===================================================== */}

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* =====================================================
          NOTIFICATION MODAL
      ===================================================== */}

            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() =>
                    setIsNotifOpen(false)
                }
                notifications={[]}
            />

            {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

            <div className="dashboard_main_content">

                {/* ===================================================
            HEADER
        =================================================== */}

                <header className="dashboard_top_header">

                    <div className="d-flex align-items-center gap-3">

                        {/* Mobile Menu */}

                        <button
                            type="button"
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        {/* Page Title */}

                        <div className="profile_breadcrumb mb-0">
                            <h2>My Certificates</h2>
                        </div>

                    </div>

                    {/* Notification */}

                    <div
                        className="notification_bell_top"
                        onClick={() =>
                            setIsNotifOpen(true)
                        }
                    >
                        <i className="bi bi-bell"></i>
                    </div>

                </header>

                {/* ===================================================
            CERTIFICATES PAGE
        =================================================== */}

                <div className="certificates_page px-3 px-lg-4">

                    <div className="section_container pt-2 pb-4">

                        {/* =================================================
                NO COMPLETED COURSES
            ================================================= */}

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

                            /* =================================================
                               COMPLETED COURSES
                            ================================================= */

                            <div className="row g-4">

                                {completedCourses.map(
                                    (course, idx) => (

                                        <div
                                            key={
                                                course.id ??
                                                `${course.title}-${idx}`
                                            }
                                            className="col-xl-4 col-lg-6 col-md-6 col-12"
                                        >

                                            <div className="certificate_card">

                                                {/* Certificate Icon */}

                                                <div className="cert_card_icon">

                                                    <i className="bi bi-patch-check-fill"></i>

                                                </div>

                                                {/* Certificate Content */}

                                                <div className="cert_card_content">

                                                    <h5>
                                                        {course.title}
                                                    </h5>

                                                    <p className="small text-muted mb-3">
                                                        Successfully Completed
                                                    </p>

                                                    {/* Download Button */}

                                                    <button
                                                        type="button"
                                                        className="view_cert_btn"
                                                        onClick={() => {
                                                            if (!downloading) {
                                                                setSelectedCourse(
                                                                    course
                                                                );
                                                            }
                                                        }}
                                                        disabled={downloading}
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

                </div>

            </div>

            {/* =====================================================
          HIDDEN CERTIFICATE TEMPLATE
      ===================================================== */}

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

                                        {/* Watermark */}

                                        <div className="cert_watermark_svg"></div>

                                        {/* Verified Ribbon */}

                                        <div className="verified_ribbon">

                                            VERIFIED{" "}

                                            <i className="bi bi-patch-check-fill ms-1"></i>

                                        </div>

                                        {/* =================================================
                        CERTIFICATE HEADER
                    ================================================= */}

                                        <div className="cert_header_row">

                                            <img
                                                src={`/images/velearn-logo.png`}
                                                alt="Velearn"
                                                className="cert_logo_img"
                                                crossOrigin="anonymous"
                                            />

                                        </div>

                                        {/* =================================================
                        CERTIFICATE BODY
                    ================================================= */}

                                        <div className="cert_content_body">

                                            <h1 className="cert_main_title">
                                                CERTIFICATE
                                            </h1>

                                            <div className="cert_divider_ornate"></div>

                                            <p className="cert_intro_text">
                                                This is to certify that
                                            </p>

                                            <h2 className="cert_user_name">
                                                {user?.name || "Student"}
                                            </h2>

                                            <p className="cert_completion_text">
                                                has successfully completed all
                                                academic requirements for
                                            </p>

                                            <h4 className="cert_course_title">
                                                {selectedCourse.title}
                                            </h4>

                                        </div>

                                        {/* =================================================
                        GOLD SEAL
                    ================================================= */}

                                        <div className="cert_gold_seal">

                                            <div className="seal_inner">

                                                <i
                                                    className="bi bi-award-fill"
                                                    style={{
                                                        fontSize: "2rem",
                                                    }}
                                                ></i>

                                                <span
                                                    style={{
                                                        fontSize: "0.6rem",
                                                        fontWeight: 800,
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

                                        {/* =================================================
                        FOOTER
                    ================================================= */}

                                        <div className="cert_footer_row">

                                            {/* LEFT FOOTER */}

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
                                                        <br />
                                                        velearn.in/verify
                                                    </p>

                                                </div>

                                            </div>

                                            {/* RIGHT FOOTER */}

                                            <div className="cert_footer_right">

                                                <div className="cert_signature_area">

                                                    <img
                                                        src="/images/icons/signature.png"
                                                        alt="Velearn signature"
                                                        className="cert_signature_img"
                                                        crossOrigin="anonymous"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display =
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