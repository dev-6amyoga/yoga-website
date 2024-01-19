import React from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/UserStore";
import { navigateToDashboard } from "../../utils/navigateToDashboard";
import { useShallow } from "zustand/react/shallow";
import { Select } from "@geist-ui/core";

function RoleShifter() {
  const navigate = useNavigate();

  const [
    userPlan,
    setUserPlan,
    setCurrentInstituteId,
    setInstitutes,
    currentRole,
    setCurrentRole,
    roles,
  ] = useUserStore(
    useShallow((state) => [
      state.userPlan,
      state.setUserPlan,
      state.setCurrentInstituteId,
      state.setInstitutes,
      state.currentRole,
      state.setCurrentRole,
      state.roles,
    ])
  );

  const handleRoleChange = (role) => {
    // console.log(val);
    const currRole = role;
    // use first role as current role

    const currPlan = roles[currRole][0]?.plan;
    setUserPlan(currPlan);

    console.log(roles[currRole]);
    const ins = roles[currRole].map((r) => r?.institute);

    setInstitutes(ins);

    setCurrentInstituteId(ins[0]?.institute_id);

    setCurrentRole(currRole);

    navigateToDashboard(currRole, currPlan, navigate);
  };

  return (
    <div className="bg-slate-700 rounded-lg z-100 p-4">
      <p className="text-white text-center"> Role Changer</p>
      <Select onChange={handleRoleChange} value={currentRole}>
        {Object.keys(roles).map((role) => {
          return (
            <Select.Option key={role} value={role}>
              {role}
            </Select.Option>
          );
        })}
      </Select>
    </div>
  );
}

export default RoleShifter;
