// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";
import "./style.css";

const readLocalStorage = (key, fallback = "{}") => {
    if (typeof window === "undefined") return fallback;
    try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};

const Placement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [currentEvalStep, setCurrentEvalStep] = useState(1);
    const [eligibilityData, setEligibilityData] = useState({
        assignment: 0,
        mini_project: 0,
        main_project: 0,
        overall_score: 0,
        is_eligible: false,
        class_attendance: 0,
        assignment_submission_rate: 0,
        doubt_sessions_attended: "0/0",
        live_class_participation: 0,
    });

    const [evaluationDetails, setEvaluationDetails] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [evalSubmitResult, setEvalSubmitResult] = useState(null);
    const [isEvalLoading, setIsEvalLoading] = useState(false);
    const [evalAlreadySubmitted, setEvalAlreadySubmitted] = useState(false);
    const [retestReason, setRetestReason] = useState(null);

    const [isTestStarted, setIsTestStarted] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState("evaluation");
    const isPlacementUnlocked = evalSubmitResult && evalSubmitResult.percentage >= 70;

    const storedUser = JSON.parse(readLocalStorage("user", "{}"));
    const userId = storedUser?.id || readLocalStorage("user_id", "") || 10;
    const cumulativeScore = ((Math.round(eligibilityData?.overall_score || 0) + Math.round(evalSubmitResult?.percentage || 0)) / 2).toFixed(1);
    const testContainerRef = React.useRef(null);

    const [placementClasses, setPlacementClasses] = useState([]);
    const [activePlacementDay, setActivePlacementDay] = useState(1);
    const [activePlacementStep, setActivePlacementStep] = useState(1);
    const [videoProgress, setVideoProgress] = useState(JSON.parse(readLocalStorage('placement_video_progress', '{}')));
    const [videoWatchTime, setVideoWatchTime] = useState({});
    const [quizProgress, setQuizProgress] = useState(JSON.parse(readLocalStorage('placement_quiz_progress', '{}')));
    const [quizModalData, setQuizModalData] = useState({ isOpen: false, title: '', message: '' });
    const [demoAllVerified, setDemoAllVerified] = useState(true); // Defaulting to true so they can see the banner right away!

    // Build Profile States
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [projectDocsFile, setProjectDocsFile] = useState(null);
    const [profileData, setProfileData] = useState(null);

    const fetchPlacementProfile = () => {
        fetch(`https://crm.velearn.in/api/placement/${userId}/profile`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.profile) {
                    setProfileData(data.profile);
                    if (data.profile.portfolio_url) setPortfolioUrl(data.profile.portfolio_url);
                    if (data.profile.github_url) setGithubUrl(data.profile.github_url);
                    setDemoAllVerified(data.profile.overall_status === 'all_verified');
                }
            })
            .catch(console.error);
    };

    React.useEffect(() => {
        fetchPlacementProfile();
    }, [userId]);

    const handleResumeUpload = (file) => {
        if (!file) return;
        setResumeFile(file);
        const formData = new FormData();
        formData.append('resume', file);
        fetch(`https://crm.velearn.in/api/placement/${userId}/profile/resume`, {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setQuizModalData({ isOpen: true, title: "Resume Uploaded", message: "Your resume has been successfully uploaded!" });
                    fetchPlacementProfile();
                }
            });
    };

    const handleProjectDocsUpload = (file) => {
        if (!file) return;
        setProjectDocsFile(file);
        const formData = new FormData();
        formData.append('project_docs', file);
        fetch(`https://crm.velearn.in/api/placement/${userId}/profile/project-docs`, {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setQuizModalData({ isOpen: true, title: "Docs Uploaded", message: "Your project documents have been successfully uploaded!" });
                    fetchPlacementProfile();
                }
            });
    };

    const savePortfolioUrl = () => {
        const formData = new FormData();
        formData.append('portfolio_url', portfolioUrl);
        fetch(`https://crm.velearn.in/api/placement/${userId}/profile/portfolio`, {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setQuizModalData({ isOpen: true, title: "Portfolio Saved", message: "Portfolio URL has been updated successfully!" });
                    fetchPlacementProfile();
                }
            });
    };

    const saveGithubUrl = () => {
        const formData = new FormData();
        formData.append('github_url', githubUrl);
        fetch(`https://crm.velearn.in/api/placement/${userId}/profile/github`, {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setQuizModalData({ isOpen: true, title: "GitHub Saved", message: "GitHub URL has been updated successfully!" });
                    fetchPlacementProfile();
                }
            });
    };

    const markVideoCompleted = (clsId) => {
        if (!videoProgress[clsId]) {
            const newProgress = { ...videoProgress, [clsId]: true };
            setVideoProgress(newProgress);
            window.localStorage.setItem('placement_video_progress', JSON.stringify(newProgress));
        }
    };

    const [quizAnswers, setQuizAnswers] = useState(JSON.parse(readLocalStorage('placement_quiz_answers', '{}')));

    const submitQuizForDay = (day) => {
        const dayClasses = placementClasses.filter(c => c.day === day);
        let qs = [];
        dayClasses.forEach(c => {
            if (c.questions) qs = [...qs, ...c.questions];
        });

        // Validation: Did they answer all?
        const allAnswered = qs.every(q => quizAnswers[q.id]);
        if (!allAnswered) {
            setQuizModalData({ isOpen: true, title: 'Incomplete', message: 'Please answer all questions before submitting.' });
            return;
        }

        let score = 0;
        qs.forEach(q => {
            const selectedOptId = quizAnswers[q.id];
            const correctOpt = q.options.find(o => o.is_correct);
            if (correctOpt && selectedOptId === correctOpt.id) {
                score += q.marks || 1;
            }
        });

        const newProgress = { ...quizProgress, [day]: true };
        setQuizProgress(newProgress);
        window.localStorage.setItem('placement_quiz_progress', JSON.stringify(newProgress));
        setQuizModalData({ isOpen: true, title: 'Success', message: `Day ${day} Practice Questions Submitted! You scored ${score} marks.` });
    };

    const handlePracticeAnswerChange = (qId, optId) => {
        if (quizProgress[activePlacementDay]) return; // prevent changing if submitted
        const newAnswers = { ...quizAnswers, [qId]: optId };
        setQuizAnswers(newAnswers);
        window.localStorage.setItem('placement_quiz_answers', JSON.stringify(newAnswers));
    };

    React.useEffect(() => {
        fetch("https://crm.velearn.in/api/placement-classes")
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setPlacementClasses(data.data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const startTest = () => {
        setIsTestStarted(true);
        if (timeLeft === null && evaluationDetails) {
            setTimeLeft(evaluationDetails.test_timing);
        }

        // Enter Fullscreen
        const elem = testContainerRef.current || document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.log(
                    `Error attempting to enable fullscreen: ${err.message}`,
                );
            });
        }
    };

    // Anti-cheating event listeners
    React.useEffect(() => {
        if (!isTestStarted || evalAlreadySubmitted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                alert(
                    "Warning: You left the test screen! The test will be automatically submitted.",
                );
                submitEvaluationTest();
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                alert(
                    "Warning: You exited fullscreen mode! The test will be automatically submitted.",
                );
                submitEvaluationTest();
            }
        };

        const blockKeys = (e) => {
            // Block F12, Ctrl+Shift+I, Ctrl+C, Ctrl+V, Alt+Tab (can't completely block Alt+Tab but can prevent default)
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.key === "c") ||
                (e.ctrlKey && e.key === "v")
            ) {
                e.preventDefault();
            }
        };

        const blockContextMenu = (e) => e.preventDefault();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("keydown", blockKeys);
        document.addEventListener("contextmenu", blockContextMenu);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
            document.removeEventListener("keydown", blockKeys);
            document.removeEventListener("contextmenu", blockContextMenu);
        };
    }, [isTestStarted, evalAlreadySubmitted]);

    const [timeLeft, setTimeLeft] = useState(null);

    React.useEffect(() => {
        if (
            evaluationDetails &&
            !evalAlreadySubmitted &&
            currentEvalStep === 2
        ) {
            if (timeLeft === null) {
                setTimeLeft(evaluationDetails.test_timing);
            }
        }
    }, [evaluationDetails, evalAlreadySubmitted, currentEvalStep, timeLeft]);

    React.useEffect(() => {
        if (
            timeLeft !== null &&
            timeLeft > 0 &&
            isTestStarted &&
            !evalAlreadySubmitted
        ) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            submitEvaluationTest();
        }
    }, [timeLeft, isTestStarted, evalAlreadySubmitted]);

    const formatTime = (seconds) => {
        if (seconds === null) return "00:00";
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    React.useEffect(() => {
        if (
            currentEvalStep === 2 &&
            !evaluationDetails &&
            !isEvalLoading &&
            !evalAlreadySubmitted
        ) { 
            setIsEvalLoading(true);
            const storedUser = JSON.parse(readLocalStorage("user", "{}"));
            const userId = storedUser.id || storedUser.student_id;
            fetch(`https://crm.velearn.in/api/placement/${userId}/evaluation`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "success") {
                        setEvaluationDetails(data.data.evaluation);
                        setEvalAlreadySubmitted(data.data.already_submitted);
                        if (data.data.already_submitted) {
                            setEvalSubmitResult(data.data);
                        }
                    }
                    setIsEvalLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setIsEvalLoading(false);
                });
        }
    }, [
        currentEvalStep,
        evaluationDetails,
        isEvalLoading,
        evalAlreadySubmitted,
    ]);

    const handleAnswerChange = (qId, ansId) => {
        setAnswers((prev) => ({ ...prev, [qId]: ansId }));
    };

    const handleNextQ = () => {
        if (
            evaluationDetails &&
            currentQIndex < evaluationDetails.questions.length - 1
        ) {
            setCurrentQIndex(currentQIndex + 1);
        }
    };

    const handlePrevQ = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(currentQIndex - 1);
        }
    };

    const submitEvaluationTest = () => {
        if (!evaluationDetails) return;

        const storedUser = JSON.parse(readLocalStorage("user", "{}"));
        const userId = storedUser.id || storedUser.student_id;

        const formattedAnswers = Object.entries(answers).map(([qId, aId]) => ({
            question_id: parseInt(qId),
            selected_answer_id: parseInt(aId),
        }));

        fetch(
            `https://crm.velearn.in/api/placement/${userId}/evaluation/submit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    evaluation_id: evaluationDetails.id,
                    answers: formattedAnswers,
                }),
            },
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    setEvalSubmitResult(data);
                    setEvalAlreadySubmitted(true);
                    setCurrentQIndex(0);

                    setTimeout(() => {
                        if (document.fullscreenElement) {
                            document.exitFullscreen().catch(err => console.log(err));
                        }
                    }, 100);
                } else {
                    alert(data.message || "Error submitting");
                }
            })
            .catch((err) => console.error(err));
    };

    React.useEffect(() => {
        const storedUser = JSON.parse(readLocalStorage("user", "{}"));
        const userId = storedUser.id || storedUser.student_id;
        if (userId) {
            fetch(`https://crm.velearn.in/api/placement/${userId}/eligibility`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === "success") {
                        setEligibilityData(data.data);
                    }
                })
                .catch((err) => console.error(err));
        }
    }, []);

    return (
        <div className="dashboard_layout">
            <Sidebar
                activePage="placement"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div
                className={`sidebar_overlay ${isSidebarOpen ? "show" : ""}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            <NotificationsModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={[]}
            />

            {quizModalData.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', transform: 'translateY(0)', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>{quizModalData.title === 'Success' ? '🎉' : '⚠️'}</div>
                        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>{quizModalData.title}</h3>
                        <p style={{ fontSize: 15, color: '#475569', marginBottom: 24, lineHeight: 1.5 }}>{quizModalData.message}</p>
                        <button
                            onClick={() => setQuizModalData({ ...quizModalData, isOpen: false })}
                            style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}
                            onMouseOver={(e) => e.target.style.background = '#7c3aed'}
                            onMouseOut={(e) => e.target.style.background = '#8b5cf6'}
                        >
                            Got it!
                        </button>
                    </div>
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    `}</style>
                </div>
            )}

            <div className="dashboard_main_content">
                <header className="dashboard_top_header">
                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses <span>/ Placement</span>
                        </h2>
                    </div>
                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>
                    </div>
                </header>

                <div className="placement_container">
                    {/* ── PLACEMENT ── */}
                    <div id="live-sec-placement" className="live-sub-sec">
                        {/* ════ DUAL TAB BAR ════ */}
                        <div className="pl-main-tabbar">
                            <button
                                className={`pl-main-tab ${activeMainTab === "evaluation" ? "active" : ""}`}
                                id="plt-eval"
                                onClick={() => setActiveMainTab("evaluation")}
                            >
                                <span className="tab-ic">📋</span> Evaluation
                            </button>
                            <button
                                className={`pl-main-tab ${!isPlacementUnlocked ? "locked-tab" : ""} ${activeMainTab === "placement" ? "active" : ""}`}
                                id="plt-placement"
                                disabled={!isPlacementUnlocked}
                                onClick={() => setActiveMainTab("placement")}
                            >
                                <span className="tab-ic">🎯</span> Placement
                                {!isPlacementUnlocked && (
                                    <span className="lock-chip" id="plt-lock-chip">
                                        🔒 Locked
                                    </span>
                                )}
                            </button>
                        </div>
                        {/* ══════════════════════════════════════════════════
                            EVALUATION TAB
                        ══════════════════════════════════════════════════ */}
                        <div id="plt-content-eval" style={{ display: activeMainTab === "evaluation" ? "block" : "none" }}>
                            {/* Step Pills */}
                            <div className="eval-step-pills">
                                <div
                                    className={`eval-pill ${currentEvalStep === 1 ? "active" : ""}`}
                                    id="epill-1"
                                    onClick={() => setCurrentEvalStep(1)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span>⚡</span> Step 1 · Eligibility
                                </div>
                                <div
                                    className={`eval-pill ${currentEvalStep === 2 ? "active" : !eligibilityData.is_eligible ? "locked" : ""}`}
                                    id="epill-2"
                                    onClick={() => {
                                        if (eligibilityData.is_eligible)
                                            setCurrentEvalStep(2);
                                    }}
                                    style={{
                                        cursor: eligibilityData.is_eligible
                                            ? "pointer"
                                            : "not-allowed",
                                    }}
                                >
                                    <span>
                                        {eligibilityData.is_eligible
                                            ? "⚡"
                                            : "🔒"}
                                    </span>{" "}
                                    Step 2 · Evaluation Test
                                </div>
                                <div
                                    className={`eval-pill ${currentEvalStep === 3 ? "active" : "locked"}`}
                                    id="epill-3"
                                >
                                    <span>🔒</span> Cumulative Result
                                </div>
                            </div>
                            {/* ─── EVAL STEP 1 : ELIGIBILITY ─── */}
                            <div
                                id="estep-1"
                                style={{
                                    display:
                                        currentEvalStep === 1
                                            ? "block"
                                            : "none",
                                }}
                            >
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid var(--bd)",
                                        borderRadius: 16,
                                        padding: 22,
                                        marginBottom: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 20,
                                            flexWrap: "wrap",
                                            gap: 8,
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: "var(--p)",
                                                }}
                                            >
                                                📋 Step 1 — Placement
                                                Eligibility
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "var(--mu)",
                                                    marginTop: 3,
                                                }}
                                            >
                                                Assignment + Mini Project + Main
                                                Project · Need ≥ 80% overall to
                                                proceed
                                            </div>
                                        </div>
                                        <span
                                            id="elig-badge"
                                            style={{
                                                background:
                                                    eligibilityData.is_eligible
                                                        ? "#dcfce7"
                                                        : "#fee2e2",
                                                color: eligibilityData.is_eligible
                                                    ? "#166534"
                                                    : "#991b1b",
                                                padding: "5px 14px",
                                                borderRadius: 20,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                border: eligibilityData.is_eligible
                                                    ? "1.5px solid #86efac"
                                                    : "1.5px solid #fca5a5",
                                            }}
                                        >
                                            {eligibilityData.is_eligible
                                                ? "✅ ELIGIBLE"
                                                : "❌ NOT ELIGIBLE"}
                                        </span>
                                    </div>
                                    {/* 3 score cards */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(3,1fr)",
                                            gap: 14,
                                            marginBottom: 20,
                                        }}
                                    >
                                        <div
                                            className="score-card"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg,#eff6ff,#dbeafe)",
                                                border: "1.5px solid #93c5fd",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 0,
                                                    background: "#3b82f6",
                                                    color: "#fff",
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    padding: "3px 10px",
                                                    borderRadius:
                                                        "0 14px 0 8px",
                                                }}
                                            >
                                                GRADED
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 22,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                📝
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#1d4ed8",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Assignment
                                            </div>
                                            <div
                                                className="score-num"
                                                style={{ color: "#1d4ed8" }}
                                                id="sc-assign"
                                            >
                                                {eligibilityData.assignment}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#3b82f6",
                                                }}
                                            >
                                                /100
                                            </div>
                                            <div
                                                className="score-bar"
                                                style={{
                                                    background: "#bfdbfe",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${eligibilityData.assignment}%`,
                                                        height: "100%",
                                                        background:
                                                            "linear-gradient(90deg,#2563eb,#60a5fa)",
                                                        borderRadius: 99,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 600,
                                                    background: "#dbeafe",
                                                    color: "#1e40af",
                                                    padding: "3px 6px",
                                                    borderRadius: 6,
                                                    marginTop: 4,
                                                }}
                                            >
                                                HTML · CSS · JS · React
                                            </div>
                                        </div>
                                        <div
                                            className="score-card"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                                border: eligibilityData.is_eligible
                                                    ? "1.5px solid #86efac"
                                                    : "1.5px solid #fca5a5",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 0,
                                                    background: "#16a34a",
                                                    color: "#fff",
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    padding: "3px 10px",
                                                    borderRadius:
                                                        "0 14px 0 8px",
                                                }}
                                            >
                                                GRADED
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 22,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                🔧
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#15803d",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Mini Project
                                            </div>
                                            <div
                                                className="score-num"
                                                style={{ color: "#15803d" }}
                                                id="sc-mini"
                                            >
                                                {eligibilityData.mini_project}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#16a34a",
                                                }}
                                            >
                                                /100
                                            </div>
                                            <div
                                                className="score-bar"
                                                style={{
                                                    background: "#bbf7d0",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${eligibilityData.mini_project}%`,
                                                        height: "100%",
                                                        background:
                                                            "linear-gradient(90deg,#16a34a,#4ade80)",
                                                        borderRadius: 99,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 600,
                                                    background: "#dcfce7",
                                                    color: "#14532d",
                                                    padding: "3px 6px",
                                                    borderRadius: 6,
                                                    marginTop: 4,
                                                }}
                                            >
                                                Todo App · Node.js API
                                            </div>
                                        </div>
                                        <div
                                            className="score-card"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg,#faf5ff,#ede9fe)",
                                                border: "1.5px solid #c4b5fd",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 0,
                                                    background: "#7c3aed",
                                                    color: "#fff",
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    padding: "3px 10px",
                                                    borderRadius:
                                                        "0 14px 0 8px",
                                                }}
                                            >
                                                GRADED
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 22,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                💼
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: "#6d28d9",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Main Project
                                            </div>
                                            <div
                                                className="score-num"
                                                style={{ color: "#6d28d9" }}
                                                id="sc-main"
                                            >
                                                {eligibilityData.main_project}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#7c3aed",
                                                }}
                                            >
                                                /100
                                            </div>
                                            <div
                                                className="score-bar"
                                                style={{
                                                    background: "#ddd6fe",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${eligibilityData.main_project}%`,
                                                        height: "100%",
                                                        background:
                                                            "linear-gradient(90deg,#7c3aed,#a78bfa)",
                                                        borderRadius: 99,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 600,
                                                    background: "#ede9fe",
                                                    color: "#4c1d95",
                                                    padding: "3px 6px",
                                                    borderRadius: 6,
                                                    marginTop: 4,
                                                }}
                                            >
                                                E-Commerce MERN
                                            </div>
                                        </div>
                                    </div>
                                    {/* Performance metrics */}
                                    {/* <div
                                        style={{
                                            background: "#f8faff",
                                            border: "1px solid var(--bd)",
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 18,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: "var(--p)",
                                                marginBottom: 12,
                                            }}
                                        >
                                            📊 Overall Performance
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 9,
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        fontSize: 11,
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "var(--mu)",
                                                        }}
                                                    >
                                                        Class Attendance
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "var(--p)",
                                                        }}
                                                    >
                                                        {
                                                            eligibilityData.class_attendance
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: 5,
                                                        background: "#e5e7eb",
                                                        borderRadius: 99,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${eligibilityData.class_attendance}%`,
                                                            height: "100%",
                                                            background:
                                                                "linear-gradient(90deg,#16a34a,#4ade80)",
                                                            borderRadius: 99,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        fontSize: 11,
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "var(--mu)",
                                                        }}
                                                    >
                                                        Assignment Submission
                                                        Rate
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "var(--p)",
                                                        }}
                                                    >
                                                        {
                                                            eligibilityData.assignment_submission_rate
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: 5,
                                                        background: "#e5e7eb",
                                                        borderRadius: 99,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            background:
                                                                "linear-gradient(90deg,#2563eb,#60a5fa)",
                                                            borderRadius: 99,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        fontSize: 11,
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "var(--mu)",
                                                        }}
                                                    >
                                                        Doubt Sessions Attended
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "var(--p)",
                                                        }}
                                                    >
                                                        {
                                                            eligibilityData.doubt_sessions_attended
                                                        }
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: 5,
                                                        background: "#e5e7eb",
                                                        borderRadius: 99,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: "80%",
                                                            height: "100%",
                                                            background:
                                                                "linear-gradient(90deg,#7c3aed,#a78bfa)",
                                                            borderRadius: 99,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        fontSize: 11,
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "var(--mu)",
                                                        }}
                                                    >
                                                        Live Class Participation
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "var(--p)",
                                                        }}
                                                    >
                                                        {
                                                            eligibilityData.live_class_participation
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: 5,
                                                        background: "#e5e7eb",
                                                        borderRadius: 99,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${eligibilityData.live_class_participation}%`,
                                                            height: "100%",
                                                            background:
                                                                "linear-gradient(90deg,#0891b2,#22d3ee)",
                                                            borderRadius: 99,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                    {/* Overall eligibility banner */}
                                    <div
                                        style={{
                                            background:
                                                "linear-gradient(135deg,#064e3b,#065f46)",
                                            borderRadius: 14,
                                            padding: "18px 22px",
                                            marginBottom: 18,
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: 14,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    opacity: "0.8",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                📊 Overall Score (Assignment +
                                                Mini + Main ÷ 3)
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    opacity: "0.7",
                                                    marginBottom: 9,
                                                }}
                                            >
                                                {eligibilityData.assignment} +{" "}
                                                {eligibilityData.mini_project} +{" "}
                                                {eligibilityData.main_project} ={" "}
                                                {eligibilityData.assignment +
                                                    eligibilityData.mini_project +
                                                    eligibilityData.main_project}{" "}
                                                ÷ 3 ={" "}
                                                <strong>
                                                    {
                                                        eligibilityData.overall_score
                                                    }
                                                    %
                                                </strong>{" "}
                                                · Minimum required: 80%
                                            </div>
                                            <div
                                                style={{
                                                    height: 9,
                                                    background:
                                                        "rgba(255,255,255,0.18)",
                                                    borderRadius: 99,
                                                    overflow: "hidden",
                                                    marginBottom: 5,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${eligibilityData.overall_score}%`,
                                                        height: "100%",
                                                        background:
                                                            "linear-gradient(90deg,#4ade80,#22d3ee)",
                                                        borderRadius: 99,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    opacity: "0.8",
                                                }}
                                            >
                                                You have{" "}
                                                {eligibilityData.is_eligible
                                                    ? "cleared"
                                                    : "not cleared"}{" "}
                                                eligibility with{" "}
                                                <strong
                                                    style={{
                                                        color: eligibilityData.is_eligible
                                                            ? "#4ade80"
                                                            : "#fca5a5",
                                                    }}
                                                >
                                                    {
                                                        eligibilityData.overall_score
                                                    }
                                                    %
                                                </strong>{" "}
                                                {eligibilityData.is_eligible
                                                    ? "✅"
                                                    : "❌"}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                background:
                                                    "rgba(255,255,255,0.12)",
                                                borderRadius: 12,
                                                padding: "14px 22px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 38,
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: eligibilityData.is_eligible
                                                        ? "#4ade80"
                                                        : "#fca5a5",
                                                }}
                                            >
                                                {eligibilityData.overall_score}%
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: eligibilityData.is_eligible
                                                        ? "#86efac"
                                                        : "#fecaca",
                                                    marginTop: 3,
                                                }}
                                            >
                                                {eligibilityData.is_eligible
                                                    ? "ELIGIBLE ✅"
                                                    : "INELIGIBLE ❌"}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setCurrentEvalStep(2)}
                                        style={{
                                            background:
                                                "linear-gradient(135deg,#16a34a,#059669)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 10,
                                            padding: "12px 28px",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontFamily: '"Outfit",sans-serif',
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        ✅ Eligible → Proceed to Evaluation Test{" "}
                                        <span style={{ opacity: "0.8" }}>
                                            ▶
                                        </span>
                                    </button>
                                </div>
                            </div>
                            {/* ─── EVAL STEP 2 : TEST ─── */}
                            <div
                                id="estep-2"
                                ref={testContainerRef}
                                style={{
                                    display:
                                        currentEvalStep === 2
                                            ? "block"
                                            : "none",
                                    ...(isTestStarted
                                        ? {
                                            background: "#f4f7fe",
                                            overflowY: "auto",
                                            padding: 20,
                                        }
                                        : {}),
                                }}
                            >
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid var(--bd)",
                                        borderRadius: 16,
                                        padding: 22,
                                        marginBottom: 16,
                                    }}
                                >
                                    {/* Header with timer */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 18,
                                            flexWrap: "wrap",
                                            gap: 10,
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: "var(--p)",
                                                }}
                                            >
                                                ⚡ Step 2 — Evaluation Test
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "var(--mu)",
                                                    marginTop: 3,
                                                }}
                                            >
                                                Mixed: MCQ · Coding · Upload ·
                                                15 Questions · Pass 70%
                                            </div>
                                        </div>
                                        {!evalAlreadySubmitted && (
                                            <div
                                                id="eval-timer-wrap"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#1e3a5f,#1d4ed8)",
                                                    color: "#fff",
                                                    borderRadius: 10,
                                                    padding: "9px 16px",
                                                    textAlign: "center",
                                                    minWidth: 108,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        opacity: "0.7",
                                                        textTransform: "uppercase",
                                                        letterSpacing: 1,
                                                    }}
                                                >
                                                    Time Left
                                                </div>
                                                <div
                                                    id="eval-timer"
                                                    style={{
                                                        fontSize: 22,
                                                        fontWeight: 900,
                                                        letterSpacing: 2,
                                                        fontFamily: "monospace",
                                                    }}
                                                >
                                                    {formatTime(timeLeft)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {evaluationDetails && !evalAlreadySubmitted ? (
                                        !isTestStarted ? (
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    padding: "40px 20px",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontSize: 24,
                                                        fontWeight: 700,
                                                        color: "var(--p)",
                                                        marginBottom: 16,
                                                    }}
                                                >
                                                    Ready to start the
                                                    evaluation?
                                                </h3>
                                                {retestReason && (
                                                    <div style={{
                                                        background: "#fee2e2",
                                                        border: "1px solid #fecaca",
                                                        color: "#991b1b",
                                                        padding: "12px",
                                                        borderRadius: "8px",
                                                        marginBottom: "16px",
                                                        fontSize: "14px",
                                                        fontWeight: 500,
                                                        display: "inline-block"
                                                    }}>
                                                        <strong>Retest Required:</strong> {retestReason}
                                                    </div>
                                                )}
                                                <p
                                                    style={{
                                                        color: "var(--mu)",
                                                        marginBottom: 24,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    This is a proctored test.
                                                    Once you start, it will open
                                                    in full-screen mode.
                                                    <br />
                                                    <strong>
                                                        Do not switch tabs or
                                                        exit full-screen
                                                    </strong>
                                                    , or the test will
                                                    automatically submit.
                                                </p>
                                                <button
                                                    onClick={startTest}
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #4f46e5, #6366f1)",
                                                        color: "#fff",
                                                        border: "none",
                                                        padding: "12px 32px",
                                                        borderRadius: 8,
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        boxShadow:
                                                            "0 4px 12px rgba(79, 70, 229, 0.3)",
                                                    }}
                                                >
                                                    Start Test Now
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    height: "100%",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                {/* Q progress bar */}
                                                <div
                                                    style={{
                                                        background: "#f0f4ff",
                                                        borderRadius: 10,
                                                        padding: "11px 16px",
                                                        marginBottom: 16,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "space-between",
                                                        flexWrap: "wrap",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 10,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                color: "var(--p)",
                                                            }}
                                                        >
                                                            Question{" "}
                                                            <span id="eval-qnum">
                                                                {currentQIndex +
                                                                    1}
                                                            </span>{" "}
                                                            /{" "}
                                                            {
                                                                evaluationDetails
                                                                    .questions
                                                                    .length
                                                            }
                                                        </span>
                                                        <span
                                                            id="eval-qtype-chip"
                                                            style={{
                                                                background:
                                                                    "#dbeafe",
                                                                color: "#1d4ed8",
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                padding:
                                                                    "2px 9px",
                                                                borderRadius: 9,
                                                            }}
                                                        >
                                                            {evaluationDetails
                                                                .questions[
                                                                currentQIndex
                                                            ]?.type || "MCQ"}
                                                        </span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 6,
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                background:
                                                                    "#dcfce7",
                                                                color: "#166534",
                                                                fontSize: 9,
                                                                fontWeight: 700,
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius: 5,
                                                            }}
                                                        >
                                                            ✅ Done:{" "}
                                                            {
                                                                Object.keys(
                                                                    answers,
                                                                ).length
                                                            }
                                                        </span>
                                                        <span
                                                            style={{
                                                                background:
                                                                    "#ffedd5",
                                                                color: "#c2410c",
                                                                fontSize: 9,
                                                                fontWeight: 700,
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius: 5,
                                                            }}
                                                        >
                                                            ⏳ Left:{" "}
                                                            {evaluationDetails
                                                                .questions
                                                                .length -
                                                                Object.keys(
                                                                    answers,
                                                                ).length}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress line */}
                                                <div
                                                    style={{
                                                        height: 4,
                                                        background: "#e5e7eb",
                                                        borderRadius: 4,
                                                        marginBottom: 14,
                                                        display: "flex",
                                                    }}
                                                >
                                                    <div
                                                        id="eval-pbar"
                                                        style={{
                                                            width: `${(Object.keys(answers).length / evaluationDetails.questions.length) * 100}%`,
                                                            height: "100%",
                                                            background:
                                                                "linear-gradient(90deg,#4f46e5,#6366f1)",
                                                            borderRadius: 4,
                                                            transition:
                                                                "width 0.3s ease",
                                                        }}
                                                    />
                                                </div>

                                                {/* Question Display Area */}
                                                <div
                                                    id="eval-q-area"
                                                    style={{
                                                        background: "#f8faff",
                                                        border: "1.5px solid var(--bd)",
                                                        borderRadius: 13,
                                                        padding: 18,
                                                        marginBottom: 16,
                                                        minHeight: 180,
                                                    }}
                                                >
                                                    <div className="eval-q-panel">
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                color: "var(--mu)",
                                                                textTransform:
                                                                    "uppercase",
                                                                letterSpacing:
                                                                    "0.1em",
                                                                marginBottom: 8,
                                                            }}
                                                        >
                                                            Q{currentQIndex + 1}{" "}
                                                            ·{" "}
                                                            {evaluationDetails
                                                                .questions[
                                                                currentQIndex
                                                            ]?.type || "MCQ"}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                color: "var(--p)",
                                                                marginBottom: 14,
                                                                lineHeight: 1.5,
                                                            }}
                                                            dangerouslySetInnerHTML={{
                                                                __html:
                                                                    evaluationDetails
                                                                        .questions[
                                                                        currentQIndex
                                                                    ]
                                                                        ?.question_text ||
                                                                    evaluationDetails
                                                                        .questions[
                                                                        currentQIndex
                                                                    ]?.question,
                                                            }}
                                                        />

                                                        {(evaluationDetails
                                                            .questions[
                                                            currentQIndex
                                                        ]?.options ||
                                                            evaluationDetails
                                                                .questions[
                                                                currentQIndex
                                                            ]?.answers) && (
                                                                <div id="eqb-opts">
                                                                    {(
                                                                        evaluationDetails
                                                                            .questions[
                                                                            currentQIndex
                                                                        ].options ||
                                                                        evaluationDetails
                                                                            .questions[
                                                                            currentQIndex
                                                                        ].answers
                                                                    ).map((opt) => (
                                                                        <label
                                                                            key={
                                                                                opt.id
                                                                            }
                                                                            className="eval-opt"
                                                                            style={{
                                                                                display:
                                                                                    "block",
                                                                                padding:
                                                                                    "14px 16px",
                                                                                margin: "8px 0",
                                                                                background:
                                                                                    "#fff",
                                                                                border: "1px solid #e5e7eb",
                                                                                borderRadius:
                                                                                    "8px",
                                                                                cursor: "pointer",
                                                                                fontSize: 13,
                                                                                color: "var(--p)",
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name={`q-${evaluationDetails.questions[currentQIndex].id}`}
                                                                                value={opt.id}
                                                                                checked={answers[evaluationDetails.questions[currentQIndex].id] == opt.id || (evalAlreadySubmitted && (evalSubmitResult?.results_breakdown || evalSubmitResult?.data?.results_breakdown || evalSubmitResult?.evaluation?.results_breakdown || [])?.find(b => b.question_id === evaluationDetails.questions[currentQIndex].id)?.selected_answer_id == opt.id)}
                                                                                onChange={() => handleAnswerChange(evaluationDetails.questions[currentQIndex].id, opt.id)}
                                                                                disabled={evalAlreadySubmitted}
                                                                                style={{
                                                                                    accentColor: "var(--a)",
                                                                                    marginRight: "12px",
                                                                                }}
                                                                            />
                                                                            {opt.answer ||
                                                                                opt.option_text ||
                                                                                opt.text ||
                                                                                opt.title}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>

                                                {/* Q-Footer: Prev/Next */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "space-between",
                                                        marginBottom: 16,
                                                    }}
                                                >
                                                    <button
                                                        id="ebtn-prev"
                                                        onClick={handlePrevQ}
                                                        disabled={
                                                            currentQIndex === 0
                                                        }
                                                        style={{
                                                            background: "#fff",
                                                            border: "1.5px solid var(--bd)",
                                                            color: "var(--mu)",
                                                            padding: "7px 16px",
                                                            borderRadius: 8,
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            cursor:
                                                                currentQIndex ===
                                                                    0
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                            opacity:
                                                                currentQIndex ===
                                                                    0
                                                                    ? 0.5
                                                                    : 1,
                                                            fontFamily:
                                                                '"Outfit",sans-serif',
                                                        }}
                                                    >
                                                        ◀ Prev
                                                    </button>

                                                    {currentQIndex <
                                                        evaluationDetails.questions
                                                            .length -
                                                        1 ? (
                                                        <button
                                                            disabled={
                                                                !answers[
                                                                evaluationDetails
                                                                    .questions[
                                                                    currentQIndex
                                                                ].id
                                                                ]
                                                            }
                                                            id="ebtn-next"
                                                            onClick={
                                                                handleNextQ
                                                            }
                                                            style={{
                                                                opacity:
                                                                    answers[
                                                                        evaluationDetails
                                                                            .questions[
                                                                            currentQIndex
                                                                        ].id
                                                                    ]
                                                                        ? 1
                                                                        : 0.5,
                                                                cursor: answers[
                                                                    evaluationDetails
                                                                        .questions[
                                                                        currentQIndex
                                                                    ].id
                                                                ]
                                                                    ? "pointer"
                                                                    : "not-allowed",
                                                                background:
                                                                    "var(--p)",
                                                                color: "#fff",
                                                                border: "none",
                                                                padding:
                                                                    "7px 20px",
                                                                borderRadius: 8,
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                cursor: "pointer",
                                                                fontFamily:
                                                                    '"Outfit",sans-serif',
                                                            }}
                                                        >
                                                            Next ▶
                                                        </button>
                                                    ) : (
                                                        !evalAlreadySubmitted && (
                                                            <button
                                                                disabled={
                                                                    !answers[
                                                                    evaluationDetails
                                                                        .questions[
                                                                        currentQIndex
                                                                    ].id
                                                                    ]
                                                                }
                                                                id="ebtn-submit"
                                                                onClick={
                                                                    submitEvaluationTest
                                                                }
                                                                style={{
                                                                    opacity:
                                                                        answers[
                                                                            evaluationDetails
                                                                                .questions[
                                                                                currentQIndex
                                                                            ].id
                                                                        ]
                                                                            ? 1
                                                                            : 0.5,
                                                                    cursor: answers[
                                                                        evaluationDetails
                                                                            .questions[
                                                                            currentQIndex
                                                                        ].id
                                                                    ]
                                                                        ? "pointer"
                                                                        : "not-allowed",
                                                                    background:
                                                                        "#10b981",
                                                                    color: "#fff",
                                                                    border: "none",
                                                                    padding:
                                                                        "7px 20px",
                                                                    borderRadius: 8,
                                                                    fontSize: 11,
                                                                    fontWeight: 700,
                                                                    fontFamily:
                                                                        '"Outfit",sans-serif',
                                                                }}
                                                            >
                                                                Submit Test ✓
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    ) : isEvalLoading ? (
                                        <div
                                            style={{
                                                padding: 40,
                                                textAlign: "center",
                                                color: "var(--mu)",
                                            }}
                                        >
                                            <i
                                                className="bi bi-arrow-repeat spin-icon"
                                                style={{
                                                    display: "inline-block",
                                                    animation:
                                                        "spin 1s linear infinite",
                                                }}
                                            ></i>{" "}
                                            Loading test...
                                        </div>
                                    ) : null}

                                    <div
                                        id="eval-test-result"
                                        style={{
                                            marginTop: 18,
                                            display: evalAlreadySubmitted && evalSubmitResult ? "block" : "none"
                                        }}
                                    >
                                        {evalSubmitResult && (
                                            <>
                                                <div
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg,#064e3b,#065f46)",
                                                        borderRadius: 14,
                                                        padding: 20,
                                                        color: "#fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        flexWrap: "wrap",
                                                        gap: 12,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                marginBottom: 3,
                                                            }}
                                                        >
                                                            🎉 Test Completed!
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 15,
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            Score: {evalSubmitResult.score}/{evalSubmitResult.max_score} · {evalSubmitResult.percentage}%
                                                            ✅
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                opacity: "0.75",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            Minimum 70% · You qualified!
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            textAlign: "center",
                                                            background:
                                                                "rgba(255,255,255,0.15)",
                                                            borderRadius: 12,
                                                            padding: "12px 20px",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 36,
                                                                fontWeight: 900,
                                                                color: "#4ade80",
                                                                lineHeight: 1,
                                                            }}
                                                        >{evalSubmitResult.percentage}%</div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                color: "#86efac",
                                                                marginTop: 2,
                                                            }}
                                                        >{evalSubmitResult.percentage >= 70 ? "PASSED" : "FAILED"}</div>
                                                    </div>
                                                </div>
                                                {evalSubmitResult.percentage >= 70 && (
                                                    <button
                                                        onClick={() => setCurrentEvalStep(3)}
                                                        style={{
                                                            width: "100%",
                                                            background: "linear-gradient(135deg,#16a34a,#059669)",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 10,
                                                            padding: 12,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            cursor: "pointer",
                                                            fontFamily: '"Outfit",sans-serif',
                                                        }}
                                                    >
                                                        View Cumulative Result →
                                                    </button>
                                                )}

                                                {evalSubmitResult.percentage < 70 && (
                                                    <button
                                                        onClick={() => {
                                                            const storedUser = JSON.parse(readLocalStorage("user", "{}"));
                                                            const userId = storedUser.id || storedUser.student_id;
                                                            fetch(`https://crm.velearn.in/api/placement/${userId}/evaluation/retest`, {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'Accept': 'application/json'
                                                                },
                                                                body: JSON.stringify({ evaluation_id: evaluationDetails.id })
                                                            }).then(() => {
                                                                const prevScore = evalSubmitResult?.percentage || (evalSubmitResult?.max_score > 0 ? Math.round((evalSubmitResult.score / evalSubmitResult.max_score) * 100) : 0);
                                                                setRetestReason(`Your previous score was ${prevScore}%. You must score at least 70% to pass.`);
                                                                setEvalAlreadySubmitted(false);
                                                                setEvalSubmitResult(null);
                                                                setIsTestStarted(false);
                                                                setAnswers({});
                                                                setCurrentQIndex(0);
                                                                setTimeLeft(evaluationDetails.test_timing);
                                                            });
                                                        }}
                                                        style={{
                                                            width: "100%",
                                                            background: "linear-gradient(135deg,#dc2626,#991b1b)",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 10,
                                                            padding: 12,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            cursor: "pointer",
                                                            marginTop: 10,
                                                            fontFamily: '"Outfit",sans-serif',
                                                        }}
                                                    >
                                                        Take Retest ↻
                                                    </button>
                                                )}

                                                {/* Display questions and answers breakdown */}
                                                <div style={{ marginTop: 24 }}>
                                                    <h4 style={{ color: "var(--p)", marginBottom: 16 }}>Test Breakdown</h4>
                                                    {evaluationDetails.questions.map((q, i) => {
                                                        const breakdown = evalSubmitResult.results_breakdown?.find(b => b.question_id === q.id);
                                                        return (
                                                            <div key={q.id} style={{ background: "#f8f9fa", padding: 16, borderRadius: 12, marginBottom: 12, border: "1px solid var(--bd)" }}>
                                                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
                                                                    Q{i + 1}. {q.question}
                                                                </div>
                                                                {q.answers.map(opt => {
                                                                    const isSelected = breakdown?.selected_answer_id === opt.id;
                                                                    let bg = "#fff";
                                                                    let borderColor = "var(--bd)";
                                                                    let textColor = "var(--s)";

                                                                    if (isSelected) {
                                                                        if (breakdown.is_correct) {
                                                                            bg = "#dcfce7"; borderColor = "#22c55e"; textColor = "#166534";
                                                                        } else {
                                                                            bg = "#fee2e2"; borderColor = "#ef4444"; textColor = "#991b1b";
                                                                        }
                                                                    }

                                                                    return (
                                                                        <div key={opt.id} style={{
                                                                            background: bg, border: `1px solid ${borderColor}`, color: textColor,
                                                                            padding: "10px 16px", borderRadius: 8, marginBottom: 8, fontSize: 13
                                                                        }}>
                                                                            {opt.answer || opt.option_text || opt.text || opt.title}
                                                                            {isSelected && breakdown?.is_correct && <span style={{ float: 'right' }}>✅ Correct</span>}
                                                                            {isSelected && !breakdown?.is_correct && <span style={{ float: 'right' }}>❌ Wrong</span>}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* ─── EVAL STEP 3 : CUMULATIVE RESULT ─── */}
                            <div
                                id="estep-3"
                                style={{
                                    display:
                                        currentEvalStep === 3
                                            ? "block"
                                            : "none",
                                }}
                            >
                                <div
                                    className="cumul-card"
                                    style={{ marginBottom: 16 }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            opacity: "0.04",
                                            background:
                                                "repeating-linear-gradient(45deg,#fff,#fff 2px,transparent 2px,transparent 18px)",
                                        }}
                                    />
                                    <div style={{ position: "relative" }}>
                                        <div
                                            style={{
                                                fontSize: 36,
                                                marginBottom: 8,
                                            }}
                                        >
                                            🏅
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 22,
                                                fontWeight: 900,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Evaluation Complete — {storedUser.name || storedUser.student_name || "Student"}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                opacity: "0.7",
                                                marginBottom: 22,
                                            }}
                                        >
                                            Batch {eligibilityData?.batch_name || "FSW-2024-07"} · {new Date().getFullYear()}
                                        </div>
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(4,1fr)",
                                                gap: 10,
                                                marginBottom: 22,
                                            }}
                                        >
                                            <div className="cumul-metric">
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        opacity: "0.65",
                                                        marginBottom: 4,
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: "0.05em",
                                                    }}
                                                >
                                                    Assignment
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 26,
                                                        fontWeight: 900,
                                                        color: "#60a5fa",
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {eligibilityData.assignment}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 9,
                                                        opacity: "0.55",
                                                    }}
                                                >
                                                    /100
                                                </div>
                                            </div>
                                            <div className="cumul-metric">
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        opacity: "0.65",
                                                        marginBottom: 4,
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: "0.05em",
                                                    }}
                                                >
                                                    Mini Project
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 26,
                                                        fontWeight: 900,
                                                        color: "#4ade80",
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {
                                                        eligibilityData.mini_project
                                                    }
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 9,
                                                        opacity: "0.55",
                                                    }}
                                                >
                                                    /100
                                                </div>
                                            </div>
                                            <div className="cumul-metric">
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        opacity: "0.65",
                                                        marginBottom: 4,
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: "0.05em",
                                                    }}
                                                >
                                                    Main Project
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 26,
                                                        fontWeight: 900,
                                                        color: "#a78bfa",
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {
                                                        eligibilityData.main_project
                                                    }
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 9,
                                                        opacity: "0.55",
                                                    }}
                                                >
                                                    /100
                                                </div>
                                            </div>
                                            <div className="cumul-metric">
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        opacity: "0.65",
                                                        marginBottom: 4,
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: "0.05em",
                                                    }}
                                                >
                                                    Eval Test
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 26,
                                                        fontWeight: 900,
                                                        color: "#f9a8d4",
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {Math.round(evalSubmitResult?.percentage || 0)}%
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 9,
                                                        opacity: "0.55",
                                                    }}
                                                >
                                                    {evaluationDetails?.questions?.length || 15} Qs
                                                </div>
                                            </div>
                                        </div>
                                        {/* Big cumulative score ring */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 24,
                                                flexWrap: "wrap",
                                                marginBottom: 22,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    background:
                                                        "rgba(255,255,255,0.08)",
                                                    border: "2px solid rgba(255,255,255,0.15)",
                                                    borderRadius: 16,
                                                    padding: "20px 28px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        opacity: "0.7",
                                                        marginBottom: 6,
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: "0.08em",
                                                    }}
                                                >
                                                    Cumulative Score
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 56,
                                                        fontWeight: 900,
                                                        lineHeight: 1,
                                                        color: "#4ade80",
                                                    }}
                                                >
                                                    {cumulativeScore}%
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        opacity: "0.7",
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    (Eligibility {Math.round(eligibilityData?.overall_score || 0)}% + Test {Math.round(evalSubmitResult?.percentage || 0)}%) ÷ 2
                                                </div>
                                                <div
                                                    style={{
                                                        height: 8,
                                                        background:
                                                            "rgba(255,255,255,0.15)",
                                                        borderRadius: 99,
                                                        overflow: "hidden",
                                                        margin: "10px 0 6px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${cumulativeScore}%`,
                                                            height: "100%",
                                                            background:
                                                                "linear-gradient(90deg,#4ade80,#22d3ee)",
                                                            borderRadius: 99,
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        background:
                                                            "rgba(74,222,128,0.25)",
                                                        border: "1px solid rgba(74,222,128,0.4)",
                                                        borderRadius: 10,
                                                        padding: "6px 14px",
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 800,
                                                            color: "#4ade80",
                                                        }}
                                                    >
                                                        🏆 WELL PERFORMED
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Performance badge */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                gap: 10,
                                                flexWrap: "wrap",
                                                marginBottom: 22,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background:
                                                        "rgba(255,255,255,0.1)",
                                                    borderRadius: 10,
                                                    padding: "8px 14px",
                                                    fontSize: 10,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Excellent
                                                </div>
                                                Project Quality
                                            </div>
                                            <div
                                                style={{
                                                    background:
                                                        "rgba(255,255,255,0.1)",
                                                    borderRadius: 10,
                                                    padding: "8px 14px",
                                                    fontSize: 10,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    {
                                                        eligibilityData.assignment_submission_rate
                                                    }
                                                    %
                                                </div>
                                                Submissions
                                            </div>
                                            <div
                                                style={{
                                                    background:
                                                        "rgba(255,255,255,0.1)",
                                                    borderRadius: 10,
                                                    padding: "8px 14px",
                                                    fontSize: 10,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    {
                                                        eligibilityData.class_attendance
                                                    }
                                                    %
                                                </div>
                                                Attendance
                                            </div>
                                            <div
                                                style={{
                                                    background:
                                                        "rgba(74,222,128,0.2)",
                                                    border: "1px solid rgba(74,222,128,0.4)",
                                                    borderRadius: 10,
                                                    padding: "8px 14px",
                                                    fontSize: 10,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                        color: "#4ade80",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    PASS ✅
                                                </div>
                                                Eval Test
                                            </div>
                                        </div>
                                        <button
                                            style={{
                                                background:
                                                    "linear-gradient(135deg,#f59e0b,#d97706)",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 12,
                                                padding: "14px 36px",
                                                fontSize: 15,
                                                fontWeight: 800,
                                                cursor: "pointer",
                                                fontFamily:
                                                    '"Outfit",sans-serif',
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 10,
                                                boxShadow:
                                                    "0 4px 20px rgba(245,158,11,0.35)",
                                            }}
                                        >
                                            🚀 Unlock Placement Tab
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* /plt-content-eval */}
                        {/* ══════════════════════════════════════════════════
       PLACEMENT TAB
  ══════════════════════════════════════════════════ */}
                        <div
                            id="plt-content-placement"
                            style={{ display: activeMainTab === "placement" ? "block" : "none" }}
                        >
                            {/* Locked overlay shown before unlock */}
                            <div
                                id="placement-locked-overlay"
                                style={{
                                    display: !isPlacementUnlocked ? "block" : "none",
                                    background: "#f8faff",
                                    border: "2px dashed var(--bd)",
                                    borderRadius: 16,
                                    padding: "48px 24px",
                                    textAlign: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <div style={{ fontSize: 56, marginBottom: 14 }}>
                                    🔒
                                </div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: "var(--p)",
                                        marginBottom: 6,
                                    }}
                                >
                                    Placement Tab Locked
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "var(--mu)",
                                        maxWidth: 340,
                                        margin: "0 auto 20px",
                                        lineHeight: "1.7",
                                    }}
                                >
                                    Complete the Evaluation tab and achieve a
                                    good cumulative score to unlock your 10-day
                                    placement program.
                                </div>
                                <button
                                    style={{
                                        background:
                                            "linear-gradient(135deg,var(--p),#1a3a6b)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 10,
                                        padding: "11px 26px",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontFamily: '"Outfit",sans-serif',
                                    }}
                                >
                                    Go to Evaluation →
                                </button>
                            </div>
                            {/* Actual placement content (hidden until unlock) */}
                            <div
                                id="placement-unlocked-content"
                                style={{ display: isPlacementUnlocked ? "block" : "none" }}
                            >
                                {/* Placement step pills */}
                                <div className="eval-step-pills">
                                    <div
                                        className={`eval-pill ${activePlacementStep === 1 ? 'active' : ''}`}
                                        onClick={() => setActivePlacementStep(1)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span>⚡</span> 10-Day Classes
                                    </div>
                                    <div
                                        className={`eval-pill ${activePlacementStep === 2 ? 'active' : ''} ${(() => {
                                            const validClasses = placementClasses.filter(cls => cls.video_path || cls.video_url || cls.video);
                                            const allVideosCompleted = validClasses.length > 0 && validClasses.every(cls => videoProgress[cls.id]);
                                            const daysWithQuizzes = [...new Set(placementClasses.filter(c => c.questions && c.questions.length > 0).map(c => c.day))];
                                            const allQuizzesCompleted = daysWithQuizzes.length === 0 || daysWithQuizzes.every(day => quizProgress[day]);
                                            return !(allVideosCompleted && allQuizzesCompleted);
                                        })() ? 'locked' : ''}`}
                                        onClick={() => {
                                            const validClasses = placementClasses.filter(cls => cls.video_path || cls.video_url || cls.video);
                                            const allVideosCompleted = validClasses.length > 0 && validClasses.every(cls => videoProgress[cls.id]);
                                            const daysWithQuizzes = [...new Set(placementClasses.filter(c => c.questions && c.questions.length > 0).map(c => c.day))];
                                            const allQuizzesCompleted = daysWithQuizzes.length === 0 || daysWithQuizzes.every(day => quizProgress[day]);
                                            if (allVideosCompleted && allQuizzesCompleted) setActivePlacementStep(2);
                                        }}
                                        style={{
                                            cursor: (() => {
                                                const validClasses = placementClasses.filter(cls => cls.video_path || cls.video_url || cls.video);
                                                const allVideosCompleted = validClasses.length > 0 && validClasses.every(cls => videoProgress[cls.id]);
                                                const daysWithQuizzes = [...new Set(placementClasses.filter(c => c.questions && c.questions.length > 0).map(c => c.day))];
                                                const allQuizzesCompleted = daysWithQuizzes.length === 0 || daysWithQuizzes.every(day => quizProgress[day]);
                                                return (allVideosCompleted && allQuizzesCompleted) ? 'pointer' : 'not-allowed';
                                            })()
                                        }}
                                    >
                                        <span>{(() => {
                                            const validClasses = placementClasses.filter(cls => cls.video_path || cls.video_url || cls.video);
                                            const allVideosCompleted = validClasses.length > 0 && validClasses.every(cls => videoProgress[cls.id]);
                                            const daysWithQuizzes = [...new Set(placementClasses.filter(c => c.questions && c.questions.length > 0).map(c => c.day))];
                                            const allQuizzesCompleted = daysWithQuizzes.length === 0 || daysWithQuizzes.every(day => quizProgress[day]);
                                            return !(allVideosCompleted && allQuizzesCompleted);
                                        })() ? '🔒' : '🏆'}</span> Build Profile
                                    </div>
                                </div>
                                {/* ─── PLACEMENT STEP 1: 10-DAY CLASSES ─── */}
                                <div id="pstep-1" style={{ display: activePlacementStep === 1 ? 'block' : 'none', marginTop: 24 }}>

                                    {/* Helper Functions scoped inside component render */}
                                    {(() => {
                                        const getClassesForDay = (day) => {
                                            return placementClasses.filter(c => c.day === day);
                                        };
                                        const getQuestionsForDay = (day) => {
                                            const dayClasses = getClassesForDay(day);
                                            let qs = [];
                                            dayClasses.forEach(c => {
                                                if (c.questions) {
                                                    qs = [...qs, ...c.questions];
                                                }
                                            });
                                            return qs;
                                        };

                                        const activeClasses = getClassesForDay(activePlacementDay);
                                        const activeQuestions = getQuestionsForDay(activePlacementDay);
                                        const firstClass = activeClasses[0];

                                        const isDayAccessible = (day) => {
                                            if (day === 1) return true;
                                            const prevDay = day - 1;
                                            const prevDayClasses = getClassesForDay(prevDay);

                                            // Ensure there are classes for prev day to avoid locking forever if no classes exist
                                            if (prevDayClasses.length === 0 && day <= Math.max(...placementClasses.map(c => c.day), 1)) return true;

                                            const allVideosDone = prevDayClasses.every(c => videoProgress[c.id]);
                                            const prevDayQuestions = getQuestionsForDay(prevDay);
                                            const quizDone = prevDayQuestions.length === 0 || quizProgress[prevDay];

                                            return allVideosDone && quizDone;
                                        };

                                        return (
                                            <>
                                                {/* Day Timeline */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, paddingBottom: 10, marginBottom: 24 }}>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => {
                                                        const isAccessible = isDayAccessible(day);
                                                        const isActive = activePlacementDay === day;
                                                        const isCompleted = isAccessible && day < activePlacementDay;

                                                        return (
                                                            <div
                                                                key={day}
                                                                onClick={() => isAccessible && setActivePlacementDay(day)}
                                                                style={{
                                                                    padding: '12px 8px',
                                                                    borderRadius: 8,
                                                                    border: isActive ? '2px solid #3b82f6' : (isCompleted ? '1px solid #10b981' : '1px solid #e2e8f0'),
                                                                    background: isActive ? '#eff6ff' : (isCompleted ? '#ecfdf5' : '#f8fafc'),
                                                                    cursor: isAccessible ? 'pointer' : 'not-allowed',
                                                                    textAlign: 'center',
                                                                    opacity: isAccessible ? 1 : 0.6
                                                                }}
                                                            >
                                                                <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#1d4ed8' : (isCompleted ? '#047857' : '#94a3b8') }}>
                                                                    Day {day}
                                                                </div>
                                                                {isCompleted && <div style={{ fontSize: 18, marginTop: 4 }}>✅</div>}
                                                                {isActive && <div style={{ fontSize: 18, marginTop: 4 }}>⚡</div>}
                                                                {!isAccessible && <div style={{ fontSize: 18, marginTop: 4 }}>🔒</div>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Live Session Details */}
                                                <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)', borderRadius: 12, padding: 24, color: '#fff', marginBottom: 24 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, color: '#93c5fd' }}>
                                                        ⚡ Today — Day {activePlacementDay} • Live Session
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                                                        <div>
                                                            <h3 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 700 }}>
                                                                {firstClass ? firstClass.title : `Day ${activePlacementDay} Session`}
                                                            </h3>
                                                            <div style={{ fontSize: 14, color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                                <span>🕒 3:00 PM - 90 mins</span>
                                                                <span>👨‍🏫 Instructor</span>
                                                                <span>🌐 Google Meet</span>
                                                            </div>
                                                        </div>
                                                        <button style={{ background: '#fff', color: '#1d4ed8', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                                                            🚀 Join Live →
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Video Resources */}
                                                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    📺 Day {activePlacementDay} — Video Resources
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
                                                    {activeClasses.map((cls, index) => {
                                                        const isVideoAccessible = () => {
                                                            if (index === 0) return true;
                                                            const prevCls = activeClasses[index - 1];
                                                            return videoProgress[prevCls.id];
                                                        };
                                                        const accessible = isVideoAccessible();

                                                        return (
                                                            <div key={cls.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative', opacity: accessible ? 1 : 0.5 }}>
                                                                {!accessible && (
                                                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 8 }}>
                                                                        <span style={{ fontSize: 24 }}>🔒</span>
                                                                        <span style={{ fontSize: 12, fontWeight: 700 }}>Finish previous video to unlock</span>
                                                                    </div>
                                                                )}
                                                                <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
                                                                    {cls.video_path ? (
                                                                        <video
                                                                            src={cls.video}
                                                                            controls={accessible}
                                                                            onTimeUpdate={(e) => {
                                                                                if (videoProgress[cls.id]) return; // already completed

                                                                                const currentTime = e.target.currentTime;
                                                                                const duration = e.target.duration;
                                                                                if (!duration) return;

                                                                                setVideoWatchTime(prev => {
                                                                                    const lastTime = prev[cls.id]?.lastTime || 0;
                                                                                    const accumulated = prev[cls.id]?.accumulated || 0;

                                                                                    // If time difference is within 2 seconds (normal playback, no huge skip)
                                                                                    let newAccumulated = accumulated;
                                                                                    if (currentTime - lastTime > 0 && currentTime - lastTime < 2) {
                                                                                        newAccumulated += (currentTime - lastTime);
                                                                                    }

                                                                                    if (newAccumulated / duration >= 0.8) {
                                                                                        markVideoCompleted(cls.id);
                                                                                    }

                                                                                    return {
                                                                                        ...prev,
                                                                                        [cls.id]: {
                                                                                            lastTime: currentTime,
                                                                                            accumulated: newAccumulated
                                                                                        }
                                                                                    };
                                                                                });
                                                                            }}
                                                                            style={{ width: '100%', height: '100%', display: 'block' }}
                                                                        />
                                                                    ) : (
                                                                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                                                            <iframe width="100%" height="100%" src={cls.video} title={cls.title} frameBorder="0" allowFullScreen style={{ pointerEvents: accessible ? 'auto' : 'none' }}></iframe>
                                                                            {accessible && !videoProgress[cls.id] && (
                                                                                <button
                                                                                    onClick={() => markVideoCompleted(cls.id)}
                                                                                    style={{ position: 'absolute', bottom: 10, right: 10, background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', zIndex: 20 }}
                                                                                >
                                                                                    Mark as Watched ✅
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{cls.title}</div>
                                                                    {videoProgress[cls.id] && <span style={{ color: '#10b981', fontSize: 16 }}>✅</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {activeClasses.length === 0 && (
                                                        <div style={{ padding: 20, color: '#64748b', fontStyle: 'italic', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>No videos available for this day.</div>
                                                    )}
                                                </div>

                                                {/* Practice Questions */}
                                                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    🧩 Day {activePlacementDay} — Practice Questions
                                                </h4>
                                                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                                                    {activeQuestions.length === 0 ? (
                                                        <div style={{ color: '#64748b' }}>No practice questions available for this day.</div>
                                                    ) : (
                                                        activeQuestions.map((q, i) => (
                                                            <div key={q.id} style={{ marginBottom: i < activeQuestions.length - 1 ? 24 : 0, paddingBottom: i < activeQuestions.length - 1 ? 24 : 0, borderBottom: i < activeQuestions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Q{i + 1} • MCQ</span>
                                                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{q.marks} Marks</span>
                                                                </div>
                                                                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{q.question}</div>

                                                                {quizProgress[activePlacementDay] && quizAnswers[q.id] && (
                                                                    <div style={{
                                                                        marginBottom: 16, fontSize: 13, fontWeight: 700, padding: '8px 12px', borderRadius: 8, ...(() => {
                                                                            const selectedOptId = quizAnswers[q.id];
                                                                            const selectedOpt = q.options?.find(o => o.id === selectedOptId);
                                                                            if (selectedOpt?.is_correct) {
                                                                                return { background: '#ecfdf5', color: '#047857', border: '1px solid #10b981' };
                                                                            } else {
                                                                                return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #ef4444' };
                                                                            }
                                                                        })()
                                                                    }}>
                                                                        {(() => {
                                                                            const selectedOptId = quizAnswers[q.id];
                                                                            const selectedOpt = q.options?.find(o => o.id === selectedOptId);
                                                                            return selectedOpt?.is_correct ? '✅ Your answer is Correct!' : '❌ Your answer is Incorrect';
                                                                        })()}
                                                                    </div>
                                                                )}

                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                    {q.options && q.options.map(opt => {
                                                                        const isSelected = quizAnswers[q.id] === opt.id;
                                                                        const isSubmitted = quizProgress[activePlacementDay];

                                                                        let optBg = '#f8fafc';
                                                                        let optBorder = '1px solid #e2e8f0';
                                                                        if (isSubmitted) {
                                                                            if (opt.is_correct) {
                                                                                optBg = '#ecfdf5';
                                                                                optBorder = '1px solid #10b981';
                                                                            } else if (isSelected && !opt.is_correct) {
                                                                                optBg = '#fef2f2';
                                                                                optBorder = '1px solid #ef4444';
                                                                            }
                                                                        } else if (isSelected) {
                                                                            optBg = '#eff6ff';
                                                                            optBorder = '1px solid #3b82f6';
                                                                        }

                                                                        return (
                                                                            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: optBorder, borderRadius: 8, cursor: isSubmitted ? 'default' : 'pointer', background: optBg }}>
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`q_${q.id}`}
                                                                                    value={opt.id}
                                                                                    checked={isSelected}
                                                                                    onChange={() => handlePracticeAnswerChange(q.id, opt.id)}
                                                                                    disabled={isSubmitted}
                                                                                />
                                                                                <span style={{ fontSize: 14 }}>{opt.option}</span>
                                                                                {isSubmitted && !!opt.is_correct && <span style={{ marginLeft: 'auto', color: '#10b981' }}>✔️</span>}
                                                                                {isSubmitted && isSelected && !opt.is_correct && <span style={{ marginLeft: 'auto', color: '#ef4444' }}>❌</span>}
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                    {activeQuestions.length > 0 && (
                                                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                                                            {quizProgress[activePlacementDay] ? (
                                                                <button disabled style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: 'not-allowed' }}>
                                                                    Completed ✅
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => submitQuizForDay(activePlacementDay)} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                                                                    Submit Day {activePlacementDay} Practice ✔
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}

                                    {/* 10 Days Done -> Build Profile Button */}
                                    {(() => {
                                        const validClasses = placementClasses.filter(cls => cls.video_path || cls.video_url || cls.video);
                                        const allVideosCompleted = validClasses.length > 0 && validClasses.every(cls => videoProgress[cls.id]);
                                        const daysWithQuizzes = [...new Set(placementClasses.filter(c => c.questions && c.questions.length > 0).map(c => c.day))];
                                        const allQuizzesCompleted = daysWithQuizzes.length === 0 || daysWithQuizzes.every(day => quizProgress[day]);
                                        const isBuildProfileEnabled = allVideosCompleted && allQuizzesCompleted;

                                        return (
                                            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                                                <button
                                                    disabled={!isBuildProfileEnabled}
                                                    onClick={() => setActivePlacementStep(2)}
                                                    style={{
                                                        background: isBuildProfileEnabled ? '#1e3a8a' : '#94a3b8',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '12px 32px',
                                                        borderRadius: 8,
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                        cursor: isBuildProfileEnabled ? 'pointer' : 'not-allowed',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    {isBuildProfileEnabled ? 'All 10 Days Done → Build Profile 🏆' : 'Complete all videos & quizzes to Build Profile 🔒'}
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                                {/* /pstep-1 */}
                                {/* ─── PLACEMENT STEP 2: BUILD PROFILE ─── */}
                                <div id="pstep-2" style={{ display: activePlacementStep === 2 ? "block" : "none" }}>
                                    <div
                                        style={{
                                            background: "#fff",
                                            border: "1px solid var(--bd)",
                                            borderRadius: 16,
                                            padding: 22,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: 20,
                                                flexWrap: "wrap",
                                                gap: 8,
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: 700,
                                                        color: "var(--p)",
                                                    }}
                                                >
                                                    🏆 Build Your Profile
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--mu)",
                                                        marginTop: 3,
                                                    }}
                                                >
                                                    Upload documents · Staff
                                                    evaluates · Get all Verified
                                                    to become Placement Ready
                                                </div>
                                            </div>
                                            <span
                                                id="profile-overall-tag"
                                                style={{
                                                    background: "#fef3c7",
                                                    color: "#92400e",
                                                    padding: "5px 14px",
                                                    borderRadius: 20,
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    border: "1.5px solid #fcd34d",
                                                }}
                                            >
                                                ⏳ Under Review
                                            </span>
                                        </div>
                                        {/* Document Upload Grid */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(2,1fr)",
                                                gap: 14,
                                                marginBottom: 22,
                                            }}
                                        >
                                            {/* Resume */}
                                            <div
                                                className="doc-card"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#f0f9ff,#dbeafe)",
                                                    border: "1.5px solid #7dd3fc",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            background:
                                                                "linear-gradient(135deg,#0284c7,#38bdf8)",
                                                            borderRadius: 9,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 16,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        📄
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: "var(--p)",
                                                            }}
                                                        >
                                                            Resume
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "var(--mu)",
                                                            }}
                                                        >
                                                            PDF · Max 2MB
                                                        </div>
                                                    </div>
                                                    <span
                                                        id="dtag-resume"
                                                        className={`doc-status-tag ${profileData?.resume_status === 'verified' ? 'dst-verified' : profileData?.resume_status === 'changes_needed' ? 'dst-changes' : 'dst-pending'}`}
                                                    >
                                                        {profileData?.resume_status === 'verified' ? '✅ Verified' : profileData?.resume_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        background: "#e0f2fe",
                                                        borderRadius: 7,
                                                        padding: 8,
                                                        marginBottom: 10,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <span
                                                        style={{ fontSize: 13 }}
                                                    >
                                                        📎
                                                    </span>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 600,
                                                                color: "#0284c7",
                                                                wordBreak: "break-all"
                                                            }}
                                                            id="doc-resume-name"
                                                        >
                                                            {resumeFile ? resumeFile.name : (profileData?.upload_resume ? profileData.upload_resume.split('/').pop() : 'No Resume Uploaded')}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 9,
                                                                color: "#0369a1",
                                                            }}
                                                        >
                                                            {profileData?.upload_resume ? 'Uploaded' : 'Action Required'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => document.getElementById('dr-input').click()}
                                                        disabled={profileData?.resume_status === 'verified'}
                                                        style={{
                                                            flex: 1,
                                                            background:
                                                                "transparent",
                                                            color: profileData?.resume_status === 'verified' ? '#9ca3af' : "#0284c7",
                                                            border: profileData?.resume_status === 'verified' ? "1.5px solid #d1d5db" : "1.5px solid #7dd3fc",
                                                            borderRadius: 7,
                                                            padding: 7,
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            cursor: profileData?.resume_status === 'verified' ? "not-allowed" : "pointer",
                                                            fontFamily:
                                                                '"Outfit",sans-serif',
                                                        }}
                                                    >
                                                        {profileData?.upload_resume ? '⬆ Re-upload' : '⬆ Upload'}
                                                    </button>
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            background:
                                                                "#0284c7",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 7,
                                                            padding: 7,
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            fontFamily:
                                                                '"Outfit",sans-serif',
                                                        }}
                                                    >
                                                        👁 View
                                                    </button>
                                                </div>
                                                <input
                                                    type="file"
                                                    id="dr-input"
                                                    accept=".pdf"
                                                    onChange={(e) => handleResumeUpload(e.target.files[0])}
                                                    style={{ display: "none" }}
                                                />
                                            </div>
                                            {/* Portfolio */}
                                            <div
                                                className="doc-card"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                                    border: eligibilityData.is_eligible
                                                        ? "1.5px solid #86efac"
                                                        : "1.5px solid #fca5a5",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            background:
                                                                "linear-gradient(135deg,#16a34a,#4ade80)",
                                                            borderRadius: 9,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 16,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        🌐
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: "var(--p)",
                                                            }}
                                                        >
                                                            Portfolio
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "var(--mu)",
                                                            }}
                                                        >
                                                            PDF or Live URL
                                                        </div>
                                                    </div>
                                                    <span
                                                        id="dtag-portfolio"
                                                        className={`doc-status-tag ${profileData?.portfolio_status === 'verified' ? 'dst-verified' : profileData?.portfolio_status === 'changes_needed' ? 'dst-changes' : 'dst-pending'}`}
                                                    >
                                                        {profileData?.portfolio_status === 'verified' ? '✅ Verified' : profileData?.portfolio_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        background: "#dcfce7",
                                                        borderRadius: 7,
                                                        padding: 8,
                                                        marginBottom: 10,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <span
                                                        style={{ fontSize: 13 }}
                                                    >
                                                        🔗
                                                    </span>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 600,
                                                                color: "#15803d",
                                                            }}
                                                            id="doc-portfolio-name"
                                                        >
                                                            {portfolioUrl || 'No URL Set'}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 9,
                                                                color: "#166534",
                                                            }}
                                                        >
                                                            {profileData?.portfolio_url ? 'Portfolio URL set' : 'Action Required'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <input
                                                    type="url"
                                                    id="portfolio-url-inp"
                                                    value={portfolioUrl}
                                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                                    disabled={profileData?.portfolio_status === 'verified'}
                                                    style={{
                                                        width: "100%",
                                                        padding: "7px 10px",
                                                        border: "1.5px solid #86efac",
                                                        borderRadius: 7,
                                                        fontSize: 11,
                                                        fontFamily:
                                                            '"Outfit",sans-serif',
                                                        outline: "none",
                                                        background: profileData?.portfolio_status === 'verified' ? '#f3f4f6' : "#fff",
                                                        marginBottom: 6,
                                                    }}
                                                />
                                                <button
                                                    onClick={savePortfolioUrl}
                                                    disabled={profileData?.portfolio_status === 'verified'}
                                                    style={{
                                                        width: "100%",
                                                        background: profileData?.portfolio_status === 'verified' ? '#9ca3af' : "#16a34a",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: 7,
                                                        padding: 7,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        cursor: profileData?.portfolio_status === 'verified' ? "not-allowed" : "pointer",
                                                        fontFamily:
                                                            '"Outfit",sans-serif',
                                                    }}
                                                >
                                                    Save URL
                                                </button>
                                            </div>
                                            {/* Final Project */}
                                            <div
                                                className="doc-card"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#faf5ff,#ede9fe)",
                                                    border: "1.5px solid #c4b5fd",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            background:
                                                                "linear-gradient(135deg,#7c3aed,#a78bfa)",
                                                            borderRadius: 9,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 16,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        🗂
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: "var(--p)",
                                                            }}
                                                        >
                                                            Project Docs
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "var(--mu)",
                                                            }}
                                                        >
                                                            PDF/ZIP · Max 10MB
                                                        </div>
                                                    </div>
                                                    <span
                                                        id="dtag-project"
                                                        className={`doc-status-tag ${profileData?.project_docs_status === 'verified' ? 'dst-verified' : profileData?.project_docs_status === 'changes_needed' ? 'dst-changes' : 'dst-pending'}`}
                                                    >
                                                        {profileData?.project_docs_status === 'verified' ? '✅ Verified' : profileData?.project_docs_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        background: "#ede9fe",
                                                        borderRadius: 7,
                                                        padding: 8,
                                                        marginBottom: 10,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <span
                                                        style={{ fontSize: 13 }}
                                                    >
                                                        📎
                                                    </span>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 600,
                                                                color: "#7c3aed",
                                                                wordBreak: "break-all"
                                                            }}
                                                            id="doc-proj-name"
                                                        >
                                                            {projectDocsFile ? projectDocsFile.name : (profileData?.upload_project_docs ? profileData.upload_project_docs.split('/').pop() : 'No Docs Uploaded')}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 9,
                                                                color: "#6d28d9",
                                                            }}
                                                        >
                                                            {profileData?.upload_project_docs ? 'Uploaded' : 'Action Required'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => document.getElementById('dp-input').click()}
                                                        disabled={profileData?.project_docs_status === 'verified'}
                                                        style={{
                                                            flex: 1,
                                                            background:
                                                                "transparent",
                                                            color: profileData?.project_docs_status === 'verified' ? '#9ca3af' : "#7c3aed",
                                                            border: profileData?.project_docs_status === 'verified' ? "1.5px solid #d1d5db" : "1.5px solid #c4b5fd",
                                                            borderRadius: 7,
                                                            padding: 7,
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            cursor: profileData?.project_docs_status === 'verified' ? "not-allowed" : "pointer",
                                                            fontFamily:
                                                                '"Outfit",sans-serif',
                                                        }}
                                                    >
                                                        {profileData?.upload_project_docs ? '⬆ Re-upload' : '⬆ Upload'}
                                                    </button>
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            background:
                                                                "#7c3aed",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 7,
                                                            padding: 7,
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            fontFamily:
                                                                '"Outfit",sans-serif',
                                                        }}
                                                    >
                                                        👁 View
                                                    </button>
                                                </div>
                                                <input
                                                    type="file"
                                                    id="dp-input"
                                                    accept=".pdf,.zip"
                                                    onChange={(e) => handleProjectDocsUpload(e.target.files[0])}
                                                    style={{ display: "none" }}
                                                />
                                            </div>
                                            {/* GitHub */}
                                            <div
                                                className="doc-card"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
                                                    border: "1.5px solid #cbd5e1",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            background:
                                                                "linear-gradient(135deg,#475569,#334155)",
                                                            borderRadius: 9,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 16,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <i className="bi bi-github" style={{ color: '#fff' }}></i>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: "var(--p)",
                                                            }}
                                                        >
                                                            GitHub
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "var(--mu)",
                                                            }}
                                                        >
                                                            Project Repository URL
                                                        </div>
                                                    </div>
                                                    <span
                                                        id="dtag-github"
                                                        className={`doc-status-tag ${profileData?.github_status === 'verified' ? 'dst-verified' : profileData?.github_status === 'changes_needed' ? 'dst-changes' : 'dst-pending'}`}
                                                    >
                                                        {profileData?.github_status === 'verified' ? '✅ Verified' : profileData?.github_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        background: "#cbd5e1",
                                                        borderRadius: 7,
                                                        padding: 8,
                                                        marginBottom: 10,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <span
                                                        style={{ fontSize: 13 }}
                                                    >
                                                        🔗
                                                    </span>
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 600,
                                                                color: "#334155",
                                                            }}
                                                            id="doc-github-name"
                                                        >
                                                            {githubUrl || 'No URL Set'}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 9,
                                                                color: "#475569",
                                                            }}
                                                        >
                                                            {profileData?.github_url ? 'GitHub URL set' : 'Action Required'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <input
                                                    type="url"
                                                    id="github-url-inp"
                                                    value={githubUrl}
                                                    onChange={(e) => setGithubUrl(e.target.value)}
                                                    disabled={profileData?.github_status === 'verified'}
                                                    style={{
                                                        width: "100%",
                                                        padding: "7px 10px",
                                                        border: "1.5px solid #94a3b8",
                                                        borderRadius: 7,
                                                        fontSize: 11,
                                                        fontFamily:
                                                            '"Outfit",sans-serif',
                                                        outline: "none",
                                                        background: profileData?.github_status === 'verified' ? '#f3f4f6' : "#fff",
                                                        marginBottom: 6,
                                                    }}
                                                />
                                                <button
                                                    onClick={saveGithubUrl}
                                                    disabled={profileData?.github_status === 'verified'}
                                                    style={{
                                                        width: "100%",
                                                        background: profileData?.github_status === 'verified' ? '#9ca3af' : "#475569",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: 7,
                                                        padding: 7,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        cursor: profileData?.github_status === 'verified' ? "not-allowed" : "pointer",
                                                        fontFamily:
                                                            '"Outfit",sans-serif',
                                                    }}
                                                >
                                                    Save URL
                                                </button>
                                            </div>
                                        </div>
                                        {/* /doc grid */}
                                        {/* Staff Feedback */}
                                        <div
                                            style={{
                                                display: 'block',
                                                background: "#f8faff",
                                                border: "1px solid var(--bd)",
                                                borderRadius: 13,
                                                padding: 18,
                                                marginBottom: 18,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 12,
                                                    marginBottom: 16,
                                                    background: "#fff",
                                                    border: "1px solid var(--bd)",
                                                    borderRadius: 10,
                                                    padding: "12px 16px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "50%",
                                                        background:
                                                            "linear-gradient(135deg,#4f46e5,#7c3aed)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 18,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    👩‍💼
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            color: "var(--p)",
                                                        }}
                                                    >
                                                        Ms. Deepa Krishnan —
                                                        Placement Evaluator
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "var(--mu)",
                                                            marginTop: 1,
                                                        }}
                                                    >
                                                        Reviewed: May 12, 2025 ·
                                                        10:00 AM
                                                    </div>
                                                </div>
                                                <span
                                                    id="fb-overall-chip"
                                                    style={{
                                                        background: profileData?.overall_status === 'all_verified' ? "#dcfce7" : "#fef3c7",
                                                        color: profileData?.overall_status === 'all_verified' ? "#166534" : "#92400e",
                                                        fontSize: 11,
                                                        fontWeight: 800,
                                                        padding: "5px 13px",
                                                        borderRadius: 20,
                                                        border: profileData?.overall_status === 'all_verified' ? "1.5px solid #86efac" : "1.5px solid #fcd34d",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {profileData?.overall_status === 'all_verified' ? "✅ All Verified" : "⏳ In Progress"}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    color: "var(--p)",
                                                    marginBottom: 10,
                                                }}
                                            >
                                                📝 Document-wise Feedback
                                            </div>
                                            <div className={`fb-row ${profileData?.resume_status === 'verified' ? 'fb-verified' : profileData?.resume_status === 'changes_needed' ? 'fb-changes' : ''}`}>
                                                <div
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}
                                                >
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: profileData?.resume_status === 'verified' ? '#166534' : profileData?.resume_status === 'changes_needed' ? '#dc2626' : '#9ca3af' }}>
                                                        📄 Resume
                                                    </span>
                                                    <span style={{ background: profileData?.resume_status === 'verified' ? '#dcfce7' : profileData?.resume_status === 'changes_needed' ? '#fee2e2' : '#f3f4f6', color: profileData?.resume_status === 'verified' ? '#166534' : profileData?.resume_status === 'changes_needed' ? '#dc2626' : '#6b7280', fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, border: profileData?.resume_status === 'verified' ? '1px solid #86efac' : profileData?.resume_status === 'changes_needed' ? '1px solid #fca5a5' : '1px solid #d1d5db' }}>
                                                        {profileData?.resume_status === 'verified' ? '✅ Verified' : profileData?.resume_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "#374151", lineHeight: "1.7" }}>
                                                    {profileData?.resume_feedback || (profileData?.upload_resume ? 'Waiting for evaluator feedback.' : 'Please upload your resume to get feedback.')}
                                                </div>
                                            </div>
                                            <div className={`fb-row ${profileData?.portfolio_status === 'verified' ? 'fb-verified' : profileData?.portfolio_status === 'changes_needed' ? 'fb-changes' : ''}`}>
                                                <div
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}
                                                >
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: profileData?.portfolio_status === 'verified' ? '#166534' : profileData?.portfolio_status === 'changes_needed' ? '#dc2626' : '#9ca3af' }}>
                                                        🌐 Portfolio
                                                    </span>
                                                    <span style={{ background: profileData?.portfolio_status === 'verified' ? '#dcfce7' : profileData?.portfolio_status === 'changes_needed' ? '#fee2e2' : '#f3f4f6', color: profileData?.portfolio_status === 'verified' ? '#166534' : profileData?.portfolio_status === 'changes_needed' ? '#dc2626' : '#6b7280', fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, border: profileData?.portfolio_status === 'verified' ? '1px solid #86efac' : profileData?.portfolio_status === 'changes_needed' ? '1px solid #fca5a5' : '1px solid #d1d5db' }}>
                                                        {profileData?.portfolio_status === 'verified' ? '✅ Verified' : profileData?.portfolio_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "#374151", lineHeight: "1.7" }}>
                                                    {profileData?.portfolio_feedback || (profileData?.portfolio_url ? 'Waiting for evaluator feedback.' : 'Please add your portfolio URL to get feedback.')}
                                                </div>
                                            </div>
                                            <div className={`fb-row ${profileData?.project_docs_status === 'verified' ? 'fb-verified' : profileData?.project_docs_status === 'changes_needed' ? 'fb-changes' : ''}`}>
                                                <div
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}
                                                >
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: profileData?.project_docs_status === 'verified' ? '#166534' : profileData?.project_docs_status === 'changes_needed' ? '#dc2626' : '#9ca3af' }}>
                                                        🗂 Project Docs
                                                    </span>
                                                    <span style={{ background: profileData?.project_docs_status === 'verified' ? '#dcfce7' : profileData?.project_docs_status === 'changes_needed' ? '#fee2e2' : '#f3f4f6', color: profileData?.project_docs_status === 'verified' ? '#166534' : profileData?.project_docs_status === 'changes_needed' ? '#dc2626' : '#6b7280', fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, border: profileData?.project_docs_status === 'verified' ? '1px solid #86efac' : profileData?.project_docs_status === 'changes_needed' ? '1px solid #fca5a5' : '1px solid #d1d5db' }}>
                                                        {profileData?.project_docs_status === 'verified' ? '✅ Verified' : profileData?.project_docs_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "#374151", lineHeight: "1.7" }}>
                                                    {profileData?.project_docs_feedback || (profileData?.upload_project_docs ? 'Waiting for evaluator feedback.' : 'Please upload your project docs to get feedback.')}
                                                </div>
                                            </div>
                                            <div className={`fb-row ${profileData?.github_status === 'verified' ? 'fb-verified' : profileData?.github_status === 'changes_needed' ? 'fb-changes' : ''}`} style={{ marginBottom: 0 }}>
                                                <div
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}
                                                >
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: profileData?.github_status === 'verified' ? '#166534' : profileData?.github_status === 'changes_needed' ? '#dc2626' : '#9ca3af' }}>
                                                        <i className="bi bi-github" style={{ marginRight: 4 }}></i> GitHub
                                                    </span>
                                                    <span style={{ background: profileData?.github_status === 'verified' ? '#dcfce7' : profileData?.github_status === 'changes_needed' ? '#fee2e2' : '#f3f4f6', color: profileData?.github_status === 'verified' ? '#166534' : profileData?.github_status === 'changes_needed' ? '#dc2626' : '#6b7280', fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, border: profileData?.github_status === 'verified' ? '1px solid #86efac' : profileData?.github_status === 'changes_needed' ? '1px solid #fca5a5' : '1px solid #d1d5db' }}>
                                                        {profileData?.github_status === 'verified' ? '✅ Verified' : profileData?.github_status === 'changes_needed' ? '⚠ Changes Needed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "#374151", lineHeight: "1.7" }}>
                                                    {profileData?.github_feedback || (profileData?.github_url ? 'Waiting for evaluator feedback.' : 'Please add your GitHub link to get feedback.')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* VERIFIED state (demo toggle) */}
                                        <div
                                            id="profile-verified-block"
                                            style={{ display: demoAllVerified ? 'block' : 'none' }}
                                        >
                                            <div
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#052e16,#064e3b,#065f46)",
                                                    borderRadius: 18,
                                                    padding: "32px 24px",
                                                    textAlign: "center",
                                                    color: "#fff",
                                                    position: "relative",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        opacity: "0.04",
                                                        background:
                                                            "repeating-linear-gradient(45deg,#fff,#fff 2px,transparent 2px,transparent 18px)",
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        position: "relative",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 60,
                                                            marginBottom: 12,
                                                            animation:
                                                                "bounce 1s infinite alternate",
                                                        }}
                                                    >
                                                        🎉
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 26,
                                                            fontWeight: 900,
                                                            marginBottom: 6,
                                                        }}
                                                    >
                                                        Congratulations, Arjun!
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 15,
                                                            fontWeight: 700,
                                                            color: "#6ee7b7",
                                                            marginBottom: 6,
                                                        }}
                                                    >
                                                        You are officially{" "}
                                                        <span
                                                            style={{
                                                                color: "#4ade80",
                                                                fontSize: 20,
                                                                fontWeight: 900,
                                                            }}
                                                        >
                                                            PLACEMENT READY
                                                        </span>{" "}
                                                        🏆
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            opacity: "0.75",
                                                            maxWidth: 380,
                                                            margin: "0 auto 24px",
                                                            lineHeight: "1.8",
                                                        }}
                                                    >
                                                        All your documents have
                                                        been verified by the
                                                        placement team. You are
                                                        eligible to appear for
                                                        placement drives!
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            gap: 10,
                                                            flexWrap: "wrap",
                                                            marginBottom: 24,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                background:
                                                                    "rgba(255,255,255,0.12)",
                                                                borderRadius: 12,
                                                                padding:
                                                                    "12px 18px",
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight: 900,
                                                                    color: "#4ade80",
                                                                }}
                                                            >
                                                                84.3%
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    opacity:
                                                                        "0.7",
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                Eligibility
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                background:
                                                                    "rgba(255,255,255,0.12)",
                                                                borderRadius: 12,
                                                                padding:
                                                                    "12px 18px",
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight: 900,
                                                                    color: "#60a5fa",
                                                                }}
                                                            >
                                                                73%
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    opacity:
                                                                        "0.7",
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                Eval Test
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                background:
                                                                    "rgba(255,255,255,0.12)",
                                                                borderRadius: 12,
                                                                padding:
                                                                    "12px 18px",
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight: 900,
                                                                    color: "#f9a8d4",
                                                                }}
                                                            >
                                                                82.1%
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    opacity:
                                                                        "0.7",
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                Cumulative
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                background:
                                                                    "rgba(255,255,255,0.12)",
                                                                borderRadius: 12,
                                                                padding:
                                                                    "12px 18px",
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight: 900,
                                                                    color: "#fde68a",
                                                                }}
                                                            >
                                                                10/10
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    opacity:
                                                                        "0.7",
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                Days Done
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                background:
                                                                    "rgba(74,222,128,0.2)",
                                                                border: "1px solid rgba(74,222,128,0.4)",
                                                                borderRadius: 12,
                                                                padding:
                                                                    "12px 18px",
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 20,
                                                                    fontWeight: 900,
                                                                    color: "#4ade80",
                                                                }}
                                                            >
                                                                ✅ All
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    opacity:
                                                                        "0.7",
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                Verified
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        style={{
                                                            background:
                                                                "linear-gradient(135deg,#f59e0b,#d97706)",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 12,
                                                            padding:
                                                                "14px 36px",
                                                            fontSize: 14,
                                                            fontWeight: 800,
                                                            cursor: "pointer",
                                                            fontFamily:
                                                                '"Outfit",sans-serif',
                                                            boxShadow:
                                                                "0 4px 20px rgba(245,158,11,0.4)",
                                                        }}
                                                    >
                                                        🚀 Browse Placement
                                                        Drives →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Demo toggle */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                marginTop: 14,
                                            }}
                                        >
                                            <button
                                                onClick={() => setDemoAllVerified(!demoAllVerified)}
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg,#16a34a,#059669)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 10,
                                                    padding: "10px 24px",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                    fontFamily:
                                                        '"Outfit",sans-serif',
                                                }}
                                            >
                                                Demo: Toggle All Verified State
                                                🎉
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* /pstep-2 */}
                            </div>
                            {/* /placement-unlocked-content */}
                        </div>
                        {/* /plt-content-placement */}
                    </div>
                    {/* /live-sec-placement */}
                </div>
            </div>
        </div>
    );
};

export default Placement;
