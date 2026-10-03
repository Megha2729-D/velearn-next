// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import "./style.css"
// import { toast } from "react-hot-toast";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import Script from "next/script";
// interface CourseDetailsPageProps {
//     slugId: string;
// }
// interface User {
//     id: number;
//     name: string;
//     email: string;
//     phone?: string;
//     phonenumber?: string;
// }
// interface FAQ {
//     id: number;
//     course_id: number;
//     question: string;
//     answer: string;
// }
// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }
// interface Course {
//     id: number;
//     // your existing fields...

//     faqs?: FAQ[];
// }
// // const BASE_API_URL = "http://localhost:5000/api/";
// const BASE_API_URL = "https://crm.velearn.in/api/";
// const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
// const BASE_DYNAMIC_IMAGE_URL =
//     "https://crm.velearn.in/public/uploads/";

// export default function CourseDetailsPage({
//     slugId,
// }: CourseDetailsPageProps) {
//     const [showModal, setShowModal] = useState(false);
//     const [showEnrollFormModal, setShowEnrollFormModal] = useState(false);
//     const [showConfirmModal, setShowConfirmModal] = useState(false);
//     const [showEnrollSuccessModal, setShowEnrollSuccessModal] = useState(false);

//     const [course, setCourse] = useState<any>(null);
//     const [user, setUser] = useState<any>(null);
//     const [contentLeft, setContentLeft] = useState<number>(0);
//     const tabsWrapperRef = useRef<HTMLDivElement | null>(null);
//     const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

//     const listRef = useRef<HTMLUListElement | null>(null);
//     const [isScrollEnd, setIsScrollEnd] = useState(false);
//     const formColRef = useRef<HTMLDivElement>(null);
//     const [fixedStyle, setFixedStyle] = useState({
//         left: 0,
//         width: 0,
//     });

//     const [isEnrolled, setIsEnrolled] = useState(false);
//     const [activeTab, setActiveTab] = useState(1);
//     const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
//     const [activeTabMain, setActiveTabMain] = useState("overview");

//     const topPartRef = useRef<HTMLDivElement>(null);
//     const [stopFixed, setStopFixed] = useState(false);
//     const [name, setName] = useState("");
//     const [phone, setPhone] = useState("");
//     const [email, setEmail] = useState("");
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         phone: "",
//     });

//     const [errors, setErrors] = useState({
//         name: "",
//         email: "",
//         phone: "",
//     });
//     const router = useRouter();

//     const [isProcessingPayment, setIsProcessingPayment] = useState(false);
//     const [paymentData, setPaymentData] = useState<any>(null);

//     const goToLearnPage = () => {
//         if (course?.id) {
//             router.push(`/learn/${course.id}`);
//         } else {
//             router.push("/my-courses");
//         }
//     };

//     const handleSubmit = async (
//         e: React.FormEvent<HTMLFormElement>
//     ) => {
//         e.preventDefault();

//         if (!validate()) return;

//         setShowEnrollFormModal(false);
//         setShowConfirmModal(true);
//     };

//     const validateForm = () => {
//         const newErrors: {
//             name?: string;
//             email?: string;
//             phone?: string;
//         } = {};

//         const cleanName = formData.name.trim();
//         const cleanPhone = formData.phone.trim();
//         const cleanEmail = formData.email.trim();

//         if (!cleanName) {
//             newErrors.name = "Name is required";
//         }

//         if (!cleanPhone) {
//             newErrors.phone = "Phone is required";
//         } else if (!/^[0-9]{10}$/.test(cleanPhone)) {
//             newErrors.phone = "Enter valid 10 digit phone number";
//         }

//         if (!cleanEmail) {
//             newErrors.email = "Email is required";
//         } else if (
//             !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
//         ) {
//             newErrors.email = "Enter valid email address";
//         }

//         setErrors({
//             name: newErrors.name || "",
//             email: newErrors.email || "",
//             phone: newErrors.phone || "",
//         });

//         return Object.keys(newErrors).length === 0;
//     };

//     const getCourseType = () => {
//         return String(
//             course?.course_type ||
//             course?.type ||
//             ""
//         ).toLowerCase().trim();
//     };

//     const handleCourseAction = () => {
//         // Not logged in → Login
//         if (!user) {
//             router.push("/login");
//             return;
//         }

//         // Already enrolled → Learn page
//         if (isEnrolled) {
//             goToLearnPage();
//             return;
//         }

//         // Logged in + not enrolled → Open enrollment form
//         setErrors({
//             name: "",
//             email: "",
//             phone: "",
//         });

//         setShowEnrollFormModal(true);
//     };

//     const handleEnroll = (
//         e?: React.FormEvent<HTMLFormElement>
//     ) => {
//         e?.preventDefault();

//         const storedUser = localStorage.getItem("user");

//         if (!storedUser) {
//             router.push("/login");
//             return;
//         }

//         if (!validateForm()) {
//             return;
//         }

//         setShowEnrollFormModal(false);
//         setShowConfirmModal(true);
//     };

//     /*
//      * ============================================================
//      * ENROLLMENT FLOW
//      *
//      * FREE:
//      *   Confirm modal -> enroll-now -> enrolled
//      *
//      * PAID / COMBO:
//      *   Confirm modal -> create-course-payment
//      *   -> Razorpay -> verify-course-payment
//      *   -> enroll-now -> enrolled
//      *
//      * IMPORTANT:
//      * For paid/combo courses, enroll-now is NEVER called before
//      * successful Razorpay payment verification.
//      * ============================================================
//      */

//     const getEnrollmentPayload = (loggedUser: any) => ({
//         name: formData.name.trim(),
//         phone: formData.phone.trim(),
//         email: formData.email.trim(),
//         lead_source: "Website",
//         course_id: Number(course.id),
//         auth_id: Number(loggedUser.id),
//     });

//     const parseApiResponse = async (response: Response) => {
//         const text = await response.text();

//         if (!text) {
//             return {};
//         }

//         try {
//             return JSON.parse(text);
//         } catch {
//             console.error("Invalid API response:", text);
//             throw new Error("Invalid server response.");
//         }
//     };

//     const enrollAfterPayment = async (
//         loggedUser: any,
//         paymentResponse: any
//     ) => {
//         const token = localStorage.getItem("token");

//         const enrollmentPayload = {
//             ...getEnrollmentPayload(loggedUser),

//             // Keep payment references with the final enrollment request.
//             // The backend can use these to associate the enrollment
//             // with the verified Razorpay payment.
//             razorpay_payment_id:
//                 paymentResponse?.razorpay_payment_id,

//             razorpay_order_id:
//                 paymentResponse?.razorpay_order_id,
//         };

//         console.log(
//             "FINAL ENROLLMENT PAYLOAD:",
//             enrollmentPayload
//         );

//         const enrollResponse = await fetch(
//             `${BASE_API_URL}enroll-now`,
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Accept: "application/json",
//                     ...(token
//                         ? {
//                             Authorization: `Bearer ${token}`,
//                         }
//                         : {}),
//                 },
//                 body: JSON.stringify(enrollmentPayload),
//             }
//         );

//         const enrollData =
//             await parseApiResponse(enrollResponse);

//         console.log(
//             "FINAL ENROLLMENT RESPONSE:",
//             enrollData
//         );

//         if (
//             !enrollResponse.ok ||
//             enrollData?.status !== true
//         ) {
//             throw new Error(
//                 enrollData?.message ||
//                 "Enrollment failed after successful payment."
//             );
//         }

//         return enrollData;
//     };

//     const confirmEnroll = async () => {
//         if (isProcessingPayment) {
//             return;
//         }

//         try {
//             setIsProcessingPayment(true);

//             const storedUser =
//                 localStorage.getItem("user");

//             if (!storedUser) {
//                 router.push("/login");
//                 return;
//             }

//             const loggedUser =
//                 JSON.parse(storedUser);

//             if (!course?.id) {
//                 toast.error(
//                     "Course information not available"
//                 );
//                 return;
//             }

//             const courseType = String(
//                 course?.course_type ||
//                 course?.type ||
//                 ""
//             )
//                 .toLowerCase()
//                 .trim();

//             console.log(
//                 "COURSE TYPE:",
//                 courseType
//             );

//             /*
//              * =====================================================
//              * FREE COURSE
//              * =====================================================
//              *
//              * Only free courses are enrolled directly from the
//              * "Yes, Enroll Now" confirmation button.
//              */
//             if (courseType === "free") {
//                 const token =
//                     localStorage.getItem("token");

//                 const payload =
//                     getEnrollmentPayload(loggedUser);

//                 console.log(
//                     "FREE ENROLLMENT PAYLOAD:",
//                     payload
//                 );

//                 const response = await fetch(
//                     `${BASE_API_URL}enroll-now`,
//                     {
//                         method: "POST",
//                         headers: {
//                             "Content-Type":
//                                 "application/json",
//                             Accept: "application/json",
//                             ...(token
//                                 ? {
//                                     Authorization:
//                                         `Bearer ${token}`,
//                                 }
//                                 : {}),
//                         },
//                         body: JSON.stringify(payload),
//                     }
//                 );

//                 const data =
//                     await parseApiResponse(response);

//                 console.log(
//                     "FREE ENROLLMENT RESPONSE:",
//                     data
//                 );

//                 if (
//                     !response.ok ||
//                     data?.status !== true
//                 ) {
//                     toast.error(
//                         data?.message ||
//                         "Enrollment failed"
//                     );
//                     return;
//                 }

//                 // Only now is the free course enrolled.
//                 setIsEnrolled(true);
//                 setShowConfirmModal(false);
//                 setShowEnrollFormModal(false);
//                 setShowEnrollSuccessModal(true);

//                 toast.success(
//                     data?.message ||
//                     "Enrollment successful!"
//                 );

//                 return;
//             }

//             /*
//              * =====================================================
//              * PAID / COMBO COURSE
//              * =====================================================
//              *
//              * DO NOT call enroll-now here.
//              *
//              * 1. Create Razorpay order.
//              * 2. Open Razorpay.
//              * 3. Verify payment.
//              * 4. ONLY after verification, call enroll-now.
//              * 5. Only after enroll-now succeeds, set isEnrolled=true.
//              */
//             setShowConfirmModal(false);

