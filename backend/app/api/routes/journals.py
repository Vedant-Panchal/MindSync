import asyncio
from collections import Counter
from turtle import st
from typing import Optional
from uuid import uuid4
from fastapi import APIRouter, Request, status
from datetime import date, datetime, timedelta

from fastapi.encoders import jsonable_encoder
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import MODEL_VECTOR
from app.core.exceptions import APIException
from app.db.schemas.journal import DraftRequest
from app.core.connection import db
from loguru import logger

from app.utils.otp_utils import store_draft
from app.utils.utils import (
    aggregate_journal,
    analyze_mood,
    direct_embedding,
    generate_embedding,
    insert_journal,
    insert_journal_section,
    pre_process_journal,
    process_draft_chunk,
    submit_draft,
)
from app.utils.chatbot_utils import (
    get_journals_by_date,
)
from app.utils.seed import generate_journal_content

router = APIRouter()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=20)
JOURNAL_THEMES = [
    # Academic & Learning (Days 1-50)
    "My first day studying computer science",
    "The programming language that changed my perspective",
    "A debugging session that taught me patience",
    "My biggest coding mistake and what I learned",
    "The algorithm that finally clicked for me",
    "Comparing my coding style from freshman year to now",
    "A professor who inspired my CS journey",
    "The moment I realized I loved problem-solving",
    "My experience with my first group programming project",
    "The data structure that confused me the most",
    "How I stay motivated during difficult coursework",
    "My study routine for technical interviews",
    "The programming concept I wish I learned earlier",
    "A time when Stack Overflow saved my project",
    "My relationship with math in computer science",
    "The difference between theory and practice in CS",
    "How I approach learning new technologies",
    "My experience with different IDEs and editors",
    "The coding bootcamp vs. degree debate from my perspective",
    "A CS concept that seemed impossible but I conquered",
    "How I manage technical debt in my projects",
    "My first encounter with version control",
    "The importance of commenting and documentation",
    "A time when I had to explain code to a non-programmer",
    "My evolution from copy-paste to understanding",
    "The role of creativity in programming",
    "How I deal with imposter syndrome in CS",
    "My experience with online coding challenges",
    "The programming paradigm that changed my thinking",
    "A time when I helped a classmate understand a concept",
    "My relationship with computer science theory",
    "The moment I realized programming is an art",
    "How I balance breadth vs. depth in learning",
    "My experience with different operating systems",
    "The debugging technique that became my go-to",
    "A time when I refactored code and felt proud",
    "My thoughts on the future of programming languages",
    "How I approach complex algorithmic problems",
    "The CS elective that surprised me the most",
    "My experience with pair programming",
    "A time when I had to learn something completely new",
    "The role of patience in becoming a better programmer",
    "How I've grown as a logical thinker",
    "My experience with technical writing",
    "The CS concept that connects to my other interests",
    "A time when I solved a problem in an elegant way",
    "How I handle pressure during coding exams",
    "My thoughts on the importance of CS fundamentals",
    "The programming project I'm most proud of",
    "How CS has changed my approach to problem-solving",
    # Projects & Development (Days 51-100)
    "My first 'Hello World' program and how it felt",
    "The side project that taught me the most",
    "A time when my code worked on the first try",
    "My experience building my first web application",
    "The open-source project I contributed to",
    "A project that seemed impossible but I completed",
    "How I choose technologies for personal projects",
    "My experience with mobile app development",
    "The game development project that challenged me",
    "A time when I had to scrap a project and start over",
    "My first experience with databases",
    "The API integration that frustrated me most",
    "How I approach planning a new project",
    "My experience with testing and quality assurance",
    "A project that taught me about user experience",
    "The time I deployed my first application",
    "My experience with agile development methodologies",
    "A coding challenge that stumped me for days",
    "How I manage project scope creep",
    "My experience with machine learning projects",
    "The security vulnerability I discovered in my code",
    "A time when I had to optimize for performance",
    "My experience building a portfolio website",
    "The project that taught me about scalability",
    "How I handle project deadlines and time management",
    "My experience with different database technologies",
    "A time when I had to integrate multiple APIs",
    "The project that required learning new frameworks",
    "My experience with cloud computing platforms",
    "A hackathon project and what I learned",
    "How I approach code reviews and feedback",
    "My experience with continuous integration",
    "The project that taught me about error handling",
    "A time when I had to work with legacy code",
    "My experience with microservices architecture",
    "The data visualization project that excited me",
    "How I balance feature development with bug fixes",
    "My experience with real-time applications",
    "A project that taught me about user authentication",
    "The time I had to reverse-engineer something",
    "My experience with different development environments",
    "A project that required working with external APIs",
    "How I approach documentation for my projects",
    "My experience with DevOps and deployment",
    "The project that taught me about data structures",
    "A time when I had to optimize database queries",
    "My experience with responsive web design",
    "The project that required learning about networking",
    "How I handle project maintenance and updates",
    "A project that taught me the value of good architecture",
    # Career & Professional Development (Days 101-150)
    "My vision for my career in 5 years",
    "The tech company I dream of working for and why",
    "My experience with technical interviews",
    "How I network in the tech industry",
    "The programming language I want to master next",
    "My thoughts on specialization vs. being a generalist",
    "A professional mentor who has influenced me",
    "How I stay updated with technology trends",
    "My experience at tech meetups and conferences",
    "The certification I'm considering pursuing",
    "How I balance work-life balance in tech",
    "My thoughts on remote work vs. office culture",
    "The startup environment vs. big tech companies",
    "How I prepare for coding interviews",
    "My experience with LinkedIn and professional networking",
    "The side hustle or freelance work I'm considering",
    "How I showcase my skills to potential employers",
    "My thoughts on the importance of soft skills in tech",
    "The tech podcast or blog that influences me",
    "How I approach salary negotiations",
    "My experience with job applications and rejections",
    "The programming community I'm most active in",
    "How I contribute to open-source projects",
    "My thoughts on the importance of diversity in tech",
    "The tech leader I admire most and why",
    "How I handle feedback and criticism professionally",
    "My experience with performance reviews",
    "The skill gap I'm working to bridge",
    "How I approach continuing education in tech",
    "My thoughts on the gig economy for developers",
    "The conference or workshop I'd love to attend",
    "How I build and maintain professional relationships",
    "My experience with technical writing and blogging",
    "The role of personal branding in tech careers",
    "How I approach learning from senior developers",
    "My thoughts on the importance of code quality",
    "The tech trend I'm most excited about",
    "How I prepare for technical presentations",
    "My experience with peer code reviews",
    "The programming languages in demand I should learn",
    "How I approach building a professional portfolio",
    "My thoughts on the ethics of technology",
    "The tech company culture that appeals to me most",
    "How I handle impostor syndrome in professional settings",
    "My experience with technical documentation",
    "The programming paradigm I want to explore more",
    "How I approach learning new frameworks quickly",
    "My thoughts on the future of software development",
    "The tech skill that would make me more marketable",
    "How I plan to give back to the programming community",
    # Challenges & Problem Solving (Days 151-200)
    "The coding problem that kept me up all night",
    "A time when I had to learn a new language under pressure",
    "My experience with a particularly nasty bug",
    "How I approach problems I've never seen before",
    "The algorithm that took me weeks to understand",
    "A time when I questioned my ability to code",
    "My strategy for tackling complex system design",
    "The debugging session that taught me humility",
    "How I handle frustration when code doesn't work",
    "A time when I had to optimize slow-running code",
    "My experience with memory leaks and performance issues",
    "The concurrency problem that challenged my thinking",
    "How I approach learning from coding failures",
    "A time when I had to refactor someone else's code",
    "My experience with scaling application issues",
    "The security challenge that opened my eyes",
    "How I deal with changing requirements mid-project",
    "A time when I had to work with incomplete documentation",
    "My approach to learning from code reviews",
    "The integration problem that seemed impossible",
    "How I handle pressure during live debugging",
    "A time when I had to teach myself a new concept quickly",
    "My experience with production bugs and hotfixes",
    "The time complexity problem that stumped me",
    "How I approach debugging distributed systems",
    "A time when I had to work with legacy systems",
    "My experience with cross-platform compatibility issues",
    "The networking problem that challenged me",
    "How I handle situations where I don't know the answer",
    "A time when I had to balance multiple priorities",
    "My experience with data migration challenges",
    "The API design problem that taught me architecture",
    "How I approach learning from Stack Overflow answers",
    "A time when I had to work with unfamiliar technology",
    "My experience with browser compatibility issues",
    "The database performance problem that puzzled me",
    "How I handle imposter syndrome during challenges",
    "A time when I had to explain technical issues to non-technical people",
    "My experience with third-party library conflicts",
    "The caching problem that required creative solutions",
    "How I approach problems with multiple possible solutions",
    "A time when I had to work under tight deadlines",
    "My experience with environment-specific bugs",
    "The concurrency issue that taught me about race conditions",
    "How I handle technical debt in existing projects",
    "A time when I had to learn testing frameworks quickly",
    "My experience with deployment and configuration issues",
    "The performance bottleneck that required deep analysis",
    "How I approach complex business logic implementation",
    "A time when I had to balance perfectionism with practicality",
    # Technology & Innovation (Days 201-250)
    "The emerging technology that excites me most",
    "My thoughts on artificial intelligence and machine learning",
    "How blockchain technology might change software development",
    "The programming language that's gaining popularity",
    "My experience with cloud computing platforms",
    "The development framework that impressed me recently",
    "How I stay current with rapidly changing technologies",
    "My thoughts on the future of web development",
    "The mobile development trend I'm watching",
    "How virtual and augmented reality might impact programming",
    "My experience with Internet of Things (IoT) development",
    "The cybersecurity trend that concerns me most",
    "How edge computing is changing application architecture",
    "My thoughts on serverless computing",
    "The database technology that's revolutionizing data storage",
    "How quantum computing might affect programming",
    "My experience with progressive web applications",
    "The DevOps tool that has improved my workflow",
    "How containerization has changed deployment",
    "My thoughts on the rise of low-code/no-code platforms",
    "The API technology that's becoming standard",
    "How 5G technology might impact mobile development",
    "My experience with microservices architecture",
    "The monitoring and logging tool that opened my eyes",
    "How version control systems continue to evolve",
    "My thoughts on the future of programming languages",
    "The testing framework that changed my approach",
    "How automation is affecting software development",
    "My experience with infrastructure as code",
    "The machine learning framework I want to explore",
    "How real-time communication technologies are advancing",
    "My thoughts on the evolution of database systems",
    "The security technology that's becoming essential",
    "How headless architecture is changing web development",
    "My experience with event-driven programming",
    "The development tool that has boosted my productivity",
    "How GraphQL is changing API development",
    "My thoughts on the future of mobile applications",
    "The cloud service that has simplified my projects",
    "How Web3 and decentralized applications might evolve",
    "My experience with performance monitoring tools",
    "The collaborative development tool that's improved teamwork",
    "How artificial intelligence is assisting in coding",
    "My thoughts on the evolution of user interfaces",
    "The data processing technology that's transforming analytics",
    "How edge AI is changing application capabilities",
    "My experience with cross-platform development tools",
    "The streaming technology that's changing data processing",
    "How voice interfaces might impact software development",
    "The technology trend I think is overhyped",
    # Personal Growth & Reflection (Days 251-300)
    "How coding has changed my way of thinking",
    "The life lesson I've learned through programming",
    "How I've grown as a problem solver",
    "The personal project that taught me perseverance",
    "How failure in coding has made me stronger",
    "The moment I realized I think like a programmer",
    "How CS has influenced my approach to other subjects",
    "The coding achievement I'm most proud of",
    "How I've learned to embrace uncertainty in tech",
    "The programming concept that mirrors life philosophy",
    "How debugging has taught me patience",
    "The way coding has improved my logical thinking",
    "How I've learned to break down complex problems",
    "The programming principle that applies to daily life",
    "How I've grown from a novice to intermediate programmer",
    "The coding experience that built my confidence",
    "How I've learned to value continuous learning",
    "The programming challenge that taught me resilience",
    "How I've developed better communication skills through CS",
    "The coding project that pushed my creative boundaries",
    "How I've learned to embrace the iterative process",
    "The programming language that expanded my horizons",
    "How I've grown more comfortable with ambiguity",
    "The coding experience that taught me humility",
    "How I've learned to appreciate elegant solutions",
    "The programming community that welcomed me",
    "How I've developed better time management through coding",
    "The CS concept that changed my perspective on efficiency",
    "How I've learned to balance perfectionism with progress",
    "The coding experience that taught me collaboration",
    "How I've grown more analytical in my thinking",
    "The programming challenge that taught me adaptability",
    "How I've learned to find joy in solving problems",
    "The coding project that taught me about user empathy",
    "How I've developed better research skills through CS",
    "The programming experience that boosted my self-confidence",
    "How I've learned to appreciate the learning process",
    "The coding challenge that taught me about persistence",
    "How I've grown more curious about how things work",
    "The programming project that taught me about planning",
    "How I've learned to see patterns in complex systems",
    "The coding experience that taught me about attention to detail",
    "How I've developed better critical thinking skills",
    "The programming challenge that taught me resourcefulness",
    "How I've learned to embrace continuous improvement",
    "The coding project that taught me about documentation",
    "How I've grown more comfortable with experimentation",
    "The programming experience that taught me about teamwork",
    "How I've learned to appreciate feedback and criticism",
    "The coding journey that has shaped who I am today",
    # Community & Collaboration (Days 301-350)
    "My experience with the programming community",
    "A time when I helped a fellow CS student",
    "The coding mentor who guided my learning",
    "My experience with open-source collaboration",
    "A programming forum that has been invaluable",
    "The study group that improved my coding skills",
    "My experience teaching programming to others",
    "A time when collaboration led to a breakthrough",
    "The programming meetup that inspired me",
    "My experience with code review culture",
    "A time when I learned from a junior developer",
    "The online community that supports my learning",
    "My experience with hackathons and team coding",
    "A time when I had to mediate a technical disagreement",
    "The programming podcast that connects me to the community",
    "My experience with diversity and inclusion in tech",
    "A time when I learned from someone's different approach",
    "The coding bootcamp or workshop that broadened my network",
    "My experience with remote collaboration tools",
    "A time when I had to explain technical concepts to peers",
    "The programming blog that has influenced my thinking",
    "My experience with technical interview preparation groups",
    "A time when I learned from a failed group project",
    "The programming conference that expanded my horizons",
    "My experience with peer programming sessions",
    "A time when I had to adapt my communication style",
    "The tech Twitter community that keeps me informed",
    "My experience with cross-functional team collaboration",
    "A time when I learned from cultural differences in coding",
    "The programming Discord or Slack that supports me",
    "My experience with project management in team settings",
    "A time when I had to balance individual vs. team goals",
    "The coding YouTube channel that has taught me",
    "My experience with agile team ceremonies",
    "A time when I learned from a more experienced developer",
    "The tech book club that enhanced my understanding",
    "My experience with knowledge sharing sessions",
    "A time when I had to give technical feedback diplomatically",
    "The programming competition that taught me about teamwork",
    "My experience with inclusive coding practices",
    "A time when I learned from a project post-mortem",
    "The tech newsletter that keeps me connected",
    "My experience with onboarding new team members",
    "A time when I had to resolve a merge conflict diplomatically",
    "The programming workshop that built community",
    "My experience with technical documentation collaboration",
    "A time when I learned from a different programming culture",
    "The tech conference talk that changed my perspective",
    "My experience with cross-team technical discussions",
    "A time when I contributed to someone else's learning journey",
    # Future & Aspirations (Days 351-365)
    "Where I see myself in the tech industry in 10 years",
    "The programming language I want to create",
    "My dream contribution to the open-source community",
    "The tech startup idea I'm passionate about",
    "How I want to mentor future CS students",
    "The programming problem I hope to solve",
    "My vision for the future of software development",
    "The technology I hope to help develop",
    "How I want to impact the world through coding",
    "The programming conference I hope to speak at",
    "My dream job description in detail",
    "The coding legacy I want to leave behind",
    "How I plan to keep learning throughout my career",
    "The tech community I want to build or join",
    "My aspirations for work-life balance in tech",
]


