from dimod import ConstrainedQuadraticModel, Binary
import numpy as np

# --- HARDCODED PURDUE CS DATA (Proof of Concept) ---

COURSE_CATALOG = {
    # --- CORE CS ---
    "CS 18000": {"credits": 4, "prereqs": [], "terms": [1, 2]},
    "CS 18200": {"credits": 3, "prereqs": ["CS 18000"], "terms": [1, 2]},
    "CS 24000": {"credits": 3, "prereqs": ["CS 18000"], "terms": [1, 2]},
    "CS 25000": {"credits": 4, "prereqs": ["CS 18000"], "terms": [1, 2]},
    "CS 25100": {"credits": 3, "prereqs": ["CS 18200", "CS 25000"], "terms": [1, 2]},
    "CS 25200": {"credits": 4, "prereqs": ["CS 25000"], "terms": [1, 2]},
    "CS 30700": {"credits": 3, "prereqs": ["CS 18200", "CS 24000"], "terms": [1, 2]},
    "CS 35400": {"credits": 3, "prereqs": ["CS 25000"], "terms": [1, 2]},
    
    # --- MATH REQS ---
    "MA 16100": {"credits": 5, "prereqs": [], "terms": [1, 2]},
    "MA 16200": {"credits": 5, "prereqs": ["MA 16100"], "terms": [1, 2]},
    "MA 26100": {"credits": 4, "prereqs": ["MA 16200"], "terms": [1, 2]},
    # Linear Algebra Options: MA265 (3 cr) vs MA351 (3 cr)
    "MA 26500": {"credits": 3, "prereqs": ["MA 16200"], "terms": [1, 2]}, 
    "MA 35100": {"credits": 4, "prereqs": ["MA 16200"], "terms": [1, 2]}, 
    
    # --- GEN EDS ---
    "ENGL 10600": {"credits": 4, "prereqs": [], "terms": [1, 2]},
    "COM 11400":  {"credits": 3, "prereqs": [], "terms": [1, 2]},
    "GENED EASY": {"credits": 1, "prereqs": [], "terms": [1, 2]}, 
    "GENED HARD": {"credits": 3, "prereqs": [], "terms": [1, 2]},
}

DEGREE_REQUIREMENTS = [
    "CS 18000", "CS 18200", "CS 24000", "CS 25000", "CS 25100", "CS 25200", 
    "MA 16100", "MA 16200", "MA 26100", 
    ("MA 26500", "MA 35100"), # Choice!
    "ENGL 10600", "COM 11400",
    "CS 30700", "CS 35400", 
    ("GENED EASY", "GENED HARD") # Choice!
]

def parse_data(user_data):
    courses_taken = set(user_data.get("courses_taken", []))
    max_semesters = user_data.get("max_semesters", 8)
    max_credits = user_data.get("max_credits", 18)
    
    remaining_requirements = []
    
    for req in DEGREE_REQUIREMENTS:
        if isinstance(req, str):
            if req not in courses_taken:
                remaining_requirements.append([req]) 
        elif isinstance(req, tuple):
            taken_any = any(opt in courses_taken for opt in req)
            if not taken_any:
                remaining_requirements.append(list(req))

    all_possible_courses = set()
    for group in remaining_requirements:
        for c in group:
            all_possible_courses.add(c)
            
    semesters = list(range(max_semesters))
    
    return remaining_requirements, list(all_possible_courses), semesters, max_credits, courses_taken

def main(data):
    print("--- BACKEND TRIGGERED ---")
    print("Data received:", data)

    # Extract config
    config_list = data.get('config', [{}])
    config = config_list[0] if config_list else {}
    
    # Extract pool
    course_pool = data.get('pool', [])
    
    # Create the 'user_data' dictionary that parse_data expects
    # We map 'code' from the grid to 'courses_taken' for the parser
    formatted_user_data = {
        "max_credits": int(config.get("max_credits", 18)),
        "max_semesters": 8,  # Default or pull from config if you add it to UI
        "courses_taken": [course['code'] for course in course_pool]
    }
    print("Data formatted for parser:", formatted_user_data)

    remaining_reqs, all_courses, semesters, max_credits, courses_taken = parse_data(formatted_user_data)
    
    cqm = ConstrainedQuadraticModel()
    
    if not all_courses:
        return cqm

    # --- VARIABLES ---
    x = {(c, s): Binary(f"{c}_{s}") for c in all_courses for s in semesters}
    
    # --- OBJECTIVE ---
    # Primary: Minimize Total Credits (weight 10.0)
    # Secondary: Minimize Graduation Time (weight 0.1)
    # We use a weighted sum to ensure credits take priority.
    obj_credits = sum(COURSE_CATALOG[c]["credits"] * x[c, s] for c in all_courses for s in semesters)
    obj_time = sum((s + 1) * x[c, s] for c in all_courses for s in semesters)
    
    cqm.set_objective(10.0 * obj_credits + 0.1 * obj_time)
    
    # --- CONSTRAINTS ---
    
    # 0. Uniqueness: Each specific course can be taken AT MOST once.
    # (The requirement satisfaction handles the "at least once" part)
    for c in all_courses:
        cqm.add_constraint(sum(x[c, s] for s in semesters) <= 1, label=f"unique_{c}")
    
    # 1. Requirement Satisfaction (Choice Groups)
    for i, group in enumerate(remaining_reqs):
        cqm.add_constraint(
            sum(x[c, s] for c in group for s in semesters) == 1, 
            label=f"req_group_{i}"
        )

    # 2. Credit Limit per Semester
    for s in semesters:
        current_credits = sum(COURSE_CATALOG[c]["credits"] * x[c, s] for c in all_courses)
        cqm.add_constraint(current_credits <= max_credits, label=f"credits_sem_{s}")
        
    # 3. Prerequisite Constraints
    for c in all_courses:
        reqs = COURSE_CATALOG[c]["prereqs"]
        for req in reqs:
            if req in courses_taken:
                continue
            
            # If the prereq is not in our active "all_courses" list, 
            # it means the user didn't take it AND it's not a valid option to take now.
            # This implies 'c' is impossible to take.
            if req not in all_courses:
                # We can force 'c' to be 0
                cqm.add_constraint(sum(x[c, s] for s in semesters) == 0, label=f"impossible_{c}")
                continue

            sum_c = sum(x[c, s] for s in semesters)
            sum_req = sum(x[req, s] for s in semesters)
            term_c = sum(s * x[c, s] for s in semesters)
            term_req = sum(s * x[req, s] for s in semesters)

            # A. Existence: If C is taken, Req must be taken
            cqm.add_constraint(sum_c - sum_req <= 0, label=f"exist_{req}_{c}")

            # B. Timing (Linear): term_req - term_c + M * sum_c <= M - 1
            # If C is taken (sum_c=1): term_req - term_c + M <= M - 1 => term_req - term_c <= -1 (Active)
            # If C is not taken (sum_c=0): term_req - term_c <= M - 1 (Disabled)
            M = 100 
            cqm.add_constraint(
                term_req - term_c + M * sum_c <= M - 1, 
                label=f"timing_{req}_{c}"
            )

    return cqm