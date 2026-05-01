import {
  ROLE_INSTITUTE_ADMIN,
  ROLE_INSTITUTE_OWNER,
  ROLE_ROOT,
  ROLE_STUDENT,
  ROLE_TEACHER,
} from "../enums/roles";

export const getHighestPriorityRole = (roles = {}) => {
  if (!roles || typeof roles !== "object") {
    return null;
  }

  const rolePriority = [
    ROLE_ROOT,
    ROLE_INSTITUTE_OWNER,
    ROLE_INSTITUTE_ADMIN,
    ROLE_TEACHER,
    ROLE_STUDENT,
  ];

  for (const role of rolePriority) {
    if (Object.prototype.hasOwnProperty.call(roles, role)) {
      return role;
    }
  }

  const roleKeys = Object.keys(roles);
  return roleKeys.length ? roleKeys[0] : null;
};
