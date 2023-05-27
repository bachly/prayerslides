import React from "react";
import Slide from "../components/Slide"
import generateSlides from "../lib/generateSlides"

import group1 from "../public/files/group1.json";
import group2 from "../public/files/group2.json";
import group3 from "../public/files/group3.json";
import SlideImage from "../components/SlideImage";

export default function Homepage() {
    const slides = generateSlides(group1, group2, group3)
    const [downloaded, setDownloaded] = React.useState(null)

    function markAsDownloaded(slideId) {
        return (event) => {
            event && event.preventDefault();
            console.log(`Downloaded slide ${slideId}`)
            setDownloaded({
                ...downloaded,
                [slideId]: true
            })
        }
    }

    React.useEffect(function readFromLocalStorage() {
        const downloaded = JSON.parse(window.localStorage.getItem('downloaded'));
        setDownloaded(downloaded);
    }, [])

    React.useEffect(function saveToLocalStorage() {
        if (downloaded) {
            window.localStorage.setItem('downloaded', JSON.stringify(downloaded));
        }
    }, [downloaded])


    return <div className="m-4">
        <h1 className="font-bold text-3xl mb-4">Prayer Slides for ~{(slides.length / 12).toFixed(0)} months (last update: 27/05/2023)</h1>
        <div className="grid grid-cols-4 gap-4">
            {slides.map((slide, index) => {
                return <div key={`slide=${index}`} className="slide bg-gray-100 mr-4 mb-4 pb-2">
                    <div className="text-2xl px-4 py-2">
                        Slide {index + 1}.
                    </div>
                    <SlideImage
                        id={slide.id}
                        bgImageName={slide.bgImageName}
                        scale={1}
                        location1={`${slide.location1}`}
                        location2={`${slide.location2}`}
                        location3={`${slide.location3}`}
                        nation1={`${slide.nation1}`}
                        nation2={`${slide.nation2}`}
                        nation3={`${slide.nation3}`}
                        name1={`${slide.name1}`}
                        name2={`${slide.name2}`}
                        name3={`${slide.name3}`}
                        surname1={`${slide.surname1}`}
                        surname2={`${slide.surname2}`}
                        surname3={`${slide.surname3}`}
                        isDownloaded={downloaded && downloaded[slide.id]}
                        onDownload={markAsDownloaded(slide.id)}
                    />
                </div>
            })}
        </div>
    </div>
}