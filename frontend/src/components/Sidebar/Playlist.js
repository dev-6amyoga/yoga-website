import { Loading, Modal, Spacer } from "@geist-ui/core";
import { Box, Divider, TextField, alpha } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import PlaylistList from "./PlaylistList";

function Playlist({ page }) {
  const [modalState, setModalState] = useState(false);
  const [asana_details, setAsanaDetails] = useState([]);
  const [isAsanaDetailsLoading, setIsAsanaDetailsLoading] = useState(false);

  const appendToAsanaDetails = (newItem) => {
    setAsanaDetails((prevAsanaDetails) => [...prevAsanaDetails, newItem]);
  };

  const [modalData, setModalData] = useState({
    playlist_id: 0,
    playlist_name: "",
    applicable_teachers: [],
    user_id: 0,
    institute_id: 0,
    asana_ids: [],
    playlist_mode: "",
  });

  const [isInstitute, setIsInstitute] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [institutePlaylists, setInstitutePlaylists] = useState([]);
  const [teacherPlaylists, setTeacherPlaylists] = useState([]);
  const [madeForTeacher, setMadeForTeacher] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, userPlan, institutes, currentInstituteId, currentRole] =
    useUserStore(
      useShallow((state) => [
        state.user,
        state.userPlan,
        state.institutes,
        state.currentInstituteId,
        state.currentRole,
      ])
    );

  useEffect(() => {
    const fetchCustomPlanDetails = async (planId) => {
      try {
        const res = await Fetch({
          url: `/customPlan/getCustomPlanById/${planId}`,
          token: true,
          method: "GET",
        });

        if (res.status === 200) {
          return res.data;
        } else {
          return null;
        }
      } catch (err) {
        return null;
      }
    };

    const fetchData = async () => {
      try {
        const res = await Fetch({
          url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
          token: true,
          method: "GET",
        });
        if (res.status === 200) {
          if (res.data.plans) {
            const today = new Date();
            const validPlans = res.data.plans.filter(
              (plan) => new Date(plan.validity_to) > today
            );

            const sortedPlans = validPlans.sort(
              (a, b) => new Date(b.created.$date) - new Date(a.created.$date)
            );

            setCurrentCustomUserPlans(sortedPlans);
            const playlistsPromises = sortedPlans.map(async (plan) => {
              const planId = plan.custom_plan_id;
              return fetchCustomPlanDetails(planId);
            });

            const playlistsData = await Promise.all(playlistsPromises);
            const today1 = new Date();

            let activePlaylists = [];
            for (var i = 0; i !== playlistsData.flat().length; i++) {
              let planiD = playlistsData.flat()[i]._id;
              let playlistsInternal = playlistsData.flat()[i].playlists;
              let matchingUserPlan = sortedPlans.find(
                (plan) => plan.custom_plan_id === planiD
              );

              if (!matchingUserPlan) continue;

              let startDate = new Date(matchingUserPlan.validity_from);
              let endDate = new Date(matchingUserPlan.validity_to);
              let daysSinceStart =
                Math.floor((today1 - startDate) / (1000 * 60 * 60 * 24)) + 1;
              for (var j = 0; j !== playlistsInternal.length; j++) {
                let playlistId = Number(Object.keys(playlistsInternal[j])[0]);
                let active = Object.values(playlistsInternal[j]);
                let activeFrom = active[0][0];
                let activeTo = active[0][1];
                if (
                  daysSinceStart >= activeFrom &&
                  daysSinceStart <= activeTo
                ) {
                  if (today1 < endDate) {
                    activePlaylists.push(playlistId);
                  }
                }
              }
            }

            const uniqueActivePlaylists = [
              ...new Set(activePlaylists.filter((p) => p !== null)),
            ];

            const fetchPlaylistById = async (playlistId) => {
              try {
                const response = await Fetch({
                  url: `/content/playlists/getPlaylistById/${playlistId}`,
                  method: "GET",
                });
                if (response.status === 200) {
                  return response.data;
                } else {
                  toast("error");
                }
              } catch (error) {
                console.error(error);
                return null;
              }
            };

            const playlistDetailsPromises =
              uniqueActivePlaylists.map(fetchPlaylistById);
            const playlistDetails = await Promise.all(playlistDetailsPromises);

            const validPlaylistDetails = playlistDetails.filter(
              (playlist) => playlist !== null
            );
            setCustomPlaylists(validPlaylistDetails);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const user_id = user?.user_id;
  const [currentInstitute, setCurrentInstitute] = useState(null);
  const [allAsanas, setAllAsanas] = useState([]);
  const [allTransitions, setAllTransitions] = useState([]);
  const [schedulePresent, setSchedulePresent] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [nextMonthSchedulePresent, setNextMonthSchedulePresent] =
    useState(false);
  const [nextMonthSchedules, setNextMonthSchedules] = useState([]);
  const queue = usePlaylistStore((state) => state.queue);
  const archive = usePlaylistStore((state) => state.archive);
  const addToQueue = usePlaylistStore((state) => state.addToQueue);
  const clearQueue = usePlaylistStore((state) => state.clearQueue);

  const [query, setQuery] = useState("");
  const searchTimeout = useRef(null);
  const [currentCustomUserPlans, setCurrentCustomUserPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await Fetch({
          url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
          token: true,
          method: "GET",
        });
        if (res.status === 200) {
          if (res.data.plans) {
            // sort desc order of created time
            setCurrentCustomUserPlans(
              res.data.plans.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              )
            );
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (currentInstituteId) {
      Fetch({
        url: "/schedule/getSchedulesById",
        method: "POST",
        data: {
          user_id: user_id,
          user_type: "INSTITUTE",
          institute_id: currentInstituteId,
        },
      }).then((res) => {
        if (res.status === 200) {
          setSchedules(res.data);
          if (res.data.length > 0) {
            setSchedulePresent(true);
            Fetch({
              url: "/schedule/getNextMonthSchedulesById",
              method: "POST",
              data: {
                user_id: user_id,
                user_type: "INSTITUTE",
                institute_id: currentInstituteId,
              },
            }).then((res) => {
              if (res.status === 200) {
                setNextMonthSchedules(res.data);
                if (res.data.length > 0) {
                  setNextMonthSchedulePresent(true);
                }
              }
            });
          }
        }
      });

      //after fetching, check if user_id is a teacher, and if so, fetch their schedules
    }
    //user_id is a student, fetch their schedules
  }, [currentInstitute, user_id]);

  useState(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        const data = response.data;
        setAllAsanas(data);
      } catch (error) {
        toast("Error fetching asanas");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllTransitions",
        });
        const data = response.data;
        setAllTransitions(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const asanasDetails = [];

    const fetchData = async () => {
      try {
        for (var i = 0; i < modalData.asana_ids.length; i++) {
          try {
            let response = null;

            if (String(modalData.asana_ids[i]).includes("T")) {
              response = await Fetch({
                url: "/content/get-transition-by-id",
                method: "POST",
                data: {
                  transition_id: modalData.asana_ids[i],
                },
              });
            } else {
              response = await Fetch({
                url: "/content/get-asana-by-id",
                method: "POST",
                data: {
                  asana_id: modalData.asana_ids[i],
                },
              });
            }

            if (response !== null && response?.status === 200) {
              const data = response.data;
              asanasDetails.push(data);
            }
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (modalData.asana_ids.length > 0) {
      setIsAsanaDetailsLoading(true);
      fetchData()
        .then(() => {
          setAsanaDetails(
            Object.values(
              asanasDetails.reduce((acc, current) => {
                if (current === null || current === undefined) {
                  return acc;
                }

                const currentID = current?.id || current?.transition_id;
                // console.log(acc, currentID, current);
                const isTransition =
                  current?.transition_id !== undefined ? true : false;

                if (
                  acc[currentID] &&
                  ((isTransition &&
                    acc[currentID]?.transition_id === currentID) ||
                    acc[currentID]?.id === currentID)
                ) {
                  acc[currentID].count = acc[currentID].count + 1;
                } else {
                  acc[currentID] = { ...current, count: 1 };
                }
                return acc;
              }, {})
            )
          );
          setIsAsanaDetailsLoading(false);
        })
        .catch((err) => {
          setIsAsanaDetailsLoading(false);
        });
    }
  }, [modalData.asana_ids]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/institute-playlist/get-playlists",
          method: "POST",
          data: {
            institute_id: currentInstituteId,
          },
        });
        if (response?.status === 200) {
          const data = response.data;
          setInstitutePlaylists(data);
        } else {
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (isInstitute && currentInstituteId) {
      fetchData();
    }
  }, [isInstitute, currentInstituteId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/playlists/getAllPlaylists",
          method: "GET",
        });
        if (response?.status === 200) {
          const data = response.data;
          setTeacherPlaylists(data);
          try {
            const response = await Fetch({
              url: "/institute-playlist/get-playlists",
              method: "POST",
              data: {
                institute_id: currentInstituteId,
              },
            });
            if (response?.status === 200) {
              const data = response.data;
              const filteredMadeForTeacher = data.filter((item) => {
                const applicableTeachers = Array.isArray(
                  item.applicable_teachers
                )
                  ? item.applicable_teachers
                  : [];
                const userId = user && user.user_id;
                return userId && applicableTeachers.includes(Number(userId));
              });
              if (madeForTeacher.length > 0) {
                setMadeForTeacher([]);
              }
              setMadeForTeacher((prev) => [...prev, ...filteredMadeForTeacher]);
            }
          } catch (err) {
            console.log(err);
          }
        } else {
          console.log("No playlists made!");
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (isTeacher && currentInstituteId && user) {
      fetchData();
    }
  }, [isTeacher, currentInstituteId, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-institute/get-role-by-user-institute-id",
          method: "POST",
          data: {
            user_id: user?.user_id,
            institute_id: currentInstituteId,
          },
        });
        const data = response.data;
        if (data?.user_institute?.length === 1) {
          if (data.user_institute[0].role.name === "TEACHER") {
            setIsTeacher(true);
            setIsPersonal(false);
          } else if (data.user_institute[0].role.name === "INSTITUTE_OWNER") {
            setIsInstitute(true);
            setIsPersonal(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentInstituteId && user) {
      fetchData();
    }
  }, [currentInstituteId, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/playlists/getAllPlaylists",
        });
        const data = response.data;
        if (currentRole === "STUDENT") {
          const studentPlaylists = data.filter(
            (playlist) => playlist.playlist_mode.toLowerCase() === "student"
          );

          setPlaylists(studentPlaylists);
        } else {
          setPlaylists(data);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    if (userPlan || page === "testing") {
      fetchData();
    } else {
      setPlaylists([]);
    }
  }, [user_id, currentInstituteId, page, userPlan]);

  const handleAddToQueue = useCallback(
    (playlist, playlist_type) => {
      // clearQueue();
      if (playlist?.playlist_dash_url) {
        addToQueue([playlist]);
      } else {
        let videos = [];
        playlist.asana_ids.forEach((asana_id) => {
          if (typeof asana_id === "number") {
            const asana = allAsanas.find(
              (asana) => asana.asana_id === asana_id
            );
            if (asana) {
              videos.push(asana);
            }
          } else {
            const transition = allTransitions.find(
              (transition) => transition.transition_id === asana_id
            );
            if (transition) {
              videos.push(transition);
            }
          }
        });

        addToQueue(videos);
      }
    },
    [addToQueue]
  );

  const showDetails = useCallback(
    (x) => {
      setModalData(x);
      setModalState(true);
    },
    [setModalData, setModalState]
  );

  const closeModal = useCallback(() => {
    setModalState(false);
  }, [setModalState]);

  const handleSearch = useCallback((e) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      const q = String(e.target.value).toLowerCase();
      setQuery(q);
    }, 500);
  }, []);

  useEffect(() => {
    // setUserPlaylists
    const fetchData = async () => {
      try {
        const res = await Fetch({
          url: `/user-playlists/user/${user.user_id}`,
          token: true,
          method: "GET",
        });
        if (res.status === 200) {
          if (res.data) {
            setIsPersonal(true);
          }
          console.log("created playlists :", res.data.playlists);
          setUserPlaylists(res.data.playlists);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <Box
      sx={(theme) => ({
        alignSelf: "center",
        height: { xs: 200, sm: "max-content" },
        width: "100%",
        backgroundSize: "cover",
        borderRadius: "10px",
        outline: "1px solid",
        outlineColor: alpha("#BFCCD9", 0.5),
        boxShadow: `0 0 12px 8px ${alpha("#9CCCFC", 0.2)}`,
        px: 4,
        pb: 4,
      })}
    >
      <Modal visible={modalState} onClose={closeModal} width="30%">
        <Modal.Title>
          {modalData.playlist_name || modalData.schedule_name}
        </Modal.Title>
        <Modal.Subtitle>
          <span>Playlist Type: {modalData.playlist_mode} Mode</span>
          <br />
          <span>
            Playlist Duration: {(modalData.duration / 60).toFixed(2)} minutes
          </span>
          <br />
        </Modal.Subtitle>
        {isAsanaDetailsLoading ? (
          <div className="flex w-full justify-center pt-8 px-4">
            <Loading />
          </div>
        ) : asana_details && asana_details.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 max-h-96 overflow-auto py-10 px-4">
            {asana_details.map((asanaDetail, idx) => (
              <div
                key={
                  (asanaDetail?.asana_name ||
                    asanaDetail?.transition_video_name) + idx
                }
                className="p-2 border border-y-green rounded-lg"
              >
                <p>
                  {asanaDetail?.asana_name ||
                    asanaDetail?.transition_video_name}
                  {asanaDetail?.language ? ` - ${asanaDetail.language}` : ""} (x
                  {asanaDetail.count})
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No asanas found</p>
        )}

        <Modal.Action passive onClick={closeModal}>
          Close
        </Modal.Action>
      </Modal>

      <Spacer h={1} />
      <div
        className="sm:flex sm:justify-between gap-2 sm:w-full pb-4 sm:pb-0"
        id="playlist-section"
      >
        <h3>Playlists & Schedules</h3>
        <Spacer h={1} />
        <TextField
          label="Search"
          size="small"
          fullWidth
          sx={{
            display: { xs: "none", sm: "block" },
            width: "30%",
          }}
          onChange={handleSearch}
        />
        <TextField
          label="Search"
          size="small"
          fullWidth
          sx={{
            display: { xs: "block", sm: "none" },
          }}
          onChange={handleSearch}
        />
      </div>
      <Spacer h={1} />

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PlaylistList
          name="Institute Playlists"
          desc="Choose from institutes' playlists to practice."
          playlists={institutePlaylists}
          query={query}
          handleAddToQueue={handleAddToQueue}
          showDetails={showDetails}
          show={isInstitute}
          isFuture={false}
        />

        <PlaylistList
          name="Teacher's Playlists"
          desc="Choose from your playlists to practice."
          playlists={teacherPlaylists}
          query={query}
          handleAddToQueue={handleAddToQueue}
          showDetails={showDetails}
          show={isTeacher}
          isFuture={false}
        />

        <PlaylistList
          name="Made for you"
          playlists={madeForTeacher}
          query={query}
          handleAddToQueue={handleAddToQueue}
          showDetails={showDetails}
          show={isTeacher}
          isFuture={false}
        />

        <PlaylistList
          name="My Playlists"
          desc="Choose from your playlists to practice."
          playlists={userPlaylists}
          query={query}
          handleAddToQueue={handleAddToQueue}
          showDetails={showDetails}
          show={isPersonal}
          isFuture={false}
        />

        <PlaylistList
          name={"6AM Yoga Curated Playlists"}
          desc={"Choose from curated playlists to practice."}
          playlists={playlists}
          query={query}
          handleAddToQueue={handleAddToQueue}
          showDetails={showDetails}
          show={true}
          isFuture={false}
        />

        <PlaylistList
          name={"Custom Playlists"}
          desc={"Choose from custom playlists to practice."}
          playlists={customPlaylists}
          query={query}
          handleAddToQueue={handleAddToQueue}
          showDetails={showDetails}
          show={true}
          isFuture={false}
        />
      </div>
    </Box>
    // </div>
  );
}

export default Playlist;
