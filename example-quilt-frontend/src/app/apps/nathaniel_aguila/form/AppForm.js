"use client";
import React, { useState, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../problem_1.css";
import SubmitButton from "@/app/components/app/submit/SubmitButton";

ModuleRegistry.registerModules([AllCommunityModule]);

const AppForm = () => {
  const grid_height_vh = 35;
  const courseGridRef = useRef();

  // Mock Purdue CS Core Requirements for the "Auto-fill" feature
  const CS_CORE = [
    { code: "CS 18000", name: "Problem Solving & OOP", priority: "Critical (Core)", credits: 4 },
    { code: "CS 24000", name: "Programming in C", priority: "High", credits: 3 },
    { code: "MA 16100", name: "Calculus I", priority: "Critical (Core)", credits: 5 },
    { code: "CS 18200", name: "Discrete Mathematics", priority: "High", credits: 3 }
  ];

  const [systemConfig] = useState([{ department: "CS", major: "Computer Science", max_credits: 18, term: "Fall 2026" }]);
  const [courseList, setCourseList] = useState([]);
  const [scheduleOutput, setScheduleOutput] = useState([]);

  // --- Dynamic UI Logic ---
  const handleAutoFillCS = () => {
    setCourseList(CS_CORE);
  };

  const addManualCourse = () => {
    const newCourse = { code: "NEW-101", name: "Manual Entry Course", priority: "Medium", credits: 3 };
    setCourseList(prev => [...prev, newCourse]);
  };

  // --- Column Definitions ---
  const columnDefs = useMemo(() => ({
    config: [
      { headerName: 'Dept', field: 'department', editable: true, flex: 1 },
      { headerName: 'Major Path', field: 'major', editable: true, flex: 2 },
      { headerName: 'Max Load (Cr)', field: 'max_credits', editable: true, flex: 1 },
      { headerName: 'Term', field: 'term', editable: true, flex: 1 }
    ],
    courses: [
      { headerName: 'ID', field: 'code', editable: true, flex: 1, checkboxSelection: true },
      { headerName: 'Course Title', field: 'name', editable: true, flex: 3 },
      { headerName: 'Credits', field: 'credits', editable: true, flex: 1 },
      { 
        headerName: 'Priority State', 
        field: 'priority', 
        editable: true, 
        flex: 1.5,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ["Critical (Core)", "High", "Medium", "Elective"] }
      }
    ],
    output: [
      { field: "code", headerName: "Optimized Node", flex: 1 },
      { field: "name", headerName: "Title", flex: 2.5 },
      { field: "confidence", headerName: "Quantum Prob. %", flex: 1 }
    ]
  }), []);

  return (
    <div style={{ padding: "40px", backgroundColor: "#000", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h2 className="header-container" style={{ fontSize: '2.5rem' }}>QuantaPlan</h2>
        <p style={{ color: "#00d4ff", textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '3px' }}>
          Purdue University // Quantum Scheduling Engine
        </p>
      </div>

      {/* 1. ACADEMIC PARAMETERS */}
      <div style={{ marginBottom: "40px" }}>
        <h2 className="header-container" style={{ fontSize: "1.1rem", marginBottom: '15px' }}>I. System Configuration</h2>
        <div className="grid-wrapper" style={{ height: `12vh`, width: "90%", margin: '0 auto' }}>
          <AgGridReact
            className="ag-theme-alpine-dark"
            rowData={systemConfig}
            columnDefs={columnDefs.config}
          />
        </div>
      </div>

      {/* 2. COURSE POOL WITH TRANSITION BUTTONS */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', margin: '0 auto 15px auto', alignItems: 'center' }}>
          <h2 className="header-container" style={{ fontSize: "1.1rem" }}>II. Course Potential Pool</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleAutoFillCS} className="popup-button" style={{ fontSize: '12px' }}>
              ⚡ Auto-Fill CS Core
            </button>
            <button onClick={addManualCourse} className="popup-button" style={{ fontSize: '12px' }}>
              + Add Manual Node
            </button>
          </div>
        </div>
        <div className="grid-wrapper" style={{ height: `${grid_height_vh}vh`, width: "90%", margin: '0 auto' }}>
          <AgGridReact
            className="ag-theme-alpine-dark"
            rowData={courseList}
            columnDefs={columnDefs.courses}
            ref={courseGridRef}
            rowSelection="multiple"
            animateRows={true}
          />
        </div>
      </div>

      {/* 3. OPTIMIZED SOLUTION */}
      <div style={{ marginBottom: "40px" }}>
        <h2 className="header-container" style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: '15px' }}>
          III. Optimized Coherence Schedule
        </h2>
        <div className="grid-wrapper" style={{ height: `${grid_height_vh}vh`, width: "90%", margin: '0 auto' }}>
          <AgGridReact
            className="ag-theme-alpine-dark"
            rowData={scheduleOutput}
            columnDefs={columnDefs.output}
            animateRows={true}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <SubmitButton 
          problem_id="purdue_quantum_01" 
          getData={() => ({ config: systemConfig, pool: courseList })} 
          sendData={setScheduleOutput} 
        />
      </div>
    </div>
  );
};

export default AppForm;