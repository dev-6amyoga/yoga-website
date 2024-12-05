import {
  Button,
  Checkbox,
  Description,
  Input,
  Spacer,
  Select,
  Divider,
  Text,
} from "@geist-ui/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../../../utils/Fetch";
import AdminPageWrapper from "../../../../components/Common/AdminPageWrapper";
import EditVideoForm from "../../../../components/content-management/video/edit/EditVideoForm";
import SaveChangesAlert from "../../../../components/content-management/video/edit/SaveChangesAlert";
import usePlaylistStore from "../../../../store/PlaylistStore";
function EditAsana() {
  const { asana_id } = useParams();
  const [modalData, setModalData] = useState({});
  const [tableLanguages, setTableLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dirty, setDirty] = useState(false);
  const editAsanaFormRef = useRef(null);

  const [asanaData, setAsanaData] = useState({
    vibhagiya: false,
    omkara: false,
    catch_waist_start: false,
    catch_waist_end: false,
    nose_lock_start: false,
    nose_lock_end: false,
    chin_lock_start: false,
    chin_lock_end: false,
    eye_close_start: false,
    eye_close_end: false,
    shanmuga_start: false,
    shanmuga_end: false,
    vajra_side: false,
    vajra_start: false,
    vajra_end: false,
    namaskara_start: false,
    namaskara_end: false,
  });
  const [formState, setFormState] = useState({});

  const handleCheckboxChange = (key) => {
    setFormState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname
  );
  const [unloadBlock, setUnloadBlock] = useState(false);

  const [addToQueue, clearQueue] = usePlaylistStore((state) => [
    state.addToQueue,
    state.clearQueue,
  ]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [asana, setAsana] = useState({});

  const updateData = useCallback(async () => {
    setLoading(true);
    Fetch({
      url: `/content/video/updateAsana/${asana.id}`,
      method: "PUT",
      data: { ...formState },
    })
      .then((res) => {
        setAsana(res.data);
        setModalData(res.data);
        setDirty(false);
        if (editAsanaFormRef.current) {
          editAsanaFormRef.current.reset();
        }
        toast("Updated successfully!");
        navigate("/admin/video/view-all");
        setLoading(false);
      })
      .catch((error) => {
        toast(error, { type: "error" });
        setLoading(false);
      });
  }, [asana, formState]);

  const resetChanges = useCallback(() => {
    setModalData(asana);
    if (editAsanaFormRef.current) {
      editAsanaFormRef.current.reset();
    }
    setDirty(false);
  }, [asana]);

  const handleUnloadToggle = useCallback(
    (e) => {
      e.preventDefault();
      if (unloadBlock) {
        setUnloadBlock(false);
        return;
      }

      if (dirty) {
        setUnloadBlock(true);
      }
    },
    [dirty, unloadBlock]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleUnloadToggle);

    return () => {
      window.removeEventListener("beforeunload", handleUnloadToggle);
    };
  }, [handleUnloadToggle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData();
  };

  useEffect(() => {
    clearQueue();
    if (asana?.id) {
      addToQueue([asana]);
    }
    return () => {
      clearQueue();
    };
  }, [asana, addToQueue, clearQueue]);

  useEffect(() => {
    if (asana_id) {
      setLoading(true);
      Fetch({
        url: "/content/get-asana-by-id",
        method: "POST",
        data: {
          asana_id: asana_id,
        },
      })
        .then((res) => {
          setAsana(res.data);
          setFormState(res.data);
          setLoading(false);
        })
        .catch((error) => {
          toast("Error fetching asana", { type: "error" });
          setLoading(false);
        });
    }
  }, [asana_id]);

  const handleChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/language/getAllLanguages",
        });
        setTableLanguages(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/asana/getAllAsanaCategories",
        });
        setCategories(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminPageWrapper heading="Edit Asana">
      <SaveChangesAlert
        unloadBlock={unloadBlock}
        handleUnloadToggle={handleUnloadToggle}
        blocker={blocker}
        updateData={updateData}
        dirty={dirty}
      />
      <form
        className="flex flex-col gap-4 p-4 border rounded-md bg-white"
        onSubmit={handleSubmit}
      >
        <Text h3>Edit Asana Video</Text>

        <Input
          width="100%"
          id="asana_name"
          placeholder="Enter Asana Name"
          value={formState.asana_name || ""}
          onChange={(e) => handleChange("asana_name", e.target.value)}
        >
          Asana Name
        </Input>

        <Text>Asana Category</Text>
        <Select
          placeholder="Choose Category"
          value={formState.asana_category}
          onChange={(value) => handleChange("asana_category", value)}
        >
          {categories &&
            categories.map((x) => (
              <Select.Option key={x.asana_category_id} value={x.asana_category}>
                {x.asana_category}
              </Select.Option>
            ))}
        </Select>

        <Text>Language</Text>
        <Select
          placeholder="Choose Language"
          value={formState.language}
          onChange={(value) => handleChange("language", value)}
        >
          {tableLanguages &&
            tableLanguages.map((lang) => (
              <Select.Option key={lang.language_id} value={lang.language}>
                {lang.language}
              </Select.Option>
            ))}
        </Select>

        <Text>Asana Difficulty</Text>
        <Select
          placeholder="Select Difficulty"
          value={formState.asana_difficulty}
          onChange={(value) => handleChange("asana_difficulty", value)}
        >
          <Select.Option value="Beginner">Beginner</Select.Option>
          <Select.Option value="Intermediate">Intermediate</Select.Option>
          <Select.Option value="Advanced">Advanced</Select.Option>
        </Select>

        <Text>Video Type</Text>
        <Select
          placeholder="Choose Type"
          value={formState.asana_type}
          onChange={(value) => handleChange("asana_type", value)}
        >
          <Select.Option value="Single">Single</Select.Option>
          <Select.Option value="Combination">Combination</Select.Option>
        </Select>

        <Input
          width="100%"
          id="asana_dash_url"
          placeholder="Enter DASH URL"
          value={formState.asana_dash_url || ""}
          onChange={(e) => handleChange("asana_dash_url", e.target.value)}
        >
          DASH URL
        </Input>

        <Text>AI Transition</Text>
        <Checkbox.Group
          value={[
            formState.ai_asana && "ai_transition",
            formState.non_ai_asana && "non_ai_transition",
          ].filter(Boolean)}
          onChange={(values) => {
            handleChange("ai_asana", values.includes("ai_transition"));
            handleChange("non_ai_asana", values.includes("non_ai_transition"));
          }}
        >
          <Checkbox value="ai_transition">AI Transition</Checkbox>
          <Checkbox value="non_ai_transition">Non-AI Transition</Checkbox>
        </Checkbox.Group>

        <Divider />

        <div className="flex flex-col gap-2">
          <Text>Asana States</Text>
          {Object.keys(asanaData).map((key) => (
            <Checkbox
              key={key}
              checked={formState[key]}
              onChange={() => handleCheckboxChange(key)}
            >
              {key.replace(/_/g, " ")}
            </Checkbox>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button htmlType="submit" type="primary" loading={loading}>
            Save Changes
          </Button>
          <Button type="default" onClick={resetChanges}>
            Cancel
          </Button>
        </div>
      </form>
      <Spacer h={4} />
    </AdminPageWrapper>
  );
}

export default EditAsana;
