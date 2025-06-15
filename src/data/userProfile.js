// src/data/userProfile.js
import profileImg from "../assets/profildiri.jpg";

const userProfile = {
  name: "David Garcia Saragih",
  headline: "Frontend Developer & Content Creator",
  photoUrl: profileImg,
  aboutText:
    "Hello! I'm David, a YouTuber who creates educational technology videos about programming, especially in developing and designing websites. I am passionate about programming and dream of becoming an expert Software Engineer. Starting from vocational school, my curiosity about technology has driven me to continuously learn and experiment, turning coding from a hobby into a core part of my projects.",
  contact: {
    email: "davidgarciasaragih7@gmail.com",
    location: "Jakarta, Indonesia",
  },
  socials: {
    youtube: {
      url: "https://www.youtube.com/c/DavidGTech",
      handle: "@DavidGTech",
    },
    tiktok: {
      url: "https://www.tiktok.com/@davidgtech",
      handle: "@davidgtech",
    },
    github: { url: "https://github.com/davidgrcias", handle: "davidgrcias" },
    linkedin: {
      url: "https://www.linkedin.com/in/david-garcia-saragih/",
      handle: "david-garcia-saragih",
    },
  },
};

export default userProfile;
