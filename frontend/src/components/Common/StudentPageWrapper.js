import StudentNavMUI from "./StudentNavbar/StudentNavMUI";

export default function StudentPageWrapper({ heading, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentNavMUI />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto pt-24 pb-10 px-4 xl:px-0">
          {heading && <h1 className="pt-4 font-bold text-center">{heading}</h1>}

          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
