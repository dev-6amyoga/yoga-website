import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) =>
    set(() => {
      // console.log('updating user : ', user);
      return { user: user };
    }),

  userType: null,
  setUserType: (userType) => set(() => ({ userType: userType })),

  userPlan: null,
  setUserPlan: (userPlan) => set(() => ({ userPlan: userPlan })),

  token: null,
  setToken: (token) => set(() => ({ token: token })),

  currentInstituteId: null,
  setCurrentInstituteId: (id) => set(() => ({ currentInstituteId: id })),

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
}));

export default useUserStore;
