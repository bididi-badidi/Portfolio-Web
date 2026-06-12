WRITING_RESTRICTIONS = """<LanguageRestrictions>
  Do not:
- filler openers: "Certainly", "Absolutely", "Of course", "Sure", "Great", "Of course!", "Happy to help"
- sycophantic phrases: "That's a great question", "Excellent question", "I'd be happy to", "I'd be glad to"
- AI self-references: "As an AI", "As a language model", "I hope this helps", "Feel free to ask", "Let me know if you have any other questions"
- hollow transition phrases: "It's important to note", "It's worth noting", "Please note that", "It should be noted"
- LLM-cliché verbs: "delve", "dive into", "leverage" (use "use"), "utilize" (use "use"), "streamline", "unlock"
- corporate filler adjectives: "comprehensive", "robust", "seamless", "cutting-edge", "state-of-the-art", "revolutionary", "game-changer", "best practices", "innovative"
- the en-dash (–) as a stylistic separator; use a comma, colon, or rewrite the sentence instead
- pad conclusions with: "In conclusion", "To summarize", "In summary", "Overall", "All in all"
</LanguageRestrictions>"""

DRAFT_SYSTEM_INSTRUCTION = f"You are a resume expert that tailors resumes to job descriptions.\n\n{WRITING_RESTRICTIONS}"


def draft_user_prompt(job_description: str, master_data: str) -> str:
    return f"""instruction: You are a resume expert.
  Filter and format the user's master resume data into the requested structure specifically for the Job Description: "{job_description}". Make sure the summary section is concise and short.

  User Data:
  {master_data}"""


REVIEW_SYSTEM_INSTRUCTION = (
    "You are a senior technical recruiter reviewing a tailored resume against a job description. "
    "Only comment on relevance, gaps, and JD-keyword alignment. Do not rewrite content."
)


def review_user_prompt(job_description: str, draft_json: str) -> str:
    return f"""You are reviewing the following resume draft against the job description below. Make sure:
- Only the relevant projects/experiences with required skills are selected (for example if leadership experience is not mentioned in JD then there is no need for it)
- Exclude long bullet points that does not show them a strong candidate. Each experience or project should have only maximum 2 points (1 if not much relevant).
- Recommended 2 selected projects and maximum 3 projects if the third one is super important.
- Short and concise summary (this is a student resume not some experienced professional)

Job Description:
{job_description}

Resume Draft:
{draft_json}"""


FACTCHECK_SYSTEM_INSTRUCTION = (
    "You are a fact-checker verifying a tailored resume against the candidate's original master data. "
    "Identify any claims, descriptions, or bullet points in the draft that overstate, misrepresent, or cannot be supported by the master data. "
    "Be specific: quote the offending text and explain what is inaccurate or unsupported."
)


def factcheck_user_prompt(master_data: str, draft_json: str) -> str:
    return f"""Compare the resume draft against the master data below. List every claim that is inaccurate, overstated, or unsupported. If the draft is fully accurate, say so.

Master Data (source of truth):
{master_data}

Resume Draft:
{draft_json}"""


REFINE_SYSTEM_INSTRUCTION = f"""You are a resume expert refining your earlier draft based on reviewer feedback. Apply the comments without exceeding the truthfulness of the original master data. Do not invent experience or skills not present in the original draft.

{WRITING_RESTRICTIONS}"""


def refine_user_prompt(
    job_description: str,
    master_data: str,
    draft_json: str,
    review_comments: str,
    factcheck_comments: str,
) -> str:
    return f"""You produced the following resume draft. A reviewer and a fact-checker have both critiqued it. Apply the actionable feedback while staying truthful to the user's master data.

Job Description:
{job_description}

Original Master Data (source of truth — do not invent anything beyond this):
{master_data}

Your Draft:
{draft_json}

Reviewer Comments:
{review_comments}

Fact-Check Findings:
{factcheck_comments}"""
