/* eslint-disable */
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MemorySaver } from "@langchain/langgraph";
import { queryVectorStore } from "@/lib/embeddings";
import jwt from "jsonwebtoken";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1m";

// JWT Token verification function
function verifyToken(token: string): {
  valid: boolean;
  payload?: any;
  error?: string;
} {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "Token expired" };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "Invalid token" };
    } else {
      return { valid: false, error: "Token verification failed" };
    }
  }
}

// Function to generate JWT token (you might want to use this in a separate auth endpoint)
export function generateToken(payload: any): string {
  const options = {
    expiresIn: JWT_EXPIRY,
  } as jwt.SignOptions;

  return jwt.sign(payload, JWT_SECRET, options);
}

// Add CORS check middleware
function isAllowedOrigin(origin: string | null) {
  const allowedOrigins = [
    "https://rockygeekz.dev",
    "https://www.rockygeekz.dev",

    // Include localhost for development(uncomment for development)
    "http://localhost:3000",
  ];
  return origin && allowedOrigins.includes(origin);
}

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();

// Function to detect if a message likely needs web search - optimized with Set for faster lookups
function needsWebSearch(message: string): boolean {
  const searchIndicators = new Set([
    "current",
    "latest",
    "recent",
    "news",
    "today",
    "update",
    "weather",
    "price",
    "stock",
    "event",
    "happened",
    "when did",
    "when will",
    "how much is",
    "what is the",
    "who is",
    "where is",
    "2023",
    "2024",
    "2025",
    "sui",
    "solana",
    "erebrus",
    "netsepio",
    "search",
    "deepseek",
  ]);

  const lowerMessage = message.toLowerCase();
  return Array.from(searchIndicators).some((indicator) =>
    lowerMessage.includes(indicator.toLowerCase())
  );
}

// Function to detect query type - optimized with regex patterns stored as constants
const SKILLS_PATTERN =
  /skills|technologies|tech stack|programming|languages|frameworks|tools|libraries|proficient|expertise|capable|abilities/i;
const PROJECTS_PATTERN =
  /projects|portfolio|work|applications|apps|websites|developed|built|created|made|showcase|gitsplit|cryptorage|terminal ai|mystic tarot/i;
const EXPERIENCE_PATTERN =
  /experience|work history|job|career|background|employment|company|lazarus|position|role/i;
const EDUCATION_PATTERN =
  /education|degree|university|college|school|academic|study|studied|aissms|engineering|be|computer|pune/i;
const CONTACT_PATTERN =
  /contact|email|phone|reach|get in touch|connect|social media|linkedin|github|twitter|message|call/i;
const AWARDS_PATTERN =
  /awards|achievements|recognition|hackathon|solana|radar|sui|overflow|won|prize|honor/i;
const LINKS_PATTERN =
  /links|urls|websites|resources|portfolio|resume|github|linkedin|social|profiles|connect|follow|check out|visit/i;

// Add more specific patterns for individual link types
const RESUME_PATTERN = /resume|cv|curriculum vitae/i;
const GITHUB_PATTERN = /github|code|repository|repositories|source code/i;
const LINKEDIN_PATTERN = /linkedin|professional profile|professional network/i;
const PORTFOLIO_PATTERN = /portfolio website|personal website|portfolio site/i;
const PROJECT_LINKS_PATTERN =
  /project links|project urls|project websites|hackathon projects/i;

// Add more specific patterns for individual contact types
const EMAIL_PATTERN =
  /email|e-mail|mail|send.*email|send.*mail|electronic mail/i;
const PHONE_PATTERN = /phone|call|mobile|cell|telephone|contact number/i;
const LOCATION_PATTERN =
  /location|address|where.*live|where.*based|city|town|where.*from/i;

// Add specific patterns for individual projects
const GITSPLIT_PATTERN =
  /gitsplit|funding platform|open-source funding|ethglobal/i;
const CRYPTORAGE_PATTERN =
  /cryptorage|chrome extension|secure storage|dorahacks|walrus blockchain/i;