//             await createCoursePayment(
//                 getEnrollmentPayload(loggedUser),
//                 loggedUser
//             );
//         } catch (error: any) {
//             console.error(
//                 "Confirm enrollment error:",
//                 error
//             );

//             toast.error(
//                 error?.message ||
//                 "Something went wrong. Please try again."
//             );
//         } finally {
//             setIsProcessingPayment(false);
//         }
//     };

//     const createCoursePayment = async (
//         payload: any,
//         loggedUser: any
//     ) => {
//         try {
//             setIsProcessingPayment(true);

//             const token =
//                 localStorage.getItem("token");

//             /*
//              * IMPORTANT:
//              * This endpoint must ONLY create the Razorpay order.
//              *
//              * It must NOT enroll the user or make isEnrolled true.
//              */
//             const response = await fetch(
//                 `${BASE_API_URL}create-course-payment`,
//                 {
//                     method: "POST",
//                     headers: {
//                         "Content-Type":
//                             "application/json",
//                         Accept: "application/json",
//                         ...(token
//                             ? {
//                                 Authorization:
//                                     `Bearer ${token}`,
//                             }
//                             : {}),
//                     },
//                     body: JSON.stringify(payload),
//                 }
//             );

//             const data =
//                 await parseApiResponse(response);

//             console.log(
//                 "CREATE COURSE PAYMENT RESPONSE:",
//                 data
//             );

//             if (
//                 !response.ok ||
//                 data?.status !== true
//             ) {
//                 toast.error(
//                     data?.message ||
//                     "Unable to create payment order."
//                 );
//                 return;
//             }

//             const razorpayData =
//                 data?.razorpay;

//             if (!razorpayData?.order_id) {
//                 console.error(
//                     "Razorpay order ID missing:",
//                     data
//                 );

//                 toast.error(
//                     "Payment order could not be created."
//                 );
//                 return;
//             }

//             setPaymentData(data);

//             await openRazorpayCheckout(
//                 data,
//                 loggedUser
//             );
//         } catch (error) {
//             console.error(
//                 "Create payment order error:",
//                 error
//             );

//             toast.error(
//                 "Unable to start payment."
//             );
//         } finally {
//             setIsProcessingPayment(false);
//         }
//     };

//     const openRazorpayCheckout = async (
//         paymentDataResponse: any,
//         loggedUser: any
//     ) => {
//         try {
//             const loaded =
//                 await loadRazorpayScript();

//             if (!loaded) {
//                 toast.error(
//                     "Razorpay SDK failed to load. Are you online?"
//                 );
//                 return;
//             }

//             if (
//                 typeof window === "undefined" ||
//                 !window.Razorpay
//             ) {
//                 toast.error(
//                     "Razorpay is not available."
//                 );
//                 return;
//             }

//             const razorpayData =
//                 paymentDataResponse?.razorpay;

//             const razorpayKey =
//                 razorpayData?.key ||
//                 process.env
//                     .NEXT_PUBLIC_RAZORPAY_KEY_ID;

//             const razorpayOrderId =
//                 razorpayData?.order_id;

//             const amount =
//                 Number(razorpayData?.amount);

//             const currency =
//                 razorpayData?.currency ||
//                 "INR";

//             if (!razorpayKey) {
//                 toast.error(
//                     "Razorpay key is missing."
//                 );
//                 return;
//             }

//             if (!razorpayOrderId) {
//                 toast.error(
//                     "Razorpay order ID is missing."
//                 );
//                 return;
//             }

//             if (!amount) {
//                 toast.error(
//                     "Payment amount is missing."
//                 );
//                 return;
//             }

//             const options = {
//                 key: razorpayKey,
//                 amount,
//                 currency,
//                 name: "VeLearn",
//                 description:
//                     course?.title ||
//                     "Course Enrollment",
//                 order_id: razorpayOrderId,

//                 prefill: {
//                     name:
//                         formData.name ||
//                         loggedUser?.name ||
//                         "",

//                     email:
//                         formData.email ||
//                         loggedUser?.email ||
//                         "",

//                     contact:
//                         formData.phone ||
//                         loggedUser?.phone ||
//                         loggedUser?.phonenumber ||
//                         "",
//                 },

//                 notes: {
//                     course_id: String(
//                         course?.id || ""
//                     ),

//                     user_id: String(
//                         loggedUser?.id || ""
//                     ),

//                     payment_order_id:
//                         String(
//                             razorpayOrderId
//                         ),
//                 },

//                 theme: {
//                     color: "#192853",
//                 },

//                 handler:
//                     async (
//                         paymentResponse: any
//                     ) => {
//                         console.log(
//                             "RAZORPAY PAYMENT SUCCESS:",
//                             paymentResponse
//                         );

//                         /*
//                          * Payment popup says success, but we STILL
//                          * do not mark the user as enrolled here.
//                          *
//                          * First verify the Razorpay signature
//                          * on the backend.
//                          */
//                         await verifyPayment(
//                             paymentResponse,
//                             loggedUser
//                         );
//                     },

//                 modal: {
//                     ondismiss: () => {
//                         console.log(
//                             "Razorpay popup closed/cancelled"
//                         );

//                         setIsProcessingPayment(
//                             false
//                         );

//                         setPaymentData(null);

//                         // Payment cancelled = not enrolled.
//                         setIsEnrolled(false);

//                         toast.error(
//                             "Payment cancelled. You are not enrolled in this course."
//                         );
//                     },
//                 },
//             };

//             console.log(
//                 "RAZORPAY OPTIONS:",
//                 options
//             );

//             const razorpay =
//                 new window.Razorpay(options);

//             razorpay.open();
//         } catch (error) {
//             console.error(
//                 "Razorpay initialization error:",
//                 error
//             );

//             toast.error(
//                 "Unable to start payment."
//             );
//         }
//     };

//     const loadRazorpayScript =
//         (): Promise<boolean> => {
//             return new Promise(
//                 (resolve) => {
//                     if (
//                         typeof window !==
//                         "undefined" &&
//                         window.Razorpay
//                     ) {
//                         resolve(true);
//                         return;
//                     }

//                     const existingScript =
//                         document.querySelector(
//                             'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
//                         );

//                     if (existingScript) {
//                         existingScript.addEventListener(
//                             "load",
//                             () =>
//                                 resolve(true)
//                         );

//                         existingScript.addEventListener(
//                             "error",
//                             () =>
//                                 resolve(false)
//                         );

//                         return;
//                     }

//                     const script =
//                         document.createElement(
//                             "script"
//                         );

//                     script.src =
//                         "https://checkout.razorpay.com/v1/checkout.js";

//                     script.async = true;

//                     script.onload = () =>
//                         resolve(true);

//                     script.onerror = () =>
//                         resolve(false);

//                     document.body.appendChild(
//                         script
//                     );
//                 }
//             );
//         };

//     const verifyPayment = async (
//         paymentResponse: any,
//         loggedUser: any
//     ) => {
//         try {
//             setIsProcessingPayment(true);

//             const token =
//                 localStorage.getItem("token");

//             /*
//              * =====================================================
//              * 1. VERIFY RAZORPAY PAYMENT
//              * =====================================================
//              *
//              * This call must verify the Razorpay signature.
//              * No enrollment is created before this succeeds.
//              */
//             const verifyPayload = {
//                 razorpay_payment_id:
//                     paymentResponse
//                         ?.razorpay_payment_id,

//                 razorpay_order_id:
//                     paymentResponse
//                         ?.razorpay_order_id,

//                 razorpay_signature:
//                     paymentResponse
//                         ?.razorpay_signature,
//             };

//             console.log(
//                 "PAYMENT VERIFICATION PAYLOAD:",
//                 verifyPayload
//             );

//             const verifyResponse =
//                 await fetch(
//                     `${BASE_API_URL}verify-course-payment`,
//                     {
//                         method: "POST",
//                         headers: {
//                             "Content-Type":
//                                 "application/json",
//                             Accept: "application/json",
//                             ...(token
//                                 ? {
//                                     Authorization:
//                                         `Bearer ${token}`,
//                                 }
//                                 : {}),
//                         },
//                         body: JSON.stringify(
//                             verifyPayload
//                         ),
//                     }
//                 );

//             const verifyData =
//                 await parseApiResponse(
//                     verifyResponse
//                 );

//             console.log(
//                 "PAYMENT VERIFY RESPONSE:",
//                 verifyData
//             );

//             if (
//                 !verifyResponse.ok ||
//                 verifyData?.status !== true
//             ) {
//                 toast.error(
//                     verifyData?.message ||
//                     "Payment verification failed."
//                 );
//                 return;
//             }

//             /*
//              * =====================================================
//              * 2. PAYMENT VERIFIED
//              * =====================================================
//              *
//              * Razorpay payment is now verified.
//              *
//              * ONLY NOW call enroll-now.
//              */
//             console.log(
//                 "Payment verified. Creating course enrollment..."
//             );

//             await enrollAfterPayment(
//                 loggedUser,
//                 paymentResponse
//             );

//             /*
//              * =====================================================
//              * 3. ENROLLMENT COMPLETED
//              * =====================================================
//              *
//              * Only after enroll-now succeeds do we set
//              * isEnrolled=true.
//              */
//             setIsEnrolled(true);
//             setShowConfirmModal(false);
//             setShowEnrollFormModal(false);
//             setPaymentData(null);
//             setShowEnrollSuccessModal(true);

//             toast.success(
//                 "Payment successful! Course enrolled."
//             );
//         } catch (error: any) {
//             console.error(
//                 "Payment verification/enrollment error:",
//                 error
//             );

//             toast.error(
//                 error?.message ||
//                 "Something went wrong while completing enrollment."
//             );
//         } finally {
//             setIsProcessingPayment(false);
//         }
//     };

//     useEffect(() => {
//         const fetchCourse = async () => {
//             try {
//                 // Logged in user
//                 const storedUser = localStorage.getItem("user");

//                 let currentUser: User | null = null;

//                 if (storedUser) {
//                     currentUser = JSON.parse(storedUser);

