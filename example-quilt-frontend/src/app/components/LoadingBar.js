"use client"
import React, { useState, useEffect } from 'react'

const LoadingBar = ({ running, maxWidth = 50 }) => {

    const [barStatus, setBarStatus] = useState(0);
    var randomInt = Math.floor(Math.random() * (60 - 40 + 1)) + 40;

    useEffect(() => {
        if (barStatus == 0) {
            if (running) {
                setBarStatus(randomInt)
            }
        } else {
            if (running) {
                randomInt = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
                setBarStatus(0)
                setTimeout(() => {
                    setBarStatus(randomInt);
                }, 400)
            } else {
                setBarStatus(100)
            }
        }
        
    }, [running]);

    return (
        <div style={{
            paddingTop: "5px",
            paddingBottom: "5px",
            display: "flex",
            justifyContent: "center",
          }}>
            <div style={{
                border: "2px solid white",
                width: maxWidth + "%",
                borderRadius: "1.6vh",
                height: "3.5vh",
            }}>
                <h2 style={{
                    width: barStatus * (maxWidth / 50) + "%",
                    height: "3vh",
                    backgroundColor: "green",
                    transition: "width 0.5s ease-in-out",
                    borderRadius: "1.5vh",
                }}></h2>
            </div>
        </div>
    )
};

export default LoadingBar
