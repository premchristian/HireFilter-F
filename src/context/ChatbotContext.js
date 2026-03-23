"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const ChatbotContext = createContext();

// Message types
const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system',
  QUICK_REPLY: 'quick_reply'
};

// Bot personality and responses
const BOT_RESPONSES = {
  greeting: [
    "Hi there! 👋 I'm HireBot, your AI job search assistant. I can help you find jobs, get career advice, or answer questions about applications. What would you like to know?",
    "Hello! Welcome to HireFilter! I'm here to help you with job searching, career guidance, and application support. How can I assist you today?",
    "Hey! I'm HireBot, ready to help you navigate your career journey. Whether you're looking for jobs, need salary insights, or want career advice, I'm here for you. What's on your mind?"
  ],

  jobSearch: [
    "Great! I can help you find the perfect job. What type of role are you looking for?",
    "Let's find you an amazing opportunity! What's your field of expertise?",
    "Job hunting made easy! Tell me about your dream role and I'll guide you."
  ],

  howItWorks: [
    "HireFilter makes job searching simple! Here's how it works:\n\n1️⃣ Create your profile\n2️⃣ Upload your resume\n3️⃣ Browse jobs or let AI match you\n4️⃣ Apply with one click\n5️⃣ Track your applications\n\nWant me to walk you through any specific step?",
    "Our platform connects talented candidates with top employers through AI-powered matching. Would you like to know more about our features?"
  ],

  forEmployers: [
    "For employers, HireFilter offers:\n\n🎯 AI-powered candidate matching\n📊 Advanced analytics dashboard\n💬 Direct messaging with candidates\n📝 Custom assessment tools\n🔍 Resume analysis\n\nInterested in posting a job or learning more?",
    "We help companies find the best talent efficiently. Our AI screens candidates and provides detailed insights. Want to see how it works?"
  ],

  pricing: [
    "We offer flexible pricing:\n\n🆓 **Free for Candidates** - Full access to job search\n💼 **Basic Plan** - $99/month for small teams\n🚀 **Pro Plan** - $299/month for growing companies\n🏢 **Enterprise** - Custom pricing for large organizations\n\nWould you like details about any specific plan?",
    "Our pricing is designed to scale with your needs. Candidates always use HireFilter for free! For employers, we have plans starting at $99/month."
  ],

  support: [
    "I'm here to help! You can also:\n\n📧 Email: support@hirefilter.com\n💬 Live chat (that's me!)\n📞 Call: 1-800-HIRE-NOW\n📚 Check our Help Center\n\nWhat specific issue can I assist with?",
    "Need help? I'm your first line of support! For complex issues, our human team is available 24/7."
  ],

  fallback: [
    "I'm here to help you with job searching and applications! You can ask me about:\n• Finding jobs in specific technologies\n• Job opportunities in your city\n• Application process\n• Salary information\n• Career guidance\n\nWhat would you like to know?",
    "I'd love to help! I can assist you with:\n• Job search and recommendations\n• Career advice and guidance\n• Application support\n• Company information\n• Salary insights\n\nWhat specific information are you looking for?",
    "Let me help you with that! I specialize in:\n• Job opportunities and search\n• Career development\n• Application assistance\n• Industry insights\n• Professional guidance\n\nCould you tell me more about what you need?"
  ],

  goodbye: [
    "Thanks for chatting! Feel free to reach out anytime. Good luck with your job search! 🚀",
    "It was great helping you today! Don't hesitate to ask if you need anything else. Happy job hunting! ✨",
    "Goodbye for now! Remember, I'm always here when you need assistance. Best of luck! 👍"
  ]
};

// Quick reply suggestions
const QUICK_REPLIES = {
  initial: [
    { text: "Find Jobs", action: "job_search" },
    { text: "💼 Apply for Jobs", action: "go_to_dashboard" }
  ],

  jobSearch: [
    { text: "Tech Jobs", action: "tech_jobs" },
    { text: "Remote Work", action: "remote_jobs" },
    { text: "Entry Level", action: "entry_level" }
  ],

  employers: [
    { text: "Post a Job", action: "post_job" },
    { text: "View Pricing", action: "pricing" },
    { text: "See Demo", action: "demo" },
    { text: "Contact Sales", action: "contact_sales" }
  ],

  support: [
    { text: "Account Help", action: "account_help" },
    { text: "Technical Issue", action: "tech_issue" },
    { text: "Billing Question", action: "billing" },
    { text: "Talk to Human", action: "human_support" }
  ]
};

// Action types
const ACTIONS = {
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING: 'SET_TYPING',
  SET_QUICK_REPLIES: 'SET_QUICK_REPLIES',
  CLEAR_CHAT: 'CLEAR_CHAT',
  SET_USER_INFO: 'SET_USER_INFO'
};

const initialState = {
  messages: [
    {
      id: 'welcome',
      type: MESSAGE_TYPES.BOT,
      content: "Welcome to HireFilter Chatbot! 👋 I'm here to help you with job searching, career guidance, and application support. How can I assist you today?",
      timestamp: new Date().toISOString(),
      quickReplies: [
        { text: "Find Jobs", action: "job_search" },
        { text: "💼 Apply for Jobs", action: "go_to_dashboard" }
      ]
    }
  ],
  isTyping: false,
  quickReplies: [
    { text: "Find Jobs", action: "job_search" },
    { text: "💼 Apply for Jobs", action: "go_to_dashboard" }
  ],
  userInfo: null
};

function chatbotReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isTyping: false
      };

    case ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload
      };

    case ACTIONS.SET_QUICK_REPLIES:
      return {
        ...state,
        quickReplies: action.payload
      };

    case ACTIONS.CLEAR_CHAT:
      return {
        ...initialState,
        userInfo: state.userInfo
      };

    case ACTIONS.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.payload
      };

    default:
      return state;
  }
}