//                     setUser(currentUser);

//                     setFormData({
//                         name: currentUser?.name || "",
//                         email: currentUser?.email || "",
//                         phone:
//                             (currentUser?.phonenumber ||
//                                 currentUser?.phone ||
//                                 "")
//                                 .replace(/^\+?91/, "")
//                                 .trim(),
//                     });
//                 }

//                 // Get all recorded courses to find courseId & courseType
//                 const courseRes = await fetch(`${BASE_API_URL}recorded-course`);
//                 const courseResult = await courseRes.json();

//                 if (!courseResult.status) return;

//                 const matchedCourse = courseResult.data.find(
//                     (item: any) => item.slug === slugId
//                 );

//                 if (!matchedCourse) return;

//                 const courseId = matchedCourse.id;
//                 const courseType = matchedCourse.course_type;

//                 // Build API endpoint
//                 const endpoint =
//                     courseType === "combo"
//                         ? `combo-course-detail/${courseId}`
//                         : `course-detail/${courseId}`;

//                 const url = `https://crm.velearn.in/api/${endpoint}`;

//                 // Fetch course details
//                 const detailRes = await fetch(`https://crm.velearn.in/api/${endpoint}`);
//                 const detailResult = await detailRes.json();

//                 console.log("Course Detail Result:", detailResult);
//                 console.log("Course Detail Data:", detailResult.data);

//                 if (detailResult.status) {
//                     setCourse(detailResult.data);

//                     if (currentUser) {
//                         checkEnrollment(currentUser.id, detailResult.data.id);
//                     }
//                 }
//             } catch (error) {
//                 console.error(error);
//             }
//         };

//         fetchCourse();
//     }, [slugId]);

//     useEffect(() => {
//         const handleScroll = () => {
//             if (!topPartRef.current) return;

//             const rect = topPartRef.current.getBoundingClientRect();

//             // While rc_top_part is on screen
//             if (rect.bottom > 135) {
//                 setStopFixed(false); // fixed
//             } else {
//                 setStopFixed(true); // stop fixing
//             }
//         };

//         window.addEventListener("scroll", handleScroll);
//         handleScroll();

//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);

//     const handleChange = (
//         e: React.ChangeEvent<HTMLInputElement>
//     ) => {

//         const { name, value } = e.target;

//         setFormData({
//             ...formData,
//             [name]: value,
//         });

//         setErrors({
//             ...errors,
//             [name]: "",
//         });
//     };

//     const validate = () => {
//         const newErrors = {
//             name: "",
//             email: "",
//             phone: "",
//         };

//         let valid = true;

//         if (!formData.name.trim()) {
//             newErrors.name = "Name is required";
//             valid = false;
//         }

//         if (!formData.email.trim()) {
//             newErrors.email = "Email is required";
//             valid = false;
//         } else if (
//             !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
//         ) {
//             newErrors.email = "Invalid email";
//             valid = false;
//         }

//         if (!/^[0-9]{10}$/.test(formData.phone)) {
//             newErrors.phone = "Enter a valid 10-digit phone number";
//             valid = false;
//         }
//         setErrors(newErrors);
//         return valid;
//     };

//     const checkEnrollment = async (
//         userId: number,
//         courseId: number
//     ) => {
//         try {
//             const token = localStorage.getItem("token");

//             const response = await fetch(
//                 `${BASE_API_URL}my-courses/${userId}`,
//                 {
//                     method: "GET",
//                     headers: {
//                         Accept: "application/json",
//                         ...(token
//                             ? {
//                                 Authorization: `Bearer ${token}`,
//                             }
//                             : {}),
//                     },
//                 }
//             );

//             const responseText = await response.text();

//             console.log("=================================");
//             console.log("MY COURSES RESPONSE");
//             console.log("User ID:", userId);
//             console.log("Course ID:", courseId);
//             console.log("Status:", response.status);
//             console.log("Response:", responseText);
//             console.log("=================================");

//             if (!response.ok) {
//                 setIsEnrolled(false);
//                 return false;
//             }

//             let data: any;

//             try {
//                 data = JSON.parse(responseText);
//             } catch {
//                 console.error(
//                     "Invalid my-courses response"
//                 );

//                 setIsEnrolled(false);
//                 return false;
//             }

//             const allCourses = Array.isArray(
//                 data?.data?.all
//             )
//                 ? data.data.all
//                 : [];

//             console.log(
//                 "ALL COURSES:",
//                 allCourses
//             );

//             const matchedCourse = allCourses.find(
//                 (item: any) =>
//                     Number(item.id) === Number(courseId)
//             );

//             console.log(
//                 "MATCHED COURSE:",
//                 matchedCourse
//             );

//             if (!matchedCourse) {
//                 console.log(
//                     "❌ Course not found"
//                 );

//                 setIsEnrolled(false);
//                 return false;
//             }

//             /*
//              * ============================================
//              * COURSE TYPE
//              * ============================================
//              */

//             const courseType = String(
//                 course?.course_type ||
//                 matchedCourse?.course_type ||
//                 ""
//             )
//                 .toLowerCase()
//                 .trim();

//             /*
//              * ============================================
//              * FREE COURSE
//              * ============================================
//              *
//              * If backend returns it in my-courses,
//              * it is considered enrolled.
//              */

//             if (courseType === "free") {
//                 console.log(
//                     "✅ FREE COURSE → enrolled"
//                 );

//                 setIsEnrolled(true);

//                 return true;
//             }

//             /*
//              * ============================================
//              * PAID / COMBO
//              * ============================================
//              *
//              * Only consider it enrolled when payment
//              * and enrollment status are successful.
//              */

//             const paymentStatus = String(
//                 matchedCourse?.payment_status ||
//                 matchedCourse?.payment_status_name ||
//                 ""
//             )
//                 .toLowerCase()
//                 .trim();

//             const enrollmentStatus = String(
//                 matchedCourse?.enrollment_status ||
//                 matchedCourse?.enrollment_status_name ||
//                 matchedCourse?.status ||
//                 ""
//             )
//                 .toLowerCase()
//                 .trim();

//             console.log(
//                 "Payment Status:",
//                 paymentStatus
//             );

//             console.log(
//                 "Enrollment Status:",
//                 enrollmentStatus
//             );

//             const paymentCompleted = [
//                 "paid",
//                 "success",
//                 "successful",
//                 "completed",
//             ].includes(paymentStatus);

//             const enrollmentActive = [
//                 "active",
//                 "approved",
//                 "completed",
//                 "enrolled",
//             ].includes(enrollmentStatus);

//             const enrolled =
//                 paymentCompleted &&
//                 enrollmentActive;

//             console.log(
//                 "FINAL ENROLLED:",
//                 enrolled
//             );

//             setIsEnrolled(enrolled);

//             return enrolled;

//         } catch (error) {
//             console.error(
//                 "Check enrollment error:",
//                 error
//             );

//             setIsEnrolled(false);

//             return false;
//         }
//     };

//     const tabs = [
//         { id: "overview", label: "Course Overview" },
//         { id: "outcomes", label: "Learning Outcomes" },
//         { id: "modules", label: "Modules" },
//         { id: "process", label: "Learning Process" },
//         { id: "reviews", label: "Reviews" },
//         { id: "certificate", label: "Certificate" },
//         { id: "fees", label: "Duration & Fee" },
//         { id: "faq", label: "FAQ" },
//     ];

//     useEffect(() => {
//         const sections = document.querySelectorAll("section[id]");

//         const observer = new IntersectionObserver(
//             (entries) => {
//                 entries.forEach((entry) => {
//                     if (entry.isIntersecting) {
//                         setActiveTabMain(entry.target.id);
//                     }
//                 });
//             },
//             {
//                 root: null,
//                 rootMargin: "-100px 0px -60% 0px",
//                 threshold: 0,
//             }
//         );

//         sections.forEach((section) => observer.observe(section));

//         return () => {
//             sections.forEach((section) => observer.unobserve(section));
//         };
//     }, []);

//     useEffect(() => {
//         const slider = listRef.current;

//         if (!slider) return;

//         let isDown = false;
//         let startX = 0;
//         let scrollLeft = 0;

//         const mouseDown = (e: MouseEvent) => {
//             isDown = true;
//             startX = e.pageX - slider.offsetLeft;
//             scrollLeft = slider.scrollLeft;
//         };

//         const mouseLeave = () => {
//             isDown = false;
//         };

//         const mouseUp = () => {
//             isDown = false;
//         };

//         const mouseMove = (e: MouseEvent) => {
//             if (!isDown) return;

//             e.preventDefault();

//             const x = e.pageX - slider.offsetLeft;
//             const walk = (x - startX) * 2;

//             slider.scrollLeft = scrollLeft - walk;
//         };

//         slider.addEventListener("mousedown", mouseDown);
//         slider.addEventListener("mouseleave", mouseLeave);
//         slider.addEventListener("mouseup", mouseUp);
//         slider.addEventListener("mousemove", mouseMove);

//         return () => {
//             slider.removeEventListener("mousedown", mouseDown);
//             slider.removeEventListener("mouseleave", mouseLeave);
//             slider.removeEventListener("mouseup", mouseUp);
//             slider.removeEventListener("mousemove", mouseMove);
//         };
//     }, []);

//     useEffect(() => {
//         const slider = listRef.current;
//         if (!slider) return;

//         const handleScroll = () => {
//             const atEnd =
//                 slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 2;

//             setIsScrollEnd(atEnd);
//         };

//         handleScroll(); // Check on load

//         slider.addEventListener("scroll", handleScroll);

//         return () => {
//             slider.removeEventListener("scroll", handleScroll);
//         };
//     }, []);

//     const scrollToSection = (id: string) => {
//         const element = document.getElementById(id);

//         if (!element) return;

//         const y =
//             element.getBoundingClientRect().top +
//             window.pageYOffset -
//             180; // Sticky header height

//         window.scrollTo({
//             top: y,
//             behavior: "smooth",
//         });
//     };

