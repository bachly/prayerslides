import React from "react";
import Slide from "../components/Slide"
import generateSlides from "../lib/generateSlides"
import defaultCouples from "../public/files/couples.json"
import { nanoid } from "nanoid";
import _ from "underscore";

export default function Homepage() {
    const [couples, setCouples] = React.useState();
    const [downloaded, setDownloaded] = React.useState(null);
    const [slides, setSlides] = React.useState();

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

        const couplesFromLocalStorage = JSON.parse(window.localStorage.getItem('couples'));

        if (couplesFromLocalStorage) {
            setCouples(couplesFromLocalStorage);
        } else {
            const couplesDict = {}
            defaultCouples.forEach((couple) => {
                const id = nanoid();
                couplesDict[id] = {
                    ...couple,
                    id
                };
            });
            setCouples(couplesDict);
        }

    }, [])

    React.useEffect(function saveToLocalStorage() {
        if (downloaded) {
            window.localStorage.setItem('downloaded', JSON.stringify(downloaded));
        }

        if (couples) {
            window.localStorage.setItem('couples', JSON.stringify(couples));
        }
    }, [downloaded, couples])

    React.useEffect(function regenerateSlides() {
        if (couples) {
            const group1 = _.compact(Object.keys(couples).map(id => {
                if (couples[id].group === 'local') {
                    return couples[id];
                }
            }));
            const group2 = _.compact(Object.keys(couples).map(id => {
                if (couples[id].group === 'national') {
                    return couples[id];
                }
            }));
            const group3 = _.compact(Object.keys(couples).map(id => {
                if (couples[id].group === 'international') {
                    return couples[id];
                }
            }));

            if (group1 && group2 && group3) {
                const newSlides = generateSlides(group1, group2, group3);
                setSlides(newSlides);
                console.log("New slides:", newSlides);
            }
        }
    }, [couples])

    function updateCouple({ id, names, surname, location, nation }) {
        setCouples({
            ...couples,
            [id]: {
                ...couples[id],
                names,
                surname,
                location,
                nation
            }
        })
    }

    // function resetToDefault() {
    //     return event => {
    //         event && event.preventDefault();
    //         const couplesDict = {}
    //         defaultCouples.forEach((couple) => {
    //             const id = nanoid();
    //             couplesDict[id] = {
    //                 ...couple,
    //                 id
    //             };
    //         });
    //         setCouples(couplesDict);
    //         setDownloaded({});
    //     }
    // }

    return <div className="">
        <div className="flex items-start bg-neutral-900">
            <main className="flex-1">
                <div className="bg-neutral-900/60 py-4 px-12 backdrop-blur-lg fixed top-0 left-0 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-neutral-200 text-2xl">
                                Prayer Slides for ~{slides && (slides.length / 12).toFixed(0)} months
                            </div>
                            <div className="text-base text-neutral-400">Last update: 22/06/2023</div>
                        </div>
                    </div>
                </div>
                <div className="mt-20 p-8 flex flex-wrap justify-center">
                    {slides && slides.map((slide, index) => {
                        return <div key={`slide=${index}`} className="mr-12 mb-12">
                            <Slide
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
                                id1={`${slide.id1}`}
                                id2={`${slide.id2}`}
                                id3={`${slide.id3}`}
                                isDownloaded={downloaded && downloaded[slide.id]}
                                onDownload={markAsDownloaded(slide.id)}
                                onUpdate={updateCouple}
                            />
                        </div>
                    })}
                </div>
            </main>
        </div>
    </div>
}