@router.get("/get")
def get_all_journal(
    request: Request, start_date: Optional[date] = None, end_date: Optional[date] = None
):
    try:
        user = getattr(request.state, "user", None)
        if start_date and end_date:
            response = get_journals_by_date(user["id"], start_date, end_date)
        elif start_date and not end_date:
            response = get_journals_by_date(user["id"], start_date)
        elif end_date and not start_date:
            response = get_journals_by_date(user["id"], end_date=end_date)
        else:
            response = get_journals_by_date(user["id"])

        if not response or not response[0]:
            return []

        journals = response
        data = []

        for journal in journals:
            created_at = journal.get("created_at")
            if not created_at:
                continue
            date_obj = datetime.strptime(created_at, "%Y-%m-%d")
            formatted_date = date_obj.strftime("%d %B, %Y").lstrip("0")

            # Prepare data
            data_obj = {
                "id": journal.get("id", ""),
                "title": journal.get("title", ""),
                "content": journal.get("content", ""),
                "rich_text": journal.get("rich_text", ""),
                "date": formatted_date,
                "moods": journal.get("moods", []),
                "tags": journal.get("tags", []),
                "created_at": journal.get("created_at", ""),
            }
            data.append(data_obj)
        return data
    except APIException as e:
        logger.exception(f"Unexpected error in getting all journals: {str(e)}")
        raise APIException(
            status_code=400,
            detail=str(e.detail),
            message=str(e.message),
            hint=str(e.hint),
        )


