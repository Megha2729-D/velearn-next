"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import Preloader from "@/components/Preloader";

const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";

const categories = [
    "Software Development",
    "Web Development",
    "IT Infrastructure Management",
    "Business Management",
    "Special Programs",
];

export default function RecordedCoursePage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const filter =
        (params?.filter as string) ||
        searchParams.get("filter") ||
        undefined;

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState(
        "Software Development"
    );
    const [courses, setCourses] = useState<any[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);

    const [visibleCount, setVisibleCount] = useState({
        paid: 8,
        free: 8,
        combo: 8,
    });

    const observer = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const courseRes = await fetch(`${BASE_API_URL}recorded-course`);
                const courseData = await courseRes.json();

                if (courseData.status) {
                    setCourses(courseData.data);
                }

                const user = JSON.parse(localStorage.getItem("user") || "null");

                if (user) {
                    const enrolledRes = await fetch(
                        `${BASE_API_URL}my-courses/${user.id}`
                    );

                    const enrolledData = await enrolledRes.json();

                    if (enrolledData.status) {
                        setEnrolledCourses(enrolledData.data.all || []);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        observer.current = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !isMoreLoading &&
                    hasMoreToLoad()
                ) {
                    handleLoadMore();
                }
            },
            {
                rootMargin: "100px",
                threshold: 0.1,
            }
        );

        if (loadMoreRef.current) {
            observer.current.observe(loadMoreRef.current);
        }

        return () => {
            observer.current?.disconnect();
        };
    }, [
        isLoading,
        isMoreLoading,
        courses,
        visibleCount,
        search,
        activeCategory,
    ]);

    useEffect(() => {
        const hash = window.location.hash;

        if (hash) {
            setTimeout(() => {
                const element = document.querySelector(hash);

                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 300); // Wait until courses are rendered
        }
    }, [isLoading]);

    const hasMoreToLoad = () => {
        const types = filter ? [filter] : ["paid", "free", "combo"];

        return types.some((type) => {
            const filtered = courses
                .filter((c) => c.course_type === type)
                .filter((c) => c.categories?.includes(activeCategory))
                .filter((c) =>
                    c.title.toLowerCase().includes(search.toLowerCase())
                );

            return (
                filtered.length >
                visibleCount[type as keyof typeof visibleCount]
            );
        });
    };

    const handleLoadMore = () => {
        setIsMoreLoading(true);

        setTimeout(() => {
            setVisibleCount((prev) => ({
                paid: prev.paid + 8,
                free: prev.free + 8,
                combo: prev.combo + 8,
            }));

            setIsMoreLoading(false);
        }, 1000);
    };

    const renderExploreSection = () => {
        return (
            <section className="explore_courses_sec py-5">
                <div className="section_container">
                    <h2 className="text-center fw-bold mb-4">
                        Explore <span className="text-c2">Courses</span> By{" "}
                        <span className="text-c2">Categories</span>
                    </h2>

                    <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                        {categories.map((cat, index) => (
                            <button
                                key={index}
                                className={`category_pill ${activeCategory === cat ? "active" : ""
                                    }`}
                                onClick={() => {
                                    setActiveCategory(cat);

                                    setVisibleCount({
                                        paid: 8,
                                        free: 8,
                                        combo: 8,
                                    });
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="d-flex justify-content-center mb-4">
                        <div className="search_box">
                            <div className="search_box_inner">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);

                                        setVisibleCount({
                                            paid: 8,
                                            free: 8,
                                            combo: 8,
                                        });
                                    }}
                                />

                                <i className="bi bi-search"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    const renderCoursesByType = (
        courseType: "paid" | "free" | "combo",
        badgeText: string,
        badgeClass: string
    ) => {
        const filteredCourses = courses
            .filter((c) => c.course_type === courseType)
            .filter((c) => c.categories?.includes(activeCategory))
            .filter((c) =>
                c.title.toLowerCase().includes(search.toLowerCase())
            );

        const visibleCourses = filteredCourses.slice(
            0,
            visibleCount[courseType]
        );

        return (
            <section id={courseType} className="pt-3 pb-5">
                <div className="section_container live_courses_sec">
                    <div className="col-12 d-flex justify-content-center mb-4">
                        <div className="col-lg-6 text-center">
                            <h3 className="section_base_heading text-black">
                                <span className="text-c2">{badgeText} Courses</span>
                            </h3>
                        </div>
                    </div>

                    <div className="row">
                        {visibleCourses.length > 0 ? (
                            visibleCourses.map((course: any, index: number) => {
                                const isEnrolled = enrolledCourses.some(
                                    (ec: any) =>
                                        ec.id === course.id &&
                                        ec.enrollment?.status !== "inactive"
                                );

                                const targetUrl = isEnrolled
                                    ? `/learn/${course.slug}`
                                    : `/course-details/${course.slug}`;

                                return (
                                    <div
                                        className="col-xl-3 col-lg-3 col-md-6 col-12 mb-4"
                                        key={course.id}
                                    >
                                        <Link
                                            href={{
                                                pathname: targetUrl,
                                                query: {
                                                    courseId: course.id,
                                                    courseType: course.course_type,
                                                },
                                            }}
                                        >
                                            <div
                                                className={`card_parent h-100 d-flex flex-column ${index % 2 === 0 ? "one" : "two"
                                                    }`}
                                            >
                                                <div className="card_img_parent overflow-hidden">
                                                    <Image
                                                        src={`${BASE_DYNAMIC_IMAGE_URL}courses/${course.image}`}
                                                        className="card_img w-100"
                                                        alt={course.title}
                                                        height={200}
                                                        width={300}
                                                        loading="lazy"
                                                    />
                                                </div>

                                                <div className="pt-3 d-flex flex-column flex-grow-1">
                                                    <h4 className="fw-bold">{course.title}</h4>

                                                    <p className="mb-2">
                                                        {course.sub_description}
                                                    </p>

                                                    <div className="d-flex justify-content-between align-items-center gap-3 w-100 mt-auto overflow-hidden">
                                                        <div className="recorded_course_duration">
                                                            <div className="my-2">
                                                                <i className="bi bi-clock pe-1"></i>
                                                                {course.recorded_content} hours
                                                            </div>

                                                            {(course.course_type === "paid" ||
                                                                course.course_type === "combo") && (
                                                                    <div className="d-flex align-items-center mt-2">
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>

                                                                        <span>
                                                                            ({course.rating || "4.6"})
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>

                                                        <div className="d-flex align-items-center gap-2">
                                                            {(course.course_type === "paid" ||
                                                                course.course_type === "combo") ? (
                                                                <>
                                                                    <span className="new_price">
                                                                        ₹ {course.buy_price}
                                                                    </span>

                                                                    <span className="old_price">
                                                                        <s>₹ {course.mrp_price}</s>
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                course.course_type === "free" && (
                                                                    <div className="recorded_course_duration">
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        <i className="bi bi-star-fill pe-1"></i>
                                                                        (4.6)
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={badgeClass}>{badgeText}</div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-12 text-center py-5">
                                <div
                                    className="no_courses_empty_state p-5 rounded-4 shadow-sm bg-light border border-dashed text-center mx-auto"
                                    style={{ maxWidth: 600 }}
                                >
                                    <div className="mb-4">
                                        <i className="bi bi-book-half display-1 text-muted opacity-25"></i>
                                    </div>

                                    <h3 className="fw-bold mb-3">
                                        No {badgeText} Courses Available
                                    </h3>

                                    <p className="text-muted mb-4">
                                        We currently don't have any{" "}
                                        {badgeText.toLowerCase()} courses listed under{" "}
                                        <strong>{activeCategory}</strong> category.

                                        {search && (
                                            <span>
                                                {" "}
                                                matching <strong>"{search}"</strong>.
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    };
    if (isLoading) {
        return <Preloader />;
    }

    return (
        <>
            {renderExploreSection()}

            {(!filter || filter === "paid") &&
                renderCoursesByType("paid", "Paid", "paid_butt")}

            {(!filter || filter === "free") &&
                renderCoursesByType("free", "Free", "free_butt")}

            {(!filter || filter === "combo") &&
                renderCoursesByType("combo", "Combo", "combo_butt")}

            {hasMoreToLoad() && (
                <div
                    ref={loadMoreRef}
                    className="d-flex justify-content-center py-5 mb-5"
                >
                    <div
                        className="loader"
                        style={{ transform: "scale(0.6)" }}
                    >
                        <div className="spinner"></div>

                        <div className="logo-bg">
                            <Image
                                src="https://velearn.in/assets/images/logo-icon.png"
                                alt=""
                                style={{ width: "40px" }}
                                width={200}
                                height={200}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}