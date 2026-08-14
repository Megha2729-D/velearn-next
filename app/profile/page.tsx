"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

import Sidebar from "@/components/layout/Sidebar";
import "./style.css"
// If Profile.css and ProfileDashboard.css are global CSS files,
// import them from your app/layout.tsx instead of here.

const BASE_API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://crm.velearn.in/api/";

const BASE_IMAGE_URL =
    process.env.NEXT_PUBLIC_IMAGE_URL ||
    "https://crm.velearn.in/public/";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface ProfileData {
    id?: number | string;
    auth_id?: number | string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    primary_phone?: string;
    secondary_phone?: string;
    date_of_birth?: string;
    gender?: string;
    education?: string;
    designation?: string;
    address?: string;
    state_id?: number | string;
    image?: string;
}

interface StoredUser {
    id?: number | string;
    auth_id?: number | string;
    name?: string;
    email?: string;
    phonenumber?: string;
    image?: string;
    referral_code?: string;
}

interface StateData {
    id: number | string;
    state_name: string;
}

interface RecordedCourse {
    id: number | string;
    title: string;
    thumbnail?: string;
    short_description?: string;
    enrollment?: {
        completed_quizzes?: number | string;
        total_quizzes?: number | string;
        status?: string;
        enrolled_at?: string;
        completed_at?: string;
    };
}

interface LiveCourse {
    id: number | string;
    title: string;
    thumbnail?: string;
    status?: number | string;
    batch?: {
        name?: string;
        instructor?: string;
        batch_time?: string;
        end_date?: string;
    };
}

interface Certificate {
    id: number | string;
    name: string;
    issuer: string;
    date: string;
    tags: string[];
}

