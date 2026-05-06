import React, { useState } from "react";
import { toast } from "react-toastify";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";

const initialForm = {
  query_name: "",
  query_email: "",
  query_phone: "",
  query_text: "",
};

export default function TeacherEnquiries() {
  const user = useUserStore((state) => state.user);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await Fetch({
        url: "/query/register",
        method: "POST",
        data: {
          ...formData,
          query_source: "teacher",
          entered_by_user_id: user?.user_id || null,
          entered_by_name: user?.name || null,
        },
      });

      toast.success("Enquiry saved successfully");
      setFormData(initialForm);
    } catch (error) {
      console.error("Error saving enquiry:", error);
      toast.error("Could not save enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TeacherPageWrapper heading="New Enquiry">
      <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                name="query_name"
                value={formData.query_name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Phone
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                name="query_phone"
                value={formData.query_phone}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
              name="query_email"
              type="email"
              value={formData.query_email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Enquiry details
            <textarea
              className="min-h-[140px] rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
              name="query_text"
              value={formData.query_text}
              onChange={handleChange}
            />
          </label>

          <div className="flex justify-end">
            <button
              className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </TeacherPageWrapper>
  );
}
