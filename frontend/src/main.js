import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import { formatCurrency } from "./utils/formatCurrency.js";
import App from "./App.vue";
import router from "./router";
import Swal from "sweetalert2";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.config.globalProperties.$formatCurrency = formatCurrency;
app.config.globalProperties.$swal = Swal;
app.mount("#app");