interface Invoice {
    id: number | string;
    type: "recorded" | "live";
    course: string;
    invoice_number: string;
    date: string;
    paid_amount?: number | string;
    status: string;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function Profile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [states, setStates] = useState<StateData[]>([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [recordedCourses, setRecordedCourses] = useState<
        RecordedCourse[]
    >([]);

    const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);

    const [courseListLoading, setCourseListLoading] = useState(true);

    const [courseTab, setCourseTab] = useState<"recorded" | "live">(
        "recorded"
    );

    const [invoiceTab, setInvoiceTab] = useState<"recorded" | "live">(
        "recorded"
    );

    const [dynamicCertificates, setDynamicCertificates] = useState<
        Certificate[]
    >([]);

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(true);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --------------------------------------------------
    // NEXT.JS SAFE LOCAL STORAGE DATA
    // --------------------------------------------------

    const [token, setToken] = useState<string | null>(null);
    const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
    const [userId, setUserId] = useState<number | string | null>(null);

    // --------------------------------------------------
    // GET USER FROM LOCAL STORAGE
    // --------------------------------------------------

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const storedToken = localStorage.getItem("token");
            const storedUserString = localStorage.getItem("user");

            let parsedUser: StoredUser | null = null;

            if (storedUserString) {
                parsedUser = JSON.parse(storedUserString);
            }

            setToken(storedToken);
            setStoredUser(parsedUser);

            const id = parsedUser?.id || parsedUser?.auth_id;

            setUserId(id || null);
        } catch (error) {
            console.error("Local storage error:", error);
        }
    }, []);

    // --------------------------------------------------
    // FETCH PROFILE
    // --------------------------------------------------

    const fetchProfile = async () => {
        if (!userId) return;

        try {
            const res = await axios.get(`${BASE_API_URL}profile`, {
                params: {
                    user_id: userId,
                    auth_id: userId,
                },
                headers: token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : {},
            });

            if (res.data?.data) {
                setProfile(res.data.data);
            }
        } catch (error) {
            console.log("Fetch profile error:", error);
        }
    };

    // --------------------------------------------------
    // FETCH STATES
    // --------------------------------------------------

    const fetchStates = async () => {
        try {
            const res = await axios.get(`${BASE_API_URL}states`);

            if (res.data?.data) {
                setStates(res.data.data);
            }
        } catch (error) {
            console.log("States fetch error:", error);
        }
    };

    // --------------------------------------------------
    // FETCH COURSES + INVOICES
    // --------------------------------------------------

    const fetchCoursesData = async () => {
        if (!userId) return;

        setCourseListLoading(true);
        setInvoicesLoading(true);

        const headers = token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {};

        try {
            const [
                resRecorded,
                resLive,
                resInvoices,
            ] = await Promise.all([
                axios
                    .get(`${BASE_API_URL}my-courses/${userId}`)
                    .catch(() => ({
                        data: {
                            status: false,
                            data: {
                                all: [],
                                completed: [],
                            },
                        },
                    })),

                axios
                    .get(
                        `${BASE_API_URL}live-course-history/${userId}`,
                        {
                            headers,
                        }
                    )
                    .catch(() => ({
                        data: {
                            status: false,
                            data: [],
                        },
                    })),

                axios
                    .get(
                        `${BASE_API_URL}student-invoices/${userId}`,
                        {
                            headers,
                        }
                    )
                    .catch(() => ({
                        data: {
                            status: false,
                            data: [],
                        },
                    })),
            ]);

            // --------------------------------------------------
            // RECORDED COURSES
            // --------------------------------------------------

            let recordedAll: RecordedCourse[] = [];
            let recordedCompleted: RecordedCourse[] = [];

            if (resRecorded.data.status) {
                recordedAll =
                    resRecorded.data.data?.all || [];

                recordedCompleted =
                    resRecorded.data.data?.completed || [];

                setRecordedCourses(recordedAll);
            } else {
                setRecordedCourses([]);
            }

            // --------------------------------------------------
            // LIVE COURSES
            // --------------------------------------------------

            let liveAll: LiveCourse[] = [];
            let liveCompleted: LiveCourse[] = [];

            if (resLive.data.status) {
                liveAll = resLive.data.data || [];

                setLiveCourses(liveAll);

                const today = new Date();

                today.setHours(0, 0, 0, 0);

                liveCompleted = liveAll.filter(
                    (course) =>
                        course.batch &&
                        course.batch.end_date &&
                        new Date(course.batch.end_date) <
                        today
                );
            } else {
                setLiveCourses([]);
            }

            // --------------------------------------------------
            // CERTIFICATES
            // --------------------------------------------------

            const combinedCerts: Certificate[] = [
                ...recordedCompleted.map((course) => ({
                    id: course.id,
                    name: course.title,
                    issuer: "Velearn Academy",
                    date:
                        course.enrollment?.completed_at ||
                        "2025",
                    tags: [
                        "Certified",
                        "Academic Excellence",
                    ],
                })),

                ...liveCompleted.map((course) => ({
                    id: course.id,
                    name: course.title,
                    issuer: "Velearn Academy",
                    date:
                        course.batch?.end_date ||
                        "2025",
                    tags: [
                        "Live Bootcamp",
                        "Hands-on Project",
                    ],
                })),
            ];

            // --------------------------------------------------
            // REMOVE DUPLICATE CERTIFICATES
            // --------------------------------------------------

            const uniqueCerts: Certificate[] = [];
            const seenNames = new Set<string>();

            combinedCerts.forEach((cert) => {
                if (!seenNames.has(cert.name)) {
                    uniqueCerts.push(cert);
                    seenNames.add(cert.name);
                }
            });

            setDynamicCertificates(uniqueCerts);

            // --------------------------------------------------
            // INVOICES
            // --------------------------------------------------

            if (resInvoices.data.status) {
                setInvoices(resInvoices.data.data || []);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.log("Courses fetch error:", error);
        } finally {
            setCourseListLoading(false);
            setInvoicesLoading(false);
        }
    };

    // --------------------------------------------------
    // INITIAL DATA
    // --------------------------------------------------

    useEffect(() => {
        if (!userId) return;

        fetchProfile();
        fetchStates();
        fetchCoursesData();
    }, [userId]);

    // --------------------------------------------------
    // DEFAULT COURSE TAB
    // --------------------------------------------------

    useEffect(() => {
        if (courseListLoading) return;

        if (recordedCourses.length > 0) {
            setCourseTab("recorded");
        } else if (liveCourses.length > 0) {
            setCourseTab("live");
        }
    }, [
        courseListLoading,
        recordedCourses.length,
        liveCourses.length,
    ]);

    // --------------------------------------------------
    // DEFAULT INVOICE TAB
    // --------------------------------------------------

    useEffect(() => {
        if (invoicesLoading) return;

        const hasRecorded = invoices.some(
            (invoice) => invoice.type === "recorded"
        );

        const hasLive = invoices.some(
            (invoice) => invoice.type === "live"
        );

        if (hasRecorded) {
            setInvoiceTab("recorded");
        } else if (hasLive) {
            setInvoiceTab("live");
        }
    }, [invoicesLoading, invoices.length]);

    // --------------------------------------------------
    // HANDLE PROFILE CHANGE
    // --------------------------------------------------

    const handleChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...(prev || {}),
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // UPDATE PROFILE
    // --------------------------------------------------

    const updateProfile = async () => {
        if (!profile || !userId) return;

        setLoading(true);

        try {
            const payload = {
                user_id: userId,
                ...profile,
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
            };

            await axios.post(
                `${BASE_API_URL}profile/update`,
                payload,
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                }
            );

            // --------------------------------------------------
            // UPDATE LOCAL STORAGE
            // --------------------------------------------------

            const currentStoredUser: StoredUser =
                JSON.parse(
                    localStorage.getItem("user") || "{}"
                );

            const updatedUser: StoredUser = {
                ...currentStoredUser,

                name:
                    `${profile.first_name || ""} ${profile.last_name || ""
                        }`.trim() ||
                    currentStoredUser.name,

                image:
                    profile.image !== undefined
                        ? profile.image
                        : currentStoredUser.image,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setStoredUser(updatedUser);

            window.dispatchEvent(
                new Event("storage-update")
            );

            setShowEditModal(false);
            setShowSuccessModal(true);

            await fetchProfile();
        } catch (error) {
            console.error("Update profile error:", error);

            toast.error("Save failed");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // PROFILE IMAGE
    // --------------------------------------------------

    const getProfileImage = (): string | null => {
        if (!profile?.image) return null;

        if (profile.image.startsWith("http")) {
            return profile.image;
        }

        const imageName =
            profile.image.split("/").pop();

        if (!imageName) return null;

        return `${BASE_IMAGE_URL}uploads/students/${imageName}`;
    };

    // --------------------------------------------------
    // IMAGE UPLOAD
    // --------------------------------------------------

    const handleImageChange = async (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!userId) {
            toast.error("User ID not found");
            return;
        }

        // Validate image
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            e.target.value = "";
            return;
        }

        // Optional 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            e.target.value = "";
            return;
        }

        const formData = new FormData();

        formData.append("image", file);
        formData.append("auth_id", String(userId));

        setUploadLoading(true);

        const uploadToast = toast.loading("Uploading photo...");

        try {
            console.log("Uploading:", {
                url: `${BASE_API_URL}update-logo`,
                userId,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            });

            const response = await axios.post(
                `${BASE_API_URL}update-logo`,
                formData,
                {
                    headers: {
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },

                    timeout: 30000,
                }
            );

            console.log("Upload response:", response.data);

            if (
                response.data?.status === true ||
                response.data?.status === 1 ||
                response.data?.success === true
            ) {
                const newImage =
                    response.data?.image ||
                    response.data?.data?.image ||
                    response.data?.data?.image_url;

                if (!newImage) {
                    console.warn(
                        "Upload succeeded but image path was not returned",
                        response.data
                    );
                }

                setProfile((prev) => ({
                    ...(prev || {}),
                    image: newImage || prev?.image || "",
                }));

                // Update local storage
                try {
                    const currentUser: StoredUser = JSON.parse(
                        localStorage.getItem("user") || "{}"
                    );

                    const updatedUser = {
                        ...currentUser,
                        image: newImage || currentUser.image,
                    };

                    localStorage.setItem(
                        "user",
                        JSON.stringify(updatedUser)
                    );

                    setStoredUser(updatedUser);

                    window.dispatchEvent(
                        new Event("storage-update")
                    );
                } catch (storageError) {
                    console.error(
                        "Local storage update error:",
                        storageError
                    );
                }

                toast.success("Profile photo uploaded successfully!", {
                    id: uploadToast,
                });

                await fetchProfile();
            } else {
                console.error(
                    "Upload API returned failure:",
                    response.data
                );

                toast.error(
                    response.data?.message ||
                    response.data?.error ||
                    "Upload failed",
                    {
                        id: uploadToast,
                    }
                );
            }
        } catch (error: any) {
            console.error("UPLOAD ERROR:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Response:", error.response.data);

                const validationErrors = error.response.data?.errors;

                if (validationErrors) {
                    Object.values(validationErrors)
                        .flat()
                        .forEach((message: any) => {
                            toast.error(String(message));
                        });
                } else {
                    toast.error(
                        error.response.data?.message ||
                        "Validation failed"
                    );
                }
            } else {
                toast.error("Cannot connect to upload server");
            }
        } finally {
            setUploadLoading(false);
            e.target.value = "";
        }
    };
    // --------------------------------------------------
    // REMOVE PHOTO
    // --------------------------------------------------

    const handleRemovePhoto = async () => {
        if (!window.confirm("Remove profile photo?")) {
            return;
        }

        setProfile((prev) => ({
            ...(prev || {}),
            image: "",
        }));

        toast.success(
            "Photo removed locally. Save profile to confirm."
        );
    };

    // --------------------------------------------------
    // GET INITIALS
    // --------------------------------------------------

    const getInitials = () => {
        const name =
            profile?.first_name ||
            storedUser?.name ||
            profile?.name ||
            "U";

        return name.charAt(0).toUpperCase();
    };

    // --------------------------------------------------
    // SHARE PROFILE
    // --------------------------------------------------

    const handleShareProfile = async () => {
        try {
            const shareData = {
                title: "My Velearn Profile",
                text: "Check out my Velearn profile.",
                url: window.location.href,
            };

            if (
                navigator.share &&
                typeof navigator.share === "function"
            ) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                toast.success(
                    "Profile link copied!"
                );
            }
        } catch (error) {
            console.log("Share cancelled:", error);
        }
    };

    // --------------------------------------------------
    // COPY REFERRAL
    // --------------------------------------------------

    const handleCopyReferral = async () => {
        const referralCode =
            storedUser?.referral_code ||
            "STUDENT2025";

        try {
            await navigator.clipboard.writeText(
                referralCode
            );

            toast.success("Copied!");
        } catch {
            toast.error("Unable to copy");
        }
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading && !profile) {
        return (
            <div className="profile_page text-center">
                <div className="spinner-border text-primary mt-5"></div>
            </div>
        );
    }

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="dashboard_layout">

            {/* SIDEBAR */}

            <Sidebar
                recordedCoursesCount={
                    recordedCourses.length
                }
                liveCoursesCount={
                    liveCourses.length
                }
                activePage="profile"
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* MOBILE OVERLAY */}

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* MAIN CONTENT */}

            <div className="dashboard_main_content">

                {/* TOP HEADER */}

                <div className="dashboard_top_header">

                    <div className="d-flex align-items-center gap-3">

                        <button
                            type="button"
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(true)
                            }
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="profile_breadcrumb mb-0">
                            <h2>My Profile</h2>
                        </div>

                    </div>

                    <div className="notification_bell_top">
                        <i className="bi bi-bell"></i>
                    </div>

                </div>

                {/* --------------------------------------------------
                    PROFILE HEADER
                -------------------------------------------------- */}

                <div className="premium_card">

                    <div className="profile_banner">

                        <div className="banner_pattern"></div>

                        <div className="banner_overlay"></div>

                        {/* AVATAR */}

                        <div className="avatar_container">

                            <div
                                className={`avatar_main ${uploadLoading
                                    ? "opacity-50"
                                    : ""
                                    }`}
                            >
                                {getProfileImage() ? (
                                    <img
                                        src={
                                            getProfileImage() ||
                                            ""
                                        }
                                        alt="User"
                                    />
                                ) : (
                                    <div className="avatar_initials">
                                        {getInitials()}
                                    </div>
                                )}
                            </div>

                            <label
                                htmlFor="header-upload"
                                className="avatar_upload_badge"
                            >
                                <i className="bi bi-camera-fill"></i>
                            </label>

                            <input
                                type="file"
                                id="header-upload"
                                className="d-none"
                                accept="image/*"
                                onChange={
                                    handleImageChange
                                }
                            />

                        </div>

                        {/* STATS */}

                        <div className="header_stats_floating">

                            <div className="header_stat_card_clean">
                                <span className="h_stat_value">
                                    {
                                        recordedCourses.length
                                    }
                                </span>

                                <span className="h_stat_label">
                                    Recorded
                                </span>
                            </div>

                            <div className="header_stat_card_clean">
                                <span className="h_stat_value">
                                    {liveCourses.length}
                                </span>

                                <span className="h_stat_label">
                                    Live
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* USER INFORMATION */}

                    <div className="profile_info_row d-flex flex-wrap justify-content-between align-items-end">

                        <div className="user_title_info m-0 p-0">

                            <h1
                                className="fw-bolder mb-1"
                                style={{
                                    fontSize: "22px",
                                    color: "#0f172a",
                                }}
                            >
                                {profile?.first_name ||
                                    storedUser?.name ||
                                    profile?.name ||
                                    "Student User"}{" "}
                                {profile?.last_name || ""}
                            </h1>

                            <div
                                className="fw-semibold mb-2"
                                style={{
                                    color: "#3b82f6",
                                    fontSize: "13px",
                                }}
                            >
                                {profile?.education ||
                                    profile?.designation ||
                                    "Student"}
                            </div>

                            <div
                                className="d-flex flex-wrap text-secondary gap-3 contact_links_mob"
                                style={{
                                    fontSize: "13px",
                                }}
                            >

                                <span>
                                    <i className="bi bi-telephone text-secondary opacity-75"></i>{" "}
                                    {profile?.primary_phone ||
                                        storedUser?.phonenumber ||
                                        "+91 —"}
                                </span>

                                <span>
                                    <i className="bi bi-envelope text-secondary opacity-75"></i>{" "}
                                    {profile?.email ||
                                        storedUser?.email ||
                                        "No Email"}
                                </span>

                                <span>
                                    <i className="bi bi-geo-alt text-secondary opacity-75"></i>{" "}
                                    {profile?.address
                                        ? `${profile.address}, `
                                        : ""}
                                    {states.find(
                                        (state) =>
                                            state.id ==
                                            profile?.state_id
                                    )?.state_name ||
                                        "Location, India"}
                                </span>

                                {profile?.gender && (
                                    <span>
                                        <i className="bi bi-person text-secondary opacity-75"></i>{" "}
                                        {profile.gender ===
                                            "1"
                                            ? "Male"
                                            : "Female"}
                                    </span>
                                )}

                            </div>

                        </div>

                        {/* ACTION BUTTONS */}

                        <div className="header_actions mt-3 mt-lg-0">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowEditModal(true)
                                }
                                className="btn btn-outline-secondary rounded-pill fw-semibold px-4 pt-2 pb-2"
                                style={{
                                    fontSize: "13px",
                                    borderColor:
                                        "#e2e8f0",
                                    color: "#475569",
                                }}
                            >
                                <i className="bi bi-pencil-square me-1"></i>
                                Edit Profile
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleShareProfile
                                }
                                className="btn rounded-pill fw-semibold px-4 pt-2 pb-2 ms-2"
                                style={{
                                    fontSize: "13px",
                                    background:
                                        "#0ea5e9",
                                    color: "#fff",
                                    border: "none",
                                }}
                            >
                                <i className="bi bi-share me-1"></i>
                                Share Profile
                            </button>

                        </div>

                    </div>

                </div>

                {/* --------------------------------------------------
                    COURSES + REFERRAL
                -------------------------------------------------- */}

                <div className="row g-4">

                    {/* COURSES */}

                    <div className="col-lg-8">

                        <div className="premium_card p-4 h-100">

                            <div className="section_header">

                                <h3>
                                    <i className="bi bi-journal-check"></i>{" "}
                                    Enrolled Courses
                                </h3>

                                <Link
                                    href={
                                        courseTab ===
                                            "recorded"
                                            ? "/my-courses"
                                            : "/live-course-history"
                                    }
                                    className="view_all_link"
                                >
                                    View All
                                </Link>

                            </div>

                            {/* COURSE TABS */}

                            <div className="premium_tabs">

                                {recordedCourses.length >
                                    0 && (
                                        <button
                                            type="button"
                                            className={`tab_btn ${courseTab ===
                                                "recorded"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setCourseTab(
                                                    "recorded"
                                                )
                                            }
                                        >
                                            <i className="bi bi-play-circle"></i>{" "}
                                            Recorded Courses
                                        </button>
                                    )}

                                {liveCourses.length > 0 && (
                                    <button
                                        type="button"
                                        className={`tab_btn ${courseTab ===
                                            "live"
                                            ? "active"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            setCourseTab(
                                                "live"
                                            )
                                        }
                                    >
                                        <i className="bi bi-broadcast"></i>{" "}
                                        Live Courses{" "}
                                        <span className="badge_live">
                                            Live
                                        </span>
                                    </button>
                                )}

                            </div>

                            {/* COURSE LIST */}

                            <div className="course_list">

                                {courseListLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* RECORDED */}

                                        {courseTab ===
                                            "recorded" ? (
                                            recordedCourses.length >
                                                0 ? (
                                                recordedCourses
                                                    .slice(
                                                        0,
                                                        4
                                                    )
                                                    .map(
                                                        (
                                                            course
                                                        ) => {

                                                            const completedQuizzes =
                                                                parseInt(
                                                                    String(
                                                                        course
                                                                            .enrollment
                                                                            ?.completed_quizzes ||
                                                                        0
                                                                    )
                                                                );

                                                            const totalQuizzes =
                                                                parseInt(
                                                                    String(
                                                                        course
                                                                            .enrollment
                                                                            ?.total_quizzes ||
                                                                        0
                                                                    )
                                                                );

                                                            const progress =
                                                                totalQuizzes >
                                                                    0
                                                                    ? Math.round(
                                                                        (completedQuizzes /
                                                                            totalQuizzes) *
                                                                        100
                                                                    )
                                                                    : course
                                                                        .enrollment
                                                                        ?.status ===
                                                                        "completed"
                                                                        ? 100
                                                                        : course
                                                                            .enrollment
                                                                            ?.status ===
                                                                            "ongoing"
                                                                            ? 40
                                                                            : 0;

                                                            const thumbnail =
                                                                course.thumbnail
                                                                    ? course.thumbnail.replace(
                                                                        "/../public/",
                                                                        ""
                                                                    )
                                                                    : "";

                                                            return (
                                                                <div
                                                                    key={
                                                                        course.id
                                                                    }
                                                                    className="course_item_card"
                                                                >

                                                                    <div className="course_icon_box overflow-hidden">

                                                                        <img
                                                                            src={`${BASE_IMAGE_URL}uploads/courses/${thumbnail}`}
                                                                            alt={
                                                                                course.title
                                                                            }
                                                                            style={{
                                                                                width: "100%",
                                                                                height: "100%",
                                                                                objectFit:
                                                                                    "cover",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                e.currentTarget.src =
                                                                                    "https://placehold.co/100x100?text=Course";
                                                                            }}
                                                                        />

                                                                    </div>

                                                                    <div className="course_info_main">

                                                                        <h4>
                                                                            {
                                                                                course.title
                                                                            }
                                                                        </h4>

                                                                        <p
                                                                            className="course_meta text-truncate"
                                                                            style={{
                                                                                maxWidth:
                                                                                    "300px",
                                                                            }}
                                                                        >
                                                                            {course.short_description ||
                                                                                "Video course content"}
                                                                        </p>

                                                                        <div className="course_meta">
                                                                            <i className="bi bi-calendar3"></i>{" "}
                                                                            {course
                                                                                .enrollment
                                                                                ?.enrolled_at ||
                                                                                "Recent"}
                                                                        </div>

                                                                    </div>

                                                                    <div className="course_progress_area">

                                                                        <div className="progress_top_info">

                                                                            <span
                                                                                className={`status_label ${progress ===
                                                                                    100
                                                                                    ? "status_comp"
                                                                                    : "status_in"
                                                                                    }`}
                                                                            >
                                                                                {progress ===
                                                                                    100
                                                                                    ? "Completed"
                                                                                    : "In Progress"}
                                                                            </span>

                                                                            <span className="progress_val">
                                                                                {
                                                                                    progress
                                                                                }
                                                                                %
                                                                            </span>

                                                                        </div>

                                                                        <div className="premium_progress_bar">

                                                                            <div
                                                                                className="progress_fill"
                                                                                style={{
                                                                                    width: `${progress}%`,
                                                                                }}
                                                                            ></div>

                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            );
                                                        }
                                                    )
                                            ) : (
                                                <div className="text-center py-4 text-muted">
                                                    No recorded courses
                                                    found.
                                                </div>
                                            )
                                        ) : /* LIVE */
                                            liveCourses.length > 0 ? (
                                                liveCourses
                                                    .slice(0, 4)
                                                    .map(
                                                        (course) => (
                                                            <div
                                                                key={
                                                                    course.id
                                                                }
                                                                className="course_item_card"
                                                            >

                                                                <div className="course_icon_box overflow-hidden">

                                                                    <img
                                                                        src={`${BASE_IMAGE_URL}${course.thumbnail || ""}`}
                                                                        alt={
                                                                            course.title
                                                                        }
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "8px",
                                                                        }}
                                                                        onError={(
                                                                            e
                                                                        ) => {
                                                                            e.currentTarget.src =
                                                                                "https://placehold.co/100x100?text=Live";
                                                                        }}
                                                                    />

                                                                </div>

                                                                <div className="course_info_main">

                                                                    <h4>
                                                                        {
                                                                            course.title
                                                                        }
                                                                    </h4>

                                                                    <p className="course_meta">
                                                                        Instructor:{" "}
                                                                        <strong>
                                                                            {course
                                                                                .batch
                                                                                ?.instructor ||
                                                                                "TBA"}
                                                                        </strong>
                                                                    </p>

                                                                    <div className="course_meta">
                                                                        <i className="bi bi-broadcast"></i>{" "}
                                                                        {course
                                                                            .batch
                                                                            ?.batch_time ||
                                                                            "Scheduled Sessions"}
                                                                    </div>

                                                                </div>

                                                                <div className="course_progress_area d-flex flex-column align-items-end">

                                                                    <span
                                                                        className={`status_label mb-2 ${course.status ==
                                                                            1
                                                                            ? "status_in"
                                                                            : "status_up"
                                                                            }`}
                                                                    >
                                                                        {course.status ==
                                                                            1
                                                                            ? "Active"
                                                                            : "Pending"}
                                                                    </span>

                                                                    <span className="small text-muted">
                                                                        {course
                                                                            .batch
                                                                            ?.name ||
                                                                            "Standard Batch"}
                                                                    </span>

                                                                </div>

                                                            </div>
                                                        )
                                                    )
                                            ) : (
                                                <div className="text-center py-4 text-muted">
                                                    No live courses found.
                                                </div>
                                            )}
                                    </>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* REFERRAL */}

                    <div className="col-lg-4">

                        <div className="premium_card referral_sidebar h-100">

                            <h4>Referral Program</h4>

                            <div className="referral_count_big">
                                12
                            </div>

                            <p className="referral_count_label">
                                Friends Referred
                            </p>

                            <Link
                                href="/refer-and-earn"
                                className="btn_refer_now text-decoration-none"
                            >
                                <i className="bi bi-gift"></i>{" "}
                                Refer a Friend Now
                            </Link>

                            <div className="referral_code_box">

                                <span className="ref_code">
                                    {storedUser?.referral_code ||
                                        "STUDENT2025"}
                                </span>

                                <button
                                    type="button"
                                    className="btn_copy_ref"
                                    onClick={
                                        handleCopyReferral
                                    }
                                >
                                    Copy
                                </button>

                            </div>

                            <p className="referral_footer_text">
                                Earn rewards for every friend who joins
                            </p>

                        </div>

                    </div>

                </div>

                {/* --------------------------------------------------
                    CERTIFICATES
                -------------------------------------------------- */}

                <div className="row g-4 mt-1">

                    <div className="col-12">

                        <div className="premium_card p-4">

                            <div className="section_header">

                                <h3>
                                    <i className="bi bi-star"></i>{" "}
                                    Certificates{" "}
                                    <span className="badge_live ms-2">
                                        {
                                            dynamicCertificates.length
                                        }{" "}
                                        Earned
                                    </span>
                                </h3>

                                <Link
                                    href="/courses-certificates"
                                    className="view_all_link"
                                >
                                    View All
                                </Link>

                            </div>

                            {dynamicCertificates
                                .slice(0, 3)
                                .map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="certificate_card"
                                    >

                                        <div className="cert_main_info">

                                            <h4>
                                                {cert.name}
                                            </h4>

                                            <p className="cert_meta_info">
                                                Issued by{" "}
                                                <strong>
                                                    {
                                                        cert.issuer
                                                    }
                                                </strong>{" "}
                                                ·{" "}
                                                {cert.date}
                                            </p>

                                            <div className="cert_tags">

                                                {cert.tags.map(
                                                    (
                                                        tag,
                                                        index
                                                    ) => (
                                                        <span
                                                            key={
                                                                index
                                                            }
                                                            className="cert_tag"
                                                        >
                                                            {
                                                                tag
                                                            }
                                                        </span>
                                                    )
                                                )}

                                            </div>

                                        </div>

                                        <Link
                                            href="/courses-certificates"
                                            className="btn_cert_download text-decoration-none"
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                            }}
                                        >
                                            <i className="bi bi-download me-2"></i>
                                            Get PDF
                                        </Link>

                                    </div>
                                ))}

                            {dynamicCertificates.length ===
                                0 && (
                                    <div className="text-center py-4 text-muted">
                                        No certificates earned yet.
                                    </div>
                                )}

                        </div>

                    </div>

                    {/* --------------------------------------------------
                        INVOICES
                    -------------------------------------------------- */}

                    <div className="col-12">

                        <div className="premium_card p-4">

                            <div className="section_header">

                                <h3>
                                    <i className="bi bi-wallet2"></i>{" "}
                                    Payment & Invoices
                                </h3>

                                <span className="view_all_link">
                                    Full History
                                </span>

                            </div>

                            {/* INVOICE TABS */}

                            <div className="premium_tabs">

                                {invoices.some(
                                    (invoice) =>
                                        invoice.type ===
                                        "recorded"
                                ) && (
                                        <button
                                            type="button"
                                            className={`tab_btn ${invoiceTab ===
                                                "recorded"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setInvoiceTab(
                                                    "recorded"
                                                )
                                            }
                                        >
                                            <i className="bi bi-play"></i>{" "}
                                            Recorded Course Invoices
                                        </button>
                                    )}

                                {invoices.some(
                                    (invoice) =>
                                        invoice.type === "live"
                                ) && (
                                        <button
                                            type="button"
                                            className={`tab_btn ${invoiceTab ===
                                                "live"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setInvoiceTab(
                                                    "live"
                                                )
                                            }
                                        >
                                            <i className="bi bi-broadcast"></i>{" "}
                                            Live Course Invoices{" "}
                                            <span className="badge_live">
                                                Live
                                            </span>
                                        </button>
                                    )}

                            </div>

                            {/* TABLE */}

                            <div className="invoice_table_container">

                                <table className="premium_table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Course
                                            </th>
                                            <th>
                                                Invoice ID
                                            </th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>
                                                Invoice
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {invoicesLoading ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        6
                                                    }
                                                    className="text-center py-4"
                                                >
                                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                                </td>
                                            </tr>
                                        ) : invoices.filter(
                                            (
                                                invoice
                                            ) =>
                                                invoice.type ===
                                                invoiceTab
                                        ).length > 0 ? (
                                            invoices
                                                .filter(
                                                    (
                                                        invoice
                                                    ) =>
                                                        invoice.type ===
                                                        invoiceTab
                                                )
                                                .map(
                                                    (
                                                        invoice
                                                    ) => {

                                                        const status =
                                                            invoice.status ||
                                                            "";

                                                        const isPaid =
                                                            status
                                                                .toLowerCase()
                                                                .includes(
                                                                    "paid"
                                                                ) &&
                                                            !status
                                                                .toLowerCase()
                                                                .includes(
                                                                    "unpaid"
                                                                ) &&
                                                            !status
                                                                .toLowerCase()
                                                                .includes(
                                                                    "partial"
                                                                );

                                                        return (
                                                            <tr
                                                                key={
                                                                    invoice.id
                                                                }
                                                            >

                                                                <td className="inv_course_name">
                                                                    {
                                                                        invoice.course
                                                                    }
                                                                </td>

                                                                <td className="inv_id">
                                                                    {
                                                                        invoice.invoice_number
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        invoice.date
                                                                    }
                                                                </td>

                                                                <td>
                                                                    ₹
                                                                    {parseFloat(
                                                                        String(
                                                                            invoice.paid_amount ||
                                                                            0
                                                                        )
                                                                    ).toLocaleString()}
                                                                </td>

                                                                <td>

                                                                    <span
                                                                        className={`inv_status ${isPaid
                                                                            ? "paid"
                                                                            : "pending"
                                                                            }`}
                                                                    >
                                                                        <span className="status_dot"></span>{" "}
                                                                        {
                                                                            invoice.status
                                                                        }
                                                                    </span>

                                                                </td>

                                                                <td>

                                                                    <button
                                                                        type="button"
                                                                        className="btn_inv_pdf"
                                                                        onClick={() =>
                                                                            toast.success(
                                                                                "Preparing PDF..."
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="bi bi-file-earmark-pdf"></i>{" "}
                                                                        PDF
                                                                    </button>

                                                                </td>

                                                            </tr>
                                                        );
                                                    }
                                                )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        6
                                                    }
                                                    className="text-center py-4 text-muted"
                                                >
                                                    No invoices
                                                    found for
                                                    this category.
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* TOTAL */}

                            <div className="table_footer_row">

                                <span className="total_spent_label">
                                    Total Spent (
                                    {invoiceTab ===
                                        "recorded"
                                        ? "Recorded"
                                        : "Live"}
                                    )
                                </span>

                                <span className="total_spent_val">

                                    ₹{" "}

                                    {invoicesLoading
                                        ? "..."
                                        : invoices
                                            .filter(
                                                (
                                                    invoice
                                                ) =>
                                                    invoice.type ===
                                                    invoiceTab
                                            )
                                            .reduce(
                                                (
                                                    total,
                                                    current
                                                ) =>
                                                    total +
                                                    parseFloat(
                                                        String(
                                                            current.paid_amount ||
                                                            0
                                                        )
                                                    ),
                                                0
                                            )
                                            .toLocaleString()}

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==================================================
                EDIT PROFILE MODAL
            ================================================== */}

            {showEditModal && (

                <div
                    className="modal_overlay"
                    onClick={() =>
                        setShowEditModal(false)
                    }
                >

                    <div
                        className="modal_content animate__animated animate__fadeInDown"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="modal_header">

                            <h2>Edit Profile</h2>

                            <button
                                type="button"
                                className="btn_modal_close_top"
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>

                        {/* MODAL BODY */}

                        <div className="modal_body">

                            {/* PHOTO */}

                            <div className="photo_edit_section">

                                <div className="avatar_edit_main">

                                    {getProfileImage() ? (
                                        <img
                                            src={
                                                getProfileImage() ||
                                                ""
                                            }
                                            alt="User"
                                            className="avatar_edit_img"
                                        />
                                    ) : (
                                        <div>
                                            {getInitials()}
                                        </div>
                                    )}

                                </div>

                                <div className="photo_edit_actions">

                                    <span className="photo_edit_label">
                                        Profile Photo
                                    </span>

                                    <div className="d-flex gap-2">

                                        <label
                                            htmlFor="modal-upload"
                                            className="btn_upload_photo cursor-pointer"
                                        >
                                            {uploadLoading
                                                ? "Uploading..."
                                                : "Upload Photo"}
                                        </label>

                                        <input
                                            type="file"
                                            id="modal-upload"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={
                                                handleImageChange
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="btn_remove_photo"
                                            onClick={
                                                handleRemovePhoto
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>

                            </div>

                            {/* PERSONAL INFORMATION */}

                            <h4 className="form_section_label">
                                Personal Information
                            </h4>

                            <div className="modal_edit_grid">

                                {/* FIRST NAME */}

                                <div className="edit_form_field">

                                    <label>
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="first_name"
                                        value={
                                            profile?.first_name ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="First Name"
                                    />

                                </div>

                                {/* LAST NAME */}

                                <div className="edit_form_field">

                                    <label>
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="last_name"
                                        value={
                                            profile?.last_name ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Last Name"
                                    />

                                </div>

                                {/* DOB */}

                                <div className="edit_form_field">

                                    <label>
                                        Date of Birth
                                    </label>

                                    <input
                                        type="date"
                                        className="premium_input"
                                        name="date_of_birth"
                                        value={
                                            profile?.date_of_birth ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                                {/* GENDER */}

                                <div className="edit_form_field">

                                    <label>
                                        Gender
                                    </label>

                                    <select
                                        className="premium_input"
                                        name="gender"
                                        value={
                                            profile?.gender ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            Select Gender
                                        </option>

                                        <option value="1">
                                            Male
                                        </option>

                                        <option value="2">
                                            Female
                                        </option>
                                    </select>

                                </div>

                                {/* PRIMARY PHONE */}

                                <div className="edit_form_field">

                                    <label>
                                        Primary Phone
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="primary_phone"
                                        value={
                                            profile?.primary_phone ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="+91 98765 43210"
                                    />

                                </div>

                                {/* SECONDARY PHONE */}

                                <div className="edit_form_field">

                                    <label>
                                        Secondary Phone
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="secondary_phone"
                                        value={
                                            profile?.secondary_phone ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="+91 — optional"
                                    />

                                </div>

                                {/* EMAIL */}

                                <div className="edit_form_field edit_form_full">

                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        className="premium_input"
                                        name="email"
                                        value={
                                            profile?.email ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="arjun.ramesh@email.com"
                                    />

                                </div>

                                {/* EDUCATION */}

                                <div className="edit_form_field edit_form_full">

                                    <label>
                                        Designation (Education)
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="education"
                                        value={
                                            profile?.education ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Full-Stack Developer"
                                    />

                                </div>

                                {/* ADDRESS */}

                                <div className="edit_form_field edit_form_full">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        className="premium_input"
                                        name="address"
                                        rows={2}
                                        value={
                                            profile?.address ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Home address"
                                        style={{
                                            height: "auto",
                                        }}
                                    />

                                </div>

                                {/* STATE */}

                                <div className="edit_form_field edit_form_full">

                                    <label>
                                        State
                                    </label>

                                    <select
                                        className="premium_input"
                                        name="state_id"
                                        value={
                                            profile?.state_id ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select State
                                        </option>

                                        {states.map(
                                            (state) => (
                                                <option
                                                    key={
                                                        state.id
                                                    }
                                                    value={
                                                        state.id
                                                    }
                                                >
                                                    {
                                                        state.state_name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </div>

                        {/* MODAL FOOTER */}

                        <div className="modal_footer">

                            <button
                                type="button"
                                className="btn_prem btn_prem_outline flex-grow-1 justify-content-center"
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn_prem btn_prem_primary flex-grow-1 justify-content-center"
                                onClick={updateProfile}
                                disabled={loading}
                            >
                                {loading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* ==================================================
                SUCCESS MODAL
            ================================================== */}

            {showSuccessModal && (

                <div
                    className="success_overlay"
                    onClick={() =>
                        setShowSuccessModal(false)
                    }
                >

                    <div
                        className="success_modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="success_icon_wrapper">
                            <i className="bi bi-check-lg"></i>
                        </div>

                        <h2>
                            Profile Updated!
                        </h2>

                        <p>
                            Your details have been
                            successfully saved to your
                            profile and are now live
                            across the platform.
                        </p>

                        <button
                            type="button"
                            className="btn_success_perfect"
                            onClick={() =>
                                setShowSuccessModal(
                                    false
                                )
                            }
                        >
                            Perfect!
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}