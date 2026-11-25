import { LessonsNav } from "@/components/lessons-nav";

export default function LessonsLayout({ children }: LayoutProps<"/lessons">) {
  return (
    <>
      <LessonsNav />
      <div className="mt-6 lg:mt-0">{children}</div>
    </>
  );
}
