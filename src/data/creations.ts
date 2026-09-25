// Creations page data. Newest first; the staircase follows this order.
//
// Media: one ordered list per project. Files live in /public/creations/<id>/.
//   media[0]  = the cover: shown on the stair step / stone window before anything is clicked
//   the whole list = the slides in the pop-up, in this order
// Videos (.mp4 / .webm) autoplay muted on a loop. Until a file exists, its slot shows the file name.

export type Media = string[];

export type Creation = {
  id: string;
  name: string;
  date: string;
  award?: string;
  event?: string;
  kind?: string;
  team?: string[];
  short: string;
  desc: string;
  tags: string[];
  link?: { label: string; url: string }; // leave out for no button
  pdfCover?: string;
  pdfPages?: string[]; // the PDF as page images, scrolled right in the pop-up
  media: Media;
};

export const CREATIONS: Creation[] = [
  {
    id: "pv2",
    name: "Portfolio v2",
    date: "September 2026",
    short: "This site: a grimoire themed portfolio with a 3D spiral staircase of projects built in pure CSS.",
    desc: "Portfolio v2 is the second version of my personal site, built around a grimoire and castle theme. The Creations page winds every project around a 3D spiral staircase made entirely with CSS 3D transforms, driven by a scroll-linked animation loop tuned to hold 60fps. Featured projects sit in stone arch windows drawn procedurally in SVG, framed by layered ivy with scroll parallax and canvas-drawn fireflies. Across the site, videos stay as lightweight still images until they scroll into view, animations respect reduced-motion settings, and every page adapts from wide desktop screens down to phones.",
    tags: ["Next.js", "React", "TypeScript", "CSS 3D", "SVG", "Canvas"],
    media: ["/videos/portfoliov2.mp4", "/creations/portfolio-v2/featured-wall.mp4", "/creations/portfolio-v2/popup.jpg", "/creations/portfolio-v2/phone.jpg"],
  },
  {
    id: "cosmos",
    name: "Cosmos OS",
    date: "July 2026",
    short: "An interactive workstation for an ISS research environment, built like a real operating system.",
    desc: "COSMOS OS is a class project that simulates an interactive workstation for an ISS research environment. Built with HTML, CSS, and JavaScript, the system includes interactive interfaces for mission data, orbital tracking, research files, communications, and other system utilities. The project recreates the structure and functionality of an operating system through interconnected interfaces and interactive elements rather than a traditional webpage.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: { label: "View Creation", url: "https://sarayumarri.github.io/COSMOS_OS/" },
    media: ["/creations/cosmos/tour.mp4"],
  },
  {
    id: "evangeline",
    name: "Evangeline",
    date: "Jan - May 2026",
    award: "Best Artistic Direction",
    team: ["Britni Barcelo", "Hailey Nalda", "Lena Tran", "Reese Odvina"],
    short: "A dual POV combat platformer RPG following a lost princess and the knight searching for her.",
    desc: "Evangeline is a dual-POV, 2D combat platformer RPG built in Unity, following a lost princess and the knight searching for her across the kingdom of Silvalia. The game combines platforming, character-specific combat, branching endings, and enemy AI built with finite state machines, including adaptive final bosses that adjust their attack behavior based on player actions and deaths. Across four full levels and a final boss arena, players explore distinct environments, collect resources, fight enemies and minibosses, and progress through a mirrored level structure as the two characters’ stories converge. The game was iteratively refined through playtesting with 23 participants, with feedback informing changes to movement, level guidance, enemy behavior, difficulty, and combat mechanics.",
    tags: ["Unity", "C#", "Finite State Machines", "Level Design", "Playtesting"],
    link: { label: "Download Creation (Beta)", url: "https://drive.google.com/drive/folders/1jNn52qP88OtrcFJVoV22uiuQSD1gFFqQ" },
    media: ["/creations/evangeline/gameplay-1.mp4", "/creations/evangeline/gameplay-2.mp4", "/creations/evangeline/cutscene.mp4", "/creations/evangeline/team.jpg"],
  },
  {
    id: "ie",
    name: "Internet Explorer",
    date: "January 2026",
    team: ["Aidan Priore", "Shania Clarke", "Rudy Charles"],
    short: "A Unity game that turns a computer’s file system and security into rooms to explore and escape.",
    desc: "Internet Explorer is a Unity game that turns a computer’s file system and security infrastructure into an explorable game environment. Players navigate interconnected rooms, uncover information from simulated files, passwords, and network data, and use what they find to bypass firewalls and security checks. The level design structures this progression through exploration, environmental navigation, and escalating security challenges, guiding players toward the final escape while balancing pacing and difficulty.",
    tags: ["Unity", "C#", "Level Design"],
    link: { label: "View Creation", url: "https://easy-morning-art.itch.io/internet-explorer" },
    media: ["/creations/internet-explorer/exploring.mp4", "/creations/internet-explorer/minigame-1.jpg", "/creations/internet-explorer/minigame-2.jpg", "/creations/internet-explorer/team.jpg"],
  },
  {
    id: "pv1",
    name: "Portfolio v1",
    date: "December 2025",
    short: "My first personal portfolio, designed and developed myself.",
    desc: "My first personal portfolio website, built to showcase my projects, experience, and skills. I designed and developed the site myself, combining front-end development with visual design and interactive elements.",
    tags: ["React", "Vite", "Framer Motion"],
    media: ["/creations/portfolio-v1/scroll.mp4"],
  },
  {
    id: "kinexis",
    name: "Kinexis",
    date: "October 2025",
    award: "Best App",
    event: "KnightHacks 2025",
    team: ["Thomas Kantecki", "Gabriel Battero Otero", "Cooper Fuller"],
    short: "Browser based physical therapy that tracks joint angles and reps through the webcam.",
    desc: "Kinexis is a browser-based physical therapy platform that uses computer vision and webcam-based skeletal tracking to measure joint angles, repetitions, and range of motion in real time. Movement data is processed locally using MediaPipe, OpenCV, NumPy, and JavaScript, eliminating the need for specialized motion-tracking hardware or video uploads. The system automatically generates personalized reports with performance metrics, progress visualizations, and exercise recommendations, reducing documentation time by up to 95%. Kinexis combines real-time computer vision, data processing, and privacy-conscious web development to make clinical motion tracking more accessible.",
    tags: ["MediaPipe", "OpenCV", "NumPy", "JavaScript", "Flask"],
    link: { label: "View Creation", url: "https://kinexis.fit/" },
    media: ["/creations/kinexis/live-cam.mp4", "/creations/kinexis/walkthrough.mp4", "/creations/kinexis/home.jpg", "/creations/kinexis/how-to.jpg"],
  },
  {
    id: "cappu",
    name: "CappuConnect",
    date: "September 2025",
    award: "Best Non-AI Hack",
    event: "STEM Connect 2025",
    team: ["Kai Sprunger", "Dawn Balaschak", "Bindhiya Reddy Shyam Kumar"],
    short: "A full stack networking app that matches people by shared skills, no AI matching.",
    desc: "CappuConnect is a full-stack networking platform that matches users based on shared skills, industries, and backgrounds. Its Discover system uses a cosine similarity algorithm to generate personalized connections without relying on an AI or GPT-based matching service, with swipe-based interactions for accepting or rejecting matches. The platform also uses a Puppeteer web scraper to collect Eventbrite events, a MongoDB database for user and event data, and NextAuth for authentication and persistent sessions. Built with Next.js, React, TypeScript, and Tailwind CSS, CappuConnect combines recommendation algorithms, web scraping, authentication, and full-stack application development in one platform.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "MongoDB", "NextAuth", "Puppeteer"],
    link: { label: "View Creation", url: "https://cappuconnect.vercel.app/" },
    media: ["/creations/cappuconnect/demo.mp4", "/creations/cappuconnect/swiping.jpg", "/creations/cappuconnect/network.jpg"],
  },
];

