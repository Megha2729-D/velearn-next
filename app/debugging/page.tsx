"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn.in/assets/images/";

interface Challenge {
    id?: number;
    language: string;
    level: string;
    icon: string;
    description?: string;
    title?: string;
    details?: string;
    subtitle?: string;
    status: string;
    questions: number;
    total: number;
    submissions: number;
}

interface SolvedLocal {
    [key: string]: number[];
}

interface SubmissionCounts {
    [key: string]: number;
}

export default function Debugging() {
    const [visible, setVisible] = useState<number>(9);
    const [selectedLanguage, setSelectedLanguage] =
        useState<string>("All");

    const [selectedLevel, setSelectedLevel] =
        useState<string>("All");

    const [search, setSearch] = useState<string>("");

    const [challenges, setChallenges] = useState<
        Challenge[]
    >([]);

    const [isLoading, setIsLoading] =
        useState<boolean>(true);

    const [solvedInLocal, setSolvedInLocal] =
        useState<SolvedLocal>({});

    const [submissionCounts, setSubmissionCounts] =
        useState<SubmissionCounts>({});

    // ==========================
    // Lifecycle
    // ==========================

    useEffect(() => {
        fetchDebuggingGroups();
        loadLocalProgress();

        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    // ==========================
    // Local Progress
    // ==========================

    const loadLocalProgress = (): void => {
        const solved = JSON.parse(
            localStorage.getItem(
                "velearn_solved_problems"
            ) || "{}"
        );

        const submissions = JSON.parse(
            localStorage.getItem(
                "velearn_submission_counts"
            ) || "{}"
        );

        setSolvedInLocal(solved);
        setSubmissionCounts(submissions);
    };

    // ==========================
    // API
    // ==========================

    const fetchDebuggingGroups = async (): Promise<void> => {
        try {
            const url = `${BASE_API_URL}debugging-groups`;

            console.log("Fetching:", url);

            const response = await fetch(url);

            const text = await response.text();

            console.log("Raw Response:", text);

            try {
                const json = JSON.parse(text);

                console.log("Parsed JSON:", json);

                if (json.status) {
                    setChallenges(json.data || []);
                } else {
                    setChallenges([]);
                }
            } catch (jsonError) {
                console.error(
                    "API did not return JSON. Response was:",
                    text
                );

                setChallenges([]);
            }
        } catch (error) {
            console.error(
                "Error fetching debugging groups:",
                error
            );

            setChallenges([]);
        } finally {
            setIsLoading(false);
        }
    };
    // ==========================
    // Helpers
    // ==========================

    const getProgress = (
        questions: number,
        total: number
    ): number => {
        if (!total || total === 0) return 0;

        return Math.round(
            (questions / total) * 100
        );
    };

    const getProgressColor = (
        percent: number
    ): string => {
        if (percent === 100) return "#22c55e";
        if (percent > 0) return "#eab308";
        return "#ef4444";
    };

    const getStatusColor = (
        status: string
    ): string => {
        if (status === "Solved") return "#069224";
        if (status === "Progress") return "#C2B200";
        return "#C20000";
    };

    const levelColor = (
        level: string
    ): string => {
        if (level === "Easy") return "easy";
        if (level === "Hard") return "hard";
        return "medium";
    };

    const loadMore = (): void => {
        setVisible((prev) => prev + 3);
    };

    // ==========================
    // Handlers
    // ==========================

    const handleLanguageChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ): void => {
        setSelectedLanguage(e.target.value);
        setVisible(9);
    };

    const handleLevelChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ): void => {
        setSelectedLevel(e.target.value);
        setVisible(9);
    };

    const handleSearch = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        setSearch(
            e.target.value.toLowerCase()
        );
        setVisible(9);
    };

    // ==========================
    // Sorting + Filtering
    // ==========================

    const statusOrder: Record<
        string,
        number
    > = {
        Solved: 1,
        Progress: 2,
        New: 3,
    };

    const filteredChallenges =
        useMemo(() => {
            return challenges
                .filter((item) => {
                    const matchLanguage =
                        selectedLanguage === "All" ||
                        item.language ===
                        selectedLanguage;

                    const matchLevel =
                        selectedLevel === "All" ||
                        item.level === selectedLevel;

                    const searchLower =
                        search.toLowerCase();

                    const matchSearch =
                        !searchLower ||
                        item.language
                            ?.toLowerCase()
                            .includes(searchLower) ||
                        item.description
                            ?.toLowerCase()
                            .includes(searchLower) ||
                        item.details
                            ?.toLowerCase()
                            .includes(searchLower) ||
                        item.title
                            ?.toLowerCase()
                            .includes(searchLower);

                    return (
                        matchLanguage &&
                        matchLevel &&
                        matchSearch
                    );
                })
                .sort((a, b) => {
                    const orderA =
                        statusOrder[a.status] || 4;

                    const orderB =
                        statusOrder[b.status] || 4;

                    if (orderA !== orderB) {
                        return orderA - orderB;
                    }

                    const progressA =
                        getProgress(
                            a.questions,
                            a.total
                        );

                    const progressB =
                        getProgress(
                            b.questions,
                            b.total
                        );

                    return progressB - progressA;
                });
        }, [
            challenges,
            selectedLanguage,
            selectedLevel,
            search,
        ]);

    const visibleChallenges =
        filteredChallenges.slice(
            0,
            visible
        );

    const languages = [
        ...new Set(
            challenges
                .filter(
                    (c) => c.language
                )
                .map(
                    (c) => c.language
                )
        ),
    ];

    return (
        <>
            {/* HERO */}
            <section className="debug_hero">
                <h2>Find the bug ! Fix the logic.</h2>
                <button>Get Started</button>
            </section>
            <section className="debug_main">
                <div className="section_container">
                    {/* FILTER BAR */}
                    <div className="row justify-content-center w-100 m-auto">
                        <div className="col-lg-12">
                            <section className="debug_filters py-3">
                                <div className="row">
                                    <div className="col-lg-7">
                                        <div className="row">
                                            <div className="col-lg-6 my-2 my-lg-0">
                                                <div className="d-flex gap-2 align-items-center">
                                                    <label htmlFor="languages">
                                                        Language
                                                    </label>
                                                    <div className="select_wrapper w-100">
                                                        <select
                                                            className="w-100"
                                                            name="languages"
                                                            value={selectedLanguage}
                                                            onChange={handleLanguageChange}
                                                        >
                                                            <option value="All">
                                                                All
                                                            </option>
                                                            {[
                                                                ...new Set(challenges
                                                                    .filter(
                                                                        (
                                                                            c,
                                                                        ) =>
                                                                            c.language,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            c,
                                                                        ) =>
                                                                            c.language,
                                                                    ),
                                                                ),
                                                            ].map(
                                                                (lang) => (
                                                                    <option
                                                                        key={
                                                                            lang
                                                                        }
                                                                        value={
                                                                            lang
                                                                        }
                                                                    >
                                                                        {
                                                                            lang
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 my-2 my-lg-0">
                                                <div className="d-flex gap-2 align-items-center">
                                                    <label htmlFor="problem">
                                                        Problem
                                                    </label>
                                                    <div className="select_wrapper w-100">
                                                        <select
                                                            className="w-100"
                                                            name="problem"
                                                            value={selectedLevel}
                                                            onChange={handleLevelChange}
                                                        >
                                                            <option value="All">
                                                                All
                                                            </option>
                                                            <option value="Easy">
                                                                Easy
                                                            </option>
                                                            <option value="Medium">
                                                                Medium
                                                            </option>
                                                            <option value="Hard">
                                                                Hard
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-5 my-2 my-lg-0">
                                        <div className="debug_search">
                                            <i className="bi bi-search"></i>
                                            <input
                                                type="text"
                                                value={search}
                                                placeholder="Search"
                                                onChange={handleSearch}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* CARDS */}
                    <div className="row justify-content-center w-100 m-auto pb-5">
                        <div className="col-lg-11">
                            <div className="debug_container mt-3">
                                <div className="row">
                                    {isLoading ? (
                                        <div className="col-12 text-center py-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                                style={{
                                                    width: "3rem",
                                                    height: "3rem",
                                                }}
                                            >
                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>
                                            </div>
                                            <p className="mt-3 text-secondary">
                                                Fetching debugging tracks...
                                            </p>
                                        </div>
                                    ) : filteredChallenges.length === 0 ? (
                                        <div className="col-12 text-center py-5 no_results_wrapper">
                                            <div className="empty_state_illust">
                                                <i className="bi bi-search mb-3 d-block"></i>
                                                <h3 className="msg_title">
                                                    No more records
                                                </h3>
                                                <p className="msg_desc">
                                                    Debugging details are
                                                    empty based on your
                                                    current selection.
                                                </p>
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <button
                                                        className="reset_btn btn-sm"
                                                        onClick={() => {
                                                            setSearch("");
                                                            setSelectedLanguage("All");
                                                            setSelectedLevel("All");
                                                            setVisible(9);
                                                        }}
                                                    >
                                                        Clear Filters
                                                    </button>
                                                    <button
                                                        className="reset_btn btn-sm"
                                                        style={{
                                                            background:
                                                                "#64748b",
                                                        }}
                                                        onClick={() => fetchDebuggingGroups()
                                                        }
                                                    >
                                                        Refresh
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        visibleChallenges.map(
                                            (item, idx) => {
                                                const langKey =
                                                    item.language
                                                        ? item.language.toLowerCase()
                                                        : "unknown";
                                                const localSolvedCount =
                                                    solvedInLocal[
                                                        langKey
                                                    ]
                                                        ? solvedInLocal[
                                                            langKey
                                                        ].length
                                                        : 0;

                                                // Combine with server if needed, or just prioritize local for dynamic feel
                                                const questionsCompleted =
                                                    Math.max(
                                                        item.questions,
                                                        localSolvedCount,
                                                    );
                                                const percent =
                                                    getProgress(
                                                        questionsCompleted,
                                                        item.total,
                                                    );

                                                // Adjust status based on progress
                                                let currentStatus =
                                                    item.status;
                                                if (percent === 100)
                                                    currentStatus =
                                                        "Solved";
                                                else if (percent > 0)
                                                    currentStatus =
                                                        "Progress";

                                                return (
                                                    <div
                                                        className="col-lg-4 mb-4"
                                                        key={item.id || idx}
                                                    >
                                                        <div className="debug_card text-decoration-none">
                                                            <span
                                                                className={`badge ${levelColor(item.level)}`}
                                                            >
                                                                {item.level}
                                                            </span>

                                                            <div className="d-flex align-items-center justify-content-between  mt-5">
                                                                <div className="d-flex align-items-start">
                                                                    <Image
                                                                        src={`${BASE_IMAGE_URL}debugging/icon/${item.icon}`}
                                                                        className="debug_icon"
                                                                        height={100}
                                                                        width={100}
                                                                        alt=""
                                                                    />
                                                                    <h3 className="mb-0 mt-2">
                                                                        {
                                                                            item.language
                                                                        }
                                                                    </h3>
                                                                </div>
                                                                <span className="status_badge">
                                                                    {
                                                                        currentStatus
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="debug_desc_text mt-2 mb-0">
                                                                {item.description ||
                                                                    item.details ||
                                                                    item.subtitle ||
                                                                    "Master the logic and fix bugs in this track."}
                                                            </p>
                                                            <p className="track">
                                                                Debugging
                                                                Track
                                                            </p>

                                                            {/* Progress Bar */}
                                                            <div className="progressbar">
                                                                <div
                                                                    className="progressfill"
                                                                    style={{
                                                                        width:
                                                                            percent +
                                                                            "%",
                                                                        background:
                                                                            getStatusColor(
                                                                                currentStatus,
                                                                            ),
                                                                    }}
                                                                ></div>
                                                            </div>

                                                            {/* Question Stats */}
                                                            <div className="stats">
                                                                <span>
                                                                    Questions
                                                                    Completed
                                                                </span>
                                                                <span>
                                                                    {
                                                                        questionsCompleted
                                                                    }
                                                                    /
                                                                    {
                                                                        item.total
                                                                    }
                                                                </span>
                                                            </div>

                                                            {/* Bottom Section */}
                                                            <div className="bottom">
                                                                <span>
                                                                    Submissions:{" "}
                                                                    {submissionCounts[
                                                                        langKey
                                                                    ] ||
                                                                        item.submissions}
                                                                </span>
                                                                <button
                                                                    className="continue"
                                                                    style={{
                                                                        background:
                                                                            getStatusColor(
                                                                                currentStatus,
                                                                            ),
                                                                    }}
                                                                >
                                                                    {percent ===
                                                                        0 ? (
                                                                        <Link
                                                                            href={`/debugging-workspace?language=${encodeURIComponent(
                                                                                item.language
                                                                            )}&level=${encodeURIComponent(item.level)}`}
                                                                            className="text-white"
                                                                        >
                                                                            Start <i className="bi bi-chevron-right"></i>
                                                                        </Link>
                                                                    ) : percent ===
                                                                        100 ? (
                                                                        <>
                                                                            Solved{" "}
                                                                            <i className="bi bi-check2-circle"></i>
                                                                        </>
                                                                    ) : (
                                                                        <Link
                                                                            href={`/debugging-workspace?language=${encodeURIComponent(
                                                                                item.language
                                                                            )}&level=${encodeURIComponent(item.level)}`}
                                                                            className="text-white"
                                                                        >
                                                                            Continue <i className="bi bi-chevron-right"></i>
                                                                        </Link>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )
                                    )}
                                </div>

                                {/* Show More Button */}
                                {visible <
                                    filteredChallenges.length ? (
                                    <div className="show_more">
                                        <button onClick={loadMore}>
                                            Show More
                                        </button>
                                    </div>
                                ) : (
                                    filteredChallenges.length > 0 && (
                                        <div className="show_more no_more_records">
                                            <p className="text-muted">
                                                No more records
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}