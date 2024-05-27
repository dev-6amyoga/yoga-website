import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) =>
    set(() => {
      // console.log('updating user : ', user);
      return { user: user };
    }),

  userPlan: null,
  setUserPlan: (userPlan) => set(() => ({ userPlan: userPlan })),

  accessToken: null,
  setAccessToken: (accessToken) => set(() => ({ accessToken: accessToken })),

  refreshToken: null,
  setRefreshToken: (refreshToken) =>
    set(() => ({ refreshToken: refreshToken })),

  currentInstituteId: null,
  setCurrentInstituteId: (id) =>
    set(() => {
      console.log("Setting current institute id to ", id);
      return { currentInstituteId: id };
    }),

  institutes: [],
  setInstitutes: (institutes) => set(() => ({ institutes: institutes })),
  updateInstitute: (institute) =>
    set((state) => {
      const institutes = state.institutes.map((i) => {
        if (i.institute_id === institute.institute_id) {
          return institute;
        }
        return i;
      });
      return { institutes };
    }),

  currentRole: null,
  setCurrentRole: (role) => set(() => ({ currentRole: role })),

  roles: [],
  setRoles: (roles) => set(() => ({ roles: roles })),
  updateRole: (role) =>
    set((state) => {
      const roles = state.roles.map((r) => {
        if (r.role_id === role.role_id) {
          return role;
        }
        return r;
      });
      return { roles };
    }),

  resetUserState: () =>
    set(() => ({
      user: null,
      userType: null,
      userPlan: null,
      accessToken: null,
      refreshToken: null,
      currentInstituteId: null,
      institutes: [],
    })),
}));

export default useUserStore;
