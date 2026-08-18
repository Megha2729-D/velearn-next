"use client";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import "./style.css";

interface Course {
    id?: number | string;
    title?: string;
    short_description?: string;
    image?: string;
}

interface Video {
    id: number | string;
    title: string;
    short_description?: string;
    video: string;
    script?: string;
    subtitle_en?: string;
    subtitle_ta?: string;
    subtitle_en_content?: string;
    subtitle_ta_content?: string;
}

interface Quiz {
    id: number;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    answer: string;
}

interface DetailedAnswer {
    quiz_id: number;
    selected: string;
    correct_answer: string;
}

interface QuizResponse {
    status: boolean;
    data: Quiz[];
    has_submitted?: boolean;
    previous_result?: {
        score: number;
        answers: DetailedAnswer[];
    };
}

interface CourseVideosResponse {
    status: boolean;
    course?: Course;
    videos?: Video[];
}

const isProduction =
    typeof window !== "undefined" &&
    (window.location.hostname === "velearn.in" ||
        window.location.hostname === "www.velearn.in");

// const BASE_API_URL = isProduction
//     ? "https://crm.velearn.in/api/"
//     : typeof window !== "undefined"
//         ? `http://${window.location.hostname}:8000/api/`
//         : "http://localhost:8000/api/";

// const BASE_DYNAMIC_IMAGE_URL = isProduction
//     ? "https://crm.velearn.in/api/public/uploads/"
//     : typeof window !== "undefined"
//         ? `http://${window.location.hostname}:8000/uploads/`
//         : "http://localhost:8000/uploads/";

// const BASE_DYNAMIC_COURSE_VIDEO_URL = isProduction
//     ? "https://crm.velearn.in/api/public/"
//     : typeof window !== "undefined"
//         ? `http://${window.location.hostname}:8000/`
//         : "http://localhost:8000/";
const BASE_API_URL = "https://crm.velearn.in/api/";

const BASE_DYNAMIC_IMAGE_URL = "https://crm.velearn.in/api/public/uploads/";

const BASE_DYNAMIC_COURSE_VIDEO_URL = "https://crm.velearn.in/api/public/";

