import { useEffect, useState } from "react";
import InstituteNavbar from "../../../components/Common/InstituteNavbar/InstituteNavbar";
import Playlist from "../../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../../components/StackVideoShaka/VideoPlayerWrapper";
import VideoQueue from "../../../components/StackVideoShaka/VideoQueue";
import {
  ROLE_INSTITUTE_ADMIN,
  ROLE_INSTITUTE_OWNER,
} from "../../../enums/roles";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function InstitutePlaylistPage() {
  let user = useUserStore((state) => state.user);
  const [userPlan, setUserPlan] = useState({});
  const [planId, setPlanId] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });
        const data = response.data;
        setUserPlan(data["userPlan"]);
        setPlanId(data["userPlan"]["plan_id"]);
      } catch (error) {
        console.log(error);
      }
    };
    // fetchData();
  }, [user?.user_id]);

  return (
    <div className="flex-col justify-center">
      <InstituteNavbar />
      <br />
      <br />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-7 gap-4 my-10">
          <VideoPlayerWrapper />
          <VideoQueue />
        </div>
        <hr />
        <div className="my-10">
          <Playlist />
        </div>
      </div>
    </div>
  );
}

export default withAuth(InstitutePlaylistPage, ROLE_INSTITUTE_ADMIN);
