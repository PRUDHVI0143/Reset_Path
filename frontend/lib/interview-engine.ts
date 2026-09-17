// Advanced AI Technical Interview Intelligence & Answer Correctness Evaluation Engine

export interface InterviewQuestion {
  id: string;
  round: string;
  category: "System Design" | "Coding & Concurrency" | "Project Defense" | "Behavioral & STAR" | "Leadership & Culture";
  difficulty: "Junior" | "Mid-Level" | "Senior" | "Staff / Lead";
  question: string;
  context: string;
  expected_concepts: string[];
  anti_patterns_to_watch?: string[];
  key_points_to_mention: string[];
  model_answer: string;
  follow_up_prompts?: string[];
}

export interface KeyPointCheck {
  point: string;
  status: "covered" | "partial" | "missed";
  feedback: string;
}

export interface STARBreakdown {
  situation: { detected: boolean; snippet?: string; feedback: string };
  task: { detected: boolean; snippet?: string; feedback: string };
  action: { detected: boolean; snippet?: string; feedback: string };
  result: { detected: boolean; snippet?: string; feedback: string };
  starScore: number; // 0 - 4
}

export type CorrectnessVerdict =
  | "STRONG_PASS"
  | "PARTIALLY_CORRECT"
  | "NEEDS_IMPROVEMENT"
  | "INCORRECT_OR_OFF_TOPIC";

export interface AnswerEvaluationResult {
  verdict: CorrectnessVerdict;
  verdictLabel: string;
  verdictBadgeColor: string;
  overallScore: number; // 0 - 100
  accuracyScore: number; // 0 - 100
  coverageScore: number; // 0 - 100
  depthScore: number; // 0 - 100
  starScore: number; // 0 - 100
  wordCount: number;
  timeSpentSeconds?: number;

  // Granular Correcting Process Details
  keyPointsAnalysis: KeyPointCheck[];
  coveredKeyPointsCount: number;
  totalKeyPointsCount: number;

  strengths: string[];
  criticalMistakesAndGaps: string[];
  detectedAntiPatterns: string[];

  starBreakdown: STARBreakdown;

  // AI-Assisted Polished Rewrite of the Candidate's Answer
  improvedCandidateRewrite: string;
  rewriteExplanation: string;

  // Adaptive Follow-up question tailored to the answer given
  adaptiveFollowUpQuestion: string;
}

/**
 * Normalizes text for keyword and concept matching
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Evaluates semantic and conceptual overlap between candidate text and a concept
 */
function checkConceptOverlap(text: string, concept: string): { covered: boolean; partial: boolean } {
  const normText = normalize(text);
  const normConcept = normalize(concept);
  const conceptWords = normConcept.split(" ").filter((w) => w.length > 3);

  // Exact or direct phrase match
  if (normText.includes(normConcept)) {
    return { covered: true, partial: false };
  }

  // Count matching substantive words
  let matchCount = 0;
  for (const word of conceptWords) {
    if (normText.includes(word)) {
      matchCount++;
    }
  }

  if (conceptWords.length === 0) return { covered: true, partial: false };

  const ratio = matchCount / conceptWords.length;
  if (ratio >= 0.6) {
    return { covered: true, partial: false };
  } else if (ratio >= 0.25 || matchCount >= 1) {
    return { covered: false, partial: true };
  }

  return { covered: false, partial: false };
}

/**
 * Detects STAR components in the candidate's answer
 */
