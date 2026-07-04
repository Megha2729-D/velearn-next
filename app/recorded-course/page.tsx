import { Suspense } from "react";
import RecordedCourseClient from "./RecordedCourseClient";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RecordedCourseClient />
        </Suspense>
    );
}