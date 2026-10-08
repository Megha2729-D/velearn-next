"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

import Sidebar from "@/components/layout/Sidebar";
import NotificationsModal from "@/components/layout/NotificationsModal";

import "./style.css";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_UPLOAD_URL_MAIN =
  "https://crm.velearn.in/uploads/main_projects/";
const BASE_UPLOAD_URL_MINI =
  "https://crm.velearn.in/public/uploads/mini_projects/";

type TabType = "mini" | "main";

type ScoreBreakdown = {
  criterion?: string;
  obtained_score?: number | string;
  max_score?: number | string;
};

type AttemptHistory = {
  attempt?: number | string;
  score?: number | string | null;
  grade?: string | null;
  feedback?: string | null;
  file_path?: string | null;
  breakdowns?: ScoreBreakdown[];
};

type Submission = {
  status?: string;
  score?: number | string | null;
  grade?: string | null;
  feedback?: string | null;
  file_path?: string | null;
  attempts?: number;
  reupload_approved?: number | boolean;
  submitted_at?: string;
  scoreBreakdowns?: ScoreBreakdown[];
  attempts_history?: AttemptHistory[];
};

type Project = {
  id: number | string;
  title?: string;
  module?: string;
  description?: string;
  due_date?: string | null;
  reveal_date?: string | null;

  submission?: Submission | null;
  submissions?: Record<string, Submission>;

  review_1_title?: string;
  review_1_deadline?: string | null;

  review_2_title?: string;
  review_2_deadline?: string | null;

  review_3_title?: string;
  review_3_deadline?: string | null;
};

type ProcessedProject = Project & {
  isSubmitted: boolean;
  status: string;
  scoreText: string;
  detailText: string;
  deadline: string;
  revealDateFormatted: string;
  isOverdue: boolean;
};

const getFileExtension = (filename?: string | null): string => {
  if (!filename) return "";
  return filename.split(".").pop()?.toLowerCase() || "";
};

const isImageFile = (filename?: string | null): boolean => {
  const ext = getFileExtension(filename);

  return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
};

