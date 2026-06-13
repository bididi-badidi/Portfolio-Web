import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import JSZip from "jszip";
import { generateResume } from "../lib/docx";
import { FinalResumeData } from "../app/interfaces/Resume";

const outputArg = process.argv.find((arg) => arg.startsWith("--out="));
const outputPath = resolve(
  outputArg?.split("=")[1] ??
    `${tmpdir()}/portfolio-resume-builder-verify/zi-shen-chan-generated-resume.docx`,
);

const resumeData: FinalResumeData = {
  header: {
    name: "Chan Zi Shen",
    contact: "zishenchan@gmail.com | +65 8790 3640",
    links: [
      {
        label: "GitHub",
        text: "https://github.com/ZSHenChan",
        url: "https://github.com/ZSHenChan",
      },
      {
        label: "LinkedIn",
        text: "https://www.linkedin.com/in/zi-shen-chan/",
        url: "https://www.linkedin.com/in/zi-shen-chan/",
      },
    ],
  },
  summary:
    "Math and Computer Science undergraduate with a strong technical foundation in network protocols (TCP/IP), OS (Linux/Windows), and automation. Proven track record in developing scalable software architectures and analyzing complex data, with a keen interest in applying these skills to cyber defense and incident response. Adept at rapid problem-solving and collaborating across teams to enhance operational efficiency, eager to contribute to security operations.",
  education: [
    {
      institution: "Nanyang Technological University",
      date: "Expect in July 2026",
      degree: "Bachelor's in mathematical and computer science",
      gpa: "CGPA: 4.44/5.0",
    },
  ],
  skills: {
    Technical:
      "Coding Languages: Python, Java, C#, JS, MySQL. Computer Networks: TCP/IP, Packet Analysis (Wireshark), Network Services (DNS, HTTP, SMTP, SSH), Web App Security, Web Application Attacks (SQL injection, XSS, API attacks, CSRF, DDOs), Malware attacks. Tools & Frameworks: WebDev(ReactJS, REST APIs, FastAPI), .NET Core, gRPC. Infrastructure: Git, Microsoft Azure, AWS, Docker, Linux, Redis, MySQL, Firebase.",
    "Soft Skills":
      "Continuous learning, Team leading, Time management, Team communication/collaboration, Problem-solving, Attention to details, independent working.",
    Interests: "iOS Shortcuts, Musical instruments, Travelling.",
  },
  "Work Experiences & Internships": [
    {
      title: "Rohde & Schwarz",
      role: "Software Engineer",
      date: "Jan 2025 - May 2025",
      bullets: [
        "Automation Manager",
        "Developed a TCP-based client-server system that automated overnight Android device testing, handling over 5,000 long-running test cases, and significantly reducing manual testing time by 60%.",
        "Created dashboard for real-time performance tracking and incident report.",
        "Designed microservice architecture with gRPC and Consul to ensure 80% availability and load balancing, scalability for up to 100 microservice instances across Linux and Windows environments.",
      ],
    },
  ],
  "Personal Projects": [
    {
      title: "StockAI",
      role: "",
      date: "May 2025 - Aug 2025",
      bullets: [
        "Implemented telegram CLI bot to successfully handle more than 10 command types for stock researching.",
        "Integrated and refined LLM workflows to summarize and analyze data from more than 5000 US companies.",
      ],
    },
    {
      title: "Personal Portfolio AI Assistant",
      role: "",
      date: "Apr 2025 - July 2025",
      bullets: [
        "Portfolio chatbot that can assist more than 100 visitors at once in my personal portfolio website.",
        "Using RAG system to retrieve and provide relevant answers for more than 3,000 question types in less than 2 seconds.",
        "Implemented helpful functionalities such as navigation and API request sending via function calling, all executed within 1 second with 90% accuracy.",
        "Designed chatbot system with context awareness to effectively capture crucial information and send email message with 100% success rate.",
      ],
    },
    {
      title: "Agentic Data Analyst Platform",
      role: "Final Year Project (Ongoing)",
      date: "Aug 2025 - Present",
      bullets: [
        "Architected a hierarchical agentic workflow (using acyclic directed graph) that autonomously decomposes complex user queries into executable sub-tasks, utilizing a self-correcting code execution loop to ensure robust data processing.",
        "Designed a novel \"Bias-Contrastive\" analysis layer where distinct AI agents assume specific analytical personas (e.g. Risk-Averse, Growth Optimist) to debate findings, providing data analysts with diverse interpretive angles rather than a single static viewpoint.",
        "Implemented a \"Neutrality Synthesizer\" that mathematically aggregates divergent agent opinions to filter out subjective noise, producing objective, statistically grounded insights that aid in unbiased decision-making.",
        "Skills: Software design, prompt engineering, MCP, LLM, Machine Learning, Time Series Analysis, Data Analysis, Python, Pandas, Scikit-Learn, Matplotlib.",
      ],
    },
  ],
  "Leadership Experiences": [
    {
      title: "ISAR 2025",
      role: "Event Leadership & Project Management",
      date: "June 2025",
      bullets: [
        "Directed all communications and collaboration with external event organizers, venue hosts and internal AV teams to ensure seamless program flow and on-site execution.",
        "Managed a 10-member team in managing all audiovisual and logistical aspects for large-scale international event with participants from multiple countries, including USA, Australia, Netherlands, and Denmark.",
        "Led the entire AV production lifecycle from pre-event planning and slide creation to live program execution and troubleshooting to ensure 100% on-schedule program flow and resolve all technical issues in less than 5 minutes.",
      ],
    },
    {
      title: "NTU Rotaract Club",
      role: "Team Lead | Division of Community Service",
      date: "Aug 2023 - July 2024",
      bullets: [
        "Led a team of 20 volunteers to plan, organize, and executed weekly visits for the elderly community members across Singapore.",
        "Managed all logistics and collaborated with external government organizations to plan and host 2 large-scale events for seniors over the academic year.",
      ],
    },
    {
      title: "NTU NBS Corporate Support & Facilities",
      role: "Regular Logistic Team Lead",
      date: "Jan 2023 - Recent",
      bullets: [
        "Led a team of 15 members for fulfilling logistic requests.",
        "Managed streamlining logistics and facilities management through effective communication with key stakeholders and university faculty.",
        "Directed communications and collaborations between university departments and offices.",
        "Annual Dinner Project Lead (2023,2024,2025)",
        "Overseen AV team of size 5 for slide production and reception team of size 8 for prize coordination to guarantee memorable and professional event for more than 150 attendees.",
        "Effectively directed communications with 5 university professors and 3 departments faculty to ensure seamless program flow and resolve all technical issues in less than 5 minutes.",
      ],
    },
  ],
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const decodeXml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");

const extractText = (documentXml: string) =>
  [...documentXml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((match) => decodeXml(match[1]))
    .join("")
    .replace(/\s+/g, " ")
    .trim();

const expectText = (generatedText: string, expected: string) => {
  const normalizedExpected = expected.replace(/\s+/g, " ").trim();
  assert(
    generatedText.includes(normalizedExpected),
    `Generated DOCX is missing expected content: "${normalizedExpected}"`,
  );
};

const expectRunSizeNearText = (
  documentXml: string,
  text: string,
  expectedHalfPoints: number,
) => {
  const runs = [...documentXml.matchAll(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g)];
  const matchingRun = runs.find((run) => {
    const runXml = run[0];
    const runText = extractText(runXml);

    return (
      runText.includes(text) &&
      new RegExp(`<w:sz w:val="${expectedHalfPoints}"\\s*\\/>`).test(runXml)
    );
  });

  assert(
    matchingRun,
    `"${text}" was not rendered at ${expectedHalfPoints / 2}pt.`,
  );
};

const expectRunAttrsNearText = (
  documentXml: string,
  text: string,
  attrs: string[],
) => {
  const runs = [...documentXml.matchAll(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g)];
  const matchingRun = runs.find((run) => {
    const runXml = run[0];
    const runText = extractText(runXml);

    return runText.includes(text) && attrs.every((attr) => runXml.includes(attr));
  });

  assert(
    matchingRun,
    `"${text}" was not rendered with expected run attributes: ${attrs.join(", ")}.`,
  );
};

const expectRunMissingAttrsNearText = (
  documentXml: string,
  text: string,
  attrs: string[],
) => {
  const runs = [...documentXml.matchAll(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g)];
  const matchingRun = runs.find((run) => {
    const runXml = run[0];
    const runText = extractText(runXml);

    return runText.includes(text) && attrs.every((attr) => !runXml.includes(attr));
  });

  assert(
    matchingRun,
    `"${text}" unexpectedly included one of these run attributes: ${attrs.join(", ")}.`,
  );
};

const expectAttrs = (
  xml: string,
  tagName: string,
  attrs: Record<string, string>,
  message: string,
) => {
  const tag = xml.match(new RegExp(`<${tagName}[^>]*>`))?.[0];
  assert(tag, `${message} Missing <${tagName}> tag.`);

  Object.entries(attrs).forEach(([name, value]) => {
    assert(
      tag.includes(`${name}="${value}"`),
      `${message} Expected ${name}="${value}" in ${tag}.`,
    );
  });
};

const expectBulletParagraphNearText = (documentXml: string, text: string) => {
  const paragraphs = [
    ...documentXml.matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g),
  ];
  const matchingParagraph = paragraphs.find((paragraph) => {
    const paragraphXml = paragraph[0];

    return paragraphXml.includes("<w:numPr>") && extractText(paragraphXml).includes(text);
  });

  assert(matchingParagraph, `"${text}" was not rendered as a Word bullet.`);
};

const verifyDocument = async (docxBuffer: Buffer) => {
  const zip = await JSZip.loadAsync(docxBuffer);
  const documentXml = await zip.file("word/document.xml")?.async("string");
  const stylesXml = await zip.file("word/styles.xml")?.async("string");

  assert(documentXml, "word/document.xml was not found in the generated DOCX.");
  assert(stylesXml, "word/styles.xml was not found in the generated DOCX.");

  expectAttrs(
    documentXml,
    "w:pgMar",
    { "w:top": "432", "w:right": "720", "w:bottom": "432", "w:left": "720" },
    "Expected 0.3in top/bottom margins and 0.5in left/right margins.",
  );
  assert(
    stylesXml.includes('<w:rFonts w:ascii="Times New Roman"'),
    "Default document font is not Times New Roman.",
  );
  assert(
    documentXml.includes('<w:rFonts w:ascii="Times New Roman"'),
    "Generated runs do not explicitly use Times New Roman.",
  );
  expectAttrs(
    documentXml,
    "w:bottom",
    { "w:val": "single", "w:color": "auto", "w:sz": "6", "w:space": "1" },
    "Section heading bottom border was not generated.",
  );

  expectRunSizeNearText(documentXml, "Chan Zi Shen", 28);
  expectRunSizeNearText(documentXml, "Math and Computer Science undergraduate", 17);
  expectRunSizeNearText(documentXml, "Nanyang Technological University", 20);
  expectRunSizeNearText(documentXml, "Rohde & Schwarz", 20);
  expectRunAttrsNearText(documentXml, "SUMMARY", [
    '<w:sz w:val="20"/>',
    '<w:color w:val="1F4E79"/>',
  ]);
  expectRunAttrsNearText(documentXml, "SELECTED PROJECTS", [
    '<w:sz w:val="20"/>',
    '<w:color w:val="1F4E79"/>',
  ]);
  expectRunMissingAttrsNearText(documentXml, "Nanyang Technological University", [
    '<w:color w:val="1F4E79"/>',
  ]);
  expectRunMissingAttrsNearText(documentXml, "StockAI", [
    '<w:color w:val="1F4E79"/>',
  ]);
  expectBulletParagraphNearText(
    documentXml,
    resumeData["Personal Projects"][0].bullets[0],
  );
  expectBulletParagraphNearText(
    documentXml,
    resumeData["Personal Projects"][2].bullets[0],
  );

  const generatedText = extractText(documentXml);
  expectText(generatedText, "SELECTED PROJECTS");
  assert(
    !generatedText.includes("PERSONAL PROJECTS"),
    "Generated DOCX should render the project section as SELECTED PROJECTS, not PERSONAL PROJECTS.",
  );

  [
    resumeData.header.name,
    "zishenchan@gmail.com",
    resumeData.summary,
    resumeData.education[0].institution,
    resumeData.skills.Technical,
    resumeData["Work Experiences & Internships"][0].bullets[1],
    resumeData["Personal Projects"][2].bullets[0],
    resumeData["Leadership Experiences"][2].bullets[5],
    resumeData.skills.Interests,
  ].forEach((content) => expectText(generatedText, content));
};

const main = async () => {
  const blob = await generateResume(resumeData);
  const docxBuffer = Buffer.from(await blob.arrayBuffer());

  await verifyDocument(docxBuffer);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, docxBuffer);

  console.log("Resume builder verification passed.");
  console.log(`Generated DOCX: ${outputPath}`);
};

main().catch((error) => {
  console.error("Resume builder verification failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