const TERMINAL_AI_PATTERN =
  /terminal ai|assistant|cli tool|command line|npm package|terminal-ai-assistant/i;

// Update the detectQueryType function to handle specific project types
function detectQueryType(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Check for specific project types
  if (
    GITSPLIT_PATTERN.test(lowerMessage) &&
    !CRYPTORAGE_PATTERN.test(lowerMessage) &&
    !TERMINAL_AI_PATTERN.test(lowerMessage)
  )
    return "gitsplit_project";
  if (
    CRYPTORAGE_PATTERN.test(lowerMessage) &&
    !GITSPLIT_PATTERN.test(lowerMessage) &&
    !TERMINAL_AI_PATTERN.test(lowerMessage)
  )
    return "cryptorage_project";
  if (
    TERMINAL_AI_PATTERN.test(lowerMessage) &&
    !GITSPLIT_PATTERN.test(lowerMessage) &&
    !CRYPTORAGE_PATTERN.test(lowerMessage)
  )
    return "terminal_ai_project";

  // Check for specific contact types
  if (
    EMAIL_PATTERN.test(lowerMessage) &&
    !PHONE_PATTERN.test(lowerMessage) &&
    !LOCATION_PATTERN.test(lowerMessage)
  )
    return "email_contact";
  if (PHONE_PATTERN.test(lowerMessage) && !EMAIL_PATTERN.test(lowerMessage))
    return "phone_contact";
  if (LOCATION_PATTERN.test(lowerMessage)) return "location_contact";

  // Check for specific link types
  if (
    RESUME_PATTERN.test(lowerMessage) &&
    !lowerMessage.includes("skills") &&
    !lowerMessage.includes("experience")
  )
    return "resume_link";
  if (GITHUB_PATTERN.test(lowerMessage) && !lowerMessage.includes("projects"))
    return "github_link";
  if (LINKEDIN_PATTERN.test(lowerMessage)) return "linkedin_link";
  if (PORTFOLIO_PATTERN.test(lowerMessage)) return "portfolio_link";
  if (PROJECT_LINKS_PATTERN.test(lowerMessage)) return "project_links";

  // Then check for general categories
  if (SKILLS_PATTERN.test(lowerMessage)) return "skills";
  if (PROJECTS_PATTERN.test(lowerMessage)) return "projects";
  if (EXPERIENCE_PATTERN.test(lowerMessage)) return "experience";
  if (EDUCATION_PATTERN.test(lowerMessage)) return "education";
  if (CONTACT_PATTERN.test(lowerMessage)) return "contact";
  if (AWARDS_PATTERN.test(lowerMessage)) return "awards";
  if (LINKS_PATTERN.test(lowerMessage)) return "links";

  return null;
}

// Define types for OpenRouter API
interface OpenRouterMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface OpenRouterFields {
  temperature?: number;
  [key: string]: unknown;
}

// Create a custom OpenRouter-based model
class OpenRouterChatModel extends ChatOpenAI {
  private isSearchQuery: boolean;

  constructor(fields: OpenRouterFields, isSearchQuery: boolean = false) {
    super(fields);
    this.isSearchQuery = isSearchQuery;
  }

  async _generate(messages: BaseMessage[], _options: ChatOpenAICallOptions) {
    // Format messages for OpenRouter
    const formattedMessages: OpenRouterMessage[] = messages.map((msg) => ({
      role:
        msg._getType() === "human"
          ? "user"
          : msg._getType() === "system"
          ? "system"
          : "assistant",
      content: msg.content as string,
    }));

    // Check if the last message is from a human and might need search
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    if (lastMessage.role === "user" && this.isSearchQuery) {
      try {
        // Perform a search directly
        const searchTool = new TavilySearchResults({
          maxResults: 3,
          apiKey: process.env.TAVILY_API_KEY,
        });
        const searchResults = await searchTool.invoke(lastMessage.content);

        // Add search results as a system message
        formattedMessages.splice(formattedMessages.length - 1, 0, {
          role: "system",
          content: `Relevant web search results that might help with the user's question:\n${searchResults}\n\nUse these results if they're helpful for answering the question.`,
        });
      } catch (error) {
        console.error("Error performing search:", error);
        // Continue without search results if there's an error
      }
    }

    try {
      // Make direct API call to OpenRouter
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://rockyport.xyz",
            "X-Title": "Rakesh's Portfolio",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "alibaba/tongyi-deepresearch-30b-a3b:free" , // for /chat
            messages: formattedMessages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API error:", errorData);
        throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // Format the response to match what LangChain expects
      return {
        generations: [
          {
            text: data.choices[0].message.content,
            message: new AIMessage({
              content: data.choices[0].message.content,
            }),
          },
        ],
      };
    } catch (error) {
      console.error("Error calling OpenRouter:", error);
      throw error;
    }
  }
}

