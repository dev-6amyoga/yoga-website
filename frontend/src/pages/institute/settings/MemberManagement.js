import { Tabs, Table } from "@geist-ui/core";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { toast } from "react-toastify";

export default function MemberManagement() {
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const addItemToList = (newItem) => {
    setTeachers((prevList) => [...new Set([...prevList, newItem])]);
  };
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );
  const getTeachers = useCallback(async () => {
    setRefreshLoading(true);
    setTeachers([]);
    try {
      const res = await Fetch({
        url: "http://localhost:4000/institute/teacher/get-all-by-instituteid",
        method: "POST",
        data: {
          institute_id: currentInstituteId,
        },
      });

      setTeachers(() => res?.data?.teachers?.map((t) => t.user));

      setRefreshLoading(false);
    } catch (err) {
      toast(`Error : ${err?.response?.data?.message}`, {
        type: "error",
      });
      setRefreshLoading(false);
    }
  }, []);

  useEffect(() => {
    getTeachers();
  }, [getTeachers]);

  return (
    <InstitutePageWrapper heading="Member Management">
      <div className="max-w-5xl mx-auto">
        <h4>All Teachers</h4>
        <Table width={50} data={teachers} className="bg-white ">
          <Table.Column prop="name" label="Teacher Name" />
          <Table.Column prop="username" label="Username" />
          <Table.Column prop="email" label="Email ID" />
        </Table>
      </div>
    </InstitutePageWrapper>
  );
}
