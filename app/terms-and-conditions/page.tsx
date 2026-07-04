"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./style.css";

const BASE_IMAGE_URL = "https://velearn-next.onrender.com/assets/images/";

export default function TermsAndConditions() {
    return (
        <>
            <section className="blog_banner ">
                <div className="policy-header py-5">
                    <h1 className="text-white fw-bold">Terms & Conditions</h1>
                    <p className="text-white">Last Updated: {new Date().getFullYear()}</p>
                </div>
            </section>

            <div className="section_container">
                <div className="policy-content">

                    <section>
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to Velearn. These Terms and Conditions govern your use of our
                            website, courses, webinars, blogs, and other educational services.
                            By accessing or using the Velearn platform, you agree to comply with
                            these terms. If you do not agree with any part of these terms,
                            please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2>2. Our Services</h2>
                        <p>
                            Velearn provides online learning resources including live courses,
                            recorded courses, webinars, and blog content across multiple
                            categories such as Software Development, IT Infrastructure,
                            Data Science, Digital Marketing, Business Software,
                            and Web Development & Design.
                        </p>

                        <p>
                            Our courses include topics such as Python Programming,
                            Java Programming, MongoDB, JavaScript, React JS,
                            Node.js, SQL, Manual Testing, Selenium Automation,
                            Cloud Computing, DevOps, Ethical Hacking, Data Analytics,
                            Machine Learning, Digital Marketing, UI/UX Design and more.
                        </p>
                    </section>

                    <section>
                        <h2>3. Use of Platform</h2>
                        <p>
                            Users agree to use the Velearn platform only for lawful
                            educational purposes. You must not attempt to copy,
                            distribute, reproduce, sell, or share course materials
                            without written permission from Velearn.
                        </p>
                    </section>

                    <section>
                        <h2>4. Account Registration</h2>
                        <p>
                            To access certain services such as course enrollment,
                            users may need to create an account. You are responsible
                            for maintaining the confidentiality of your account
                            credentials and for all activities under your account.
                        </p>
                    </section>

                    <section>
                        <h2>5. Course Enrollment & Access</h2>
                        <p>
                            After successful payment, users will gain access to
                            the selected live course or recorded course. Access
                            duration may vary depending on the course program.
                            Velearn reserves the right to update course content
                            or structure to improve learning outcomes.
                        </p>
                    </section>

                    <section>
                        <h2>6. Payments & Pricing</h2>
                        <p>
                            All payments must be completed through the official
                            payment gateways available on the Velearn website.
                            Course prices, offers, and availability may change
                            at any time without prior notice.
                        </p>
                    </section>

                    <section>
                        <h2>7. Intellectual Property</h2>
                        <p>
                            All content available on Velearn including videos,
                            course materials, graphics, text, blogs, and training
                            resources are the intellectual property of Velearn.
                            Unauthorized copying, sharing, or redistribution
                            of any material is strictly prohibited.
                        </p>
                    </section>

                    <section>
                        <h2>8. Webinar & Event Participation</h2>
                        <p>
                            Velearn may organize webinars, workshops, or live
                            training sessions. Participation in these events
                            must follow the guidelines shared by the instructor
                            or host. Disruptive behavior may result in removal
                            from the session.
                        </p>
                    </section>

                    <section>
                        <h2>9. Limitation of Liability</h2>
                        <p>
                            Velearn is not responsible for any direct or
                            indirect damages resulting from the use of
                            our courses, educational materials, or website.
                            Learning outcomes may vary depending on individual effort.
                        </p>
                    </section>

                    <section>
                        <h2>10. Changes to Terms</h2>
                        <p>
                            Velearn reserves the right to update or modify
                            these Terms and Conditions at any time.
                            Continued use of the platform after changes
                            indicates acceptance of the revised terms.
                        </p>
                    </section>

                    <section>
                        <h2>11. Contact Information</h2>
                        <p>
                            If you have any questions regarding these
                            Terms and Conditions, please contact us.
                        </p>
                        <p>Email: support@velearn.in</p>
                    </section>

                </div>
            </div>
        </>
    );
}