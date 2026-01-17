import image1 from "../images/image1.jpg"
export default {
    //label under app icon
    label: "App 1", 
    //popup title
    title: "Title for Problem 1", 
    //popup description
    description: "Example description here",
    //popup media slides
    
    //ALLOWED TYPES - image, youtube
    media: [
        {type: "image", item: image1},
        {type: "youtube", item: "https://www.youtube.com/watch?v=lt4OsgmUTGI"},
    ],
    
    //required for submission, just leave as optimization
    category: "optimization"
};
