from problems.course_planning import main
from solver import solve
import json

def test_freshman_profile():
    print("--- Testing Freshman Profile (No courses taken) ---")
    
    # Mock Data Payload
    payload = {
        "courses_taken": [],
        "max_semesters": 4, # Reduced from 8 for faster local testing
        "max_credits": 20   # Increased slightly to make it easier to fit in 4 sems
    }
    
    # 1. Generate CQM
    print("Generating CQM...")
    cqm = main(payload)
    print(f"CQM Generated with {len(cqm.variables)} variables and {len(cqm.constraints)} constraints.")
    
    # 2. Solve
    print("Solving (Simulated Annealing)...")
    result = solve(cqm)
    
    # 3. Parse and Print Results
    # The result is a dict like {'CS180_0': 1, 'CS180_1': 0, ...}
    # We want to group by semester to see the schedule.
    
    schedule = {} # {semester_index: [course_list]}
    
    from problems.course_planning import COURSE_CATALOG
    
    for key, value in result.items():
        if value == 1:
            # Skip slack variables (internal to the solver)
            if key.startswith("slack_"):
                continue
                
            # Parse key "COURSE_SEMESTER"
            parts = key.rsplit('_', 1)
            if len(parts) == 2:
                course = parts[0]
                # Double check this is actually a course from our catalog
                if course not in COURSE_CATALOG:
                    continue
                    
                semester = int(parts[1])
                
                if semester not in schedule:
                    schedule[semester] = []
                schedule[semester].append(course)
    
    # Print Schedule
    print("\n--- Optimized Schedule ---")
    sorted_semesters = sorted(schedule.keys())
    total_credits = 0
    
    # We need to peek at the catalog for credit info (imported from problem file for display)
    from problems.course_planning import COURSE_CATALOG
    
    for sem in sorted_semesters:
        courses = schedule[sem]
        sem_credits = sum(COURSE_CATALOG[c]["credits"] for c in courses)
        total_credits += sem_credits
        print(f"Semester {sem + 1}: {courses} ({sem_credits} credits)")
        
    print(f"\nTotal Credits: {total_credits}")
    
    # Check if GENED_EASY was picked over GENED_HARD
    all_picked = [c for sem in schedule.values() for c in sem]
    if "GENED_EASY" in all_picked:
        print("SUCCESS: Solver picked the easier Gen Ed (minimized credits).")
    elif "GENED_HARD" in all_picked:
        print("FAIL: Solver picked the harder Gen Ed.")
    else:
        print("FAIL: Gen Ed not picked??")

if __name__ == "__main__":
    test_freshman_profile()