//     const modules = [
//         "Core Java Programming",
//         "Object Oriented Programming",
//         "Data Types, Variables and Operators",
//         "Control Structures and Loops",
//         "Java Code Writing and Debugging",
//         "Data Structures Basics",
//         "Real World Java Application Practice",
//         "Clean and Reusable Code Writing",
//     ];
//     const colClasses = [
//         "col-lg-4",
//         "col-lg-4",
//         "col-lg-4",
//         "col-lg-4",
//         "col-lg-3",
//         "col-lg-5",
//         "col-lg-6",
//         "col-lg-6",
//     ];

//     // useEffect(() => {
//     //     const index = activeTab - 1;

//     //     setTimeout(() => {
//     //         const tabEl = tabRefs.current[index];
//     //         const wrapperEl = tabsWrapperRef.current;

//     //         if (!tabEl || !wrapperEl) return;

//     //         const tabRect = tabEl.getBoundingClientRect();
//     //         const wrapperRect = wrapperEl.getBoundingClientRect();

//     //         const centerX = tabRect.left + tabRect.width / 2;
//     //         const relativeLeft = centerX - wrapperRect.left;

//     //         setContentLeft(relativeLeft);
//     //     }, 0);
//     // }, [activeTab]);

//     const content = {
//         1: {
//             title: "Foundations of Full Stack Development",
//             points: [
//                 "How the web works (Client–Server architecture)",
//                 "Frontend vs Backend vs Database",
//                 "Developer tools & workflow",
//                 "Introduction to Git & GitHub",
//             ],
//         },
//         2: {
//             title: "Frontend Development",
//             points: [
//                 "HTML, CSS, JavaScript",
//                 "Responsive UI & Grid Systems",
//                 "React.js Fundamentals",
//                 "State Management",
//             ],
//         },
//         3: {
//             title: "Backend Development",
//             points: [
//                 "Node.js & Express.js",
//                 "REST APIs",
//                 "Authentication & Authorization",
//                 "Error Handling & Middleware",
//             ],
//         },
//         4: {
//             title: "Database & Deployment",
//             points: [
//                 "MongoDB / SQL Basics",
//                 "Data Modeling & Queries",
//                 "Cloud Deployment",
//                 "CI/CD & Environment Variables",
//             ],
//         },
//         5: {
//             title: "Capstone & Job Preparation",
//             points: [
//                 "Real-World Project",
//                 "Version Control",
//                 "Resume & Portfolio",
//                 "Mock Interviews",
//             ],
//         },
//     };

//     const currentContent = content[activeTab as keyof typeof content];

//     const updatePosition = (index: number) => {
//         const tabEl = tabRefs.current[index];
//         const wrapperEl = tabsWrapperRef.current;

//         if (!tabEl || !wrapperEl) return;

//         const tabRect = tabEl.getBoundingClientRect();
//         const wrapperRect = wrapperEl.getBoundingClientRect();

//         const centerX = tabRect.left + tabRect.width / 2;
//         const relativeLeft = centerX - wrapperRect.left;

//         setContentLeft(relativeLeft);
//     };

//     useEffect(() => {
//         const updateContentPosition = () => {
//             const index = activeTab - 1;

//             const tabEl = tabRefs.current[index];
//             const wrapperEl = tabsWrapperRef.current;

//             if (!tabEl || !wrapperEl) {
//                 return;
//             }

//             const tabRect = tabEl.getBoundingClientRect();
//             const wrapperRect = wrapperEl.getBoundingClientRect();

//             const centerX = tabRect.left + tabRect.width / 2;
//             const relativeLeft = centerX - wrapperRect.left;

//             setContentLeft(relativeLeft);
//         };

//         // Wait until DOM/layout is painted
//         requestAnimationFrame(() => {
//             requestAnimationFrame(updateContentPosition);
//         });

//         window.addEventListener("resize", updateContentPosition);

//         return () => {
//             window.removeEventListener("resize", updateContentPosition);
//         };
//     }, [activeTab, course?.curricula]);

//     const faqData = [
//         {
//             question: "Why learn Java?",
//             answer: (
//                 <>
//                     <p>
//                         Java is one of the most popular programming languages used in software development and web development. Learning Java opens doors to careers as a Java developer or software engineer.
//                     </p>
//                 </>
//             ),
//         },
//         {
//             question: "How to learn Java programming online?",
//             answer: (
//                 <>
//                     <p>
//                         This UI/UX Design course is ideal for students, fresh
//                         graduates, working professionals, developers, graphic
//                         designers, and career switchers who want to build a
//                         strong foundation in user interface (UI) and user
//                         experience (UX) design. No prior design experience is
//                         required, making it beginner-friendly and
//                         career-oriented.
//                     </p>
//                 </>
//             ),
//         },
//         {
//             question:
//                 "Is this Java course suitable for complete beginners?",
//             answer: (
//                 <>
//                     <p>
//                         This UI/UX Design course is ideal for students, fresh
//                         graduates, working professionals, developers, graphic
//                         designers, and career switchers who want to build a
//                         strong foundation in user interface (UI) and user
//                         experience (UX) design. No prior design experience is
//                         required, making it beginner-friendly and
//                         career-oriented.
//                     </p>
//                 </>
//             ),
//         },
//         {
//             question:
//                 "Will I receive a certificate after completing the course?",
//             answer: (
//                 <>
//                     <p>
//                         This UI/UX Design course is ideal for students, fresh
//                         graduates, working professionals, developers, graphic
//                         designers, and career switchers who want to build a
//                         strong foundation in user interface (UI) and user
//                         experience (UX) design. No prior design experience is
//                         required, making it beginner-friendly and
//                         career-oriented.
//                     </p>
//                 </>
//             ),
//         },
//         {
//             question:
//                 " How long can I access the course?",
//             answer: (
//                 <>
//                     <p>
//                         This UI/UX Design course is ideal for students
//                     </p>
//                 </>
//             ),
//         },
//         {
//             question:
//                 " Why choose Velearn for a Java Programming Course?",
//             answer: (
//                 <>
//                     <p>
//                         This UI/UX Design course is ideal for students
//                     </p>
//                 </>
//             ),
//         },
//     ];

//     const toggleFaq = (index: number) => {
//         setActiveFaqIndex((prev) =>
//             prev === index ? null : index
//         );
//     };
//     return (
//         <>
//             <Script
//                 src="https://checkout.razorpay.com/v1/checkout.js"
//                 strategy="afterInteractive"
//             />
//             {/* ================= CONFIRM ENROLLMENT MODAL ================= */}
//             {showConfirmModal && (
//                 <div
//                     className="modal fade show d-block"
//                     style={{
//                         background: "rgba(0,0,0,0.7)",
//                         zIndex: 10002,
//                     }}
//                 >
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div
//                             className="modal-content border-0 shadow-lg"
//                             style={{
//                                 borderRadius: "15px",
//                             }}
//                         >
//                             <div className="modal-body text-center p-5">
//                                 <div className="mb-4">
//                                     <i
//                                         className="bi bi-question-circle-fill text-warning"
//                                         style={{
//                                             fontSize: "70px",
//                                         }}
//                                     ></i>
//                                 </div>

//                                 <h3 className="fw-bold mb-3">
//                                     Confirm Enrollment
//                                 </h3>

//                                 <p className="text-muted mb-4">
//                                     Are you sure you want to enroll in the{" "}
//                                     <strong className="course_title_modal">
//                                         <span>{course?.title}</span>
//                                     </strong>{" "}
//                                     program?
//                                 </p>

//                                 <div className="d-flex gap-3 justify-content-center">
//                                     <button
//                                         type="button"
//                                         className="btn btn-outline-secondary px-4 py-2"
//                                         onClick={() =>
//                                             setShowConfirmModal(false)
//                                         }
//                                         style={{
//                                             borderRadius: "10px",
//                                         }}
//                                     >
//                                         No, Cancel
//                                     </button>

//                                     <button
//                                         type="button"
//                                         className="btn btn-primary px-4 py-2"
//                                         onClick={confirmEnroll}
//                                         style={{
//                                             borderRadius: "10px",
//                                             backgroundColor: "#22346b",
//                                             border: "none",
//                                         }}
//                                     >
//                                         Yes, Enroll Now
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ================= ENROLLMENT SUCCESS MODAL ================= */}
//             {showEnrollSuccessModal && (
//                 <div
//                     className="modal fade show d-block"
//                     style={{
//                         background: "rgba(0,0,0,0.7)",
//                         zIndex: 10001,
//                     }}
//                 >
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div
//                             className="modal-content border-0 shadow-lg"
//                             style={{
//                                 borderRadius: "15px",
//                             }}
//                         >
//                             <div className="modal-body text-center p-5">
//                                 <div className="mb-4">
//                                     <i
//                                         className="bi bi-check-circle-fill text-success"
//                                         style={{
//                                             fontSize: "70px",
//                                         }}
//                                     ></i>
//                                 </div>

//                                 <h3 className="fw-bold mb-3">
//                                     Enrollment Successful!
//                                 </h3>

//                                 <p className="text-muted mb-4">
//                                     Your request has been received. Would
//                                     you like to view your course
//                                     history now?
//                                 </p>

//                                 <div className="d-flex gap-3 justify-content-center">
//                                     <button
//                                         type="button"
//                                         className="btn btn-outline-secondary px-4 py-2"
//                                         onClick={() =>
//                                             setShowEnrollSuccessModal(false)
//                                         }
//                                         style={{
//                                             borderRadius: "10px",
//                                         }}
//                                     >
//                                         Stay Here
//                                     </button>

//                                     <button
//                                         type="button"
//                                         className="btn btn-primary px-4 py-2"
//                                         onClick={() =>
//                                             router.push(
//                                                 "/live-course-history"
//                                             )
//                                         }
//                                         style={{
//                                             borderRadius: "10px",
//                                             backgroundColor: "#22346b",
//                                             border: "none",
//                                         }}
//                                     >
//                                         Go to History
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ================= ENROLL FORM MODAL ================= */}
//             {showEnrollFormModal && (
//                 <div
//                     className="success_modal_overlay"
//                     onClick={() => setShowEnrollFormModal(false)}
//                 >
//                     <div
//                         className="modalbox animate"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <form
//                             className="position-relative shadow-0"
//                             onSubmit={handleEnroll}
//                         >
//                             <div className="d-flex position-relative justify-content-between align-items-center">
//                                 <h4 className="fw-bold mb-0">
//                                     Enroll Now - <span>{course?.title}</span>
//                                 </h4>