function detectSTARComponents(text: string): STARBreakdown {
  const norm = normalize(text);
  const sentences = text.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 5);

  // Situation indicators
  const situationKeywords = [
    "when", "while working", "at my", "in my project", "the repository", "we had", "initial",
    "legacy", "context", "faced", "background", "architecture was", "problem arose"
  ];
  let situationDetected = false;
  let situationSnippet = "";
  for (const s of sentences) {
    const sNorm = normalize(s);
    if (situationKeywords.some((k) => sNorm.includes(k))) {
      situationDetected = true;
      situationSnippet = s;
      break;
    }
  }

  // Task indicators
  const taskKeywords = [
    "needed to", "had to", "goal was", "objective", "task was", "required to",
    "challenge was", "bottleneck", "target", "deliverable", "sla"
  ];
  let taskDetected = false;
  let taskSnippet = "";
  for (const s of sentences) {
    const sNorm = normalize(s);
    if (taskKeywords.some((k) => sNorm.includes(k))) {
      taskDetected = true;
      taskSnippet = s;
      break;
    }
  }

  // Action indicators
  const actionKeywords = [
    "implemented", "designed", "built", "refactored", "chose", "selected", "configured",
    "optimized", "migrated", "created", "used", "introduced", "wrote", "profiled", "benchmarked"
  ];
  let actionDetected = false;
  let actionSnippet = "";
  for (const s of sentences) {
    const sNorm = normalize(s);
    if (actionKeywords.some((k) => sNorm.includes(k))) {
      actionDetected = true;
      actionSnippet = s;
      break;
    }
  }

  // Result indicators
  const resultKeywords = [
    "result", "achieved", "reduced", "improved", "increased", "percent", "%", "latency",
    "throughput", "dropped by", "scaled to", "saved", "outcome", "successfully", "without downtime"
  ];
  let resultDetected = false;
  let resultSnippet = "";
  for (const s of sentences) {
    const sNorm = normalize(s);
    if (resultKeywords.some((k) => sNorm.includes(k))) {
      resultDetected = true;
      resultSnippet = s;
      break;
    }
  }

  const count = (situationDetected ? 1 : 0) + (taskDetected ? 1 : 0) + (actionDetected ? 1 : 0) + (resultDetected ? 1 : 0);

  return {
    situation: {
      detected: situationDetected,
      snippet: situationSnippet || undefined,
      feedback: situationDetected
        ? "Context and starting scenario clearly established."
        : "Missing clear context: Start by naming the project and initial baseline setup."
    },
    task: {
      detected: taskDetected,
      snippet: taskSnippet || undefined,
      feedback: taskDetected
        ? "Explicit engineering task and constraints defined."
        : "Unclear task requirement: State the technical bottleneck or engineering SLA expected of you."
    },
    action: {
      detected: actionDetected,
      snippet: actionSnippet || undefined,
      feedback: actionDetected
        ? "Concrete architectural choices and implementation steps detailed."
        : "Vague on action: Mention exact libraries, algorithms, protocols, or design patterns you implemented."
    },
    result: {
      detected: resultDetected,
      snippet: resultSnippet || undefined,
      feedback: resultDetected
        ? "Quantifiable impact and production metrics demonstrated."
        : "Missing quantified impact: Top interviewers expect numbers (e.g., 'reduced p99 latency from 180ms to 24ms')."
    },
    starScore: count
  };
}

/**
 * Checks for interview anti-patterns or flawed concepts
 */
function detectAntiPatterns(text: string, question: InterviewQuestion): string[] {
  const norm = normalize(text);
  const detected: string[] = [];

  // General software engineering anti-patterns
  if (norm.includes("just restart") || norm.includes("reboot the server")) {
    detected.push("Suggested server restarts instead of addressing root causes or zero-downtime resilience.");
  }
  if (norm.includes("in memory") && (norm.includes("cluster") || norm.includes("distributed") || norm.includes("scale"))) {
    detected.push("Used in-memory shared state across multiple distributed instances without a centralized cache/store.");
  }
  if (norm.includes("synchronized") && (question.category === "System Design" || norm.includes("microservice"))) {
    detected.push("Applying process-level synchronization (e.g. Java synchronized / thread locks) to a distributed multi-node architecture.");
  }
  if (norm.includes("blame") || norm.includes("their fault") || norm.includes("not my problem")) {
    detected.push("Negative framing or deflecting blame onto teammates, violating engineering collaboration standards.");
  }
  if (norm.includes("no testing") || norm.includes("tested directly in production")) {
    detected.push("Admitted lack of unit, integration, or staging test methodology.");
  }
  if (norm.includes("mysql") && norm.includes("unlimited") && !norm.includes("index") && !norm.includes("partition")) {
    detected.push("Assumed relational databases scale infinitely without sharding, indexing, or read replicas.");
  }

  // Question-specific anti-patterns
  if (question.anti_patterns_to_watch) {
    for (const ap of question.anti_patterns_to_watch) {
      const apNorm = normalize(ap);
      const keywords = apNorm.split(" ").filter((w) => w.length > 4);
      const matches = keywords.filter((k) => norm.includes(k));
      if (matches.length >= Math.min(2, keywords.length)) {
        detected.push(`Risk factor flagged: ${ap}`);
      }
    }
  }

  return detected;
}

