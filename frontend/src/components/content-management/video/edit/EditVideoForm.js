import { Button, Description, Input, Select, Text } from "@geist-ui/core";
import { useState, useEffect } from "react";
import { Checkbox, Divider, ButtonGroup } from "@geist-ui/core";

function EditVideoForm({
  modalData, // Ensure this prop contains valid data
  editAsanaFormRef,
  categories,
  tableLanguages,
  updateData,
  resetChanges,
  loading,
}) {
  // Initialize state with modalData
  const [formState, setFormState] = useState({ ...modalData });

  // Debugging checkpoint: log initial state
  useEffect(() => {
    console.log("Initial modalData:", modalData);
    console.log("Initial formState:", formState);
  }, [modalData]);

  // Update formState dynamically
  const handleChange = (key, value) => {
    console.log("Updating state:", key, value); // Debugging checkpoint
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle for checkboxes
  const handleCheckboxChange = (key) => {
    console.log("Toggling checkbox:", key); // Debugging checkpoint
    setFormState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with state:", formState); // Debugging checkpoint
    updateData(formState); // Call parent handler
  };

  return (
    <form
      ref={editAsanaFormRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 border rounded-md bg-white"
    >
      <Text h3>Edit Asana Video</Text>

      {/* Asana Name */}
      <Input
        width="100%"
        id="asana_name"
        placeholder="Enter Asana Name"
        value={formState.asana_name || ""}
        onChange={(e) => handleChange("asana_name", e.target.value)}
      >
        Asana Name
      </Input>

      {/* Category */}
      <Text>Asana Category</Text>
      <Select
        placeholder="Choose Category"
        value={formState.asana_category || ""}
        onChange={(value) => handleChange("asana_category", value)}
      >
        {categories.map((x) => (
          <Select.Option key={x.asana_category_id} value={x.asana_category}>
            {x.asana_category}
          </Select.Option>
        ))}
      </Select>

      {/* Language */}
      <Text>Language</Text>
      <Select
        placeholder="Choose Language"
        value={formState.language || ""}
        onChange={(value) => handleChange("language", value)}
      >
        {tableLanguages.map((lang) => (
          <Select.Option key={lang.language_id} value={lang.language}>
            {lang.language}
          </Select.Option>
        ))}
      </Select>

      {/* Checkbox Group */}
      <Text>Audio Settings</Text>
      <Checkbox.Group
        value={[
          formState.with_audio && "with_audio",
          formState.muted && "muted",
          formState.with_timer && "with_timer",
        ].filter(Boolean)}
        onChange={(values) => {
          handleChange("with_audio", values.includes("with_audio"));
          handleChange("muted", values.includes("muted"));
          handleChange("with_timer", values.includes("with_timer"));
        }}
      >
        <Checkbox value="with_audio">With Audio</Checkbox>
        <Checkbox value="muted">Muted</Checkbox>
        <Checkbox value="with_timer">With Timer</Checkbox>
      </Checkbox.Group>

      {/* Submit Buttons */}
      <div className="flex gap-2 mt-4">
        <Button htmlType="submit" type="primary" loading={loading}>
          Save Changes
        </Button>
        <Button type="default" onClick={resetChanges}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
export default EditVideoForm;