// Define the type for chat history messages
interface ChatMessage {
  type: "user" | "assistant";
  content: string;
}

// Simple in-memory cache for vector search results
const vectorSearchCache = new Map<string, string>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Update the generateStructuredResponse function to handle specific project types
function generateStructuredResponse(queryType: string): string {
  // Define individual project templates
const projectTemplates: Record<string, any> = {
  doxelai_project: [
    {
      title: "DoxelAI",
      description:
        "Secure Document Analysis Vault supporting multi-format uploads with role-based access control and AES-256 encryption. Integrated Hugging Face NLP to auto-summarize documents and detect security threats.",
      technologies: ["Spring Boot", "PostgreSQL", "Supabase", "Hugging Face", "Docker", "AWS"],
      link: "https://github.com/rockygeekz/doxelai",
    },
  ],
  flowmate_project: [
    {
      title: "FlowMate",
      description:
        "AI-Powered Workflow Automation SaaS platform to create, schedule, and run web scraping pipelines. Implemented Stripe-based subscription billing and deployed on AWS with Docker and Kubernetes.",
      technologies: ["Next.js", "Node.js", "MongoDB", "Prisma", "Stripe", "Docker", "Kubernetes", "AWS"],
      link: "https://github.com/rockygeekz/flowmate",
    },
  ],
  devops_pipeline_project: [
    {
      title: "End-to-End DevOps Pipeline",
      description:
        "Production-grade CI/CD pipeline for cloud-based microservices. Provisioned AWS infrastructure using Terraform and deployed on EKS with Kubernetes for zero-downtime deployments.",
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "ArgoCD", "EKS"],
      link: "https://github.com/rockygeekz/devops-pipeline",
    },
  ],
};

// Define individual contact templates
const contactTemplates: Record<string, any> = {
  email_contact: {
    email: "rakesh.s552004@gmail.com",
    type: "Email",
  },
  phone_contact: {
    phone: "+917022757953",
    type: "Phone",
  },
  location_contact: {
    location: "Bengaluru, Karnataka",
    type: "Location",
  },
};

// Define individual link templates
const linkTemplates: Record<string, any> = {
  resume_link: [
    {
      title: "Resume",
      url: "https://rockyport.xyz/resume",
      description:
        "View my detailed resume with skills, experience, and education",
    },
  ],
  github_link: [
    {
      title: "GitHub Profile",
      url: "https://github.com/rockygeekz",
      description:
        "Check out my code repositories and open-source contributions",
    },
  ],
  linkedin_link: [
    {
      title: "LinkedIn Profile",
      url: "https://www.linkedin.com/in/rakeshs55",
      description: "Connect with me professionally on LinkedIn",
    },
  ],
  portfolio_link: [
    {
      title: "Portfolio Website",
      url: "https://rockyport.xyz",
      description: "My personal portfolio showcasing projects and skills",
    },
  ],
  project_links: [
    {
      title: "DoxelAI Project",
      url: "https://github.com/rockygeekz/doxelai",
      description: "Secure document analysis vault with AI-powered summarization",
    },
    {
      title: "FlowMate Project",
      url: "https://github.com/rockygeekz/flowmate",
      description: "AI-powered workflow automation SaaS platform",
    },
    {
      title: "DevOps Pipeline",
      url: "https://github.com/rockygeekz/devops-pipeline",
      description: "End-to-end DevOps pipeline for microservices",
    },
  ],
};