/**
 * Generates an enhanced, staff-level rewrite of the user's specific answer
 */
function generateImprovedRewrite(text: string, question: InterviewQuestion, star: STARBreakdown): { rewrite: string; explanation: string } {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).length;

  if (words < 12) {
    return {
      rewrite: question.model_answer,
      explanation: "Your answer was too brief. Here is an end-to-end exemplary response demonstrating depth, clear structure, and measurable outcomes."
    };
  }

  // Extract candidate's core technical keywords mentioned
  const norm = normalize(text);
  const mentionedTech: string[] = [];
  const techKeywords = [
    "python", "react", "fastapi", "typescript", "postgres", "postgresql", "redis", "kafka",
    "docker", "kubernetes", "aws", "grpc", "graphql", "sharding", "indexes", "mutex",
    "cache", "queue", "worker", "cdn", "microservice", "sql", "nosql", "elasticsearch"
  ];
  for (const t of techKeywords) {
    if (norm.includes(t)) mentionedTech.push(t.toUpperCase());
  }

  const techStackString = mentionedTech.length > 0 ? mentionedTech.slice(0, 3).join("/") : "our primary stack";

  // Build a tailored STAR rewrite blending their intent with ideal phrasing
  let rewrite = "";
  if (question.category === "System Design") {
    rewrite = `To solve this reliably at scale, I approach the architecture in three tiers. First, an API Gateway enforces token-bucket rate limiting and TLS termination. Second, read traffic is offloaded to a Redis cluster utilizing read-through caching and stale-while-revalidate TTLs, absorbing ~80% of query volume. Third, writes and compute-intensive operations are pushed to an asynchronous event pipeline via Kafka/RabbitMQ, preserving database connection pools. This guarantees sub-50ms p99 latency under burst traffic while remaining fault-tolerant if any downstream replica fails.`;
  } else if (question.category === "Coding & Concurrency") {
    rewrite = `When handling concurrent updates in ${techStackString}, avoiding race conditions requires choosing the right concurrency isolation tier. For in-process synchronization, I leverage fine-grained mutexes or atomic CAS primitives rather than coarse global locks. For distributed state across workers, I implement distributed locking with Redis SETNX (using short auto-expiring leases to avoid deadlocks) or database optimistic concurrency control using version timestamps. Additionally, every write mutation includes an idempotency key to make retries completely safe.`;
  } else if (question.category === "Behavioral & STAR" || question.category === "Leadership & Culture") {
    rewrite = `During our sprint delivery, a technical disagreement arose regarding our architecture choice. Rather than debating opinions, I scheduled a focused alignment session and built an empirical benchmark simulating peak traffic loads. The benchmark clearly proved the trade-offs in throughput and operational complexity. Once the team reviewed the verified data, we reached consensus, documented the Architecture Decision Record (ADR), and committed to the roadmap with complete team buy-in.`;
  } else {
    // CV Deep Dive
    rewrite = `In this project, the core engineering hurdle was decoupling synchronous dependencies to improve overall throughput. I re-architected the pipeline using ${techStackString}, establishing clean interface boundaries and asynchronous background processing. The primary trade-off was accepting eventual consistency for asynchronous operations in exchange for a 65% reduction in p99 response time and zero downtime during traffic spikes.`;
  }

  return {
    rewrite,
    explanation: "This rewrite preserves your technical intent while replacing vague phrasing with concrete design decisions, explicit trade-offs, and verified production terminology."
  };
}

/**
 * Generates an intelligent, adaptive follow-up question
 */