//                                 <button
//                                     type="button"
//                                     className="modal_close_icon border-0 bg-transparent"
//                                     onClick={() =>
//                                         setShowEnrollFormModal(false)
//                                     }
//                                     style={{
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     <i className="bi bi-x-lg"></i>
//                                 </button>
//                             </div>

//                             {/* NAME */}
//                             <div className="d-flex align-items-start flex-column w-100 my-3">
//                                 <label htmlFor="modal-name">
//                                     Name
//                                 </label>

//                                 <input
//                                     id="modal-name"
//                                     type="text"
//                                     name="name"
//                                     value={name}
//                                     onChange={(e) =>
//                                         setName(e.target.value)
//                                     }
//                                     className={`form-control ${errors.name
//                                         ? "is-invalid"
//                                         : ""
//                                         }`}
//                                 />

//                                 {errors.name && (
//                                     <span className="error-msg">
//                                         {errors.name}
//                                     </span>
//                                 )}
//                             </div>

//                             {/* PHONE */}
//                             <div className="d-flex align-items-start flex-column w-100 my-3">
//                                 <label htmlFor="modal-phone">
//                                     Phone Number
//                                 </label>

//                                 <input
//                                     id="modal-phone"
//                                     type="tel"
//                                     name="phone"
//                                     maxLength={10}
//                                     value={phone}
//                                     onChange={(e) =>
//                                         setPhone(
//                                             e.target.value.replace(
//                                                 /\D/g,
//                                                 ""
//                                             )
//                                         )
//                                     }
//                                     className={`form-control ${errors.phone
//                                         ? "is-invalid"
//                                         : ""
//                                         }`}
//                                 />

//                                 {errors.phone && (
//                                     <span className="error-msg">
//                                         {errors.phone}
//                                     </span>
//                                 )}
//                             </div>

//                             {/* EMAIL */}
//                             <div className="d-flex align-items-start flex-column w-100 my-3">
//                                 <label htmlFor="modal-email">
//                                     Email
//                                 </label>

//                                 <input
//                                     id="modal-email"
//                                     type="email"
//                                     name="email"
//                                     value={email}
//                                     onChange={(e) =>
//                                         setEmail(e.target.value)
//                                     }
//                                     className={`form-control ${errors.email
//                                         ? "is-invalid"
//                                         : ""
//                                         }`}
//                                 />

//                                 <input
//                                     type="hidden"
//                                     name="lead_source"
//                                     value="Website"
//                                 />

//                                 {errors.email && (
//                                     <span className="error-msg">
//                                         {errors.email}
//                                     </span>
//                                 )}
//                             </div>

//                             {/* BUTTON */}
//                             <div className="col-12 d-flex justify-content-center">
//                                 {isEnrolled ? (
//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             router.push(
//                                                 "/live-course-history"
//                                             )
//                                         }
//                                     >
//                                         Start Course
//                                     </button>
//                                 ) : (
//                                     <button
//                                         type="submit"
//                                     >
//                                         Enroll Now
//                                     </button>
//                                 )}
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             <div className="rc_body">
//                 {/* Hero Section */}
//                 <div className="rc_top_part" ref={topPartRef}>
//                     <section className="course-hero rc_banner">
//                         <div className="section_container">
//                             <div className="row align-items-center justify-content-lg-between">

//                                 {/* Left Content */}
//                                 <div className="col-lg-8 pe-lg-5 text-white">
//                                     <h1 className="course-title">{course?.title}</h1>
//                                     <p className="course-description">
//                                         {course?.sub_description}
//                                     </p>
//                                     <div className="d-flex justify-content-lg-start justify-content-center mb-3">
//                                         <button
//                                             type="button"
//                                             onClick={handleCourseAction}
//                                             className="btn_theme_primary mt-2 mb-3"
//                                         >
//                                             {!user
//                                                 ? "Login to Enroll"
//                                                 : isEnrolled
//                                                     ? "Start Course"
//                                                     : "Enroll Now"}
//                                         </button>
//                                     </div>
//                                     <div className="col-12">
//                                         <div className="row rc_description mt-4 w-100 m-auto">
//                                             <div className="col-lg-3 col-6 my-3 my-lg-0">
//                                                 <div>
//                                                     <p className="text-center text-white">
//                                                         {
//                                                             course?.with_certificate != null
//                                                                 ? String(course.with_certificate).match(/\d+/)?.[0]
//                                                                 : null
//                                                         }{" "}
//                                                         Core <br /> Modules
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-3 col-6 my-3 my-lg-0">
//                                                 <div>
//                                                     <p className="text-center text-white">
//                                                         {course?.recorded_content} Hrs+ of  <br />
//                                                         In-depth Content
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-3 col-6 my-3 my-lg-0">
//                                                 <div>
//                                                     <p className="text-center text-white">
//                                                         Free Certificate <br />
//                                                         Included
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-3 col-6 my-3 my-lg-0">
//                                                 <div>
//                                                     <p className="text-center text-white">
//                                                         Taught by<br />
//                                                         industry exports
//                                                         {/* 4.8 Ratings <br />
//                                                 <i className="bi bi-star-fill ps-1"></i>
//                                                 <i className="bi bi-star-fill ps-1"></i>
//                                                 <i className="bi bi-star-fill ps-1"></i>
//                                                 <i className="bi bi-star-fill ps-1"></i>
//                                                 <i className="bi bi-star-fill ps-1"></i> */}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Right Form */}
//                                 <div className="col-lg-3 position-relative">
//                                     <form
//                                         onSubmit={handleSubmit}
//                                         className={stopFixed ? "stop-fixed" : ""}
//                                     >
//                                         <h5 className="text-c2 fw-bold text-center mb-2">
//                                             Get this course @{" "}
//                                             {course?.course_type === "free" ? (
//                                                 "Free"
//                                             ) : course?.combo_price ? (
//                                                 <>₹ {course.combo_price}</>
//                                             ) : (
//                                                 <>₹ {course?.buy_price}</>
//                                             )}
//                                         </h5>

//                                         {/* Name */}
//                                         <div className="mb-3">
//                                             <label className="form-label">
//                                                 Name
//                                             </label>

//                                             <input
//                                                 type="text"
//                                                 className={`form-control ${errors.name ? "is-invalid" : ""}`}
//                                                 name="name"
//                                                 value={formData.name}
//                                                 onChange={handleChange}
//                                             />

//                                             {errors.name && (
//                                                 <div className="invalid-feedback">
//                                                     {errors.name}
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Phone */}
//                                         <div className="mb-4">
//                                             <label className="form-label">
//                                                 Phone Number
//                                             </label>

//                                             <input
//                                                 type="tel"
//                                                 className={`form-control ${errors.phone ? "is-invalid" : ""}`}
//                                                 name="phone"
//                                                 value={formData.phone}
//                                                 onChange={handleChange}
//                                                 maxLength={10}
//                                             />

//                                             {errors.phone && (
//                                                 <div className="invalid-feedback">
//                                                     {errors.phone}
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Email */}
//                                         <div className="mb-3">
//                                             <label className="form-label">
//                                                 Email
//                                             </label>

//                                             <input
//                                                 type="email"
//                                                 className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                                                 name="email"
//                                                 value={formData.email}
//                                                 onChange={handleChange}
//                                             />

//                                             {errors.email && (
//                                                 <div className="invalid-feedback">
//                                                     {errors.email}
//                                                 </div>
//                                             )}
//                                         </div>

//                                         <div className="col-12 d-flex justify-content-center">
//                                             {isEnrolled ? (
//                                                 <button
//                                                     type="button"
//                                                     onClick={goToLearnPage}
//                                                     className="btn btn-primary w-auto"
//                                                 >
//                                                     Start Course
//                                                 </button>
//                                             ) : (
//                                                 <button
//                                                     type={user ? "submit" : "button"}
//                                                     onClick={() => {
//                                                         if (!user) {
//                                                             router.push("/login");
//                                                         }
//                                                     }}
//                                                     className="btn btn-primary w-auto"
//                                                 >
//                                                     {user ? "Enroll Now" : "Login to Enroll"}
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </form>
//                                 </div>
//                             </div>
//                         </div>
//                     </section>

//                     <section className="rc_sec_2 rounded-bottom-5 position-relative">
//                         <div className="section_container">
//                             <div className="row">
//                                 <div className="col-lg-9">
//                                     <div className={`course_tabs_sticky pe-lg-3 ${isScrollEnd ? "scroll-end" : ""}`}>
//                                         <ul ref={listRef}>
//                                             {tabs.map((tab) => (
//                                                 <li key={tab.id}>
//                                                     <button
//                                                         className={activeTabMain === tab.id ? "active" : ""}
//                                                         onClick={() => scrollToSection(tab.id)}
//                                                     >
//                                                         {tab.label}
//                                                     </button>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                     <div id="overview" className="mt-4">
//                                         <div className="rc_overview_box">
//                                             <div>
//                                                 <h2 className="rc_heading text-c1 fw-bold">
//                                                     {course?.learning_title || (
//                                                         <>
//                                                             What You'll Learn In This {course?.cour_language} Online Course
//                                                         </>
//                                                     )}
//                                                 </h2>

//                                                 <p className="rc_text">
//                                                     {course?.learning_description || (
//                                                         <>
//                                                             {course?.about_course}
//                                                         </>
//                                                     )}
//                                                 </p>

//                                                 <ul className="rc_points ps-0">
//                                                     {course?.leans?.map((item: any) => (
//                                                         <li key={item.id}>
//                                                             <span className="icon">
//                                                                 <i className="bi bi-arrow-right-short"></i>
//                                                             </span>
//                                                             {item.title}
//                                                         </li>
//                                                     ))}
//                                                 </ul>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Learning Outcomes */}
//                         <div id="outcomes" className="pt-1 px-1">
//                             <div className="rc_sec_3 rounded-5">
//                                 <div className="section_container">
//                                     <div className="rc_outcomes_box py-4">
//                                         <div className="row align-items-center">
//                                             {/* Left Content */}
//                                             <div className="col-lg-8">
//                                                 <h2 className="fw-bold text-white text-center mb-3">
//                                                     {course?.why_us_title || (
//                                                         <>
//                                                             Why Our{" "}
//                                                             <span className="text-c2">
//                                                                 {course?.cour_language} Online Course
//                                                             </span>{" "}
//                                                             Stands Out For Beginners
//                                                         </>
//                                                     )}
//                                                 </h2>

