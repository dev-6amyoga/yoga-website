import { Grid, Card, Button, Spacer } from "@geist-ui/core";
import { User } from "@geist-ui/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserStore from "../../../store/UserStore";
// import StudentPlan from "../../../pages/student/StudentPlan";

export default function StudentNavbar() {
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [userPlan, setUserPlan] = useState({});
  const [planId, setPlanId] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [tailorMade, setTailorMade] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-plan/get-user-plan-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user.user_id }),
          }
        );
        const data = await response.json();
        if (data["userPlan"]) {
          setUserPlan(data["userPlan"]);
          setPlanId(data["userPlan"]["plan_id"]);
          try {
            const response1 = await fetch(
              "http://localhost:4000/plan/get-plan-by-id",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  plan_id: data["userPlan"]["plan_id"],
                }),
              }
            );
            const data1 = await response1.json();
            if (data1["plan"]) {
              setTailorMade(data1["plan"]["has_playlist_creation"]);
            } else {
              setTailorMade(false);
            }
          } catch (error) {
            console.log(error);
          }
        } else {
          setDisabled(true);
        }
      } catch (error) {
        setTailorMade(false);
        console.log(error);
      }
    };
    fetchData();
  }, [user.user_id]);

  return (
    <Grid.Container gap={2} justify="center">
      <Grid xs={24}>
        <Card shadow width="100%" type="dark">
          <Grid.Container>
            <Button onClick={() => navigate("/student/purchase-a-plan")}>
              Purchase a plan
            </Button>
            <Spacer w={1} />
            <Button onClick={() => navigate("/student/free-videos")}>
              Free Videos
            </Button>
            <Spacer w={1} />
            <Button
              onClick={() => navigate("/student/playlist-view")}
              disabled={disabled}
            >
              6AM Yoga Playlists
            </Button>
            <Spacer w={1} />
            <Button
              onClick={() => navigate("/student/register-new-playlist")}
              disabled={!tailorMade}
            >
              Make your own Playlist
            </Button>

            <Spacer w={1} />
            <Button>About Us</Button>
            <Spacer w={1} />
            <Button>Contact Us</Button>
            <Spacer w={21} />
            <Button icon={<User />} type="success" ghost>
              {user.name.split(" ")[0]}
            </Button>
            <Spacer w={1} />
            <Button
              type="error"
              onClick={() => {
                setUser(null);
                navigate("/auth");
              }}
            >
              Logout
            </Button>
          </Grid.Container>
        </Card>
      </Grid>
    </Grid.Container>
  );
}
