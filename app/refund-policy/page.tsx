"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./style.css";

const BASE_IMAGE_URL = "https://velearn-next.onrender.com/assets/images/";

export default function RefundPolicy() {
    return (
        <>
            <section className="blog_banner ">
                <div className="policy-header py-5">
                    <h1 className="text-white fw-bold">Refund Policy</h1>
                    <p className="text-white">Last Updated: {new Date().getFullYear()}</p>
                </div>
            </section>

            <div className="section_container">
                <div className="policy-content">

                    <section>
                        <h2>1. Overview</h2>
                        <p>
                            Velearn provides online educational services including live courses,
                            recorded courses, webinars, and learning resources. We aim to
                            deliver high-quality training and value to all learners.
                            Please review our refund policy carefully before purchasing
                            any course or service on our platform.
                        </p>
                    </section>

                    <section>
                        <h2>2. Eligibility for Refund</h2>
                        <p>
                            Refund requests may be considered under the following conditions:
                        </p>
                        <ul>
                            <li>The refund request is submitted within 7 days of course purchase.</li>
                            <li>The user has not accessed a significant portion of the course content.</li>
                            <li>There is a duplicate payment or accidental transaction.</li>
                            <li>Technical issues from our platform prevented access to the course.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Non-Refundable Situations</h2>
                        <p>
                            Refunds will not be issued in the following cases:
                        </p>
                        <ul>
                            <li>If the refund request is made after the refund period.</li>
                            <li>If the user has accessed a substantial part of the course.</li>
                            <li>If the course has been completed.</li>
                            <li>If the purchase was made during special offers or promotional discounts (unless otherwise stated).</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Live Courses</h2>
                        <p>
                            For live instructor-led courses, refund requests must be made
                            before the second session begins. Once multiple sessions
                            have been attended, refunds may not be available.
                        </p>
                    </section>

                    <section>
                        <h2>5. Recorded Courses</h2>
                        <p>
                            Recorded courses are eligible for refund only if the request
                            is made within the refund period and the majority of the
                            course content has not been accessed.
                        </p>
                    </section>

                    <section>
                        <h2>6. Webinar Registrations</h2>
                        <p>
                            Webinar registrations are generally non-refundable. However,
                            if a webinar is cancelled by Velearn, participants will
                            receive either a full refund or an option to attend a
                            future webinar session.
                        </p>
                    </section>

                    <section>
                        <h2>7. Refund Processing</h2>
                        <p>
                            Once a refund request is approved, the refund will be
                            processed within 7–10 business days. The amount will be
                            credited to the original payment method used during the
                            purchase.
                        </p>
                    </section>

                    <section>
                        <h2>8. Contact Us</h2>
                        <p>
                            If you have any questions or would like to request a refund,
                            please contact our support team.
                        </p>
                        <p>Email: support@velearn.in</p>
                    </section>

                </div>
            </div>
        </>
    );
}