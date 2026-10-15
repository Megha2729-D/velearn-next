"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    CircularProgressbar,
    buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";
import "./style.css";
const BASE_API_URL = "https://crm.velearn.in/api/";
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

type AttendanceItem = {
    day: number;
    status: "present" | "absent" | "no_class" | string;
};
type AttendanceSummary = {
    month?: number;
    year?: number;
    present?: number;
    absent?: number;
    no_class?: number;
    percentage?: number;
};
type DashboardUser = {
    id?: number | string;
    name: string;
    course_title?: string;
    batch_string?: string | null;
};
type CourseProgress = {
    course_progress: number;
    completed_modules: number;
    total_modules: number;
};
type AssignmentSummary = {
    total: number;
    submitted: number;
    avg_score: number;
};
type MiniProject = {
    id: number | string;
    name: string;
    module: string;
    submitted_date?: string | null;
    status: "Completed" | "Pending" | string;
    score: number;
    progress: number;
};
type Milestone = {
    title: string;
    date: string;
    status: "Completed" | "Pending" | string;
    score: number;
    desc: string;
};
type MainProject = {
    id: number | string;
    title: string;
    review: string;
    milestones: Milestone[];
};
type DashboardData = {
    user: DashboardUser;
    progress: CourseProgress;
    assignments: AssignmentSummary;
    mini_projects: MiniProject[];
    main_projects: MainProject[];
    attendance?: AttendanceItem[];
    attendance_summary?: AttendanceSummary | null;
};
type StoredUser = { id: number | string };
type ApiResponse<T> = { status: boolean; data: T };

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1-12
export default function LiveDashboardPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>([]);
    const [attendanceSummaryData, setAttendanceSummaryData] = useState<AttendanceSummary | null>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const fetchAttendanceForMonth = async (month: number, year: number) => {
        // Disallow future months: clamp / return
        if (year > currentYear || (year === currentYear && month > currentMonth)) {
            return;
        }
        setAttendanceLoading(true);
        try {
            const userString = localStorage.getItem("user");
            if (userString) {
                const userLocal: StoredUser = JSON.parse(userString);
                const res = await axios.get<ApiResponse<{ attendance?: AttendanceItem[]; attendance_summary?: AttendanceSummary | null }>>(
                    `${BASE_API_URL}student-attendance/${userLocal.id}?month=${month}&year=${year}`
                );
                if (res.data.status && res.data.data) {
                    setAttendanceList(res.data.data.attendance || []);
                    setAttendanceSummaryData(res.data.data.attendance_summary || null);
                    setSelectedMonth(month);
                    setSelectedYear(year);
                }
            }
        } catch (error) {
            console.error("Error fetching attendance for month", error);
        } finally {
            setAttendanceLoading(false);
        }
    };
    const handlePrevMonth = () => {
        let newMonth = selectedMonth - 1;
        let newYear = selectedYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }
        fetchAttendanceForMonth(newMonth, newYear);
    };
    const handleNextMonth = () => {
        let newMonth = selectedMonth + 1;
        let newYear = selectedYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
        // Block future months
        if (newYear > currentYear || (newYear === currentYear && newMonth > currentMonth)) {
            return;
        }
        fetchAttendanceForMonth(newMonth, newYear);
    };
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userString = localStorage.getItem("user");
                if (userString) {
                    const userLocal: StoredUser = JSON.parse(userString);
                    const res = await axios.get<ApiResponse<DashboardData>>(
                        `${BASE_API_URL}live-dashboard/${userLocal.id}`,
                    );
                    if (res.data.status) {
                        setDashboardData(res.data.data);
                        setAttendanceList(res.data.data.attendance || []);
                        setAttendanceSummaryData(res.data.data.attendance_summary || null);
                        if (res.data.data.attendance_summary?.month) {
                            setSelectedMonth(res.data.data.attendance_summary.month);
                        }
                        if (res.data.data.attendance_summary?.year) {
                            setSelectedYear(res.data.data.attendance_summary.year);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching live dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    if (loading) {
        return (
            <div className="dashboard_layout">
                <Sidebar
                    activePage="live-dash"
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
                    ></div>
                </div>
            </div>
        );
    }
    if (!dashboardData) return null;
    const {
        user,
        progress,
        assignments,
        mini_projects,
        main_projects,
        attendance,
        attendance_summary,
    } = dashboardData;
    return (
        <div className="dashboard_layout">
            <Sidebar
                activePage="live-dash"
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
            <div className="dashboard_main_content">
                <header className="dashboard_top_header">
                    <div className="profile_breadcrumb">
                        <h2>
                            Live Courses <span>/ Dashboard</span>
                        </h2>
                    </div>
                    <div
                        className="notification_bell_top"
                        onClick={() => setIsNotifOpen(true)}
                    >
                        <i className="bi bi-bell"></i>
                    </div>
                </header>
                <div className="live_dashboard_container">
                    {/* Welcome Banner */}
                    <div className="welcome_stats_banner">
                        <div className="welcome_text">
                            <h1>Good morning, {user.name.split(" ")[0]}! 👋</h1>
                            <p>
                                {user.course_title}{" "}
                                {user.batch_string && `• ${user.batch_string}`}
                            </p>
                        </div>
                    </div>
                    {/* Progress Overview */}
                    <div className="progress_grid_row row mt-4">
                        <div className="col-lg-6">
                            <div className="stat_card_new">
                                <div className="d-flex align-items-center gap-4">
                                    <div style={{ width: 80, height: 80 }}>
                                        <CircularProgressbar
                                            value={progress.course_progress}
                                            text={`${progress.course_progress}%`}
                                            styles={buildStyles({
                                                textColor: "#0f172a",
                                                pathColor: "#3b82f6",
                                                trailColor: "#f1f5f9",
                                            })}
                                        />
                                    </div>
                                    <div className="stat_info">
                                        <h4>Course Progress</h4>
                                        <p>
                                            {progress.completed_modules} of{" "}
                                            {progress.total_modules} modules
                                            complete
                                        </p>
                                        <div className="d-flex gap-3 small mt-2">
                                            <span className="text-primary">
                                                • Completed:{" "}
                                                {progress.completed_modules}
                                            </span>
                                            <span className="text-muted">
                                                • Remaining:{" "}
                                                {progress.total_modules -
                                                    progress.completed_modules}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="stat_card_new">
                                <div className="d-flex align-items-center gap-4">
                                    <div style={{ width: 80, height: 80 }}>
                                        <CircularProgressbar
                                            value={
                                                assignments.total > 0
                                                    ? Math.round(
                                                        (assignments.submitted /
                                                            assignments.total) *
                                                        100,
                                                    )
                                                    : 0
                                            }
                                            text={`${assignments.total > 0 ? Math.round((assignments.submitted / assignments.total) * 100) : 0}%`}
                                            styles={buildStyles({
                                                textColor: "#0f172a",
                                                pathColor: "#8b5cf6",
                                                trailColor: "#f1f5f9",
                                            })}
                                        />
                                    </div>
                                    <div className="stat_info">
                                        <h4>Assignments</h4>
                                        <p>
                                            {assignments.submitted} of{" "}
                                            {assignments.total} submitted • Avg{" "}
                                            {assignments.avg_score}%
                                        </p>
                                        <div className="d-flex gap-3 small mt-2">
                                            <span className="text-purple">
                                                • Submitted:{" "}
                                                {assignments.submitted}
                                            </span>
                                            <span className="text-danger">
                                                • Pending:{" "}
                                                {assignments.total -
                                                    assignments.submitted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Main Grid: Attendance & Mini Projects */}
                    <div className="row mt-4">
                        <div className="col-lg-6">
                            {(() => {
                                const activeSummary = attendanceSummaryData || dashboardData.attendance_summary || {};
                                const activeAttendance = attendanceList.length > 0 ? attendanceList : (dashboardData.attendance || []);
                                const isCurrentOrFutureMonth =
                                    selectedYear > currentYear ||
                                    (selectedYear === currentYear && selectedMonth >= currentMonth);
                                const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
                                const paddingSlots = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                                const availableYears: number[] = [];
                                for (let y = currentYear; y >= currentYear - 3; y--) {
                                    availableYears.push(y);
                                }
                                return (
                                    <div className="attendance_card">
                                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <h3 className="section_title_sm mb-0 d-flex align-items-center">
                                                    <i className="bi bi-calendar-check me-2"></i>
                                                    Attendance — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                                                </h3>
                                                {/* Previous / Next Month Navigator */}
                                                <div className="d-inline-flex align-items-center gap-1 ms-1">
                                                    <button
                                                        type="button"
                                                        className="cal_nav_btn"
                                                        onClick={handlePrevMonth}
                                                        title="Previous Month"
                                                    >
                                                        <i className="bi bi-chevron-left"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="cal_nav_btn"
                                                        onClick={handleNextMonth}
                                                        disabled={isCurrentOrFutureMonth}
                                                        title={isCurrentOrFutureMonth ? "Future months cannot be viewed" : "Next Month"}
                                                    >
                                                        <i className="bi bi-chevron-right"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Custom Month & Year Pickers */}
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <div className="d-flex align-items-center gap-1">
                                                    <select
                                                        className="cal_select"
                                                        value={selectedMonth}
                                                        onChange={(e) => fetchAttendanceForMonth(Number(e.target.value), selectedYear)}
                                                        title="Choose Month"
                                                    >
                                                        {MONTH_NAMES.map((m, idx) => {
                                                            const mNum = idx + 1;
                                                            const isFuture = selectedYear === currentYear && mNum > currentMonth;
                                                            return (
                                                                <option key={m} value={mNum} disabled={isFuture}>
                                                                    {m} {isFuture ? "(Future)" : ""}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                    <select
                                                        className="cal_select"
                                                        value={selectedYear}
                                                        onChange={(e) => {
                                                            const newYr = Number(e.target.value);
                                                            let newMo = selectedMonth;
                                                            if (newYr === currentYear && newMo > currentMonth) {
                                                                newMo = currentMonth;
                                                            }
                                                            fetchAttendanceForMonth(newMo, newYr);
                                                        }}
                                                        title="Choose Year"
                                                    >
                                                        {availableYears.map((yr) => (
                                                            <option key={yr} value={yr}>
                                                                {yr}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="calendar_legend d-flex gap-3 ms-2">
                                                    <span>
                                                        <span className="dot green"></span> Present
                                                    </span>
                                                    <span>
                                                        <span className="dot red"></span> Absent
                                                    </span>
                                                    <span>
                                                        <span className="dot gray"></span> No Class
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`calendar_grid ${attendanceLoading ? "attendance_loading_overlay" : ""}`}>
                                            {[
                                                "Mon",
                                                "Tue",
                                                "Wed",
                                                "Thu",
                                                "Fri",
                                                "Sat",
                                                "Sun",
                                            ].map((day) => (
                                                <div
                                                    key={day}
                                                    className="calendar_day_label"
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                            {Array.from({ length: paddingSlots }).map((_, i) => (
                                                <div
                                                    key={`empty-${i}`}
                                                    className="calendar_day empty"
                                                ></div>
                                            ))}
                                            {activeAttendance.map((item) => (
                                                <div
                                                    key={item.day}
                                                    className={`calendar_day ${item.status}`}
                                                    title={`Day ${item.day}: ${item.status === "present" ? "Present" : item.status === "absent" ? "Absent" : "No Class"}`}
                                                >
                                                    {item.day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="calendar_footer mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                            <div className="d-flex gap-3">
                                                <span className="text-success small fw-bold">
                                                    ✓ Present:{" "}
                                                    {activeSummary.present ?? 0}
                                                </span>
                                                <span className="text-danger small fw-bold">
                                                    ✗ Absent:{" "}
                                                    {activeSummary.absent ?? 0}
                                                </span>
                                                <span className="text-muted small fw-bold">
                                                    No Class:{" "}
                                                    {activeSummary.no_class ?? 0}
                                                </span>
                                            </div>
                                            <div className="small fw-bold">
                                                Attendance:{" "}
                                                <span className="text-primary">
                                                    {activeSummary.percentage ?? 0}%
                                                </span>{" "}
                                                <span className="text-muted">
                                                    (Min: 75%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="col-lg-6">
                            <div className="mini_projects_card">
                                <h3 className="section_title_sm mb-4">
                                    <i className="bi bi-diamond me-2"></i> Mini
                                    Projects
                                </h3>
                                <div className="project_list">
                                    {mini_projects.length > 0 ? (
                                        mini_projects.map((proj, index) => (
                                            <div
                                                key={proj.id}
                                                className={`project_item ${index > 0 ? "mt-4" : ""}`}
                                            >
                                                <div className="d-flex justify-content-between mb-2">
                                                    <div className="p_info">
                                                        <div className="p_name">
                                                            {proj.name}
                                                        </div>
                                                        <div className="p_meta">
                                                            Module:{" "}
                                                            {proj.module}{" "}
                                                            {proj.submitted_date
                                                                ? `• Submitted ${proj.submitted_date}`
                                                                : proj.status ===
                                                                    "Pending"
                                                                    ? "• Not Submitted Yet"
                                                                    : "• Resubmission Pending"}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`p_score ${proj.status === "Completed" ? "text-success" : proj.status === "Pending" ? "text-secondary" : "text-danger"}`}
                                                    >
                                                        <span className="score_val">
                                                            {proj.status ===
                                                                "Pending"
                                                                ? "--"
                                                                : `${proj.score}%`}
                                                        </span>
                                                        <span className="score_label">
                                                            SCORE
                                                        </span>
                                                        <div className="mt-1">
                                                            {proj.status ===
                                                                "Completed" ? (
                                                                <>
                                                                    <i className="bi bi-check-circle-fill"></i>{" "}
                                                                    Completed
                                                                </>
                                                            ) : proj.status ===
                                                                "Pending" ? (
                                                                <>
                                                                    <i className="bi bi-clock-fill"></i>{" "}
                                                                    Pending
                                                                    Submission
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                                                                    Changes
                                                                    Needed
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="progress"
                                                    style={{ height: 6 }}
                                                >
                                                    <div
                                                        className={`progress-bar ${proj.status === "Completed" ? "bg-success" : proj.status === "Pending" ? "bg-secondary" : "bg-danger"}`}
                                                        style={{
                                                            width:
                                                                proj.status ===
                                                                    "Pending"
                                                                    ? "0%"
                                                                    : `${proj.progress}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted">
                                            No mini projects found.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Main Project Section */}
                    {main_projects.map((mp) => (
                        <div
                            key={mp.id}
                            className="main_project_card mt-4 mb-5"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="section_title_sm">
                                    <i className="bi bi-rocket-takeoff me-2"></i>{" "}
                                    Main Project — {mp.title}
                                </h3>
                                <span className="review_badge">
                                    {mp.review}
                                </span>
                            </div>
                            {mp.milestones.map((m, mIndex) => {
                                const isCompleted = m.status === "Completed";
                                const isPending =
                                    m.status === "Pending" &&
                                    m.score === 0 &&
                                    m.date === "Pending";
                                const isInProgress =
                                    m.status === "Pending" && !isPending;
                                let barClass = "bg-success";
                                let textClass = "text-success";
                                let progressVal = m.score;
                                if (isInProgress) {
                                    barClass = "bg-warning";
                                    textClass = "text-warning";
                                } else if (isPending) {
                                    barClass = "bg-secondary";
                                    textClass = "";
                                    progressVal = 0;
                                }
                                return (
                                    <div
                                        key={mIndex}
                                        className={`milestone_item ${mIndex > 0 ? "mt-4" : ""} ${isPending ? "locked" : ""}`}
                                    >
                                        <div
                                            className={`d-flex justify-content-between mb-2 ${isPending ? "opacity-50" : ""}`}
                                        >
                                            <div
                                                className={`m_title ${isInProgress ? "text-primary" : ""}`}
                                            >
                                                {m.title} • {m.date}{" "}
                                                {isCompleted && "• ✓ Completed"}{" "}
                                                {isInProgress &&
                                                    "• In Progress"}{" "}
                                                {isPending && (
                                                    <>
                                                        <br />
                                                        <i className="bi bi-lock-fill"></i>{" "}
                                                        Locked
                                                    </>
                                                )}
                                            </div>
                                            <div
                                                className={`m_score ${textClass}`}
                                            >
                                                {isPending
                                                    ? "--"
                                                    : `${m.score}%`}
                                            </div>
                                        </div>
                                        <div
                                            className="progress mb-2"
                                            style={{
                                                height: 10,
                                                opacity: isPending ? 0.3 : 1,
                                            }}
                                        >
                                            <div
                                                className={`progress-bar ${barClass}`}
                                                style={{
                                                    width: `${progressVal}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <p
                                            className={`m_desc ${isPending ? "opacity-50" : ""}`}
                                        >
                                            {m.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