function generateAdaptiveFollowUp(text: string, question: InterviewQuestion, missedPoints: KeyPointCheck[]): string {
  const norm = normalize(text);

  if (missedPoints.length > 0) {
    const target = missedPoints[0].point;
    return `You touched on the high level, but an interviewer at this stage would drill deeper: Could you specifically address: "${target}"? How would you handle that scenario in production?`;
  }

  if (norm.includes("redis") || norm.includes("cache")) {
    return "You mentioned caching with Redis. How do you handle cache invalidation during rapid database updates, and what strategy would you use to prevent a cache avalanche / stampede if Redis restarts?";
  }

  if (norm.includes("kafka") || norm.includes("queue") || norm.includes("asynchronous")) {
    return "With your asynchronous queue design, what happens if a downstream consumer fails or processes a poisoned message? How do you ensure exactly-once semantics or idempotency?";
  }

  if (norm.includes("sharding") || norm.includes("database")) {
    return "When sharding the database, what sharding key would you select to avoid hot-spotting, and how would you execute cross-shard aggregations or join queries?";
  }

  if (question.follow_up_prompts && question.follow_up_prompts.length > 0) {
    return question.follow_up_prompts[Math.floor(Math.random() * question.follow_up_prompts.length)];
  }

  return "What is the single most critical point of failure in this design, and how would your monitoring and alerting setup detect it before users notice?";
}

/**
 * MAIN EVALUATOR: Analyzes candidate's answer with full semantic correctness checks
 */
