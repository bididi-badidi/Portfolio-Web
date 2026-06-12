from pydantic import BaseModel


class HeaderLink(BaseModel):
    label: str
    text: str
    url: str


class HeaderData(BaseModel):
    name: str
    contact: str
    links: list[HeaderLink]


class EducationEntry(BaseModel):
    institution: str
    degree: str
    gpa: str
    date: str


class ResumeEntry(BaseModel):
    title: str
    role: str
    date: str
    bullets: list[str]


class SkillsData(BaseModel):
    Technical: str


class ResumeDraft(BaseModel):
    summary: str
    work_experiences: list[ResumeEntry]
    personal_projects: list[ResumeEntry]
    leadership_experiences: list[ResumeEntry]
    skills: SkillsData


class MasterResumeData(BaseModel):
    header: HeaderData
    education: list[EducationEntry]
    summary: str
    work_experiences: list[ResumeEntry]
    personal_projects: list[ResumeEntry]
    leadership_experiences: list[ResumeEntry]
    skills: SkillsData

    @classmethod
    def from_s3_dict(cls, data: dict) -> "MasterResumeData":
        return cls(
            header=HeaderData(**data["header"]),
            education=[EducationEntry(**e) for e in data["education"]],
            summary=data.get("summary", ""),
            work_experiences=[ResumeEntry(**e) for e in data.get("Work Experiences & Internships", [])],
            personal_projects=[ResumeEntry(**e) for e in data.get("Personal Projects", [])],
            leadership_experiences=[ResumeEntry(**e) for e in data.get("Leadership Experiences", [])],
            skills=SkillsData(**data.get("skills", {"Technical": ""})),
        )
