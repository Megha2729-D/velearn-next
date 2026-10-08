"use client";

import React, {
    Component,
    createRef,
    ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_DYNAMIC_IMAGE_URL = "https://crm.velearn.in/uploads/";
const BASE_DYNAMIC_COURSE_VIDEO_URL = "https://crm.velearn.in/";

interface Course {
    id: number;
    title: string;
    slug?: string;
    image?: string;
    short_description?: string;
    description?: string;
}

interface Video {
    id: number;
    title: string;
    video: string;
    subtitle_en?: string;
    subtitle_ta?: string;
    subtitle_en_content?: string;
    subtitle_ta_content?: string;
    script?: string;
    short_description?: string;
}

interface Quiz {
    id: number;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    answer?: string;
}

interface DetailedAnswer {
    quiz_id: number;
    selected: string;
    correct_answer: string;
}

interface LearnCourseProps {
    slug: string;
    courseId?: number | null;
}

interface LearnCourseState {
    course: Course | null;
    courseId: number | null;
    videos: Video[];
    activeVideo: Video | null;

    quiz: Quiz[];
    quizMap: Record<number, boolean>;

    loading: boolean;
    resolvingCourse: boolean;
    error: string;

    showQuizModal: boolean;
    currentQuestion: number;
    answers: Record<number, string>;

    quizSubmitted: boolean;
    quizCompleted: boolean;
    score: number;

    reviewMode: boolean;
    reviewQuestion: number;
    detailedAnswers: DetailedAnswer[];

    subtitleMode: "en" | "ta" | "off";

    enBlob: string | null;
    taBlob: string | null;

    enPath: string | null;
    taPath: string | null;

    trackStatus: string;
    showSubtitleModal: boolean;

    activeTab: "script" | "quiz";

    videoStartTime: number;
    lastSavedTime: number;
}

class LearnCourse extends Component<
    LearnCourseProps,
    LearnCourseState
> {
    videoRef = createRef<HTMLVideoElement>();

    constructor(props: LearnCourseProps) {
        super(props);

        this.state = {
            course: null,
            courseId: null,
            videos: [],
            activeVideo: null,

            quiz: [],
            quizMap: {},

            loading: true,
            resolvingCourse: true,
            error: "",

            showQuizModal: false,
            currentQuestion: 0,
            answers: {},

            quizSubmitted: false,
            quizCompleted: false,
            score: 0,

            reviewMode: false,
            reviewQuestion: 0,
            detailedAnswers: [],

            subtitleMode: "en",

            enBlob: null,
            taBlob: null,

            enPath: null,
            taPath: null,

            trackStatus: "Loading...",
            showSubtitleModal: false,

            activeTab: "script",

            videoStartTime: 0,
            lastSavedTime: 0,
        };
    }

    componentDidMount() {
        this.initializeCourse();
    }

    componentDidUpdate(
        prevProps: LearnCourseProps,
        prevState: LearnCourseState,
    ) {
        if (
            !prevState.showQuizModal &&
            this.state.showQuizModal
        ) {
            this.disablePageScroll();
        }

        if (
            prevState.showQuizModal &&
            !this.state.showQuizModal
        ) {
            this.enablePageScroll();
        }

        if (
            prevState.activeVideo?.id !==
            this.state.activeVideo?.id
        ) {
            if (this.state.activeVideo) {
                this.loadVideoTracks(this.state.activeVideo);
            }

            setTimeout(() => {
                this.syncSubtitles();
            }, 500);
        }

        if (
            prevState.subtitleMode !==
            this.state.subtitleMode
        ) {
            this.syncSubtitles();
        }
    }

    componentWillUnmount() {
        this.enablePageScroll();

        if (this.state.enBlob) {
            URL.revokeObjectURL(this.state.enBlob);
        }

        if (this.state.taBlob) {
            URL.revokeObjectURL(this.state.taBlob);
        }
    }

    // =========================================================
    // COURSE INITIALIZATION
    // =========================================================

    initializeCourse = async () => {
        const { slug } = this.props;

        if (!slug) {
            this.setState({
                loading: false,
                resolvingCourse: false,
                error: "Course slug is missing.",
            });
            return;
        }

        try {
            this.setState({
                loading: true,
                resolvingCourse: true,
                error: "",
            });

            const user = this.getStoredUser();

            if (!user?.id) {
                this.setState({
                    loading: false,
                    resolvingCourse: false,
                    error: "Please login to access this course.",
                });
                return;
            }

            // Preserve the original React flow when a course ID is already known.
            let courseId: number | null =
                this.props.courseId && this.props.courseId > 0
                    ? Number(this.props.courseId)
                    : null;

            // Also support /learn/22 and /learn/22-java-course.
            if (!courseId) {
                const idMatch = String(slug).match(/^(\d+)(?:-|$)/);
                if (idMatch) {
                    courseId = Number(idMatch[1]);
                }
            }

            let course: Course | null = null;

            // Only resolve the slug if we don't already have the ID.
            if (!courseId) {
                course = await this.resolveCourseBySlug(
                    slug,
                    user.id,
                );

                if (!course) {
                    this.setState({
                        loading: false,
                        resolvingCourse: false,
                        error:
                            "This course is not available in your enrolled courses. Please open the course from My Courses.",
                    });
                    return;
                }

                courseId = Number(course.id);
            }

            if (!courseId || Number.isNaN(courseId)) {
                this.setState({
                    loading: false,
                    resolvingCourse: false,
                    error: "Invalid course ID.",
                });
                return;
            }

            this.setState({
                course,
                courseId,
                resolvingCourse: false,
            });

            await this.loadCourseVideos(courseId);
        } catch (error) {
            console.error(
                "Course initialization error:",
                error,
            );

            this.setState({
                loading: false,
                resolvingCourse: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to load course.",
            });
        }
    };

    getStoredUser = () => {
        try {
            const rawUser =
                localStorage.getItem("user");

            if (!rawUser) {
                return null;
            }

            return JSON.parse(rawUser);
        } catch (error) {
            console.error(
                "Invalid user data:",
                error,
            );

            return null;
        }
    };

    resolveCourseBySlug = async (
        slug: string,
        userId: number,
    ): Promise<Course | null> => {
        const normalizedSlug = String(slug || "")
            .trim()
            .toLowerCase();

        if (!normalizedSlug) {
            return null;
        }

        const urls = [
            `${BASE_API_URL}my-courses?user_id=${encodeURIComponent(userId)}`,
            `${BASE_API_URL}my-courses/${encodeURIComponent(userId)}`,
        ];

        for (const url of urls) {
            try {
                const response = await fetch(url, {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) continue;

                const result = await response.json();
                if (!result?.status) continue;

                const courses = this.extractCourses(result.data);

                const matchedCourse = courses.find((item: Course) => {
                    const itemSlug = String(item?.slug || "")
                        .trim()
                        .toLowerCase();

                    return (
                        itemSlug === normalizedSlug ||
                        String(item?.id || "") === normalizedSlug
                    );
                });

                if (matchedCourse) return matchedCourse;
            } catch (error) {
                console.error(
                    "Course resolution request failed:",
                    error,
                );
            }
        }

        try {
            const response = await fetch(
                `${BASE_API_URL}course-detail/${encodeURIComponent(slug)}`,
                {
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                },
            );

            if (response.ok) {
                const result = await response.json();
                const candidate =
                    result?.data?.course ||
                    result?.data ||
                    null;

                if (candidate?.id) {
                    const candidateSlug = String(candidate.slug || "")
                        .trim()
                        .toLowerCase();

                    if (
                        !candidateSlug ||
                        candidateSlug === normalizedSlug ||
                        String(candidate.id) === normalizedSlug
                    ) {
                        return candidate as Course;
                    }
                }
            }
        } catch (error) {
            console.error(
                "Slug course fallback failed:",
                error,
            );
        }

        return null;
    };

    extractCourses = (data: any): Course[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.all)) return data.all;
        if (Array.isArray(data.courses)) return data.courses;
        if (Array.isArray(data.enrolled)) return data.enrolled;
        if (Array.isArray(data.data)) return data.data;
        if (data.course && typeof data.course === "object") {
            return [data.course];
        }
        return [];
    };

    // =========================================================
    // LOAD COURSE VIDEOS
    // =========================================================

    loadCourseVideos = async (
        courseId: number,
    ) => {
        try {
            this.setState({
                loading: true,
            });

            const response = await fetch(
                `${BASE_API_URL}course-videos/${courseId}`,
                {
                    cache: "no-store",
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Unable to load course videos. HTTP ${response.status}`,
                );
            }

            const data =
                await response.json();

            if (
                data?.status &&
                Array.isArray(data.videos)
            ) {
                const videos: Video[] =
                    data.videos;

                /*
                 * IMPORTANT:
                 *
                 * Only show "course is not ready"
                 * when the API genuinely returns ZERO
                 * videos.
                 */

                if (videos.length === 0) {
                    this.setState({
                        course:
                            data.course ||
                            this.state.course,
                        videos: [],
                        activeVideo: null,
                        loading: false,
                    });

                    return;
                }

                const firstVideo = videos[0];

                this.setState(
                    {
                        course:
                            data.course ||
                            this.state.course,
                        videos,
                        activeVideo: firstVideo,
                        loading: false,
                        error: "",
                    },
                    () => {
                        if (firstVideo) {
                            this.loadVideoTracks(
                                firstVideo,
                            );

                            this.loadQuiz(
                                firstVideo.id,
                            );
                        }
                    },
                );

                this.checkQuizForVideos(
                    videos,
                );

                return;
            }

            this.setState({
                loading: false,
                error:
                    data?.message ||
                    "Unable to load course videos.",
            });
        } catch (error) {
            console.error(
                "Fetch course videos error:",
                error,
            );

            this.setState({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to load course.",
            });
        }
    };

    // =========================================================
    // SUBTITLES
    // =========================================================

    loadVideoTracks = async (
        video: Video | null,
    ) => {
        if (!video) {
            return;
        }

        if (this.state.enBlob) {
            URL.revokeObjectURL(
                this.state.enBlob,
            );
        }

        if (this.state.taBlob) {
            URL.revokeObjectURL(
                this.state.taBlob,
            );
        }

        this.setState({
            enBlob: null,
            taBlob: null,
            enPath: null,
            taPath: null,
            trackStatus: "Preparing...",
        });

        let localEnFound = false;
        let localTaFound = false;

        // -----------------------------
        // ENGLISH
        // -----------------------------

        if (video.subtitle_en_content) {
            const blob = new Blob(
                [video.subtitle_en_content],
                {
                    type: "text/vtt",
                },
            );

            this.setState({
                enBlob:
                    URL.createObjectURL(blob),
                trackStatus:
                    "English Ready",
            });

            localEnFound = true;
        } else if (video.subtitle_en) {
            const fullUrl = `${BASE_DYNAMIC_COURSE_VIDEO_URL}${video.subtitle_en}`;

            try {
                const response =
                    await fetch(fullUrl);

                if (response.ok) {
                    const blob =
                        await response.blob();

                    this.setState({
                        enBlob:
                            URL.createObjectURL(
                                blob,
                            ),
                        trackStatus:
                            "English Ready",
                    });

                    localEnFound = true;
                } else {
                    this.setState({
                        enPath: fullUrl,
                        trackStatus:
                            "English Ready (Direct)",
                    });

                    localEnFound = true;
                }
            } catch {
                this.setState({
                    enPath: fullUrl,
                    trackStatus:
                        "English Ready (Direct)",
                });

                localEnFound = true;
            }
        }

        // -----------------------------
        // TAMIL
        // -----------------------------

        if (video.subtitle_ta_content) {
            const blob = new Blob(
                [video.subtitle_ta_content],
                {
                    type: "text/vtt",
                },
            );

            this.setState({
                taBlob:
                    URL.createObjectURL(blob),
                trackStatus: localEnFound
                    ? "Multi-Lang Ready"
                    : "Tamil Ready",
            });

            localTaFound = true;
        } else if (video.subtitle_ta) {
            const fullUrl = `${BASE_DYNAMIC_COURSE_VIDEO_URL}${video.subtitle_ta}`;

            try {
                const response =
                    await fetch(fullUrl);

                if (response.ok) {
                    const blob =
                        await response.blob();

                    this.setState({
                        taBlob:
                            URL.createObjectURL(
                                blob,
                            ),
                        trackStatus: localEnFound
                            ? "Multi-Lang Ready"
                            : "Tamil Ready",
                    });

                    localTaFound = true;
                } else {
                    this.setState({
                        taPath: fullUrl,
                        trackStatus: localEnFound
                            ? "Multi-Lang Ready"
                            : "Tamil Ready",
                    });

                    localTaFound = true;
                }
            } catch {
                this.setState({
                    taPath: fullUrl,
                    trackStatus: localEnFound
                        ? "Multi-Lang Ready"
                        : "Tamil Ready",
                });

                localTaFound = true;
            }
        }

        if (!localEnFound && !localTaFound) {
            this.setState({
                trackStatus:
                    "No Subtitles",
            });
        }
    };

    syncSubtitles = () => {
        const video =
            this.videoRef.current;

        if (!video) {
            return;
        }

        const mode =
            this.state.subtitleMode;

        const tracks =
            video.textTracks;

        for (
            let i = 0;
            i < tracks.length;
            i++
        ) {
            const track = tracks[i];

            const label =
                track.label
                    ?.toLowerCase() || "";

            const isMatch =
                track.language === mode ||
                (mode === "en" &&
                    label.includes(
                        "english",
                    )) ||
                (mode === "ta" &&
                    label.includes(
                        "tamil",
                    ));

            if (mode === "off") {
                track.mode =
                    "disabled";
            } else {
                track.mode = isMatch
                    ? "showing"
                    : "disabled";
            }
        }
    };

    // =========================================================
    // QUIZ
    // =========================================================

    loadQuiz = async (
        videoId: number,
    ) => {
        try {
            const user =
                this.getStoredUser();

            const userId = user?.id;

            const response =
                await fetch(
                    `${BASE_API_URL}video-quiz/${videoId}?user_id=${userId}`,
                    {
                        cache: "no-store",
                    },
                );

            const data =
                await response.json();

            if (!data?.status) {
                this.setState({
                    quiz: [],
                    quizCompleted: false,
                    quizSubmitted: false,
                });

                return;
            }

            if (data.has_submitted) {
                const previous =
                    data.previous_result;

                const previousAnswers: Record<
                    number,
                    string
                > = {};

                if (
                    previous?.answers &&
                    Array.isArray(
                        previous.answers,
                    )
                ) {
                    previous.answers.forEach(
                        (answer: any) => {
                            const quizQuestion =
                                data.data?.find(
                                    (q: Quiz) =>
                                        q.id ===
                                        answer.quiz_id,
                                );

                            if (
                                quizQuestion
                            ) {
                                if (
                                    quizQuestion.option1 ===
                                    answer.selected
                                ) {
                                    previousAnswers[
                                        quizQuestion.id
                                    ] = "1";
                                }

                                if (
                                    quizQuestion.option2 ===
                                    answer.selected
                                ) {
                                    previousAnswers[
                                        quizQuestion.id
                                    ] = "2";
                                }

                                if (
                                    quizQuestion.option3 ===
                                    answer.selected
                                ) {
                                    previousAnswers[
                                        quizQuestion.id
                                    ] = "3";
                                }
                            }
                        },
                    );
                }

                this.setState({
                    quiz:
                        data.data || [],
                    answers:
                        previousAnswers,
                    quizCompleted: true,
                    quizSubmitted: true,
                    score: Math.round(
                        Number(
                            previous?.score ||
                            0,
                        ),
                    ),
                    detailedAnswers:
                        previous?.answers ||
                        [],
                    currentQuestion: 0,
                });
            } else {
                this.setState({
                    quiz:
                        data.data || [],
                    answers: {},
                    quizCompleted: false,
                    quizSubmitted: false,
                    currentQuestion: 0,
                    detailedAnswers: [],
                });
            }

            if (
                typeof data.last_position ===
                "number" &&
                data.last_position > 0
            ) {
                this.setState({
                    videoStartTime:
                        data.last_position,
                    lastSavedTime:
                        data.last_position,
                });

                if (
                    this.videoRef.current
                ) {
                    this.videoRef.current.currentTime =
                        data.last_position;
                }
            } else {
                this.setState({
                    videoStartTime: 0,
                    lastSavedTime: 0,
                });
            }
        } catch (error) {
            console.error(
                "Load quiz error:",
                error,
            );
        }
    };

    checkQuizForVideos = (
        videos: Video[],
    ) => {
        videos.forEach(async (video) => {
            try {
                const response =
                    await fetch(
                        `${BASE_API_URL}video-quiz/${video.id}`,
                        {
                            cache: "no-store",
                        },
                    );

                const data =
                    await response.json();

                this.setState(
                    (prev) => ({
                        quizMap: {
                            ...prev.quizMap,
                            [video.id]:
                                data?.status &&
                                Array.isArray(
                                    data.data,
                                ) &&
                                data.data.length >
                                0,
                        },
                    }),
                );
            } catch (error) {
                console.error(
                    "Quiz check error:",
                    error,
                );
            }
        });
    };

    selectVideo = (
        video: Video,
    ) => {
        this.setState(
            {
                activeVideo: video,
                activeTab: "script",
                videoStartTime: 0,
                lastSavedTime: 0,
                quiz: [],
                answers: {},
                quizCompleted: false,
                quizSubmitted: false,
                score: 0,
                detailedAnswers: [],
            },
            () => {
                this.loadQuiz(video.id);
            },
        );
    };

    handleAnswer = (
        questionId: number,
        option: string,
    ) => {
        this.setState((prev) => ({
            answers: {
                ...prev.answers,
                [questionId]: option,
            },
        }));
    };

    nextQuestion = () => {
        const {
            quiz,
            currentQuestion,
            answers,
        } = this.state;

        const question =
            quiz[currentQuestion];

        if (!question) {
            return;
        }

        if (!answers[question.id]) {
            alert(
                "Please select an answer before proceeding.",
            );
            return;
        }

        this.setState({
            currentQuestion:
                currentQuestion + 1,
        });
    };

    prevQuestion = () => {
        this.setState((prev) => ({
            currentQuestion:
                Math.max(
                    0,
                    prev.currentQuestion -
                    1,
                ),
        }));
    };

    submitQuiz = async () => {
        const {
            quiz,
            answers,
            activeVideo,
            currentQuestion,
        } = this.state;

        if (!activeVideo) {
            return;
        }

        const currentQuestionData =
            quiz[currentQuestion];

        if (!currentQuestionData) {
            return;
        }

        if (
            !answers[
            currentQuestionData.id
            ]
        ) {
            alert(
                "Please select an answer before submitting.",
            );
            return;
        }

        const user =
            this.getStoredUser();

        if (!user?.id) {
            alert(
                "Please login again.",
            );
            return;
        }

        const formattedAnswers =
            quiz.map((question) => ({
                quiz_id: question.id,
                selected:
                    answers[
                    question.id
                    ] || null,
            }));

        try {
            const response =
                await fetch(
                    `${BASE_API_URL}submit-quiz`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            {
                                user_id:
                                    user.id,
                                course_video_id:
                                    activeVideo.id,
                                answers:
                                    formattedAnswers,
                            },
                        ),
                    },
                );

            const data =
                await response.json();

            if (data?.status) {
                const result =
                    data.data;

                this.setState({
                    quizSubmitted: true,
                    quizCompleted: true,
                    score: Math.round(
                        Number(
                            result?.score ||
                            0,
                        ),
                    ),
                    showQuizModal: false,
                    reviewMode: true,
                    reviewQuestion: 0,
                    detailedAnswers:
                        result?.answers ||
                        [],
                });
            } else {
                alert(
                    data?.message ||
                    "Unable to submit assessment.",
                );
            }
        } catch (error) {
            console.error(
                "Submit quiz error:",
                error,
            );

            alert(
                "Unable to submit assessment. Please try again.",
            );
        }
    };

    // =========================================================
    // VIDEO PROGRESS
    // =========================================================

    handleLoadedData = (
        event: React.SyntheticEvent<HTMLVideoElement>,
    ) => {
        this.syncSubtitles();

        const video =
            event.currentTarget;

        if (
            this.state.videoStartTime >
            0
        ) {
            video.currentTime =
                this.state.videoStartTime;

            this.setState({
                videoStartTime: 0,
            });
        }
    };

    handleVideoEvents = () => {
        this.syncSubtitles();
    };

    handleTimeUpdate = (
        event: React.SyntheticEvent<HTMLVideoElement>,
    ) => {
        const video =
            event.currentTarget;

        const currentTime =
            video.currentTime;

        const {
            activeVideo,
            lastSavedTime,
        } = this.state;

        if (!activeVideo) {
            return;
        }

        const isEnded =
            video.ended ||
            (video.duration > 0 &&
                currentTime /
                video.duration >=
                0.8);

        if (
            currentTime -
            lastSavedTime >=
            5 ||
            isEnded
        ) {
            this.setState({
                lastSavedTime:
                    currentTime,
            });

            const user =
                this.getStoredUser();

            if (user?.id) {
                fetch(
                    `${BASE_API_URL}update-video-progress`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            {
                                course_video_id:
                                    activeVideo.id,
                                last_position:
                                    currentTime,
                                user_id:
                                    user.id,
                                is_completed:
                                    isEnded,
                            },
                        ),
                    },
                ).catch((error) =>
                    console.error(
                        "Progress save error:",
                        error,
                    ),
                );
            }
        }
    };

    // =========================================================
    // SUBTITLE MODAL
    // =========================================================

    openSubtitleModal = () => {
        this.setState({
            showSubtitleModal: true,
        });
    };

    closeSubtitleModal = () => {
        this.setState({
            showSubtitleModal: false,
        });
    };

    changeSubtitleMode = (
        mode: "en" | "ta" | "off",
    ) => {
        this.setState(
            {
                subtitleMode: mode,
                showSubtitleModal: false,
            },
            () => {
                this.syncSubtitles();
            },
        );
    };

    // =========================================================
    // QUIZ MODAL
    // =========================================================

    closeQuizModal = () => {
        this.setState({
            showQuizModal: false,
        });
    };

    disablePageScroll = () => {
        document.body.classList.add(
            "modal-open-custom",
        );

        document.documentElement.classList.add(
            "modal-open-custom",
        );
    };

    enablePageScroll = () => {
        document.body.classList.remove(
            "modal-open-custom",
        );

        document.documentElement.classList.remove(
            "modal-open-custom",
        );
    };

    // =========================================================
    // RENDER
    // =========================================================

    render(): ReactNode {
        const {
            videos,
            activeVideo,
            quiz,
            loading,
            resolvingCourse,
            error,
            showQuizModal,
            currentQuestion,
            answers,
            score,
            reviewMode,
            reviewQuestion,
            course,
        } = this.state;

        // -----------------------------------------------------
        // INITIAL COURSE RESOLUTION
        // -----------------------------------------------------

        if (
            resolvingCourse ||
            loading
        ) {
            return (
                <div className="loading-container p-5">
                    <div className="loading-spinner">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    <p className="loading-text">
                        Preparing your learning
                        experience...
                    </p>
                </div>
            );
        }

        // -----------------------------------------------------
        // ERROR
        // -----------------------------------------------------

        if (error) {
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
                                        <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
                                    </div>
                                </div>

                                <h2 className="fw-bold text-c1 mb-3">
                                    Unable to Open Course
                                </h2>

                                <p className="text-muted fs-5 mb-4">
                                    {error}
                                </p>

                                <div className="d-flex gap-3 justify-content-center">
                                    <Link
                                        href="/recorded-course"
                                        className="btn_theme_outline px-4 py-2"
                                    >
                                        Browse Courses
                                    </Link>

                                    <Link
                                        href="/my-courses"
                                        className="btn_theme_primary px-5 py-2"
                                    >
                                        My Courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // -----------------------------------------------------
        // NO VIDEOS
        //
        // This is now the ONLY situation where the original
        // "learning journey is almost ready" message appears.
        // -----------------------------------------------------

        if (!activeVideo) {
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
                                    The instructor is currently
                                    putting the finishing touches
                                    on this course. High-quality
                                    knowledge is worth the wait!
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

        /*
         * IMPORTANT TYPESCRIPT FIX
         *
         * activeVideo has been checked above:
         *
         * if (!activeVideo) return ...
         *
         * Therefore TypeScript now knows that activeVideo
         * cannot be null below this point.
         */

        const currentVideo =
            activeVideo;

        const question =
            quiz.length > 0
                ? quiz[currentQuestion]
                : null;

        const reviewQ =
            quiz.length > 0
                ? quiz[reviewQuestion]
                : null;

        let scoreColor =
            "#f59e0b";

        if (score < 40) {
            scoreColor =
                "#ff0509";
        } else if (score >= 70) {
            scoreColor =
                "#0dba4b";
        }

        const thumbnail =
            course?.image
                ? `${BASE_DYNAMIC_IMAGE_URL}courses/${course.image}`
                : "";

        return (
            <div className="learn_page section_container py-5">
                <div className="row">

                    {/* =====================================================
                        LEFT SIDE
                    ===================================================== */}

                    <div className="col-lg-8">

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
                                                {
                                                    course.short_description
                                                }
                                            </p>
                                        </div>
                                    )}

                                </div>

                                {/* SUBTITLE CONTROLLER */}

                                <div className="video_control_hub">

                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="hub_label">
                                            Subtitles (Captions)
                                        </div>

                                        <div className="track_discovery_status">
                                            {
                                                this.state
                                                    .trackStatus
                                            }
                                        </div>
                                    </div>

                                    <div className="hub_controls">
                                        <button
                                            onClick={
                                                this
                                                    .openSubtitleModal
                                            }
                                            className={`hub_btn ${this.state
                                                .subtitleMode !==
                                                "off"
                                                ? "active"
                                                : ""
                                                }`}
                                            title="Choose your preferred language"
                                        >
                                            <i className="bi bi-badge-cc-fill"></i>

                                            <span>
                                                {this.state
                                                    .subtitleMode ===
                                                    "off"
                                                    ? "Captions Off"
                                                    : this.state
                                                        .subtitleMode ===
                                                        "en"
                                                        ? "English (Active)"
                                                        : "Tamil (Active)"}
                                            </span>

                                            <i className="bi bi-chevron-down ms-2 small"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            SUBTITLE MODAL
                        ================================================= */}

                        {this.state
                            .showSubtitleModal && (
                                <div
                                    className="subtitle_modal_overlay"
                                    onClick={
                                        this
                                            .closeSubtitleModal
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
                                                Select Subtitle
                                                Language
                                            </h5>

                                            <button
                                                className="close_modal"
                                                onClick={
                                                    this
                                                        .closeSubtitleModal
                                                }
                                            >
                                                &times;
                                            </button>
                                        </div>

                                        <div className="modal_body_options">

                                            {/* ENGLISH */}

                                            <button
                                                className={`option_item ${this.state
                                                    .subtitleMode ===
                                                    "en"
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    this.changeSubtitleMode(
                                                        "en",
                                                    )
                                                }
                                                disabled={
                                                    !this
                                                        .state
                                                        .enBlob &&
                                                    !this
                                                        .state
                                                        .enPath
                                                }
                                            >
                                                <div className="option_flex">
                                                    <i className="bi bi-translate me-3"></i>

                                                    <div className="text-start">
                                                        <div className="fw-bold">
                                                            English
                                                        </div>

                                                        <div className="small text-muted">
                                                            Standard
                                                            English
                                                            subtitles
                                                        </div>
                                                    </div>
                                                </div>

                                                {this.state
                                                    .subtitleMode ===
                                                    "en" && (
                                                        <i className="bi bi-check-circle-fill text-primary"></i>
                                                    )}
                                            </button>

                                            {/* TAMIL */}

                                            <button
                                                className={`option_item ${this.state
                                                    .subtitleMode ===
                                                    "ta"
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    this.changeSubtitleMode(
                                                        "ta",
                                                    )
                                                }
                                                disabled={
                                                    !this
                                                        .state
                                                        .taBlob &&
                                                    !this
                                                        .state
                                                        .taPath
                                                }
                                            >
                                                <div className="option_flex">
                                                    <i className="bi bi-alphabet-uppercase me-3"></i>

                                                    <div className="text-start">
                                                        <div className="fw-bold">
                                                            Tamil
                                                            (தமிழ்)
                                                        </div>

                                                        <div className="small text-muted">
                                                            Localized
                                                            Tamil
                                                            subtitles
                                                        </div>
                                                    </div>
                                                </div>

                                                {this.state
                                                    .subtitleMode ===
                                                    "ta" && (
                                                        <i className="bi bi-check-circle-fill text-primary"></i>
                                                    )}
                                            </button>

                                            {/* OFF */}

                                            <button
                                                className={`option_item off_option ${this.state
                                                    .subtitleMode ===
                                                    "off"
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    this.changeSubtitleMode(
                                                        "off",
                                                    )
                                                }
                                            >
                                                <div className="option_flex">
                                                    <i className="bi bi-x-circle me-3"></i>

                                                    <div className="text-start">
                                                        <div className="fw-bold">
                                                            Captions
                                                            Off
                                                        </div>

                                                        <div className="small text-muted">
                                                            Disable
                                                            all
                                                            subtitles
                                                        </div>
                                                    </div>
                                                </div>

                                                {this.state
                                                    .subtitleMode ===
                                                    "off" && (
                                                        <i className="bi bi-check-circle-fill text-secondary"></i>
                                                    )}
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* =================================================
                            VIDEO
                        ================================================= */}

                        <div className="video_box mainstream_video">
                            <div className="video_preview">

                                <video
                                    key={
                                        currentVideo.id
                                    }
                                    ref={
                                        this
                                            .videoRef
                                    }
                                    controls
                                    poster={
                                        thumbnail
                                    }
                                    width="100%"
                                    src={`${BASE_DYNAMIC_COURSE_VIDEO_URL}${currentVideo.video}`}
                                    className="main_video_player"
                                    onPlay={
                                        this
                                            .handleVideoEvents
                                    }
                                    onPlaying={
                                        this
                                            .handleVideoEvents
                                    }
                                    onLoadedData={
                                        this
                                            .handleLoadedData
                                    }
                                    onTimeUpdate={
                                        this
                                            .handleTimeUpdate
                                    }
                                    controlsList="nodownload"
                                    disablePictureInPicture
                                    onContextMenu={(
                                        e,
                                    ) =>
                                        e.preventDefault()
                                    }
                                >

                                    {(this.state
                                        .enBlob ||
                                        this.state
                                            .enPath) && (
                                            <track
                                                key={`en-${currentVideo.id}`}
                                                label="English"
                                                kind="subtitles"
                                                srcLang="en"
                                                src={
                                                    this
                                                        .state
                                                        .enBlob ||
                                                    this
                                                        .state
                                                        .enPath ||
                                                    ""
                                                }
                                                default={
                                                    this
                                                        .state
                                                        .subtitleMode ===
                                                    "en"
                                                }
                                            />
                                        )}

                                    {(this.state
                                        .taBlob ||
                                        this.state
                                            .taPath) && (
                                            <track
                                                key={`ta-${currentVideo.id}`}
                                                label="Tamil"
                                                kind="subtitles"
                                                srcLang="ta"
                                                src={
                                                    this
                                                        .state
                                                        .taBlob ||
                                                    this
                                                        .state
                                                        .taPath ||
                                                    ""
                                                }
                                                default={
                                                    this
                                                        .state
                                                        .subtitleMode ===
                                                    "ta"
                                                }
                                            />
                                        )}

                                </video>

                            </div>
                        </div>

                        {/* =================================================
                            TABS
                        ================================================= */}

                        <div className="learn_tabs_container mt-4">

                            <div className="learn_tabs_header d-flex gap-4 border-bottom mb-4">

                                <button
                                    className={`learn_tab_btn ${this.state
                                        .activeTab ===
                                        "script"
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        this.setState({
                                            activeTab:
                                                "script",
                                        })
                                    }
                                >
                                    <i className="bi bi-file-text me-2"></i>
                                    Lesson Script
                                </button>

                                <button
                                    className={`learn_tab_btn ${this.state
                                        .activeTab ===
                                        "quiz"
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        this.setState({
                                            activeTab:
                                                "quiz",
                                        })
                                    }
                                >
                                    <i className="bi bi-award me-2"></i>
                                    Topic Assessment

                                    {this.state
                                        .quizMap[
                                        currentVideo
                                            .id
                                    ] && (
                                            <span className="tab_indicator_dot"></span>
                                        )}
                                </button>

                            </div>

                            <div className="learn_tab_pane">

                                {/* =================================================
                                    SCRIPT
                                ================================================= */}

                                {this.state
                                    .activeTab ===
                                    "script" ? (
                                    <div className="active_video_details p-4 bg-white rounded-4 shadow-sm border border-light">

                                        <h3 className="fw-bold mb-2">
                                            {
                                                currentVideo.title
                                            }
                                        </h3>

                                        <p className="text-muted mb-4 lh-lg">
                                            {currentVideo.short_description ||
                                                `Enhance your skills with this detailed lesson on ${currentVideo.title}.`}
                                        </p>

                                        {currentVideo.script ? (
                                            <div className="video_transcript_section pt-4 border-top">

                                                <div className="d-flex align-items-center mb-3">
                                                    <i className="bi bi-chat-left-text text-c2 me-2 fs-5"></i>

                                                    <h5 className="fw-bold mb-0">
                                                        Transcript
                                                        &
                                                        Study
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
                                                            currentVideo.script
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                <i className="bi bi-info-circle mb-2 d-block fs-3 opacity-25"></i>

                                                This lesson
                                                doesn't
                                                have a
                                                transcript
                                                yet.
                                            </div>
                                        )}

                                    </div>
                                ) : (

                                    /* =================================================
                                       QUIZ
                                    ================================================= */

                                    <div className="quiz_section p-4 bg-white rounded-4 shadow-sm border border-light">

                                        {this.state
                                            .quizMap[
                                            currentVideo
                                                .id
                                        ] === true ? (
                                            <>
                                                {!this
                                                    .state
                                                    .quizCompleted ? (

                                                    <div className="quiz_intro_box">

                                                        <div className="quiz_decoration">
                                                            <i className="bi bi-award-fill"></i>
                                                        </div>

                                                        <h3>
                                                            Knowledge
                                                            Check
                                                            Ready
                                                        </h3>

                                                        <p className="quiz_intro_box_desc">
                                                            Validate
                                                            your
                                                            learning
                                                            and
                                                            earn
                                                            your
                                                            progress
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
                                                            onClick={() =>
                                                                this.setState(
                                                                    {
                                                                        showQuizModal:
                                                                            true,
                                                                        reviewMode:
                                                                            false,
                                                                        currentQuestion:
                                                                            0,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Start
                                                            Topic
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
                                                            validated
                                                            your
                                                            knowledge
                                                            for
                                                            this
                                                            lesson.
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
                                                                        color:
                                                                            scoreColor,
                                                                    }}
                                                                >
                                                                    {
                                                                        score
                                                                    }
                                                                    %
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
                                                                                    this
                                                                                        .state
                                                                                        .answers[
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
                                                                onClick={() =>
                                                                    this.setState(
                                                                        {
                                                                            showQuizModal:
                                                                                true,
                                                                            reviewMode:
                                                                                true,
                                                                            reviewQuestion:
                                                                                0,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-eye-fill me-2"></i>

                                                                Review
                                                                Your
                                                                Answers
                                                            </button>

                                                        </div>

                                                    </div>
                                                )}
                                            </>
                                        ) : this.state
                                            .quizMap[
                                            currentVideo
                                                .id
                                        ] ===
                                            false ? (

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
                                                    No quiz
                                                    available
                                                </h3>

                                                <p className="text-muted fs-6 mb-0">
                                                    Moving
                                                    forward
                                                    to the
                                                    next
                                                    lesson
                                                    to
                                                    continue
                                                    your
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
                                                    Syncing
                                                    assessment
                                                    data...
                                                </p>

                                            </div>
                                        )}

                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        RIGHT SIDE - SYLLABUS
                    ===================================================== */}

                    <div className="col-lg-4 mt-4 mt-lg-0">

                        <div className="lesson_list">

                            <div className="lesson_list_header">

                                <p className="fw-bold text-white">
                                    Course Syllabus
                                </p>

                                <div className="d-flex justify-content-between align-items-center">

                                    <span>
                                        {
                                            videos.length
                                        }{" "}
                                        Lessons
                                    </span>

                                    <span>
                                        <i className="bi bi-clock me-1"></i>
                                        Comprehensive
                                    </span>

                                </div>
                            </div>

                            <div className="lesson_items_container">

                                {videos.map(
                                    (
                                        video,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                video.id
                                            }
                                            className={`lesson_item ${currentVideo.id ===
                                                video.id
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                this.selectVideo(
                                                    video,
                                                )
                                            }
                                        >

                                            <span className="lesson_no">

                                                {currentVideo.id ===
                                                    video.id ? (
                                                    <i className="bi bi-play-fill text-white"></i>
                                                ) : (
                                                    index +
                                                    1
                                                )}

                                            </span>

                                            <div className="lesson_title">

                                                <div className="title_text">
                                                    {
                                                        video.title
                                                    }
                                                </div>

                                                <div className="d-flex align-items-center gap-3">

                                                    <span className="lesson_meta">
                                                        <i className="bi bi-play-btn me-1"></i>
                                                        Video
                                                    </span>

                                                    {this
                                                        .state
                                                        .quizMap[
                                                        video
                                                            .id
                                                    ] && (
                                                            <span className="quiz_included_badge">
                                                                <i className="bi bi-lightning-fill me-1"></i>
                                                                Quiz
                                                            </span>
                                                        )}

                                                </div>

                                            </div>
                                        </div>
                                    ),
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    QUIZ MODAL
                ========================================================= */}

                {showQuizModal && (
                    <div className="quiz_modal">

                        <div className="quiz_box">

                            <div className="quiz_header">

                                <div className="d-flex justify-content-between align-items-center">

                                    <h5 className="mb-0 fw-bold text-c1">
                                        {reviewMode
                                            ? "Assessment Review"
                                            : "Topic Assessment"}
                                    </h5>

                                    <div
                                        className="quiz_close_btn"
                                        onClick={
                                            this
                                                .closeQuizModal
                                        }
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </div>

                                </div>

                                <div className="quiz_progress_container">

                                    <div
                                        className="quiz_progress_bar"
                                        style={{
                                            width: `${((reviewMode
                                                ? reviewQuestion +
                                                1
                                                : currentQuestion +
                                                (question &&
                                                    answers[
                                                    question
                                                        .id
                                                    ]
                                                    ? 1
                                                    : 0)) /
                                                quiz.length) *
                                                100
                                                }%`,
                                        }}
                                    ></div>

                                </div>

                                <div className="d-flex justify-content-between mt-2 small text-muted">

                                    <span>
                                        Question{" "}
                                        {reviewMode
                                            ? reviewQuestion +
                                            1
                                            : currentQuestion +
                                            1}{" "}
                                        of{" "}
                                        {
                                            quiz.length
                                        }
                                    </span>

                                    <span>
                                        {Math.round(
                                            ((reviewMode
                                                ? reviewQuestion +
                                                1
                                                : currentQuestion +
                                                (question &&
                                                    answers[
                                                    question
                                                        .id
                                                    ]
                                                    ? 1
                                                    : 0)) /
                                                quiz.length) *
                                            100,
                                        )}
                                        % Complete
                                    </span>

                                </div>
                            </div>

                            <div className="quiz_content">

                                {!reviewMode ? (
                                    <>
                                        {question && (
                                            <>
                                                <p className="quiz_question_text">
                                                    {
                                                        question.question
                                                    }
                                                </p>

                                                <div className="quiz_options_list">

                                                    {[1, 2, 3].map(
                                                        (
                                                            option,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    option
                                                                }
                                                                className={`quiz_option_tile ${answers[
                                                                    question
                                                                        .id
                                                                ] ===
                                                                    String(
                                                                        option,
                                                                    )
                                                                    ? "selected"
                                                                    : ""
                                                                    }`}
                                                                onClick={() =>
                                                                    this.handleAnswer(
                                                                        question.id,
                                                                        String(
                                                                            option,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <div className="option_radio_circle"></div>

                                                                <span className="option_text">
                                                                    {
                                                                        question[
                                                                        `option${option}` as
                                                                        | "option1"
                                                                        | "option2"
                                                                        | "option3"
                                                                        ]
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}

                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {reviewQ && (
                                            <>
                                                <p className="quiz_question_text">
                                                    {
                                                        reviewQ.question
                                                    }
                                                </p>

                                                <div className="quiz_options_list">

                                                    {[1, 2, 3].map(
                                                        (
                                                            option,
                                                        ) => {
                                                            const reviewAnswer =
                                                                this.state.detailedAnswers.find(
                                                                    (
                                                                        answer,
                                                                    ) =>
                                                                        answer.quiz_id ===
                                                                        reviewQ.id,
                                                                );

                                                            const optionText =
                                                                reviewQ[
                                                                `option${option}` as
                                                                | "option1"
                                                                | "option2"
                                                                | "option3"
                                                                ];

                                                            const isCorrect =
                                                                reviewAnswer?.correct_answer ===
                                                                optionText;

                                                            const isSelected =
                                                                reviewAnswer?.selected ===
                                                                optionText;

                                                            return (
                                                                <div
                                                                    key={
                                                                        option
                                                                    }
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
                                                                            {
                                                                                optionText
                                                                            }
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
                                                        },
                                                    )}

                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                            </div>

                            <div className="quiz_nav">

                                {!reviewMode ? (
                                    <>
                                        <div>
                                            {currentQuestion >
                                                0 && (
                                                    <button
                                                        className="btn_prev"
                                                        onClick={
                                                            this
                                                                .prevQuestion
                                                        }
                                                    >
                                                        <i className="bi bi-arrow-left me-2"></i>
                                                        Previous
                                                    </button>
                                                )}
                                        </div>

                                        <div>
                                            {currentQuestion <
                                                quiz.length -
                                                1 ? (
                                                <button
                                                    onClick={
                                                        this
                                                            .nextQuestion
                                                    }
                                                    disabled={
                                                        !question ||
                                                        !answers[
                                                        question
                                                            .id
                                                        ]
                                                    }
                                                    className={`btn_next ${!question ||
                                                        !answers[
                                                        question
                                                            .id
                                                        ]
                                                        ? "disabled_next"
                                                        : ""
                                                        }`}
                                                >
                                                    Next
                                                    Question
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={
                                                        this
                                                            .submitQuiz
                                                    }
                                                    disabled={
                                                        !question ||
                                                        !answers[
                                                        question
                                                            .id
                                                        ]
                                                    }
                                                    className={`btn_next ${!question ||
                                                        !answers[
                                                        question
                                                            .id
                                                        ]
                                                        ? "disabled_next"
                                                        : ""
                                                        }`}
                                                >
                                                    Submit
                                                    Assessment
                                                    <i className="bi bi-check-all ms-2"></i>
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            {reviewQuestion >
                                                0 && (
                                                    <button
                                                        className="btn_prev"
                                                        onClick={() =>
                                                            this.setState(
                                                                {
                                                                    reviewQuestion:
                                                                        reviewQuestion -
                                                                        1,
                                                                },
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
                                                quiz.length -
                                                1 ? (
                                                <button
                                                    className="btn_next"
                                                    onClick={() =>
                                                        this.setState(
                                                            {
                                                                reviewQuestion:
                                                                    reviewQuestion +
                                                                    1,
                                                            },
                                                        )
                                                    }
                                                >
                                                    Next
                                                    Review
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn_next"
                                                    onClick={
                                                        this
                                                            .closeQuizModal
                                                    }
                                                >
                                                    Finish
                                                    Review
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
}

// =============================================================
// NEXT.JS ROUTE WRAPPER
// =============================================================

export default function LearnPage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const slug = pathname
        ?.split("/")
        .filter(Boolean)
        .pop();

    const queryCourseId = Number(
        searchParams?.get("courseId") || "",
    );

    const courseId =
        Number.isFinite(queryCourseId) &&
            queryCourseId > 0
            ? queryCourseId
            : null;

    if (!slug && !courseId) {
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
                                    <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
                                </div>
                            </div>

                            <h2 className="fw-bold text-c1 mb-3">
                                Unable to Open Course
                            </h2>

                            <p className="text-muted fs-5 mb-4">
                                Course slug is missing.
                            </p>

                            <div className="d-flex gap-3 justify-content-center">

                                <Link
                                    href="/recorded-course"
                                    className="btn_theme_outline px-4 py-2"
                                >
                                    Browse Courses
                                </Link>

                                <Link
                                    href="/my-courses"
                                    className="btn_theme_primary px-5 py-2"
                                >
                                    My Courses
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LearnCourse
            slug={slug || String(courseId)}
            courseId={courseId}
        />
    );
}