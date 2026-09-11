import { defineStore } from "pinia";

export const useUserStore = defineStore("currentUser", {
  state: () => ({
    name: "",
    role: "",
  }),
  actions: {
    setCurrentUser({ name, role }) {
      this.name = name;
      this.role = role;
    },
    setUserName(name) {
      this.name = name;
    },
  },
});