//                                                 <p className="rc_sec_desc text-center text-white">
//                                                     {course?.why_us_description ||
//                                                         `Built by experts and designed for beginners. Here's why our ${course?.cour_language} online course is the perfect way to learn and kickstart your career in software development.`}
//                                                 </p>

//                                                 <div className="row g-4 mt-2">
//                                                     {[
//                                                         {
//                                                             heading: course?.why_us_heading_1,
//                                                             description: course?.why_us_desc_1,
//                                                         },
//                                                         {
//                                                             heading: course?.why_us_heading_2,
//                                                             description: course?.why_us_desc_2,
//                                                         },
//                                                         {
//                                                             heading: course?.why_us_heading_3,
//                                                             description: course?.why_us_desc_3,
//                                                         },
//                                                         {
//                                                             heading: course?.why_us_heading_4,
//                                                             description: course?.why_us_desc_4,
//                                                         },
//                                                     ]
//                                                         .filter((item) => item.heading || item.description)
//                                                         .map((item, index) => (
//                                                             <div className="col-md-6" key={index}>
//                                                                 <div className="rc_feature_card_parent">
//                                                                     <div className="rc_feature_card">
//                                                                         <div>
//                                                                             <h5 className="fw-bold text-black">
//                                                                                 {item.heading}
//                                                                             </h5>

//                                                                             <p className="text-black mb-0">
//                                                                                 {item.description}
//                                                                             </p>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         ))}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Modules */}
//                         <div id="keypoints" className="py-4 px-1 bg-white">
//                             <div className="rc_sec_4">
//                                 <div className="section_container">
//                                     <div className="row">
//                                         <div className="col-lg-8">
//                                             <div className="row justify-content-center">
//                                                 <div className="col-lg-9">
//                                                     <h2 className="fw-bold text-black text-center mb-3">
//                                                         Designed for Effective {" "}
//                                                         <span className="text-c2">
//                                                             Self-Paced Java
//                                                         </span>{" "}
//                                                         Learning
//                                                     </h2>
//                                                 </div>
//                                             </div>
//                                             <div className="position-relative">
//                                                 <div className="d-flex justify-content-center align-items-center">
//                                                     <Image
//                                                         src={`/images/recorded-course/circle-icons.svg`}
//                                                         className="h-auto" style={{ width: "600px" }}
//                                                         width={610}
//                                                         height={600}
//                                                         alt=""
//                                                     />
//                                                 </div>
//                                                 <div className="points_circle">
//                                                     <div>
//                                                         <p className="mb-0">Lifetime Access to Recorded Videos</p>
//                                                     </div>
//                                                     <div>
//                                                         <p className="mb-0">Practice-Oriented Learning</p>
//                                                     </div>
//                                                     <div>
//                                                         <p className="mb-0">Certificate of Completion</p>
//                                                     </div>
//                                                     <div>
//                                                         <p className="mb-0">Concept-wise Structured Modules</p>
//                                                     </div>
//                                                     <div>
//                                                         <p className="mb-0">Module-wise Practice Questions</p>
//                                                     </div>
//                                                     <div>
//                                                         <p className="mb-0">Interactive & Engaging Video Lessons</p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Learning Process */}
//                         <div id="process" className="pt-1 px-1">
//                             <div className="rc_sec_5 rounded-5 py-4">
//                                 <div className="section_container">
//                                     <div className="row">
//                                         <div className="col-lg-8">
//                                             <div className="px-lg-4">
//                                                 <div>
//                                                     <h2 className="fw-bold text-white text-center mb-3">
//                                                         {course?.skills_title || (
//                                                             <>
//                                                                 Skills You Will Gain From Our{" "}
//                                                                 <span className="text-c2">
//                                                                     {course?.cour_language} Classes Online
//                                                                 </span>
//                                                             </>
//                                                         )}
//                                                     </h2>

//                                                     <p className="text-center text-white">
//                                                         {course?.skills_description ||
//                                                             `Here are the ${course?.cour_language} skills you will pick up in this course to start your journey as a ${course?.cour_language} developer.`}
//                                                     </p>
//                                                 </div>
//                                                 <div className="rc_modules">
//                                                     <div className="row g-3">
//                                                         {Array.isArray(course?.skills) &&
//                                                             course.skills.map(
//                                                                 (
//                                                                     item: { id?: number; name?: string },
//                                                                     index: number
//                                                                 ) => (
//                                                                     <div
//                                                                         key={item?.id || index}
//                                                                         className={`${colClasses[index % colClasses.length]} col-md-6`}
//                                                                     >
//                                                                         <div className="module_box">
//                                                                             <p>{item?.name}</p>
//                                                                         </div>
//                                                                     </div>
//                                                                 )
//                                                             )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* modules */}
//                         <div id="modules">
//                             <div className="rc_sec_6 pt-5 pb-3">
//                                 <div className="section_container">
//                                     <div className="row">
//                                         <div className="col-lg-8">
//                                             <div className="pb-5">
//                                                 <h2 className="text-black text-center fw-bold px-3 lh-sm">
//                                                     {course?.cour_language} Programming For{" "}
//                                                     <span className="text-c2">Beginners</span> – Course Modules
//                                                 </h2>

//                                                 <p className="text-black text-center px-lg-5 mb-5">
//                                                     Start your{" "}
//                                                     {course?.cour_language} journey with a clear roadmap built
//                                                     just for beginners. These{" "}
//                                                     {course?.curricula?.length || 0} modules walk you through{" "}
//                                                     {course?.cour_language} programming step by step, from basic
//                                                     concepts to object oriented programming. No prior coding
//                                                     experience needed, just curiosity and a little practice.
//                                                 </p>

//                                                 {Array.isArray(course?.curricula) &&
//                                                     course.curricula.length > 0 && (
//                                                         <div
//                                                             className="tabs-wrapper position-relative mb-5"
//                                                             ref={tabsWrapperRef}
//                                                         >
//                                                             {/* Tabs */}
//                                                             <div className="tabs">
//                                                                 {course.curricula.map(
//                                                                     (
//                                                                         module: {
//                                                                             id?: number;
//                                                                             title?: string;
//                                                                         },
//                                                                         index: number
//                                                                     ) => (
//                                                                         <button
//                                                                             key={module.id || index}
//                                                                             ref={(el) => {
//                                                                                 tabRefs.current[index] = el;
//                                                                             }}
//                                                                             className={`tab ${activeTab === index + 1
//                                                                                 ? "active"
//                                                                                 : ""
//                                                                                 }`}
//                                                                             onClick={() =>
//                                                                                 setActiveTab(index + 1)
//                                                                             }
//                                                                         >
//                                                                             Module {index + 1}
//                                                                         </button>
//                                                                     )
//                                                                 )}
//                                                             </div>

//                                                             {/* Active tab indicator */}
//                                                             <div
//                                                                 className="tab-indicator"
//                                                                 style={{
//                                                                     position: "absolute",
//                                                                     top: "45px",
//                                                                     left: `${contentLeft}px`,
//                                                                     transform: "translateX(-50%)",
//                                                                 }}
//                                                             />

//                                                             {/* Active module content */}
//                                                             {course.curricula[activeTab - 1] && (
//                                                                 <div
//                                                                     className="tab-content-box positioned"
//                                                                     style={{
//                                                                         position: "absolute",
//                                                                         top: "70px",
//                                                                         left: `${contentLeft}px`,
//                                                                         transform: "translateX(-50%)",
//                                                                     }}
//                                                                 >
//                                                                     <h6 className="mb-3">
//                                                                         {course.curricula[activeTab - 1]?.title}
//                                                                     </h6>

//                                                                     <ul>
//                                                                         {Array.isArray(
//                                                                             course.curricula[activeTab - 1]
//                                                                                 ?.descriptions
//                                                                         ) &&
//                                                                             course.curricula[
//                                                                                 activeTab - 1
//                                                                             ].descriptions.map(
//                                                                                 (
//                                                                                     item: {
//                                                                                         id?: number;
//                                                                                         description?: string;
//                                                                                     },
//                                                                                     index: number
//                                                                                 ) => (
//                                                                                     <li
//                                                                                         key={
//                                                                                             item.id || index
//                                                                                         }
//                                                                                     >
//                                                                                         {item.description}
//                                                                                     </li>
//                                                                                 )
//                                                                             )}
//                                                                     </ul>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Benefits */}
//                         <div id="benefits" className="pt-1 px-1">
//                             <div className="rc_sec_7 rounded-5 py-4">
//                                 <div className="section_container">
//                                     <div className="row">
//                                         <div className="col-lg-8">
//                                             <div>
//                                                 <h2 className="fw-bold text-white text-center mb-3">
//                                                     Who Can{" "}
//                                                     <span className="text-c2">Benefit</span>{" "}
//                                                     from This{" "}
//                                                     <span className="text-c2">Course</span>
//                                                 </h2>
//                                             </div>

//                                             <div className="row justify-content-center">
//                                                 <div className="col-lg-10">
//                                                     <div className="benefits_card_parent">
//                                                         <div className="row">
//                                                             {Array.isArray(course?.benefits) &&
//                                                                 course.benefits.map(
//                                                                     (
//                                                                         item: {
//                                                                             id?: number;
//                                                                             description?: string;
//                                                                         },
//                                                                         index: number
//                                                                     ) => (
//                                                                         <div
//                                                                             className="col-lg-6"
//                                                                             key={item?.id || index}
//                                                                         >
//                                                                             <div>
//                                                                                 <p className="text-white text-center mb-0">
//                                                                                     {item?.description}
//                                                                                 </p>
//                                                                             </div>
//                                                                         </div>
//                                                                     )
//                                                                 )}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Reviews */}
//                         {/* Reviews */}
//                         <div id="reviews" className="bg-white">
//                             <div className="rc_sec_8">
//                                 <div className="section_container">
//                                     <div className="row">
//                                         <div className="col-lg-8">
//                                             <div className="py-5">