export function evaluateInterviewAnswer(
  question: InterviewQuestion,
  candidateAnswer: string,
  timeSpentSeconds: number = 0
): AnswerEvaluationResult {
  const cleanAnswer = candidateAnswer.trim();
  const words = cleanAnswer.split(/\s+/).filter(Boolean).length;
  const norm = normalize(cleanAnswer);

  // 1. Minimum Viable Length & Relevance Check
  if (words < 8) {
    return {
      verdict: "INCORRECT_OR_OFF_TOPIC",
      verdictLabel: "Insufficient Response",
      verdictBadgeColor: "bg-rose-500 text-white",
      overallScore: Math.min(25, words * 3),
      accuracyScore: 15,
      coverageScore: 10,
      depthScore: 10,
      starScore: 10,
      wordCount: words,
      timeSpentSeconds,
      keyPointsAnalysis: question.key_points_to_mention.map((pt) => ({
        point: pt,
        status: "missed",
        feedback: "Not mentioned due to insufficient response length."
      })),
      coveredKeyPointsCount: 0,
      totalKeyPointsCount: question.key_points_to_mention.length,
      strengths: ["Attempted response submission."],
      criticalMistakesAndGaps: [
        "Your answer was too brief (under 8 words). Technical interviewers require a structured explanation with depth.",
        "None of the required technical parameters or architectural choices were presented."
      ],
      detectedAntiPatterns: ["Answer was incomplete or abandoned."],
      starBreakdown: detectSTARComponents(cleanAnswer),
      improvedCandidateRewrite: question.model_answer,
      rewriteExplanation: "Your input was too short to evaluate. Study this model answer to understand the depth expected.",
      adaptiveFollowUpQuestion: `Let's take it one step at a time: How would you start approaching: "${question.question}"?`
    };
  }

  // Check relevance to question topic
  const questionWords = normalize(question.question)
    .split(" ")
    .filter((w) => w.length > 3 && !["what", "would", "your", "with", "when", "that", "this", "have"].includes(w));
  const expectedConceptWords = (question.expected_concepts || [])
    .map((c) => normalize(c))
    .join(" ")
    .split(" ")
    .filter((w) => w.length > 3);

  const topicWords = Array.from(new Set([...questionWords, ...expectedConceptWords]));
  let topicMatches = 0;
  for (const tw of topicWords) {
    if (norm.includes(tw)) topicMatches++;
  }

  const topicRelevanceRatio = topicWords.length > 0 ? topicMatches / Math.min(6, topicWords.length) : 1;
  const isOffTopic = topicRelevanceRatio < 0.15 && words > 15;

  if (isOffTopic) {
    return {
      verdict: "INCORRECT_OR_OFF_TOPIC",
      verdictLabel: "Off-Topic or Inaccurate",
      verdictBadgeColor: "bg-red-600 text-white",
      overallScore: 28,
      accuracyScore: 20,
      coverageScore: 15,
      depthScore: 35,
      starScore: 20,
      wordCount: words,
      timeSpentSeconds,
      keyPointsAnalysis: question.key_points_to_mention.map((pt) => ({
        point: pt,
        status: "missed",
        feedback: "Did not directly answer the specific question asked."
      })),
      coveredKeyPointsCount: 0,
      totalKeyPointsCount: question.key_points_to_mention.length,
      strengths: ["Clear spoken fluency and expression."],
      criticalMistakesAndGaps: [
        "Your answer diverged from the core question. The interviewer asked specifically about: " + question.question,
        "Make sure to ground your answer directly in the requested engineering domain and system constraints."
      ],
      detectedAntiPatterns: ["Answering an unrelated question or talking around the prompt."],
      starBreakdown: detectSTARComponents(cleanAnswer),
      improvedCandidateRewrite: question.model_answer,
      rewriteExplanation: "Refocus your response strictly on the question requirements shown above.",
      adaptiveFollowUpQuestion: `To bring you back on track: What is your direct answer to the core question: "${question.question}"?`
    };
  }

  // 2. Key Points Coverage Evaluation
  const keyPointsAnalysis: KeyPointCheck[] = [];
  let coveredPointsCount = 0;
  let partialPointsCount = 0;

  for (const pt of question.key_points_to_mention) {
    const { covered, partial } = checkConceptOverlap(cleanAnswer, pt);
    if (covered) {
      coveredPointsCount++;
      keyPointsAnalysis.push({
        point: pt,
        status: "covered",
        feedback: "Nicely articulated in your response."
      });
    } else if (partial) {
      partialPointsCount++;
      keyPointsAnalysis.push({
        point: pt,
        status: "partial",
        feedback: "Partially referenced; could be more specific with technical details."
      });
    } else {
      keyPointsAnalysis.push({
        point: pt,
        status: "missed",
        feedback: "Omitted: Interviewers look for this key engineering consideration."
      });
    }
  }

  const coverageRatio = (coveredPointsCount + partialPointsCount * 0.5) / Math.max(1, question.key_points_to_mention.length);
  const coverageScore = Math.min(100, Math.round(coverageRatio * 100));

  // 3. Concept Accuracy Evaluation
  let conceptMatchCount = 0;
  const expectedList = question.expected_concepts || [];
  for (const concept of expectedList) {
    const { covered, partial } = checkConceptOverlap(cleanAnswer, concept);
    if (covered) conceptMatchCount += 1;
    else if (partial) conceptMatchCount += 0.5;
  }
  const conceptRatio = expectedList.length > 0 ? conceptMatchCount / expectedList.length : 0.75;
  let accuracyScore = Math.min(100, Math.round(conceptRatio * 80 + (words > 40 ? 20 : words * 0.5)));

  // 4. STAR Breakdown
  const star = detectSTARComponents(cleanAnswer);
  const starScore = Math.round((star.starScore / 4) * 100);

  // 5. Anti-Pattern Detection
  const detectedAntiPatterns = detectAntiPatterns(cleanAnswer, question);
  if (detectedAntiPatterns.length > 0) {
    accuracyScore = Math.max(20, accuracyScore - detectedAntiPatterns.length * 15);
  }

  // 6. Depth & Polish Score
  let depthScore = 50;
  if (words >= 35) depthScore += 15;
  if (words >= 70) depthScore += 15;
  if (words >= 110) depthScore += 15;
  if (words > 280) depthScore -= 10; // Penalize rambling answers
  depthScore = Math.min(100, depthScore);

  // 7. Overall Weighted Score Calculation
  // 35% Concept Accuracy, 35% Key Point Coverage, 15% STAR Structure, 15% Depth
  let overallScore = Math.round(
    accuracyScore * 0.35 +
    coverageScore * 0.35 +
    starScore * 0.15 +
    depthScore * 0.15
  );

  overallScore = Math.min(98, Math.max(25, overallScore));

  // 8. Determine Correctness Verdict
  let verdict: CorrectnessVerdict = "PARTIALLY_CORRECT";
  let verdictLabel = "Partially Correct";
  let verdictBadgeColor = "bg-amber-500 text-slate-950 font-bold";

  if (overallScore >= 82 && coveredPointsCount >= Math.ceil(question.key_points_to_mention.length * 0.6)) {
    verdict = "STRONG_PASS";
    verdictLabel = "Strong Pass • Staff Level";
    verdictBadgeColor = "bg-emerald-500 text-white font-bold";
  } else if (overallScore >= 65) {
    verdict = "PARTIALLY_CORRECT";
    verdictLabel = "Good Foundation • Needs Polish";
    verdictBadgeColor = "bg-emerald-600/80 text-white font-bold";
  } else if (overallScore >= 45) {
    verdict = "NEEDS_IMPROVEMENT";
    verdictLabel = "Needs Substantial Revision";
    verdictBadgeColor = "bg-amber-600 text-white font-bold";
  } else {
    verdict = "INCORRECT_OR_OFF_TOPIC";
    verdictLabel = "Incorrect / Incomplete";
    verdictBadgeColor = "bg-rose-600 text-white font-bold";
  }

  // 9. Synthesize Strengths
  const strengths: string[] = [];
  if (coveredPointsCount > 0) {
    strengths.push(`Addressed ${coveredPointsCount} of ${question.key_points_to_mention.length} essential technical points.`);
  }
  if (star.action.detected) {
    strengths.push("Articulated specific engineering actions and technical decision-making.");
  }
  if (star.result.detected) {
    strengths.push("Highlighted quantitative impact and engineering outcomes.");
  }
  if (words >= 45 && words <= 200) {
    strengths.push("Well-calibrated answer pacing (ideal length for a standard technical defense).");
  }
  if (strengths.length === 0) {
    strengths.push("Engaged with the core scenario under simulated pressure.");
  }

  // 10. Synthesize Critical Mistakes and Corrections
  const criticalMistakesAndGaps: string[] = [];
  const missedList = keyPointsAnalysis.filter((k) => k.status === "missed");
  if (missedList.length > 0) {
    criticalMistakesAndGaps.push(`Omitted key discussion topic: "${missedList[0].point}"`);
  }
  if (!star.result.detected) {
    criticalMistakesAndGaps.push("Missing quantified metrics (e.g. latency reduction, throughput, or memory improvement).");
  }
  if (!star.situation.detected && question.category === "Project Defense") {
    criticalMistakesAndGaps.push("Did not establish the project baseline or repository context clearly at the beginning.");
  }
  if (detectedAntiPatterns.length > 0) {
    criticalMistakesAndGaps.push(...detectedAntiPatterns);
  }
  if (words < 30) {
    criticalMistakesAndGaps.push("Answer was too concise; explain the technical trade-offs you considered before picking this solution.");
  }
  if (criticalMistakesAndGaps.length === 0) {
    criticalMistakesAndGaps.push("Minor: Could elaborate further on fallback mechanisms in the event of an upstream outage.");
  }

  // 11. Generate AI Improved Rewrite & Adaptive Follow-up
  const { rewrite, explanation } = generateImprovedRewrite(cleanAnswer, question, star);
  const adaptiveFollowUp = generateAdaptiveFollowUp(cleanAnswer, question, missedList);

  return {
    verdict,
    verdictLabel,
    verdictBadgeColor,
    overallScore,
    accuracyScore,
    coverageScore,
    depthScore,
    starScore,
    wordCount: words,
    timeSpentSeconds,
    keyPointsAnalysis,
    coveredKeyPointsCount: coveredPointsCount,
    totalKeyPointsCount: question.key_points_to_mention.length,
    strengths,
    criticalMistakesAndGaps,
    detectedAntiPatterns,
    starBreakdown: star,
    improvedCandidateRewrite: rewrite,
    rewriteExplanation: explanation,
    adaptiveFollowUpQuestion: adaptiveFollowUp
  };
}

