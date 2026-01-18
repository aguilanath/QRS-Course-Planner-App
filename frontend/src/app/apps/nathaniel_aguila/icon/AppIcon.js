import React from 'react'
import Image from "next/image";
import "../problem_1.css"
import work from "../images/work.png"

function AppIcon() {
    return (
        <div> 
            <Image src={work} alt="Work Icon" width={540} height={500}/>
        </div> 

    );
}

export default AppIcon
