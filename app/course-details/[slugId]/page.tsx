import CourseDetailsPage from "./CourseDetailsPage";

interface PageProps {
    params: Promise<{
        slugId: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { slugId } = await params;

    return <CourseDetailsPage slugId={slugId} />;
}