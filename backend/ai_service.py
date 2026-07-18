import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def generate_cover_letter(job_description: str, resume_text: str, company: str, role: str) -> str:
    prompt = f"""You are an expert career coach. Write a professional, compelling cover letter.

Company: {company}
Role: {role}

Job Description:
{job_description}

Candidate Resume:
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

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def generate_interview_questions(job_description: str, resume_text: str, role: str, company: str) -> dict:
    prompt = f"""You are an expert technical interviewer at {company}. Generate interview questions for this role.

Role: {role}
Company: {company}

Job Description:
{job_description}

Candidate Resume:
{resume_text}

Generate exactly this JSON (no markdown, no extra text):
{{
  "technical": [
    {{"question": "...", "ideal_answer": "...", "difficulty": "easy"}},
    {{"question": "...", "ideal_answer": "...", "difficulty": "medium"}},
    {{"question": "...", "ideal_answer": "...", "difficulty": "medium"}},
    {{"question": "...", "ideal_answer": "...", "difficulty": "hard"}},
    {{"question": "...", "ideal_answer": "...", "difficulty": "hard"}}
  ],
  "behavioral": [
    {{"question": "...", "ideal_answer": "...", "tip": "..."}},
    {{"question": "...", "ideal_answer": "...", "tip": "..."}},
    {{"question": "...", "ideal_answer": "...", "tip": "..."}}
  ],
  "role_specific": [
    {{"question": "...", "ideal_answer": "..."}},
    {{"question": "...", "ideal_answer": "..."}}
  ]
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def generate_followup_email(company: str, role: str, days_since_applied: int, recruiter_name: str = "") -> dict:
    prompt = f"""You are a career coach. Write a professional follow-up email for a job application.

Company: {company}
Role: {role}
Days since applied: {days_since_applied}
Recruiter name: {recruiter_name if recruiter_name else "Unknown"}

Write a concise, professional follow-up email. Return only JSON (no markdown):
{{
  "subject": "...",
  "body": "..."
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=400,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def run_agent(user_message: str, applications: list, conversation_history: list) -> dict:
    """
    AI Agent with tool calling. The agent can:
    - analyze_applications: Look at all job applications and give insights
    - get_application_details: Get details of a specific application
    - generate_cover_letter: Generate a cover letter for a specific job
    - score_resume: Score resume against a job description
    - generate_interview_questions: Generate interview prep questions
    - generate_followup_email: Generate a follow-up email
    - prioritize_applications: Recommend which applications to focus on
    """

    tools = [
        {
            "type": "function",
            "function": {
                "name": "analyze_applications",
                "description": "Analyze all job applications and provide insights, statistics, and recommendations",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_application_details",
                "description": "Get detailed information about a specific job application by company name",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "company": {
                            "type": "string",
                            "description": "The company name to look up"
                        }
                    },
                    "required": ["company"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "generate_cover_letter_for_job",
                "description": "Generate a tailored cover letter for a specific job application",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "company": {"type": "string", "description": "Company name"},
                        "resume_text": {"type": "string", "description": "The candidate resume text"}
                    },
                    "required": ["company", "resume_text"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "score_resume_for_job",
                "description": "Score how well a resume matches a specific job",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "company": {"type": "string"},
                        "resume_text": {"type": "string"}
                    },
                    "required": ["company", "resume_text"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "prepare_for_interview",
                "description": "Generate interview preparation questions for a specific company",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "company": {"type": "string"},
                        "resume_text": {"type": "string", "description": "Optional resume text for personalization"}
                    },
                    "required": ["company"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "generate_followup_for_job",
                "description": "Generate a follow-up email for a specific job application",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "company": {"type": "string"}
                    },
                    "required": ["company"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "prioritize_applications",
                "description": "Analyze all applications and recommend which ones to focus on, follow up with, or prepare for",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        }
    ]

    # System prompt with context
    apps_summary = json.dumps([{
        "company": a.get("company"),
        "role": a.get("role"),
        "status": a.get("status"),
        "location": a.get("location"),
        "applied_date": str(a.get("applied_date", "")),
        "match_score": a.get("match_score"),
        "has_cover_letter": bool(a.get("cover_letter")),
        "has_jd": bool(a.get("job_description")),
    } for a in applications], indent=2)

    system_prompt = f"""You are JobBot, an intelligent AI career assistant built into JobTracker. You help users manage their job search strategically.

You have access to the user's job applications:
{apps_summary}

You can use tools to help the user. Be proactive — if they ask to prepare for an interview, also offer to score their resume. If they ask about follow-ups, check which applications need attention.

Be conversational, encouraging, and specific. Always reference actual company names and data from their applications. Keep responses concise but actionable."""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history[-10:])  # last 10 messages for context
    messages.append({"role": "user", "content": user_message})

    # First LLM call - may use tools
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=0.6,
        max_tokens=1000,
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    # Process tool calls
    tool_results = []
    if tool_calls:
        messages.append(response_message)

        for tool_call in tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)
            result = ""

            if fn_name == "analyze_applications":
                total = len(applications)
                by_status = {}
                for a in applications:
                    s = a.get("status", "Unknown")
                    by_status[s] = by_status.get(s, 0) + 1
                result = json.dumps({
                    "total": total,
                    "by_status": by_status,
                    "with_match_score": len([a for a in applications if a.get("match_score")]),
                    "with_cover_letter": len([a for a in applications if a.get("cover_letter")]),
                    "applications": [{
                        "company": a.get("company"),
                        "role": a.get("role"),
                        "status": a.get("status")
                    } for a in applications]
                })

            elif fn_name == "get_application_details":
                company = fn_args.get("company", "").lower()
                app = next((a for a in applications if a.get("company", "").lower() == company), None)
                if app:
                    result = json.dumps(app)
                else:
                    result = json.dumps({"error": f"No application found for {fn_args.get('company')}"})

            elif fn_name == "generate_cover_letter_for_job":
                company = fn_args.get("company", "").lower()
                resume_text = fn_args.get("resume_text", "")
                app = next((a for a in applications if a.get("company", "").lower() == company), None)
                if app and app.get("job_description"):
                    letter = generate_cover_letter(
                        app["job_description"], resume_text,
                        app["company"], app["role"]
                    )
                    result = json.dumps({"cover_letter": letter})
                else:
                    result = json.dumps({"error": "Application not found or missing job description"})

            elif fn_name == "score_resume_for_job":
                company = fn_args.get("company", "").lower()
                resume_text = fn_args.get("resume_text", "")
                app = next((a for a in applications if a.get("company", "").lower() == company), None)
                if app and app.get("job_description") and resume_text:
                    score_result = score_resume_match(app["job_description"], resume_text)
                    result = json.dumps(score_result)
                else:
                    result = json.dumps({"error": "Application not found, missing JD, or no resume provided"})

            elif fn_name == "prepare_for_interview":
                company = fn_args.get("company", "").lower()
                resume_text = fn_args.get("resume_text", "")
                app = next((a for a in applications if a.get("company", "").lower() == company), None)
                if app:
                    questions = generate_interview_questions(
                        app.get("job_description", ""),
                        resume_text,
                        app["role"],
                        app["company"]
                    )
                    result = json.dumps(questions)
                else:
                    result = json.dumps({"error": f"No application found for {fn_args.get('company')}"})

            elif fn_name == "generate_followup_for_job":
                company = fn_args.get("company", "").lower()
                app = next((a for a in applications if a.get("company", "").lower() == company), None)
                if app:
                    from datetime import datetime
                    applied_date = app.get("applied_date")
                    days = 0
                    if applied_date:
                        try:
                            d = datetime.fromisoformat(str(applied_date).replace("Z", ""))
                            days = (datetime.utcnow() - d).days
                        except:
                            days = 7
                    email = generate_followup_email(app["company"], app["role"], days)
                    result = json.dumps(email)
                else:
                    result = json.dumps({"error": f"No application found for {fn_args.get('company')}"})

            elif fn_name == "prioritize_applications":
                from datetime import datetime
                today = datetime.utcnow()
                priorities = []
                for a in applications:
                    score = 0
                    reasons = []
                    if a.get("status") == "Interviewing":
                        score += 10
                        reasons.append("Interview in progress")
                    if a.get("status") == "Applied":
                        applied_date = a.get("applied_date")
                        if applied_date:
                            try:
                                d = datetime.fromisoformat(str(applied_date).replace("Z", ""))
                                days = (today - d).days
                                if days >= 7:
                                    score += 5
                                    reasons.append(f"Applied {days} days ago - follow up needed")
                            except:
                                pass
                    if a.get("match_score") and a["match_score"] >= 70:
                        score += 3
                        reasons.append(f"High match score ({a['match_score']}%)")
                    if not a.get("cover_letter"):
                        reasons.append("No cover letter yet")
                    priorities.append({
                        "company": a.get("company"),
                        "role": a.get("role"),
                        "status": a.get("status"),
                        "priority_score": score,
                        "action_items": reasons
                    })
                priorities.sort(key=lambda x: x["priority_score"], reverse=True)
                result = json.dumps({"priorities": priorities})

            tool_results.append({
                "tool_call_id": tool_call.id,
                "fn_name": fn_name,
                "result": result
            })

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result
            })

    # Final response
    final_response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.6,
        max_tokens=1500,
    )

    return {
        "message": final_response.choices[0].message.content,
        "tools_used": [t["fn_name"] for t in tool_results]
    }