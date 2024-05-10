import { Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";

export default function ViewAllClasses() {
  return (
    <AdminPageWrapper heading="View All Classes">
      <div className="elements"></div>
    </AdminPageWrapper>
  );
}
