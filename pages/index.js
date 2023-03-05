import Slide from "../components/Slide"
import generateSlides from "../lib/generateSlides"

import group1 from "../public/files/group1.json";
import group2 from "../public/files/group2.json";
import group3 from "../public/files/group3.json";

export default function Homepage() {
    const slides = generateSlides(group1, group2, group3)

    return <div className="m-4">
        <h1 className="font-bold text-3xl mb-4">Prayer Slides for ~{(slides.length / 12).toFixed(0)} months</h1>
        <div className="flex flex-wrap">
            {slides.map((slide, index) => {
                return <div key={`slide=${index}`} className="slide bg-gray-100 mr-4 mb-4 pb-2">
                    <div className="text-2xl px-4 py-2">
                        Slide {index + 1}.
                    </div>
                    <Slide
                        id={slide.id}
                        image={slide.image}
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
                    />
                </div>
            })}
        </div>
    </div>
}