"use client";
import React, { useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "../problem_1.css";
import SubmitButton from "@/app/components/app/submit/SubmitButton";

ModuleRegistry.registerModules([AllCommunityModule]);

const ALL_COURSES = [
    { id: "CS180", name: "Intro to CS", credits: 4, taken: false },
    { id: "CS182", name: "Discrete Math", credits: 3, taken: false },
    { id: "CS240", name: "C Programming", credits: 3, taken: false },
    { id: "CS250", name: "Comp Arch", credits: 4, taken: false },
    { id: "CS251", name: "Data Structures", credits: 3, taken: false },
    { id: "CS252", name: "Systems Prog", credits: 4, taken: false },
    { id: "CS307", name: "Software Eng", credits: 3, taken: false },
    { id: "CS354", name: "Operating Sys", credits: 3, taken: false },
    { id: "MA161", name: "Calc I", credits: 5, taken: false },
    { id: "MA162", name: "Calc II", credits: 5, taken: false },
    { id: "MA261", name: "Multivariate", credits: 4, taken: false },
    { id: "MA265", name: "Linear Alg (Std)", credits: 3, taken: false },
    { id: "MA351", name: "Linear Alg (Adv)", credits: 4, taken: false },
    { id: "ENGL106", name: "First Year Comp", credits: 4, taken: false },
    { id: "COM114", name: "Speech", credits: 3, taken: false },
    { id: "GENED_EASY", name: "Easy Gen Ed", credits: 1, taken: false },
    { id: "GENED_HARD", name: "Hard Gen Ed", credits: 3, taken: false },
];

const AppForm = () => {

  const grid_height_vh = 40;

  // Refs for accessing grid API
  const inputGridRef = useRef();
  
  // State for Inputs
  const [coursesRowData, setCoursesRowData] = useState(ALL_COURSES);
  const [maxSemesters, setMaxSemesters] = useState(8);
  const [maxCredits, setMaxCredits] = useState(18);

  // State for Outputs
  const [outputRowData, setOutputRowData] = useState([]);

  // Column Definitions
  const [inputColDefs] = useState([
    { field: "id", headerName: "Course ID", flex: 1 },
    { field: "name", headerName: "Course Name", flex: 2 },
    { field: "credits", headerName: "Credits", flex: 1 },
    { field: "taken", headerName: "Already Taken?", editable: true, cellDataType: 'boolean', flex: 1 }
  ]);

  const [outputColDefs] = useState([
    { field: "semester", headerName: "Semester", sort: "asc", flex: 1 },
    { field: "courses", headerName: "Recommended Courses", flex: 4, wrapText: true, autoHeight: true },
    { field: "totalCredits", headerName: "Total Credits", flex: 1 }
  ]);

  const sizeStrategy = {
    type: "fitGridWidth",
    defaultMinWidth: 100
  };

  // --- GET DATA (Frontend -> Backend) ---
  const getData = () => {
    // 1. Get taken courses
    const taken = [];
    inputGridRef.current.api.forEachNode((node) => {
        if (node.data.taken) {
            taken.push(node.data.id);
        }
    });

    return {
        "courses_taken": taken,
        "max_semesters": parseInt(maxSemesters),
        "max_credits": parseInt(maxCredits)
    };
  };

  // --- DISPLAY OUTPUT (Backend -> Frontend) ---
  const displayOutput = (data) => {
    // data is { 'CS180_0': 1, 'MA161_0': 1, ... }
    
    const scheduleMap = {};
    const creditMap = {};

    Object.keys(data).forEach(key => {
        // Filter out slack variables or metadata
        if (data[key] === 1 && !key.startsWith("slack_")) {
            const parts = key.rsplit('_', 1); // Split only on the last underscore
            // Custom rsplit implementation since JS doesn't have it built-in like Python
            const lastUnderscoreIndex = key.lastIndexOf('_');
            if (lastUnderscoreIndex !== -1) {
                const courseId = key.substring(0, lastUnderscoreIndex);
                const semesterIndex = parseInt(key.substring(lastUnderscoreIndex + 1));

                if (!isNaN(semesterIndex)) {
                    if (!scheduleMap[semesterIndex]) scheduleMap[semesterIndex] = [];
                    scheduleMap[semesterIndex].push(courseId);
                }
            }
        }
    });

    // Calculate credits for each semester
    // We need to look up credits from ALL_COURSES
    const rows = [];
    Object.keys(scheduleMap).forEach(semStr => {
        const semester = parseInt(semStr);
        const courses = scheduleMap[semester];
        let totalCreds = 0;
        
        courses.forEach(cId => {
            const cObj = ALL_COURSES.find(c => c.id === cId);
            if (cObj) totalCreds += cObj.credits;
        });

        rows.push({
            semester: semester + 1, // 1-based index for display
            courses: courses.join(", "),
            totalCredits: totalCreds
        });
    });

    // If no courses scheduled, clear or show empty
    if (rows.length === 0) {
        setOutputRowData([{ semester: "N/A", courses: "Degree Completed or No Plan Found", totalCredits: 0 }]);
    } else {
        rows.sort((a, b) => a.semester - b.semester);
        setOutputRowData(rows);
    }
  };

  const gridOptions = {
    stopEditingWhenCellsLoseFocus: true,
  };

  return (
    <div>
      <div style={{ padding: "20px" }}>
        
        {/* INPUT SECTION */}
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Step 1: Select Courses You Have Taken</h2>
          <div style={{ margin: "0 auto", height: `${grid_height_vh}vh`, width: "80%" }}>
            <AgGridReact
              rowData={coursesRowData}
              columnDefs={inputColDefs}
              autoSizeStrategy={sizeStrategy}
              ref={inputGridRef}
              gridOptions={gridOptions}
            />
          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div style={{ marginBottom: "20px", textAlign: "center", backgroundColor: "#f4f4f4", padding: "15px", borderRadius: "10px", width: "50%", margin: "0 auto", color: "black" }}>
            <h3 style={{marginBottom: "10px"}}>Step 2: Preferences</h3>
            <div style={{display: "flex", justifyContent: "space-around"}}>
                <label>
                    Max Semesters: 
                    <input 
                        type="number" 
                        value={maxSemesters} 
                        onChange={(e) => setMaxSemesters(e.target.value)} 
                        style={{marginLeft: "10px", padding: "5px", width: "60px"}}
                        min="1" max="12"
                    />
                </label>
                <label>
                    Max Credits / Sem: 
                    <input 
                        type="number" 
                        value={maxCredits} 
                        onChange={(e) => setMaxCredits(e.target.value)} 
                        style={{marginLeft: "10px", padding: "5px", width: "60px"}}
                        min="1" max="24"
                    />
                </label>
            </div>
        </div>

        {/* SUBMIT BUTTON */}
        <SubmitButton 
            problem_id="nathaniel_aguila" 
            getData={getData} 
            sendData={displayOutput} 
        />

        {/* OUTPUT SECTION */}
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Step 3: Your Optimized Schedule</h2>
          <div style={{ margin: "0 auto", height: `${grid_height_vh}vh`, width: "80%" }}>
            <AgGridReact
              rowData={outputRowData}
              columnDefs={outputColDefs}
              autoSizeStrategy={sizeStrategy}
              gridOptions={gridOptions}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppForm;
