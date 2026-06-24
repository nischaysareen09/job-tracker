import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def generate_cover_letter(job_description: str, resume_text: str, company: str, role: str) -> str:
    prompt = f"""You are an expert career coach. Write a professional, compelling cover letter.

Company: {company}
Role: {role}

Job Description:
{job_description}

Candidate's Resume:
{resume_text}

Write a 3-paragraph cover letter that:
1. Opens with a strong hook mentioning the specific role and company
2. Highlights 2-3 relevant experiences/skills that match the JD
3. Closes with enthusiasm and a call to action

Return only the cover letter text, no extra commentary."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=800,
    )
    return response.choices[0].message.content


def score_resume_match(job_description: str, resume_text: str) -> dict:
    prompt = f"""You are an expert technical recruiter. Analyze how well this resume matches the job description.

Job Description:
{job_description}

Resume:
{resume_text}

Respond in this exact JSON format (no markdown, no extra text):
{{
  "score": <integer 0-100>,
  "analysis": "<2-3 sentence overall summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"]
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500,
    )

    import json
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())