@router.post("/draft/add")
async def save_drafts(request: Request, draft: DraftRequest):
    user = getattr(request.state, "user", None)
    logger.info(f"User: {user}, User ID type: {type(user['id']) if user else 'None'}")

    try:
        today = date.today().isoformat()
        redis_key = f"Draft:{user['id']}:{today}"
        tags = [item["text"] for item in draft.tags]
        draft_data = {
            "content": draft.plain_text,
            "date": today,
            "user_id": user["id"],
            "tags": tags,
            "title": draft.title,
            "rich_text": draft.rich_text,
        }

        logger.info(f"Draft data prepared: {draft_data}, Type: {type(draft_data)}")
        store_draft(draft_data, redis_key)
        logger.debug(f"Draft stored in Redis with key: {redis_key}")

        return {"message": "Stored Data In Redis", "draft_data": draft_data}

    except Exception as e:
        logger.exception(f"Error saving draft: {str(e)}")
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            message="An Error Has Occurred",
        )


@router.post("/draft/submit")
async def save_draft(request: Request):
    """
    Endpoint to save a draft journal entry.
    """
    try:
        logger.info("Starting /test endpoint execution")
        user = getattr(request.state, "user", None)
        print(user["id"])

        today = date.today().isoformat()  # 'YYYY-MM-DD'
        get_today_journal = (
            db.table("journals")
            .select("*")
            .eq("created_at", today)
            .eq("user_id", user["id"])
            .execute()
        )
        print(f"Todays Journals : {get_today_journal}")
        if get_today_journal.data and len(get_today_journal.data) > 0:
            raise APIException(
                status_code=400,
                detail="You Have Submitted Today's Journal, Come again Tomorrow",
                message="You Have Submitted Today's Journal",
            )
        print("userID", user["id"])
        variable_test = submit_draft(user["id"])
        # logger.debug(f"submit_draft result: {variable_test}")
        return {"message": variable_test}
    except APIException as e:
        logger.error(f"Custom APIException caught: {str(e.message)}")
        raise e  # Re-raise as-is

    except APIException as e:
        logger.exception(f"Unexpected error in /test endpoint: {str(e)}")
        raise APIException(
            status_code=500,
            detail="Internal Server Error",
            message=f"An unexpected error occurred: {str(e)}",
        )


