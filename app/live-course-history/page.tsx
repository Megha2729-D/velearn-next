"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";

interface User {
    id: number | string;
    name?: string;
}

interface TodayClass {
    id: number | string;
    title: string;
    course_title: string;
    mentor: string;
    started: string;
    is_active: boolean;
    meet_link: string;
}

interface SessionItem {
    title: string;
    date: string;
    type: "watch" | "live" | "upcoming" | string;
    video?: string | null;
    note?: string | null;
    log_id?: number | string | null;
}

interface Module {
    id: number | string;
    title: string;
    status: string;
    sessions: number;
    content: SessionItem[];
}

interface StudentNote {
    id: number | string;
    title?: string | null;
    content: string;
}

interface NoteForm {
    id?: number | string;
    title: string;
    content: string;
}

interface DashboardData {
    status?: boolean;
    todayClasses?: TodayClass[];
    modules?: Module[];
    [key: string]: any;
}

const LiveCourseHistory = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const [dashboardData, setDashboardData] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] = useState(true);

    // Video Modal
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Student Notes
    const [selectedVideoItem, setSelectedVideoItem] =
        useState<SessionItem | null>(null);

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);

    const [isEditingNote, setIsEditingNote] = useState(false);

    const [currentNote, setCurrentNote] = useState<NoteForm>({
        title: "",
        content: "",
    });

    const [noteToDelete, setNoteToDelete] =
        useState<number | string | null>(null);

    // --------------------------------------------------
    // Open Video Modal
    // --------------------------------------------------
    const openVideoModal = (videoUrl: string) => {
        setSelectedVideo(videoUrl);
        setIsVideoModalOpen(true);
    };

    // --------------------------------------------------
    // Fetch Student Notes
    // --------------------------------------------------
    const fetchStudentNotes = async (
        logId: number | string | null | undefined
    ) => {
        try {
            const userString = localStorage.getItem("user");

            if (userString && logId) {
                const userLocal: User = JSON.parse(userString);

                const res = await axios.get(
                    `${BASE_API_URL}student-video-notes/${userLocal.id}/${logId}`
                );

                if (res.data?.status) {
                    setStudentNotes(res.data.notes || []);
                }
            }
        } catch (error) {
            console.error("Error fetching notes", error);
        }
    };

    // --------------------------------------------------
    // Open Notes Modal
    // --------------------------------------------------
    const openNoteModal = (item: SessionItem) => {
        setSelectedVideoItem(item);
        setIsNoteModalOpen(true);
        setIsEditingNote(false);

        setCurrentNote({
            title: "",
            content: "",
        });

        if (item.log_id) {
            fetchStudentNotes(item.log_id);
        } else {
            setStudentNotes([]);
        }
    };

    // --------------------------------------------------
    // Save Note
    // --------------------------------------------------
    const handleSaveNote = async () => {
        try {
            const userString = localStorage.getItem("user");

            if (userString && selectedVideoItem?.log_id) {
                const userLocal: User = JSON.parse(userString);

                const payload = {
                    student_id: userLocal.id,
                    batch_topic_log_id: selectedVideoItem.log_id,
                    title: currentNote.title,
                    content: currentNote.content,
                };

                if (currentNote.id) {
                    // Update
                    await axios.put(
                        `${BASE_API_URL}student-video-notes/${currentNote.id}`,
                        payload
                    );
                } else {
                    // Create
                    await axios.post(
                        `${BASE_API_URL}student-video-notes`,
                        payload
                    );
                }

                setIsEditingNote(false);

                await fetchStudentNotes(selectedVideoItem.log_id);
            }
        } catch (error) {
            console.error("Error saving note", error);
        }
    };

    // --------------------------------------------------
    // Delete Note
    // --------------------------------------------------
    const handleDeleteNote = async (
        noteId: number | string
    ) => {
        try {
            await axios.delete(
                `${BASE_API_URL}student-video-notes/${noteId}`
            );

            if (selectedVideoItem?.log_id) {
                await fetchStudentNotes(selectedVideoItem.log_id);
            }
        } catch (error) {
            console.error("Error deleting note", error);
        }
    };

    // --------------------------------------------------
    // Fetch Dashboard Data
    // --------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userString = localStorage.getItem("user");

                if (userString) {
                    const userLocal: User = JSON.parse(userString);

                    const res = await axios.get(
                        `${BASE_API_URL}student-modules-history/${userLocal.id}`
                    );

                    if (res.data?.status) {
                        setDashboardData(res.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching history data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --------------------------------------------------
    // Loading State
    // --------------------------------------------------
    if (loading) {
        return (
            <div className="dashboard_layout">
                <Sidebar
                    activePage="live-course-history"
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <div
                    className="dashboard_main_content d-flex justify-content-center align-items-center"
                    style={{ minHeight: "100vh" }}
                >
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const todayClasses =
        dashboardData?.todayClasses || [];

    const modules =
        dashboardData?.modules || [];

    return (
        <div className="dashboard_layout">

            {/* Sidebar */}
            <Sidebar
                activePage="live-course-history"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Overlay */}
            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Notifications */}
            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={[]}
            />

            {/* Main Content */}
            <div className="dashboard_main_content">

                {/* Header */}
                <header className="dashboard_top_header">

                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses{" "}
                            <span>/ Live Classes</span>
                        </h2>
                    </div>

                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>
                    </div>

                </header>

                {/* Live Classes Container */}
                <div className="live_classes_container">

                    {todayClasses.length === 0 && modules.length === 0 ? (
                        /* =========================================
                           NO LIVE COURSE ENROLLED
                        ========================================== */
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{
                                minHeight: "60vh",
                                width: "100%",
                            }}
                        >
                            <div
                                className="text-center"
                                style={{
                                    maxWidth: "500px",
                                    padding: "50px 30px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        margin: "0 auto 25px",
                                        borderRadius: "50%",
                                        background: "#f1f5ff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <i
                                        className="bi bi-camera-video"
                                        style={{
                                            fontSize: "36px",
                                            color: "#0d6efd",
                                        }}
                                    ></i>
                                </div>

                                <h3
                                    style={{
                                        fontWeight: 700,
                                        marginBottom: "12px",
                                    }}
                                >
                                    No Live Course Has Been Enrolled
                                </h3>

                                <p
                                    className="text-muted"
                                    style={{
                                        fontSize: "15px",
                                        lineHeight: 1.6,
                                        marginBottom: 0,
                                    }}
                                >
                                    You haven't enrolled in any live course yet.
                                    Enroll in a live course to access classes,
                                    recordings and course materials.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* =========================================
                LIVE NOW / UPCOMING TODAY
            ========================================== */}

                            {todayClasses.length > 0 &&
                                todayClasses.map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="live_now_hero_card mb-4"
                                        style={{
                                            opacity: cls.is_active ? 1 : 0.8,
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">

                                            <div className="hero_live_info">

                                                <div
                                                    className={`live_indicator_pill mb-3 ${!cls.is_active
                                                            ? "bg-secondary"
                                                            : ""
                                                        }`}
                                                >
                                                    <span
                                                        className={
                                                            cls.is_active
                                                                ? "pulse_dot"
                                                                : ""
                                                        }
                                                    ></span>

                                                    {cls.is_active
                                                        ? "LIVE NOW"
                                                        : "UPCOMING TODAY"}
                                                </div>

                                                <h1>{cls.title}</h1>

                                                <p>
                                                    {cls.course_title} • Mentor{" "}
                                                    {cls.mentor} • {cls.started}
                                                </p>

                                            </div>

                                            <a
                                                href={
                                                    cls.is_active
                                                        ? cls.meet_link
                                                        : "#"
                                                }
                                                target={
                                                    cls.is_active &&
                                                        cls.meet_link !== "#"
                                                        ? "_blank"
                                                        : "_self"
                                                }
                                                rel="noopener noreferrer"
                                                className={`btn_join_now_large text-decoration-none ${!cls.is_active
                                                        ? "disabled"
                                                        : ""
                                                    }`}
                                                style={{
                                                    pointerEvents: cls.is_active
                                                        ? "auto"
                                                        : "none",
                                                    cursor: cls.is_active
                                                        ? "pointer"
                                                        : "not-allowed",
                                                    opacity: cls.is_active
                                                        ? 1
                                                        : 0.5,
                                                }}
                                                title={
                                                    !cls.is_active
                                                        ? "Join link activates 10 minutes before the session starts."
                                                        : ""
                                                }
                                            >
                                                Join Now{" "}
                                                <i className="bi bi-arrow-right"></i>
                                            </a>

                                        </div>
                                    </div>
                                ))}

                            {/* =========================================
                MODULE-WISE CLASSES
            ========================================== */}

                            <div className="module_section mt-5">

                                <div className="section_header_with_icon mb-4">

                                    <i className="bi bi-collection-play"></i>

                                    <h3>
                                        Module-wise Classes & Recordings
                                    </h3>

                                </div>

                                <div className="module_list">

                                    {modules.map((mod) => (
                                        // KEEP YOUR EXISTING MODULE CODE HERE
                                        <div
                                            key={mod.id}
                                            className={`module_item_wrap ${mod.status.toLowerCase()}`}
                                        >
                                            {/* Your existing module content */}
                                        </div>
                                    ))}

                                </div>

                            </div>
                        </>
                    )}

                </div>

            </div>

            {/* =========================================
          VIDEO MODAL
      ========================================== */}
            {isVideoModalOpen && (
                <div
                    className="modal-overlay d-flex justify-content-center align-items-center"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        zIndex: 1050,
                    }}
                    onClick={() =>
                        setIsVideoModalOpen(false)
                    }
                >

                    <div
                        className="modal-dialog modal-lg"
                        style={{
                            width: "90%",
                            maxWidth: "800px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden",
                        }}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header d-flex justify-content-between align-items-center p-3 border-bottom">

                            <h5 className="modal-title mb-0">
                                Session Recording
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() =>
                                    setIsVideoModalOpen(false)
                                }
                                aria-label="Close"
                            ></button>

                        </div>

                        <div
                            className="modal-body p-0"
                            style={{
                                backgroundColor: "#000",
                            }}
                        >

                            {selectedVideo && (
                                <video
                                    src={selectedVideo}
                                    controls
                                    autoPlay
                                    className="w-100"
                                    style={{
                                        maxHeight: "70vh",
                                    }}
                                />
                            )}

                        </div>

                    </div>

                </div>
            )}

            {/* =========================================
          NOTE MODAL
      ========================================== */}
            {isNoteModalOpen && (
                <div
                    className="modal-overlay d-flex justify-content-center align-items-center"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 10500,
                        pointerEvents: "auto",
                    }}
                >

                    <div
                        className="modal-dialog"
                        style={{
                            width: "90%",
                            maxWidth: "600px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden",
                            pointerEvents: "auto",
                            zIndex: 10501,
                            position: "relative",
                        }}
                    >

                        {/* Note Modal Header */}
                        <div className="modal-header d-flex justify-content-between align-items-center p-3 border-bottom bg-light">

                            <h5 className="modal-title mb-0 fw-bold">
                                {selectedVideoItem?.title} - My Notes
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() =>
                                    setIsNoteModalOpen(false)
                                }
                                aria-label="Close"
                            ></button>

                        </div>

                        {/* Note Modal Body */}
                        <div
                            className="modal-body p-4"
                            style={{
                                maxHeight: "60vh",
                                overflowY: "auto",
                            }}
                        >

                            {/* Teacher's Note */}
                            {selectedVideoItem?.note &&
                                !isEditingNote && (
                                    <div className="mb-4 p-3 bg-light rounded">

                                        <h6>
                                            Teacher's Note:
                                        </h6>

                                        <p
                                            style={{
                                                whiteSpace: "pre-wrap",
                                                margin: 0,
                                            }}
                                        >
                                            {selectedVideoItem.note}
                                        </p>

                                    </div>
                                )}

                            {!isEditingNote ? (
                                <>
                                    {/* Saved Notes Header */}
                                    <div
                                        className="d-flex justify-content-between mb-3"
                                        style={{
                                            position: "relative",
                                            zIndex: 9999,
                                        }}
                                    >

                                        <h6>
                                            My Saved Notes
                                        </h6>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            style={{
                                                cursor: "pointer",
                                                pointerEvents: "auto",
                                                position: "relative",
                                                zIndex: 9999,
                                            }}
                                            onClick={() => {
                                                setCurrentNote({
                                                    title: "",
                                                    content: "",
                                                });

                                                setIsEditingNote(true);
                                            }}
                                        >
                                            + Add Note
                                        </button>

                                    </div>

                                    {/* Notes List */}
                                    {studentNotes.length === 0 ? (
                                        <p className="text-muted text-center py-3">
                                            No notes created yet.
                                        </p>
                                    ) : (
                                        studentNotes.map((note) => (

                                            <div
                                                key={note.id}
                                                className="card mb-3 shadow-sm border-0 bg-light"
                                            >

                                                <div className="card-body">

                                                    <div className="d-flex justify-content-between">

                                                        <h6 className="fw-bold">
                                                            {note.title ||
                                                                "Untitled Note"}
                                                        </h6>

                                                        <div
                                                            style={{
                                                                position:
                                                                    "relative",
                                                                zIndex: 9999,
                                                            }}
                                                        >

                                                            {/* Edit */}
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-link text-primary p-0 me-2"
                                                                style={{
                                                                    cursor: "pointer",
                                                                    pointerEvents:
                                                                        "auto",
                                                                }}
                                                                onClick={() => {
                                                                    setCurrentNote({
                                                                        id: note.id,
                                                                        title: note.title || "",
                                                                        content: note.content || "",
                                                                    });

                                                                    setIsEditingNote(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>

                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-link text-danger p-0"
                                                                style={{
                                                                    cursor: "pointer",
                                                                    pointerEvents:
                                                                        "auto",
                                                                }}
                                                                onClick={() => {
                                                                    setNoteToDelete(
                                                                        note.id
                                                                    );
                                                                }}
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </div>

                                                    <p
                                                        className="mt-2 mb-0"
                                                        style={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                        }}
                                                    >
                                                        {note.content}
                                                    </p>

                                                </div>

                                            </div>

                                        ))
                                    )}
                                </>
                            ) : (
                                /* =========================================
                                   CREATE / EDIT NOTE
                                ========================================== */
                                <div
                                    style={{
                                        position: "relative",
                                        zIndex: 9999,
                                    }}
                                >

                                    <h6>
                                        {currentNote.id
                                            ? "Edit Note"
                                            : "Create Note"}
                                    </h6>

                                    {/* Title */}
                                    <div className="mb-3">

                                        <label className="form-label">
                                            Title (Optional)
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={
                                                currentNote.title || ""
                                            }
                                            onChange={(e) =>
                                                setCurrentNote({
                                                    ...currentNote,
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="Note title..."
                                        />

                                    </div>

                                    {/* Content */}
                                    <div className="mb-3">

                                        <label className="form-label">
                                            Content
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows={5}
                                            value={
                                                currentNote.content || ""
                                            }
                                            onChange={(e) =>
                                                setCurrentNote({
                                                    ...currentNote,
                                                    content: e.target.value,
                                                })
                                            }
                                            placeholder="Write your note here..."
                                        ></textarea>

                                    </div>

                                    {/* Buttons */}
                                    <div className="d-flex justify-content-end gap-2">

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            style={{
                                                cursor: "pointer",
                                                pointerEvents: "auto",
                                            }}
                                            onClick={() => {
                                                setIsEditingNote(false);
                                            }}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{
                                                cursor: "pointer",
                                                pointerEvents: "auto",
                                            }}
                                            onClick={() => {
                                                handleSaveNote();
                                            }}
                                            disabled={
                                                !currentNote.content ||
                                                String(
                                                    currentNote.content
                                                ).trim() === ""
                                            }
                                        >
                                            Save Note
                                        </button>

                                    </div>

                                </div>
                            )}

                        </div>

                        {/* Note Modal Footer */}
                        <div
                            className="modal-footer p-3 border-top text-end bg-light"
                            style={{
                                display: !isEditingNote
                                    ? "block"
                                    : "none",
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                    setIsNoteModalOpen(false)
                                }
                            >
                                Close
                            </button>
                        </div>

                    </div>

                    {/* =========================================
              DELETE CONFIRMATION MODAL
          ========================================== */}
                    {noteToDelete && (
                        <div
                            className="modal-overlay d-flex justify-content-center align-items-center"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor:
                                    "rgba(0,0,0,0.6)",
                                zIndex: 10502,
                            }}
                        >

                            <div
                                className="bg-white p-4 rounded shadow-lg text-center"
                                style={{
                                    width: "90%",
                                    maxWidth: "400px",
                                }}
                            >

                                <h5 className="mb-3 text-danger fw-bold">

                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>

                                    Delete Note

                                </h5>

                                <p className="mb-4 text-muted">
                                    Are you sure you want to delete this
                                    note? This action cannot be undone.
                                </p>

                                <div className="d-flex justify-content-center gap-3">

                                    <button
                                        type="button"
                                        className="btn btn-secondary px-4"
                                        onClick={() =>
                                            setNoteToDelete(null)
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-danger px-4"
                                        onClick={async () => {
                                            const id = noteToDelete;

                                            setNoteToDelete(null);

                                            await handleDeleteNote(id);
                                        }}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

export default LiveCourseHistory;