//                                                 <h3 className="text-black fw-bold text-center">
//                                                     Success Stories from{" "}
//                                                     <span className="text-c2">
//                                                         {course?.cour_language} Learners
//                                                     </span>
//                                                 </h3>

//                                                 <div className="row justify-content-center">
//                                                     <div className="col-lg-10">
//                                                         <div className="rc_testimonial">

//                                                             <h5 className="fw-bold text-black text-center">
//                                                                 Our Student Reviews
//                                                             </h5>

//                                                             {Array.isArray(course?.testimonials) &&
//                                                                 course.testimonials.length > 0 ? (
//                                                                 <Swiper
//                                                                     modules={[Autoplay, Pagination]}
//                                                                     autoplay={{
//                                                                         delay: 3500,
//                                                                         disableOnInteraction: false,
//                                                                     }}
//                                                                     pagination={{
//                                                                         clickable: true,
//                                                                     }}
//                                                                     loop={course.testimonials.length > 1}
//                                                                     spaceBetween={30}
//                                                                     slidesPerView={1}
//                                                                     className="testimonial_swiper mt-4"
//                                                                 >
//                                                                     {course.testimonials.map(
//                                                                         (
//                                                                             testimonial: {
//                                                                                 id?: number;
//                                                                                 name?: string;
//                                                                                 content?: string;
//                                                                                 rating?: string | number;
//                                                                                 image?: string;
//                                                                             },
//                                                                             index: number
//                                                                         ) => {
//                                                                             const rating = Math.min(
//                                                                                 5,
//                                                                                 Math.max(
//                                                                                     0,
//                                                                                     Number(testimonial?.rating) || 0
//                                                                                 )
//                                                                             );

//                                                                             return (
//                                                                                 <SwiperSlide
//                                                                                     key={
//                                                                                         testimonial?.id ||
//                                                                                         index
//                                                                                     }
//                                                                                 >
//                                                                                     <div className="rc_testimonial_card">
//                                                                                         <div className="testimonial_content">

//                                                                                             <p>
//                                                                                                 {testimonial?.content}
//                                                                                             </p>

//                                                                                             <div className="student_info">

//                                                                                                 <Image
//                                                                                                     src={
//                                                                                                         testimonial?.image
//                                                                                                             ? `${BASE_DYNAMIC_IMAGE_URL}testimonials/${testimonial.image}`
//                                                                                                             : `${BASE_IMAGE_URL}recorded-course/student.png`
//                                                                                                     }
//                                                                                                     alt={
//                                                                                                         testimonial?.name ||
//                                                                                                         "Student"
//                                                                                                     }
//                                                                                                     width={300}
//                                                                                                     height={300}
//                                                                                                 />

//                                                                                                 <h6>
//                                                                                                     {testimonial?.name}
//                                                                                                 </h6>

//                                                                                                 <div
//                                                                                                     className="stars"
//                                                                                                     aria-label={`${rating} out of 5 stars`}
//                                                                                                 >
//                                                                                                     {"★".repeat(
//                                                                                                         rating
//                                                                                                     )}
//                                                                                                 </div>

//                                                                                             </div>
//                                                                                         </div>
//                                                                                     </div>
//                                                                                 </SwiperSlide>
//                                                                             );
//                                                                         }
//                                                                     )}
//                                                                 </Swiper>
//                                                             ) : (
//                                                                 <p className="text-center text-black mt-4 mb-0">
//                                                                     No student reviews available yet.
//                                                                 </p>
//                                                             )}

//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* certificate */}
//                         <div id="certificate">
//                             <div className="rc_sec_9 pb-lg-2 pb-5">
//                                 <div className="section_container">
//                                     <div className="row">
//                                         <div className="col-lg-8">
//                                             <div className="pt-5 ">
//                                                 <h3 className="text-white fw-bold text-center">
//                                                     Get Your  {" "}
//                                                     <span className="text-c2">
//                                                         Free Java Online Course
//                                                         {" "}
//                                                     </span>
//                                                     With Certificate
//                                                 </h3>
//                                                 <p className="text-center text-white">
//                                                     Get recognized for your skills with a certificate that proves your expertise in java programming
//                                                 </p>
//                                                 <div className="row justify-content-center">
//                                                     <div className="row">
//                                                         <div className="col-lg-5 d-flex flex-column justify-content-center pt-4">
//                                                             <div className="mb-2">
//                                                                 <h5 className="text-c2 fw-bold mb-3">
//                                                                     Industry-Recognized
//                                                                 </h5>
//                                                                 <p className="fw-bold text-white mb-1">
//                                                                     Validate Your Achievement
//                                                                 </p>
//                                                                 <p className="text-white mb-4">
//                                                                     A trusted certificate from one of the best Java programming for beginners courses with full recognition.
//                                                                 </p>
//                                                             </div>
//                                                             <div className="mb-2">
//                                                                 <h5 className="text-c2 fw-bold mb-3">
//                                                                     Verified Credentials
//                                                                 </h5>
//                                                                 <p className="fw-bold text-white mb-1">
//                                                                     Build a Professional Portfolio
//                                                                 </p>
//                                                                 <p className="text-white mb-4">
//                                                                     Showcase your verified Java certification to stand out as a skilled Java developer in software development.
//                                                                 </p>
//                                                             </div>
//                                                             <div className="mb-2">
//                                                                 <h5 className="text-c2 fw-bold mb-3">
//                                                                     Shareable Online
//                                                                 </h5>
//                                                                 <p className="fw-bold text-white mb-1">
//                                                                     Share Your Success
//                                                                 </p>
//                                                                 <p className="text-white mb-4">
//                                                                     Highlight your certificate on LinkedIn and resumes to unlock new career opportunities.
//                                                                 </p>
//                                                             </div>
//                                                         </div>
//                                                         <div className="col-lg-7 d-flex align-items-start justify-content-center pt-4 px-lg-5 pb-lg-5">
//                                                             <div className=" d-flex align-items-center justify-content-center">
//                                                                 <div className="col-lg-10">
//                                                                     <Image
//                                                                         src={`/images/recorded-course/certificate.png`}
//                                                                         className="w-100 h-auto rounded-4"
//                                                                         alt=""
//                                                                         width={340}
//                                                                         height={340}
//                                                                     />
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Duration & Fee */}
//                         {/* Course Duration & Fee */}
//                         <div id="fees" className="course_fee_section py-5">
//                             <div className="section_container">
//                                 <div className="row">
//                                     <div className="col-lg-8">

//                                         {/* Heading */}
//                                         <div className="row justify-content-center">
//                                             <div className="col-lg-10 text-center mb-5">
//                                                 <h3 className="text-black fw-bold text-center">
//                                                     {course?.cour_language} Course{" "}
//                                                     <span className="text-c2">
//                                                         Duration & Fee
//                                                     </span>
//                                                 </h3>

//                                                 <p className="text-muted">
//                                                     {course?.course_type === "free"
//                                                         ? `Learn ${course?.cour_language} at your own pace with lifetime access to all recorded lessons and beginner-friendly tutorials. Start learning today at no cost and build practical skills through a structured learning path.`
//                                                         : `Learn ${course?.cour_language} at your own pace with lifetime access to all recorded lessons and beginner-friendly tutorials. Get complete value with an affordable fee and a clear learning path designed to make you job-ready.`}
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         <div className="row g-4 align-items-stretch">

//                                             {/* Left Card */}
//                                             <div className="col-lg-7">
//                                                 <div className="details_card h-100">

//                                                     <h4 className="fw-bold mb-4">
//                                                         Course Details
//                                                     </h4>

//                                                     <div className="row gy-4">

//                                                         {/* Format */}
//                                                         <div className="col-6">
//                                                             <div className="course_item">
//                                                                 <i className="bi bi-play-circle"></i>

//                                                                 <div>
//                                                                     <h6>Format</h6>
//                                                                     <span>
//                                                                         Self-Paced Recorded
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* Duration */}
//                                                         <div className="col-6">
//                                                             <div className="course_item">
//                                                                 <i className="bi bi-clock"></i>

//                                                                 <div>
//                                                                     <h6>Duration</h6>
//                                                                     <span>
//                                                                         {course?.duration ||
//                                                                             "Lifetime Access"}
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* Modules */}
//                                                         <div className="col-6">
//                                                             <div className="course_item">
//                                                                 <i className="bi bi-box"></i>

//                                                                 <div>
//                                                                     <h6>Modules</h6>
//                                                                     <span>
//                                                                         {Array.isArray(course?.curricula)
//                                                                             ? `${course.curricula.length} Modules`
//                                                                             : "Modules"}
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* Lessons */}
//                                                         <div className="col-6">
//                                                             <div className="course_item">
//                                                                 <i className="bi bi-camera-video"></i>

//                                                                 <div>
//                                                                     <h6>Lessons</h6>
//                                                                     <span>
//                                                                         {course?.recorded_content || 0} Lessons
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* Certificate */}
//                                                         <div className="col-6">
//                                                             <div className="course_item">
//                                                                 <i className="bi bi-award"></i>

//                                                                 <div>
//                                                                     <h6>Certificate</h6>
//                                                                     <span>
//                                                                         {Number(course?.with_certificate) > 0
//                                                                             ? "Included"
//                                                                             : "Not Included"}
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* Device Support */}
//                                                         <div className="col-6">
//                                                             <div className="course_item">
//                                                                 <i className="bi bi-laptop"></i>

//                                                                 <div>
//                                                                     <h6>Device Support</h6>
//                                                                     <span>
//                                                                         All Devices
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Right Card */}
//                                             <div className="col-lg-5 ps-lg-0">
//                                                 <div className="price_card h-100">

//                                                     {course?.course_type === "free" ? (

//                                                         /* ================= FREE COURSE ================= */
//                                                         <>
//                                                             <span className="offer_badge">
//                                                                 Free Course
//                                                             </span>

