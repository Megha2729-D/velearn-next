"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./style.css";

const BASE_IMAGE_URL = "https://velearn.in/assets/images/";

export default function PrivacyPolicy() {
    return (
        <>
            <section className="blog_banner ">
                <div className="policy-header py-5">
                    <h1 className="text-white fw-bold">Privacy Policy</h1>
                    <p className="text-white">Last Updated: {new Date().getFullYear()}</p>
                </div>
            </section>

            <div className="section_container">
                <div className="policy-content">

                    <section>
                        <h2>1. Introduction</h2>
                        <p>
                            Velearn is committed to protecting your privacy. This Privacy Policy
                            explains how we collect, use, store, and protect your personal
                            information when you use our website, courses, webinars, blogs,
                            and other services.
                        </p>
                    </section>

                    <section>
                        <h2>2. Information We Collect</h2>
                        <p>We may collect the following types of information:</p>
                        <ul>
                            <li>Personal details such as name, email address, and phone number.</li>
                            <li>Account information when you register on the Velearn platform.</li>
                            <li>Payment details when purchasing live courses, recorded courses, or webinars.</li>
                            <li>Course activity data including enrollment, progress, and completion.</li>
                            <li>Technical information such as IP address, device type, and browser data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. How We Use Your Information</h2>
                        <p>Your information may be used for the following purposes:</p>
                        <ul>
                            <li>To provide access to courses, webinars, and learning materials.</li>
                            <li>To process course enrollments and payments.</li>
                            <li>To communicate updates, notifications, and support information.</li>
                            <li>To improve our website, learning content, and user experience.</li>
                            <li>To send important announcements, offers, or educational updates.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Payment Information</h2>
                        <p>
                            Payments made on the Velearn platform are processed through secure
                            third-party payment gateways. We do not store sensitive payment
                            information such as credit or debit card details on our servers.
                        </p>
                    </section>

                    <section>
                        <h2>5. Sharing of Information</h2>
                        <p>
                            Velearn does not sell, rent, or trade your personal information.
                            Your data may only be shared with trusted service providers
                            such as payment processors, hosting providers, or analytics
                            tools that help us operate our platform and deliver services.
                        </p>
                    </section>

                    <section>
                        <h2>6. Cookies and Tracking Technologies</h2>
                        <p>
                            Our website may use cookies and similar technologies to enhance
                            user experience, analyze traffic, and improve our services.
                            Users may disable cookies through their browser settings,
                            although some features of the website may not function properly.
                        </p>
                    </section>

                    <section>
                        <h2>7. Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect your
                            personal data from unauthorized access, disclosure, or misuse.
                            However, no internet transmission method is completely secure.
                        </p>
                    </section>

                    <section>
                        <h2>8. Third-Party Links</h2>
                        <p>
                            Our website may contain links to third-party websites.
                            Velearn is not responsible for the privacy practices or
                            content of external websites.
                        </p>
                    </section>

                    <section>
                        <h2>9. Your Rights</h2>
                        <p>
                            Users have the right to access, update, or request deletion
                            of their personal information. If you wish to modify or remove
                            your data, please contact our support team.
                        </p>
                    </section>

                    <section>
                        <h2>10. Changes to This Privacy Policy</h2>
                        <p>
                            Velearn may update this Privacy Policy from time to time.
                            Any changes will be posted on this page with an updated
                            revision date.
                        </p>
                    </section>

                    <section>
                        <h2>11. Contact Us</h2>
                        <p>
                            If you have any questions regarding this Privacy Policy,
                            please contact us.
                        </p>
                        <p>Email: support@velearn.in</p>
                    </section>

                </div>
            </div>
        </>
    );
}