async def process_day(curr_date, user_id, topic):
    newdate = curr_date.isoformat()

    try:
        result = await generate_journal_content(topic=topic)
        chunks = text_splitter.split_text(result["content"])
        combined_embedding = generate_embedding(result["content"])
        title_embedding = direct_embedding(result["title"])
        moods = analyze_mood(result["content"])
        journal_id = str(uuid4())

        journal_data = aggregate_journal(
            chunks,
            user_id,
            newdate,
            combined_embedding,
            result["tags"],
            journal_id,
            title=result["title"],
            title_embedding=title_embedding,
            rich_text=result["rich_text"],
        )

        insert_journal(jsonable_encoder(journal_data))

        for idx, chunk in enumerate(chunks):
            section = process_draft_chunk(journal_id, chunk, idx, user_id, date)
            insert_journal_section(section)

        logger.success(f"\n✅ Seeded journal for Topic -{topic} and Date - {newdate}")
        return {"date": newdate, "status": "success"}

    except Exception as e:
        logger.warning(
            f"\n⚠️ Failed to seed journal for Topic -{topic} and Date - {newdate}: {str(e)}"
        )
        return {"date": newdate, "status": "failed", "error": str(e)}


@router.post("/journals/seed")
async def seed_journals(
    request: Request, start_date: str = None, end_date: str = None, count_start: int = 0
):
    try:
        user = getattr(request.state, "user", None)
        if not user:
            raise APIException(
                status_code=401,
                detail="User not authenticated.",
                message="Authentication required to seed journals.",
            )

        user_id = user["id"]
        # start_date = datetime(2024, 1, 1).date()
        # end_date = datetime(2024, 2, 1).date()
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        tasks = []
        current_date = start
        count = count_start

        logger.info("Starting journal seeding process.")
        start_time = datetime.now()

        results = []
        batch_size = 5

        while current_date < end:
            batch_tasks = []
            for _ in range(batch_size):
                if current_date >= end:
                    break
                batch_tasks.append(
                    process_day(current_date, user_id, JOURNAL_THEMES[count])
                )
                count += 1
                current_date += timedelta(days=1)

            batch_results = await asyncio.gather(*batch_tasks)
            results.extend(batch_results)

        end_time = datetime.now()
        elapsed_time = (end_time - start_time).total_seconds()
        logger.info(f"Journal seeding process completed in {elapsed_time:.2f} seconds.")

        return {
            "message": "Seeding complete.",
            "total": len(results),
            "summary": results,
        }

    except Exception as e:
        logger.exception("❌ Error seeding journals")
        raise APIException(status_code=500, detail=str(e), message="Seeding failed.")


