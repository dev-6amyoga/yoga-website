import TeacherNavbar from "./TeacherNavbar/TeacherNavbar";

export default function TeacherPageWrapper({ heading, children }) {
  return (
    <>
      <TeacherNavbar />
      <div className="max-w-7xl mx-auto">
        {heading ? (
          <h1 className="pt-4 font-bold text-center">{heading}</h1>
        ) : (
          <></>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </>
  );
}
