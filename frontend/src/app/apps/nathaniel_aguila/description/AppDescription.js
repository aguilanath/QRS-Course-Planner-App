import image1 from "../images/image1.jpg"

export default {
    //label under app icon
    label: "Purdue Planner", 
    //popup title
    title: "Quantum Course Progression Planner", 
    //popup description
    description: "Optimize your Purdue CS degree path using quantum annealing. This tool minimizes the required credits while respecting all prerequisites and credit limits, ensuring you graduate as efficiently as possible.",
    //popup media slides
    
    //ALLOWED TYPES - image, youtube
    media: [
        {type: "youtube", item: "https://www.youtube.com/watch?v=lt4OsgmUTGI"},
    ],
    
    //required for submission, just leave as optimization
    category: "optimization"
};