// Define the structured data templates for general categories
const structuredDataTemplates: Record<string, any> = {
  skills: [
    { name: "Java", category: "Programming Language" },
    { name: "C++", category: "Programming Language" },
    { name: "Python", category: "Programming Language" },
    { name: "Spring Boot", category: "Backend Framework" },
    { name: "Node.js", category: "Backend" },
    { name: "React", category: "Frontend Framework" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "Prisma", category: "Database ORM" },
    { name: "Redis", category: "Cache" },
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
    { name: "Terraform", category: "Infrastructure as Code" },
    { name: "Jenkins", category: "CI/CD" },
    { name: "GitHub Actions", category: "CI/CD" },
    { name: "Apache Kafka", category: "Message Queue" },
    { name: "Git", category: "Version Control" },
  ],
  projects: [
    {
      title: "DoxelAI",
      description:
        "Secure Document Analysis Vault supporting multi-format uploads with role-based access control and AES-256 encryption. Integrated Hugging Face NLP to auto-summarize documents and detect security threats, cutting manual review effort by 80%.",
      technologies: ["Spring Boot", "PostgreSQL", "Supabase", "Hugging Face", "Docker", "AWS"],
      link: "https://github.com/rockygeekz/doxelai",
    },
    {
      title: "FlowMate",
      description:
        "AI-Powered Workflow Automation SaaS platform to create, schedule, and run web scraping pipelines, handling 100+ concurrent tasks. Implemented Stripe-based subscription billing and deployed on AWS with Docker and Kubernetes.",
      technologies: ["Next.js", "Node.js", "MongoDB", "Prisma", "Stripe", "Docker", "Kubernetes", "AWS"],
      link: "https://github.com/rockygeekz/flowmate",
    },
    {
      title: "End-to-End DevOps Pipeline",
      description:
        "Production-grade CI/CD pipeline for cloud-based microservices. Provisioned AWS infrastructure using Terraform and deployed on EKS with Kubernetes for zero-downtime deployments.",
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "ArgoCD", "EKS"],
      link: "https://github.com/rockygeekz/devops-pipeline",
    },
  ],
  experience: [
    {
      title: "Full-Stack Developer Intern",
      company: "ByteDocker",
      period: "Aug 2024 - Nov 2024",
      description:
        "Delivered Tapio Banking's backend as Project Lead, developing 15+ REST APIs using Spring Boot. Launched MakeMyAdventures using Next.js, achieving 500+ weekly active users. Containerized services with Docker improving deployment speed by 25%.",
    },
    {
      title: "Full-Stack Developer Intern",
      company: "Wrenberg Pvt Ltd",
      period: "May 2024 - Jul 2024",
      description:
        "Engineered backend APIs for AR-based apparel e-commerce platform (MERN), improving response times by 30%. Automated CI/CD pipelines with GitHub Actions. Optimized MongoDB queries and caching with Redis.",
    },
  ],
  education: [
    {
      title: "Bachelor of Engineering in Information Science and Engineering",
      institution: "Bangalore Institute of Technology, Bengaluru",
      period: "Dec 2022 - May 2026",
      description: "CGPA: 8.6",
    },
    {
      title: "Pre-University in Computer Science (PCMC)",
      institution: "Deeksha Center for Learning, Bengaluru",
      period: "Mar 2020 - Apr 2022",
      description: "Score: 98%",
    },
  ],
  contact: {
    email: "rakesh.s552004@gmail.com",
    phone: "+917022757953",
    location: "Bengaluru, Karnataka",
    linkedin: "https://www.linkedin.com/in/rakeshs55",
    github: "https://github.com/rockygeekz",
    portfolio: "https://rockyport.xyz/",
  },
  awards: [
    {
      title: "Web Development Hackathon Winner - IT Secure Systems",
      description:
        "Created a student-focused learning platform used by 200+ peers, demonstrating strong full-stack development skills.",
    },
    {
      title: "LeetCode 800+ Problems",
      description:
        "Solved 800+ algorithmic problems on LeetCode, demonstrating expertise in data structures and algorithms.",
    },
    {
      title: "Java Spring Framework 6 and Spring Boot 3 Certification",
      description:
        "Certified in Java Spring Framework and Spring Boot development.",
    },
    {
      title: "Oracle Certified Cloud Infrastructure (OCI) DevOps Professional",
      description:
        "Oracle certification in cloud infrastructure and DevOps practices.",
    },
  ],
  links: [
    {
      title: "Portfolio Website",
      url: "https://rockyport.xyz",
      description: "My personal portfolio showcasing projects and skills",
    },
    {
      title: "Resume",
      url: "https://rockyport.xyz/resume",
      description: "View my detailed resume",
    },
    {
      title: "GitHub Profile",
      url: "https://github.com/rockygeekz",
      description: "Check out my code repositories and contributions",
    },
    {
      title: "LinkedIn",
      url: "https://www.linkedin.com/in/rakeshs55",
      description: "Connect with me professionally",
    },
    {
      title: "DoxelAI Project",
      url: "https://github.com/rockygeekz/doxelai",
      description: "Secure document analysis vault with AI",
    },
    {
      title: "FlowMate Project",
      url: "https://github.com/rockygeekz/flowmate",
      description: "AI-powered workflow automation platform",
    },
    {
      title: "DevOps Pipeline",
      url: "https://github.com/rockygeekz/devops-pipeline",
      description: "End-to-end DevOps pipeline for microservices",
    },
  ],
};

  // Check if it's a specific project type
  if (queryType.includes("_project")) {
    return JSON.stringify(
      {
        type: "projects",
        data: projectTemplates[queryType],
      },
      null,
      2
    );
  }

  // Check if it's a specific contact type
  if (queryType.includes("_contact")) {
    return JSON.stringify(
      {
        type: "contact",
        data: contactTemplates[queryType],
      },
      null,
      2
    );
  }

  // Check if it's a specific link type
  if (queryType.includes("_link")) {
    return JSON.stringify(
      {
        type: "links",
        data: linkTemplates[queryType],
      },
      null,
      2
    );
  }

  // Otherwise return the general category data
  return JSON.stringify(
    {
      type: queryType,
      data: structuredDataTemplates[queryType],
    },
    null,
    2
  );
}

