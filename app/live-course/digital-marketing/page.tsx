"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
    Autoplay,
    Navigation,
    EffectCoverflow,
    Pagination,
} from "swiper/modules";
import "./style.css"
import "swiper/css";
import "swiper/css/effect-coverflow";

const BASE_API_URL = "https://velearn.in/velearn-crm/api/";
const BASE_IMAGE_URL = "https://velearn.in/assets/images/";
const BASE_DYNAMIC_IMAGE_URL =
    "https://velearn.in/velearn-crm/public/uploads/";

export default function DigitalMarketing() {

    return (
        <>
            DIGITAL MARKETING
        </>
    );
}