//                                                             <h5 className="mt-4">
//                                                                 Start Learning
//                                                             </h5>

//                                                             <div className="price_box">
//                                                                 <h2>FREE</h2>

//                                                                 {Number(course?.mrp_price) > 0 && (
//                                                                     <del>
//                                                                         ₹
//                                                                         {Number(
//                                                                             course.mrp_price
//                                                                         ).toLocaleString("en-IN")}
//                                                                     </del>
//                                                                 )}
//                                                             </div>

//                                                             <span className="discount">
//                                                                 100% Free
//                                                             </span>

//                                                             <span className="text-muted small">
//                                                                 Learn anytime, anywhere!
//                                                             </span>

//                                                             <div className="price_info">

//                                                                 {/* Access */}
//                                                                 <div className="row">
//                                                                     <div className="col-5">
//                                                                         <span>Access</span>
//                                                                     </div>

//                                                                     <div className="col-7">
//                                                                         <strong>
//                                                                             Lifetime
//                                                                         </strong>
//                                                                     </div>
//                                                                 </div>

//                                                                 {/* Lessons */}
//                                                                 <div className="row">
//                                                                     <div className="col-5">
//                                                                         <span>Lessons</span>
//                                                                     </div>

//                                                                     <div className="col-7">
//                                                                         <strong>
//                                                                             {course?.recorded_content || 0}
//                                                                         </strong>
//                                                                     </div>
//                                                                 </div>

//                                                                 {/* Certificate */}
//                                                                 <div className="row">
//                                                                     <div className="col-5">
//                                                                         <span>Certificate</span>
//                                                                     </div>

//                                                                     <div className="col-7">
//                                                                         <strong>
//                                                                             {Number(
//                                                                                 course?.with_certificate
//                                                                             ) > 0
//                                                                                 ? "Included"
//                                                                                 : "Not Included"}
//                                                                         </strong>
//                                                                     </div>
//                                                                 </div>

//                                                             </div>
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={handleCourseAction}
//                                                                 className="btn enroll_btn w-100 mt-4"
//                                                             >
//                                                                 {!user
//                                                                     ? "Login to Enroll"
//                                                                     : isEnrolled
//                                                                         ? "Start Course"
//                                                                         : "Enroll Now"}
//                                                             </button>
//                                                             {/* <button className="btn enroll_btn w-100 mt-4">
//                                                                 Start Learning →
//                                                             </button> */}

//                                                             <p className="secure_text mt-3">
//                                                                 <i className="bi bi-check-circle-fill text-muted pe-2"></i>
//                                                                 No Payment Required
//                                                             </p>
//                                                         </>

//                                                     ) : (

//                                                         /* ================= PAID COURSE ================= */
//                                                         <>
//                                                             <span className="offer_badge">
//                                                                 Launch Offer
//                                                             </span>

//                                                             <h5 className="mt-4">
//                                                                 Pricing
//                                                             </h5>

//                                                             <div className="price_box">

//                                                                 <h2>
//                                                                     ₹
//                                                                     {Number(
//                                                                         course?.offer_price ||
//                                                                         course?.buy_price ||
//                                                                         0
//                                                                     ).toLocaleString("en-IN")}
//                                                                 </h2>

//                                                                 {Number(course?.mrp_price) > 0 && (
//                                                                     <del>
//                                                                         ₹
//                                                                         {Number(
//                                                                             course.mrp_price
//                                                                         ).toLocaleString("en-IN")}
//                                                                     </del>
//                                                                 )}

//                                                             </div>

//                                                             {/* Discount */}
//                                                             {Number(course?.mrp_price) > 0 &&
//                                                                 Number(course?.offer_price) > 0 && (
//                                                                     <span className="discount">
//                                                                         Save{" "}
//                                                                         {Math.round(
//                                                                             ((Number(course.mrp_price) -
//                                                                                 Number(
//                                                                                     course.offer_price
//                                                                                 )) /
//                                                                                 Number(
//                                                                                     course.mrp_price
//                                                                                 )) *
//                                                                             100
//                                                                         )}
//                                                                         %
//                                                                     </span>
//                                                                 )}

//                                                             <span className="text-muted small">
//                                                                 Limited time offer!
//                                                             </span>

//                                                             <div className="price_info">

//                                                                 {/* Regular Price */}
//                                                                 <div className="row">
//                                                                     <div className="col-5">
//                                                                         <span>
//                                                                             Regular Price
//                                                                         </span>
//                                                                     </div>

//                                                                     <div className="col-7">
//                                                                         <strong>
//                                                                             ₹
//                                                                             {Number(
//                                                                                 course?.buy_price || 0
//                                                                             ).toLocaleString("en-IN")}
//                                                                         </strong>
//                                                                     </div>
//                                                                 </div>

//                                                                 {/* Access */}
//                                                                 <div className="row">
//                                                                     <div className="col-5">
//                                                                         <span>
//                                                                             Access
//                                                                         </span>
//                                                                     </div>

//                                                                     <div className="col-7">
//                                                                         <strong>
//                                                                             Lifetime
//                                                                         </strong>
//                                                                     </div>
//                                                                 </div>

//                                                                 {/* Payment */}
//                                                                 <div className="row">
//                                                                     <div className="col-5">
//                                                                         <span>
//                                                                             Payment
//                                                                         </span>
//                                                                     </div>

//                                                                     <div className="col-7">
//                                                                         <strong>
//                                                                             UPI, Cards, Net Banking
//                                                                         </strong>
//                                                                     </div>
//                                                                 </div>

//                                                             </div>

//                                                             {/* <button className="btn enroll_btn w-100 mt-4">
//                                                                 Enroll Now →
//                                                             </button> */}
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={handleCourseAction}
//                                                                 className="btn enroll_btn w-100 mt-4"
//                                                             >
//                                                                 {!user
//                                                                     ? "Login to Enroll"
//                                                                     : isEnrolled
//                                                                         ? "Start Course"
//                                                                         : "Enroll Now"}
//                                                             </button>
//                                                             <p className="secure_text mt-3">
//                                                                 <i className="bi bi-lock-fill text-muted pe-2"></i>
//                                                                 Secure & Safe Payments
//                                                             </p>
//                                                         </>
//                                                     )}

//                                                 </div>
//                                             </div>

//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         {/* faq */}
//                         <div className="faq_section pb-5" id="faq">
//                             <div className="section_container">
//                                 <div className="row">
//                                     <div className="col-lg-8">

//                                         {/* Heading */}
//                                         <div className="row justify-content-center">
//                                             <h3 className="section_base_heading text-center">
//                                                 Frequently Asked{" "}
//                                                 <span className="text-c2">
//                                                     Questions
//                                                 </span>
//                                             </h3>

//                                             <div className="row mt-5 justify-content-center align-items-center">
//                                                 <div className="col-lg-12 text-start">

//                                                     {Array.isArray(course?.faqs) &&
//                                                         course.faqs.length > 0 ? (
//                                                         course.faqs.map(
//                                                             (
//                                                                 item: FAQ,
//                                                                 index: number
//                                                             ) => (
//                                                                 <div
//                                                                     key={item.id || index}
//                                                                     className={`faq_item mb-3 ${activeFaqIndex === index
//                                                                         ? "active"
//                                                                         : ""
//                                                                         }`}
//                                                                 >
//                                                                     <button
//                                                                         type="button"
//                                                                         className={`faq_question justify-content-between ${activeFaqIndex === index
//                                                                             ? "active"
//                                                                             : ""
//                                                                             }`}
//                                                                         onClick={() =>
//                                                                             toggleFaq(index)
//                                                                         }
//                                                                     >
//                                                                         <span>
//                                                                             {item.question}
//                                                                         </span>

//                                                                         <span className="icon">
//                                                                             {activeFaqIndex !==
//                                                                                 index && (
//                                                                                     <Image
//                                                                                         src="/images/icons/faq-icon.png"
//                                                                                         alt="toggle"
//                                                                                         height={35}
//                                                                                         width={35}
//                                                                                         className="faq_toggle_icon"
//                                                                                     />
//                                                                                 )}
//                                                                         </span>
//                                                                     </button>

//                                                                     {activeFaqIndex === index && (
//                                                                         <div className="faq_answer">
//                                                                             {item.answer}
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             )
//                                                         )
//                                                     ) : (
//                                                         <p className="text-center text-muted">
//                                                             No frequently asked questions
//                                                             available.
//                                                         </p>
//                                                     )}

//                                                 </div>
//                                             </div>
//                                         </div>

//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </section>
//                 </div>
//                 <section id="rc-cta" className="rc_cta py-5">
//                     <div>
//                         <div className="section_container">
//                             <div className="row justify-content-center">

//                                 <h3 className="text-white text-center">
//                                     {course?.end_card_title ||
//                                         `Learn ${course?.cour_language} and Start Your Journey Today`}
//                                 </h3>

//                                 <p className="text-white text-center mt-2">
//                                     {course?.end_card_description ||
//                                         `Enroll in our ${course?.cour_language} online course today and step confidently into your career.`}
//                                 </p>

//                                 <div className="d-flex justify-content-center gap-3 mt-4">

//                                     {/* Enroll / Start Learning */}
//                                     <button
//                                         className="rc-cta-1"
//                                     // onClick={handleCourseAction}
//                                     >
//                                         {isEnrolled
//                                             ? "Start Course"
//                                             : user
//                                                 ? "Enroll Now"
//                                                 : "Login to Enroll"}
//                                     </button>
//                                     {/* <button className="rc-cta-1">
//                                         {course?.course_type === "free"
//                                             ? "Start Learning"
//                                             : "Enroll Now"}
//                                     </button> */}

//                                     {/* Download Syllabus */}
//                                     {course?.syllabus_pdf && (
//                                         <a
//                                             href={`${BASE_DYNAMIC_IMAGE_URL}courses/${course.syllabus_pdf}`}
//                                             target="_blank"
//                                             download={true}
//                                             rel="noopener noreferrer"
//                                             className="rc-cta-2"
//                                         >
//                                             Download Syllabus
//                                         </a>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </>
//     );
// }
