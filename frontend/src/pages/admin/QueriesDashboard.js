import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";

const initialForm = {
  query_name: "",
  query_email: "",
  query_phone: "",
  query_text: "",
};

const formatDate = (value) => {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function QueriesDashboard() {
  const user = useUserStore((state) => state.user);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const response = await Fetch({
        url: "/query/get-all",
        method: "GET",
      });
      setQueries(response.data?.queries || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Could not load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const filteredQueries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return queries.filter((query) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "followed" && query.follow_up_status) ||
        (statusFilter === "pending" && !query.follow_up_status);

      const searchableText = [
        query.query_name,
        query.query_email,
        query.query_phone,
        query.query_text,
        query.entered_by_name,
        query.query_source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(normalizedSearch);
    });
  }, [queries, search, statusFilter]);

  const pendingCount = queries.filter(
    (query) => !query.follow_up_status,
  ).length;
  const followedCount = queries.length - pendingCount;

  const updateFollowUp = async (query, followUpStatus) => {
    setSavingId(query.query_id);

    try {
      const response = await Fetch({
        url: `/query/${query.query_id}/follow-up`,
        method: "PATCH",
        data: {
          follow_up_status: followUpStatus,
          follow_up_notes: query.follow_up_notes || "",
        },
      });

      setQueries((prev) =>
        prev.map((item) =>
          item.query_id === query.query_id ? response.data.query : item,
        ),
      );
      toast.success("Follow-up updated");
    } catch (error) {
      console.error("Error updating follow-up:", error);
      toast.error("Could not update follow-up");
    } finally {
      setSavingId(null);
    }
  };

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
          query_source: "admin",
          entered_by_user_id: user?.user_id || null,
          entered_by_name: user?.name || null,
        },
      });

      toast.success("Enquiry saved successfully");
      setFormData(initialForm);
      await fetchQueries();
    } catch (error) {
      console.error("Error saving enquiry:", error);
      toast.error("Could not save enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const updateLocalNotes = (queryId, value) => {
    setQueries((prev) =>
      prev.map((query) =>
        query.query_id === queryId
          ? { ...query, follow_up_notes: value }
          : query,
      ),
    );
  };

  return (
    <AdminPageWrapper heading="Enquiries">
      <div className="grid gap-5">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Log enquiry
          </h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Enquiry details
              <textarea
                className="min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
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

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total enquiries</p>
            <p className="text-3xl font-bold text-slate-900">
              {queries.length}
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Pending follow-up</p>
            <p className="text-3xl font-bold text-amber-900">{pendingCount}</p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Followed up</p>
            <p className="text-3xl font-bold text-emerald-900">
              {followedCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 md:flex-row">
          <input
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Search by name, phone, email, source, or notes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="followed">Followed up</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-slate-600">
            Loading enquiries...
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-slate-600">
            No enquiries found
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Person</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Enquiry</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQueries.map((query) => (
                  <tr key={query.query_id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">
                        {query.query_name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDate(query.created)}
                      </div>
                      <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {query.query_source || "website"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div>{query.query_phone}</div>
                      <div>{query.query_email}</div>
                      {query.entered_by_name ? (
                        <div className="mt-2 text-xs text-slate-500">
                          Entered by {query.entered_by_name}
                        </div>
                      ) : null}
                    </td>
                    <td className="max-w-md px-4 py-4 text-slate-700">
                      {query.query_text}
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={`mb-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          query.follow_up_status
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {query.follow_up_status ? "Followed up" : "Pending"}
                      </div>
                      <textarea
                        className="min-h-[80px] w-72 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                        placeholder="Follow-up notes"
                        value={query.follow_up_notes || ""}
                        onChange={(event) =>
                          updateLocalNotes(query.query_id, event.target.value)
                        }
                      />
                      {query.followed_up_at ? (
                        <div className="mt-1 text-xs text-slate-500">
                          Last updated {formatDate(query.followed_up_at)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid gap-2">
                        <button
                          className={`rounded-md px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400 ${
                            query.follow_up_status
                              ? "bg-slate-700"
                              : "bg-emerald-600"
                          }`}
                          disabled={savingId === query.query_id}
                          onClick={() =>
                            updateFollowUp(query, !query.follow_up_status)
                          }
                        >
                          {query.follow_up_status
                            ? "Mark Pending"
                            : "Mark Followed"}
                        </button>
                        <button
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                          disabled={savingId === query.query_id}
                          onClick={() =>
                            updateFollowUp(query, query.follow_up_status)
                          }
                        >
                          Save Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
}
