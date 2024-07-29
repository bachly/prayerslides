import React from "react";
import Slide from "../components/Slide"
import generateSlides from "../lib/generateSlides"
import defaultCouples from "../public/files/couples.json"
import { nanoid } from "nanoid";
import _ from "underscore";

// firebase auth
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth, db } from '../lib/firebaseApp';
import Link from "next/link";

// firebase firestore
import { doc, getDoc } from "firebase/firestore"

const LAST_UPDATED = "27/07/2024";

export default function Homepage() {
    const [couples, setCouples] = React.useState();
    const [downloaded, setDownloaded] = React.useState(null);
    const [slides, setSlides] = React.useState();
    const [lastUpdated, setLastUpdated] = React.useState();
    const [user, loading] = useAuthState(auth);

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

        const lastUpdated = JSON.parse(window.localStorage.getItem('lastUpdated'));

        const couplesFromLocalStorage = JSON.parse(window.localStorage.getItem('couples'));

        const couplesFromMainDatabase = {};
        defaultCouples.forEach((couple) => {
            const id = nanoid();
            couplesFromMainDatabase[id] = {
                ...couple,
                id
            };
        });

        if (!lastUpdated || lastUpdated !== LAST_UPDATED) {
            setLastUpdated(LAST_UPDATED);
            setCouples(couplesFromMainDatabase);
        } else {
            setCouples(couplesFromLocalStorage);
        }
    }, [])

    React.useEffect(function saveToLocalStorage() {
        if (downloaded) {
            window.localStorage.setItem('downloaded', JSON.stringify(downloaded));
        }

        if (couples) {
            window.localStorage.setItem('couples', JSON.stringify(couples));
        }

        if (lastUpdated) {
            window.localStorage.setItem('lastUpdated', JSON.stringify(lastUpdated));
        }
    }, [downloaded, couples, lastUpdated])

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

    React.useEffect(async () => {
        if (user) {
            console.log("Logged in user:", user);

            const docRef = doc(db, "Users", user.email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log("Logged-in user's data:", docSnap.data());
            } else {
                console.log("Logged-in user's data: N/A");
            }
        }
    }, [user])

    function handleLogoutClick(event) {
        event.preventDefault();
        signOut(auth);
    }

    return <div className="">
        <div className="flex items-start bg-neutral-900">
            <main className="flex-1">
                <div className="bg-neutral-900/60 py-4 px-12 backdrop-blur-lg fixed top-0 left-0 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-neutral-200 text-2xl">
                                Prayer Slides for ~{slides && (slides.length / 12).toFixed(0)} months
                            </div>
                            <div className="text-base text-neutral-400">Last update: {LAST_UPDATED}</div>
                        </div>
                        <div className="text-white">
                            {loading ? <>Loading...</> :
                                <>
                                    {user && <div className="flex items-center">
                                        {user.email} (<button className="underline" onClick={handleLogoutClick} >Log out</button>)
                                        <img src={user.photoURL} className="rounded-full ml-2 w-6 h-6" />
                                    </div>}
                                    {!user && <Link href="/login">Login</Link>}
                                </>
                            }
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