export function ChatbotProvider({ children }) {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  // AI Response Logic
  const generateResponse = (userMessage, action = null) => {
    const message = userMessage.toLowerCase();

    // Handle specific actions first
    if (action) {
      switch (action) {
        case 'job_search':
          return {
            content: "🔍 **Find Latest Job Opportunities**\n\nDiscover fresh job postings from top companies! Choose how you'd like to search:\n\n**⏰ Browse by Timeline:**\n• Last 24 Hours - Brand new openings\n• Last 3 Days - Recent opportunities  \n• Last 7 Days - This week's jobs\n• Last Month - All recent postings\n\n**🎯 Smart Search Options:**\n• Job Search with Suggestions - Type and get instant suggestions\n• Popular Jobs - See what's trending\n• Advanced Filters - Detailed search options\n\n🌐 **Connected to Google Jobs** for real-time updates!\n\nHow would you like to start your job search?",
            quickReplies: [
              { text: "🔍 Job Suggestions", action: "job_suggestions" },
              { text: "⚡ Last 24 Hours", action: "jobs_24h" },
              { text: "📅 Last 3 Days", action: "jobs_3d" },
              { text: "🎯 Popular Jobs", action: "popular_jobs" },
              { text: "💼 Apply for Jobs", action: "go_to_dashboard" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'how_it_works':
          return {
            content: "🎯 **How HireBot Works - Interactive Demo**\n\nLet me show you how I can help you find your dream job! Here's what I can do:\n\n**🔍 Step 1: Job Discovery**\n• Find latest jobs by time (24h, 3 days, week, month)\n• Filter by skills, location, salary\n• Get real-time job updates\n\n**📎 Step 2: Resume Analysis**\n• Upload your resume for instant analysis\n• Get personalized job recommendations\n• Skill matching with job requirements\n\n**🎯 Step 3: Smart Matching**\n• AI-powered job suggestions\n• Career guidance based on your profile\n• Salary insights and growth paths\n\nReady for a live demo? Choose what you'd like to see:",
            quickReplies: [
              { text: "🔍 Job Search Demo", action: "demo_job_search" },
              { text: "📎 Resume Analysis Demo", action: "demo_resume" },
              { text: "🎯 Smart Matching Demo", action: "demo_matching" },
              { text: "🚀 Full Demo", action: "demo_full" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'demo_job_search':
          return {
            content: "🔍 **Job Search Demo - Live Example**\n\n*Simulating job search for you...*\n\n**Step 1:** You say \"Find me Java developer jobs\"\n**Step 2:** I show you time-based filters\n**Step 3:** You select \"Last 24 Hours\"\n**Step 4:** I display fresh job openings!\n\n**🔥 Example Results:**\n\n💻 **Java Developer** - TCS\n📍 Bangalore | ₹6-10 LPA | Posted: 3 hours ago\n🔗 Direct apply link provided\n\n🚀 **Senior Java Developer** - Infosys  \n📍 Hyderabad | ₹8-15 LPA | Posted: 5 hours ago\n🔗 One-click application\n\n**✨ Smart Features:**\n• Real-time job updates from Google Jobs API\n• Salary insights and company ratings\n• Direct application links\n• Location-based filtering\n\nWant to try the real job search now?",
            quickReplies: [
              { text: "🔍 Try Real Job Search", action: "job_search" },
              { text: "📎 See Resume Demo", action: "demo_resume" },
              { text: "🎯 Matching Demo", action: "demo_matching" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'demo_resume':
          return {
            content: "📎 **Resume Analysis Demo - Step by Step**\n\n*Let me show you how resume analysis works...*\n\n**Step 1:** You upload \"MCA_Resume.pdf\"\n**Step 2:** I analyze your resume in seconds\n**Step 3:** Smart job matching begins!\n\n**🔍 Analysis Results:**\n```\n✅ Resume Analysis Complete!\n\nDetected Skills:\n• Java Programming\n• Spring Boot Framework  \n• MySQL Database\n• REST API Development\n\nEducation: MCA (Master of Computer Applications)\nExperience: Entry Level (0-2 years)\n\nRecommended Jobs:\n💻 Java Developer - ₹4-8 LPA\n🚀 Backend Developer - ₹5-10 LPA  \n⚡ Full Stack Developer - ₹6-12 LPA\n```\n\n**🎯 What Happens Next:**\n• Personalized job recommendations\n• Skill-based salary insights\n• Career growth suggestions\n• Auto-fill job applications\n\nReady to upload your real resume?",
            quickReplies: [
              { text: "📎 Upload My Resume", action: "show_upload" },
              { text: "🔍 Job Search Demo", action: "demo_job_search" },
              { text: "🎯 Matching Demo", action: "demo_matching" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ],
            showUpload: true
          };
        case 'demo_matching':
          return {
            content: "🎯 **Smart Job Matching Demo**\n\n*Demonstrating AI-powered job matching...*\n\n**Your Profile:** MCA Graduate, Java Skills, Fresher\n\n**🤖 AI Analysis:**\n```\nAnalyzing your profile...\n✅ Education: MCA - Perfect for tech roles\n✅ Skills: Java - High demand skill\n✅ Experience: Entry level - Many opportunities\n✅ Location: Flexible - Remote options available\n```\n\n**🎯 Smart Matches Found:**\n\n**Perfect Match (95%)** 🟢\n💻 Junior Java Developer - Wipro\n📍 Bangalore | ₹4-7 LPA | Remote Available\n✨ Matches: Java, MCA, Entry Level\n\n**Great Match (88%)** 🟡  \n🚀 Software Trainee - TCS\n📍 Multiple Locations | ₹3-6 LPA\n✨ Matches: MCA, Fresher Program\n\n**Good Match (82%)** 🟠\n⚡ Full Stack Developer - Startup\n📍 Hyderabad | ₹5-9 LPA\n✨ Matches: Java, Growth Opportunity\n\n**🔥 Pro Tips:**\n• Higher match % = better job fit\n• Skills alignment increases success rate\n• Location flexibility opens more opportunities\n\nWant to see your real job matches?",
            quickReplies: [
              { text: "📎 Get My Real Matches", action: "show_upload" },
              { text: "🔍 Browse All Jobs", action: "job_search" },
              { text: "📚 More Demos", action: "how_it_works" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ],
            showUpload: true
          };
        case 'demo_full':
          return {
            content: "🚀 **Complete HireBot Demo - Full Workflow**\n\n*Let me walk you through the complete job search journey...*\n\n**🎬 Full Demo Scenario:**\n\n**Scene 1: Job Discovery** 🔍\nYou: \"I'm looking for software jobs\"\nMe: \"Great! Let me show you latest opportunities...\"\n*Shows time-based filters and fresh job listings*\n\n**Scene 2: Resume Upload** 📎  \nYou: Upload \"Your_Resume.pdf\"\nMe: \"Analyzing your skills and experience...\"\n*Extracts skills, education, experience level*\n\n**Scene 3: Smart Matching** 🎯\nMe: \"Based on your profile, here are perfect matches...\"\n*Shows personalized job recommendations with match %*\n\n**Scene 4: Application Support** ✅\nMe: \"Ready to apply? I'll help you with...\"\n• Direct application links\n• Resume optimization tips\n• Interview preparation\n• Salary negotiation insights\n\n**🎯 End Result:**\n✅ Found relevant jobs quickly\n✅ Got personalized recommendations  \n✅ Received career guidance\n✅ Applied with confidence\n\n**Ready to start your real job search journey?**",
            quickReplies: [
              { text: "🚀 Start My Job Search", action: "job_search" },
              { text: "💡 Get Career Tips", action: "career_guidance" },
              { text: "📚 More Demos", action: "how_it_works" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ],
            showUpload: true
          };
        case 'pricing':
          return {
            content: getRandomResponse(BOT_RESPONSES.pricing),
            quickReplies: [
              { text: "Find Jobs", action: "job_search" },
              { text: "💼 Apply for Jobs", action: "go_to_dashboard" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'tech_jobs':
          return {
            content: "Perfect! We have tons of tech opportunities:\n\n💻 **Software Engineering**\n• React Developer\n• Java Developer\n• Python Developer\n• Node.js Developer\n• Full Stack Developer\n\n🎨 **UI/UX Design**\n• Frontend Designer\n• Product Designer\n• UX Researcher\n\n📊 **Data Science**\n• Data Analyst\n• Data Scientist\n• Business Intelligence\n• Machine Learning Engineer\n\n☁️ **DevOps & Cloud**\n• AWS Developer\n• Azure Engineer\n• Kubernetes Specialist\n\n🔒 **Cybersecurity**\n• Security Analyst\n• Penetration Tester\n• Security Engineer\n\n📱 **Mobile Development**\n• iOS Developer\n• Android Developer\n• React Native Developer\n• Flutter Developer\n\n🎓 **Entry Level & Internships**\n• Software Intern\n• Data Analytics Intern\n• Frontend Trainee\n• Graduate Developer\n\nWhich area interests you most?",
            quickReplies: [
              { text: "Software Engineering", action: "software_engineering" },
              { text: "Data Science", action: "data_science" },
              { text: "Mobile Development", action: "mobile_dev" },
              { text: "Internships", action: "internships" },
              { text: "View All Jobs", action: "search_jobs" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'remote_jobs':
          return {
            content: "Remote work is the future! 🏠✨\n\nWe have hundreds of remote positions across:\n• Full-time remote\n• Hybrid options\n• Flexible schedules\n• Global opportunities\n\nI can help you filter jobs by remote preferences. Ready to explore?",
            quickReplies: QUICK_REPLIES.jobSearch
          };
        case 'post_job':
          return {
            content: "Ready to find amazing talent? 🎯\n\nPosting a job is super easy:\n1. Create your company profile\n2. Describe the role\n3. Set requirements\n4. Let our AI find matches\n\nShall I redirect you to the job posting page?",
            quickReplies: [
              { text: "Yes, Post Job", action: "redirect_post_job" },
              { text: "Learn More", action: "how_it_works" },
              { text: "See Pricing", action: "pricing" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'main_menu':
          return {
            content: "🏠 **Back to Main Menu!** What would you like to explore?\n\n🔍 **Find Jobs** - Discover latest opportunities\n💼 **Apply for Jobs** - Go to candidate login\n\nChoose an option below or ask me anything:",
            quickReplies: [
              { text: "Find Jobs", action: "job_search" },
              { text: "💼 Apply for Jobs", action: "go_to_dashboard" }
            ]
          };
        case 'software_engineering':
          return {
            content: "🚀 **Software Engineering Opportunities:**\n\n**Frontend Development:**\n• React Developer (Junior to Senior)\n• Vue.js Developer\n• Angular Developer\n• JavaScript Developer\n\n**Backend Development:**\n• Java Developer (Spring Boot)\n• Python Developer (Django/Flask)\n• Node.js Developer\n• .NET Developer\n• PHP Developer\n\n**Full Stack:**\n• MERN Stack Developer\n• MEAN Stack Developer\n• Full Stack Python\n• Full Stack Java\n\n**Experience Levels:**\n• Entry Level (0-2 years)\n• Mid Level (2-5 years)\n• Senior Level (5+ years)\n\nReady to find your perfect match?",
            quickReplies: [
              { text: "Frontend Jobs", action: "frontend_jobs" },
              { text: "Backend Jobs", action: "backend_jobs" },
              { text: "Full Stack", action: "fullstack_jobs" },
              { text: "Entry Level", action: "entry_level" },
              { text: "Search All", action: "search_jobs" }
            ]
          };
        case 'data_science':
          return {
            content: "📊 **Data Science & Analytics:**\n\n**Data Analysis:**\n• Data Analyst (SQL, Excel, Tableau)\n• Business Intelligence Analyst\n• Marketing Data Analyst\n• Financial Data Analyst\n\n**Data Science:**\n• Data Scientist (Python, R)\n• Machine Learning Engineer\n• AI Research Scientist\n• Deep Learning Engineer\n\n**Data Engineering:**\n• Data Engineer (ETL, Pipelines)\n• Big Data Engineer (Spark, Hadoop)\n• Cloud Data Engineer (AWS, Azure)\n\n**Analytics Tools:**\n• Power BI Developer\n• Tableau Developer\n• Google Analytics Specialist\n\nWhich data role excites you?",
            quickReplies: [
              { text: "Data Analyst", action: "data_analyst_jobs" },
              { text: "Data Scientist", action: "data_scientist_jobs" },
              { text: "ML Engineer", action: "ml_engineer_jobs" },
              { text: "Entry Level", action: "data_entry_level" },
              { text: "View All", action: "search_jobs" }
            ]
          };
        case 'mobile_dev':
          return {
            content: "📱 **Mobile Development Opportunities:**\n\n**Native Development:**\n• iOS Developer (Swift, Objective-C)\n• Android Developer (Kotlin, Java)\n• iOS UI/UX Developer\n• Android UI/UX Developer\n\n**Cross-Platform:**\n• React Native Developer\n• Flutter Developer\n• Xamarin Developer\n• Ionic Developer\n\n**Mobile Specializations:**\n• Mobile Game Developer\n• Mobile App Designer\n• Mobile DevOps Engineer\n• Mobile Security Developer\n\n**Experience Levels:**\n• Junior Mobile Developer\n• Senior Mobile Architect\n• Mobile Team Lead\n\nWhich mobile platform interests you?",
            quickReplies: [
              { text: "iOS Development", action: "ios_jobs" },
              { text: "Android Development", action: "android_jobs" },
              { text: "React Native", action: "react_native_jobs" },
              { text: "Flutter", action: "flutter_jobs" },
              { text: "All Mobile Jobs", action: "search_jobs" }
            ]
          };
        case 'internships':
          return {
            content: "🎓 **Internships & Entry Level Opportunities:**\n\n**Software Development Internships:**\n• Frontend Development Intern\n• Backend Development Intern\n• Full Stack Development Intern\n• Mobile App Development Intern\n\n**Data & Analytics Internships:**\n• Data Analytics Intern\n• Business Intelligence Intern\n• Data Science Intern\n• Machine Learning Intern\n\n**Design & UX Internships:**\n• UI/UX Design Intern\n• Product Design Intern\n• Graphic Design Intern\n\n**Other Tech Internships:**\n• DevOps Intern\n• Cybersecurity Intern\n• QA Testing Intern\n• Technical Writing Intern\n\n**Graduate Programs:**\n• Software Engineer Graduate\n• Data Analyst Graduate\n• Product Manager Graduate\n\nPerfect for launching your tech career!",
            quickReplies: [
              { text: "Dev Internships", action: "dev_internships" },
              { text: "Data Internships", action: "data_internships" },
              { text: "Design Internships", action: "design_internships" },
              { text: "Graduate Programs", action: "graduate_programs" },
              { text: "Apply Tips", action: "internship_tips" }
            ]
          };
        case 'search_jobs':
          return {
            content: "🔍 **Ready to find your dream job?**\n\nI can help you:\n• Search by specific technologies\n• Filter by experience level\n• Find remote opportunities\n• Locate jobs in your area\n• Get salary insights\n\nWould you like me to redirect you to our job search page where you can:\n✅ Use advanced filters\n✅ Save jobs you like\n✅ Apply with one click\n✅ Track your applications",
            quickReplies: [
              { text: "Go to Job Search", action: "redirect_jobs" },
              { text: "Remote Jobs Only", action: "remote_jobs" },
              { text: "Entry Level Jobs", action: "entry_level" },
              { text: "🎯 Filter by Skills", action: "filter_skills" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'internship_tips':
          return {
            content: "💡 **Internship Application Tips:**\n\n**Resume Tips:**\n• Highlight relevant coursework\n• Include personal projects\n• Show GitHub contributions\n• Mention hackathons/competitions\n\n**Application Strategy:**\n• Apply early (many are first-come)\n• Customize each application\n• Follow up professionally\n• Prepare for technical interviews\n\n**Skills to Highlight:**\n• Programming languages you know\n• Frameworks you've used\n• Problem-solving abilities\n• Eagerness to learn\n\nReady to start applying?",
            quickReplies: [
              { text: "View Internships", action: "internships" },
              { text: "Career Guidance", action: "career_guidance" },
              { text: "Interview Prep", action: "interview_prep" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'entry_level':
          return {
            content: "🌟 **Entry Level Tech Opportunities:**\n\n**Perfect for New Graduates:**\n• Junior Software Developer\n• Associate Data Analyst\n• Junior Frontend Developer\n• Entry Level QA Tester\n• Technical Support Specialist\n\n**0-2 Years Experience:**\n• Software Engineer I\n• Data Analyst I\n• Junior Mobile Developer\n• Associate Product Manager\n• Junior DevOps Engineer\n\n**What We Look For:**\n• Strong fundamentals\n• Passion for learning\n• Problem-solving skills\n• Team collaboration\n• Portfolio/projects\n\nMany companies offer excellent training programs!",
            quickReplies: [
              { text: "Junior Dev Jobs", action: "junior_dev_jobs" },
              { text: "Data Entry Level", action: "data_entry_level" },
              { text: "Training Programs", action: "training_programs" },
              { text: "Salary Info", action: "entry_salary" },
              { text: "Apply Now", action: "search_jobs" }
            ]
          };
        case 'career_guidance':
          return {
            content: "🎯 **Career Guidance Based on Your Profile:**\n\n**For MCA Graduates:**\n• Web Development (React, Angular, Vue)\n• Backend Development (Java, Python, Node.js)\n• Full Stack Development\n• Mobile App Development\n• Data Science & Analytics\n• Software Testing\n• DevOps Engineering\n\n**Career Progression:**\n• Junior Developer (0-2 years) → ₹3-7 LPA\n• Senior Developer (2-5 years) → ₹7-15 LPA\n• Tech Lead (5+ years) → ₹15-25 LPA\n• Architect/Manager (8+ years) → ₹25+ LPA\n\n**Skills to Focus:**\n• Programming Languages\n• Framework Expertise\n• Database Knowledge\n• Cloud Technologies\n• Problem Solving\n\nReady to explore job opportunities?",
            quickReplies: [
              { text: "🔍 Find Jobs", action: "job_search" },
              { text: "Skill Development", action: "skill_development" },
              { text: "Interview Prep", action: "interview_prep" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'salary_info':
          return {
            content: "💰 **Salary Insights for Tech Roles:**\n\n**Entry Level (0-2 years):**\n• Web Developer: ₹3-7 LPA\n• Software Developer: ₹4-8 LPA\n• Data Analyst: ₹3-6 LPA\n• Mobile Developer: ₹4-9 LPA\n\n**Mid Level (2-5 years):**\n• Senior Developer: ₹7-15 LPA\n• Full Stack Developer: ₹8-18 LPA\n• Data Scientist: ₹8-20 LPA\n• DevOps Engineer: ₹9-18 LPA\n\n**Senior Level (5+ years):**\n• Tech Lead: ₹15-25 LPA\n• Architect: ₹20-35 LPA\n• Engineering Manager: ₹25-40 LPA\n\n**Factors affecting salary:**\n• Skills & Technologies\n• Company size & location\n• Educational background\n• Project experience\n• Certifications\n\nReady to explore job opportunities?",
            quickReplies: [
              { text: "🔍 Find Jobs", action: "job_search" },
              { text: "Skill Premium", action: "skill_premium" },
              { text: "Location Impact", action: "location_salary" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'go_to_dashboard':
        case 'redirect_dashboard':
          return {
            content: "🔐 **Login Required for Job Applications**\n\nTo apply for jobs and access your personalized dashboard, please login to your candidate account.\n\n✅ **After Login You Can:**\n• Browse latest job opportunities\n• Apply for jobs with one click\n• Track your application status\n• Save jobs for later\n• Get AI-matched job recommendations\n• Update your profile and resume\n• Set job preferences\n• View application history\n\n🔄 **Redirecting to login page in 3 seconds...**\n\n*New user? You can register from the login page!*",
            quickReplies: [
              { text: "🚀 Login Now", action: "immediate_login_redirect" },
              { text: "📝 Need Account?", action: "register_info" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ],
            redirect: true,
            redirectUrl: '/login'
          };
        case 'jobs_24h':
          return {
            content: "⚡ **Latest Jobs - Last 24 Hours**\n\n🔥 **Fresh Opportunities Just Posted:**\n\n💻 **Java Developer** - TCS\n📍 Bangalore | ₹6-10 LPA | Posted: 3 hours ago\n🎯 Skills: Java, Spring Boot, MySQL\n🔗 Apply: Direct link available\n\n🚀 **React Developer** - Infosys\n📍 Hyderabad | ₹5-9 LPA | Posted: 6 hours ago\n🎯 Skills: React.js, Node.js, MongoDB\n🔗 Apply: One-click application\n\n📊 **Data Analyst** - Wipro\n📍 Pune | ₹4-7 LPA | Posted: 8 hours ago\n🎯 Skills: Python, SQL, Tableau\n🔗 Apply: Fast track available\n\n🎨 **UI/UX Designer** - Startup\n📍 Remote | ₹4-8 LPA | Posted: 12 hours ago\n🎯 Skills: Figma, Adobe XD, Prototyping\n🔗 Apply: Portfolio required\n\n**💡 Pro Tip:** These are the freshest opportunities with higher chances of selection!\n\nReady to apply?",
            quickReplies: [
              { text: "🔐 Login to Apply", action: "go_to_dashboard" },
              { text: "📅 Last 3 Days", action: "jobs_3d" },
              { text: "🔍 More Filters", action: "job_search" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'jobs_3d':
          return {
            content: "📅 **Jobs Posted in Last 3 Days**\n\n🌟 **Quality Opportunities:**\n\n💻 **Full Stack Developer** - Accenture\n📍 Chennai | ₹7-12 LPA | Posted: 1 day ago\n🎯 Skills: MERN Stack, AWS, Docker\n\n🐍 **Python Developer** - IBM\n📍 Bangalore | ₹6-11 LPA | Posted: 2 days ago\n🎯 Skills: Django, Flask, PostgreSQL\n\n📱 **Mobile Developer** - Flipkart\n📍 Bangalore | ₹8-15 LPA | Posted: 2 days ago\n🎯 Skills: React Native, iOS, Android\n\n☁️ **DevOps Engineer** - Amazon\n📍 Hyderabad | ₹10-18 LPA | Posted: 3 days ago\n🎯 Skills: AWS, Kubernetes, Jenkins\n\n🔒 **Cybersecurity Analyst** - Microsoft\n📍 Pune | ₹8-14 LPA | Posted: 3 days ago\n🎯 Skills: Security Tools, Penetration Testing\n\n**📈 Showing 5 of 47 jobs** - More available on dashboard\n\nInterested in applying?",
            quickReplies: [
              { text: "🔐 Login to Apply", action: "go_to_dashboard" },
              { text: "⚡ Last 24 Hours", action: "jobs_24h" },
              { text: "📆 Last 7 Days", action: "jobs_7d" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'jobs_7d':
          return {
            content: "📆 **Jobs Posted in Last 7 Days**\n\n📊 **Comprehensive Job List:**\n\n**🔥 Top Companies Hiring:**\n• Google - 12 positions\n• Microsoft - 8 positions  \n• Amazon - 15 positions\n• Flipkart - 6 positions\n• Zomato - 9 positions\n\n**💼 Popular Roles:**\n• Software Engineer (23 jobs)\n• Data Scientist (18 jobs)\n• Product Manager (12 jobs)\n• UI/UX Designer (15 jobs)\n• DevOps Engineer (10 jobs)\n\n**📍 Top Locations:**\n• Bangalore - 45 jobs\n• Hyderabad - 32 jobs\n• Pune - 28 jobs\n• Chennai - 22 jobs\n• Remote - 38 jobs\n\n**💰 Salary Ranges:**\n• Entry Level: ₹3-8 LPA\n• Mid Level: ₹8-18 LPA\n• Senior Level: ₹18-35 LPA\n\n**📈 Total: 165 jobs** available this week!\n\nReady to explore all opportunities?",
            quickReplies: [
              { text: "🔐 Login to Apply", action: "go_to_dashboard" },
              { text: "🗓️ Last Month", action: "jobs_1m" },
              { text: "📅 Last 3 Days", action: "jobs_3d" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'jobs_1m':
          return {
            content: "🗓️ **Jobs Posted in Last Month**\n\n📈 **Complete Job Market Overview:**\n\n**🏢 Major Hiring Companies:**\n• Tech Giants: Google, Microsoft, Amazon, Apple\n• Indian IT: TCS, Infosys, Wipro, HCL\n• Startups: Zomato, Swiggy, Paytm, Razorpay\n• Product: Flipkart, Myntra, PhonePe\n• Consulting: Accenture, Deloitte, EY\n\n**🎯 Job Categories:**\n• Software Development (245 jobs)\n• Data Science & Analytics (156 jobs)\n• Product Management (89 jobs)\n• Design & UX (112 jobs)\n• DevOps & Cloud (78 jobs)\n• Mobile Development (67 jobs)\n• Cybersecurity (45 jobs)\n\n**💼 Experience Levels:**\n• Fresher/Entry (312 jobs)\n• Mid-Level (278 jobs)\n• Senior (156 jobs)\n• Leadership (67 jobs)\n\n**🌍 Work Options:**\n• Remote: 234 jobs\n• Hybrid: 189 jobs\n• On-site: 389 jobs\n\n**📊 Total: 812 jobs** posted this month!\n\nTime to find your perfect match!",
            quickReplies: [
              { text: "🔐 Login to Apply", action: "go_to_dashboard" },
              { text: "🎯 All Jobs", action: "jobs_all" },
              { text: "📆 Last 7 Days", action: "jobs_7d" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'jobs_all':
          return {
            content: "🎯 **All Available Jobs - Complete Database**\n\n🌟 **Your Gateway to Opportunities:**\n\n**📊 Database Stats:**\n• Total Active Jobs: 2,847\n• Companies: 450+\n• Locations: 25+ cities\n• Remote Options: 680 jobs\n• Updated: Real-time via Google Jobs API\n\n**🔍 Advanced Search Features:**\n• Skill-based filtering\n• Salary range selection\n• Location preferences\n• Experience level matching\n• Company size filtering\n• Work type (Remote/Hybrid/On-site)\n\n**🎯 Smart Recommendations:**\n• AI-powered job matching\n• Personalized suggestions\n• Career growth insights\n• Salary benchmarking\n\n**⚡ Quick Apply Features:**\n• One-click applications\n• Auto-fill from profile\n• Application tracking\n• Interview scheduling\n\n**🚀 Ready to explore the complete job universe?**\n\nLet me take you to the full job search experience!",
            quickReplies: [
              { text: "💼 Apply for Jobs", action: "go_to_dashboard" },
              { text: "🔍 Advanced Search", action: "advanced_search" },
              { text: "🎯 Get Recommendations", action: "job_recommendations" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'immediate_redirect':
          return {
            content: "🚀 **Redirecting Now...**\n\nTaking you to your candidate dashboard!",
            quickReplies: [],
            redirect: true,
            immediateRedirect: true,
            redirectUrl: '/candidate/dashboard'
          };
        case 'immediate_login_redirect':
          return {
            content: "🔐 **Redirecting to Login...**\n\nTaking you to the candidate login page!",
            quickReplies: [],
            redirect: true,
            immediateRedirect: true,
            redirectUrl: '/login'
          };
        case 'register_info':
          return {
            content: "📝 **New to HireFilter? Create Your Account!**\n\n**Why Register?**\n• Access to thousands of job opportunities\n• AI-powered job matching\n• One-click job applications\n• Resume analysis and optimization\n• Career guidance and insights\n• Application tracking\n• Salary benchmarking\n\n**Quick Registration:**\n• Takes less than 2 minutes\n• Upload your resume\n• Set job preferences\n• Start applying immediately\n\n**Ready to get started?**",
            quickReplies: [
              { text: "📝 Register Now", action: "redirect_register" },
              { text: "🔐 I Have Account", action: "immediate_login_redirect" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'redirect_register':
          return {
            content: "📝 **Redirecting to Registration...**\n\nTaking you to create your candidate account!",
            quickReplies: [],
            redirect: true,
            immediateRedirect: true,
            redirectUrl: '/Register'
          };
        case 'job_suggestions':
          return {
            content: "🔍 **Job Search with Smart Suggestions**\n\nStart typing to see job suggestions based on:\n• Your skills and experience\n• Popular job titles\n• Company names\n• Technologies and frameworks\n• Location preferences\n\n**Popular Searches:**\n• \"React Developer Bangalore\"\n• \"Java Developer Remote\"\n• \"Data Analyst Mumbai\"\n• \"Python Developer Hyderabad\"\n• \"Full Stack Developer Pune\"\n\n**Pro Tips:**\n• Use specific technologies (React, Java, Python)\n• Include experience level (Junior, Senior)\n• Add location for better matches\n• Try company names (Google, Microsoft, TCS)\n\nReady to search for your dream job?",
            quickReplies: [
              { text: "🔐 Login to Apply", action: "go_to_dashboard" },
              { text: "🎯 Popular Jobs", action: "popular_jobs" },
              { text: "🔍 Advanced Search", action: "advanced_search" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ],
            showJobSearch: true
          };
        case 'popular_jobs':
          return {
            content: "🎯 **Most Popular Job Searches This Week:**\n\n**🔥 Trending Technologies:**\n1. React Developer (2,847 searches)\n2. Python Developer (2,156 searches)\n3. Java Developer (1,923 searches)\n4. Data Scientist (1,678 searches)\n5. Full Stack Developer (1,445 searches)\n\n**📍 Top Locations:**\n1. Bangalore (4,567 jobs)\n2. Hyderabad (3,234 jobs)\n3. Pune (2,891 jobs)\n4. Mumbai (2,456 jobs)\n5. Remote (3,789 jobs)\n\n**💼 Experience Levels:**\n• Entry Level (0-2 years): 45% of searches\n• Mid Level (2-5 years): 35% of searches\n• Senior Level (5+ years): 20% of searches\n\n**🚀 Fastest Growing:**\n• AI/ML Engineer (+156% this month)\n• DevOps Engineer (+89% this month)\n• React Native Developer (+67% this month)\n\nReady to join the search?",
            quickReplies: [
              { text: "🔐 Login to Apply", action: "go_to_dashboard" },
              { text: "🔍 Browse All Jobs", action: "job_search" },
              { text: "📊 Salary Insights", action: "salary_info" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
        case 'advanced_search':
          return {
            content: "🔍 **Advanced Job Search Features**\n\nOur advanced search helps you find the perfect match:\n\n**🎯 Smart Filters:**\n• Skills & Technologies\n• Experience Level (0-15+ years)\n• Salary Range (₹2L - ₹50L+)\n• Company Size (Startup to Enterprise)\n• Work Type (Remote/Hybrid/On-site)\n• Job Type (Full-time/Part-time/Contract)\n\n**🤖 AI-Powered Features:**\n• Job Match Percentage\n• Skill Gap Analysis\n• Career Path Suggestions\n• Salary Benchmarking\n• Interview Difficulty Prediction\n\n**📊 Advanced Analytics:**\n• Application Success Rate\n• Response Time Insights\n• Company Culture Fit\n• Growth Opportunity Score\n\n**🚀 Premium Features:**\n• Priority Application Status\n• Direct HR Contact\n• Exclusive Job Listings\n• Personal Career Coach\n\nReady to experience advanced job search?",
            quickReplies: [
              { text: "🚀 Try Advanced Search", action: "go_to_dashboard" },
              { text: "💡 Career Guidance", action: "career_guidance" },
              { text: "💰 See Pricing", action: "pricing" },
              { text: "🏠 Back to Main Menu", action: "main_menu" }
            ]
          };
      }
    }

    // Keyword-based responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        content: getRandomResponse(BOT_RESPONSES.greeting),
        quickReplies: [
          { text: "Find Jobs", action: "job_search" },
          { text: "💼 Apply for Jobs", action: "go_to_dashboard" },
          { text: "Career Guidance", action: "career_guidance" }
        ]
      };
    }

    if (message.includes('job') || message.includes('work') || message.includes('career')) {
      return {
        content: getRandomResponse(BOT_RESPONSES.jobSearch),
        quickReplies: QUICK_REPLIES.jobSearch
      };
    }

    if (message.includes('employer') || message.includes('company') || message.includes('hire') || message.includes('recruit')) {
      return {
        content: getRandomResponse(BOT_RESPONSES.forEmployers),
        quickReplies: QUICK_REPLIES.employers
      };
    }

    if (message.includes('price') || message.includes('cost') || message.includes('plan') || message.includes('subscription')) {
      return {
        content: getRandomResponse(BOT_RESPONSES.pricing),
        quickReplies: QUICK_REPLIES.initial
      };
    }

    if (message.includes('help') || message.includes('support') || message.includes('problem')) {
      return {
        content: getRandomResponse(BOT_RESPONSES.support),
        quickReplies: QUICK_REPLIES.support
      };
    }

    if (message.includes('how') && (message.includes('work') || message.includes('use') || message.includes('platform') || message.includes('site'))) {
      return {
        content: "Great question! Here's how HireFilter works:\n\n🔍 **Job Discovery**: Browse thousands of jobs from top companies, filter by skills, location, and salary\n\n🎯 **Smart Matching**: Our AI analyzes your profile and suggests the best job matches\n\n📝 **Easy Applications**: Apply to jobs with one click, track your applications, and get updates\n\n💬 **Direct Communication**: Chat directly with HR teams and get faster responses\n\n📊 **Career Insights**: Get salary benchmarks, skill recommendations, and career guidance\n\nWant to start exploring jobs or need help with something specific?",
        quickReplies: [
          { text: "Find Jobs", action: "job_search" },
          { text: "💼 Apply for Jobs", action: "go_to_dashboard" },
          { text: "Career Guidance", action: "career_guidance" }
        ]
      };
    }

    // Salary related questions
    if (message.includes('salary') || message.includes('pay') || message.includes('wage') || message.includes('income')) {
      return {
        content: "💰 I can help you with salary information! Here's what I can provide:\n\n📊 **Salary Insights**: Get salary ranges for different roles and experience levels\n📈 **Market Rates**: Compare salaries across companies and locations\n💡 **Negotiation Tips**: Learn how to negotiate better compensation\n🎯 **Skill Premium**: See which skills command higher salaries\n\nWhat specific salary information are you looking for?",
        quickReplies: [
          { text: "💰 Salary Insights", action: "salary_info" },
          { text: "Find Jobs", action: "job_search" },
          { text: "Career Guidance", action: "career_guidance" }
        ]
      };
    }

    // Resume related questions
    if (message.includes('resume') || message.includes('cv') || message.includes('profile')) {
      return {
        content: "📄 I can help you with resume and profile optimization!\n\n✨ **Resume Tips**: Get advice on creating an effective resume\n🎯 **Skill Highlighting**: Learn which skills to emphasize\n📊 **ATS Optimization**: Make your resume ATS-friendly\n💼 **Profile Building**: Create a compelling professional profile\n\nTo apply for jobs and get personalized resume feedback, you'll need to login to your candidate account. Would you like me to take you there?",
        quickReplies: [
          { text: "🔐 Login to Apply", action: "go_to_dashboard" },
          { text: "Find Jobs", action: "job_search" },
          { text: "Career Tips", action: "career_guidance" }
        ]
      };
    }

    // Interview related questions
    if (message.includes('interview') || message.includes('preparation') || message.includes('tips')) {
      return {
        content: "🎯 Interview preparation is crucial! Here's how I can help:\n\n💡 **Interview Tips**: Get proven strategies for different interview types\n❓ **Common Questions**: Practice answers to frequently asked questions\n🏢 **Company Research**: Learn how to research companies effectively\n💪 **Confidence Building**: Build confidence for your interviews\n\nFor personalized interview preparation and to track your applications, login to your candidate account!",
        quickReplies: [
          { text: "🔐 Login for Prep", action: "go_to_dashboard" },
          { text: "Find Jobs", action: "job_search" },
          { text: "Career Guidance", action: "career_guidance" }
        ]
      };
    }

    // Remote work questions
    if (message.includes('remote') || message.includes('work from home') || message.includes('wfh')) {
      return {
        content: "🏠 Remote work opportunities are growing! Here's what I can help with:\n\n💻 **Remote Jobs**: Find fully remote positions across various industries\n🌍 **Global Opportunities**: Access jobs from companies worldwide\n⚖️ **Work-Life Balance**: Discover flexible work arrangements\n🛠️ **Remote Skills**: Learn which skills are in demand for remote work\n\nReady to explore remote job opportunities?",
        quickReplies: [
          { text: "🏠 Remote Jobs", action: "remote_jobs" },
          { text: "Find All Jobs", action: "job_search" },
          { text: "🔐 Login to Apply", action: "go_to_dashboard" }
        ]
      };
    }

    if (message.includes('bye') || message.includes('goodbye') || message.includes('thanks') || message.includes('thank you')) {
      return {
        content: getRandomResponse(BOT_RESPONSES.goodbye),
        quickReplies: QUICK_REPLIES.initial
      };
    }

    // Fallback response
    return {
      content: getRandomResponse(BOT_RESPONSES.fallback),
      quickReplies: [
        { text: "Find Jobs", action: "job_search" },
        { text: "💼 Apply for Jobs", action: "go_to_dashboard" },
        { text: "Career Guidance", action: "career_guidance" }
      ]
    };
  };

  const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Actions
  const sendMessage = async (content, action = null) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.USER,
      content,
      timestamp: new Date().toISOString()
    };

    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: userMessage });

    // Show typing indicator
    dispatch({ type: ACTIONS.SET_TYPING, payload: true });

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate bot response
    const response = generateResponse(content, action);

    const botMessage = {
      id: (Date.now() + 1).toString(),
      type: MESSAGE_TYPES.BOT,
      content: response.content,
      timestamp: new Date().toISOString(),
      quickReplies: response.quickReplies,
      redirect: response.redirect,
      immediateRedirect: response.immediateRedirect,
      redirectUrl: response.redirectUrl,
      showUpload: response.showUpload,
      showJobSearch: response.showJobSearch
    };

    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: botMessage });
    dispatch({ type: ACTIONS.SET_QUICK_REPLIES, payload: response.quickReplies });
  };

  const sendQuickReply = (reply) => {
    sendMessage(reply.text, reply.action);
  };

  const clearChat = () => {
    dispatch({ type: ACTIONS.CLEAR_CHAT });
  };

  const setUserInfo = (info) => {
    dispatch({ type: ACTIONS.SET_USER_INFO, payload: info });
  };

  const value = {
    ...state,
    sendMessage,
    sendQuickReply,
    clearChat,
    setUserInfo,
    MESSAGE_TYPES
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}

export { MESSAGE_TYPES };