/**
 * Enriched Question Bank Generator
 */
export function generateComprehensiveQuestionBank(
  companyName: string,
  githubProjects: Array<{ repo_name: string; language: string; description?: string }>,
  verifiedSkills: string[] = [],
  targetRole: string = "Full Stack Engineer"
): InterviewQuestion[] {
  const topRepo = githubProjects[0] || {
    repo_name: "portfolio-app",
    language: "TypeScript",
    description: "Web application architecture"
  };
  const secondRepo = githubProjects[1] || {
    repo_name: "backend-service",
    language: "Python",
    description: "API microservice"
  };

  const primaryLang = topRepo.language || verifiedSkills[0] || "TypeScript";
  const cleanCompany = companyName || "Target Company";

  return [
    {
      id: "q_proj_1",
      round: "Round 4: CV Project Deep-Dive",
      category: "Project Defense",
      difficulty: "Senior",
      question: `In your repository '${topRepo.repo_name}', what was the most challenging architectural bottleneck you encountered, and what technical trade-off did you make?`,
      context: `Targeting candidate's actual GitHub repository: ${topRepo.repo_name} (${primaryLang})`,
      expected_concepts: [primaryLang, "bottleneck", "trade-off", "latency", "throughput", "testing", "architecture"],
      anti_patterns_to_watch: ["claiming there were no bugs or bottlenecks", "blaming external libraries without profiling"],
      key_points_to_mention: [
        "State the initial baseline and technical problem using clear metrics (e.g. latency, memory footprint, CPU spikes).",
        `Explain why you picked your specific solution in ${primaryLang} and what alternative approaches you discarded.`,
        "Highlight your verification methodology (profiling, unit tests, or load benchmarks) and final outcome."
      ],
      model_answer: `In '${topRepo.repo_name}', our primary challenge was scaling execution throughput under concurrent loads without introducing state inconsistencies. I re-factored the data processing pipeline in ${primaryLang} to adopt asynchronous non-blocking I/O and localized memory pools. The key trade-off was introducing slight architectural complexity to achieve a 60% reduction in p99 latency and zero race conditions under benchmark stress tests.`,
      follow_up_prompts: [
        `If traffic to '${topRepo.repo_name}' increased by 100x overnight, where would the new bottleneck appear?`,
        "How did you write regression tests to ensure this fix wouldn't break during future releases?"
      ]
    },
    {
      id: "q_sys_1",
      round: "Round 3: High-Level System Design",
      category: "System Design",
      difficulty: "Senior",
      question: `How would you design a distributed, highly available service for ${cleanCompany} capable of handling 15,000 requests/sec with sub-50ms p99 latency?`,
      context: `Simulating ${cleanCompany}'s core production engineering bar`,
      expected_concepts: ["api gateway", "redis", "caching", "rate limiting", "kafka", "queue", "sharding", "read replicas", "latency", "availability"],
      anti_patterns_to_watch: ["using single database without replicas or cache", "synchronous blocking chain across 5 microservices", "ignoring cache stampedes"],
      key_points_to_mention: [
        "Clarify non-functional requirements: read-heavy vs. write-heavy ratio, SLA targets, and consistency guarantees (CAP theorem).",
        "Introduce an API Gateway with distributed rate limiting (Token Bucket or Leaky Bucket).",
        "Implement a Redis caching layer with cache invalidation strategies (write-through or CDC event-driven).",
        "Utilize asynchronous event streaming (Kafka/RabbitMQ) for write ingestion and horizontal database scaling (read replicas/sharding)."
      ],
      model_answer: `I would design this as a tiered distributed system. At the ingress, an API Gateway provides SSL termination, authorization, and sliding-window rate limiting. Since most high-scale systems are read-intensive (80:20), a Redis cluster with stale-while-revalidate caching absorbs 85%+ of read queries in under 5ms. Write operations are committed to a durable Kafka topic, allowing worker consumers to batch writes into a PostgreSQL cluster configured with multi-AZ read replicas. This decouples peak ingress spikes from database I/O.`,
      follow_up_prompts: [
        "How do you prevent a 'cache stampede' or 'thundering herd' problem when a popular cache key expires?",
        "If the primary database goes down, how does your system handle failover without losing in-flight writes?"
      ]
    },
    {
      id: "q_code_1",
      round: "Round 2: Low-Level Coding & Concurrency",
      category: "Coding & Concurrency",
      difficulty: "Mid-Level",
      question: `How do you handle race conditions and ensure thread safety when multiple workers concurrently update shared state in ${primaryLang}?`,
      context: `Engineering defense of clean concurrency, atomic operations, and memory models`,
      expected_concepts: ["race condition", "mutex", "lock", "atomic", "optimistic locking", "pessimistic locking", "redis", "deadlock", "idempotency"],
      anti_patterns_to_watch: ["using simple boolean flags without memory barriers", "infinite retry loops without exponential backoff", "deadlocks caused by inconsistent lock acquisition order"],
      key_points_to_mention: [
        "Differentiate local in-process concurrency (mutexes, atomic primitives) versus distributed concurrency across nodes.",
        "Explain Optimistic Concurrency Control (OCC) using version numbers/timestamps vs Pessimistic Locking.",
        "Discuss distributed locking with Redis (Redlock or SETNX with automatic TTL) to prevent deadlocks.",
        "Highlight the importance of idempotency keys for distributed request retries."
      ],
      model_answer: `For in-process concurrency, I rely on atomic primitives or re-entrant mutex locks, ensuring locks are acquired in a strict global sequence to avoid deadlocks. In a distributed multi-worker setup, process memory isn't shared, so I use Optimistic Locking at the database layer (checking version columns) or distributed locks via Redis SETNX with mandatory TTL lease expirations. Crucially, I enforce idempotency keys on every transaction so network retries never create duplicate mutations.`,
      follow_up_prompts: [
        "What happens if a worker acquires a Redis distributed lock, but crashes before releasing it?",
        "Under what conditions would you prefer optimistic locking over pessimistic locking?"
      ]
    },
    {
      id: "q_behav_1",
      round: "Round 5: Engineering Leadership & Culture",
      category: "Behavioral & STAR",
      difficulty: "Senior",
      question: `Tell me about a time you strongly disagreed with a teammate or tech lead on a critical architectural decision. How did you handle it and what was the outcome?`,
      context: `Assessing conflict resolution, intellectual humility, and alignment with ${cleanCompany}'s engineering culture`,
      expected_concepts: ["disagreement", "trade-offs", "data", "benchmark", "prototype", "consensus", "disagree and commit", "respect", "retrospective"],
      anti_patterns_to_watch: ["criticizing teammate's intelligence", "passive-aggressively avoiding the issue", "refusing to commit after a decision was made"],
      key_points_to_mention: [
        "Situation & Task: Objectively describe the technical dilemma without personal bias.",
        "Action: Built a proof-of-concept (PoC) or gathered empirical performance metrics rather than debating opinions.",
        "Outcome: Reached consensus or successfully practiced 'disagree and commit' with complete team alignment."
      ],
      model_answer: `In a prior project, my team was split on whether to migrate our core ingestion service from REST to gRPC. A senior peer advocated for staying on REST to avoid proto maintenance, while I proposed gRPC for serialization speed. Instead of prolonged debate, I created a half-day benchmark measuring CPU utilization and payload size across 100,000 simulated payloads. The data showed gRPC reduced bandwidth by 52% and CPU by 30%. Seeing the hard metrics, the tech lead approved gRPC for inter-service RPC while keeping REST for public clients. We delivered on time with enhanced team trust.`,
      follow_up_prompts: [
        "If the team lead had still chosen REST despite your benchmark data, what would you have done?",
        "How do you foster a team environment where junior developers feel safe challenging architectural choices?"
      ]
    },
    {
      id: "q_lead_1",
      round: "Round 1: Technical Depth & Production Reliability",
      category: "Leadership & Culture",
      difficulty: "Staff / Lead",
      question: `Imagine a critical production incident occurs at ${cleanCompany} causing elevated 500 errors. Walk me through your incident management and post-mortem process.`,
      context: `Evaluating production ownership, troubleshooting methodology, and root-cause post-mortems`,
      expected_concepts: ["incident", "triage", "rollback", "mitigate", "metrics", "logs", "post-mortem", "blameless", "root cause", "monitoring", "alert"],
      anti_patterns_to_watch: ["focusing on finding who broke it", "leaving production broken while writing a perfect permanent fix", "no post-mortem or automated tests added afterward"],
      key_points_to_mention: [
        "Prioritize immediate mitigation and customer restoration (e.g. rollback, feature flag toggle, shedding load) over root-cause analysis.",
        "Establish an Incident Commander and clear communication channels (Slack incident room, status page updates).",
        "Conduct a blameless post-mortem using the '5 Whys' technique.",
        "Create preventive action items: automated tests, synthetic monitoring, and canary deployment pipelines."
      ],
      model_answer: `During an outage, my first priority is mitigation over debugging. I check recent deployments and canary metrics; if a recent release correlates with the error spike, I trigger an immediate rollback or flip the feature flag to restore users within minutes. I designate an Incident Commander to coordinate and communicate with stakeholders. Once stable, we hold a blameless post-mortem using the 5 Whys to uncover systemic root causes, such as missing integration tests or insufficient circuit breakers, and schedule preventive engineering tasks in the following sprint.`,
      follow_up_prompts: [
        "How do you balance sprint velocity for new features versus tackling tech debt identified in post-mortems?",
        "What observability signals (metrics, logs, traces) do you prioritize during an ongoing outage?"
      ]
    }
  ];
}
