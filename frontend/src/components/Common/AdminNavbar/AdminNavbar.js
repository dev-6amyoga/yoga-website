import { Button, ButtonDropdown, Drawer } from "@geist-ui/core";
import { Menu } from "@geist-ui/icons";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
import "./AdminNavbar.css";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  return (
    <div>
      <div className="w-full px-4 py-1 flex bg-zinc-800 text-white items-center gap-4">
        <Button
          width={"100%"}
          auto
          ghost
          onClick={() => setOpen(true)}
          icon={<Menu />}
        />
        <p className="font-bold text-xl">6AM Yoga</p>
      </div>
      <Drawer visible={open} onClose={() => setOpen(false)} placement="left">
        <Drawer.Title>6AM Yoga</Drawer.Title>
        <Drawer.Subtitle>Admin Dashboard</Drawer.Subtitle>
        <Drawer.Content>
          <div className="flex flex-col gap-4 w-full">
            {user ? (
              <>
                <h2 className="text-sm text-center">
                  Logged in as {user?.user_name}
                </h2>
                <Button
                  type="error"
                  onClick={() => {
                    setUser(null);
                    navigate("/auth");
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to={"/login"} className="w-full">
                <Button type="primary" width="100%">
                  Login
                </Button>
              </Link>
            )}
            <Button className="w-full">
              <Link to={"/admin"} className="w-full text-zinc-800">
                Dashboard
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Modify Asanas
              </Link>
            </Button>

            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Member Management
              </Link>
            </Button>
            <ButtonDropdown className="w-full">
              <ButtonDropdown.Item main>Content Management</ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link
                  to={"/content/video/create"}
                  className="w-full text-zinc-800"
                >
                  Register New Asana
                </Link>
              </ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link to={"/admin/allAsanas"} className="w-full text-zinc-800">
                  View All Asanas
                </Link>
              </ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link
                  to={"/content/playlist/create"}
                  className="w-full text-zinc-800"
                >
                  Register New Playlist
                </Link>
              </ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link
                  to={"/admin/allPlaylists"}
                  className="w-full text-zinc-800"
                >
                  View All Playlists
                </Link>
              </ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link
                  to={"/content/language/create"}
                  className="w-full text-zinc-800"
                >
                  Register New Language
                </Link>
              </ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link
                  to={"/admin/allLanguages"}
                  className="w-full text-zinc-800"
                >
                  View All Languages
                </Link>
              </ButtonDropdown.Item>
            </ButtonDropdown>

            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Account Management
              </Link>
            </Button>
            <ButtonDropdown className="w-full">
              <ButtonDropdown.Item main>Plan Management</ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link
                  to={"/plan/registerNewPlan"}
                  className="w-full text-zinc-800"
                >
                  Register New Plan
                </Link>
              </ButtonDropdown.Item>
              <ButtonDropdown.Item>
                <Link to={"/plan/viewAllPlans"} className="w-full text-zinc-800">
                  View All Plans
                </Link>
              </ButtonDropdown.Item>             
           
            </ButtonDropdown>
            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Settings
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Forms
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Wallets
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Free Videos
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/content/video/create"}
                className="w-full text-zinc-800"
              >
                Reports
              </Link>
            </Button>
          </div>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
