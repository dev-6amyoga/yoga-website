import { Button, Divider, Note } from "@geist-ui/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { getMongoDecimalValue } from "../../utils/getMongoDecimalValue";

export default function StudentWatchHistory() {
  const user = useUserStore((state) => state.user);
  const [watchHistory, setWatchHistory] = useState([]);
  const [watchTimeLog, setWatchTimeLog] = useState([]);
  const [customerCode, setCustomerCode] = useState("");
  const [watchTimeLimit, setWatchTimeLimit] = useState(0);
  const [watchTimeQuota, setWatchTimeQuota] = useState(0);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    if (window) {
      setCustomerCode("eyxw0l155flsxhz3");
    }
  }, []);

  const fetchWatchHistory = useCallback(() => {
    Fetch({
      url: "http://localhost:4000/watch-history/get",
      method: "POST",
      token: true,
      data: {
        user_id: user.user_id,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          setWatchHistory(res.data.watchHistory);
        }
      })
      .catch((err) => {
        console.log(err);
        toast("Error fetching watch history", {
          type: "error",
        });
      });
  }, [user]);

  const fetchWatchTimeLog = useCallback(() => {
    Fetch({
      url: "http://localhost:4000/watch-time/get",
      method: "POST",
      token: true,
      data: {
        user_id: user.user_id,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          setWatchTimeLog(res.data.watchTimeLog);
        }
      })
      .catch((err) => {
        console.log(err);
        toast("Error fetching watch time", {
          type: "error",
        });
      });
  }, [user]);

  const fetchWatchTimeQuota = useCallback(() => {
    Fetch({
      url: "http://localhost:4000/watch-time/get-quota",
      method: "POST",
      token: true,
      data: {
        user_id: user.user_id,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          setWatchTimeLimit(res.data?.user_plan?.plan?.watch_time_limit);
          setActivePlan(res.data?.user_plan?.plan?.name);
          setWatchTimeQuota(res.data?.quota?.quota);
        }
      })
      .catch((err) => {
        console.log(err);
        toast("Error fetching watch time", {
          type: "error",
        });
      });
  }, [user]);

  useEffect(() => {
    fetchWatchHistory();
    fetchWatchTimeLog();
    fetchWatchTimeQuota();
  }, [fetchWatchHistory, fetchWatchTimeLog, fetchWatchTimeQuota]);

  const watchTimeString = useMemo(() => {
    const [hh, mm, ss] = new Date(
      watchTimeLog?.reduce((acc, curr) => acc + curr.duration, 0).toFixed(2) *
        1000
    )
      .toISOString()
      .slice(11, 19)
      .split(":");
    return (
      <div className="grid grid-cols-3">
        <p className="flex flex-col gap-2 items-center">
          <span className="text-5xl font-mono">{hh}</span>
          <span>Hours</span>
        </p>
        <p className="flex flex-col gap-2 items-center">
          <span className="text-5xl font-mono">{mm}</span>
          <span>Minutes</span>
        </p>
        <p className="flex flex-col gap-2 items-center">
          <span className="text-5xl font-mono">{ss}</span>
          <span>Seconds</span>
        </p>
      </div>
    );
  }, [watchTimeLog]);

  return (
    <StudentPageWrapper heading="Watch History">
      <Button
        onClick={() => {
          fetchWatchHistory();
          fetchWatchTimeLog();
          fetchWatchTimeQuota();
        }}
      >
        Refresh
      </Button>

      <section className="flex flex-col md:flex-row gap-2 md:items-start justify-between my-8">
        <div className="border p-4 bg-slate-800 text-ybrown-100 max-w-xl rounded-xl text-center flex-1">
          <div className="pb-4">
            <h3 className="text-4xl">Watch Time</h3>
            <small>All Time</small>
          </div>
          {watchTimeString}
        </div>
        <div className="border p-4 bg-slate-800 text-ybrown-100 max-w-xl rounded-xl text-center flex-1">
          <div className="pb-4">
            <h3 className="text-4xl">Quota</h3>
            <small>{activePlan}</small>
          </div>
          <p className="flex flex-col gap-2 items-center">
            <span className="text-5xl font-mono">
              {(getMongoDecimalValue(watchTimeQuota) / 3600).toFixed(2)}
              <span> / </span>
              {watchTimeLimit / 3600}
            </span>
            <span>Hours</span>
          </p>
        </div>
      </section>

      <Divider />
      <section className="my-8">
        <h2>Watch History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4">
          {watchHistory?.map((wh) => (
            <Note key={wh._id} label={false}>
              <div className="flex flex-row gap-4 items-start">
                <img
                  src={`https://customer-${customerCode}.cloudflarestream.com/${wh.asana[0]?.asana_videoID}/thumbnails/thumbnail.jpg?time=1s?height=150`}
                  alt={wh.asana[0] ? wh.asana[0]?.asana_name : wh._id + "video"}
                  className="h-24 rounded-xl"
                />
                <div>
                  <p className="font-bold text-base">
                    {wh?.asana[0]?.asana_name}
                  </p>
                  <p className="text-sm text-zinc-700">
                    {wh?.asana[0]?.asana_desc}
                  </p>
                  <p className="">{new Date(wh.created_at).toDateString()}</p>
                </div>
              </div>
            </Note>
          ))}
        </div>
      </section>
    </StudentPageWrapper>
  );
}