export default function LearnCoursePage() {
    const params = useParams<{ courseId: string }>();

    const courseId = params.courseId;

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [course, setCourse] = useState<Course | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);

    const [quiz, setQuiz] = useState<Quiz[]>([]);
    const [quizMap, setQuizMap] = useState<Record<string, boolean>>({});

    const [loading, setLoading] = useState(true);

    const [showQuizModal, setShowQuizModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [answers, setAnswers] = useState<Record<number, string>>({});

    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const [score, setScore] = useState(0);

    const [reviewMode, setReviewMode] = useState(false);
    const [reviewQuestion, setReviewQuestion] = useState(0);

    const [detailedAnswers, setDetailedAnswers] = useState<
        DetailedAnswer[]
    >([]);

    const [subtitleMode, setSubtitleMode] = useState<"en" | "ta" | "off">(
        "en",
    );

    const [enBlob, setEnBlob] = useState<string | null>(null);
    const [taBlob, setTaBlob] = useState<string | null>(null);

    const [enPath, setEnPath] = useState<string | null>(null);
    const [taPath, setTaPath] = useState<string | null>(null);

    const [trackStatus, setTrackStatus] = useState("Loading...");

    const [showSubtitleModal, setShowSubtitleModal] = useState(false);

    const [activeTab, setActiveTab] = useState<"script" | "quiz">("script");

    /*
    |--------------------------------------------------------------------------
    | Get Current User
    |--------------------------------------------------------------------------
    */

    const getUserId = () => {
        if (typeof window === "undefined") return undefined;

        try {
            const user = JSON.parse(
                localStorage.getItem("user") || "null",
            );

            return user?.id;
        } catch {
            return undefined;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Disable / Enable Page Scroll
    |--------------------------------------------------------------------------
    */

    const disablePageScroll = useCallback(() => {
        document.body.classList.add("modal-open-custom");
        document.documentElement.classList.add("modal-open-custom");
    }, []);

    const enablePageScroll = useCallback(() => {
        document.body.classList.remove("modal-open-custom");
        document.documentElement.classList.remove("modal-open-custom");
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load Video Tracks
    |--------------------------------------------------------------------------
    */

    const loadVideoTracks = useCallback(async (video: Video | null) => {
        if (!video) return;

        // Revoke old blob URLs
        setEnBlob((old) => {
            if (old) URL.revokeObjectURL(old);
            return null;
        });

        setTaBlob((old) => {
            if (old) URL.revokeObjectURL(old);
            return null;
        });

        setEnPath(null);
        setTaPath(null);

        setTrackStatus("Preparing...");

        let localEnFound = false;
        let localTaFound = false;

        /*
        |--------------------------------------------------------------------------
        | English Subtitle
        |--------------------------------------------------------------------------
        */

        if (video.subtitle_en_content) {
            const blob = new Blob([video.subtitle_en_content], {
                type: "text/vtt",
            });

            setEnBlob(URL.createObjectURL(blob));
            setTrackStatus("English Ready");

            localEnFound = true;
        } else if (video.subtitle_en) {
            const fullUrl =
                `${BASE_DYNAMIC_COURSE_VIDEO_URL}${video.subtitle_en}`;

            try {
                const res = await fetch(fullUrl);

                if (res.ok) {
                    const blob = await res.blob();

                    setEnBlob(URL.createObjectURL(blob));
                    setTrackStatus("English Ready");

                    localEnFound = true;
                } else {
                    setEnPath(fullUrl);
                    setTrackStatus("English Ready (Direct)");

                    localEnFound = true;
                }
            } catch {
                setEnPath(fullUrl);
                setTrackStatus("English Ready (CORS Fallback)");

                localEnFound = true;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Tamil Subtitle
        |--------------------------------------------------------------------------
        */

        if (video.subtitle_ta_content) {
            const blob = new Blob([video.subtitle_ta_content], {
                type: "text/vtt",
            });

            setTaBlob(URL.createObjectURL(blob));

            setTrackStatus(
                localEnFound ? "Multi-Lang Ready" : "Tamil Ready",
            );

            localTaFound = true;
        } else if (video.subtitle_ta) {
            const fullUrl =
                `${BASE_DYNAMIC_COURSE_VIDEO_URL}${video.subtitle_ta}`;

            try {
                const res = await fetch(fullUrl);

                if (res.ok) {
                    const blob = await res.blob();

                    setTaBlob(URL.createObjectURL(blob));

                    setTrackStatus(
                        localEnFound
                            ? "Multi-Lang Ready"
                            : "Tamil Ready",
                    );

                    localTaFound = true;
                } else {
                    setTaPath(fullUrl);

                    setTrackStatus(
                        localEnFound
                            ? "Multi-Lang Ready"
                            : "Tamil Ready (Direct)",
                    );

                    localTaFound = true;
                }
            } catch {
                setTaPath(fullUrl);

                setTrackStatus(
                    localEnFound
                        ? "Multi-Lang Ready"
                        : "Tamil Ready (CORS Fallback)",
                );

                localTaFound = true;
            }
        }

        if (!localEnFound && !localTaFound) {
            setTrackStatus("No Subtitles");
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load Quiz
    |--------------------------------------------------------------------------
    */

    const loadQuiz = useCallback(async (videoId: number | string) => {
        const userId = getUserId();

        try {
            const res = await fetch(
                `${BASE_API_URL}video-quiz/${videoId}?user_id=${userId ?? ""}`,
            );

            const data: QuizResponse = await res.json();

            if (!data.status) return;

            if (data.has_submitted && data.previous_result) {
                const prev = data.previous_result;

                const previousAnswers: Record<number, string> = {};

                prev.answers.forEach((a) => {
                    const quizQuestion = data.data.find(
                        (q) => q.id === a.quiz_id,
                    );

                    if (!quizQuestion) return;

                    if (quizQuestion.option1 === a.selected) {
                        previousAnswers[quizQuestion.id] = "1";
                    }

                    if (quizQuestion.option2 === a.selected) {
                        previousAnswers[quizQuestion.id] = "2";
                    }

                    if (quizQuestion.option3 === a.selected) {
                        previousAnswers[quizQuestion.id] = "3";
                    }
                });

                setQuiz(data.data);
                setAnswers(previousAnswers);

                setQuizCompleted(true);
                setQuizSubmitted(true);

                setScore(Math.round(prev.score));

                setDetailedAnswers(prev.answers);

                setCurrentQuestion(0);
            } else {
                setQuiz(data.data);
                setAnswers({});

                setQuizCompleted(false);
                setQuizSubmitted(false);

                setCurrentQuestion(0);
            }
        } catch (error) {
            console.error("Quiz fetch error:", error);
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Check Quiz Availability For All Videos
    |--------------------------------------------------------------------------
    */

    const checkQuizForVideos = useCallback(async (videoList: Video[]) => {
        const results: Record<string, boolean> = {};

        await Promise.all(
            videoList.map(async (video) => {
                try {
                    const res = await fetch(
                        `${BASE_API_URL}video-quiz/${video.id}`,
                    );

                    const data = await res.json();

                    results[String(video.id)] =
                        data.status && data.data?.length > 0;
                } catch {
                    results[String(video.id)] = false;
                }
            }),
        );

        setQuizMap(results);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Initial Course Fetch
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!courseId) return;

        const fetchCourse = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    `${BASE_API_URL}courses/${courseId}/videos`
                );

                const data: CourseVideosResponse = await res.json();

                if (
                    data.status &&
                    data.videos &&
                    data.videos.length > 0
                ) {
                    const firstVideo = data.videos[0];

                    setCourse(data.course || null);
                    setVideos(data.videos);
                    setActiveVideo(firstVideo);
                    setLoading(false);

                    await loadVideoTracks(firstVideo);
                    await loadQuiz(firstVideo.id);
                    await checkQuizForVideos(data.videos);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setLoading(false);
            }
        };

        fetchCourse();
    }, [
        courseId,
        loadVideoTracks,
        loadQuiz,
        checkQuizForVideos,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Video Selection
    |--------------------------------------------------------------------------
    */

    const selectVideo = async (video: Video) => {
        setActiveVideo(video);
        setCurrentQuestion(0);
        setReviewQuestion(0);
        setReviewMode(false);

        await loadVideoTracks(video);
        await loadQuiz(video.id);
    };

    /*
    |--------------------------------------------------------------------------
    | Subtitle Sync
    |--------------------------------------------------------------------------
    */

    const syncSubtitles = useCallback(() => {
        const video = videoRef.current;

        if (!video) return;

        const tracks = video.textTracks;
        const mode = subtitleMode;

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];

            const label = track.label?.toLowerCase() || "";

            const isMatch =
                track.language === mode ||
                (mode === "en" && label.includes("english")) ||
                (mode === "ta" && label.includes("tamil"));

            if (mode === "off") {
                track.mode = "disabled";
            } else {
                track.mode = isMatch ? "showing" : "disabled";
            }
        }
    }, [subtitleMode]);

    useEffect(() => {
        if (!activeVideo) return;

        const timer = setTimeout(() => {
            syncSubtitles();
        }, 500);

        return () => clearTimeout(timer);
    }, [
        activeVideo,
        subtitleMode,
        enBlob,
        taBlob,
        enPath,
        taPath,
        syncSubtitles,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Modal Scroll Handling
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (showQuizModal) {
            disablePageScroll();
        } else {
            enablePageScroll();
        }

        return () => enablePageScroll();
    }, [
        showQuizModal,
        disablePageScroll,
        enablePageScroll,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Cleanup Blob URLs
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            if (enBlob) URL.revokeObjectURL(enBlob);
            if (taBlob) URL.revokeObjectURL(taBlob);
        };
    }, [enBlob, taBlob]);

    /*
    |--------------------------------------------------------------------------
    | Answer Handling
    |--------------------------------------------------------------------------
    */

    const handleAnswer = (qid: number, option: string) => {
        setAnswers((prev) => ({
            ...prev,
            [qid]: option,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Next Question
    |--------------------------------------------------------------------------
    */

    const nextQuestion = () => {
        const question = quiz[currentQuestion];

        if (!question) return;

        if (!answers[question.id]) {
            alert("Please select an answer before proceeding.");
            return;
        }

        setCurrentQuestion((prev) => prev + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Previous Question
    |--------------------------------------------------------------------------
    */

    const prevQuestion = () => {
        setCurrentQuestion((prev) => prev - 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit Quiz
    |--------------------------------------------------------------------------
    */

    const submitQuiz = async () => {
        const currentQ = quiz[currentQuestion];

        if (!currentQ) return;

        if (!answers[currentQ.id]) {
            alert("Please select an answer before submitting.");
            return;
        }

        const userId = getUserId();

        const formattedAnswers = quiz.map((q) => ({
            quiz_id: q.id,
            selected: answers[q.id] || null,
        }));

        try {
            const res = await fetch(
                `${BASE_API_URL}submit-quiz`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        course_video_id: activeVideo?.id,
                        answers: formattedAnswers,
                    }),
                },
            );

            const data = await res.json();

            if (data.status) {
                const result = data.data;

                setQuizSubmitted(true);
                setQuizCompleted(true);

                setScore(Math.round(result.score));

                setShowQuizModal(false);

                setReviewMode(true);
                setReviewQuestion(0);

                setDetailedAnswers(result.answers);
            }
        } catch (error) {
            console.error("Submit quiz error:", error);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Subtitle Modal
    |--------------------------------------------------------------------------
    */

    const changeSubtitleMode = (
        mode: "en" | "ta" | "off",
    ) => {
        setSubtitleMode(mode);
        setShowSubtitleModal(false);

        setTimeout(() => {
            syncSubtitles();
        }, 100);
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="loading-container p-5">
                <div className="loading-spinner">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>

                <p className="loading-text">
                    Preparing your learning experience...
                </p>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | No Course / Video
    |--------------------------------------------------------------------------
    */

    if (!activeVideo && !loading) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 text-center">
                        <div className="p-5 bg-white rounded-4 shadow-sm border border-light">
                            <div className="mb-4">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle"
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                    }}
                                >
                                    <i className="bi bi-mortarboard-fill fs-1 text-c2"></i>
                                </div>
                            </div>

                            <h2 className="fw-bold text-c1 mb-3">
                                Your learning journey is almost ready!
                            </h2>

                            <p className="text-muted fs-5 mb-4">
                                The instructor is currently putting the
                                finishing touches on this course.
                                High-quality knowledge is worth the wait!
                            </p>

                            <div className="d-flex gap-3 justify-content-center">
                                <Link
                                    href="/recorded-course"
                                    className="btn_theme_outline px-4 py-2"
                                >
                                    Browse Other Courses
                                </Link>

                                <Link
                                    href="/my-courses"
                                    className="btn_theme_primary px-5 py-2"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const question = quiz.length
        ? quiz[currentQuestion]
        : null;

    const reviewQ = quiz.length
        ? quiz[reviewQuestion]
        : null;

    let scoreColor = "#f59e0b";

    if (score < 40) {
        scoreColor = "#ff0509";
    } else if (score >= 70) {
        scoreColor = "#0dba4b";
    }

    const thumbnail = course?.image
        ? `${BASE_DYNAMIC_IMAGE_URL}courses/${course.image}`
        : "";

    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */

    const currentProgress =
        quiz.length > 0
            ? ((reviewMode
                ? reviewQuestion + 1
                : currentQuestion +
                (question &&
                    answers[question.id]
                    ? 1
                    : 0)) /
                quiz.length) *
            100
            : 0;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="learn_page section_container py-5">
            <div className="row">
                {/* =========================================================
                    LEFT CONTENT
                ========================================================== */}

                <div className="col-lg-8">
                    {/* Course Header */}

                    <div className="course_header">
                        <nav className="breadcrumb_nav">
                            <Link
                                href="/my-courses"
                                className="crumb_home text-decoration-none"
                            >
                                <i className="bi bi-house-door-fill me-2"></i>
                                My Courses
                            </Link>

                            <i className="bi bi-chevron-right px-2 small opa-50"></i>

                            <span className="crumb_current">
                                {course?.title}
                            </span>
                        </nav>

                        <div className="course_header_flex mb-4">
                            <div className="mb-2">
                                <h1 className="course_title mb-1">
                                    {course?.title}
                                </h1>

                                {course?.short_description && (
                                    <div className="course_header_desc mt-2">
                                        <p className="description_text text-muted">
                                            {course.short_description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Subtitle Controller */}

                            <div className="video_control_hub">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="hub_label">
                                        Subtitles (Captions)
                                    </div>

                                    <div className="track_discovery_status">
                                        {trackStatus}
                                    </div>
                                </div>

                                <div className="hub_controls">
                                    <button
                                        onClick={() =>
                                            setShowSubtitleModal(true)
                                        }
                                        className={`hub_btn ${subtitleMode !== "off"
                                            ? "active"
                                            : ""
                                            }`}
                                        title="Choose your preferred language"
                                    >
                                        <i className="bi bi-badge-cc-fill"></i>

                                        <span>
                                            {subtitleMode === "off"
                                                ? "Captions Off"
                                                : subtitleMode === "en"
                                                    ? "English (Active)"
                                                    : "Tamil (Active)"}
                                        </span>

                                        <i className="bi bi-chevron-down ms-2 small"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        SUBTITLE MODAL
                    ====================================================== */}

                    {showSubtitleModal && (
                        <div
                            className="subtitle_modal_overlay"
                            onClick={() =>
                                setShowSubtitleModal(false)
                            }
                        >
                            <div
                                className="subtitle_modal_content"
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >
                                <div className="modal_header_custom">
                                    <h5 className="mb-0 fw-bold">
                                        Select Subtitle Language
                                    </h5>

                                    <button
                                        className="close_modal"
                                        onClick={() =>
                                            setShowSubtitleModal(false)
                                        }
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="modal_body_options">
                                    {/* English */}

                                    <button
                                        className={`option_item ${subtitleMode === "en"
                                            ? "selected"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            changeSubtitleMode("en")
                                        }
                                        disabled={
                                            !enBlob && !enPath
                                        }
                                    >
                                        <div className="option_flex">
                                            <i className="bi bi-translate me-3"></i>

                                            <div className="text-start">
                                                <div className="fw-bold">
                                                    English
                                                </div>

                                                <div className="small text-muted">
                                                    Standard English
                                                    subtitles
                                                </div>
                                            </div>
                                        </div>

                                        {subtitleMode === "en" && (
                                            <i className="bi bi-check-circle-fill text-primary"></i>
                                        )}
                                    </button>

                                    {/* Tamil */}

                                    <button
                                        className={`option_item ${subtitleMode === "ta"
                                            ? "selected"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            changeSubtitleMode("ta")
                                        }
                                        disabled={
                                            !taBlob && !taPath
                                        }
                                    >
                                        <div className="option_flex">
                                            <i className="bi bi-alphabet-uppercase me-3"></i>

                                            <div className="text-start">
                                                <div className="fw-bold">
                                                    Tamil (தமிழ்)
                                                </div>

                                                <div className="small text-muted">
                                                    Localized Tamil
                                                    subtitles
                                                </div>
                                            </div>
                                        </div>

                                        {subtitleMode === "ta" && (
                                            <i className="bi bi-check-circle-fill text-primary"></i>
                                        )}
                                    </button>

                                    {/* Off */}

                                    <button
                                        className={`option_item off_option ${subtitleMode === "off"
                                            ? "selected"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            changeSubtitleMode("off")
                                        }
                                    >
                                        <div className="option_flex">
                                            <i className="bi bi-x-circle me-3"></i>

                                            <div className="text-start">
                                                <div className="fw-bold">
                                                    Captions Off
                                                </div>

                                                <div className="small text-muted">
                                                    Disable all
                                                    subtitles
                                                </div>
                                            </div>
                                        </div>

                                        {subtitleMode === "off" && (
                                            <i className="bi bi-check-circle-fill text-secondary"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =====================================================
                        VIDEO
                    ====================================================== */}

                    <div className="video_box mainstream_video">
                        <div className="video_preview">
                            {/* <video
                                key={activeVideo.id}
                                ref={videoRef}
                                controls
                                poster={thumbnail}
                                width="100%"
                                src={`${BASE_DYNAMIC_COURSE_VIDEO_URL}${activeVideo.video}`}
                                className="main_video_player"
                                onPlay={syncSubtitles}
                                onPlaying={syncSubtitles}
                                onLoadedData={syncSubtitles}
                                controlsList="nodownload"
                                disablePictureInPicture
                                onContextMenu={(e) =>
                                    e.preventDefault()
                                }
                            >
                                {(enBlob || enPath) && (
                                    <track
                                        key={`en-${activeVideo.id}`}
                                        label="English"
                                        kind="subtitles"
                                        srcLang="en"
                                        src={enBlob || enPath || ""}
                                        default={
                                            subtitleMode === "en"
                                        }
                                    />
                                )}

                                {(taBlob || taPath) && (
                                    <track
                                        key={`ta-${activeVideo.id}`}
                                        label="Tamil"
                                        kind="subtitles"
                                        srcLang="ta"
                                        src={taBlob || taPath || ""}
                                        default={
                                            subtitleMode === "ta"
                                        }
                                    />
                                )}
                            </video> */}
                        </div>
                    </div>

                    {/* =====================================================
                        TABS
                    ====================================================== */}

                    <div className="learn_tabs_container mt-4">
                        <div className="learn_tabs_header d-flex gap-4 border-bottom mb-4">
                            <button
                                className={`learn_tab_btn ${activeTab === "script"
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setActiveTab("script")
                                }
                            >
                                <i className="bi bi-file-text me-2"></i>
                                Lesson Script
                            </button>

                            <button
                                className={`learn_tab_btn ${activeTab === "quiz"
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setActiveTab("quiz")
                                }
                            >
                                <i className="bi bi-award me-2"></i>
                                Topic Assessment

                                {/* {quizMap[String(activeVideo.id)] && (
                                    <span className="tab_indicator_dot"></span>
                                )} */}
                            </button>
                        </div>

                        {/* <div className="learn_tab_pane">
                         
                            {activeTab === "script" ? (
                                <div className="active_video_details p-4 bg-white rounded-4 shadow-sm border border-light">
                                    <h3 className="fw-bold mb-2">
                                        {activeVideo.title}
                                    </h3>

                                    <p className="text-muted mb-4 lh-lg">
                                        {activeVideo.short_description ||
                                            `Enhance your skills with this detailed lesson on ${activeVideo.title}.`}
                                    </p>

                                    {activeVideo.script ? (
                                        <div className="video_transcript_section pt-4 border-top">
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="bi bi-chat-left-text text-c2 me-2 fs-5"></i>

                                                <h5 className="fw-bold mb-0">
                                                    Transcript & Study
                                                    Notes
                                                </h5>
                                            </div>

                                            <div
                                                className="transcript_scroll_box p-3 bg-light rounded-3 shadow-none border"
                                                style={{
                                                    maxHeight:
                                                        "450px",
                                                    overflowY:
                                                        "auto",
                                                }}
                                            >
                                                <div
                                                    className="transcript_content text-muted lh-base"
                                                    style={{
                                                        whiteSpace:
                                                            "pre-line",
                                                    }}
                                                >
                                                    {
                                                        activeVideo.script
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <i className="bi bi-info-circle mb-2 d-block fs-3 opacity-25"></i>

                                            This lesson doesn't have a
                                            transcript yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="quiz_section p-4 bg-white rounded-4 shadow-sm border border-light">
                                    {quizMap[
                                        String(activeVideo.id)
                                    ] === true ? (
                                        <>
                                            {!quizCompleted ? (
                                                <div className="quiz_intro_box">
                                                    <div className="quiz_decoration">
                                                        <i className="bi bi-award-fill"></i>
                                                    </div>

                                                    <h3>
                                                        Knowledge Check
                                                        Ready
                                                    </h3>

                                                    <p className="quiz_intro_box_desc">
                                                        Validate your
                                                        learning and earn
                                                        your progress
                                                        badges.
                                                    </p>

                                                    <div className="quiz_stats_row">
                                                        <div className="stat_item">
                                                            <span className="stat_val">
                                                                {
                                                                    quiz.length
                                                                }
                                                            </span>

                                                            <span className="stat_lab">
                                                                Questions
                                                            </span>
                                                        </div>

                                                        <div className="stat_divider"></div>

                                                        <div className="stat_item">
                                                            <span className="stat_val">
                                                                70%
                                                            </span>

                                                            <span className="stat_lab">
                                                                Passing
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="start_quiz_btn"
                                                        onClick={() => {
                                                            setShowQuizModal(
                                                                true,
                                                            );
                                                            setReviewMode(
                                                                false,
                                                            );
                                                            setCurrentQuestion(
                                                                0,
                                                            );
                                                        }}
                                                    >
                                                        Start Topic
                                                        Assessment

                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="quiz_result_box p-0 border-0 shadow-none">
                                                    <div className="result_badge_container mb-4">
                                                        <div
                                                            className="badge_glow"
                                                            style={{
                                                                backgroundColor:
                                                                    scoreColor,
                                                            }}
                                                        ></div>

                                                        <div className="quiz_icon">
                                                            <svg
                                                                viewBox="0 0 100 100"
                                                                width="80"
                                                                height="80"
                                                            >
                                                                <path
                                                                    d="M30 60 L20 85 L30 80 L35 90 L45 65 Z"
                                                                    fill="#e15c64"
                                                                />

                                                                <path
                                                                    d="M70 60 L80 85 L70 80 L65 90 L55 65 Z"
                                                                    fill="#e15c64"
                                                                />

                                                                <path
                                                                    d="M50 8 L55 12 L62 10 L65 16 L72 17 L73 24 L79 27 L77 34 L82 39 L77 44 L79 51 L73 54 L72 61 L65 62 L62 68 L55 66 L50 72 L45 66 L38 68 L35 62 L28 61 L27 54 L21 51 L23 44 L18 39 L23 34 L21 27 L27 24 L28 17 L35 16 L38 10 L45 12 Z"
                                                                    fill={
                                                                        scoreColor
                                                                    }
                                                                />

                                                                <circle
                                                                    cx="50"
                                                                    cy="41"
                                                                    r="22"
                                                                    fill="#ffffff33"
                                                                />

                                                                <path
                                                                    d="M50 28 L54 36 L63 37 L57 43 L59 52 L50 47 L41 52 L43 43 L37 37 L46 36 Z"
                                                                    fill="#ffffff"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    <h3 className="fw-bold text-c1">
                                                        Assessment
                                                        Completed!
                                                    </h3>

                                                    <p className="text-muted mb-4">
                                                        You've
                                                        successfully
                                                        validated your
                                                        knowledge for
                                                        this lesson.
                                                    </p>

                                                    <div className="quiz_score_card">
                                                        <div
                                                            className="score_circle"
                                                            style={{
                                                                borderColor:
                                                                    scoreColor,
                                                            }}
                                                        >
                                                            <h2
                                                                style={{
                                                                    color: scoreColor,
                                                                }}
                                                            >
                                                                {score}%
                                                            </h2>

                                                            <span>
                                                                Final
                                                                Score
                                                            </span>
                                                        </div>

                                                        <div className="score_details mt-3">
                                                            <div className="d-flex justify-content-center gap-2 align-items-center">
                                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                                                    <i className="bi bi-check-circle-fill me-2"></i>

                                                                    {
                                                                        quiz.filter(
                                                                            (
                                                                                q,
                                                                            ) =>
                                                                                answers[
                                                                                q.id
                                                                                ] ===
                                                                                q.answer,
                                                                        ).length
                                                                    }{" "}
                                                                    Correct
                                                                </span>

                                                                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                                                                    {
                                                                        quiz.length
                                                                    }{" "}
                                                                    Total
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="quiz_actions mt-4">
                                                        <button
                                                            className="preview_answers_btn"
                                                            onClick={() => {
                                                                setShowQuizModal(
                                                                    true,
                                                                );
                                                                setReviewMode(
                                                                    true,
                                                                );
                                                                setReviewQuestion(
                                                                    0,
                                                                );
                                                            }}
                                                        >
                                                            <i className="bi bi-eye-fill me-2"></i>

                                                            Review Your
                                                            Answers
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : quizMap[
                                        String(activeVideo.id)
                                    ] === false ? (
                                        <div className="quiz_empty_box text-center p-5 bg-transparent border-0 shadow-none">
                                            <div className="mb-4">
                                                <div
                                                    className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle"
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                    }}
                                                >
                                                    <i className="bi bi-journal-x fs-1 text-muted opacity-50"></i>
                                                </div>
                                            </div>

                                            <h3 className="fw-bold text-c1 mb-2">
                                                No quiz available
                                            </h3>

                                            <p className="text-muted fs-6 mb-0">
                                                Moving forward to the next
                                                lesson to continue your
                                                journey!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div
                                                className="spinner-border text-c2 mb-3"
                                                role="status"
                                            >
                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>
                                            </div>

                                            <p className="text-muted fw-500">
                                                Syncing assessment data...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div> */}
                    </div>
                </div>

                {/* =========================================================
                    RIGHT SIDEBAR
                ========================================================== */}

                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="lesson_list">
                        <div className="lesson_list_header">
                            <p className="fw-bold text-white">
                                Course Syllabus
                            </p>

                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    {videos.length} Lessons
                                </span>

                                <span>
                                    <i className="bi bi-clock me-1"></i>
                                    Comprehensive
                                </span>
                            </div>
                        </div>

                        <div className="lesson_items_container">
                            {/* {videos.map((video, index) => (
                                <div
                                    key={video.id}
                                    className={`lesson_item ${activeVideo.id === video.id
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        selectVideo(video)
                                    }
                                >
                                    <span className="lesson_no">
                                        {activeVideo.id === video.id ? (
                                            <i className="bi bi-play-fill text-white"></i>
                                        ) : (
                                            index + 1
                                        )}
                                    </span>

                                    <div className="lesson_title">
                                        <div className="title_text">
                                            {video.title}
                                        </div>

                                        <div className="d-flex align-items-center gap-3">
                                            <span className="lesson_meta">
                                                <i className="bi bi-play-btn me-1"></i>
                                                Video
                                            </span>

                                            {quizMap[
                                                String(video.id)
                                            ] && (
                                                    <span className="quiz_included_badge">
                                                        <i className="bi bi-lightning-fill me-1"></i>
                                                        Quiz
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))} */}
                        </div>
                    </div>
                </div>
            </div>

            {/* =============================================================
                QUIZ MODAL
            ============================================================== */}

            {showQuizModal && (
                <div className="quiz_modal">
                    <div className="quiz_box">
                        {/* Header */}

                        <div className="quiz_header">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-c1">
                                    {reviewMode
                                        ? "Assessment Review"
                                        : "Topic Assessment"}
                                </h5>

                                <div
                                    className="quiz_close_btn"
                                    onClick={() =>
                                        setShowQuizModal(false)
                                    }
                                >
                                    <i className="bi bi-x-lg"></i>
                                </div>
                            </div>

                            <div className="quiz_progress_container">
                                <div
                                    className="quiz_progress_bar"
                                    style={{
                                        width: `${currentProgress}%`,
                                    }}
                                ></div>
                            </div>

                            <div className="d-flex justify-content-between mt-2 small text-muted">
                                <span>
                                    Question{" "}
                                    {reviewMode
                                        ? reviewQuestion + 1
                                        : currentQuestion + 1}{" "}
                                    of {quiz.length}
                                </span>

                                <span>
                                    {Math.round(currentProgress)}%
                                    Complete
                                </span>
                            </div>
                        </div>

                        {/* =================================================
                            QUIZ CONTENT
                        ================================================== */}

                        <div className="quiz_content">
                            {!reviewMode ? (
                                <>
                                    {question && (
                                        <p className="quiz_question_text">
                                            {question.question}
                                        </p>
                                    )}

                                    <div className="quiz_options_list">
                                        {[1, 2, 3].map((opt) => (
                                            <div
                                                key={opt}
                                                className={`quiz_option_tile ${question &&
                                                    answers[
                                                    question.id
                                                    ] === String(opt)
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    question &&
                                                    handleAnswer(
                                                        question.id,
                                                        String(opt),
                                                    )
                                                }
                                            >
                                                <div className="option_radio_circle"></div>

                                                <span className="option_text">
                                                    {question?.[
                                                        `option${opt}` as keyof Quiz
                                                    ] as string}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {reviewQ && (
                                        <p className="quiz_question_text">
                                            {reviewQ.question}
                                        </p>
                                    )}

                                    <div className="quiz_options_list">
                                        {[1, 2, 3].map((opt) => {
                                            if (!reviewQ) return null;

                                            const reviewAnswer =
                                                detailedAnswers.find(
                                                    (a) =>
                                                        a.quiz_id ===
                                                        reviewQ.id,
                                                );

                                            const optionText =
                                                reviewQ[
                                                `option${opt}` as keyof Quiz
                                                ] as string;

                                            const isCorrect =
                                                reviewAnswer?.correct_answer ===
                                                optionText;

                                            const isSelected =
                                                reviewAnswer?.selected ===
                                                optionText;

                                            return (
                                                <div
                                                    key={opt}
                                                    className={`quiz_option_tile ${isCorrect
                                                        ? "review_correct"
                                                        : ""
                                                        } ${isSelected &&
                                                            !isCorrect
                                                            ? "review_wrong"
                                                            : ""
                                                        }`}
                                                >
                                                    <div className="d-flex align-items-center w-100">
                                                        {isCorrect ? (
                                                            <i className="bi bi-check-circle-fill text-success fs-5 me-3"></i>
                                                        ) : isSelected ? (
                                                            <i className="bi bi-x-circle-fill text-danger fs-5 me-3"></i>
                                                        ) : (
                                                            <div className="option_radio_circle"></div>
                                                        )}

                                                        <span className="option_text">
                                                            {optionText}
                                                        </span>

                                                        {isCorrect && (
                                                            <span className="ms-auto badge bg-success-subtle text-success border border-success-subtle fw-bold">
                                                                Correct
                                                                Answer
                                                            </span>
                                                        )}

                                                        {isSelected &&
                                                            !isCorrect && (
                                                                <span className="ms-auto badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">
                                                                    Your
                                                                    Choice
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* =================================================
                            QUIZ NAVIGATION
                        ================================================== */}

                        <div className="quiz_nav">
                            {!reviewMode ? (
                                <>
                                    <div>
                                        {currentQuestion > 0 && (
                                            <button
                                                className="btn_prev"
                                                onClick={
                                                    prevQuestion
                                                }
                                            >
                                                <i className="bi bi-arrow-left me-2"></i>
                                                Previous
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        {currentQuestion <
                                            quiz.length - 1 ? (
                                            <button
                                                onClick={
                                                    nextQuestion
                                                }
                                                disabled={
                                                    !question ||
                                                    !answers[
                                                    question.id
                                                    ]
                                                }
                                                className={`btn_next ${!question ||
                                                    !answers[
                                                    question.id
                                                    ]
                                                    ? "disabled_next"
                                                    : ""
                                                    }`}
                                            >
                                                Next Question
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={
                                                    submitQuiz
                                                }
                                                disabled={
                                                    !question ||
                                                    !answers[
                                                    question.id
                                                    ]
                                                }
                                                className={`btn_next ${!question ||
                                                    !answers[
                                                    question.id
                                                    ]
                                                    ? "disabled_next"
                                                    : ""
                                                    }`}
                                            >
                                                Submit Assessment
                                                <i className="bi bi-check-all ms-2"></i>
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        {reviewQuestion > 0 && (
                                            <button
                                                className="btn_prev"
                                                onClick={() =>
                                                    setReviewQuestion(
                                                        (prev) =>
                                                            prev - 1,
                                                    )
                                                }
                                            >
                                                <i className="bi bi-arrow-left me-2"></i>
                                                Previous
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        {reviewQuestion <
                                            quiz.length - 1 ? (
                                            <button
                                                className="btn_next"
                                                onClick={() =>
                                                    setReviewQuestion(
                                                        (prev) =>
                                                            prev + 1,
                                                    )
                                                }
                                            >
                                                Next Review
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </button>
                                        ) : (
                                            <button
                                                className="btn_next"
                                                onClick={() =>
                                                    setShowQuizModal(
                                                        false,
                                                    )
                                                }
                                            >
                                                Finish Review
                                                <i className="bi bi-check-lg ms-2"></i>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}