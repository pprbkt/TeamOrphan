const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TeamOrphan Database...");

  // Clean existing
  await prisma.report.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.joinRequest.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.orphanListing.deleteMany();
  await prisma.team.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const marcus = await prisma.user.create({
    data: {
      name: "Marcus Chen",
      username: "marcus_c",
      email: "marcus@example.com",
      passwordHash: defaultPassword,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      college: "Institute of Technology",
      location: "Bangalore, India",
      bio: "AI/ML & Full-Stack student. Passionate about building fast prototypes and winning hackathons.",
      skills: JSON.stringify(["Python", "React", "Machine Learning", "JavaScript", "Next.js"]),
      interests: JSON.stringify(["Hackathons", "AI", "Web Development"]),
      role: "USER",
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "Alex Vance",
      username: "alex_v",
      email: "alex@example.com",
      passwordHash: defaultPassword,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      college: "BMS College of Engineering",
      location: "Bangalore, India",
      bio: "Full-Stack TypeScript wizard. Built 5 production apps. Fast typer, sleepless hacker.",
      skills: JSON.stringify(["Next.js", "TypeScript", "Node.js", "Tailwind", "PostgreSQL"]),
      interests: JSON.stringify(["Hackathons", "Open Source", "Startups"]),
      role: "USER",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Connor",
      username: "sarah_c",
      email: "sarah@example.com",
      passwordHash: defaultPassword,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      college: "Symbiosis Institute of Design",
      location: "Pune, India",
      bio: "UI/UX designer obsessed with neo-brutalism, micro-animations, and clean user journeys.",
      skills: JSON.stringify(["Figma", "UI/UX", "React", "CSS", "Tailwind"]),
      interests: JSON.stringify(["Design", "Web Development", "Hackathons"]),
      role: "USER",
    },
  });

  const rahul = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      username: "rahul_s",
      email: "rahul@example.com",
      passwordHash: defaultPassword,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      college: "IIT Delhi",
      location: "Delhi, India",
      bio: "Backend architect. Go & Rust enthusiast. Databases don't scare me.",
      skills: JSON.stringify(["Python", "Go", "Docker", "PostgreSQL", "System Design"]),
      interests: JSON.stringify(["System Design", "Hackathons", "Cloud"]),
      role: "USER",
    },
  });

  const ananya = await prisma.user.create({
    data: {
      name: "Ananya Desai",
      username: "ananya_d",
      email: "ananya@example.com",
      passwordHash: defaultPassword,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      college: "IIIT Hyderabad",
      location: "Hyderabad, India",
      bio: "Machine Learning researcher. Working on LLM fine-tuning and computer vision pipelines.",
      skills: JSON.stringify(["Python", "PyTorch", "Pandas", "Machine Learning", "NLP"]),
      interests: JSON.stringify(["AI", "Machine Learning", "Research"]),
      role: "USER",
    },
  });

  const priyanshu = await prisma.user.create({
    data: {
      name: "Priyanshu Roy",
      username: "priyanshu_r",
      email: "priyanshu@example.com",
      passwordHash: defaultPassword,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      college: "VJTI Mumbai",
      location: "Mumbai, India",
      bio: "Competitive gamer and Unity developer. Looking for squad mates for esports & hackathons.",
      skills: JSON.stringify(["C#", "Unity", "Game Design", "3D Modeling", "Python"]),
      interests: JSON.stringify(["Gaming", "Robotics", "AR/VR"]),
      role: "USER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin Moderator",
      username: "admin",
      email: "admin@teamorphan.org",
      passwordHash: defaultPassword,
      college: "TeamOrphan HQ",
      location: "Bangalore, India",
      bio: "Platform moderator ensuring safe and rapid team matching.",
      skills: JSON.stringify(["Moderation", "Full-Stack"]),
      interests: JSON.stringify(["Platform Safety"]),
      role: "ADMIN",
    },
  });

  // Dates relative to now:
  const now = new Date();
  
  // Event 1: starts in 36 hours (Cutoff is in 12 hours -> 🔥 URGENT)
  const dateUrgent = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  // Event 2: starts in 18 hours (Cutoff was 6 hours ago -> RECRUITMENT CLOSED)
  const dateClosed = new Date(now.getTime() + 18 * 60 * 60 * 1000);
  // Event 3: starts in 4 days (Cutoff is in 3 days -> OPEN)
  const dateOpen1 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  // Event 4: starts in 7 days (OPEN)
  const dateOpen2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Event 5: starts in 10 days (OPEN)
  const dateOpen3 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  // 2. Create Events
  const event1 = await prisma.event.create({
    data: {
      name: "CodeVerse 48-Hour National Hackathon",
      description: "India's premier 48-hour student hackathon focusing on AI agents, fintech, and web3 innovation.",
      category: "Hackathon",
      startDate: dateUrgent,
      location: "Bangalore & Online",
      mode: "HYBRID",
      createdById: alex.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: "ByteCode Speed Clash 2026",
      description: "Fast-paced algorithmic challenge where teams solve 10 complex graph and dynamic programming problems.",
      category: "Coding Contest",
      startDate: dateClosed,
      location: "IIT Delhi (Offline)",
      mode: "OFFLINE",
      createdById: rahul.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      name: "RoboWars 2026 Arena",
      description: "Heavyweight battle bots and autonomous drone obstacle navigation tournament.",
      category: "Robotics",
      startDate: dateOpen1,
      location: "Mysore Exhibition Grounds",
      mode: "OFFLINE",
      createdById: marcus.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      name: "Inter-College Cricket Super Cup",
      description: "10-over cricket championship between 24 university teams with high cash prize pool.",
      category: "Sports",
      startDate: dateOpen2,
      location: "Chinnaswamy Stadium, Bangalore",
      mode: "OFFLINE",
      createdById: alex.id,
    },
  });

  const event5 = await prisma.event.create({
    data: {
      name: "Valorant & CS2 College Major",
      description: "5v5 tactical shooter esports championship with broadcasted playoffs.",
      category: "Gaming",
      startDate: dateOpen3,
      location: "Online",
      mode: "ONLINE",
      createdById: priyanshu.id,
    },
  });

  const event6 = await prisma.event.create({
    data: {
      name: "VentureCraft Startup Pitchathon",
      description: "Pitch your MVP directly to seed investors and venture capitalists in a 5-minute lightning sprint.",
      category: "College Fest",
      startDate: dateOpen1,
      location: "Mumbai Tech Hub",
      mode: "HYBRID",
      createdById: sarah.id,
    },
  });

  // 3. Create Teams
  // Team 1 on CodeVerse (Urgent, needs 1 member)
  const team1 = await prisma.team.create({
    data: {
      name: "Neural Ninjas",
      eventId: event1.id,
      creatorId: alex.id,
      maxMembers: 4,
      description: "Building an AI-driven automated legal document analyzer. We have frontend and backend locked, need a solid ML/Python developer!",
      requiredSkills: JSON.stringify(["Python", "Machine Learning", "FastAPI"]),
      preferredSkills: JSON.stringify(["PyTorch", "Next.js"]),
      status: "OPEN",
      contactInfo: "alex@neuralninjas.dev",
      members: {
        create: [
          { userId: alex.id, role: "LEADER" },
          { userId: sarah.id, role: "MEMBER" },
          { userId: rahul.id, role: "MEMBER" },
        ],
      },
    },
  });

  // Team 2 on CodeVerse (Needs 2 members)
  const team2 = await prisma.team.create({
    data: {
      name: "CyberSparks",
      eventId: event1.id,
      creatorId: marcus.id,
      maxMembers: 4,
      description: "Developing a decentralized emergency aid coordinator. Need React frontend and smart contract / UI dev.",
      requiredSkills: JSON.stringify(["React", "TypeScript", "Tailwind"]),
      preferredSkills: JSON.stringify(["Solidity", "Figma"]),
      status: "OPEN",
      contactInfo: "marcus@cybersparks.io",
      members: {
        create: [
          { userId: marcus.id, role: "LEADER" },
          { userId: ananya.id, role: "MEMBER" },
        ],
      },
    },
  });

  // Team 3 on ByteCode (Closed cutoff demo)
  const team3 = await prisma.team.create({
    data: {
      name: "Algorithm Aces",
      eventId: event2.id,
      creatorId: rahul.id,
      maxMembers: 3,
      description: "Competitive programming squad aiming for top 3 rank.",
      requiredSkills: JSON.stringify(["C++", "Python", "Data Structures"]),
      status: "CLOSED",
      members: {
        create: [
          { userId: rahul.id, role: "LEADER" },
          { userId: alex.id, role: "MEMBER" },
        ],
      },
    },
  });

  // Team 4 on RoboWars (Needs 1 person)
  const team4 = await prisma.team.create({
    data: {
      name: "Iron Titans Botics",
      eventId: event3.id,
      creatorId: priyanshu.id,
      maxMembers: 4,
      description: "Constructing a 15kg spinning-drum battlebot for RoboWars. Need an embedded C / Arduino expert for teleoperation.",
      requiredSkills: JSON.stringify(["Embedded C", "Arduino", "Robotics"]),
      preferredSkills: JSON.stringify(["CAD", "SolidWorks"]),
      status: "OPEN",
      members: {
        create: [
          { userId: priyanshu.id, role: "LEADER" },
          { userId: dhanush.id, role: "MEMBER" },
          { userId: rahul.id, role: "MEMBER" },
        ],
      },
    },
  });

  // Team 5 on Gaming Major (Needs 1 person)
  const team5 = await prisma.team.create({
    data: {
      name: "Phantom Vipers",
      eventId: event5.id,
      creatorId: priyanshu.id,
      maxMembers: 5,
      description: "Immortal/Radiant level Valorant squad looking for a dedicated Initiator/Controller player with good comms.",
      requiredSkills: JSON.stringify(["Valorant", "Communication", "Team Play"]),
      status: "OPEN",
      members: {
        create: [
          { userId: priyanshu.id, role: "LEADER" },
          { userId: alex.id, role: "MEMBER" },
          { userId: sarah.id, role: "MEMBER" },
          { userId: marcus.id, role: "MEMBER" },
        ],
      },
    },
  });

  // 4. Create Orphan Listings (People looking for a team)
  await prisma.orphanListing.create({
    data: {
      userId: ananya.id,
      targetEventId: event1.id,
      targetCategory: "Hackathon",
      skills: JSON.stringify(["Python", "PyTorch", "NLP", "Machine Learning", "Pandas"]),
      experience: "Won 2nd place at HackMIT 2025; published ML paper on document extraction.",
      availability: "Full 48 hours available, high energy",
      location: "Hyderabad / Online",
      mode: "ANY",
      bio: "ML & Data Science specialist looking for a serious hackathon squad. Can build predictive models and RAG pipelines in a few hours.",
      status: "ACTIVE",
    },
  });

  await prisma.orphanListing.create({
    data: {
      userId: sarah.id,
      targetEventId: event1.id,
      targetCategory: "Hackathon",
      skills: JSON.stringify(["Figma", "UI/UX", "React", "Tailwind", "Motion"]),
      experience: "Lead UI designer for 4 startup products; designed 10+ hackathon winning decks.",
      availability: "Available immediately for remote/hybrid teams",
      location: "Pune / Online",
      mode: "ONLINE",
      bio: "I will make sure our project has the slickest UI and presentation pitch in the room. Fast turnaround on responsive React components.",
      status: "ACTIVE",
    },
  });

  await prisma.orphanListing.create({
    data: {
      userId: marcus.id,
      targetEventId: event1.id,
      targetCategory: "Hackathon",
      skills: JSON.stringify(["Python", "React", "Machine Learning", "JavaScript"]),
      experience: "3rd year AI student. Comfortable with end-to-end full stack prototypes.",
      availability: "Ready for upcoming weekend competitions",
      location: "Mysore, India",
      mode: "ANY",
      bio: "Looking to join an ambitious team. Can handle both frontend UI in React/Next.js and backend Python APIs.",
      status: "ACTIVE",
    },
  });

  // 5. Seed Join Request
  await prisma.joinRequest.create({
    data: {
      teamId: team1.id,
      userId: ananya.id,
      message: "Hey Alex! I have extensive PyTorch and FastAPI experience and would love to build the legal doc ML model for Neural Ninjas.",
      status: "PENDING",
    },
  });

  // 6. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: "JOIN_REQUEST",
      title: "New Join Request for Neural Ninjas",
      message: "Ananya Desai requested to join your team for CodeVerse Hackathon.",
      link: `/teams/${team1.id}`,
    },
  });

  await prisma.notification.create({
    data: {
      userId: marcus.id,
      type: "URGENCY_WARNING",
      title: "12 Hours Left to Recruit!",
      message: "Recruitment for CodeVerse 48-Hour Hackathon closes in 12 hours. Complete your squad now.",
      link: `/teams/${team2.id}`,
    },
  });

  // 7. Seed Messages
  await prisma.message.create({
    data: {
      senderId: ananya.id,
      receiverId: alex.id,
      content: "Hi Alex! Sent a join request for Neural Ninjas. Let me know if you want to hop on a quick Discord call to discuss the tech stack.",
      read: false,
    },
  });

  console.log("✅ TeamOrphan Database Seed Completed Successfully!");
  console.log("--------------------------------------------------");
  console.log("Demo Credentials:");
  console.log("User 1: marcus@example.com / password123 (username: marcus_c)");
  console.log("User 2: alex@example.com / password123 (username: alex_v)");
  console.log("User 3: sarah@example.com / password123 (username: sarah_c)");
  console.log("Admin:  admin@teamorphan.org / password123 (username: admin)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
