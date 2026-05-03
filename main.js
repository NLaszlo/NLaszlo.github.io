const { createApp, ref } = Vue;
const { createWebHashHistory, createRouter } = VueRouter;

const Home = {
  template: '#home-template',

  mounted() {
    console.log("Home mounted");

    if (typeof loadHome === "function")
      loadHome();
  }
}

const About = {
  template: '#about-template',
}

/*
function loadComponent(url) {
  return async () => {
    const template = await fetch(url).then(r => r.text());
    return { template };
  };
}
*/
const routes = [
  {
    path: '/', component: Home
  },
  { path: '/about', component: About },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

createApp({
  setup() {
    
  },
  data() {
    return {
     
    };
  },
}).use(router).mount("#app");

  