export async function POST(req: Request) {
  // Performance monitoring
  const startTime = performance.now();

  // Check origin
  const headersList = await headers();
  const origin = headersList.get("origin");

  // If origin is not allowed, return 403 Forbidden
  if (!isAllowedOrigin(origin)) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized origin lol noob" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // JWT Authentication
  const authHeader = headersList.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse(
      JSON.stringify({
        error: "Authentication required",
        message: "Missing or invalid authorization header",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin || "",
        },
      }
    );
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const tokenVerification = verifyToken(token);

  if (!tokenVerification.valid) {
    return new NextResponse(
      JSON.stringify({
        error: "Authentication failed",
        message: tokenVerification.error,
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin || "",
        },
      }
    );
  }

  // Optional: Add rate limiting based on JWT payload
  const userPayload = tokenVerification.payload;
  console.log("Authenticated user:", userPayload);

  try {
    const {
      prompt,
      messages: chatHistory,
      sessionId,
    } = (await req.json()) as {
      prompt: string;
      messages: ChatMessage[];
      sessionId?: string;
    };

    console.log("Received authenticated request with prompt:", prompt);

    // Check if the prompt likely needs web search
    const isSearchQuery = needsWebSearch(prompt);

    // Detect query type for structured response
    const queryType = detectQueryType(prompt);

    // Create a model with the search flag
    const model = new OpenRouterChatModel(
      {
        temperature: 0,
      },
      isSearchQuery
    );

    // Define the function that calls the model with context
    async function callModel(state: typeof MessagesAnnotation.State) {
      try {
        // Get the last user message to use for vector search
        const lastUserMessage = state.messages
          .filter((msg) => msg._getType() === "human")
          .pop();

        const userQuery = lastUserMessage
          ? (lastUserMessage.content as string)
          : "";

        // Detect if this is a query that will have structured data
        const willHaveStructuredData = !!queryType;

        // Optimization: Use cached vector search results if available
        let characterInfo = "";
        const cacheKey = `vector_search_${userQuery.slice(0, 50)}`;

        if (vectorSearchCache.has(cacheKey)) {
          console.log("Using cached vector search results");
          characterInfo = vectorSearchCache.get(cacheKey)!;
        } else {
          try {
            // Retrieve relevant character information using vector search
            console.time("Vector search");

            // Adjust number of results based on query complexity
            const k = userQuery.length > 50 ? 4 : 3;
            const relevantInfo = await queryVectorStore(userQuery, k);

            console.timeEnd("Vector search");

            characterInfo = relevantInfo
              .map((doc) => doc.pageContent)
              .join("\n\n");

            // Cache the results
            vectorSearchCache.set(cacheKey, characterInfo);

            // Set expiration for cache entry
            setTimeout(() => {
              vectorSearchCache.delete(cacheKey);
            }, CACHE_TTL);
          } catch (error) {
            console.error("Vector search failed, using fallback:", error);
            // Fallback to empty string if vector search fails
            characterInfo = "";
          }
        }

        // Modify system prompt based on whether structured data will be added
        let systemContent = `You are Rakesh S — a passionate and ambitious engineer who enjoys building secure, scalable systems and automating infrastructure. You're currently pursuing your B.E. in Information Science at Bangalore Institute of Technology, and you've already made impactful contributions through internships and personal projects.

You've interned at companies like ByteDocker and Wrenberg, where you built production-ready APIs using Spring Boot, integrated Firebase for authentication, and automated CI/CD pipelines using GitHub Actions. You're known for combining backend expertise with DevOps tools like Docker, Kubernetes, and AWS to deliver cloud-native solutions.

One of your most impressive projects is Doxel AI — a secure document analysis system that uses NLP models from Hugging Face to extract insights and scan for threats. You've also implemented a full DevOps pipeline using Terraform, GitHub Actions, ArgoCD, and EKS, following GitOps best practices with zero-downtime deployment strategies.

You are confident, technically strong, and always eager to learn. When responding, speak in a natural, friendly, and professional tone. Be concise. Reflect your real personality — helpful, honest, and focused on delivering real value.

Use "I" statements, stay on-topic, and answer as if you're directly speaking to someone who wants to know more about your work, projects, and journey. If a question is outside your scope, politely acknowledge it and invite them to connect directly.`;


        if (willHaveStructuredData) {
          // For queries that will have structured data, instruct the model to be brief
          systemContent += ` For this query, provide a VERY BRIEF conversational introduction only. DO NOT list specific details like skills, projects, contact info, or links - these will be displayed separately in a structured format. Keep your response to 1-2 sentences maximum.`;
        } else {
          // For queries without structured data, allow normal detailed responses
          systemContent += ` Keep responses concise and use "I" statements.`;
        }

        // Only include character info if we have it
        if (characterInfo) {
          systemContent += `\n\nRelevant information about me:\n${characterInfo}`;
        }

        // Add specific instructions based on query type
        if (queryType && queryType.includes("_project")) {
          const projectName = queryType
            .replace("_project", "")
            .replace("_", " ");
          systemContent += `\n\nThis question is about my ${projectName} project. Just provide a brief introduction - the details will be shown in a structured format.`;
        } else if (queryType && queryType.includes("_contact")) {
          const contactType = queryType.replace("_contact", "");
          systemContent += `\n\nThis question is about my ${contactType}. Just acknowledge the request - the actual ${contactType} will be shown in a structured format.`;
        } else if (queryType && queryType.includes("_link")) {
          const linkType = queryType.replace("_link", "");
          systemContent += `\n\nThis question is about my ${linkType} link. Just acknowledge the request - the actual link will be shown in a structured format.`;
        } else if (queryType === "skills") {
          systemContent += `\n\nThis question is about my skills. Just provide a brief introduction - the detailed skills list will be shown in a structured format.`;
        } else if (queryType === "projects") {
          systemContent += `\n\nThis question is about my projects. Just provide a brief introduction - the detailed project list will be shown in a structured format.`;
        } else if (queryType === "experience") {
          systemContent += `\n\nThis question is about my experience. Just provide a brief introduction - the detailed experience will be shown in a structured format.`;
        } else if (queryType === "education") {
          systemContent += `\n\nThis question is about my education. Just provide a brief introduction - the detailed education info will be shown in a structured format.`;
        } else if (queryType === "contact") {
          systemContent += `\n\nThis question is about my contact information. Just acknowledge the request - the actual contact details will be shown in a structured format.`;
        } else if (queryType === "links") {
          systemContent += `\n\nThis question is about my online profiles and resources. Just acknowledge the request - the actual links will be shown in a structured format.`;
        } else if (queryType) {
          systemContent += `\n\nThis question is about my ${queryType}. Just provide a brief introduction - the details will be shown in a structured format.`;
        }

        systemContent += `\n\nRules:
        1. Speak as Rakesh using "I" and "my"
        2. Keep responses concise and focused
        3. If unsure about specific details, say "Feel free to contact me directly for more information"
        4. Use web search results when provided for up-to-date information
        5. Maintain a professional tone`;

        // Manage system message efficiently
        if (
          state.messages.length === 0 ||
          !(state.messages[0] instanceof SystemMessage)
        ) {
          state.messages.unshift(new SystemMessage(systemContent));
        } else {
          // Replace the existing system message with the updated one
          state.messages[0] = new SystemMessage(systemContent);
        }

        // Performance monitoring for model generation
        console.time("Model generation");
        const response = await model._generate(state.messages, {});
        console.timeEnd("Model generation");

        // Return the response
        return { messages: [response.generations[0].message] };
      } catch (error) {
        console.error("Error in callModel:", error);
        // Return a fallback message
        return {
          messages: [
            new AIMessage(
              "I'm sorry, I encountered an error processing your request. Please try again later."
            ),
          ],
        };
      }
    }

    // Define a new graph
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("agent", callModel)
      .addEdge("__start__", "agent")
      .addEdge("agent", "__end__");

    // Compile it into a LangChain Runnable with the checkpointer
    const app = workflow.compile({
      checkpointer: agentCheckpointer,
    });

    // Convert chat history to the format expected by LangGraph
    const formattedMessages = chatHistory
      ? chatHistory.map((msg: ChatMessage) =>
          msg.type === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        )
      : [];

    // Add the current prompt as a human message
    formattedMessages.push(new HumanMessage(prompt));

    // Generate a thread ID for this conversation
    // Use the provided sessionId or generate a new one
    const threadId = sessionId || Date.now().toString();

    // Use the agent
    console.log("Invoking agent workflow with thread ID:", threadId);
    const finalState = await app.invoke(
      { messages: formattedMessages },
      { configurable: { thread_id: threadId } }
    );
    console.log("Agent workflow completed");

    // Get the last message (the response)
    let response = finalState.messages[finalState.messages.length - 1]
      .content as string;

    // If we have a query type, append the structured data JSON to the response
    let hasStructuredData = false;
    if (queryType) {
      const structuredData = generateStructuredResponse(queryType);
      response += `\n\n\`\`\`json\n${structuredData}\n\`\`\``;
      hasStructuredData = true;
    }

    // Performance monitoring
    const endTime = performance.now();
    console.log(
      `Total request processing time: ${(endTime - startTime).toFixed(2)}ms`
    );

    // Return response with CORS headers and include isSearchPerformed flag and threadId
    return new NextResponse(
      JSON.stringify({
        response,
        isSearchPerformed: isSearchQuery,
        hasStructuredData: hasStructuredData,
        structuredDataType: queryType,
        sessionId: threadId,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin || "",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin || "",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const headersList = headers();
  const origin = (await headersList).get("origin");

  if (!isAllowedOrigin(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": origin || "",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
