import {
  Logout,
  PersonOutline,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Avatar,
  ListItemIcon,
  Menu,
  Typography,
  Collapse,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { Fetch, FetchRetry } from "../../../utils/Fetch";
import Tooltip from "@mui/material/Tooltip";

const logoStyle = {
  width: "80px",
  height: "auto",
  cursor: "pointer",
  margin: "0 10px",
};

function TeacherNavbar({ mode, toggleColorMode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  let user = useUserStore((state) => state.user);
  const [disabled, setDisabled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await Fetch({
        url: `/teacher-plan/plans/${user.user_id}`,
        method: "GET",
      });
      if (response.data.planId === -1) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleOpenProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenProfileMenu(true);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
    setOpenProfileMenu(false);
  };

  const resetUserState = useUserStore((state) => state.resetUserState);

  const handleLogout = async () => {
    try {
      const res = await FetchRetry({
        url: "/auth/logout",
        method: "POST",
        token: true,
        n: 5,
      });

      if (res.status === 200) {
        resetUserState();
        navigate("/auth");
      } else {
        throw new Error("Logout Error; Please try again");
      }
    } catch (error) {
      toast.error("Logout Error; Please try again");
    }
  };

  const paths = useMemo(() => {
    return [
      {
        title: "Class Management",
        props: {
          disabled: false,
        },
        children: [
          {
            path: "/teacher/class/view-all",
            title: "View All Classes",
            props: { disabled: false },
          },
          {
            path: "/teacher/class/join",
            title: "Join Class",
            props: { disabled: false },
          },
          {
            path: "/teacher/class/log-attendance",
            title: "Log Attendance",
            props: { disabled: false },
          },
          {
            path: "/teacher/class/attendance-logs",
            title: "View Attendance Logs",
            props: { disabled: false },
          },
          // {
          //   path: "/teacher/class/member-details",
          //   title: "Member Details",
          //   props: { disabled: false },
          // },
        ],
      },
      {
        path: "/teacher/video-player",
        title: "Video Player",
        props: {
          disabled: false,
        },
      },
      {
        title: "Member Management",
        props: {
          disabled: false,
        },
        children: [
          {
            path: "/teacher/members/students",
            title: "Students",
            props: { disabled: false },
          },
          {
            path: "/teacher/members/user-plan-mappings",
            title: "User Plan Mappings",
            props: { disabled: false },
          },
        ],
      },
      {
        title: "Transaction Management",
        props: {
          disabled: false,
        },
        children: [
          {
            path: "/teacher/transactions/all",
            title: "All Transactions",
            props: { disabled: false },
          },
        ],
      },
    ];
  }, [disabled]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const toggleMenu = (menuTitle) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuTitle]: !prev[menuTitle],
    }));
  };

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderRadius: "999px",
              bgcolor:
                theme.palette.mode === "light"
                  ? "rgba(255, 255, 255, 0.4)"
                  : "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(24px)",
              maxHeight: 40,
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                theme.palette.mode === "light"
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : "0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)",
            })}
          >
            {/* desktop */}
            <Box
              sx={{
                flexGrow: 1,
                display: { md: "flex", sm: "none", xs: "none" },
                alignItems: "center",
                ml: "-18px",
                px: 0,
              }}
            >
              <img
                src={"/logo_6am.png"}
                style={logoStyle}
                alt="logo of 6AM Yoga"
              />
              <div className="flex flex-row gap-4 justify-between w-full">
                <div className="flex flex-wrap items-center gap-1">
                  {paths.map((path, index) => {
                    const isActive =
                      path.path && location.pathname === path.path;
                    const hasChildren =
                      path.children && path.children.length > 0;

                    if (hasChildren) {
                      return (
                        <div key={index} style={{ position: "relative" }}>
                          <MenuItem
                            onClick={() => toggleMenu(path.title)}
                            sx={{
                              py: "6px",
                              px: "12px",
                              backgroundColor: expandedMenus[path.title]
                                ? "rgba(153, 189, 247, 0.3)"
                                : "",
                              borderRadius: "1rem",
                              display: "flex",
                              gap: "4px",
                            }}
                            disabled={path.props.disabled}
                          >
                            <Typography variant="body2" color="text.primary">
                              {path.title}
                            </Typography>
                            {expandedMenus[path.title] ? (
                              <ExpandLess fontSize="small" />
                            ) : (
                              <ExpandMore fontSize="small" />
                            )}
                          </MenuItem>
                          {expandedMenus[path.title] && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                backgroundColor: "background.paper",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: "0.5rem",
                                zIndex: 1300,
                                minWidth: "200px",
                                boxShadow: 3,
                              }}
                            >
                              {path.children.map((child, childIndex) => (
                                <MenuItem
                                  key={childIndex}
                                  onClick={() => {
                                    handleNavigate(child.path);
                                    toggleMenu(path.title);
                                  }}
                                  sx={{
                                    py: "8px",
                                    px: "16px",
                                    backgroundColor:
                                      location.pathname === child.path
                                        ? "rgba(153, 189, 247, 0.3)"
                                        : "",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(153, 189, 247, 0.2)",
                                    },
                                  }}
                                  disabled={child.props.disabled}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {child.title}
                                  </Typography>
                                </MenuItem>
                              ))}
                            </Box>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Tooltip
                        key={index}
                        title={
                          path.props.disabled
                            ? "Purchase a plan to access this feature"
                            : ""
                        }
                      >
                        <span>
                          <MenuItem
                            onClick={() => {
                              return handleNavigate(path.path);
                            }}
                            sx={{
                              py: "6px",
                              px: "12px",
                              backgroundColor: isActive
                                ? "rgba(153, 189, 247, 0.3)"
                                : "",
                              borderRadius: "1rem",
                            }}
                            disabled={path.props.disabled}
                          >
                            <Typography variant="body2" color="text.primary">
                              {path.title}
                            </Typography>
                          </MenuItem>
                        </span>
                      </Tooltip>
                    );
                  })}
                </div>

                <div>
                  <Button>
                    <Avatar
                      onClick={handleOpenProfileMenu}
                      sx={{
                        bgcolor: "primary.main",
                      }}
                    >
                      {user ? user.name[0] : ""}
                    </Avatar>
                  </Button>

                  <Menu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={openProfileMenu}
                    onClose={handleCloseProfileMenu}
                    onClick={handleCloseProfileMenu}
                    transformOrigin={{
                      horizontal: "right",
                      vertical: "top",
                    }}
                    anchorOrigin={{
                      horizontal: "right",
                      vertical: "bottom",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate("/student/my-profile");
                        handleCloseProfileMenu();
                      }}
                    >
                      <ListItemIcon>
                        <PersonOutline fontSize="small" />
                      </ListItemIcon>{" "}
                      Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleCloseProfileMenu();
                        handleLogout();
                      }}
                    >
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </div>
              </div>
            </Box>

            {/* mobile */}
            <Box
              sx={{
                display: { sm: "", md: "none" },
                width: "100%",
              }}
            >
              <div className="w-full flex justify-between">
                <img
                  src={"/logo_6am.png"}
                  style={logoStyle}
                  alt="logo of 6AM Yoga"
                />
                <Button
                  variant="text"
                  color="primary"
                  aria-label="menu"
                  onClick={() => setOpen(true)}
                  sx={{ minWidth: "30px", p: "4px" }}
                >
                  <MenuIcon />
                </Button>
              </div>
              <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <Box
                  sx={{
                    minWidth: "60dvw",
                    p: 2,
                    backgroundColor: "background.paper",
                    flexGrow: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "end",
                      gap: "1rem",
                      flexGrow: 1,
                    }}
                  >
                    {paths.map((path, index) => {
                      const hasChildren =
                        path.children && path.children.length > 0;
                      const isExpanded = expandedMenus[path.title];

                      if (hasChildren) {
                        return (
                          <div key={index} style={{ width: "100%" }}>
                            <MenuItem
                              onClick={() => toggleMenu(path.title)}
                              sx={{
                                backgroundColor: isExpanded
                                  ? "rgba(153, 189, 247, 0.3)"
                                  : "",
                                borderRadius: "1rem",
                                transition: `background-color 0.3s ease-in-out`,
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                              disabled={path.props.disabled}
                            >
                              <Typography>{path.title}</Typography>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </MenuItem>
                            <Collapse in={isExpanded} timeout="auto">
                              <Box
                                sx={{
                                  pl: 4,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.5rem",
                                }}
                              >
                                {path.children.map((child, childIndex) => (
                                  <MenuItem
                                    key={childIndex}
                                    onClick={() => {
                                      handleNavigate(child.path);
                                      setOpen(false);
                                    }}
                                    sx={{
                                      backgroundColor:
                                        location.pathname === child.path
                                          ? "rgba(153, 189, 247, 0.3)"
                                          : "",
                                      borderRadius: "0.5rem",
                                      transition: `background-color 0.3s ease-in-out`,
                                    }}
                                    disabled={child.props.disabled}
                                  >
                                    <Typography variant="body2">
                                      {child.title}
                                    </Typography>
                                  </MenuItem>
                                ))}
                              </Box>
                            </Collapse>
                          </div>
                        );
                      }

                      return (
                        <MenuItem
                          key={index}
                          onClick={() => handleNavigate(path.path)}
                          sx={{
                            backgroundColor:
                              location.pathname === path.path
                                ? "rgba(153, 189, 247, 0.3)"
                                : "",
                            borderRadius: "1rem",
                            transition: `background-color 0.3s ease-in-out`,
                          }}
                          disabled={path.props.disabled}
                        >
                          {path.title}
                        </MenuItem>
                      );
                    })}
                    <Divider />
                    {user ? (
                      <>
                        <h2 className="text-center text-sm">
                          Logged in as {user?.name}
                        </h2>
                        <Button variant="destructive" onClick={handleLogout}>
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <MenuItem>
                          <Button
                            color="primary"
                            variant="outlined"
                            onClick={() => navigate("/auth")}
                            sx={{ width: "100%" }}
                          >
                            Sign in / Sign Up
                          </Button>
                        </MenuItem>
                      </>
                    )}
                  </Box>
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

export default TeacherNavbar;
