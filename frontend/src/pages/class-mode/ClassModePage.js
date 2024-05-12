import AdminPageWrapper from "../../components/Common/AdminPageWrapper";

import { Card, Text } from "@geist-ui/core";

export default function ClassModePage() {
  return (
    <AdminPageWrapper heading="Class Page">
      <div className="elements">
        <Card hoverable>
          <Text h5>This is where the class will happen!</Text>
        </Card>
      </div>
    </AdminPageWrapper>
  );
}