@router.get("/dashboard/analysis")
async def get_user_analysis(
    request: Request, start_date: Optional[date] = None, end_date: Optional[date] = None
):
    try:
        user = getattr(request.state, "user", None)
        print("user", user)

        if not user:
            return {"message": "User not authenticated.", "data": {}}

        user_id = user["id"]
        if start_date and end_date:
            journals = get_journals_by_date(user_id, start_date, end_date)
        elif start_date and not end_date:
            journals = get_journals_by_date(user_id, start_date)
        elif not start_date and end_date:
            journals = get_journals_by_date(user_id, end_date)
        else:
            journals = get_journals_by_date(user_id)

        # print("journals first",journals)
        if not journals:
            return {"message": "No data available for analysis.", "data": {}}

        # Journal count
        journal_count = len(journals)

        # word bubble

        text = " ".join(
            e.get("title", "") + " " + e.get("content", "") for e in journals
        )
        words = pre_process_journal(text)
        word_freq = Counter(words)
        word_bubble = [
            {"word": word, "frequency": freq}
            for word, freq in word_freq.most_common(50)
        ]

        journal_list = []
        # all_mood_count
        # print("journals",journals)
        for i in journals:
            created_at = i.get("created_at")
            if not created_at:
                continue
            date_obj = datetime.strptime(created_at, "%Y-%m-%d")
            formatted_date = date_obj.strftime("%d %B, %Y").lstrip("0")

            # Prepare data
            data_obj = {
                "id": i.get("id", ""),
                "title": i.get("title", ""),
                "content": i.get("content", ""),
                "rich_text": i.get("rich_text", ""),
                "date": formatted_date,
                "moods": i.get("moods", []),
                "tags": i.get("tags", []),
                "created_at": i.get("created_at", ""),
            }
            journal_object = data_obj
            journal_list.append(journal_object)

        # Tag usage
        tag_usage = {}
        for journal in journals:
            for tag in journal.get("tags", []):
                tag_usage[tag] = tag_usage.get(tag, 0) + 1
        top_tags = dict(
            sorted(tag_usage.items(), key=lambda item: item[1], reverse=True)[:5]
        )

        journal_dates = []
        for j in journals:
            date_str = j.get("date") or j.get("created_at")
            if date_str:
                journal_dates.append(datetime.fromisoformat(date_str).date())

        if not journal_dates:
            return {"message": "No valid journal dates found.", "data": {}}

        journal_dates.sort()
        journal_dates_set = set(journal_dates)

        # Calculate current streak
        current_streak = 0
        today = datetime.now().date()
        check_date = today
        while check_date in journal_dates_set:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Calculate longest streak
        longest_streak = 1
        temp_streak = 1
        for i in range(1, len(journal_dates)):
            if (journal_dates[i] - journal_dates[i - 1]).days == 1:
                temp_streak += 1
            else:
                temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)

        daily_mood = {}
        all_mood_count = {}
        for journal in journals:
            date_str = journal.get("date") or journal.get("created_at")
            if not date_str:
                continue
            date = datetime.fromisoformat(date_str).date().strftime("%Y-%m-%d")
            moods = journal.get("moods", {})

            if date not in daily_mood:
                daily_mood[date] = {}

            for mood, score in moods.items():
                # Daily mood aggregation
                daily_mood[date][mood] = daily_mood[date].get(mood, 0) + score
                # All mood count aggregation
                all_mood_count[mood] = all_mood_count.get(mood, 0) + 1

        # Get top 5 moods by count
        top_five_moods = dict(
            sorted(all_mood_count.items(), key=lambda item: item[1], reverse=True)[:5]
        )

        print("all", all_mood_count)
        print("top 5", top_five_moods)
        return {
            "message": "User analysis data generated successfully.",
            "data": {
                "journal_info": journal_list,
                "word_bubble": word_bubble,
                "journal_count": journal_count,
                "tag_usage": top_tags,
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "journal_dates": [d.strftime("%Y-%m-%d") for d in journal_dates],
                "daily_mood": daily_mood,
                "all_mood_count": top_five_moods,
            },
        }

    except Exception as e:
        raise APIException(status_code=500, detail=str(e), message=str(e))


@router.get("/last-submission-date")
def get_last_submission_date(request: Request):
    """
    Endpoint to get the last submission date of a journal.
    """
    user = getattr(request.state, "user", None)
    try:
        # Query the database for the latest journal entry by the user
        last_journal = (
            db.table("journals")
            .select("created_at")
            .eq("user_id", user["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not last_journal.data or len(last_journal.data) == 0:
            return {
                "message": "No journal submissions found.",
                "last_submission_date": None,
            }

        # Extract the last submission date
        last_submission_date = last_journal.data[0]["created_at"]

        return {
            "message": "Last submission date retrieved successfully.",
            "last_submission_date": last_submission_date,
        }

    except Exception as e:
        logger.exception(f"Error retrieving last submission date: {str(e)}")
        raise APIException(
            status_code=500,
            detail=str(e),
            message="An error occurred while retrieving the last submission date.",
        )
