"use client"
import React, { useState } from 'react'
import LoadingBar from '../../LoadingBar';

const SubmitButton = ({ problem_id = "null", getData, sendData }) => {

    const[internalRunning, setInternalRunning] = useState(false)
    const[loadingRunning, setLoadingRunning] = useState(false)

    const submitData = () => {
        if (!internalRunning && problem_id != "null" && getData != null && sendData != null) {
            const backendData = getData();
            setInternalRunning(true)
            setLoadingRunning(true)
            fetch('http://localhost:8080/run_app', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pid: problem_id,
                    data: backendData
                })
            }).then(response => response.json()).then(data => {
                sendData(data);
                setLoadingRunning(false)
                setTimeout(() => {
                    setInternalRunning(false);
                }, 3000); //3 second timeout on button
            }).catch(error => console.error('Error:', error));
        }
    }

    return (
        <div>
            <LoadingBar running={loadingRunning}></LoadingBar>
            <button className="submit-button" onClick={submitData} enabled={internalRunning.toString()}>Submit Data</button>
        </div>
        
    )
};

export default SubmitButton
