"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "./globals.css"

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BASE_API_URL = "http://localhost:5000/api/";
const BASE_IMAGE_URL = "https://velearn-next.onrender.com/images/";
const BASE_DYNAMIC_IMAGE_URL =
  "https://crm.velearn.in/public/uploads/";

export default function HomePage() {
  interface Course {
    id: number;
    slug: string;
    title: string;
    image: string;
    sub_description: string;
    recorded_content: string;
    course_type: "paid" | "free" | "combo";
    buy_price?: number;
    mrp_price?: number;
    rating?: string;
    categories?: string;
  }

  interface EnrolledCourse {
    id: number;
    enrollment?: {
      status?: string;
    };
  }
  const [coursesList, setCoursesList] = useState<Course[]>([]);

  const [recordedCourses, setRecordedCourses] =
    useState<Record<string, Course[]>>({});

  const [enrolledCoursesList, setEnrolledCoursesList] =
    useState<EnrolledCourse[]>([]);
  const [activeImage, setActiveImage] = useState(
    "testimonial/arun-vikkashamuthu.png"
  );
  const [activeRecordedTab, setActiveRecordedTab] = useState(
    "Software Development"
  );

  const [activeFaqIndex, setActiveFaqIndex] = useState(0);

  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --------------------------------
  // FETCH COURSES
  // --------------------------------

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
    initCounter();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}recorded-course`);
      const data = await res.json();

      if (data.status) {
        // Remove live courses
        const filteredCourses = data.data.filter(
          (course: any) => course.course_type !== "live"
        );

        setCoursesList(filteredCourses);

        const grouped = filteredCourses.reduce((acc: any, course: any) => {
          const category = course.categories || "General";

          if (!acc[category]) acc[category] = [];

          acc[category].push(course);

          return acc;
        }, {});

        setRecordedCourses(grouped);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEnrolledCourses = async () => {
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;

    if (!user) return;

    try {
      const res = await fetch(
        `https://crm.velearn.in/api/my-courses/${user.id}`
      );

      const data = await res.json();

      if (data.status) {
        setEnrolledCoursesList(data.data.all || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // --------------------------------
  // COUNTER ANIMATION
  // --------------------------------

  const initCounter = () => {
    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter: any) => {
      const target = Number(counter.dataset.target);

      let current = 0;

      const updateCounter = () => {
        current += Math.ceil(target / 100);

        if (current < target) {
          counter.innerText = current;
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = `${target}+`;
        }
      };

      updateCounter();
    });
  };

  // --------------------------------
  // CONTACT FORM
  // --------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const { name, phone, email } = contactForm;

    if (!name || !phone || !email) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${BASE_API_URL}contacts/send-mail`,
        {
          name,
          phone_number: phone,
          email_id: email,
          course: "General Inquiry",
          message:
            "I am interested in Demo/Discounts. Please contact me.",
          country_code: "+91",
        }
      );

      if (response.data.status) {
        toast.success(
          "Details submitted successfully"
        );

        setContactForm({
          name: "",
          phone: "",
          email: "",
        });
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const testimonialData = [
    {
      img: "testimonial/arun-vikkashamuthu.png",
      text: `I joined with very little knowledge, but the classes
        were explained in a simple way. The trainers cleared my
        doubts patiently every day. The assignments helped me
        understand the concepts better. I feel more confident now.`,
    },
    {
      img: "testimonial/person-1.jpg",
      text: `The assignments helped me a lot to understand the real concepts.
        Trainers supported daily and cleared all doubts quickly.`,
    },
    {
      img: "testimonial/person-2.jpg",
      text: `Simple teaching with examples helped me improve quickly.
        Highly recommended for beginners and career transitions.`,
    },
    {
      img: "testimonial/arun-vikkashamuthu.png",
      text: `I joined with very little knowledge, but the classes
        were explained in a simple way. The trainers cleared my
        doubts patiently every day. The assignments helped me
        understand the concepts better. I feel more confident now.`,
    },
    {
      img: "testimonial/person-1.jpg",
      text: `The assignments helped me a lot to understand the real concepts.
        Trainers supported daily and cleared all doubts quickly.`,
    },
    {
      img: "testimonial/person-2.jpg",
      text: `Simple teaching with examples helped me improve quickly.
        Highly recommended for beginners and career transitions.`,
    },
  ];

  const CATEGORY_ORDER = [
    "Software Development",
    "Data Science",
    "UI/UX Design",
    "Digital Marketing",
    "Cloud Computing",
    "Cyber Security",
  ];

  const handleSlideChange = (swiper: any) => {
    const currentSlide = testimonialData[swiper.realIndex];

    if (currentSlide) {
      setActiveImage(currentSlide.img);
    }
  };

  const partners = [
    "certiport.webp",
    "aws.png",
    "microsoft.png",
    "meta.png",
    "accenture.png",
    "capgemini.png",
  ];

  // recruiters logos
  const recruiters1 = [
    "accenture.png",
    "tech-mahindra.png",
    "wipro.png",
    "tcs.png",
    "ibm.png",
    "infosys.png",
  ];
  // recruiters logos
  const recruiters2 = [
    "microsoft.png",
    "cognizant.png",
    "ibm.png",
    "amazon.png",
    "dell.png",
    "oracle.png",
  ];

  const teamImages = [
    {
      id: 1,
      image: "/images/team-image-1.webp",
      alt: "Team Member 1",
    },
    {
      id: 2,
      image: "/images/team-image-2.webp",
      alt: "Team Member 2",
    },
    {
      id: 3,
      image: "/images/team-image-3.webp",
      alt: "Team Member 3",
    },
    {
      id: 4,
      image: "/images/team-image-1.webp",
      alt: "Team Member 1",
    },
    {
      id: 5,
      image: "/images/team-image-2.webp",
      alt: "Team Member 2",
    },
    {
      id: 6,
      image: "/images/team-image-3.webp",
      alt: "Team Member 3",
    },

  ];

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(
      activeFaqIndex === index ? -1 : index
    );
  };

  const faqData = [
    {
      question: "Are your courses taught in Tamil?",
      answer:
        "Yes, all classes are conducted in Tamil to make learning simple and easy to understand.",
    },
    {
      question: "Are the classes live or recorded?",
      answer:
        "Our courses are primarily conducted through live interactive sessions. Recordings of the classes are also provided so you can revisit the lessons anytime for revision.",
    },
    {
      question: "Who can join these courses?",
      answer:
        "Our courses are open to students, fresh graduates, working professionals, career changers, and anyone looking to upskill or start a career in the IT industry.",
    },
    {
      question: "Do you provide placement support?",
      answer:
        "Yes, we offer dedicated placement assistance including resume building, mock interviews, aptitude training, career guidance, and job referral support to help you secure the right opportunity.",
    },
    {
      question: "How can I enroll in a course?",
      answer:
        "You can enroll by filling out the inquiry form on our website, contacting our admissions team, or speaking with one of our course advisors who will guide you through the enrollment process.",
    },
  ];
  return (

    <main>
      {/* HERO - Start */}
      <section className="v-banner">
        <div className="section_container h-100">
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView={1}
            loop={coursesList.length > 1}
            observer={true}
            observeParents={true}
            updateOnWindowResize={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            speed={1000}
            navigation
            className="v-banner-swiper"
          >
            <SwiperSlide className="z-1">
              <div className="row align-items-center">
                <div className="col-lg-6 d-flex flex-column align-items-center align-items-lg-start">
                  <div className="content_left">
                    <h5 className="text-white text-center text-lg-start text-uppercase">
                      Build your career with live <br />
                      online courses
                      {/* {course.title} */}
                    </h5>

                    <p className="text-white text-center text-lg-start">
                      We are committed to provide the best services to grow your
                      business gradually in an efficient way.
                      {/* {course.sub_description} */}
                    </p>

                    <div className="d-flex justify-content-lg-start justify-content-center">
                      <Link
                        // href={`${targetUrl}?courseId=${course.id}&courseType=${course.course_type}`}
                        href={"/live-course"}
                      >
                        <button>
                          Live Courses
                        </button>
                      </Link>
                      <Link
                        // href={`${targetUrl}?courseId=${course.id}&courseType=${course.course_type}`}
                        href={"/recorded-course"}
                      >
                        <button>
                          Self - Paced Courses
                        </button>
                      </Link>
                      <Link
                        // href={`${targetUrl}?courseId=${course.id}&courseType=${course.course_type}`}
                        href={"/refund-policy"}
                      >
                        <button>
                          Refund Policy
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 pe-0 banner_right_part">
                  <div className="right-banner-bg home-banner-bg"></div>
                </div>
              </div>
            </SwiperSlide>
            {/* {coursesList?.slice(0, 3).map((course: any) => {
              const isEnrolled = enrolledCoursesList.some(
                (ec: any) =>
                  ec.id === course.id &&
                  ec.enrollment?.status !== "inactive"
              );

              const targetUrl = isEnrolled
                ? `/learn/${course.slug}`
                : `/course-details/${course.slug}`;

              return (
                <SwiperSlide key={course.id} className="z-1">
                  <div className="row align-items-center">
                    <div className="col-lg-6 d-flex flex-column align-items-center align-items-lg-start">
                      <div className="content_left">
                        <h5 className="text-white text-center text-lg-start text-uppercase">
                          Build your career with live <br />
                          online courses
                        </h5>

                        <p className="text-white text-center text-lg-start">
                          We are committed to provide the best services to grow your
                          business gradually in an efficient way.
                        </p>

                        <div className="d-flex justify-content-lg-start justify-content-center">
                          <Link
                            // href={`${targetUrl}?courseId=${course.id}&courseType=${course.course_type}`}
                            href={"/live-course"}
                          >
                            <button>
                              Live Courses
                            </button>
                          </Link>
                          <Link
                            // href={`${targetUrl}?courseId=${course.id}&courseType=${course.course_type}`}
                            href={"/recorded-course"}
                          >
                            <button>
                              Self - Paced Courses
                            </button>
                          </Link>
                          <Link
                            // href={`${targetUrl}?courseId=${course.id}&courseType=${course.course_type}`}
                            href={"/refund-policy"}
                          >
                            <button>
                              Refund Policy
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6 pe-0 banner_right_part">
                      <div className="right-banner-bg home-banner-bg"></div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })} */}
          </Swiper>
        </div>
      </section>
      {/* HERO - End */}

      {/* About - Start */}
      <section>
        <div className="section_container overflow-hidden pb-lg-0 pb-3">
          <div className="row section-y-padding v-about position-relative z-1 pb-lg-0 pb-5">
            <div className="col-lg-7">
              <div className="abt_left_content">
                <h1 className="section_main_heading">
                  Leading EdTech Platform Transforming Your Careers
                  {/* <span> Learning Easy</span> */}
                </h1>
                <p className="mt-3">
                  Velearn is a tech-driven edtech platform delivering industry-relevant skill development across Tamil Nadu. It combines AI-powered learning systems, expert-led instruction, live classes, and self-paced modules with advanced analytics, all conducted entirely in Tamil. We create measurable career outcomes through cutting-edge technology and quality education.
                  {/* <span>தமிழ்</span> */}
                </p>
                <a href="/about-us"><button>Know more</button></a>
                <div className="col-12 mt-5">
                  <div className="d-flex align-items-center">
                    <Image
                      src={`/images/icons/phone.png`}
                      alt="Phone"
                      width={40}
                      height={40}
                      className="phone-img"
                    />
                    <div className="call_details">
                      {/* <p className="text-c2 mb-0 fw-bold">
                        Have any questions ?
                      </p> */}
                      <p className="fw-bold mb-0">
                        <a href="tel:5555555555">
                          <span className="text-c2 fw-bold"> Confused? Talk to Our Experts for
                            <br />
                            Free </span>5555555555
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 about_sec_right position-relative d-flex justify-content-center align-items-center">
              <div className="d-flex justify-content-center align-items-center">
                <Image
                  src={`/images/about-vector-person.webp`}
                  className="vector_about m-auto h-auto"
                  alt=""
                  height={400}
                  width={400}

                />
              </div>
              <div className="dotted_circle_parent">
                <div className="dotted_circle outer-dotted"></div>
                <div className="dotted_circle inner-dotted"></div>
              </div>
              <div className="counter_parent">
                <div className="counter_group">
                  <div className="counter_child counter_one">
                    <div>
                      <h4
                        className="counter"
                        data-target="10"
                      >
                        0
                      </h4>
                      <p className="text-uppercase">
                        Authorized Partner
                      </p>
                    </div>
                  </div>
                  <div className="counter_child counter_two">
                    <div>
                      <h4
                        className="counter"
                        data-target="10"
                      >
                        0
                      </h4>
                      <p className="text-uppercase">
                        Qualified Trainers
                      </p>
                    </div>
                  </div>
                  <div className="counter_child counter_three">
                    <div>
                      <h4
                        className="counter"
                        data-target="50"
                      >
                        0
                      </h4>
                      <p className="text-uppercase">
                        Certified Courses
                      </p>
                    </div>
                  </div>
                  <div className="counter_child counter_four">
                    <div>
                      <h4
                        className="counter"
                        data-target="100"
                      >
                        0
                      </h4>
                      <p className="text-uppercase">
                        Hiring Partner
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="tech_icon">
                <div className="tech_wrap">
                  <Image
                    src={`/images/icons/react.png`}
                    className="tech-icon tech-icon-one"
                    alt=""
                    height={100}
                    width={100}

                  />
                  <Image
                    src={`/images/icons/js.png`}
                    className="tech-icon tech-icon-two"
                    alt=""
                    height={100}
                    width={100}

                  />
                  <Image
                    src={`/images/icons/angular.png`}
                    className="tech-icon tech-icon-three"
                    alt=""
                    height={100}
                    width={100}

                  />
                  <Image
                    src={`/images/icons/python.png`}
                    className="tech-icon tech-icon-four"
                    alt=""
                    height={100}
                    width={100}

                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About - End */}

      {/* Authorised partners - Start */}
      <section>
        <div className="pb-5 logo_swiper">
          <div className="section_container p-xl text-center mt-5">
            <h3 className="section_base_heading text-center">
              Authorised{" "}
              <span className="text-c2"> Partners</span>
            </h3>
            <Swiper
              className="pt-5"
              modules={[Autoplay]}
              spaceBetween={30}
              slidesPerView={5}
              speed={3000}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              loop={true}
              grabCursor={false}
              allowTouchMove={false}
              breakpoints={{
                320: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {partners.map((logo, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={`/images/partners/${logo}`}
                    alt={`Partner ${index + 1}`}
                    className="partner-logo"
                    height={50}
                    width={150}

                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
      {/* Authorised partners - End */}

      {/* LiveCourse - Start */}
      <section className="py-5" id="liveCourses">
        <div className="section_container live_courses_sec">
          <h3 className="section_base_heading text-black text-center">
            <span className="text-c2"> Live</span> Online Courses With{" "}
            <span className="text-c2">Placement Support</span>
          </h3>
          <div className="row">
            {[
              {
                title: "Full Stack Development",
                img: `${BASE_IMAGE_URL}live-course/full-stack-development.jpg`,
                desc: "A live, mentor-led Full Stack Development program designed to take you from fundamentals to production-ready applications — with real projects, real tools, and real career support.",
                duration: "3 Months",
                link: "/live-course/full-stack-development",
              },
              {
                title: "UI/UX Design",
                img: `${BASE_IMAGE_URL}live-course/ui-ux.webp`,
                desc: "Learn UI/UX design through live classes, hands-on projects, and expert mentorship. Master user research, UX strategy, and modern UI design to become job-ready with a strong portfolio.",
                duration: "3 Months",
                link: "/live-course/ui-ux-design",
              },
              {
                title: "Digital Marketing",
                img: `${BASE_IMAGE_URL}live-course/digital-marketing.webp`,
                desc: "This live Digital Marketing training program is designed to build job-ready skills through hands-on campaign execution, real-time tools, and expert mentorship— preparing you for high-growth roles in today’s digital economy.",
                duration: "3 Months",
                link: "/live-course/digital-marketing",
              },
              {
                title: "Data Science & AI",
                img: `${BASE_IMAGE_URL}live-course/data-science.webp`,
                desc: "This live Data Science and AI/ML program helps you develop job-ready analytical and machine learning skills through hands-on projects, real datasets, and continuous mentor guidance—preparing you for high-impact roles in today’s data-driven world.",
                duration: "3 Months",
                link: "/live-course/data-science",
              },
            ].map((course, index) => (
              <div
                key={index}
                className="col-xl-3 col-lg-6 col-md-6 col-12 mb-5 mb-xl-0"
              >
                <div
                  className={`card_parent h-100 d-flex flex-column ${index % 2 === 0 ? "one" : "two"}`}
                >
                  <div className="card_img_parent overflow-hidden position-relative">
                    <Image
                      src={`${course.img}`}
                      className="card_img w-100"
                      alt={course.title}
                      height={270}
                      width={270}

                    />
                    <div className="live_parent d-flex gap-2 align-items-center justify-content-center">
                      <div className="live_icon"></div>
                      <span className="live_word">
                        Live
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 d-flex flex-column align-items-start flex-grow-1">
                    <h4>{course.title}</h4>

                    <p className="mb-0">
                      {course.desc}
                    </p>

                    <div className="duration_txt d-flex justify-content-end gap-3 w-100">
                      <div>
                        <i className="bi bi-clock pe-1"></i>
                        {course.duration}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 card_abs_butt">
                    <div className="col-12 d-flex justify-content-between">
                      <div className="syllabus_butt">
                        <button>Syllabus</button>
                      </div>
                      <div className="view_more_butt">
                        <Link href={`${course.link}`}>
                          <button>
                            View more
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-12 d-flex justify-content-center more_butt_parent">
              <Link href="/live-course">
                <div className="d-flex more_butt">
                  <div className="butt">Show More</div>
                  <div className="icon_redirect">
                    <i className="bi bi-arrow-right-short"></i>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* LiveCourse - End */}

      {/* RecordedCourse - Start */}
      <section className="pt-3">
        <div className="section_container live_courses_sec">
          <div className="col-12 d-flex justify-content-center">
            <div className="col-lg-6">
              <h3 className="section_base_heading text-black text-center">
                Self-Paced Courses
              </h3>
            </div>
          </div>

          <div className="mt-4 recorded_tab_parent">
            {Object.keys(recordedCourses)
              .sort((a, b) => {
                const indexA = CATEGORY_ORDER.indexOf(a);
                const indexB = CATEGORY_ORDER.indexOf(b);

                if (indexA === -1) return 1;
                if (indexB === -1) return -1;

                return indexA - indexB;
              })
              .map((category) => (
                <button
                  key={category}
                  className={`course_tab_btn ${activeRecordedTab === category ? "active" : ""
                    }`}
                  onClick={() => setActiveRecordedTab(category)}
                >
                  {category}
                </button>
              ))}
          </div>

          <div className="row">
            <Swiper
              key={activeRecordedTab}
              className="py-5"
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={4}
              loop={true}
              navigation={true}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1300: { slidesPerView: 4 },
              }}
            >
              {(recordedCourses[activeRecordedTab] || []).map((course, index) => {
                const isEnrolled =
                  enrolledCoursesList.some(
                    (ec) =>
                      ec.id === course.id &&
                      ec.enrollment?.status !==
                      "inactive",
                  );
                const targetUrl = isEnrolled
                  ? `/learn/${course.slug}`
                  : `/course-details/${course.slug}`;

                return (
                  <SwiperSlide key={course.id}>
                    <Link
                      href={targetUrl}
                    // state={{
                    //     courseId: course.id,
                    //     courseType:
                    //         course.course_type,
                    // }}
                    >
                      <div
                        className={`card_parent h-100 d-flex flex-column ${index % 2 === 0 ? "one" : "two"}`}
                      >
                        <div className="card_img_parent overflow-hidden">
                          <img
                            // src={`${BASE_DYNAMIC_IMAGE_URL}courses/${course.image}`}
                            src={`${BASE_DYNAMIC_IMAGE_URL}courses/${course.image}`}
                            className="card_img w-100"
                            alt={course.title}
                            height={270}
                            width={270}
                          />
                        </div>

                        <div className="pt-3 d-flex flex-column align-items-start flex-grow-1">
                          <h4 className="fw-bold">
                            {course.title}
                          </h4>
                          <p className="mb-2">
                            {
                              course.sub_description
                            }
                          </p>

                          <div className="d-flex justify-content-between align-items-center gap-3 w-100 mt-auto overflow-hidden">
                            <div className="recorded_course_duration">
                              <div className="my-2">
                                <i className="bi bi-clock pe-1 my-2"></i>
                                {
                                  course.recorded_content
                                }{" "}
                                hours
                              </div>
                              {(course.course_type ===
                                "paid" ||
                                course.course_type ===
                                "combo") && (
                                  <div className="d-flex align-items-center mt-2">
                                    <i className="bi bi-star-fill pe-1"></i>
                                    <i className="bi bi-star-fill pe-1"></i>
                                    <i className="bi bi-star-fill pe-1"></i>
                                    <i className="bi bi-star-fill pe-1"></i>
                                    <i className="bi bi-star-fill pe-1"></i>
                                    <span>
                                      (
                                      {course.rating ||
                                        "4.6"}
                                      )
                                    </span>
                                  </div>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              {course.course_type ===
                                "paid" ||
                                course.course_type ===
                                "combo" ? (
                                <>
                                  <span className="new_price">
                                    &#8377;{" "}
                                    {
                                      course.buy_price
                                    }
                                  </span>
                                  <span className="old_price">
                                    <s>
                                      &#8377;{" "}
                                      {
                                        course.mrp_price
                                      }
                                    </s>
                                  </span>
                                </>
                              ) : (
                                <>
                                  {course.course_type ===
                                    "free" && (
                                      <div className="recorded_course_duration">
                                        <i className="bi bi-star-fill pe-1"></i>
                                        <i className="bi bi-star-fill pe-1"></i>
                                        <i className="bi bi-star-fill pe-1"></i>
                                        <i className="bi bi-star-fill pe-1"></i>
                                        <i className="bi bi-star-fill pe-1"></i>
                                        (4.6)
                                      </div>
                                    )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {course.course_type ===
                          "paid" && (
                            <div className="paid_butt mt-3">
                              {" "}
                              Paid{" "}
                            </div>
                          )}
                        {course.course_type ===
                          "free" && (
                            <div className="free_butt mt-3">
                              {" "}
                              Free{" "}
                            </div>
                          )}
                        {course.course_type ===
                          "combo" && (
                            <div className="combo_butt mt-3">
                              {" "}
                              Combo{" "}
                            </div>
                          )}
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <div className="col-12 d-flex justify-content-center more_butt_parent">
              <Link href="/recorded-course">
                <div className="d-flex more_butt">
                  <div className="butt">Show More</div>
                  <div className="icon_redirect">
                    <i className="bi bi-arrow-right-short"></i>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* RecordedCourse - End */}

      {/* Testimonial - Start */}
      <section className="pt-5">
        <div className="section_container">
          <div className="row w-100 m-auto">
            <h3 className="section_base_heading text-black text-center">
              See How <span className="text-c2"> Our Learners</span> Transformed Their Careers
            </h3>
          </div>
        </div>
        <div className="testimonial_wrap w-100 mt-3">
          <div className="section_container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="testimonial_parent">
                  {/* FLOATING IMAGE */}
                  {/* <div className="testimonial_img_wrap">
                    <Image
                      src={`/images/${activeImage}`}
                      className="testi_img"
                      alt="testimonial"
                      height={140}
                      width={140}
                    />
                  </div> */}

                  <Swiper
                    modules={[Autoplay, Pagination]}
                    slidesPerView={1}
                    loop={true}
                    slidesPerGroup={2}
                    autoplay={{
                      delay: 4000,
                      disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                    onSlideChange={(swiper) =>
                      handleSlideChange(swiper)
                    }
                  >
                    {testimonialData.map(
                      (item, index) => (
                        <SwiperSlide key={index}>
                          <p>{item.text}</p>
                        </SwiperSlide>
                      ),
                    )}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonial - End */}

      {/* Prime Recruiters - Start */}
      <section>
        <div className="pb-2">
          <div className="section_container p-xl text-center mt-lg-3 logo_swiper">
            <h3 className="section_base_heading text-center">
              Prime{" "}
              <span className="text-c2"> Recruiters</span>
            </h3>
            <div className="pb-5">
              <Swiper
                className="pt-5"
                modules={[Autoplay]}
                spaceBetween={30}
                slidesPerView={5}
                speed={3000}
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                  reverseDirection: true,
                }}
                loop={true}
                grabCursor={false}
                allowTouchMove={false}
                breakpoints={{
                  320: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 5 },
                }}
              >
                {recruiters1.map((logo, index) => (
                  <SwiperSlide key={index}>
                    <Image
                      src={`/images/prime-recruiters/${logo}`}
                      alt={`Partner ${index + 1}`}
                      className="partner-logo"
                      height={50}
                      width={150}

                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <div className="pt-4">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={30}
                slidesPerView={5}
                speed={3000}
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                }}
                loop={true}
                grabCursor={false}
                allowTouchMove={false}
                breakpoints={{
                  320: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 5 },
                }}
              >
                {recruiters2.map((logo, index) => (
                  <SwiperSlide key={index}>
                    <Image
                      src={`/images/prime-recruiters/${logo}`}
                      alt={`Partner ${index + 1}`}
                      className="partner-logo"
                      height={100}
                      width={100}

                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>
      {/* Prime Recruiters - End */}

      <section className=" pt-5">
        <h3 className="section_base_heading text-center">
          Velearn {" "}
          <span className="text-c2"> Highlights</span>
        </h3>
        <div className="highlights_parent w-100 h-100">

          <div className="section_container p-0">
            <div className="highlights_parent_bg">
              <Image src="/images/highlights-bg.svg" height={2000} width={2000} alt="" />
            </div>
            <div className="highlights_parent_content">
              <div className="section_container">
                <div className="row justify-content-center">
                  <div className="col-lg-11">
                    <div className="row">
                      <div className="col-lg-3">
                        <div className="mx-lg-2 h-100">
                          <div className="highlights_card w-100 one_highlight_card">
                            <h6 className="fw-bold">Placement & Certification</h6>
                            <p className="mb-0">
                              Get industry-recognized certificates and placement support. Your career success is our mission.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="mx-lg- h-100">
                          <div className="highlights_card w-100">
                            <h6 className="fw-bold">Taught by Industry Experts</h6>
                            <p className="mb-0">
                              Learn directly from working professionals who know exactly what industry demands.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="mx-lg-2 h-100">
                          <div className="highlights_card w-100">
                            <h6 className="fw-bold">Learning Made Simple</h6>
                            <p className="mb-0">
                              Every concept explained step-by-step so confusion never gets in your way.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="mx-lg-2 h-100">
                          <div className="highlights_card w-100">
                            <h6 className="fw-bold">Expert Guidance Always Available</h6>
                            <p className="mb-0">
                              Doubt-clearing sessions and mentorship at every step.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Box - Start */}
      <section className="">
        <div className="section_container py-5 p-xl d-flex justify-content-center overflow-hidden">
          <div>
            <div className="mb-5">
              <h3 className="section_base_heading text-center">
                Why Learners Choose and{" "}
                <span className="text-c2">Trust Velearn</span>
              </h3>
              <p className="text-center">
                A supportive community where learning is clear, doubts are answered, and careers are built
              </p>
            </div>
            <div className="row justify-content-center w-100">
              <div className="col-lg-10">
                <div className="row">
                  <div className="col-xl-7">
                    <div className="row px-0 mx-0">
                      <div className="col-lg-12">
                        <div className="count_clr count_clr1">
                          <div className="row">
                            <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center">
                              <h6>
                                Active Learners
                              </h6>
                              <h2>1000+</h2>
                            </div>
                            <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center">
                              <Image
                                src={`/images/bento-vector-1.png`}
                                alt=""
                                height={225}
                                width={300}

                                className="h-auto"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 count_top_height">
                        <div className="count_clr count_clr2 d-flex justify-content-center align-items-center">
                          <div className="d-flex flex-column justify-content-center align-items-center">
                            <h6>Video Lessons</h6>
                            <h2>2000+</h2>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 count_top_height">
                        <div className="count_clr count_clr3">
                          <div className="d-flex justify-content-center gap-2 align-items-center">
                            <i className="bi bi-star-fill"></i>
                            <i className="bi bi-star-fill"></i>
                            <i className="bi bi-star-fill"></i>
                            <i className="bi bi-star-fill"></i>
                            <i className="bi bi-star-fill"></i>
                          </div>
                          <div className="d-flex justify-content-center gap-3 align-items-center">
                            <h6>Rating</h6>
                            <h2>5.0</h2>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-5 count_top_sm_height px-4">
                    <div className="col-lg-12 h-100">
                      <div className="count_clr count_clr4">
                        <div className="d-flex flex-column justify-content-center align-items-center">
                          <h6 className="text-center">
                            Minutes of Video Watched
                          </h6>
                          <h2>20000+</h2>
                        </div>
                        <div className="d-flex justify-content-center align-items-center">
                          <Image
                            src={`/images/bento-vector-3-2.png`}
                            className="image-1 h-auto"
                            alt=""
                            height={100}
                            width={100}

                          />
                          <Image
                            src={`/images/bento-vector-3-1.png`}
                            className="image-2 h-auto"
                            alt=""
                            height={300}
                            width={300}

                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5 count_top_height px-3">
                    <div className="count_clr count_clr5 d-flex justify-content-center align-items-center">
                      <div className="d-flex flex-column justify-content-center align-items-center">
                        <h6>Doubts Cleared</h6>
                        <h2>4500+</h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-7 count_top_height px-3">
                    <div className="count_clr count_clr6">
                      <div className="row w-100 m-auto">
                        <div className="col-lg-8 col-12">
                          <div className="px-lg-5 ps-0 d-flex flex-column justify-content-center align-items-lg-start align-items-center">
                            <h6>
                              Questions Practiced
                            </h6>
                            <h2>5000+</h2>
                          </div>
                        </div>
                        <div className="col-lg-4 col-12 d-flex justify-content-center align-items-center">
                          <Image
                            src={`/images/bento-vector-2.png`}
                            alt=""
                            className="h-auto"
                            height={175}
                            width={175}

                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Bento Box - End */}

      {/* IDE and Debugging- Start */}
      {/* <section>
        <div className="py-5">
          <div className="section_container p-xl text-center mt-5 ide_sec">
            <div className="col-12 d-flex justify-content-center">
              <div className="col-lg-10">
                <h3 className="section_base_heading text-center">
                  Code with{" "}
                  <span className="text-c2">
                    Confidence.
                  </span>{" "}
                  Learn with{" "}
                  <span className="text-c2">
                    Purpose.
                  </span>{" "}
                  Grow with{" "}
                  <span className="text-c2">
                    Velearn.
                  </span>
                </h3>
              </div>
            </div>
            <div className="col-12 d-flex justify-content-center">
              <div className="col-lg-12">
                <div className="row w-100 m-auto">
                  <div className="col-lg-6  d-flex justify-content-center align-items-center">
                    <div className="w-100 h-100 left_box"></div>
                  </div>
                  <div className="col-lg-6 py-4">
                    <div className="pb-3 d-flex flex-column justify-content-start">
                      <h4 className="fw-bold text-start">
                        IDE
                      </h4>
                      <p className="text-start">
                        Velearn offers a fully
                        integrated online IDE where
                        students can write, run, and
                        test code in a real-time
                        development environment.
                        This hands-on setup helps
                        learners build coding
                        confidence and improve
                        practical programming skills
                        with continuous practice.
                      </p>
                      <Link
                        href={"/ide"}
                        className="d-flex justify-content-start"
                      >
                        <button>Start</button>
                      </Link>
                    </div>
                    <div className="pt-3 d-flex flex-column justify-content-start">
                      <h4 className="fw-bold text-start">
                        Debugging
                      </h4>
                      <p className="text-start">
                        Sharpen your problem-solving
                        skills with Velearn’s
                        structured debugging
                        exercises. Students receive
                        curated programs with errors
                        to identify, fix, and
                        optimize—building strong
                        debugging skills essential
                        for industry-ready
                        development
                      </p>
                      <Link
                        href={"/debugging"}
                        className="d-flex justify-content-start"
                      >
                        <button>Start</button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      {/* IDE and Debugging- End */}

      {/* Our Team - Start */}
      <section>
        <div className="pb-5">
          <div className="section_container text-center">
            <div className="col-12 d-flex justify-content-center">
              <div className="col-lg-10">
                <h3 className="section_base_heading text-center">
                  Meet Our{" "}
                  <span className="text-c2">
                    Team{" "}
                  </span>
                  and{" "}
                  <span className="text-c2">
                    Workspace
                  </span>
                </h3>
              </div>
            </div>
            <div className="row w-100 m-auto">
              <Swiper
                modules={[Autoplay]}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                speed={1000}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                    spaceBetween: 16,
                  },
                  576: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  992: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                }}
              >
                {teamImages.map((item) => (
                  <SwiperSlide key={item.id}>
                    <Image
                      src={item.image}
                      alt={item.alt}
                      width={500}
                      height={500}
                      className="w-100 h-auto rounded-4"
                      style={{ transform: "none !important" }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>
      {/* Our Team - End */}

      {/* CTA Section - Start */}
      <section className="pt-lg-4">
        <div className="w-100 get_started_sec">
          <div className="section_container">
            <div className="col-12 d-flex justify-content-center">
              <div className="col-lg-6">
                <h3 className="section_base_heading text-white text-center">
                  Start Your Journey With
                  <span className="text-c2">
                    {" "}Live Online{" "}
                  </span>
                  Training Today
                </h3>
                <p className="text-center text-white">
                  Take the first step toward your career growth with quality training and expert support
                </p>
                <div className="d-flex mt-5 justify-content-center gap-5">
                  <div className="d-flex start_learning">
                    <Link
                      href="/live-course"
                      className="d-flex start_learning"
                    >
                      <div className="butt">
                        Start Learning Now
                      </div>
                      <div className="icon_redirect">
                        <i className="bi bi-arrow-right-short"></i>
                      </div>
                    </Link>
                  </div>
                  <div>
                    <a
                      href="tel:+910000000000"
                      className="d-flex view_butt"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="butt">
                        Call Now
                      </div>
                      <span className="icon_redirect">
                        <i className="bi bi-arrow-right-short"></i>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section - End */}

      {/* Contact Form - Start */}
      <section>
        <div className="form_sec">
          <div className="container">
            <div className="col-12 d-flex justify-content-center">
              <div className="col-lg-5 pt-5">
                <form onSubmit={handleSubmit}>
                  <div className="col-12 d-flex justify-content-center">
                    <div className="col-lg-10">
                      <h3 className="fw-bold text-c1 mb-4 text-center lh-base">
                        Demo, Discounts, or Questions?
                        <span className="text-c2"> Talk to us.</span>
                      </h3>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={contactForm.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone No"
                      value={contactForm.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={contactForm.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 d-flex justify-content-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Form - End */}

      {/* FAQ - Start */}
      <section className="faq_section py-5">
        <div className="section_container p-xl text-center mt-lg-5">
          <h3 className="section_base_heading">
            Frequently Asked
            <span className="text-c2"> Questions</span>
          </h3>

          <div className="row mt-5 align-items-center">
            <div className="col-lg-6 text-start">
              {faqData.map((item, index) => (
                <div
                  key={index}
                  className={`faq_item mb-3 ${activeFaqIndex === index
                    ? "active"
                    : ""
                    }`}
                >
                  <button
                    type="button"
                    className={`faq_question ${activeFaqIndex === index
                      ? "active"
                      : ""
                      }`}
                    onClick={() =>
                      toggleFaq(index)
                    }
                  >
                    {item.question}

                    <span className="icon">
                      <Image
                        src={`/images/icons/faq-icon.png`}
                        alt="toggle"
                        className="faq_toggle_icon h-auto"
                        height={100}
                        width={100}

                      />
                      {/* {activeFaqIndex !== index && (
                        <Image
                          src={`/images/icons/faq-icon.png`}
                          alt="toggle"
                          className="faq_toggle_icon h-auto"
                          height={100}
                          width={100}

                        />
                      )} */}
                    </span>
                  </button>

                  {activeFaqIndex === index && (
                    <div className="faq_answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="col-lg-6">
              <Image
                src={`/images/faq.png`}
                className="w-100 h-auto"
                alt="Velearn FAQ"
                height={400}
                width={600}

              />
            </div>
          </div>
        </div>
      </section>
      {/* FAQ - End */}

    </main>
  );
}