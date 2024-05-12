import { useParams } from "react-router-dom";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";

import { Card, Text, useScale } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { Fetch } from "../../utils/Fetch";
import { toast } from "react-toastify";

export default function ClassModePage() {
  const { class_id } = useParams();
  const { classDetails, setClassDetails } = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/classMode/get-class-by-id",
          method: "POST",
          data: JSON.stringify({ class_id: class_id }),
        });
        if (response?.status === 200) {
          const data = await response.data;
          console.log(data.classObj);
          setClassDetails(data.classObj);
        } else {
          console.log("Failed to create new class");
        }
      } catch (error) {
        toast("Error while making the request:", error);
      }
    };
    fetchData();
  }, [class_id]);
  return (
    <AdminPageWrapper heading="Class Page">
      <div className="elements">
        <Card hoverable>
          <Text h5>This is where the class will happen!</Text>
          {classDetails && (
            <Card hoverable>
              <Text>{classDetails.class_name}</Text>
            </Card>
          )}
        </Card>
      </div>
    </AdminPageWrapper>
  );
}
