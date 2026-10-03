"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import html2pdf from "html2pdf.js";

import Sidebar from "@/components/layout/Sidebar";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://crm.velearn.in/public/";

interface ProfileData {
    id?: number | string;
    first_name?: string;
    last_name?: string;
    name?: string;
    date_of_birth?: string;
    gender?: string | number;
    primary_phone?: string;
    phonenumber?: string;
    secondary_phone?: string;
    email?: string;
    education?: string;
    designation?: string;
    address?: string;
    state_id?: string | number;
    image?: string;
    referral_count?: number;
    referral_code?: string;
}

interface StoredUser {
    id?: number | string;
    auth_id?: number | string;
    user_id?: number | string;
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

interface Enrollment {
    completed_videos?: number | string;
    total_videos?: number | string;
    status?: string;
    enrolled_at?: string;
    completed_at?: string;
}

interface Course {
    id: number | string;
    title: string;
    thumbnail?: string;
    short_description?: string;
    issuer_name?: string;
    tags?: string[];
    enrollment?: Enrollment;
    status?: number | string;
    batch?: {
        instructor?: string;
        batch_time?: string;
        batch_status?: string;
        name?: string;
        end_date?: string;
    };
}

interface Invoice {
    id: number | string;
    course: string;
    invoice_number: string;
    date: string;
    course_amount?: number | string;
    paid_amount?: number | string;
    status: string;
    type: "recorded" | "live";
}

interface Certificate {
    id: number | string;
    name: string;
    issuer: string;
    date: string;
    tags: string[];
}

const Profile = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [editForm, setEditForm] = useState<Record<string, string>>({});
    const [states, setStates] = useState<StateData[]>([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [recordedCourses, setRecordedCourses] = useState<Course[]>([]);
    const [liveCourses, setLiveCourses] = useState<Course[]>([]);
    const [courseListLoading, setCourseListLoading] = useState(true);

    const [courseTab, setCourseTab] = useState<"recorded" | "live">("recorded");
    const [invoiceTab, setInvoiceTab] = useState<"recorded" | "live">("recorded");

    const [dynamicCertificates, setDynamicCertificates] = useState<Certificate[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(true);

    const [showFullHistory, setShowFullHistory] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [token, setToken] = useState<string | null>(null);
    const [storedUser, setStoredUser] = useState<StoredUser | null>(null);

    const userId =
        storedUser?.id ||
        storedUser?.auth_id ||
        storedUser?.user_id ||
        null;

    /*
    |--------------------------------------------------------------------------
    | Load localStorage data
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (typeof window === "undefined") return;

        const savedToken = localStorage.getItem("token");
        const savedUser = JSON.parse(
            localStorage.getItem("user") || "null",
        ) as StoredUser | null;

        setToken(savedToken);
        setStoredUser(savedUser);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Fetch Profile
    |--------------------------------------------------------------------------
    */

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
                const data: ProfileData = {
                    ...res.data.data,
                };

                if (!data.first_name && (data.name || storedUser?.name)) {
                    const fullName =
                        data.name ||
                        storedUser?.name ||
                        "";

                    const parts = fullName.trim().split(/\s+/);

                    data.first_name = parts[0] || "";
                    data.last_name = parts.slice(1).join(" ") || "";
                }

                if (!data.primary_phone) {
                    data.primary_phone =
                        data.phonenumber ||
                        storedUser?.phonenumber ||
                        "";
                }

                if (!data.email) {
                    data.email = storedUser?.email || "";
                }

                setProfile(data);
            }
        } catch (err) {
            console.log("Fetch error:", err);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Fetch States
    |--------------------------------------------------------------------------
    */

    const fetchStates = async () => {
        try {
            const res = await axios.get(`${BASE_API_URL}states`);

            if (res.data?.data) {
                setStates(res.data.data);
            }
        } catch (err) {
            console.log("States fetch error:", err);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Fetch Courses + Invoices
    |--------------------------------------------------------------------------
    */

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
                    .get(`${BASE_API_URL}live-course-history/${userId}`, {
                        headers,
                    })
                    .catch(() => ({
                        data: {
                            status: false,
                            data: [],
                        },
                    })),

                axios
                    .get(`${BASE_API_URL}student-invoices/${userId}`, {
                        headers,
                    })
                    .catch(() => ({
                        data: {
                            status: false,
                            data: [],
                        },
                    })),
            ]);

            /*
            |--------------------------------------------------------------------------
            | Recorded Courses
            |--------------------------------------------------------------------------
            */

            let recordedAll: Course[] = [];
            let recordedCompleted: Course[] = [];

            if (resRecorded.data.status) {
                recordedAll =
                    resRecorded.data.data?.all || [];

                recordedCompleted =
                    resRecorded.data.data?.completed || [];

                setRecordedCourses(recordedAll);
            } else {
                setRecordedCourses([]);
            }

            /*
            |--------------------------------------------------------------------------
            | Live Courses
            |--------------------------------------------------------------------------
            */

            let liveAll: Course[] = [];
            let liveCompleted: Course[] = [];

            if (resLive.data.status) {
                liveAll = resLive.data.data || [];

                setLiveCourses(liveAll);

                liveCompleted = liveAll.filter(
                    (course: Course) =>
                        course.batch &&
                        course.batch.batch_status === "Completed",
                );
            } else {
                setLiveCourses([]);
            }

            /*
            |--------------------------------------------------------------------------
            | Dynamic Certificates
            |--------------------------------------------------------------------------
            */

            const combinedCerts: Certificate[] = [
                ...recordedCompleted.map(
                    (course: Course) => ({
                        id: course.id,
                        name: course.title,
                        issuer:
                            course.issuer_name ||
                            "Velearn Academy",
                        date:
                            course.enrollment?.completed_at
                                ? new Date(
                                    course.enrollment.completed_at,
                                )
                                    .getFullYear()
                                    .toString()
                                : new Date()
                                    .getFullYear()
                                    .toString(),
                        tags:
                            course.tags ||
                            [
                                "Certified",
                                "Academic Excellence",
                            ],
                    }),
                ),

                ...liveCompleted.map(
                    (course: Course) => ({
                        id: course.id,
                        name: course.title,
                        issuer:
                            course.issuer_name ||
                            "Velearn Academy",
                        date:
                            course.batch?.end_date
                                ? new Date(
                                    course.batch.end_date,
                                )
                                    .getFullYear()
                                    .toString()
                                : new Date()
                                    .getFullYear()
                                    .toString(),
                        tags:
                            course.tags ||
                            [
                                "Live Bootcamp",
                                "Hands-on Project",
                            ],
                    }),
                ),
            ];

            /*
            |--------------------------------------------------------------------------
            | Remove Duplicate Certificates
            |--------------------------------------------------------------------------
            */

            const uniqueCerts: Certificate[] = [];
            const seenNames = new Set<string>();

            combinedCerts.forEach((cert) => {
                if (!seenNames.has(cert.name)) {
                    uniqueCerts.push(cert);
                    seenNames.add(cert.name);
                }
            });

            setDynamicCertificates(uniqueCerts);

            /*
            |--------------------------------------------------------------------------
            | Invoices
            |--------------------------------------------------------------------------
            */

            if (resInvoices.data.status) {
                setInvoices(
                    resInvoices.data.data || [],
                );
            } else {
                setInvoices([]);
            }
        } catch (err) {
            console.log(
                "Courses fetch error:",
                err,
            );
        } finally {
            setCourseListLoading(false);
            setInvoicesLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Initial Data Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!userId) return;

        fetchProfile();
        fetchStates();
        fetchCoursesData();
    }, [userId]);

    /*
    |--------------------------------------------------------------------------
    | Default Course Tab
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!courseListLoading) {
            if (recordedCourses.length > 0) {
                setCourseTab("recorded");
            } else if (liveCourses.length > 0) {
                setCourseTab("live");
            }
        }
    }, [
        courseListLoading,
        recordedCourses.length,
        liveCourses.length,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Default Invoice Tab
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!invoicesLoading) {
            const hasRecorded = invoices.some(
                (invoice) => invoice.type === "recorded",
            );

            const hasLive = invoices.some(
                (invoice) => invoice.type === "live",
            );

            if (hasRecorded) {
                setInvoiceTab("recorded");
            } else if (hasLive) {
                setInvoiceTab("live");
            }
        }
    }, [invoicesLoading, invoices.length]);

    /*
    |--------------------------------------------------------------------------
    | Open Edit Modal
    |--------------------------------------------------------------------------
    */

    const openEditModal = () => {
        const su = storedUser || {};
        const p = profile || {};

        let firstName = p.first_name || "";
        let lastName = p.last_name || "";

        if (!firstName) {
            const fullName =
                p.name ||
                su.name ||
                "";

            const parts = fullName
                .trim()
                .split(/\s+/);

            firstName = parts[0] || "";
            lastName = parts.slice(1).join(" ") || "";
        }

        setEditForm({
            first_name: firstName,
            last_name: lastName,
            date_of_birth:
                p.date_of_birth || "",
            gender:
                p.gender != null
                    ? String(p.gender)
                    : "",
            primary_phone:
                p.primary_phone ||
                p.phonenumber ||
                su.phonenumber ||
                "",
            secondary_phone:
                p.secondary_phone || "",
            email:
                p.email ||
                su.email ||
                "",
            education:
                p.education || "",
            designation:
                p.designation || "",
            address:
                p.address || "",
            state_id:
                p.state_id != null
                    ? String(p.state_id)
                    : "",
            image:
                p.image || "",
        });

        setShowEditModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Form Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >,
    ) => {
        const {
            name,
            value,
        } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Update Profile
    |--------------------------------------------------------------------------
    */

    const updateProfile = async () => {
        const resolvedId =
            userId ||
            profile?.id ||
            null;

        if (!resolvedId) {
            toast.error(
                "Session error: user ID not found. Please log out and log in again.",
            );

            console.error(
                "updateProfile:",
                {
                    storedUser,
                    profile,
                },
            );

            return;
        }

        setLoading(true);

        try {
            const payload = {
                user_id: resolvedId,
                auth_id: resolvedId,
                ...editForm,
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
                },
            );

            /*
            |--------------------------------------------------------------------------
            | Update localStorage user
            |--------------------------------------------------------------------------
            */

            const currentStoredUser =
                JSON.parse(
                    localStorage.getItem(
                        "user",
                    ) || "{}",
                ) as StoredUser;

            const updatedUser: StoredUser = {
                ...currentStoredUser,

                name:
                    `${editForm.first_name || ""} ${editForm.last_name || ""
                        }`.trim() ||
                    currentStoredUser.name,

                image:
                    editForm.image !==
                        undefined
                        ? editForm.image
                        : currentStoredUser.image,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser),
            );

            setStoredUser(updatedUser);

            window.dispatchEvent(
                new Event("storage-update"),
            );

            setShowEditModal(false);
            setShowSuccessModal(true);

            await fetchProfile();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Save failed";

            toast.error(msg);

            console.error(
                "Save error:",
                err?.response?.data ||
                err,
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Profile Image
    |--------------------------------------------------------------------------
    */

    const getProfileImage = () => {
        if (!profile?.image) {
            return null;
        }

        if (
            profile.image.startsWith(
                "http",
            )
        ) {
            return profile.image.replace(
                /\/public\/uploads\//,
                "/uploads/",
            );
        }

        const imageName =
            profile.image
                .split("/")
                .pop();

        if (!imageName) {
            return null;
        }

        return `https://crm.velearn.in/uploads/students/${imageName}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Upload Profile Image
    |--------------------------------------------------------------------------
    */

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            e.target.files?.[0];

        if (!file) return;

        const resolvedId =
            userId ||
            profile?.id ||
            null;

        if (!resolvedId) {
            toast.error(
                "Session error: cannot upload — user ID missing.",
            );

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "image",
            file,
        );

        formData.append(
            "auth_id",
            String(resolvedId),
        );

        formData.append(
            "user_id",
            String(resolvedId),
        );

        setUploadLoading(true);

        const uploadToast =
            toast.loading(
                "Updating photo...",
            );

        try {
            const res =
                await axios.post(
                    `${BASE_API_URL}update-logo`,
                    formData,
                    {
                        headers: {
                            Authorization:
                                token
                                    ? `Bearer ${token}`
                                    : "",
                        },
                    },
                );

            if (res.data.status) {
                toast.success(
                    "Uploaded!",
                    {
                        id: uploadToast,
                    },
                );

                const newImage =
                    res.data.image ||
                    res.data.data
                        ?.image;

                setProfile(
                    (prev) => ({
                        ...prev,
                        image:
                            newImage,
                    }),
                );

                setEditForm(
                    (prev) => ({
                        ...prev,
                        image:
                            newImage,
                    }),
                );

                /*
                |--------------------------------------------------------------------------
                | Update Navbar User Image
                |--------------------------------------------------------------------------
                */

                const currentStoredUser =
                    JSON.parse(
                        localStorage.getItem(
                            "user",
                        ) || "{}",
                    ) as StoredUser;

                currentStoredUser.image =
                    newImage;

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        currentStoredUser,
                    ),
                );

                setStoredUser(
                    currentStoredUser,
                );

                window.dispatchEvent(
                    new Event(
                        "storage-update",
                    ),
                );

                await fetchProfile();
            } else {
                toast.error(
                    res.data.message ||
                    "Upload failed",
                    {
                        id: uploadToast,
                    },
                );
            }
        } catch (err: any) {
            const msg =
                err?.response?.data
                    ?.message ||
                err?.response?.data
                    ?.errors
                    ?.image?.[0] ||
                err?.message ||
                "Upload failed";

            toast.error(msg, {
                id: uploadToast,
            });

            console.error(
                "Upload error:",
                err?.response?.data ||
                err,
            );
        } finally {
            setUploadLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Remove Photo
    |--------------------------------------------------------------------------
    */

    const handleRemovePhoto = async () => {
        if (
            !window.confirm(
                "Remove profile photo?",
            )
        ) {
            return;
        }

        setProfile((prev) => ({
            ...prev,
            image: "",
        }));

        setEditForm((prev) => ({
            ...prev,
            image: "",
        }));

        toast.success(
            "Photo removed locally. Save profile to confirm.",
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Get Initials
    |--------------------------------------------------------------------------
    */

    const getInitials = () => {
        const name =
            profile?.first_name ||
            storedUser?.name ||
            profile?.name ||
            "U";

        return name[0]
            .toUpperCase();
    };

    /*
    |--------------------------------------------------------------------------
    | Course Image URL
    |--------------------------------------------------------------------------
    */

    const getCourseImage = (
        thumbnail?: string,
    ) => {
        if (!thumbnail) {
            return "https://placehold.co/100x100?text=Course";
        }

        if (
            thumbnail.startsWith(
                "http",
            )
        ) {
            return thumbnail;
        }

        if (
            thumbnail.startsWith(
                "uploads/courses/",
            )
        ) {
            return (
                BASE_IMAGE_URL +
                thumbnail
            );
        }

        return (
            BASE_IMAGE_URL +
            "uploads/courses/" +
            thumbnail.replace(
                "/../public/",
                "",
            )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Share Profile
    |--------------------------------------------------------------------------
    */

    const handleShareProfile = async () => {
        try {
            if (
                navigator.share
            ) {
                await navigator.share(
                    {
                        title:
                            "My VeLearn Profile",
                        text:
                            "Check out my VeLearn profile.",
                        url:
                            window.location
                                .href,
                    },
                );
            } else {
                await navigator.clipboard.writeText(
                    window.location
                        .href,
                );

                toast.success(
                    "Profile link copied!",
                );
            }
        } catch {
            // User cancelled share dialog.
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Generate Invoice PDF
    |--------------------------------------------------------------------------
    */

    const generateInvoicePDF = (
        inv: Invoice,
    ) => {
        toast.success(
            "Preparing PDF...",
        );

        const userName =
            profile
                ? `${profile.first_name || ""} ${profile.last_name || ""
                    }`.trim()
                : "Student";

        const userEmail =
            profile?.email ||
            storedUser?.email ||
            "";

        const userPhone =
            profile?.primary_phone ||
            profile?.phonenumber ||
            storedUser?.phonenumber ||
            "";

        const isPaid =
            inv.status
                .toLowerCase()
                .includes("paid") &&
            !inv.status
                .toLowerCase()
                .includes("unpaid");

        const htmlContent = `
            <div style="padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1e293b;width:800px;margin:0 auto;background:#fff;">
                <div style="height:8px;background:linear-gradient(90deg,#1e3a8a 0%,#3b82f6 100%);width:100%;"></div>

                <div style="padding:50px 60px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:50px;">
                        <div>
                            <img
                                src="/assets/images/velearn-logo.png"
                                alt="Velearn Logo"
                                style="height:60px;object-fit:contain;margin-bottom:20px;"
                                onerror="this.style.display='none'"
                            />

                            <div style="color:#64748b;font-size:13px;line-height:1.6;">
                                <strong>Velearn Institute of Professional Studies</strong><br>
                                123 Education Hub, Tech Park<br>
                                Chennai, Tamil Nadu, India<br>
                                support@velearn.in
                            </div>
                        </div>

                        <div style="text-align:right;">
                            <h1 style="margin:0 0 15px 0;font-size:42px;color:#0f172a;font-weight:300;letter-spacing:2px;">
                                INVOICE
                            </h1>

                            <table style="margin-left:auto;text-align:right;font-size:13px;color:#334155;border-spacing:0;">
                                <tr>
                                    <td style="padding:0 15px 5px 0;color:#64748b;">
                                        Invoice Number
                                    </td>
                                    <td style="padding:0 0 5px 0;font-weight:600;color:#0f172a;">
                                        ${inv.invoice_number}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:0 15px 5px 0;color:#64748b;">
                                        Date of Issue
                                    </td>
                                    <td style="padding:0 0 5px 0;font-weight:600;color:#0f172a;">
                                        ${inv.date}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:0 15px 0 0;color:#64748b;">
                                        Amount Due
                                    </td>
                                    <td style="padding:0;font-weight:600;color:#16a34a;">
                                        ₹0.00
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div style="margin-bottom:50px;display:flex;justify-content:space-between;">
                        <div>
                            <h3 style="margin:0 0 12px 0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
                                Billed To
                            </h3>

                            <div style="color:#0f172a;font-size:16px;font-weight:600;margin-bottom:5px;">
                                ${userName}
                            </div>

                            <div style="color:#475569;font-size:14px;line-height:1.6;">
                                ${userEmail}<br>
                                ${userPhone}
                            </div>
                        </div>

                        <div style="text-align:right;">
                            <h3 style="margin:0 0 12px 0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
                                Status
                            </h3>

                            <div>
                                <span style="
                                    display:inline-block;
                                    padding:6px 16px;
                                    border-radius:4px;
                                    font-weight:700;
                                    font-size:13px;
                                    letter-spacing:1px;
                                    text-transform:uppercase;
                                    background:${isPaid ? "#f0fdf4" : "#fef2f2"};
                                    color:${isPaid ? "#16a34a" : "#dc2626"};
                                    border:1px solid ${isPaid ? "#bbf7d0" : "#fecaca"};
                                ">
                                    ${inv.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom:40px;">
                        <table style="width:100%;border-collapse:collapse;text-align:left;">
                            <thead>
                                <tr>
                                    <th style="padding:12px 0;border-bottom:2px solid #1e293b;color:#1e293b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                                        Item Description
                                    </th>

                                    <th style="padding:12px 0;border-bottom:2px solid #1e293b;color:#1e293b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;text-align:right;">
                                        Rate
                                    </th>

                                    <th style="padding:12px 0;border-bottom:2px solid #1e293b;color:#1e293b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;text-align:right;">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td style="padding:20px 0;border-bottom:1px solid #e2e8f0;">
                                        <div style="font-weight:600;color:#0f172a;font-size:15px;margin-bottom:4px;">
                                            ${inv.course}
                                        </div>

                                        <div style="font-size:13px;color:#64748b;">
                                            Professional Certification Course
                                            (${inv.type === "recorded" ? "Recorded" : "Live"})
                                        </div>
                                    </td>

                                    <td style="padding:20px 0;text-align:right;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">
                                        ₹${parseFloat(
            String(
                inv.course_amount ||
                0,
            ),
        ).toLocaleString()}
                                    </td>

                                    <td style="padding:20px 0;text-align:right;font-weight:600;color:#0f172a;font-size:15px;border-bottom:1px solid #e2e8f0;">
                                        ₹${parseFloat(
            String(
                inv.paid_amount ||
                0,
            ),
        ).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="display:flex;justify-content:flex-end;margin-bottom:50px;">
                        <table style="width:350px;border-collapse:collapse;">
                            <tr>
                                <td style="padding:10px 0;color:#64748b;font-size:14px;">
                                    Subtotal
                                </td>

                                <td style="padding:10px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:500;">
                                    ₹${parseFloat(
            String(
                inv.paid_amount ||
                0,
            ),
        ).toLocaleString()}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">
                                    Tax (18% IGST - Included)
                                </td>

                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a;font-size:14px;font-weight:500;">
                                    ₹0.00
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:15px 0;font-size:16px;font-weight:600;color:#0f172a;">
                                    Total
                                </td>

                                <td style="padding:15px 0;text-align:right;font-size:20px;font-weight:700;color:#1e3a8a;">
                                    ₹${parseFloat(
            String(
                inv.paid_amount ||
                0,
            ),
        ).toLocaleString()}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:10px 0;font-size:14px;color:#64748b;">
                                    Amount Paid
                                </td>

                                <td style="padding:10px 0;text-align:right;font-size:14px;color:#16a34a;font-weight:600;">
                                    - ₹${parseFloat(
            String(
                inv.paid_amount ||
                0,
            ),
        ).toLocaleString()}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:15px 0;font-size:15px;font-weight:600;color:#0f172a;border-top:2px solid #1e293b;">
                                    Balance Due
                                </td>

                                <td style="padding:15px 0;text-align:right;font-size:16px;font-weight:700;color:#0f172a;border-top:2px solid #1e293b;">
                                    ₹0.00
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-top:auto;padding-top:30px;border-top:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;line-height:1.6;">
                        <strong>Thank you for choosing Velearn!</strong><br>
                        This is a computer generated invoice and does not require a physical signature.<br>

                        <span style="color:#94a3b8;display:inline-block;margin-top:10px;">
                            Velearn Private Limited &bull;
                            CIN: U80904TN2026PTC123456 &bull;
                            GSTIN: 33AAACV1234F1Z5
                        </span>
                    </div>
                </div>
            </div>
        `;

        const element =
            document.createElement(
                "div",
            );

        element.innerHTML =
            htmlContent;

        const opt = {
            margin: 0,
            filename: `${inv.invoice_number}_Velearn.pdf`,
            image: {
                type: "jpeg" as const,
                quality: 0.98,
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
            },
            jsPDF: {
                unit: "in" as const,
                format: "a4" as const,
                orientation: "portrait" as const,
            },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                toast.dismiss();
                toast.success("Invoice downloaded!");
            })
            .catch((err: any) => {
                console.error("Invoice PDF error:", err);
                toast.dismiss();
                toast.error("Failed to generate invoice");
            });
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="profile_page text-center">
                <div className="spinner-border text-primary mt-5"></div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="dashboard_layout">
            <Sidebar
                recordedCoursesCount={
                    recordedCourses.length
                }
                liveCoursesCount={
                    liveCourses.length
                }
                activePage="profile"
                isOpen={
                    isSidebarOpen
                }
                onClose={() =>
                    setIsSidebarOpen(
                        false,
                    )
                }
            />

            {/* Mobile Overlay */}
            <div
                className={`sidebar_overlay ${isSidebarOpen
                    ? "show"
                    : ""
                    }`}
                onClick={() =>
                    setIsSidebarOpen(
                        false,
                    )
                }
            ></div>

            <div className="dashboard_main_content">
                {/* Top Header */}
                <div className="dashboard_top_header">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn_mobile_menu d-lg-none"
                            onClick={() =>
                                setIsSidebarOpen(
                                    true,
                                )
                            }
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div className="profile_breadcrumb mb-0">
                            <h2>
                                My Profile
                            </h2>
                        </div>
                    </div>

                    <div className="notification_bell_top">
                        <i className="bi bi-bell"></i>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="premium_card">
                    <div className="profile_banner">
                        <div className="banner_pattern"></div>
                        <div className="banner_overlay"></div>

                        {/* Profile Avatar */}
                        <div className="avatar_container">
                            <div
                                className={`avatar_main ${uploadLoading
                                    ? "opacity-50"
                                    : ""
                                    }`}
                            >
                                {getProfileImage() ? (
                                    <img
                                        src={getProfileImage()!}
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

                        {/* Header Stats */}
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
                                    {
                                        liveCourses.length
                                    }
                                </span>

                                <span className="h_stat_label">
                                    Live
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="profile_info_row d-flex flex-wrap justify-content-between align-items-end">
                        <div className="user_title_info m-0 p-0">
                            <h1
                                className="fw-bolder mb-1"
                                style={{
                                    fontSize:
                                        "22px",
                                    color:
                                        "#0f172a",
                                }}
                            >
                                {profile?.first_name ||
                                    storedUser?.name ||
                                    profile?.name ||
                                    "Student User"}{" "}
                                {profile?.last_name ||
                                    ""}
                            </h1>

                            <div
                                className="fw-semibold mb-2"
                                style={{
                                    color:
                                        "#3b82f6",
                                    fontSize:
                                        "13px",
                                }}
                            >
                                {profile?.education ||
                                    profile?.designation ||
                                    "Student"}
                            </div>

                            <div
                                className="d-flex flex-wrap text-secondary gap-3 contact_links_mob"
                                style={{
                                    fontSize:
                                        "13px",
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
                                            profile?.state_id,
                                    )
                                        ?.state_name ||
                                        "Location, India"}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="header_actions mt-3">
                            <button
                                onClick={
                                    openEditModal
                                }
                                className="btn btn-outline-secondary rounded-pill fw-semibold px-4 pt-2 pb-2"
                                style={{
                                    fontSize:
                                        "13px",
                                    borderColor:
                                        "#e2e8f0",
                                    color:
                                        "#475569",
                                }}
                            >
                                <i className="bi bi-pencil-square me-1"></i>
                                Edit Profile
                            </button>

                            <button
                                onClick={
                                    handleShareProfile
                                }
                                className="btn rounded-pill fw-semibold px-4 pt-2 pb-2 ms-2"
                                style={{
                                    fontSize:
                                        "13px",
                                    background:
                                        "#0ea5e9",
                                    color:
                                        "#fff",
                                    border:
                                        "none",
                                }}
                            >
                                <i className="bi bi-share me-1"></i>
                                Share Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Courses + Referral */}
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="premium_card p-4 h-100">
                            <div className="section_header">
                                <h3>
                                    <i className="bi bi-journal-check"></i>{" "}
                                    Enrolled
                                    Courses
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

                            {/* Course Tabs */}
                            <div className="premium_tabs">
                                {recordedCourses.length >
                                    0 && (
                                        <button
                                            className={`tab_btn ${courseTab ===
                                                "recorded"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setCourseTab(
                                                    "recorded",
                                                )
                                            }
                                        >
                                            <i className="bi bi-play-circle"></i>{" "}
                                            Recorded
                                            Courses
                                        </button>
                                    )}

                                {liveCourses.length >
                                    0 && (
                                        <button
                                            className={`tab_btn ${courseTab ===
                                                "live"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setCourseTab(
                                                    "live",
                                                )
                                            }
                                        >
                                            <i className="bi bi-broadcast"></i>{" "}
                                            Live
                                            Courses{" "}
                                            <span className="badge_live">
                                                Live
                                            </span>
                                        </button>
                                    )}
                            </div>

                            {/* Course List */}
                            <div className="course_list">
                                {courseListLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        {courseTab ===
                                            "recorded" ? (
                                            recordedCourses.length >
                                                0 ? (
                                                recordedCourses
                                                    .slice(
                                                        0,
                                                        4,
                                                    )
                                                    .map(
                                                        (
                                                            course,
                                                        ) => {
                                                            const completedVideos =
                                                                parseInt(
                                                                    String(
                                                                        course
                                                                            .enrollment
                                                                            ?.completed_videos ||
                                                                        0,
                                                                    ),
                                                                );

                                                            const totalVideos =
                                                                parseInt(
                                                                    String(
                                                                        course
                                                                            .enrollment
                                                                            ?.total_videos ||
                                                                        0,
                                                                    ),
                                                                );

                                                            const progress =
                                                                totalVideos >
                                                                    0
                                                                    ? Math.round(
                                                                        (completedVideos /
                                                                            totalVideos) *
                                                                        100,
                                                                    )
                                                                    : course
                                                                        .enrollment
                                                                        ?.status ===
                                                                        "completed"
                                                                        ? 100
                                                                        : 0;

                                                            return (
                                                                <div
                                                                    key={
                                                                        course.id
                                                                    }
                                                                    className="course_item_card"
                                                                >
                                                                    <div className="course_icon_box overflow-hidden">
                                                                        <img
                                                                            src={getCourseImage(
                                                                                course.thumbnail,
                                                                            )}
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
                                                                                e,
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
                                                        },
                                                    )
                                            ) : (
                                                <div className="text-center py-4 text-muted">
                                                    No recorded
                                                    courses
                                                    found.
                                                </div>
                                            )
                                        ) : liveCourses.length >
                                            0 ? (
                                            liveCourses
                                                .slice(
                                                    0,
                                                    4,
                                                )
                                                .map(
                                                    (
                                                        course,
                                                    ) => (
                                                        <div
                                                            key={
                                                                course.id
                                                            }
                                                            className="course_item_card"
                                                        >
                                                            <div className="course_icon_box overflow-hidden">
                                                                <img
                                                                    src={getCourseImage(
                                                                        course.thumbnail,
                                                                    )}
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
                                                                        e,
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
                                                                    className={`status_label mb-2 ${course
                                                                        .batch
                                                                        ?.batch_status ===
                                                                        "Completed"
                                                                        ? "status_comp"
                                                                        : course.status ==
                                                                            1
                                                                            ? "status_in"
                                                                            : "status_up"
                                                                        }`}
                                                                >
                                                                    {course
                                                                        .batch
                                                                        ?.batch_status ===
                                                                        "Completed"
                                                                        ? "Completed"
                                                                        : course.status ==
                                                                            1
                                                                            ? "Active"
                                                                            : "Pending"}
                                                                </span>

                                                                <span className="small text-muted mb-2">
                                                                    {course
                                                                        .batch
                                                                        ?.name ||
                                                                        "Standard Batch"}
                                                                </span>

                                                                {course
                                                                    .batch
                                                                    ?.batch_status ===
                                                                    "Completed" && (
                                                                        <Link
                                                                            href="/courses-certificates"
                                                                            className="btn btn-sm btn-outline-primary mt-1"
                                                                            style={{
                                                                                borderRadius:
                                                                                    "20px",
                                                                                padding:
                                                                                    "0.2rem 0.8rem",
                                                                                fontSize:
                                                                                    "0.75rem",
                                                                                fontWeight:
                                                                                    "bold",
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-award"></i>{" "}
                                                                            Certificate
                                                                        </Link>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                        ) : (
                                            <div className="text-center py-4 text-muted">
                                                No live
                                                courses
                                                found.
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Referral */}
                    <div className="col-lg-4">
                        <div className="premium_card referral_sidebar h-100">
                            <h4>
                                Referral
                                Program
                            </h4>

                            <div className="referral_count_big">
                                {profile?.referral_count ||
                                    0}
                            </div>

                            <p className="referral_count_label">
                                Friends
                                Referred
                            </p>

                            <Link
                                href="/refer-and-earn"
                                className="btn_refer_now text-decoration-none"
                            >
                                <i className="bi bi-gift"></i>{" "}
                                Refer a
                                Friend Now
                            </Link>

                            <div className="referral_code_box">
                                <span className="ref_code">
                                    {profile?.referral_code ||
                                        storedUser?.referral_code ||
                                        "N/A"}
                                </span>

                                <button
                                    className="btn_copy_ref"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            profile?.referral_code ||
                                            storedUser?.referral_code ||
                                            "N/A",
                                        );

                                        toast.success(
                                            "Copied!",
                                        );
                                    }}
                                >
                                    Copy
                                </button>
                            </div>

                            <p className="referral_footer_text">
                                Earn rewards
                                for every
                                friend who
                                joins
                            </p>
                        </div>
                    </div>
                </div>

                {/* Certificates */}
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
                                .map(
                                    (
                                        cert,
                                    ) => (
                                        <div
                                            key={
                                                cert.id
                                            }
                                            className="certificate_card"
                                        >
                                            <div className="cert_main_info">
                                                <h4>
                                                    {
                                                        cert.name
                                                    }
                                                </h4>

                                                <p className="cert_meta_info">
                                                    Issued
                                                    by{" "}
                                                    <strong>
                                                        {
                                                            cert.issuer
                                                        }
                                                    </strong>{" "}
                                                    ·{" "}
                                                    {
                                                        cert.date
                                                    }
                                                </p>

                                                <div className="cert_tags">
                                                    {cert.tags.map(
                                                        (
                                                            tag,
                                                            idx,
                                                        ) => (
                                                            <span
                                                                key={
                                                                    idx
                                                                }
                                                                className="cert_tag"
                                                            >
                                                                {
                                                                    tag
                                                                }
                                                            </span>
                                                        ),
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
                                                <i className="bi bi-download me-2"></i>{" "}
                                                Get PDF
                                            </Link>
                                        </div>
                                    ),
                                )}
                        </div>
                    </div>

                    {/* Payment & Invoices */}
                    <div className="col-12">
                        <div className="premium_card p-4">
                            <div className="section_header">
                                <h3>
                                    <i className="bi bi-wallet2"></i>{" "}
                                    Payment &
                                    Invoices
                                </h3>

                                <span
                                    className="view_all_link"
                                    style={{
                                        cursor:
                                            "pointer",
                                    }}
                                    onClick={() =>
                                        setShowFullHistory(
                                            !showFullHistory,
                                        )
                                    }
                                >
                                    {showFullHistory
                                        ? "Show Less"
                                        : "Full History"}
                                </span>
                            </div>

                            {/* Invoice Tabs */}
                            <div className="premium_tabs">
                                {invoices.some(
                                    (
                                        invoice,
                                    ) =>
                                        invoice.type ===
                                        "recorded",
                                ) && (
                                        <button
                                            className={`tab_btn ${invoiceTab ===
                                                "recorded"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setInvoiceTab(
                                                    "recorded",
                                                )
                                            }
                                        >
                                            <i className="bi bi-play"></i>{" "}
                                            Recorded
                                            Course
                                            Invoices
                                        </button>
                                    )}

                                {invoices.some(
                                    (
                                        invoice,
                                    ) =>
                                        invoice.type ===
                                        "live",
                                ) && (
                                        <button
                                            className={`tab_btn ${invoiceTab ===
                                                "live"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setInvoiceTab(
                                                    "live",
                                                )
                                            }
                                        >
                                            <i className="bi bi-broadcast"></i>{" "}
                                            Live Course
                                            Invoices{" "}
                                            <span className="badge_live">
                                                Live
                                            </span>
                                        </button>
                                    )}
                            </div>

                            {/* Invoice Table */}
                            <div className="invoice_table_container">
                                <table className="premium_table">
                                    <thead>
                                        <tr>
                                            <th>
                                                Course
                                            </th>
                                            <th>
                                                Invoice
                                                ID
                                            </th>
                                            <th>
                                                Date
                                            </th>
                                            <th>
                                                Course
                                                Amount
                                            </th>
                                            <th>
                                                Paid
                                                Amount
                                            </th>
                                            <th>
                                                Status
                                            </th>
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
                                                        7
                                                    }
                                                    className="text-center py-4"
                                                >
                                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                                </td>
                                            </tr>
                                        ) : invoices.filter(
                                            (
                                                invoice,
                                            ) =>
                                                invoice.type ===
                                                invoiceTab,
                                        ).length >
                                            0 ? (
                                            invoices
                                                .filter(
                                                    (
                                                        invoice,
                                                    ) =>
                                                        invoice.type ===
                                                        invoiceTab,
                                                )
                                                .slice(
                                                    0,
                                                    showFullHistory
                                                        ? undefined
                                                        : 3,
                                                )
                                                .map(
                                                    (
                                                        inv,
                                                    ) => {
                                                        const isPaid =
                                                            inv.status
                                                                .toLowerCase()
                                                                .includes(
                                                                    "paid",
                                                                ) &&
                                                            !inv.status
                                                                .toLowerCase()
                                                                .includes(
                                                                    "unpaid",
                                                                ) &&
                                                            !inv.status
                                                                .toLowerCase()
                                                                .includes(
                                                                    "partial",
                                                                );

                                                        return (
                                                            <tr
                                                                key={
                                                                    inv.id
                                                                }
                                                            >
                                                                <td className="inv_course_name">
                                                                    {
                                                                        inv.course
                                                                    }
                                                                </td>

                                                                <td className="inv_id">
                                                                    {
                                                                        inv.invoice_number
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        inv.date
                                                                    }
                                                                </td>

                                                                <td>
                                                                    ₹
                                                                    {parseFloat(
                                                                        String(
                                                                            inv.course_amount ||
                                                                            0,
                                                                        ),
                                                                    ).toLocaleString()}
                                                                </td>

                                                                <td>
                                                                    ₹
                                                                    {parseFloat(
                                                                        String(
                                                                            inv.paid_amount ||
                                                                            0,
                                                                        ),
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
                                                                            inv.status
                                                                        }
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <button
                                                                        className="btn_inv_pdf"
                                                                        onClick={() =>
                                                                            generateInvoicePDF(
                                                                                inv,
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="bi bi-file-earmark-pdf"></i>{" "}
                                                                        PDF
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        7
                                                    }
                                                    className="text-center py-4 text-muted"
                                                >
                                                    No
                                                    invoices
                                                    found
                                                    for
                                                    this
                                                    category.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Spent */}
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
                                                    invoice,
                                                ) =>
                                                    invoice.type ===
                                                    invoiceTab,
                                            )
                                            .reduce(
                                                (
                                                    acc,
                                                    curr,
                                                ) =>
                                                    acc +
                                                    parseFloat(
                                                        String(
                                                            curr.paid_amount ||
                                                            0,
                                                        ),
                                                    ),
                                                0,
                                            )
                                            .toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================================
                EDIT PROFILE MODAL
            ================================================================== */}

            {showEditModal && (
                <div
                    className="modal_overlay"
                    onClick={() =>
                        setShowEditModal(
                            false,
                        )
                    }
                >
                    <div
                        className="modal_content animate__animated animate__fadeInDown"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="modal_header">
                            <h2>
                                Edit Profile
                            </h2>

                            <button
                                className="btn_modal_close_top"
                                onClick={() =>
                                    setShowEditModal(
                                        false,
                                    )
                                }
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="modal_body">
                            {/* Profile Photo */}
                            <div className="photo_edit_section">
                                <div className="avatar_edit_main">
                                    {getProfileImage() ? (
                                        <img
                                            src={getProfileImage()!}
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
                                        Profile
                                        Photo
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

                            <h4 className="form_section_label">
                                Personal
                                Information
                            </h4>

                            <div className="modal_edit_grid">
                                {/* First Name */}
                                <div className="edit_form_field">
                                    <label>
                                        First
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="first_name"
                                        value={
                                            editForm.first_name ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="First Name"
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="edit_form_field">
                                    <label>
                                        Last
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="last_name"
                                        value={
                                            editForm.last_name ||
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
                                        Date of
                                        Birth
                                    </label>

                                    <input
                                        type="date"
                                        className="premium_input"
                                        name="date_of_birth"
                                        value={
                                            editForm.date_of_birth ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />
                                </div>

                                {/* Gender */}
                                <div className="edit_form_field">
                                    <label>
                                        Gender
                                    </label>

                                    <select
                                        className="premium_input"
                                        name="gender"
                                        value={
                                            editForm.gender ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            Select
                                            Gender
                                        </option>

                                        <option value="1">
                                            Male
                                        </option>

                                        <option value="2">
                                            Female
                                        </option>
                                    </select>
                                </div>

                                {/* Primary Phone */}
                                <div className="edit_form_field">
                                    <label>
                                        Primary
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="primary_phone"
                                        value={
                                            editForm.primary_phone ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                {/* Secondary Phone */}
                                <div className="edit_form_field">
                                    <label>
                                        Secondary
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="secondary_phone"
                                        value={
                                            editForm.secondary_phone ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="+91 — optional"
                                    />
                                </div>

                                {/* Email */}
                                <div className="edit_form_field edit_form_full">
                                    <label>
                                        Email
                                        Address
                                    </label>

                                    <input
                                        type="email"
                                        className="premium_input"
                                        name="email"
                                        value={
                                            editForm.email ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="arjun.ramesh@email.com"
                                    />
                                </div>

                                {/* Education */}
                                <div className="edit_form_field edit_form_full">
                                    <label>
                                        Designation
                                        (Education)
                                    </label>

                                    <input
                                        type="text"
                                        className="premium_input"
                                        name="education"
                                        value={
                                            editForm.education ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Full-Stack Developer"
                                    />
                                </div>

                                {/* Address */}
                                <div className="edit_form_field edit_form_full">
                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        className="premium_input"
                                        name="address"
                                        rows={2}
                                        value={
                                            editForm.address ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Home address"
                                        style={{
                                            height:
                                                "auto",
                                        }}
                                    ></textarea>
                                </div>

                                {/* State */}
                                <div className="edit_form_field edit_form_full">
                                    <label>
                                        State
                                    </label>

                                    <select
                                        className="premium_input"
                                        name="state_id"
                                        value={
                                            editForm.state_id ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            Select
                                            State
                                        </option>

                                        {states.map(
                                            (
                                                state,
                                            ) => (
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
                                            ),
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal_footer">
                            <button
                                className="btn_prem btn_prem_outline flex-grow-1 justify-content-center"
                                onClick={() =>
                                    setShowEditModal(
                                        false,
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="btn_prem btn_prem_primary flex-grow-1 justify-content-center"
                                onClick={
                                    updateProfile
                                }
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================================
                SUCCESS MODAL
            ================================================================== */}

            {showSuccessModal && (
                <div
                    className="success_overlay"
                    onClick={() =>
                        setShowSuccessModal(
                            false,
                        )
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
                            Profile
                            Updated!
                        </h2>

                        <p>
                            Your details
                            have been
                            successfully
                            saved to your
                            profile and
                            are now live
                            across the
                            platform.
                        </p>

                        <button
                            className="btn_success_perfect"
                            onClick={() =>
                                setShowSuccessModal(
                                    false,
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
};

export default Profile;