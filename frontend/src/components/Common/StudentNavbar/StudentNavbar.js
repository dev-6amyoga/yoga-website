import { Grid, Card, Button, Spacer } from "@geist-ui/core";
import { User } from "@geist-ui/icons";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
export default function StudentNavbar() {
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  return (
    <Grid.Container gap={2} justify="center">
      <Grid xs={24}>
        <Card shadow width="100%" type="dark">
          <Grid.Container>
            <Button>Purchase a plan</Button>
            <Spacer w={3} />
            <Button>Free Videos</Button>
            <Spacer w={3} />
            <Button>About Us</Button>
            <Spacer w={3} />
            <Button>Contact Us</Button>
            <Spacer w={40} />
            <Button icon={<User />} type="success" ghost>
              {user.name.split(" ")[0]}
            </Button>
            <Spacer w={3} />
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