export const PRESENTATION: Creation = {
  id: "nss",
  name: "Not So Surelocks",
  date: "Sep - Nov 2024",
  kind: "UCF STEM Day",
  team: ["Tahel Peretz", "Colin McLallen", "Derek Felice", "Avery Hanebrink", "Vanessa Flores"],
  short: "A museum style crime scene that taught elementary and middle schoolers forensic science.",
  desc: "Not So Surelocks was a UCF STEM Day presentation that introduced elementary and middle school students to forensic science through an interactive investigation. Our team designed a museum-style crime scene where students rotated through hands-on stations covering fingerprints, footprints, paint analysis, and other forms of evidence to solve the fictional theft of the Mona Lisa. The experience was developed around audience research and was adapted throughout the event based on student engagement, age, and feedback.",
  tags: ["Outreach", "Audience Research", "Exhibit Design"],
  link: { label: "Open in new tab", url: "/creations/Not_So_Surelocks_Portfolio.pdf" },
  pdfCover: "/creations/not-so-surelocks-cover.webp", // page 1 of the PDF
  pdfPages: Array.from({ length: 13 }, (_, i) => `/creations/not-so-surelocks/page-${String(i + 1).padStart(2, "0")}.webp`),
  media: [],
};

// teammates' LinkedIns. Names listed here become links in the pop-up (new tab); anyone missing shows as plain text.
export const TEAM_LINKS: Record<string, string> = {
  "Britni Barcelo": "https://www.linkedin.com/in/britnibarcelo/",
  "Lena Tran": "https://www.linkedin.com/in/lena-tran-/",
  "Reese Odvina": "https://www.linkedin.com/in/reese-odvina/",
  "Aidan Priore": "https://www.linkedin.com/in/aidan-priore-74068a29a/",
  "Shania Clarke": "https://www.linkedin.com/in/shania-clarke-414bb1281/",
  "Thomas Kantecki": "https://www.linkedin.com/in/thomas-kantecki-836b39271/",
  "Cooper Fuller": "https://www.linkedin.com/in/cooper-fuller-87859a382/",
  "Gabriel Battero Otero": "https://www.linkedin.com/in/gabriel-b-otero/",
  "Kai Sprunger": "https://www.linkedin.com/in/kaisprunger/",
  "Dawn Balaschak": "https://www.linkedin.com/in/dawn-balaschak/",
  "Bindhiya Reddy Shyam Kumar": "https://www.linkedin.com/in/bindhiya-reddy-shyam-kumar/",
  "Tahel Peretz": "https://www.linkedin.com/in/tahel-peretz/",
  "Colin McLallen": "https://www.linkedin.com/in/colin-mclallen-214b6b292/",
  "Derek Felice": "https://www.linkedin.com/in/derek-felice-067310330/",
  "Avery Hanebrink": "https://www.linkedin.com/in/averyhanebrink/",
};

// the three stone windows, left to right (middle one starts centered)
export const FEATURED_IDS = ["cappu", "evangeline", "kinexis"];

export const ALL_BY_ID: Record<string, Creation> = Object.fromEntries(
  [...CREATIONS, PRESENTATION].map((c) => [c.id, c])
);

export const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);
// every video has a small still next to it: demo.mp4 -> demo.poster.webp
export const posterOf = (src: string) => src === "/videos/portfoliov2.mp4"
  ? "/videos/portfoliov2-poster.jpg"
  : src.replace(/\.(mp4|webm|mov)$/i, ".poster.webp");
// the first video of each project also has a lighter 640px copy for the windows and stairs: demo.mp4 -> demo.sm.mp4
export const smallOf = (src: string) => src === "/videos/portfoliov2.mp4"
  ? src
  : src.replace(/\.(mp4|webm|mov)$/i, ".sm.mp4");