const getFileIconClass = (filename?: string | null): string => {
  const ext = getFileExtension(filename);

  switch (ext) {
    case "pdf":
      return "bi-file-earmark-pdf text-danger";

    case "doc":
    case "docx":
      return "bi-file-earmark-word text-primary";

    case "zip":
    case "rar":
      return "bi-file-earmark-zip text-warning";

    case "txt":
      return "bi-file-earmark-text text-secondary";

    default:
      return "bi-file-earmark-arrow-up text-info";
  }
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "Something went wrong."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

const formatDate = (
  value?: string | null,
  includeTime = false
): string => {
  if (!value) {
    return includeTime ? "Immediate" : "No Deadline";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  if (includeTime) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Projects = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("mini");

  const [mainProjects, setMainProjects] = useState<Project[]>([]);
  const [miniProjects, setMiniProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [expandedBriefId, setExpandedBriefId] = useState<
    number | string | null
  >(null);

  const [userId, setUserId] = useState<number | string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * GET USER FROM LOCAL STORAGE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedToken = localStorage.getItem("token");

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const storedUserId =
        storedUser?.id || storedUser?.auth_id || null;

      setToken(storedToken);
      setUserId(storedUserId);
    } catch (error) {
      console.error("Failed to read user from localStorage:", error);
      setLoading(false);
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * FETCH PROJECTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (userId) {
      fetchProjects();
    } else if (userId === null) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [userId]);

  const fetchProjects = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const headers = token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {};

      const [mainRes, miniRes] = await Promise.all([
        axios.get(
          `${BASE_API_URL}my-main-projects/${userId}`,
          { headers }
        ),

        axios.get(
          `${BASE_API_URL}my-mini-projects/${userId}`,
          { headers }
        ),
      ]);

      if (mainRes.data?.status === "success") {
        setMainProjects(mainRes.data.data || []);
      } else {
        setMainProjects([]);
      }

      if (miniRes.data?.status === "success") {
        setMiniProjects(miniRes.data.data || []);
      } else {
        setMiniProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);

      toast.error(
        `Failed to load projects: ${getErrorMessage(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * FILE UPLOAD
   * ---------------------------------------------------------
   */

  const handleUpload = async (
    projectId: number | string,
    file: File | undefined,
    type: TabType,
    reviewNumber: number | null = null
  ) => {
    if (!file || !userId) return;

    try {
      const formData = new FormData();

      formData.append("file", file);

      if (reviewNumber) {
        formData.append(
          "review_number",
          reviewNumber.toString()
        );
      }

      const uploadPromise = axios.post(
        `${BASE_API_URL}${type}-projects/${userId}/${projectId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token
              ? {
                Authorization: `Bearer ${token}`,
              }
              : {}),
          },
        }
      );

      await toast.promise(uploadPromise, {
        loading: "Uploading submission...",
        success: (res) =>
          res.data?.message ||
          "Submission uploaded successfully!",
        error: (err: AxiosError<{ message?: string }>) =>
          err.response?.data?.message || "Upload failed.",
      });

      await fetchProjects();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  /*
   * ---------------------------------------------------------
   * PROCESS PROJECT STATUS
   * ---------------------------------------------------------
   */

  const processProject = (
    project: Project
  ): ProcessedProject => {
    const isMain = activeTab === "main";

    const isSubmitted = isMain
      ? !!(
        project.submissions &&
        Object.keys(project.submissions).length > 0
      )
      : !!project.submission;

    let projectStatus = "pending";
    let scoreText = "Pending";
    let detailText = "";

    if (!isMain) {
      if (isSubmitted && project.submission) {
        projectStatus =
          project.submission.status || "pending";

        if (
          project.submission.reupload_approved === 1 ||
          project.submission.reupload_approved === true
        ) {
          projectStatus = "changes-needed";
          scoreText = "Changes Needed";
          detailText =
            "Please review feedback and resubmit";
        } else if (
          projectStatus === "graded" ||
          projectStatus === "evaluated"
        ) {
          scoreText =
            project.submission.score !== null &&
              project.submission.score !== undefined
              ? `Score: ${project.submission.score}%`
              : "Evaluated";

          detailText = project.submission.grade
            ? `Grade: ${project.submission.grade}`
            : "";
        } else if (projectStatus === "late") {
          scoreText = "Late Submission";
        } else {
          scoreText = "Submitted";
        }
      } else {
        if (
          project.due_date &&
          new Date(project.due_date).setHours(
            23,
            59,
            59,
            999
          ) < new Date().getTime()
        ) {
          projectStatus = "late";
          scoreText = "Overdue";
        }
      }
    } else {
      if (isSubmitted && project.submissions) {
        const firstSubmission = Object.values(
          project.submissions
        )[0];

        if (
          firstSubmission &&
          (firstSubmission.reupload_approved === 1 ||
            firstSubmission.reupload_approved === true)
        ) {
          projectStatus = "changes-needed";
          scoreText = "Changes Needed";
          detailText =
            "Please review feedback and resubmit";
        }
      }
    }

    return {
      ...project,

      isSubmitted,

      status: projectStatus,

      scoreText,

      detailText,

      deadline: formatDate(project.due_date),

      revealDateFormatted: formatDate(
        project.reveal_date,
        true
      ),

      isOverdue:
        projectStatus === "late" && !isSubmitted,
    };
  };

  const displayedProjects = useMemo(() => {
    const projects =
      activeTab === "main"
        ? mainProjects
        : miniProjects;

    return projects.map(processProject);
  }, [
    activeTab,
    mainProjects,
    miniProjects,
  ]);

  const BASE_UPLOAD_URL =
    activeTab === "main"
      ? BASE_UPLOAD_URL_MAIN
      : BASE_UPLOAD_URL_MINI;

  /*
   * ---------------------------------------------------------
   * MINI PROJECT - SUBMITTED FILE
   * ---------------------------------------------------------
   */

  const renderMiniSubmittedFile = (
    item: ProcessedProject
  ) => {
    if (
      !item.isSubmitted ||
      !item.submission ||
      !item.submission.file_path
    ) {
      return null;
    }

    const filePath = item.submission.file_path;

    const fileUrl =
      `${BASE_UPLOAD_URL_MINI}${filePath}`;

    return (
      <div className="submitted_file_container mt-3">
        {isImageFile(filePath) ? (
          <div
            className="assignment_image_preview_box border rounded p-2"
            style={{
              width: "fit-content",
            }}
          >
            <div
              className="position-relative preview_image_wrapper"
              style={{
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <img
                src={fileUrl}
                alt="Submission Preview"
                style={{
                  height: "100px",
                  width: "auto",
                  objectFit: "cover",
                }}
              />

              <div
                className="preview_overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
                style={{
                  opacity: 0,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                }}
                onClick={() =>
                  window.open(
                    fileUrl,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <i className="bi bi-eye text-white fs-4"></i>
              </div>
            </div>

            <div className="small text-muted mt-2 d-flex justify-content-between align-items-center">
              <span
                className="text-truncate"
                style={{
                  maxWidth: "150px",
                }}
              >
                {filePath}
              </span>
            </div>
          </div>
        ) : (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn_download_file d-inline-flex align-items-center gap-2 p-2 border rounded text-decoration-none"
          >
            <div className="file_icon_large">
              <i
                className={`bi ${getFileIconClass(
                  filePath
                )} fs-3`}
              ></i>
            </div>

            <div className="file_details">
              <span
                className="d-block text-dark fw-bold text-truncate"
                style={{
                  maxWidth: "200px",
                }}
              >
                {filePath}
              </span>

              <span className="d-block text-muted small text-uppercase">
                {getFileExtension(filePath)} File
              </span>
            </div>

            <div className="ms-2">
              <i className="bi bi-download text-primary"></i>
            </div>
          </a>
        )}
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * MINI PROJECT - FEEDBACK HISTORY
   * ---------------------------------------------------------
   */

  const renderMiniFeedback = (
    item: ProcessedProject
  ) => {
    if (!item.submission) {
      return (
        <div className="text-muted text-center py-3">
          No feedback or evaluation history available yet.
        </div>
      );
    }

    const submission = item.submission;

    const hasScore =
      submission.score !== null &&
      submission.score !== undefined;

    const hasHistory =
      !!submission.attempts_history &&
      submission.attempts_history.length > 0;

    if (!hasScore && !hasHistory) {
      return (
        <div className="text-muted text-center py-3">
          No feedback or evaluation history available yet.
        </div>
      );
    }

    return (
      <div>
        <div className="brief_header fw-bold text-primary">
          <i className="bi bi-clipboard2-check-fill"></i>{" "}
          Evaluation Feedback & History
        </div>

        <div className="brief_body mt-3">
          {hasScore && (
            <div className="bg-white p-3 rounded shadow-sm border mb-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-star-fill text-warning"></i>

                Latest Evaluation{" "}
                {submission.attempts
                  ? `(Attempt ${submission.attempts}/3)`
                  : ""}
              </h6>

              {submission.scoreBreakdowns &&
                submission.scoreBreakdowns.length >
                0 && (
                  <div className="mb-3">
                    <div className="fw-bold text-muted small mb-2 text-uppercase">
                      Score Breakdown
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {submission.scoreBreakdowns.map(
                        (bd, index) => (
                          <div
                            key={index}
                            className="bg-light px-3 py-1 rounded border small"
                          >
                            <span className="text-muted">
                              {bd.criterion}:{" "}
                            </span>

                            <strong className="text-dark">
                              {bd.obtained_score}/
                              {bd.max_score}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {submission.feedback && (
                <div className="mt-2">
                  <div className="fw-bold text-muted small mb-1 text-uppercase">
                    Staff Feedback
                  </div>

                  <div
                    className="p-3 bg-light rounded"
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {submission.feedback}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasHistory && (
            <div className="mt-4">
              <h6 className="fw-bold text-muted small text-uppercase mb-3">
                <i className="bi bi-clock-history"></i>{" "}
                Previous Attempts
              </h6>

              <div className="d-flex flex-column gap-3">
                {submission.attempts_history?.map(
                  (history, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded border"
                      style={{
                        opacity: 0.8,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                        <span className="fw-bold text-dark">
                          Attempt {history.attempt}
                        </span>

                        <div className="d-flex gap-2">
                          <span className="badge bg-light text-dark border">
                            Score: {history.score}%
                          </span>

                          <span className="badge bg-light text-dark border">
                            Grade: {history.grade}
                          </span>
                        </div>
                      </div>

                      {history.breakdowns &&
                        history.breakdowns.length >
                        0 && (
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {history.breakdowns.map(
                              (bd, bdIndex) => (
                                <div
                                  key={bdIndex}
                                  className="bg-light px-2 py-1 rounded small text-muted"
                                  style={{
                                    fontSize:
                                      "0.8rem",
                                  }}
                                >
                                  {bd.criterion}:{" "}
                                  <strong className="text-dark">
                                    {
                                      bd.obtained_score
                                    }
                                    /
                                    {bd.max_score}
                                  </strong>
                                </div>
                              )
                            )}
                          </div>
                        )}

                      <div className="small text-muted mt-2 d-flex justify-content-between align-items-center">
                        <div>
                          <strong>
                            Feedback:
                          </strong>{" "}
                          {history.feedback ||
                            "None"}
                        </div>

                        {history.file_path && (
                          <a
                            href={`${BASE_UPLOAD_URL_MINI}${history.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-link text-decoration-none p-0 fw-bold d-flex align-items-center gap-1"
                          >
                            <i className="bi bi-download"></i>
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * MAIN PROJECT - EVALUATION DETAILS
   * ---------------------------------------------------------
   */

  const renderEvaluationDetails = (
    submission?: Submission | null
  ) => {
    if (!submission) return null;

    const hasCurrentEval =
      submission.status === "evaluated" ||
      submission.status === "graded";

    const hasHistory =
      !!submission.attempts_history &&
      submission.attempts_history.length > 0;

    if (!hasCurrentEval && !hasHistory) {
      return null;
    }

    return (
      <div
        className="eval_box mt-3 p-3 rounded"
        style={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
        }}
      >
        <h6 className="fw-bold text-muted small text-uppercase mb-3 border-bottom pb-2">
          <i className="bi bi-clipboard-check me-1 text-success"></i>
          Evaluation Details
        </h6>

        {hasCurrentEval &&
          submission.score !== null &&
          submission.score !== undefined && (
            <div className="d-flex gap-3 mb-3">
              <div
                className="bg-white px-4 py-2 rounded border border-success border-opacity-50 shadow-sm text-center"
                style={{
                  minWidth: "100px",
                }}
              >
                <div
                  className="text-muted fw-bold text-uppercase"
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Score
                </div>

                <div className="fs-4 fw-bold text-success">
                  {submission.score}%
                </div>
              </div>

              <div
                className="bg-white px-4 py-2 rounded border border-primary border-opacity-50 shadow-sm text-center"
                style={{
                  minWidth: "100px",
                }}
              >
                <div
                  className="text-muted fw-bold text-uppercase"
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Grade
                </div>

                <div className="fs-4 fw-bold text-primary">
                  {submission.grade || "N/A"}
                </div>
              </div>
            </div>
          )}

        {hasCurrentEval &&
          submission.scoreBreakdowns &&
          submission.scoreBreakdowns.length > 0 && (
            <div className="mb-3">
              <div className="fw-bold text-muted small mb-2 text-uppercase">
                Score Breakdown
              </div>

              <div className="d-flex flex-wrap gap-2">
                {submission.scoreBreakdowns.map(
                  (bd, index) => (
                    <div
                      key={index}
                      className="bg-light px-3 py-1 rounded border small"
                    >
                      <span className="text-muted">
                        {bd.criterion}:{" "}
                      </span>

                      <strong className="text-dark">
                        {bd.obtained_score}/
                        {bd.max_score}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {hasCurrentEval &&
          submission.feedback && (
            <div className="mt-2">
              <div className="fw-bold text-muted small mb-1 text-uppercase">
                Staff Feedback
              </div>

              <div
                className="p-3 bg-light rounded"
                style={{
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                }}
              >
                {submission.feedback}
              </div>
            </div>
          )}

        {hasHistory && (
          <div className="mt-4">
            <h6 className="fw-bold text-muted small text-uppercase mb-3">
              <i className="bi bi-clock-history"></i>{" "}
              Previous Attempts
            </h6>

            <div className="d-flex flex-column gap-3">
              {submission.attempts_history?.map(
                (history, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded border"
                    style={{
                      opacity: 0.8,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                      <span className="fw-bold text-dark">
                        Attempt {history.attempt}
                      </span>

                      <div className="d-flex gap-2">
                        <span className="badge bg-light text-dark border">
                          Score: {history.score}%
                        </span>

                        <span className="badge bg-light text-dark border">
                          Grade: {history.grade}
                        </span>
                      </div>
                    </div>

                    {history.breakdowns &&
                      history.breakdowns.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {history.breakdowns.map(
                            (bd, bdIndex) => (
                              <div
                                key={bdIndex}
                                className="bg-light px-2 py-1 rounded small text-muted"
                                style={{
                                  fontSize:
                                    "0.8rem",
                                }}
                              >
                                {bd.criterion}:{" "}
                                <strong className="text-dark">
                                  {
                                    bd.obtained_score
                                  }
                                  /
                                  {
                                    bd.max_score
                                  }
                                </strong>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    <div className="small text-muted mt-2 d-flex justify-content-between align-items-center">
                      <div>
                        <strong>
                          Feedback:
                        </strong>{" "}
                        {history.feedback ||
                          "None"}
                      </div>

                      {history.file_path && (
                        <a
                          href={`${BASE_UPLOAD_URL_MAIN}${history.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-link text-decoration-none p-0 fw-bold d-flex align-items-center gap-1"
                        >
                          <i className="bi bi-download"></i>
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * MAIN PROJECT - SUBMITTED FILE
   * ---------------------------------------------------------
   */

  const renderSubmittedFile = (
    submission?: Submission | null
  ) => {
    if (!submission?.file_path) return null;

    return (
      <div className="mt-2 mb-3">
        <a
          href={`${BASE_UPLOAD_URL_MAIN}${submission.file_path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
        >
          <i className="bi bi-file-earmark-arrow-down"></i>
          View Submitted File
        </a>
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * MAIN PROJECT - UPLOAD BUTTON
   * ---------------------------------------------------------
   */

  const renderUploadBtn = (
    item: ProcessedProject,
    reviewNumber: number,
    submission?: Submission
  ) => {
    const isSubmitted = !!submission;

    const canReupload =
      !isSubmitted ||
      submission?.reupload_approved === 1 ||
      submission?.reupload_approved === true;

    if (!canReupload && isSubmitted) {
      return (
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">
            <i className="bi bi-check-circle-fill me-1"></i>
            Submitted for Review
          </span>
        </div>
      );
    }

    if (
      isSubmitted &&
      submission?.attempts &&
      submission.attempts >= 3
    ) {
      return (
        <span
          className="btn_upload_disabled text-danger fw-bold d-inline-flex align-items-center gap-1 py-1"
          style={{
            fontSize: "12px",
          }}
        >
          <i className="bi bi-exclamation-triangle-fill"></i>
          Attempt Limit Reached (3/3)
        </span>
      );
    }

    const attemptText = isSubmitted
      ? `Resubmit Review ${reviewNumber}`
      : `Submit for Review ${reviewNumber}`;

    return (
      <label
        className="btn_submit_review"
        style={{
          cursor: "pointer",
          margin: 0,
        }}
      >
        {attemptText}

        <input
          type="file"
          accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.webp"
          style={{
            display: "none",
          }}
          onChange={(
            event: ChangeEvent<HTMLInputElement>
          ) => {
            const selectedFile =
              event.target.files?.[0];

            if (selectedFile) {
              handleUpload(
                item.id,
                selectedFile,
                "main",
                reviewNumber
              );
            }

            event.target.value = "";
          }}
        />
      </label>
    );
  };

  /*
   * ---------------------------------------------------------
   * RENDER MINI PROJECT
   * ---------------------------------------------------------
   */

  const renderMiniProject = (
    item: ProcessedProject
  ) => {
    return (
      <div
        key={item.id}
        className={`assignment_card ${item.status} ${item.isSubmitted
          ? "submitted_card"
          : ""
          }`}
      >
        <div className="as_header">
          <div className="as_info">
            <h3 className="as_title">
              {item.title}
            </h3>

            <div className="as_meta">
              <span>
                <i className="bi bi-layers"></i>{" "}
                {item.module}
              </span>

              <span>
                <i className="bi bi-calendar3"></i>{" "}
                Deadline: {item.deadline}
              </span>

              <span>
                <i className="bi bi-eye"></i>{" "}
                Revealed:{" "}
                {item.revealDateFormatted}
              </span>
            </div>

            <div className="badge_group">
              {(
                item.status === "graded" ||
                item.status === "evaluated"
              ) &&
                item.detailText && (
                  <span className="graded_badge">
                    <i className="bi bi-patch-check-fill"></i>{" "}
                    {item.detailText}
                  </span>
                )}

              {(item.status === "graded" ||
                item.status === "evaluated") &&
                item.submission &&
                (item.submission
                  .reupload_approved === 1 ||
                  item.submission
                    .reupload_approved ===
                  true) && (
                  <span
                    className="submission_status_badge pending-reupload"
                    style={{
                      backgroundColor: "#fff7ed",
                      color: "#c2410c",
                      border:
                        "1px solid #fed7aa",
                    }}
                  >
                    <i className="bi bi-hourglass-split"></i>{" "}
                    Reupload Pending
                  </span>
                )}

              {item.isSubmitted ? (
                <span
                  className={`submission_status_badge submitted ${item.status}`}
                >
                  <i className="bi bi-check-circle-fill"></i>{" "}
                  {item.status === "late"
                    ? "Submitted Late"
                    : "Submitted"}{" "}
                  {item.submission?.attempts
                    ? `(Attempt ${item.submission.attempts}/3)`
                    : ""}
                </span>
              ) : item.isOverdue ? (
                <span className="submission_status_badge overdue">
                  <i className="bi bi-exclamation-circle-fill"></i>{" "}
                  Overdue
                </span>
              ) : (
                <span className="submission_status_badge pending">
                  <i className="bi bi-clock-history"></i>{" "}
                  Pending Submission
                </span>
              )}
            </div>

            <p
              className="mt-3 mb-1 text-secondary"
              style={{
                fontSize: "13.5px",
                lineHeight: "1.6",
                fontWeight: 500,
              }}
            >
              {item.description}
            </p>

            {renderMiniSubmittedFile(item)}

            <div className="as_actions mt-4">
              {(!item.isSubmitted ||
                item.submission
                  ?.reupload_approved === 1 ||
                item.submission
                  ?.reupload_approved ===
                true) &&
                (item.submission &&
                  item.submission.attempts &&
                  item.submission.attempts >= 3 ? (
                  <span
                    className="btn_upload_disabled text-danger fw-bold d-inline-flex align-items-center gap-1 py-1"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    Attempt Limit Reached (3/3)
                  </span>
                ) : (
                  <label
                    className={`btn_upload ${item.status === "late"
                      ? "late"
                      : "pending"
                      }`}
                    style={{
                      cursor: "pointer",
                      margin: 0,
                    }}
                  >
                    <i
                      className={`bi ${item.status === "late"
                        ? "bi-exclamation-triangle"
                        : "bi-cloud-arrow-up"
                        } me-1`}
                    ></i>

                    {item.isSubmitted
                      ? item.status === "late"
                        ? `Resubmit Late (Attempt ${(item.submission
                          ?.attempts || 0) +
                        1
                        }/3)`
                        : `Resubmit (Attempt ${(item.submission
                          ?.attempts || 0) +
                        1
                        }/3)`
                      : item.status === "late"
                        ? "Late Upload"
                        : "Upload Submission"}

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.webp"
                      style={{
                        display: "none",
                      }}
                      onChange={(
                        event: ChangeEvent<HTMLInputElement>
                      ) => {
                        const selectedFile =
                          event.target.files?.[0];

                        if (selectedFile) {
                          handleUpload(
                            item.id,
                            selectedFile,
                            "mini"
                          );
                        }

                        event.target.value = "";
                      }}
                    />
                  </label>
                ))}

              <button
                className={`btn_brief ${expandedBriefId === item.id
                  ? "active"
                  : ""
                  }`}
                onClick={() =>
                  setExpandedBriefId(
                    expandedBriefId === item.id
                      ? null
                      : item.id
                  )
                }
              >
                {expandedBriefId === item.id
                  ? "Hide Feedback"
                  : "View Details & History"}
              </button>
            </div>
          </div>

          <div
            className={`as_status_badge ${item.status}`}
          >
            {item.scoreText}
          </div>
        </div>

        {expandedBriefId === item.id && (
          <div className="assignment_brief_box mt-3 p-3 border-top bg-light rounded-bottom">
            {renderMiniFeedback(item)}
          </div>
        )}
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * MAIN PROJECT
   * ---------------------------------------------------------
   */

  const renderMainProject = (
    item: ProcessedProject
  ) => {
    const submissions = item.submissions || {};

    const sub1 = submissions["1"];
    const sub2 = submissions["2"];
    const sub3 = submissions["3"];

    const isSub1Evaluated =
      !!sub1 &&
      (sub1.status === "evaluated" ||
        sub1.status === "graded") &&
      !sub1.reupload_approved;

    const isSub2Evaluated =
      !!sub2 &&
      (sub2.status === "evaluated" ||
        sub2.status === "graded") &&
      !sub2.reupload_approved;

    const isSub3Evaluated =
      !!sub3 &&
      (sub3.status === "evaluated" ||
        sub3.status === "graded") &&
      !sub3.reupload_approved;

    let currentReview = 1;

    if (
      isSub1Evaluated &&
      (!sub2 || !isSub2Evaluated)
    ) {
      currentReview = 2;
    }

    if (
      isSub1Evaluated &&
      isSub2Evaluated &&
      (!sub3 || !isSub3Evaluated)
    ) {
      currentReview = 3;
    }

    if (
      isSub1Evaluated &&
      isSub2Evaluated &&
      isSub3Evaluated
    ) {
      currentReview = 3;
    }

    let step1State = "locked";
    let step2State = "locked";
    let step3State = "locked";

    if (isSub1Evaluated) {
      step1State = "completed";
    } else if (currentReview === 1) {
      step1State = "active";
    }

    if (isSub2Evaluated) {
      step2State = "completed";
    } else if (currentReview === 2) {
      step2State = "active";
    }

    if (isSub3Evaluated) {
      step3State = "completed";
    } else if (currentReview === 3) {
      step3State = "active";
    }

    return (
      <div
        key={item.id}
        className="main_project_card mb-4"
      >
        <div className="mp_header">
          <div>
            <h3 className="mp_title">
              {item.title}
            </h3>

            <p className="mp_subtitle">
              {item.module} • 3-review cycle
            </p>
          </div>

          <div className="mp_status">
            <span className="status_badge bg_light_blue text_primary">
              Review {currentReview}/3
            </span>
          </div>
        </div>

        <div className="stepper_container">
          <div
            className={`step ${step1State}`}
          >
            <div className="step_icon">
              {step1State === "completed" ? (
                <i className="bi bi-check"></i>
              ) : (
                "1"
              )}
            </div>

            <div className="step_label">
              Review 1
            </div>

            <div className="step_date">
              {sub1?.submitted_at
                ? new Date(
                  sub1.submitted_at
                ).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                })
                : step1State === "active"
                  ? "Active"
                  : ""}
            </div>
          </div>

          <div
            className={`step_line ${step1State === "completed"
              ? "completed_line"
              : ""
              }`}
          ></div>

          <div
            className={`step ${step2State}`}
          >
            <div className="step_icon">
              {step2State === "completed" ? (
                <i className="bi bi-check"></i>
              ) : (
                "2"
              )}
            </div>

            <div className="step_label">
              Review 2
            </div>

            <div className="step_date">
              {sub2?.submitted_at
                ? new Date(
                  sub2.submitted_at
                ).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                })
                : step2State === "active"
                  ? "Upcoming"
                  : ""}
            </div>
          </div>

          <div
            className={`step_line ${step2State === "completed"
              ? "completed_line"
              : ""
              }`}
          ></div>

          <div
            className={`step ${step3State}`}
          >
            <div className="step_icon">
              {step3State === "completed" ? (
                <i className="bi bi-check"></i>
              ) : (
                "3"
              )}
            </div>

            <div className="step_label">
              Review 3
            </div>

            <div className="step_date">
              {sub3?.submitted_at
                ? new Date(
                  sub3.submitted_at
                ).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                })
                : step3State === "active"
                  ? "Upcoming"
                  : ""}
            </div>
          </div>
        </div>

        <div className="reviews_list">
          {/* REVIEW 1 */}

          {step1State === "completed" ? (
            <div className="review_card review_completed">
              <h4 className="rc_title mb-2">
                {item.review_1_title} —{" "}
                <span className="text_success_dark">
                  <i className="bi bi-check-circle-fill"></i>{" "}
                  Completed
                </span>
              </h4>

              <p className="rc_desc">
                {sub1?.feedback ||
                  "Good job. Proceed to Review 2."}
              </p>

              {renderSubmittedFile(sub1)}

              {renderEvaluationDetails(sub1)}
            </div>
          ) : step1State === "active" ? (
            <div className="review_card review_active">
              <h4 className="rc_title mb-2">
                {item.review_1_title} — Deadline:{" "}
                {item.review_1_deadline
                  ? formatDate(
                    item.review_1_deadline
                  )
                  : "N/A"}
              </h4>

              <p className="rc_desc">
                Submit your work for Review 1.
              </p>

              {renderSubmittedFile(sub1)}

              <div className="rc_actions">
                {renderUploadBtn(
                  item,
                  1,
                  sub1
                )}
              </div>

              {renderEvaluationDetails(sub1)}
            </div>
          ) : (
            <div className="review_card review_locked">
              <h4 className="text_muted m-0">
                {item.review_1_title} — Locked
              </h4>
            </div>
          )}

          {/* REVIEW 2 */}

          {step2State === "completed" ? (
            <div className="review_card review_completed">
              <h4 className="rc_title mb-2">
                {item.review_2_title} —{" "}
                <span className="text_success_dark">
                  <i className="bi bi-check-circle-fill"></i>{" "}
                  Completed
                </span>
              </h4>

              <p className="rc_desc">
                {sub2?.feedback ||
                  "Good progress. Proceed to Review 3."}
              </p>

              {renderSubmittedFile(sub2)}

              {renderEvaluationDetails(sub2)}
            </div>
          ) : step2State === "active" ? (
            <div className="review_card review_active">
              <h4 className="rc_title mb-2">
                {item.review_2_title} — Deadline:{" "}
                {item.review_2_deadline
                  ? formatDate(
                    item.review_2_deadline
                  )
                  : "N/A"}
              </h4>

              <p className="rc_desc">
                Please address the feedback from
                Review 1.
              </p>

              {renderSubmittedFile(sub2)}

              <div className="rc_actions">
                {renderUploadBtn(
                  item,
                  2,
                  sub2
                )}
              </div>

              {renderEvaluationDetails(sub2)}
            </div>
          ) : (
            <div className="review_card review_locked">
              <h4 className="text_muted m-0">
                {item.review_2_title} — Locked
              </h4>
            </div>
          )}

          {/* REVIEW 3 */}

          {step3State === "completed" ? (
            <div className="review_card review_completed">
              <h4 className="rc_title mb-2">
                {item.review_3_title} —{" "}
                <span className="text_success_dark">
                  <i className="bi bi-check-circle-fill"></i>{" "}
                  Completed
                </span>
              </h4>

              <p className="rc_desc">
                {sub3?.feedback ||
                  "Final evaluation complete."}
              </p>

              {renderSubmittedFile(sub3)}

              {renderEvaluationDetails(sub3)}
            </div>
          ) : step3State === "active" ? (
            <div className="review_card review_active">
              <h4 className="rc_title mb-2">
                {item.review_3_title} — Deadline:{" "}
                {item.review_3_deadline
                  ? formatDate(
                    item.review_3_deadline
                  )
                  : "N/A"}
              </h4>

              <p className="rc_desc">
                Final submission & complete
                evaluation.
              </p>

              {renderSubmittedFile(sub3)}

              <div className="rc_actions">
                {renderUploadBtn(
                  item,
                  3,
                  sub3
                )}
              </div>

              {renderEvaluationDetails(sub3)}
            </div>
          ) : (
            <div className="review_card review_locked">
              <h4 className="text_muted m-0">
                {item.review_3_title} — Locked
              </h4>
            </div>
          )}
        </div>
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * MAIN JSX
   * ---------------------------------------------------------
   */

  return (
    <div className="dashboard_layout">
      <Sidebar
        activePage="projects"
        isOpen={isSidebarOpen}
        onClose={() =>
          setIsSidebarOpen(false)
        }
      />

      <div
        className={`sidebar_overlay ${isSidebarOpen ? "show" : ""
          }`}
        onClick={() =>
          setIsSidebarOpen(false)
        }
      ></div>

      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() =>
          setIsNotifOpen(false)
        }
        notifications={[]}
      />

      <div className="dashboard_main_content">
        <header className="dashboard_top_header">
          <div className="profile_breadcrumb">
            <h2>
              Live Courses{" "}
              <span>/ Projects</span>
            </h2>
          </div>

          <div
            className="notification_bell_top"
            onClick={() =>
              setIsNotifOpen(true)
            }
          >
            <i className="bi bi-bell"></i>
          </div>
        </header>

        <div className="assignments_container">
          {/* TABS */}

          <div
            className="assignments_tabs"
            style={{
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              className={`tab_btn text-center justify-content-center ${activeTab === "mini"
                ? "active"
                : ""
                }`}
              onClick={() =>
                setActiveTab("mini")
              }
            >
              Mini Projects
            </button>

            <button
              type="button"
              className={`tab_btn text-center justify-content-center ${activeTab === "main"
                ? "active"
                : ""
                }`}
              onClick={() =>
                setActiveTab("main")
              }
            >
              Main Projects
            </button>
          </div>

          {/* PROJECT LIST */}

          <div className="assignment_list">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading...
                  </span>
                </div>
              </div>
            ) : displayedProjects.length > 0 ? (
              displayedProjects.map((item) =>
                activeTab === "mini"
                  ? renderMiniProject(item)
                  : renderMainProject(item)
              )
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-clipboard-x display-1 text-muted opacity-25"></i>

                <p className="mt-3 text-muted">
                  No {activeTab} projects found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .preview_image_wrapper:hover
          .preview_overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default Projects;