#!/usr/bin/env python3
"""Fill the CA2 template with MandiSync content.

The script edits a copy of template_ca2.docx. It keeps the cover, logo, styles,
tables and section headings, replaces the instructional placeholders, inserts
the generated diagrams and screenshots, and adds page numbers.
"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

import docx
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt
from docx.table import Table
from docx.text.paragraph import Paragraph

sys.path.insert(0, str(Path(__file__).resolve().parent))
import content as base  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "template_ca2.docx"
OUT = ROOT / "docs" / "ca2" / "MandiSync_CA2_Report.docx"
ASSETS = ROOT / "docs" / "ca2" / "assets"

HUMANIZED = ROOT / "docs" / "ca2" / "humanized_content.json"
H = json.loads(HUMANIZED.read_text(encoding="utf-8")) if HUMANIZED.exists() else {}
SECTIONS = H.get("SECTIONS", base.SECTIONS)
MODULES = [tuple(x) for x in H.get("MODULES", base.MODULES)]
META = base.META


def find_para(doc, text: str, exact: bool = True) -> Paragraph | None:
    for p in doc.paragraphs:
        if (p.text == text) if exact else (text in p.text):
            return p
    return None


def clear_paragraph(p: Paragraph) -> None:
    for child in list(p._p):
        if child.tag != qn("w:pPr"):
            p._p.remove(child)


def set_text(p: Paragraph, text: str, bold: bool | None = None, italic: bool | None = None,
             size: float | None = None) -> None:
    clear_paragraph(p)
    run = p.add_run(text)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    if size is not None:
        run.font.size = Pt(size)


def clone_paragraph_after(p: Paragraph, text: str) -> Paragraph:
    new_el = copy.deepcopy(p._p)
    for child in list(new_el):
        if child.tag != qn("w:pPr"):
            new_el.remove(child)
    p._p.addnext(new_el)
    new_p = Paragraph(new_el, p._parent)
    set_text(new_p, text)
    return new_p


def replace_with_paragraphs(p: Paragraph, lines: list[str]) -> None:
    lines = [x for x in lines if x]
    if p is None:
        print("WARN replace_with_paragraphs: anchor not found")
        return
    if not lines:
        remove_para(p)
        return
    set_text(p, lines[0])
    anchor = p
    for line in lines[1:]:
        anchor = clone_paragraph_after(anchor, line)


def remove_para(p: Paragraph) -> None:
    p._p.getparent().remove(p._p)


def remove_all(doc, texts: list[str]) -> None:
    wanted = set(texts)
    for p in list(doc.paragraphs):
        if p.text in wanted:
            remove_para(p)


def add_paragraph_after(anchor, text: str = "", bold: bool = False, italic: bool = False,
                        size: float | None = None, style: str | None = None,
                        align: WD_ALIGN_PARAGRAPH | None = None) -> Paragraph:
    p = doc.add_paragraph(style=style)
    if isinstance(anchor, Paragraph):
        anchor._p.addnext(p._p)
    elif isinstance(anchor, Table):
        anchor._tbl.addnext(p._p)
    else:
        anchor.addnext(p._p)
    if text:
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        if size:
            run.font.size = Pt(size)
    if align is not None:
        p.alignment = align
    return p


def set_cell(cell, text: str, bold: bool = False, size: float = 8.5,
             align: WD_ALIGN_PARAGRAPH | None = None) -> None:
    cell.text = ""
    p = cell.paragraphs[0]
    run = p.add_run(str(text))
    run.bold = bold
    run.font.size = Pt(size)
    if align is not None:
        p.alignment = align
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER


def fill_table(table: Table, rows: list[tuple], header: list[str] | None = None,
               size: float = 8.5, bold_first_col: bool = False) -> None:
    while len(table.rows) < (1 if header else 0) + len(rows):
        table.add_row()
    if header:
        for j, val in enumerate(header):
            set_cell(table.rows[0].cells[j], val, bold=True, size=size)
    for i, row in enumerate(rows, start=1):
        for j, val in enumerate(row):
            set_cell(table.rows[i].cells[j], val, bold=(bold_first_col and j == 0), size=size)


def clone_table_after(source: Table, anchor) -> Table:
    new_tbl = copy.deepcopy(source._tbl)
    if isinstance(anchor, Paragraph):
        anchor._p.addnext(new_tbl)
    elif isinstance(anchor, Table):
        anchor._tbl.addnext(new_tbl)
    else:
        anchor.addnext(new_tbl)
    return Table(new_tbl, source._parent)


def set_col_widths(table: Table, widths_cm: list[float]) -> None:
    table.autofit = False
    table.allow_autofit = False
    tblPr = table._tbl.tblPr
    layout = OxmlElement("w:tblLayout")
    layout.set(qn("w:type"), "fixed")
    tblPr.append(layout)
    for i, width in enumerate(widths_cm):
        if i < len(table.columns):
            table.columns[i].width = Cm(width)
    for row in table.rows:
        for i, width in enumerate(widths_cm):
            if i < len(row.cells):
                row.cells[i].width = Cm(width)


def keep_rows_together(table: Table, repeat_header: bool = True) -> None:
    for row in table.rows:
        trPr = row._tr.get_or_add_trPr()
        if not trPr.find(qn("w:cantSplit")):
            trPr.append(OxmlElement("w:cantSplit"))
    if repeat_header and table.rows:
        trPr = table.rows[0]._tr.get_or_add_trPr()
        if not trPr.find(qn("w:tblHeader")):
            trPr.append(OxmlElement("w:tblHeader"))


def trim_table_rows(table: Table, count: int) -> None:
    while len(table.rows) > count:
        table._tbl.remove(table.rows[-1]._tr)


def add_page_numbers(doc) -> None:
    section = doc.sections[0]
    section.different_first_page_header_footer = True
    footer = section.footer
    p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.text = ""
    run = p.add_run("Page ")
    run.font.size = Pt(9)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


def figure(placeholder_text: str, image: Path, width_cm: float, caption: str | None = None,
           old_caption: str | None = None) -> Paragraph | None:
    p = find_para(doc, placeholder_text)
    if p is None:
        print(f"WARN missing placeholder: {placeholder_text}")
        return None
    clear_paragraph(p)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(image), width=Cm(width_cm))
    p.paragraph_format.keep_with_next = True
    if old_caption:
        old = find_para(doc, old_caption)
        if old:
            remove_para(old)
    cap = add_paragraph_after(p, caption or "", italic=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER)
    return cap


def side_by_side(placeholder_text: str, left: Path, right: Path, caption: str,
                 left_label: str = "Wireframe", right_label: str = "Actual prototype") -> None:
    p = find_para(doc, placeholder_text)
    if p is None:
        print(f"WARN missing placeholder: {placeholder_text}")
        return
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    p._p.addnext(table._tbl)
    for cell, img, label in zip(table.rows[0].cells, (left, right), (left_label, right_label)):
        cell.text = ""
        cp = cell.paragraphs[0]
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cp.add_run().add_picture(str(img), width=Cm(7.35))
        cap = cell.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cap.add_run(label)
        r.italic = True
        r.font.size = Pt(8)
    remove_para(p)
    add_paragraph_after(table, caption, italic=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER)


doc = docx.Document(str(TEMPLATE))
# The template starts with an empty paragraph and a stray page break.
for _ in range(2):
    if doc.paragraphs and not doc.paragraphs[0].text.strip():
        remove_para(doc.paragraphs[0])
doc.core_properties.title = META["title"]
doc.core_properties.author = "MandiSync Team"
doc.core_properties.subject = "CA2 Project Report"
doc.core_properties.comments = "Filled from the CA2 template with the MandiSync project details."

# ---------------------------------------------------------------
# Cover page
# ---------------------------------------------------------------
p = find_para(doc, "Project Title: [Enter Project Title]")
if p:
    set_text(p, f"Project Title: {META['title']}", bold=True)

p = find_para(doc, "Submitted by")
if p:
    # The next empty centred paragraph is used for the first name.
    names = [f"{m['name']} - {m['reg']}" for m in META["members"]]
    anchor = p
    for i, name in enumerate(names):
        np = add_paragraph_after(anchor, name, size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
        # Add a small gap before the first name.
        if i == 0:
            np.paragraph_format.space_before = Pt(8)
        anchor = np

p = find_para(doc, "Registration No.")
if p:
    regs = ", ".join(m["reg"] for m in META["members"])
    set_text(p, f"Registration No.: {regs}", size=10, bold=True)

p = find_para(doc, "Under the Supervision of")
if p:
    add_paragraph_after(p, META["supervisor"], size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)

# Compact the cover: remove the template's spare empty lines and widen the
# narrow centred paragraphs so names and registration numbers do not wrap.
started = False
for p in list(doc.paragraphs):
    if p.text == "Submitted by":
        started = True
        p.paragraph_format.left_indent = Cm(0)
        p.paragraph_format.right_indent = Cm(0)
        continue
    if p.text.startswith("LOVELY PROFESSIONAL"):
        break
    if started and not p.text.strip() and "w:drawing" not in p._p.xml:
        remove_para(p)

for text in ("Registration No.", "Under the Supervision of", "LOVELY PROFESSIONAL UNIVERSITY PUNJAB", "Aug- Dec 2026"):
    p = find_para(doc, text)
    if p:
        p.paragraph_format.left_indent = Cm(0)
        p.paragraph_format.right_indent = Cm(0)
        p.paragraph_format.space_before = Pt(10 if text == "Registration No." else 16 if text == "Under the Supervision of" else 24 if text.startswith("LOVELY") else 4)

# ---------------------------------------------------------------
# Remove the template instructions, guidance and generic bullets
# ---------------------------------------------------------------
remove_all(doc, [
    "Provide a brief introduction to the project, its purpose, and the problem it intends to solve.",
    "Description:",
    "Clearly identify the problem being addressed and explain why the proposed system is required.",
    "Problem Statement:",
    "List the major objectives of the project.",
    "Explain the major features, intended users, and functionalities included in the project.",
    "Project Scope:",
    "Divide the project into phases and specify the planned and actual completion dates.",
    "Instructions: Enter actual dates and update the status of each task. Suggested status values are Not Started, In Progress, and Completed.",
    "Provide a week-wise schedule indicating the activities planned and the deliverables expected.",
    "Note: Students should modify the schedule according to their project duration and actual progress.",
    "Insert a Gantt chart showing the duration and overlap of the major project activities.",
    "The chart should include:",
    "Project activities on the vertical axis.",
    "Weeks or calendar dates on the horizontal axis.",
    "Planned start and end dates.",
    "Duration of each activity.",
    "Overlapping activities, wherever applicable.",
    "List the technologies, frameworks, databases, and development tools used to implement the project.",
    "Instructions: Include only the components relevant to your project. If a separate backend or database is not required, explain the architecture used instead.",
    "Explain why the selected technologies are suitable for the project.",
    "Provide a labelled architecture diagram illustrating the major components of the proposed system and the connections between them.",
    "The diagram should clearly identify the applicable components, such as:",
    "User or Client",
    "Presentation Layer/Frontend",
    "Application or Business Logic Layer/Backend",
    "Database or Data Storage Layer",
    "External APIs or Services, if applicable",
    "Explanation of Architecture:",
    "Provide a flowchart illustrating the main user actions and the processing performed by the system.",
    "The flowchart should include, wherever applicable:",
    "Start",
    "User opens the application",
    "User registration/login or access",
    "User selects a feature or submits input",
    "Input validation",
    "System processing",
    "Database retrieval or storage",
    "Decision points and error handling",
    "Display of results or confirmation",
    "End",
    "Explanation of Workflow:",
    "Describe the major modules of the system.",
    "Briefly explain the user interface design, navigation structure, layout, and usability considerations of the project.",
    "Provide labelled wireframes or sketches of the main screens of the application.",
    "Note: Students must adapt the screens to their project. Replace irrelevant screens with appropriate ones, such as a booking page, product catalogue, admin panel, report page, or payment screen.",
    "Provide a navigation diagram or explain how users move between the main screens.",
    "Example navigation structure:",
    "Home Page → Login → Dashboard → Select Function → Enter Data → View Results",
    "Adapt this structure to match the actual application.",
    "Explain the design decisions made to improve usability.",
    "Consider:",
    "Consistency of layout and navigation.",
    "Readability of text and labels.",
    "Form validation and error messages.",
    "Accessibility and responsive design, where applicable.",
    "Ease of use for the intended users.",
    "Identify the database or storage mechanism used in the project and explain how the system stores, retrieves, and manages data.",
    "Provide an ER diagram or equivalent data model showing the entities or collections, their attributes, and the relationships between them.",
    "The diagram should include:",
    "Entity or collection names.",
    "Important attributes or fields.",
    "Primary keys, where applicable.",
    "Foreign keys, where applicable.",
    "Relationships between entities.",
    "Cardinality, such as one-to-one, one-to-many, or many-to-many, where applicable.",
    "For projects using NoSQL databases, students may provide a document/collection model instead of a traditional ER diagram.",
    "Describe the tables or collections used in the project.",
    "Add further tables or collections as required.",
    "Explain the relationships between the major entities.",
    "Briefly explain how the system handles:",
    "Data insertion and updates.",
    "Data retrieval and deletion, if supported.",
    "Input validation.",
    "Duplicate records and data integrity.",
    "Access control and protection of sensitive data, where applicable.",
    "For group projects, each student must clearly document their individual contribution to the development of the project.",
    "For individual projects, provide the details of the student and specify the responsibilities undertaken.",
    "Specify the work completed by each team member.",
    "Instructions: Enter the actual contribution of each member. Use brief descriptions such as Designed, Developed, Tested, Documented, or Reviewed. Mark tasks as Not Applicable where appropriate.",
    "Repeat this section for each team member.",
    "Summarize the project, the major features developed, the technologies used, and the extent to which the project objectives have been achieved.",
    "Conclusion:",
    "List all resources consulted during the project, including books, research papers, official documentation, tutorials, and relevant websites.",
    "Include supporting material such as:",
    "Additional interface screenshots.",
    "Important code snippets.",
    "Sample input and output.",
    "Test cases and test results.",
    "Additional design diagrams.",
    "Supporting documentation.",
])

# ---------------------------------------------------------------
# Section 1 - Introduction
# ---------------------------------------------------------------
replace_with_paragraphs(find_para(doc, "[Write approximately 150–250 words describing the project.]"), SECTIONS["intro"])
replace_with_paragraphs(find_para(doc, "[Describe the existing problem, its limitations, and the need for the proposed solution.]"), SECTIONS["problem"])
replace_with_paragraphs(find_para(doc, "[Describe what the system will and will not cover.]"), SECTIONS["scope"])

objective_paras = [find_para(doc, f"[Objective {i}]") for i in range(1, 5)]
objective_paras = [p for p in objective_paras if p]
for p, text in zip(objective_paras, SECTIONS["objectives"]):
    set_text(p, text)
last = objective_paras[-1] if objective_paras else find_para(doc, "1.4 Project Scope")
for text in SECTIONS["objectives"][len(objective_paras):]:
    last = clone_paragraph_after(last, text)

# Store the original table objects before new DB tables are inserted.
t_timeline = doc.tables[0]
t_weeks = doc.tables[1]
t_stack = doc.tables[2]
t_modules = doc.tables[3]
t_db_user = doc.tables[4]
t_db_mandi = doc.tables[5]
t_relationships = doc.tables[6]
t_team = doc.tables[7]
t_matrix = doc.tables[8]

# ---------------------------------------------------------------
# Section 2 - Planning and timeline
# ---------------------------------------------------------------
fill_table(t_timeline, base.TIMELINE, size=7.8)
add_paragraph_after(
    t_timeline,
    "The project followed a ten-phase plan: requirement analysis and the existing-system study came first, "
    "followed by design, frontend, backend, integration and documentation. The actual dates come from "
    "the project log and the git history. Planning and analysis began in August, and the repository's "
    "first commit was on 6 September 2026. The main UI and API rebuild landed on 18 September, and the "
    "final audit and bug fixes landed on 29 October. Where two phases share a date, the commit time is "
    "used so the sequence stays clear.",
    size=10,
)
fill_table(t_weeks, [(w, a, d, s) for w, a, d, s in base.WEEK_SCHEDULE], size=8.2)

figure(
    "[Insert Gantt chart here.]",
    ASSETS / "diagrams" / "gantt.png",
    15.6,
    "Figure 1: Planned schedule and actual project milestones.",
    old_caption="Figure 1: Project Development Gantt Chart",
)

# ---------------------------------------------------------------
# Section 3 - Technology stack
# ---------------------------------------------------------------
fill_table(t_stack, base.TECH_STACK, size=7.8)
replace_with_paragraphs(
    find_para(doc, "[Discuss factors such as usability, performance, scalability, security, compatibility, development time, and ease of maintenance, as applicable.]"),
    SECTIONS["tech_justification"],
)

# ---------------------------------------------------------------
# Section 4 - Architecture and workflow
# ---------------------------------------------------------------
figure(
    "[Insert system architecture diagram here.]",
    ASSETS / "diagrams" / "architecture.png",
    15.6,
    "Figure 2: System architecture of the MandiSync prototype.",
    old_caption="Figure 2: System Architecture Diagram",
)
replace_with_paragraphs(find_para(doc, "[Explain the purpose of each component and how the components communicate with one another.]"), SECTIONS["architecture"])

figure(
    "[Insert workflow flowchart here.]",
    ASSETS / "diagrams" / "workflow.png",
    15.6,
    "Figure 3: Main booking, gate, weighing and completion workflow.",
    old_caption="Figure 3: System Workflow Flowchart",
)
replace_with_paragraphs(find_para(doc, "[Describe the sequence of operations from the user's initial interaction to the final output.]"), SECTIONS["workflow"])

fill_table(t_modules, MODULES, header=["Module Name", "Description", "Input", "Output"], size=8.0, bold_first_col=True)

# ---------------------------------------------------------------
# Section 5 - UI/UX and wireframes
# ---------------------------------------------------------------
replace_with_paragraphs(find_para(doc, "[Explain how the interface is designed to support the needs of the intended users.]"), SECTIONS["ui_overview"])

screen_data = [
    ("Screen 1: Home/Landing Page", "01-landing", "Show the public entry point and the four main work areas before login.", "Header, hero, mandi capacity card, Farmer, Gate, Weighbridge and Queue cards, login link."),
    ("Screen 2: Login/Registration Screen (If Applicable)", "02-login", "Authenticate a farmer, operator or admin and send the user to the correct workspace.", "Email field, password field, remember-me control, forgot-password link and sign-in button."),
    ("Screen 3: Dashboard/Main Functional Screen", "03-farmer-booking", "Guide a farmer through mandi, crop, weight and arrival-slot selection.", "Step indicator, mandi cards with distance and quota, crop and weight fields, slot grid and confirm button."),
    ("Screen 4: Input/Data Entry Screen (If Applicable)", "04-gate-desk", "Verify an RFID tag or QR pass and decide whether the barrier should open.", "Scan panel, manual tag entry, booking summary, gate-open/deny state and recent scan list."),
    ("Screen 5: Results/Output Screen", "05-weigh-queue", "Capture gross and tare weights, calculate net weight and show the live queue.", "Live weight display, gross/tare actions, booking summary, queue metrics and ledger table."),
]

for idx, (screen, slug, purpose, elements) in enumerate(screen_data, start=1):
    # Replace the placeholder with a side-by-side wireframe and actual screenshot.
    side_by_side(
        "[Insert wireframe or sketch here.]",
        ASSETS / "wireframes" / f"{slug}.png",
        ASSETS / "screenshots" / {1: "actual-01-landing.png", 2: "actual-02-login.png", 3: "actual-03-farmer-booking.png", 4: "actual-04-gate-desk.png", 5: "actual-05-weigh.png"}[idx],
        f"Figure {3 + idx}: {screen} - wireframe (left) and current prototype (right).",
    )
    purpose_ph = (
        "Purpose: [Explain the purpose of the screen.]"
        if idx <= 4
        else "Purpose: [Explain how the system displays the output or results.]"
    )
    elements_ph = {
        1: "Main Elements: [List the major buttons, menus, fields, and other elements.]",
        2: "Main Elements: [List the main input fields and actions.]",
        3: "Main Elements: [List the major interface elements and functions.]",
        4: "Main Elements: [Describe the input fields, controls, and validation messages.]",
        5: "Main Elements: [Describe the results, notifications, tables, charts, or other output elements.]",
    }[idx]
    p = find_para(doc, purpose_ph)
    if p:
        set_text(p, f"Purpose: {purpose}")
    p = find_para(doc, elements_ph)
    if p:
        set_text(p, f"Main Elements: {elements}")

figure(
    "[Insert navigation diagram here.]",
    ASSETS / "diagrams" / "navigation.png",
    15.6,
    "Figure 9: Screen-to-screen navigation for the three user roles.",
    old_caption="Figure 4: UI Navigation Diagram",
)
p = find_para(doc, "5.4 Design and Usability Considerations")
if p:
    nav_note = add_paragraph_after(p, "The navigation follows the role and the job to be done, not the database structure. A farmer moves from booking to pass to live queue; a gate operator moves from scan to verification to weighbridge; a manager moves to the ledger.", size=10)
    for line in SECTIONS["usability"]:
        nav_note = add_paragraph_after(nav_note, line, size=10)

# ---------------------------------------------------------------
# Section 6 - Database
# ---------------------------------------------------------------
p = find_para(doc, "Database/Storage Technology: [Enter Technology Name]")
if p:
    set_text(p, "Database/Storage Technology: SQLite for local development and Turso/libSQL for hosted data, accessed through Prisma 7.", bold=False)
replace_with_paragraphs(find_para(doc, "[Explain the purpose of the database or storage mechanism in the project.]"), SECTIONS["db_overview"])

figure(
    "[Insert ER diagram or data model here.]",
    ASSETS / "diagrams" / "er.png",
    15.6,
    "Figure 10: Entity-relationship model for the six main tables.",
    old_caption="Figure 5: ER Diagram/Data Model",
)

# Existing two DB tables: User and Mandi.
for idx, entity in enumerate(base.DB_TABLES[:2], start=1):
    p = find_para(doc, f"Table/Collection {idx}: [Name]")
    if p:
        set_text(p, f"Table/Collection {idx}: {entity['name']} - {entity['description']}", bold=True, size=10)
    fill_table((t_db_user if idx == 1 else t_db_mandi), [(a, b, c, d) for a, b, c, d in entity["fields"]], header=["Field/Attribute", "Data Type", "Key/Constraint", "Description"], size=7.6)

# Add four more DB tables after the second one.
source_table = t_db_mandi
anchor = source_table
db_tables = [t_db_user, t_db_mandi]
for idx, entity in enumerate(base.DB_TABLES[2:], start=3):
    heading = add_paragraph_after(anchor, f"Table/Collection {idx}: {entity['name']} - {entity['description']}", bold=True, size=10)
    table = clone_table_after(source_table, heading)
    # Make the cloned table have exactly the right number of rows.
    while len(table.rows) < 1 + len(entity["fields"]):
        table.add_row()
    trim_table_rows(table, 1 + len(entity["fields"]))
    fill_table(table, [(a, b, c, d) for a, b, c, d in entity["fields"]], header=["Field/Attribute", "Data Type", "Key/Constraint", "Description"], size=7.6)
    db_tables.append(table)
    anchor = table

fill_table(t_relationships, base.RELATIONSHIPS, header=["Entity 1", "Entity 2", "Relationship Type", "Explanation"], size=7.8)
p = find_para(doc, "6.5 Data Management and Validation")
if p:
    dm_lead = add_paragraph_after(p, "The system handles data insertion, retrieval, validation and access control as follows.", size=10)
    for line in SECTIONS["data_management"]:
        dm_lead = add_paragraph_after(dm_lead, line, size=10)

# ---------------------------------------------------------------
# Section 7 - Individual contribution
# ---------------------------------------------------------------
fill_table(
    t_team,
    [(str(i), m["name"], m["reg"], m["area"], f"Owns the {m['area'].lower()} work and the {m['segment']} study guide.") for i, m in enumerate(META["members"], start=1)],
    header=["S. No.", "Student Name", "Registration Number", "Assigned Role", "Major Responsibilities"],
    size=7.8,
)

matrix = t_matrix
if len(matrix.columns) == 5:
    matrix.add_column(Cm(2.3))
headers = ["Project Component/Task"] + [m["name"] for m in META["members"]]
for j, h in enumerate(headers):
    set_cell(matrix.rows[0].cells[j], h, bold=True, size=7.6)
for i, row in enumerate(base.CONTRIB_MATRIX, start=1):
    for j, val in enumerate(row):
        set_cell(matrix.rows[i].cells[j], val, bold=(j == 0), size=7.6)

# Detailed contribution blocks. Student 1 and Student 2 already exist in the
# template; the remaining three are inserted after Student 2 in the correct order.
paras = list(doc.paragraphs)
s1_idx = next((i for i, p in enumerate(paras) if p.text.startswith("Student 1:")), None)
s2_idx = next((i for i, p in enumerate(paras) if p.text.startswith("Student 2:")), None)
if s1_idx is not None and s2_idx is not None:
    block1 = paras[s1_idx:s1_idx + 7]
    block2 = paras[s2_idx:s2_idx + 7]
    for block, member in zip([block1, block2], META["members"][:2]):
        detail = base.DETAILED[member["name"]]
        set_text(block[0], f"Student {META['members'].index(member) + 1}: {member['name']} ({member['reg']})", bold=True, size=11)
        set_text(block[2], detail["responsibilities"])
        set_text(block[4], detail["work"])
        set_text(block[6], detail["evidence"])

    anchor = block2[-1]
    for idx, member in enumerate(META["members"][2:], start=3):
        detail = base.DETAILED[member["name"]]
        anchor = add_paragraph_after(anchor, f"Student {idx}: {member['name']} ({member['reg']})", bold=True, size=11)
        anchor = add_paragraph_after(anchor, "Assigned Responsibilities:", size=10)
        anchor = add_paragraph_after(anchor, detail["responsibilities"], size=10)
        anchor = add_paragraph_after(anchor, "Work Completed:", size=10)
        anchor = add_paragraph_after(anchor, detail["work"], size=10)
        anchor = add_paragraph_after(anchor, "Evidence of Contribution:", size=10)
        anchor = add_paragraph_after(anchor, detail["evidence"], size=10)

# ---------------------------------------------------------------
# Section 8 - Conclusion, limitations and future work
# ---------------------------------------------------------------
replace_with_paragraphs(find_para(doc, "[Write a concise summary of the completed project.]"), SECTIONS["conclusion"])

lim_paras = [find_para(doc, f"[Limitation {i}]") for i in range(1, 3)]
lim_paras = [p for p in lim_paras if p]
for p, text in zip(lim_paras, SECTIONS["limitations"]):
    set_text(p, text)
last = lim_paras[-1] if lim_paras else find_para(doc, "8.1 Limitations and Future Enhancements")
for text in SECTIONS["limitations"][len(lim_paras):]:
    last = clone_paragraph_after(last, text)

future_lines = base.SECTIONS["future"]
future_paras = [find_para(doc, f"[Proposed enhancement {i}]") for i in range(1, 3)]
future_paras = [p for p in future_paras if p]
for p, text in zip(future_paras, future_lines):
    set_text(p, text)
last = future_paras[-1] if future_paras else find_para(doc, "8.1 Limitations and Future Enhancements")
for text in future_lines[len(future_paras):]:
    last = clone_paragraph_after(last, text)

# ---------------------------------------------------------------
# Section 9 - References
# ---------------------------------------------------------------
p = find_para(doc, "9. REFERENCES")
if p:
    anchor = add_paragraph_after(p, "The following official documentation and project resources were consulted:", size=10)
    for i, ref in enumerate(base.REFERENCES, start=1):
        anchor = add_paragraph_after(anchor, f"[{i}] {ref}", size=10)

# ---------------------------------------------------------------
# Appendix
# ---------------------------------------------------------------
p = find_para(doc, "APPENDIX (IF REQUIRED)")
if p:
    p.paragraph_format.page_break_before = True
    anchor = add_paragraph_after(p, "The appendix records the API surface, a sample telemetry packet, the manual test notes and an extra queue screenshot.", size=10)

    h = add_paragraph_after(anchor, "Appendix A - API endpoints", bold=True, size=11)
    h.paragraph_format.keep_with_next = True
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    h._p.addnext(table._tbl)
    for j, text in enumerate(["Method", "Path", "Purpose"]):
        set_cell(table.rows[0].cells[j], text, bold=True, size=8.5)
    for method, path, purpose in base.API_ENDPOINTS:
        row = table.add_row()
        set_cell(row.cells[0], method, size=8.5)
        set_cell(row.cells[1], path, size=8.5)
        set_cell(row.cells[2], purpose, size=8.5)
    anchor = table

    h = add_paragraph_after(anchor, "Appendix B - Sample weighbridge telemetry packet", bold=True, size=11)
    h.paragraph_format.keep_with_next = True
    code = add_paragraph_after(h, base.SAMPLE_TELEMETRY, size=8.5)
    code.paragraph_format.left_indent = Cm(0.8)
    anchor = code

    h = add_paragraph_after(anchor, "Appendix C - Manual test notes", bold=True, size=11)
    h.paragraph_format.keep_with_next = True
    anchor = h
    for note in base.TEST_NOTES:
        anchor = add_paragraph_after(anchor, f"• {note}", size=10)

    h = add_paragraph_after(anchor, "Appendix D - Queue ledger screenshot", bold=True, size=11)
    h.paragraph_format.keep_with_next = True
    img_p = add_paragraph_after(h, "", size=10)
    img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img_p.add_run().add_picture(str(ASSETS / "screenshots" / "actual-06-queue.png"), width=Cm(15.5))
    add_paragraph_after(img_p, "Figure 11: Current queue ledger with demo bookings.", italic=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER)

# ---------------------------------------------------------------
# Page breaks before major sections and page numbers
# ---------------------------------------------------------------
for heading in [
    "1. INTRODUCTION AND PROBLEM STATEMENT",
    "2. PROJECT PLANNING AND TIMELINE",
    "9. REFERENCES",
]:
    p = find_para(doc, heading)
    if p:
        p.paragraph_format.page_break_before = True

# Keep headings with the content that follows so they are not left alone at
# the bottom of a page.
for p in doc.paragraphs:
    text = p.text.strip()
    if text and (text[0].isdigit() and "." in text[:4] or text.isupper()):
        p.paragraph_format.keep_with_next = True

# Column widths tuned for the A4 text area.
set_col_widths(t_timeline, [1.2, 3.4, 2.4, 2.7, 3.0, 2.3])
set_col_widths(t_weeks, [1.5, 5.7, 5.2, 3.4])
set_col_widths(t_stack, [2.8, 4.2, 4.4, 4.4])
set_col_widths(t_modules, [2.8, 6.8, 3.2, 3.0])
for table in db_tables:
    set_col_widths(table, [3.4, 3.2, 4.0, 5.1])
set_col_widths(t_relationships, [2.8, 2.8, 3.4, 6.7])
set_col_widths(t_team, [1.0, 3.0, 2.7, 3.6, 5.5])
set_col_widths(t_matrix, [4.6, 2.2, 2.2, 2.2, 2.2, 2.2])
# API table is the last table in the document.
if doc.tables:
    set_col_widths(doc.tables[-1], [1.8, 6.7, 7.2])
for table in doc.tables:
    keep_rows_together(table)

# Align the static table of contents with the actual section headings.
toc_idx = next((i for i, p in enumerate(doc.paragraphs) if p.text.strip() == "TABLE OF CONTENTS"), None)
if toc_idx is not None:
    toc_new = [
        "Introduction and Problem Statement",
        "Project Planning and Timeline",
        "Technology Stack",
        "System Architecture and Workflow",
        "UI/UX Design and Wireframes",
        "Database Modelling and Design",
        "Individual Contribution",
        "Conclusion",
        "References",
    ]
    toc_paras = doc.paragraphs[toc_idx + 1:toc_idx + 11]
    for p, text in zip(toc_paras, toc_new):
        set_text(p, text)
    if len(toc_paras) > len(toc_new):
        remove_para(toc_paras[-1])

add_page_numbers(doc)

# Final cover pass: widen the narrow template paragraphs so nothing wraps.
cover_keys = {
    "Submitted by",
    "Registration No.: " + ", ".join(m["reg"] for m in META["members"]),
    "Under the Supervision of",
    "LOVELY PROFESSIONAL UNIVERSITY PUNJAB",
    "Aug- Dec 2026",
}
for p in doc.paragraphs:
    if p.text in cover_keys or p.text.startswith("Registration No.:"):
        p.paragraph_format.left_indent = Cm(0)
        p.paragraph_format.right_indent = Cm(0)

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(str(OUT))
print(f"wrote {OUT}")
