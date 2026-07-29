"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./style.css";

// const BASE_API_URL = "http://localhost:5000/api/";
const BASE_API_URL = "https://crm.velearn.in/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://crm.velearn.in/public/uploads/";
// const BASE_API_URL = "https://crm.velearn.in/api/";
// const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
// const BASE_DYNAMIC_IMAGE_URL =
//     "https://crm.velearn.in/public/uploads/";

interface Blog {
    id: number;
    title: string;
    image: string;
    published_date: string;
    descriptions: string[];
}

export default function Blogs() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${BASE_API_URL}blogs`)
            .then((response) => response.json())
            .then((data) => {
                if (data.status) {
                    setBlogs(data.data);
                } else {
                    setError("Failed to fetch blogs");
                }
            })
            .catch(() => {
                setError("Something went wrong");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 3);
    };

    const visibleBlogs = blogs.slice(0, visibleCount);

    if (loading) {
        return (
            <div className="text-center py-5">
                Loading blogs...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-danger py-5">
                {error}
            </div>
        );
    }

    if (!blogs.length) {
        return (
            <div className="text-center py-5">
                <h4>No blogs to display</h4>
                <p className="text-muted">
                    Please check back later.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Banner Section */}
            <section className="blog_banner py-3 py-lg-0">
                <div className="section_container">
                    <div className="row">
                        <div className="col-lg-8 d-flex flex-column justify-content-center">
                            <h1 className="text-white fw-bold">
                                Learn In-Demand Tech Skills Today.
                                <br />
                                Build a Future-Ready Career Tomorrow.
                            </h1>

                            <p className="text-white mt-3">
                                Insights, guides, and expert advice on AI,
                                Full Stack, Data Science, Cloud, and
                                emerging technologies shaping the future.
                            </p>
                        </div>

                        <div className="col-lg-4">
                            <div className="px-lg-5 py-3">
                                <Image
                                    src={`${BASE_IMAGE_URL}blogs/blog-banner-right.png`}
                                    className="w-100 h-auto"
                                    height={320}
                                    width={320}
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Cards Section */}
            <section className="blog_parent_body py-4">
                <div className="section_container">
                    <div className="row justify-content-center">
                        <div className="col-lg-11">
                            <div className="row">
                                {visibleBlogs.map((blog) => (
                                    <div
                                        className="col-lg-4 my-3"
                                        key={blog.id}
                                    >
                                        <div className="blog_parent_card">
                                            <div className="bg-white blog_parent_card_inner">
                                                <div className="mb-3">
                                                    <Image
                                                        src={`${BASE_DYNAMIC_IMAGE_URL.replace("/uploads/", "/blogs/")}${blog.image.replace("/../public/", "")}`}
                                                        className="w-100"
                                                        width={320}
                                                        height={320}
                                                        alt={blog.title}
                                                    />
                                                </div>

                                                <h5 className="text-c1 fw-bold">
                                                    {blog.title}
                                                </h5>

                                                <p className="text-c2 fw-normal small">
                                                    <i className="bi bi-calendar2-minus pe-2"></i>
                                                    {new Date(
                                                        blog.published_date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </p>

                                                <div className="blog_description">
                                                    {blog.descriptions?.map(
                                                        (para, index) => (
                                                            <p key={index}>{para}</p>
                                                        )
                                                    )}
                                                </div>

                                                <div className="col-12 mt-auto d-flex justify-content-center">
                                                    <Link
                                                        href={`/blog-details/${blog.id}`}
                                                    >
                                                        <div className="read_more_butt mt-4 d-flex align-items-center justify-content-center">
                                                            <span>Read more</span>
                                                            <div>
                                                                <i className="bi bi-arrow-right-short"></i>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Show More Button */}
                            {visibleCount < blogs.length && (
                                <div className="d-flex justify-content-center mt-3">
                                    <button
                                        className="blog_more_butt"
                                        onClick={handleShowMore}
                                    >
                                        Show More
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}